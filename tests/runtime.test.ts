import { execFileSync } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveSwarmConfig } from '../src/config.js'
import { ModelPresetStore, resolveModelForWorker, sanitizeRoleModelMap } from '../src/core/model-presets.js'
import { SwarmStore } from '../src/core/store.js'
import {
  detectHostCapabilities,
  getDshHome,
  readSessionSeed,
  registerMessageSourceCompat,
  selectAgentModelCompat,
  startSubagentCompat,
} from '../src/runtime/dsh-adapter.js'
import { SwarmStallMonitor } from '../src/runtime/stall-monitor.js'
import { WorkerPool } from '../src/runtime/worker-pool.js'
import { cleanupWorkspace, prepareWorkspace } from '../src/runtime/workspace.js'
import { registerSwarmRoutes } from '../src/routes.js'
import { registerSwarmTools } from '../src/tools/index.js'
import { registerSwarmCommand } from '../src/command.js'
import { registerSwarmSkills } from '../src/skills.js'
import type { HostAgentLike, PluginContextLike } from '../src/types/dsh-host.js'

class MockAgent implements HostAgentLike {
  status: 'idle' | 'running' = 'idle'
  ctx?: { get?: <T = unknown>(name: string) => T | undefined; systemPrompt?: { context?: (opts: Record<string, unknown>) => void } }
  session: {
    id: string
    header: Record<string, unknown>
    events: unknown[]
    snapshotEvents: () => unknown[]
    append?: (type: string, data: Record<string, unknown>) => void
  }
  appendedEvents: Array<{ type: string; data: Record<string, unknown> }> = []
  steered: unknown[] = []
  followups: unknown[] = []
  modelSelections: Array<{ provider?: string; model: string; reasoningEffort?: string }> = []
  disposed = false
  model = {
    current: () => this.modelSelections[this.modelSelections.length - 1],
    select: async (sel: { provider?: string; model: string; reasoningEffort?: string }) => {
      this.modelSelections.push(sel)
    },
  }

  constructor(
    public id: string,
    cwd: string,
    seedEvents: unknown[] = [],
    headerExtra: Record<string, unknown> = {},
  ) {
    this.session = {
      id,
      header: { cwd, ...headerExtra },
      events: [...seedEvents],
      snapshotEvents: () => [...this.session.events],
      append: (type: string, data: Record<string, unknown>) => {
        this.appendedEvents.push({ type, data })
        this.session.events.push({ type, data })
      },
    }
  }

  async steer(msg: unknown): Promise<void> {
    this.steered.push(msg)
    this.status = 'running'
  }

  async followup(msg: unknown): Promise<void> {
    this.followups.push(msg)
    this.status = 'running'
  }

  cancel?: (reason?: unknown, options?: Record<string, unknown>) => Promise<void> | void

  async dispose(): Promise<void> {
    this.disposed = true
  }
}

class MockHostContext extends EventEmitter implements PluginContextLike {
  services = new Map<string, unknown>()
  agentsMap = new Map<string, MockAgent>()
  createdCalls: Array<Record<string, unknown>> = []
  resumedCalls: Array<unknown> = []
  registeredTools = new Map<string, any>()
  registeredCommands = new Map<string, any>()
  registeredSkills = new Map<string, any>()
  routeHandler: ((req: IncomingMessage, res: ServerResponse) => Promise<void> | void) | undefined
  admitResult: unknown = { peer: { id: 'test-peer' } }

  resumeSetupContextFactory: ((id: string, agent: MockAgent) => unknown) | undefined
  createSetupContextFactory: ((id: string, agent: MockAgent) => unknown) | undefined

  constructor(cwd: string) {
    super()
    this.services.set('agents', {
      get: (id: string) => this.agentsMap.get(id),
      create: async (opts: Record<string, unknown>) => {
        this.createdCalls.push(opts)
        const id = String(opts.sessionId || `agent-${this.agentsMap.size + 1}`)
        const meta = (opts.meta ?? {}) as Record<string, unknown>
        const seed = Array.isArray(opts.seed) ? opts.seed : []
        const agent = new MockAgent(id, String(meta.cwd || cwd), seed, meta.agentPreset ? { agentPreset: meta.agentPreset } : {})
        this.agentsMap.set(id, agent)
        if (typeof opts.setup === 'function') {
          const setupCtx = this.createSetupContextFactory ? this.createSetupContextFactory(id, agent) : {}
          await (opts.setup as (c: unknown, a: unknown) => unknown)(setupCtx, agent)
        }
        return {
          agent,
          dispose: async () => {
            await agent.dispose()
            this.agentsMap.delete(id)
          },
        }
      },
      resume: async (arg: unknown) => {
        this.resumedCalls.push(arg)
        const id = typeof arg === 'string' ? arg : String((arg as { resumeSessionId?: string }).resumeSessionId)
        const existing = this.agentsMap.get(id)
        const agent = existing ?? new MockAgent(id, cwd)
        this.agentsMap.set(id, agent)
        if (arg && typeof arg === 'object' && typeof (arg as { setup?: unknown }).setup === 'function') {
          const setupCtx = this.resumeSetupContextFactory ? this.resumeSetupContextFactory(id, agent) : {}
          await ((arg as { setup: (c: unknown, a: unknown) => unknown }).setup)(setupCtx, agent)
        }
        return {
          agent,
          dispose: async () => {
            await agent.dispose()
            this.agentsMap.delete(id)
          },
        }
      },
    })
    this.services.set('tools', {
      has: (name: string) => this.registeredTools.has(name),
      register: (tool: any) => {
        if (this.registeredTools.has(tool.name)) throw new Error(`duplicate tool ${tool.name}`)
        this.registeredTools.set(tool.name, tool)
        return () => { this.registeredTools.delete(tool.name) }
      },
    })
    this.services.set('commands', {
      has: (name: string) => this.registeredCommands.has(name),
      register: (cmd: any) => {
        this.registeredCommands.set(cmd.name, cmd)
        return () => { this.registeredCommands.delete(cmd.name) }
      },
    })
    this.services.set('skills', {
      register: (skill: any) => {
        this.registeredSkills.set(skill.name, skill)
        return () => { this.registeredSkills.delete(skill.name) }
      },
    })
    this.services.set('webServer', {
      register: (route: any) => {
        this.routeHandler = route.handler
        return () => { this.routeHandler = undefined }
      },
    })
    this.services.set('connection', {
      admit: () => this.admitResult,
    })
  }

  get<T = unknown>(name: string): T | undefined {
    return this.services.get(name) as T | undefined
  }

  effect(fn: () => (() => void) | void): () => void {
    const dispose = fn()
    return typeof dispose === 'function' ? dispose : () => {}
  }

  override on(event: string, listener: (...args: any[]) => any): any {
    super.on(event, listener)
    return () => { super.off(event, listener) }
  }

  emitStatus(agent: MockAgent, status: 'idle' | 'running'): void {
    agent.status = status
    this.emit('agent/status', { agent, status })
  }
}

interface MockHttpRes {
  status: number
  headers: Record<string, string>
  chunks: string[]
  ended: boolean
  destroyed: boolean
  emitter: EventEmitter
  res: ServerResponse
}

function createMockRes(): MockHttpRes {
  const emitter = new EventEmitter()
  const state: MockHttpRes = {
    status: 200,
    headers: {},
    chunks: [],
    ended: false,
    destroyed: false,
    emitter,
    res: null as unknown as ServerResponse,
  }
  const res = Object.assign(emitter, {
    get headersSent() { return state.chunks.length > 0 || state.ended },
    get writableEnded() { return state.ended },
    get destroyed() { return state.destroyed },
    writeHead(code: number, headers: Record<string, string> = {}) {
      state.status = code
      for (const [k, v] of Object.entries(headers)) state.headers[k.toLowerCase()] = v
      return res
    },
    write(chunk: string | Buffer) {
      state.chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk))
      return true
    },
    end(chunk?: string | Buffer) {
      if (chunk !== undefined) state.chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk))
      state.ended = true
      emitter.emit('close')
      return res
    },
    destroy() {
      state.destroyed = true
      emitter.emit('close')
      return res
    },
  })
  state.res = res as unknown as ServerResponse
  return state
}

function createMockReq(method: string, url: string, body?: unknown, headers: Record<string, string> = {}): IncomingMessage {
  const emitter = new EventEmitter()
  let flushed = false
  const req = Object.assign(emitter, {
    method,
    url,
    headers: {
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    complete: true,
    aborted: false,
    destroyed: false,
    resume() {
      if (body !== undefined && !flushed) {
        flushed = true
        queueMicrotask(() => {
          emitter.emit('data', Buffer.from(JSON.stringify(body), 'utf8'))
          emitter.emit('end')
        })
      }
    },
    pause() {},
  })
  return req as unknown as IncomingMessage
}

const tempDirs: string[] = []
function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

afterEach(() => {
  delete process.env.DSH_AG_SWARM_ALLOW_DEMO
  for (const dir of tempDirs.splice(0)) {
    try { rmSync(dir, { recursive: true, force: true }) } catch { /* ignore */ }
  }
})

describe('dsh-adapter cross-version compatibility', () => {
  it('detects rc.3 flat startActivation vs legacy nested activation vs legacy start', async () => {
    const cwd = makeTempDir('dsh-adapter-')
    const parent = new MockAgent('coord-1', cwd)

    // 1) rc.3+ (has listDescendants) -> flat top-level fields
    const rc3Spec: Record<string, unknown>[] = []
    const rc3Ctx = new MockHostContext(cwd)
    rc3Ctx.services.set('subagents', {
      listDescendants: () => [],
      startActivation: async (spec: Record<string, unknown>) => {
        rc3Spec.push(spec)
        return { childId: 'child-rc3', name: 'w1', result: Promise.resolve({ stopReason: 'completed' }), dispose: async () => {} }
      },
      sendMessage: async () => ({}),
    })
    expect(detectHostCapabilities(rc3Ctx).subagents.mode).toBe('rc3-activation')
    const h1 = await startSubagentCompat(rc3Ctx, { provider: 'spawn', label: 'l1', name: 'w1', prompt: 'hi', parent })
    expect(h1.id).toBe('child-rc3')
    expect(rc3Spec[0]!.request).toBeUndefined()
    expect(rc3Spec[0]!.name).toBe('w1')

    // 2) legacy activation (no listDescendants) -> nested request
    const legacyActSpec: Record<string, unknown>[] = []
    const legacyActCtx = new MockHostContext(cwd)
    legacyActCtx.services.set('subagents', {
      startActivation: async (spec: Record<string, unknown>) => {
        legacyActSpec.push(spec)
        return { childId: 'child-leg-act', result: Promise.resolve({}), dispose: async () => {} }
      },
    })
    expect(detectHostCapabilities(legacyActCtx).subagents.mode).toBe('legacy-activation')
    const h2 = await startSubagentCompat(legacyActCtx, { provider: 'spawn', label: 'l2', prompt: 'hi', parent })
    expect(h2.id).toBe('child-leg-act')
    expect(legacyActSpec[0]!.request).toBeDefined()

    // 3) legacy start
    const startCalls: unknown[] = []
    const legacyStartCtx = new MockHostContext(cwd)
    legacyStartCtx.services.set('subagents', {
      start: async (provider: string, req: Record<string, unknown>) => {
        startCalls.push({ provider, req })
        return { id: 'child-start', result: Promise.resolve({}), dispose: async () => {} }
      },
    })
    expect(detectHostCapabilities(legacyStartCtx).subagents.mode).toBe('legacy-start')
    const h3 = await startSubagentCompat(legacyStartCtx, { provider: 'spawn', label: 'l3', prompt: 'hi', parent })
    expect(h3.id).toBe('child-start')
    expect(startCalls.length).toBe(1)

    // 4) getDshHome & registerMessageSourceCompat & readSessionSeed & selectAgentModelCompat
    rc3Ctx.services.set('profile', { home: '/custom/dsh' })
    expect(getDshHome(rc3Ctx)).toBe('/custom/dsh')
    const regSpy = vi.fn(() => () => {})
    rc3Ctx.services.set('messageSources', { register: regSpy })
    const disposeSrc = registerMessageSourceCompat(rc3Ctx)
    expect(regSpy).toHaveBeenCalledWith('plugin:dsh-ag-swarm', { form: 'notice' })
    disposeSrc()

    const seededAgent = new MockAgent('sess-seed', cwd, [{ type: 'user/message', seq: 0, time: 1000, data: { text: 'hello' } }])
    rc3Ctx.agentsMap.set('sess-seed', seededAgent)
    const snap = await readSessionSeed(rc3Ctx, 'sess-seed')
    expect(snap.inheritedEventCount).toBe(1)
    expect(snap.seed).toHaveLength(2)
    expect(await selectAgentModelCompat(seededAgent, { provider: 'deepseek', model: 'deepseek-reasoner' })).toBe(true)
    expect(seededAgent.modelSelections[0]).toEqual({ provider: 'deepseek', model: 'deepseek-reasoner' })
  })
})

describe('WorkerPool concurrency, doorbell wakeups, fork, ACL & model switching', () => {
  it('spawns 3+ workers concurrently, rings doorbells on steer/idle/resume, and enforces ACL', async () => {
    const storageDir = makeTempDir('ag-store-')
    const cwd = makeTempDir('ag-cwd-')
    const ctx = new MockHostContext(cwd)
    const coord = new MockAgent('coord-session', cwd, [
      { type: 'user/message', seq: 0, time: 1000, data: { text: 'Initial goal' } },
      { type: 'assistant/message', seq: 1, time: 2000, data: { text: 'Planning swarm' } },
    ])
    ctx.agentsMap.set(coord.id, coord)

    const store = new SwarmStore(storageDir)
    const config = resolveSwarmConfig({ storageDir, maxWorkers: 8, maxDepth: 2, enableWorktrees: false })
    const pool = new WorkerPool(ctx, store, config)
    const swarm = pool.ensureSwarmForSession(coord.id, 'Parallel Test', cwd)

    // Spawn 3 sharded workers concurrently
    const spawned = await pool.addWorkers({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      callerAgent: coord,
      name: 'worker',
      brief: 'Process module',
      tasks: ['alpha', 'beta', 'gamma'],
      fork: 'coordinator',
    })
    expect(spawned.map((w) => w.name)).toEqual(['worker-1', 'worker-2', 'worker-3'])
    expect(ctx.createdCalls).toHaveLength(3)
    // Verify fork seed passed to every worker
    for (const call of ctx.createdCalls) {
      expect((call.meta as Record<string, unknown>).isSeeded).toBe(true)
      expect(call.inheritedEventCount).toBe(2)
      expect(Array.isArray(call.seed)).toBe(true)
    }

    const w1 = ctx.agentsMap.get(spawned[0]!.conversation_id)!
    const w2 = ctx.agentsMap.get(spawned[1]!.conversation_id)!
    const w3 = ctx.agentsMap.get(spawned[2]!.conversation_id)!
    expect(w1.steered).toHaveLength(1)
    expect(w2.steered).toHaveLength(1)
    expect(w3.steered).toHaveLength(1)

    // Put w1 into waiting via worker swarm_wait; keep w2 working; dispose w3 (stopped)
    const waitRes = await pool.waitForBoard({
      swarmId: swarm.swarm_id,
      callerName: 'worker-1',
      since: store.getSwarm(swarm.swarm_id)!.head,
      mentions_only: true,
    })
    expect(waitRes.status).toBe('waiting')
    expect(store.getSwarm(swarm.swarm_id)!.members['worker-1']!.state).toBe('waiting')

    ctx.emit('agent/disposed', { agent: w3 })
    ctx.agentsMap.delete(w3.id)
    expect(store.getSwarm(swarm.swarm_id)!.members['worker-3']!.state).toBe('stopped')

    // Post @worker group mention -> wakes w1 (steer), queues w2 (working), resumes w3 (stopped)
    const postRes = await pool.postMessage(swarm.swarm_id, {
      agent: 'coordinator',
      text: '@worker please sync status',
    })
    expect(postRes.woken.sort()).toEqual(['worker-1', 'worker-2', 'worker-3'])
    expect(w1.steered).toHaveLength(2)
    expect(w2.steered).toHaveLength(1) // still working, queued until idle
    expect(ctx.resumedCalls.length).toBe(1) // w3 cold-resumed

    // When w2 goes idle, queued wakeup is delivered via steer
    ctx.emitStatus(w2, 'idle')
    await new Promise((r) => setTimeout(r, 20))
    expect(w2.steered).toHaveLength(2)

    // In-place model switch: rejected while working, allowed when waiting
    ctx.emitStatus(w1, 'idle')
    const switched = await pool.switchModel({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      targetName: 'worker-1',
      model: 'deepseek-reasoner',
      provider: 'deepseek',
    })
    expect(switched.model).toBe('deepseek-reasoner')
    expect(w1.modelSelections.at(-1)?.model).toBe('deepseek-reasoner')

    // Worker-1 spawns a helper (depth 2)
    const [helper] = await pool.addWorkers({
      swarmId: swarm.swarm_id,
      callerName: 'worker-1',
      callerAgent: w1,
      name: 'helper-a',
      brief: 'Assist worker-1',
    })
    expect(helper!.created_by).toBe('worker-1')
    expect(helper!.depth).toBe(2)

    // ACL: worker-2 cannot kill helper-a (created by worker-1)
    await expect(pool.killMember(swarm.swarm_id, 'worker-2', 'helper-a')).rejects.toThrow(/ACL denied/)

    // Killing worker-1 does NOT cascade-kill helper-a
    await pool.killMember(swarm.swarm_id, 'coordinator', 'worker-1')
    expect(store.getSwarm(swarm.swarm_id)!.members['worker-1']!.killed).toBe(true)
    expect(store.getSwarm(swarm.swarm_id)!.members['helper-a']!.killed).toBe(false)

    await pool.dispose()
  })

  it('creates and cleans up real Git worktree (share) and local clone (branch)', async () => {
    const repoDir = makeTempDir('ag-git-repo-')
    const storageDir = makeTempDir('ag-git-store-')
    execFileSync('git', ['init'], { cwd: repoDir, windowsHide: true })
    execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoDir, windowsHide: true })
    execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: repoDir, windowsHide: true })
    writeFileSync(join(repoDir, 'README.md'), '# demo\n', 'utf8')
    execFileSync('git', ['add', '.'], { cwd: repoDir, windowsHide: true })
    execFileSync('git', ['commit', '-m', 'init'], { cwd: repoDir, windowsHide: true })

    const wt = await prepareWorkspace({
      swarmId: 'swarm-12345678',
      memberName: 'dev-a',
      mode: 'share',
      baseCwd: repoDir,
      storageDir,
      enableWorktrees: true,
    })
    expect(wt.kind).toBe('worktree')
    expect(wt.branch).toMatch(/^ag-swarm\/swarm-12\/dev-a/)
    expect(existsSync(join(wt.workspace, 'README.md'))).toBe(true)

    await cleanupWorkspace({ workspace: wt.workspace, mode: 'share', baseCwd: repoDir, repoRoot: wt.repoRoot })
    expect(existsSync(wt.workspace)).toBe(false)

    const clone = await prepareWorkspace({
      swarmId: 'swarm-12345678',
      memberName: 'dev-b',
      mode: 'branch',
      baseCwd: repoDir,
      storageDir,
      enableWorktrees: true,
    })
    expect(clone.kind).toBe('clone')
    expect(existsSync(join(clone.workspace, 'README.md'))).toBe(true)
    await cleanupWorkspace({ workspace: clone.workspace, mode: 'branch', baseCwd: repoDir })
    expect(existsSync(clone.workspace)).toBe(false)
  })
})

describe('Coordinator blocking swarm_wait (zero-token sidebar keepalive)', () => {
  it('stays pending while workers are working and resolves immediately on @coordinator, inbox insert, all_idle, or abort', async () => {
    const storageDir = makeTempDir('ag-wait-store-')
    const cwd = makeTempDir('ag-wait-cwd-')
    const ctx = new MockHostContext(cwd)
    const coord = new MockAgent('coord-wait', cwd)
    ctx.agentsMap.set(coord.id, coord)

    const store = new SwarmStore(storageDir)
    const config = resolveSwarmConfig({ storageDir, enableWorktrees: false })
    const pool = new WorkerPool(ctx, store, config)
    const swarm = pool.ensureSwarmForSession(coord.id, 'Wait Test', cwd)
    const [w1] = await pool.addWorkers({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      callerAgent: coord,
      name: 'builder',
      brief: 'Build module',
    })
    expect(w1!.state).toBe('working')

    // 1) Stays pending while worker is working, resolves immediately when @coordinator posts
    let resolved1 = false
    const p1 = pool.waitForBoard({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      since: store.getSwarm(swarm.swarm_id)!.head,
      mentions_only: true,
      timeout_ms: 30_000,
      agent: coord,
    }).then((res) => {
      resolved1 = true
      return res
    })

    await new Promise((r) => setTimeout(r, 30))
    expect(resolved1).toBe(false)

    await pool.postMessage(swarm.swarm_id, { agent: 'builder', text: '@coordinator [done] Build complete' })
    const res1 = await p1
    expect(res1.status).toBe('messages')
    expect(res1.timedOut).toBe(false)
    expect(res1.messages?.[0]?.text).toContain('[done]')

    // 2) Resolves immediately when user steers main chat (agent/inbox/inserted)
    let resolved2 = false
    const p2 = pool.waitForBoard({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      since: store.getSwarm(swarm.swarm_id)!.head,
      timeout_ms: 30_000,
      agent: coord,
    }).then((res) => {
      resolved2 = true
      return res
    })
    await new Promise((r) => setTimeout(r, 20))
    expect(resolved2).toBe(false)
    ctx.emit('agent/inbox/inserted', { agent: coord, message: { id: 'u1' } })
    const res2 = await p2
    expect(res2.status).toBe('interrupted')
    expect(res2.reason).toBe('inbox_inserted')

    // 3) Cleanly rejects & cleans listeners when AbortSignal aborts
    const ac = new AbortController()
    const beforeListeners = store.listenerCount('update')
    const p3 = pool.waitForBoard({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      since: store.getSwarm(swarm.swarm_id)!.head,
      timeout_ms: 30_000,
      agent: coord,
      signal: ac.signal,
    })
    await new Promise((r) => setTimeout(r, 20))
    expect(store.listenerCount('update')).toBe(beforeListeners + 1)
    ac.abort(new Error('user-stopped'))
    await expect(p3).rejects.toThrow('user-stopped')
    expect(store.listenerCount('update')).toBe(beforeListeners)

    // 4) Resolves with all_idle when all workers leave working state without pinging coordinator
    const p4 = pool.waitForBoard({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      since: store.getSwarm(swarm.swarm_id)!.head,
      timeout_ms: 30_000,
      agent: coord,
    })
    await new Promise((r) => setTimeout(r, 20))
    store.updateMember(swarm.swarm_id, 'builder', { state: 'waiting' })
    const res4 = await p4
    expect(res4.status).toBe('all_idle')

    await pool.dispose()
  })
})

describe('Tools conflict fallback, Commands, Skills, StallMonitor & HTTP/SSE routes', () => {
  it('falls back to ag_swarm_wait when swarm_wait is already claimed, and registers /ag-swarm & skills', async () => {
    const storageDir = makeTempDir('ag-tools-store-')
    const cwd = makeTempDir('ag-tools-cwd-')
    const ctx = new MockHostContext(cwd)
    ctx.registeredTools.set('swarm_wait', { name: 'swarm_wait' })

    const store = new SwarmStore(storageDir)
    const config = resolveSwarmConfig({ storageDir, registerSwarmCommandAlias: false })
    const pool = new WorkerPool(ctx, store, config)

    const toolsHandle = registerSwarmTools(ctx, store, pool)
    expect(toolsHandle.registeredNames.swarm_wait).toBe('ag_swarm_wait')
    expect(ctx.registeredTools.has('ag_swarm_wait')).toBe(true)
    expect(ctx.registeredTools.has('swarm')).toBe(true)

    const cmdHandle = registerSwarmCommand(ctx, store, pool, config)
    expect(cmdHandle.primaryCommand).toBe('ag-swarm')
    expect(ctx.registeredCommands.has('ag-swarm')).toBe(true)
    expect(ctx.registeredCommands.has('swarm')).toBe(false)
    const cmdRes = await ctx.registeredCommands.get('ag-swarm').handler({ rawInput: 'build dashboard', agent: { id: 'cmd-sess' } })
    expect(cmdRes.kind).toBe('success')
    expect(cmdRes.text).toContain('swarm_wait')

    const disposeSkills = registerSwarmSkills(ctx)
    expect(ctx.registeredSkills.has('ag-swarm-coordinator')).toBe(true)
    expect(ctx.registeredSkills.has('ag-swarm-worker')).toBe(true)

    disposeSkills()
    cmdHandle.dispose()
    toolsHandle.dispose()
    await pool.dispose()
  })

  it('StallMonitor detects unanswered mentions, cools down >=3 ticks (max 3), and silences after coordinator [done]', async () => {
    const storageDir = makeTempDir('ag-stall-store-')
    const store = new SwarmStore(storageDir)
    const swarm = store.createOrGetSwarm('stall-sess', 'Stall Demo')
    store.updateMember(swarm.swarm_id, 'coordinator', { state: 'waiting' })
    store.addMember(swarm.swarm_id, { name: 'dev', role: 'worker', state: 'waiting' })
    store.appendMessage(swarm.swarm_id, { agent: 'coordinator', text: '@dev please review #1' })

    const alerts: string[] = []
    const monitor = new SwarmStallMonitor({
      config: { enableStallMonitor: true, stallCheckIntervalMs: 180_000 },
      listSwarmViews: () => {
        const s = store.getSwarm(swarm.swarm_id)!
        return [{ swarmId: s.swarm_id, head: s.head, members: s.members, channels: s.channels, messages: s.messages }]
      },
      postStallAlert: (_id, text) => {
        alerts.push(text)
      },
    })

    // First tick: direct re-ping to @dev
    await monitor.tick()
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toContain('@dev [stall]')

    // Second tick: escalates to @coordinator because @dev was already pinged
    await monitor.tick()
    expect(alerts).toHaveLength(2)
    expect(alerts[1]).toContain('@coordinator [stall]')

    // Next 2 ticks: cooled down (<3 ticks since last alert for same escalate signature)
    await monitor.tick()
    await monitor.tick()
    expect(alerts).toHaveLength(2)

    // 3rd tick after escalation: fires again (count=2)
    await monitor.tick()
    expect(alerts).toHaveLength(3)

    // Coordinator posts [done] -> monitor goes dormant
    store.appendMessage(swarm.swarm_id, { agent: 'coordinator', text: '[done] All work completed', kind: 'done' })
    await monitor.tick()
    expect(alerts).toHaveLength(3)
    monitor.stop()
  })

  it('HTTP + SSE routes enforce connection.admit, serve snapshots/raw/frames/SSE, and gate seed_demo', async () => {
    const storageDir = makeTempDir('ag-http-store-')
    const cwd = makeTempDir('ag-http-cwd-')
    const ctx = new MockHostContext(cwd)
    const store = new SwarmStore(storageDir)
    const config = resolveSwarmConfig({ storageDir, maxWorkers: 16 })
    const pool = new WorkerPool(ctx, store, config)
    const disposeRoutes = registerSwarmRoutes(ctx, store, pool, { config, getWaitToolName: () => 'ag_swarm_wait' })
    const handler = ctx.routeHandler!

    // 1) Admission rejected -> 403
    ctx.admitResult = { rejection: 403 }
    const deniedRes = createMockRes()
    await handler(createMockReq('GET', '/ag-swarm/api/swarms'), deniedRes.res)
    expect(deniedRes.status).toBe(403)

    // 2) Admission allowed -> seed_demo blocked without env flag
    ctx.admitResult = { peer: { id: 'p1' } }
    const blockedDemo = createMockRes()
    await handler(createMockReq('POST', '/ag-swarm/api/action', { action: 'seed_demo' }), blockedDemo.res)
    expect(blockedDemo.status).toBe(403)

    // 3) Enable seed_demo via env -> creates swarm, lists swarms, fetches snapshot & raw
    process.env.DSH_AG_SWARM_ALLOW_DEMO = '1'
    const seedRes = createMockRes()
    await handler(createMockReq('POST', '/ag-swarm/api/action', { action: 'seed_demo', sessionId: 'demo-s1' }), seedRes.res)
    expect(seedRes.status).toBe(200)
    const seeded = JSON.parse(seedRes.chunks.join(''))
    expect(seeded.ok).toBe(true)

    const listRes = createMockRes()
    await handler(createMockReq('GET', '/ag-swarm/api/swarms'), listRes.res)
    expect(listRes.status).toBe(200)
    expect(JSON.parse(listRes.chunks.join('')).swarms).toHaveLength(1)

    const rawRes = createMockRes()
    await handler(createMockReq('GET', `/ag-swarm/api/swarm/raw?swarmId=${seeded.swarm_id}`), rawRes.res)
    expect(rawRes.status).toBe(200)
    expect(JSON.parse(rawRes.chunks.join('')).files.length).toBe(4)

    // 3b) /api/config returns resolved config & waitToolName, and /api/swarm/messages accepts ?before= alias
    const cfgRes = createMockRes()
    await handler(createMockReq('GET', '/ag-swarm/api/config'), cfgRes.res)
    expect(cfgRes.status).toBe(200)
    const cfgBody = JSON.parse(cfgRes.chunks.join(''))
    expect(cfgBody.maxWorkers).toBe(16)
    expect(cfgBody.waitToolName).toBe('ag_swarm_wait')
    expect(cfgBody.enableStallMonitor).toBe(true)

    const pageRes = createMockRes()
    await handler(createMockReq('GET', `/ag-swarm/api/swarm/messages?swarmId=${seeded.swarm_id}&before=3`), pageRes.res)
    expect(pageRes.status).toBe(200)
    const pageBody = JSON.parse(pageRes.chunks.join(''))
    expect(pageBody.messages.every((m: { seq: number }) => m.seq < 3)).toBe(true)
    expect(pageBody.messages.length).toBeGreaterThan(0)

    // 4) /frame rejects path traversal and non-image extension
    const travRes = createMockRes()
    await handler(createMockReq('GET', '/ag-swarm/api/frame?path=/tmp/../etc/passwd.png'), travRes.res)
    expect(travRes.status).toBe(403)

    const badExtPath = join(cwd, 'secret.txt')
    writeFileSync(badExtPath, 'hi')
    const extRes = createMockRes()
    await handler(createMockReq('GET', `/ag-swarm/api/frame?path=${encodeURIComponent(badExtPath)}`), extRes.res)
    expect(extRes.status).toBe(415)

    // 5) /events SSE pushes connected + live swarm_update and cleans up on req close
    const sseReq = createMockReq('GET', '/ag-swarm/api/events')
    const sseRes = createMockRes()
    await handler(sseReq, sseRes.res)
    expect(sseRes.status).toBe(200)
    expect(sseRes.chunks.join('')).toContain('"type":"connected"')
    const listenersDuringSse = store.listenerCount('update')
    store.appendMessage(seeded.swarm_id, { agent: 'coordinator', text: 'Ping SSE' })
    expect(sseRes.chunks.join('')).toContain('"type":"swarm_update"')
    sseReq.emit('close')
    expect(store.listenerCount('update')).toBeLessThan(listenersDuringSse)

    disposeRoutes()
    await pool.dispose()
  })
})

describe('Role model presets persistence, resolution precedence & /swarm primary command', () => {
  it('sanitizes, persists ModelPresetStore and resolves worker models in exact 6-level priority', () => {
    const storageDir = makeTempDir('ag-presets-store-')
    const store1 = new ModelPresetStore(storageDir)
    expect(store1.getAll()).toEqual({})

    const saved = store1.setAll({
      '  Explorer ': { provider: ' deepseek ', model: ' deepseek-chat ', reasoningEffort: ' low ' },
      author: { provider: 'deepseek', model: 'deepseek-reasoner', reasoningEffort: 'high' },
      verifier: { model: 'claude-opus' },
      frontend: { provider: 'openai', model: 'gpt-5', reasoningEffort: 'medium' },
      default: { provider: 'deepseek', model: 'deepseek-default' },
      empty: { model: '   ' },
      'INVALID KEY!': { model: 'ignored' },
    })
    expect(Object.keys(saved).sort()).toEqual(['author', 'default', 'explorer', 'frontend', 'verifier'])
    expect(saved.explorer).toEqual({ provider: 'deepseek', model: 'deepseek-chat', reasoningEffort: 'low' })
    expect(sanitizeRoleModelMap(null)).toEqual({})

    // Reload from disk verifies persistence
    const store2 = new ModelPresetStore(storageDir)
    const presets = store2.getAll()
    expect(presets.frontend?.model).toBe('gpt-5')

    // 1) Explicit model overrides everything
    expect(
      resolveModelForWorker({ explicitModel: 'manual-m', rolePreset: 'explorer', workerName: 'frontend-dev', presets })?.model,
    ).toBe('manual-m')

    // 2) Explicit rolePreset wins over name match
    const r2 = resolveModelForWorker({ rolePreset: 'verifier', workerName: 'frontend-dev', presets })
    expect(r2?.model).toBe('claude-opus')
    expect(r2?.source).toBe('role_preset')

    // 3) Custom preset key segment match (frontend-dev -> frontend)
    const r3 = resolveModelForWorker({ workerName: 'frontend-dev', presets })
    expect(r3?.model).toBe('gpt-5')
    expect(r3?.source).toBe('name_match')

    // 4) Semantic inference of built-in role (repo-scout -> explorer, qa-runner -> verifier, api-builder -> author)
    expect(resolveModelForWorker({ workerName: 'repo-scout', presets })?.model).toBe('deepseek-chat')
    expect(resolveModelForWorker({ workerName: 'qa-runner', presets })?.model).toBe('claude-opus')
    expect(resolveModelForWorker({ workerName: 'api-builder', presets })?.model).toBe('deepseek-reasoner')

    // 5) Fallback to default preset
    const r5 = resolveModelForWorker({ workerName: 'misc-task', presets })
    expect(r5?.model).toBe('deepseek-default')
    expect(r5?.source).toBe('default')

    // 6) Undefined when no preset matches and no default configured
    expect(resolveModelForWorker({ workerName: 'misc-task', presets: { explorer: { model: 'x' } } })).toBeUndefined()
  })
})

describe('/swarm primary command, WorkerPool presets & /api/model-presets routes', () => {
  it('registers /swarm as primary command by default (with /ag-swarm alias) and falls back cleanly on conflict', async () => {
    const storageDir = makeTempDir('ag-cmd-store-')
    const cwd = makeTempDir('ag-cmd-cwd-')
    const ctx1 = new MockHostContext(cwd)
    const store = new SwarmStore(storageDir)
    const defaultCfg = resolveSwarmConfig({ storageDir })
    expect(defaultCfg.registerSwarmCommandAlias).toBe(true)

    const pool = new WorkerPool(ctx1, store, defaultCfg)
    const h1 = registerSwarmCommand(ctx1, store, pool, defaultCfg)
    expect(h1.primaryCommand).toBe('swarm')
    expect(ctx1.registeredCommands.has('swarm')).toBe(true)
    expect(ctx1.registeredCommands.has('ag-swarm')).toBe(true)
    h1.dispose()

    // Conflict: another plugin already claimed /swarm -> falls back to primaryCommand='ag-swarm'
    const ctx2 = new MockHostContext(cwd)
    ctx2.registeredCommands.set('swarm', { name: 'swarm' })
    const h2 = registerSwarmCommand(ctx2, store, pool, defaultCfg)
    expect(h2.primaryCommand).toBe('ag-swarm')
    expect(ctx2.registeredCommands.has('ag-swarm')).toBe(true)
    h2.dispose()
    await pool.dispose()
  })

  it('persists role presets via /ag-swarm/api/model-presets, exposes them in /api/config, and applies them in addWorkers', async () => {
    const storageDir = makeTempDir('ag-preset-http-')
    const cwd = makeTempDir('ag-preset-cwd-')
    const ctx = new MockHostContext(cwd)
    const coord = new MockAgent('coord-p1', cwd)
    ctx.agentsMap.set(coord.id, coord)

    const store = new SwarmStore(storageDir)
    const config = resolveSwarmConfig({ storageDir, enableWorktrees: false })
    const pool = new WorkerPool(ctx, store, config)
    const cmdHandle = registerSwarmCommand(ctx, store, pool, config)
    const disposeRoutes = registerSwarmRoutes(ctx, store, pool, {
      config,
      getPrimaryCommand: () => cmdHandle.primaryCommand,
    })
    const handler = ctx.routeHandler!

    // Unauthenticated POST rejected
    ctx.admitResult = { rejection: 401 }
    const unauth = createMockRes()
    await handler(createMockReq('POST', '/ag-swarm/api/model-presets', { modelPresets: { explorer: { model: 'm1' } } }), unauth.res)
    expect(unauth.status).toBe(401)

    // Authenticated POST saves presets
    ctx.admitResult = { peer: { id: 'p1' } }
    const postRes = createMockRes()
    await handler(
      createMockReq('POST', '/ag-swarm/api/model-presets', {
        modelPresets: {
          explorer: { provider: 'deepseek', model: 'deepseek-chat', reasoningEffort: 'low' },
          verifier: { provider: 'anthropic', model: 'claude-opus-5-5', reasoningEffort: 'high' },
        },
      }),
      postRes.res,
    )
    expect(postRes.status).toBe(200)
    const postBody = JSON.parse(postRes.chunks.join(''))
    expect(postBody.ok).toBe(true)
    expect(postBody.modelPresets.explorer.model).toBe('deepseek-chat')

    // GET /api/model-presets & GET /api/config return presets + primaryCommand='swarm'
    const getRes = createMockRes()
    await handler(createMockReq('GET', '/ag-swarm/api/model-presets'), getRes.res)
    expect(getRes.status).toBe(200)
    expect(JSON.parse(getRes.chunks.join('')).modelPresets.verifier.model).toBe('claude-opus-5-5')

    const cfgRes = createMockRes()
    await handler(createMockReq('GET', '/ag-swarm/api/config'), cfgRes.res)
    expect(cfgRes.status).toBe(200)
    const cfg = JSON.parse(cfgRes.chunks.join(''))
    expect(cfg.primaryCommand).toBe('swarm')
    expect(cfg.modelPresets.explorer.model).toBe('deepseek-chat')

    // WorkerPool applies role_preset and semantic inference on addWorkers
    const swarm = pool.ensureSwarmForSession(coord.id, 'Preset Swarm', cwd)
    const [w1] = await pool.addWorkers({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      callerAgent: coord,
      name: 'code-scout',
      brief: 'Inspect codebase',
    })
    const [w2] = await pool.addWorkers({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      callerAgent: coord,
      name: 'custom-task',
      role_preset: 'verifier',
      brief: 'Verify output',
    })
    expect(w1!.model).toBe('deepseek-chat')
    expect(w1!.reasoning_effort).toBe('low')
    expect(w2!.model).toBe('claude-opus-5-5')
    expect(w2!.provider).toBe('anthropic')
    expect(w2!.reasoning_effort).toBe('high')

    disposeRoutes()
    cmdHandle.dispose()
    await pool.dispose()
  })

  it('/swarm <goal> kicks off coordinator via agent.followup, child inherits requestHeader/agentPreset, and swarm plan updates overview', async () => {
    const storageDir = makeTempDir('ag-kickoff-store-')
    const cwd = makeTempDir('ag-kickoff-cwd-')
    const ctx = new MockHostContext(cwd)

    const followups: Array<Record<string, unknown>> = []
    const coordAgent: HostAgentLike = {
      id: 'coord-kickoff-1',
      status: 'idle',
      options: { provider: 'deepseek', model: 'deepseek-chat', maxTokens: 8192 },
      session: {
        id: 'coord-kickoff-1',
        header: { id: 'coord-kickoff-1', cwd, agentPreset: 'standard' },
        requestHeader: () => ({
          config: { provider: 'anthropic', model: 'claude-sonnet-4-5', reasoningEffort: 'high' },
        }),
      },
      async followup(msg) {
        followups.push(msg as Record<string, unknown>)
      },
    }
    ctx.agentsMap.set(coordAgent.id, coordAgent as unknown as MockAgent)

    const store = new SwarmStore(storageDir)
    const config = resolveSwarmConfig({ storageDir, enableWorktrees: false })
    const pool = new WorkerPool(ctx, store, config)
    const toolsHandle = registerSwarmTools(ctx, store, pool)
    const cmdHandle = registerSwarmCommand(ctx, store, pool, config)

    // 1) /swarm <goal> triggers coordinator turn via agent.followup with V4 user source
    const cmd = ctx.registeredCommands.get('swarm')
    expect(cmd).toBeDefined()
    const res = await cmd.handler({ rawInput: 'Analyze PlantMirror architecture', agent: coordAgent })
    expect(res.kind).toBe('success')
    expect(res.text).toContain('Coordinator turn queued via followup')
    expect(followups).toHaveLength(1)
    expect(followups[0]?.role).toBe('user')
    expect((followups[0]?.source as { kind?: string })?.kind).toBe('user')
    expect(JSON.stringify(followups[0]?.content)).toContain('Analyze PlantMirror architecture')

    // Coordinator initial state reflects real idle status until agent/status=running
    const swarm = store.getSwarmBySession(coordAgent.id)!
    expect(swarm.members.coordinator.state).toBe('waiting')
    expect(swarm.members.coordinator.model).toBe('claude-sonnet-4-5')

    // 2) Child spawned without role preset inherits parent requestHeader().config & agentPreset
    const [inheritedWorker] = await pool.addWorkers({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      callerAgent: coordAgent,
      name: 'decompiler',
      brief: 'Inspect binary',
    })
    expect(inheritedWorker.model).toBe('claude-sonnet-4-5')
    expect(inheritedWorker.provider).toBe('anthropic')
    expect(inheritedWorker.reasoning_effort).toBe('high')

    const createdSpec = ctx.createdCalls.at(-1) as {
      meta?: { agentPreset?: string }
      agentOptions?: { provider?: string; model?: string; reasoningEffort?: string; maxTokens?: number }
    }
    expect(createdSpec.meta?.agentPreset).toBe('standard')
    expect(createdSpec.agentOptions?.model).toBe('claude-sonnet-4-5')
    expect(createdSpec.agentOptions?.provider).toBe('anthropic')
    expect(createdSpec.agentOptions?.maxTokens).toBe(8192)

    // 3) swarm{action:"plan"} updates plan.json for Overview
    const swarmTool = ctx.registeredTools.get('swarm')
    const planOut = JSON.parse(await swarmTool.execute({
      action: 'plan',
      goal: { title: 'PlantMirror Audit', line: 'Decompile & verify' },
      plan_tasks: { decompiler: 'Decompile assemblies' },
      threads: [{ id: 't1', title: 'Decompile', goal: 'Extract C#', tasks: ['decompiler'] }],
    }, { agent: coordAgent }))
    expect(planOut.ok).toBe(true)
    expect(store.getSwarm(swarm.swarm_id)!.plan?.goal.title).toBe('PlantMirror Audit')

    cmdHandle.dispose()
    toolsHandle.dispose()
    await pool.dispose()
  })

  it('v0.1.2: reads provider models & reasoning efforts safely, sanitizes invalid efforts, clears stale failures, and allows parallel swarm{action:"add"}', async () => {
    const storageDir = makeTempDir('ag-v012-store-')
    const cwd = makeTempDir('ag-v012-cwd-')
    const ctx = new MockHostContext(cwd)
    const coord = new MockAgent('coord-v012', cwd)
    ctx.agentsMap.set(coord.id, coord)

    // Mock DSH v0.2.2-rc.3 ctx.llm where listModels() throws if provider is omitted!
    ctx.services.set('llm', {
      listProviders: () => [{ id: 'cpa', name: 'CPA' }],
      listModels: (provider?: string) => {
        if (!provider) throw new Error('no adapter registered for provider "undefined"')
        return [
          { id: 'qoder/dfmodel', provider: 'cpa', name: 'DeepSeek-Flash · Qoder' },
          { id: 'qoder/plain', provider: 'cpa', name: 'Plain No-Reasoning' },
        ]
      },
      resolveModelInfo: async (_provider: string, model: string) => {
        if (model === 'qoder/dfmodel') {
          return {
            provider: 'cpa',
            id: model,
            name: 'DeepSeek-Flash · Qoder',
            reasoning: {
              defaultEffort: 'high',
              efforts: [
                { id: 'low', name: 'Low' },
                { id: 'medium', name: 'Medium' },
                { id: 'high', name: 'High' },
              ],
            },
          }
        }
        return { provider: 'cpa', id: model, name: 'Plain No-Reasoning' }
      },
    })

    const store = new SwarmStore(storageDir)
    const config = resolveSwarmConfig({ storageDir, enableWorktrees: false })
    const pool = new WorkerPool(ctx, store, config)
    const toolsHandle = registerSwarmTools(ctx, store, pool)
    const disposeRoutes = registerSwarmRoutes(ctx, store, pool, { config })

    // 1) tools/swarm isConcurrencySafe allows parallel add/status/models, keeps kill exclusive
    const swarmTool = ctx.registeredTools.get('swarm')
    expect(swarmTool.isConcurrencySafe({ action: 'add' })).toBe(true)
    expect(swarmTool.isConcurrencySafe({ action: 'status' })).toBe(true)
    expect(swarmTool.isConcurrencySafe({ action: 'models' })).toBe(true)
    expect(swarmTool.isConcurrencySafe({ action: 'kill' })).toBe(false)

    // 2) listModels() & GET /ag-swarm/api/models return model-driven efforts without crashing host
    const models = await pool.listModels()
    expect(models).toHaveLength(2)
    expect(models[0]?.defaultEffort).toBe('high')
    expect(models[0]?.efforts?.map((e) => e.id)).toEqual(['low', 'medium', 'high'])
    expect(models[1]?.reasoningKnown).toBe(true)
    expect(models[1]?.efforts).toBeUndefined()

    const modelsRes = createMockRes()
    await ctx.routeHandler!(createMockReq('GET', '/ag-swarm/api/models'), modelsRes.res)
    expect(modelsRes.status).toBe(200)
    expect(JSON.parse(modelsRes.chunks.join('')).models).toHaveLength(2)

    // 3) addWorkers strips unsupported reasoningEffort ('xhigh' on cpa/qoder/dfmodel)
    const swarm = pool.ensureSwarmForSession(coord.id, 'v0.1.2 Test', cwd)
    const [w1] = await pool.addWorkers({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      callerAgent: coord,
      name: 'scout-1',
      brief: 'Audit safely',
      provider: 'cpa',
      model: 'qoder/dfmodel',
      reasoning_effort: 'xhigh',
    })
    expect(w1.reasoning_effort).toBeUndefined()
    expect((ctx.createdCalls.at(-1)?.agentOptions as Record<string, unknown>)?.reasoningEffort).toBeUndefined()

    // 4) tools/pre-execute updates live Step + tool activity and clears stale failure
    store.updateMember(swarm.swarm_id, 'scout-1', {
      failure: { kind: 'error', message: 'old error', at: new Date().toISOString() },
      steps_count: 5,
    })
    const workerAgent = ctx.agentsMap.get(w1.conversation_id)!
    const nextMock = vi.fn(async () => ({ kind: 'allow' }))
    ctx.emit('tools/pre-execute', { agent: workerAgent, name: 'ops_bash' }, nextMock)
    const updatedAfterTool = store.getSwarm(swarm.swarm_id)!.members['scout-1']!
    expect(updatedAfterTool.failure).toBeUndefined()
    expect(updatedAfterTool.activity).toContain('ops_bash')

    // 5) getMemberTranscript parses step timing & assistant/tool blocks
    workerAgent.session.events.push(
      { type: 'step/start', time: 1000, data: {} },
      { type: 'tool/call', time: 2000, data: { name: 'ops_bash', text: 'dir' } },
      { type: 'step/end', time: 5000, data: {} },
      { type: 'assistant/message', time: 5100, data: { message: { content: [{ type: 'text', text: 'Done scanning repository.' }] } } },
    )
    const tr = await pool.getMemberTranscript(swarm.swarm_id, 'scout-1')
    expect(tr.steps.some((s) => s.toolName === 'ops_bash')).toBe(true)
    const assistantStep = tr.steps.find((s) => s.kind === 'assistant')
    expect(assistantStep?.detail).toContain('Done scanning repository.')
    expect(assistantStep?.durationMs).toBe(4000)

    disposeRoutes()
    toolsHandle.dispose()
    await pool.dispose()
  })

  it('v0.1.3: reconciles stale working/failure state on startup, cascades coordinator stop to active workers, and formats object abort reasons cleanly', async () => {
    const storageDir = makeTempDir('ag-v013-store-')
    const cwd = makeTempDir('ag-v013-cwd-')

    // 1) Startup reconciliation: stale working & old Step #1 failure from previous DSH process
    const store1 = new SwarmStore(storageDir)
    const preSwarm = store1.createOrGetSwarm('coord-v013-restart', 'Restart Test', cwd)
    store1.updateMember(preSwarm.swarm_id, 'coordinator', { state: 'working', activity: 'Step #22' })
    const oldFailAt = new Date(Date.now() - 60_000).toISOString()
    store1.addMember(preSwarm.swarm_id, {
      name: 'worker-stale',
      conversation_id: 'agw-stale-1',
      role: 'worker',
      state: 'working',
      workspace_mode: 'inherit',
      workspace: cwd,
    })
    store1.updateMember(preSwarm.swarm_id, 'worker-stale', {
      steps_count: 25,
      activity: 'Step #25',
      activity_kind: 'thinking',
      failure: { kind: 'error', message: 'unsupported reasoning effort "xhigh"', at: oldFailAt },
    })

    // Re-open SwarmStore + WorkerPool simulating DSH restart with empty ctx.agents
    const store2 = new SwarmStore(storageDir)
    const ctxRestart = new MockHostContext(cwd)
    const config = resolveSwarmConfig({ storageDir, enableWorktrees: false })
    const poolRestart = new WorkerPool(ctxRestart, store2, config)

    const reconciledSwarm = store2.getSwarm(preSwarm.swarm_id)!
    expect(reconciledSwarm.members.coordinator!.state).toBe('waiting')
    expect(reconciledSwarm.members['worker-stale']!.state).toBe('stopped')
    expect(reconciledSwarm.members['worker-stale']!.failure).toBeUndefined()
    await poolRestart.dispose()

    // 2) Cascade-stop workers when coordinator swarm_wait aborts with { kind: 'user' } object reason
    const ctx = new MockHostContext(cwd)
    const coord = new MockAgent('coord-stop-1', cwd)
    coord.status = 'running'
    ctx.agentsMap.set(coord.id, coord)
    const store = new SwarmStore(makeTempDir('ag-v013-stop-store-'))
    const pool = new WorkerPool(ctx, store, resolveSwarmConfig({ storageDir: makeTempDir('ag-v013-cfg-'), enableWorktrees: false }))
    const disposeRoutes = registerSwarmRoutes(ctx, store, pool, { config })

    const swarm = pool.ensureSwarmForSession(coord.id, 'Cascade Stop', cwd, coord)
    const [w1] = await pool.addWorkers({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      callerAgent: coord,
      name: 'runner-1',
      brief: 'Long task',
    })
    const workerAgent = ctx.agentsMap.get(w1.conversation_id)!
    const cancelSpy = vi.fn(async () => { workerAgent.status = 'idle' })
    workerAgent.cancel = cancelSpy
    workerAgent.status = 'running'

    // Stale failure cleared when worker posts a message or emits running status
    store.updateMember(swarm.swarm_id, 'runner-1', {
      failure: { kind: 'error', message: 'transient', at: new Date().toISOString() },
    })
    store.appendMessage(swarm.swarm_id, { agent: 'runner-1', text: 'Working progress update' })
    expect(store.getSwarm(swarm.swarm_id)!.members['runner-1']!.failure).toBeUndefined()

    const ac = new AbortController()
    const waitPromise = pool.waitForBoard({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      since: store.getSwarm(swarm.swarm_id)!.head,
      timeout_ms: 60_000,
      agent: coord,
      signal: ac.signal,
    })

    await new Promise((r) => setTimeout(r, 15))
    ac.abort({ kind: 'user' })
    await expect(waitPromise).rejects.toThrow('Cancelled by user')
    await new Promise((r) => setTimeout(r, 15))
    expect(cancelSpy).toHaveBeenCalledWith({ kind: 'user', reason: 'coordinator_aborted' })
    expect(store.getSwarm(swarm.swarm_id)!.members['runner-1']!.state).toBe('waiting')

    // 3) workspace/session-stop & HTTP POST stop_workers stop working workers cleanly
    store.updateMember(swarm.swarm_id, 'runner-1', { state: 'working' })
    workerAgent.status = 'running'
    ctx.emit('workspace/session-stop', { sessionId: coord.id })
    await new Promise((r) => setTimeout(r, 15))
    expect(cancelSpy).toHaveBeenCalledTimes(2)
    expect(store.getSwarm(swarm.swarm_id)!.members['runner-1']!.state).toBe('waiting')

    store.updateMember(swarm.swarm_id, 'runner-1', { state: 'working' })
    workerAgent.status = 'running'
    const stopRes = createMockRes()
    await ctx.routeHandler!(createMockReq('POST', '/ag-swarm/api/action', { action: 'stop_workers', swarmId: swarm.swarm_id }), stopRes.res)
    expect(stopRes.status).toBe(200)
    expect(JSON.parse(stopRes.chunks.join('')).stopped).toEqual(['runner-1'])
    expect(store.getSwarm(swarm.swarm_id)!.members['runner-1']!.state).toBe('waiting')

    // 4) v0.1.5: coordinator waitForBoard heartbeat timeout returns worker_summary & tool timeoutMs is bounded
    store.updateMember(swarm.swarm_id, 'runner-1', { state: 'working', steps_count: 12, activity: 'Step #12 · ops_bash' })
    const hbRes = await pool.waitForBoard({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      since: store.getSwarm(swarm.swarm_id)!.head,
      timeout_ms: 1_000,
      agent: coord,
    })
    expect(hbRes.status).toBe('timeout')
    expect(hbRes.reason).toBe('heartbeat')
    expect(hbRes.timedOut).toBe(true)
    expect(hbRes.worker_summary?.[0]).toMatchObject({ name: 'runner-1', state: 'working', steps_count: 12 })

    const toolsH = registerSwarmTools(ctx, store, pool)
    expect(ctx.registeredTools.get(toolsH.registeredNames.swarm_wait)?.timeoutMs).toBe(360_000)
    toolsH.dispose()

    disposeRoutes()
    await pool.dispose()
  })

  it('v0.1.8: binds DSH agentPresets scope, delegated permissions, workingDirectory, and prompt context on worker create and cold resume', async () => {
    const storageDir = makeTempDir('ag-v018-store-')
    const cwd = makeTempDir('ag-v018-cwd-')
    const ctx = new MockHostContext(cwd)

    const composeFromSpy = vi.fn(() => 'standard')
    const mountSpy = vi.fn(async () => ({ id: 'standard' }))
    const wdSetSpy = vi.fn(async () => cwd)
    const contextPrompts: Array<{ id: string; opts: Record<string, unknown> }> = []

    const presetsSvc = {
      defaultId: 'standard',
      composedPreset: () => 'standard',
      presetForSession: (session: unknown) => (session as { header?: { agentPreset?: string } } | undefined)?.header?.agentPreset,
      composeFrom: composeFromSpy,
      mount: mountSpy,
    }
    const parentCtx = {
      get: (<T = unknown>(name: string): T | undefined => {
        if (name === 'agentPresets') return presetsSvc as unknown as T
        if (name === 'permissionPresets') return { current: () => 'danger-full-access' } as unknown as T
        if (name === 'sandboxPolicy') return { overrideOf: () => 'danger-full-access' } as unknown as T
        if (name === 'approval') return {} as unknown as T
        return undefined
      }),
    }

    const coord = new MockAgent('coord-v018', cwd, [], { agentPreset: 'standard' })
    coord.ctx = parentCtx
    ctx.agentsMap.set(coord.id, coord)

    ctx.createSetupContextFactory = (id) => ({
      get: (name: string) => {
        if (name === 'agentPresets') return presetsSvc
        if (name === 'workingDirectory') return { set: wdSetSpy }
        return undefined
      },
      systemPrompt: {
        context: (opts: Record<string, unknown>) => contextPrompts.push({ id, opts }),
      },
    })
    ctx.resumeSetupContextFactory = (id) => ({
      get: (name: string) => (name === 'agentPresets' ? presetsSvc : undefined),
      systemPrompt: {
        context: (opts: Record<string, unknown>) => contextPrompts.push({ id, opts }),
      },
    })

    const store = new SwarmStore(storageDir)
    const pool = new WorkerPool(ctx, store, resolveSwarmConfig({ storageDir, enableWorktrees: false }))
    const swarm = pool.ensureSwarmForSession(coord.id, 'Preset Inheritance', cwd, coord)

    // 1) Spawn worker: inherits preset, delegated permissions, working directory, and worker persona
    const [w1] = await pool.addWorkers({
      swarmId: swarm.swarm_id,
      callerName: 'coordinator',
      callerAgent: coord,
      name: 'coder-1',
      brief: 'Implement feature',
    })
    const createdMeta = ctx.createdCalls[0]?.meta as Record<string, unknown>
    expect(createdMeta?.agentPreset).toBe('standard')
    expect(composeFromSpy).toHaveBeenCalledWith(expect.anything(), coord.ctx)
    expect(wdSetSpy).toHaveBeenCalledWith(expect.objectContaining({ id: w1.conversation_id }), w1.workspace, undefined)

    const workerAgent = ctx.agentsMap.get(w1.conversation_id)!
    expect(workerAgent.appendedEvents).toEqual([
      { type: 'sandbox/mode', data: { mode: 'danger-full-access', source: 'delegation' } },
      { type: 'approval/policy', data: { policy: 'never', source: 'delegation' } },
      { type: 'permission/preset', data: { preset: 'danger-full-access' } },
    ])
    expect(contextPrompts.some((p) => p.id === w1.conversation_id && p.opts.name === 'ag-swarm:worker')).toBe(true)

    // 2) Cold resume: re-mounts preset and restores worker persona on @mention wakeup
    mountSpy.mockClear()
    contextPrompts.length = 0
    await pool.dispose()

    const store2 = new SwarmStore(storageDir)
    store2.updateMember(swarm.swarm_id, 'coder-1', { state: 'stopped' })
    const resumeCtx = new MockHostContext(cwd)
    resumeCtx.services.set('agentPresets', presetsSvc)
    const stoppedWorker = new MockAgent(w1.conversation_id, w1.workspace, [], { agentPreset: 'standard' })
    resumeCtx.agentsMap.set(w1.conversation_id, stoppedWorker)
    // Simulate cold start after DSH restart: clear live agent cache on agents.get only when waking via resume
    const originalGet = resumeCtx.services.get('agents') as { get: (id: string) => MockAgent | undefined }
    const origGetFn = originalGet.get
    originalGet.get = (id: string) => (id === w1.conversation_id ? undefined : origGetFn(id))
    resumeCtx.resumeSetupContextFactory = (id) => ({
      get: (name: string) => (name === 'agentPresets' ? presetsSvc : undefined),
      systemPrompt: {
        context: (opts: Record<string, unknown>) => contextPrompts.push({ id, opts }),
      },
    })

    const pool2 = new WorkerPool(resumeCtx, store2, resolveSwarmConfig({ storageDir, enableWorktrees: false }))
    await pool2.postMessage(swarm.swarm_id, { agent: 'coordinator', text: '@coder-1 Please continue' })

    expect(resumeCtx.resumedCalls.length).toBe(1)
    expect(mountSpy).toHaveBeenCalledWith(expect.anything(), 'standard')
    expect(contextPrompts.some((p) => p.id === w1.conversation_id && p.opts.name === 'ag-swarm:worker')).toBe(true)

    await pool2.dispose()
  })

  it('v0.1.9: stops an individual working subagent via stop_worker and pushes models_updated SSE / fresh /api/models on llm adapter changes', async () => {
    const storageDir = makeTempDir('ag-v019-store-')
    const cwd = makeTempDir('ag-v019-cwd-')
    const ctx = new MockHostContext(cwd)

    let dynamicModels = [
      { id: 'model-old', name: 'Old Model', provider: 'custom' },
    ]
    ctx.services.set('llm', {
      listProviders: () => [{ id: 'custom', name: 'Custom' }],
      listModels: () => dynamicModels,
      resolveModelInfo: async (_p: string, id: string) => ({
        provider: 'custom',
        id,
        name: id,
        reasoning: { efforts: [{ id: 'high', name: 'High' }], defaultEffort: 'high' },
      }),
    })

    const store = new SwarmStore(storageDir)
    const config = resolveSwarmConfig({ storageDir, enableWorktrees: false })
    const pool = new WorkerPool(ctx, store, config)
    const disposeRoutes = registerSwarmRoutes(ctx, store, pool, { config })

    const coord = new MockAgent('coord-v019', cwd)
    ctx.agentsMap.set(coord.id, coord)
    const swarm = pool.ensureSwarmForSession(coord.id, 'Stop Worker & Model Reload', cwd, coord)

    const [wStop, wKeep] = await Promise.all([
      pool.addWorkers({ swarmId: swarm.swarm_id, callerName: 'coordinator', callerAgent: coord, name: 'w-stop', brief: 'Task A' }).then((r) => r[0]),
      pool.addWorkers({ swarmId: swarm.swarm_id, callerName: 'coordinator', callerAgent: coord, name: 'w-keep', brief: 'Task B' }).then((r) => r[0]),
    ])

    const stopAgent = ctx.agentsMap.get(wStop.conversation_id)!
    const keepAgent = ctx.agentsMap.get(wKeep.conversation_id)!
    const stopCancelSpy = vi.fn(async () => { stopAgent.status = 'idle' })
    const keepCancelSpy = vi.fn(async () => { keepAgent.status = 'idle' })
    stopAgent.cancel = stopCancelSpy
    keepAgent.cancel = keepCancelSpy
    stopAgent.status = 'running'
    keepAgent.status = 'running'

    // 1) Stop only w-stop via POST /ag-swarm/api/action
    const stopRes = createMockRes()
    await ctx.routeHandler!(
      createMockReq('POST', '/ag-swarm/api/action', { action: 'stop_worker', swarmId: swarm.swarm_id, member: 'w-stop' }),
      stopRes.res,
    )
    expect(stopRes.status).toBe(200)
    expect(JSON.parse(stopRes.chunks.join(''))).toEqual({ ok: true, member: 'w-stop', stopped: true })
    expect(stopCancelSpy).toHaveBeenCalledWith({ kind: 'user', reason: 'user_stopped' })
    expect(keepCancelSpy).not.toHaveBeenCalled()

    const latest = store.getSwarm(swarm.swarm_id)!
    expect(latest.members['w-stop']!.state).toBe('waiting')
    expect(latest.members['w-stop']!.activity).toContain('手动停止')
    expect(latest.members['w-keep']!.state).toBe('working')

    // 2) SSE receives models_updated on llm/adapters-updated and /api/models immediately reflects edited models
    const sseReq = createMockReq('GET', '/ag-swarm/api/events')
    const sseRes = createMockRes()
    await ctx.routeHandler!(sseReq, sseRes.res)
    expect(sseRes.status).toBe(200)

    dynamicModels = [
      { id: 'model-new-a', name: 'New Model A', provider: 'custom' },
      { id: 'model-new-b', name: 'New Model B', provider: 'custom' },
    ]
    ctx.emit('llm/adapters-updated')
    await new Promise((r) => setTimeout(r, 10))
    const sseBody = sseRes.chunks.join('')
    expect(sseBody).toContain('"type":"models_updated"')

    const modelsRes = createMockRes()
    await ctx.routeHandler!(createMockReq('GET', '/ag-swarm/api/models'), modelsRes.res)
    expect(modelsRes.status).toBe(200)
    const modelsJson = JSON.parse(modelsRes.chunks.join('')) as { models: Array<{ model: string }> }
    expect(modelsJson.models.map((m) => m.model)).toEqual(['model-new-a', 'model-new-b'])

    sseRes.res.destroy()
    disposeRoutes()
    await pool.dispose()
  })
})
