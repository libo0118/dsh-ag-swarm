import type { HostAgentLike, HostCommandsLike, PluginContextLike } from './types/dsh-host.js'
import type { SwarmConfig } from './shared/protocol.js'
import type { SwarmStore } from './core/store.js'
import type { WorkerPool } from './runtime/worker-pool.js'

export interface AgSwarmCommandResult {
  kind: 'success' | 'error'
  text: string
}

export interface RegisteredCommandHandle {
  dispose: () => void
  primaryCommand: string
}

const USAGE = [
  'Antigravity Swarm commands (/swarm, alias /ag-swarm):',
  '  /swarm                       Show current swarm status & roster',
  '  /swarm status                Show current swarm status & roster',
  '  /swarm title <title>         Set the swarm title',
  '  /swarm add <name> <brief>    Spawn a parallel worker with a brief',
  '  /swarm post <message>        Post a message to the shared blackboard',
  '  /swarm kill <name>           Permanently stop a worker & clean isolated workspace',
  '  /swarm help                  Show this usage guide',
  '  /swarm <goal>                Initialize a swarm for <goal> as coordinator',
  '',
  'Coordinator tip: after calling swarm{action:"add"}, immediately loop calling swarm_wait{since: head} so this DSH session stays actively running in the sidebar at zero LLM tokens until workers report back.',
].join('\n')

function sessionIdOf(agent: unknown): string {
  const a = agent as { id?: unknown; session?: { id?: unknown } } | undefined
  const candidate = a?.session?.id ?? a?.id
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : 'default-session'
}

function cwdOf(agent: unknown): string {
  const a = agent as { session?: { header?: { cwd?: unknown } } } | undefined
  const cwd = a?.session?.header?.cwd
  return typeof cwd === 'string' && cwd.length > 0 ? cwd : process.cwd()
}

export async function handleAgSwarmCommand(
  store: SwarmStore,
  pool: WorkerPool,
  rawInput: string,
  agent?: unknown,
  attachments?: readonly unknown[],
): Promise<AgSwarmCommandResult> {
  const trimmed = rawInput.trim()
  const sessionId = sessionIdOf(agent)
  const cwd = cwdOf(agent)

  if (!trimmed || trimmed.toLowerCase() === 'status') {
    const existing = store.getSwarmBySession(sessionId)
    if (!existing) {
      const all = store.listSwarms()
      if (all.length === 0) {
        return { kind: 'success', text: 'No active swarm yet. Start one with `/swarm <goal>` (alias `/ag-swarm <goal>`) or call `swarm{action:"add"}`.' }
      }
      const lines = all.slice(0, 10).map((s) => `- ${s.swarm_id} "${s.title || '(untitled)'}" (head #${s.head}, ${s.workingCount}/${s.memberCount} working)`)
      return { kind: 'success', text: `Swarms:\n${lines.join('\n')}` }
    }
    const members = Object.values(existing.members)
    const lines = [
      `Swarm ${existing.swarm_id}: "${existing.title || '(untitled)'}" (head #${existing.head})`,
      ...members.map((m) => `  - @${m.name} [${m.role}/${m.state}] model=${m.model} ws=${m.workspace_mode} last=#${m.last_post_seq ?? 0}`),
    ]
    return { kind: 'success', text: lines.join('\n') }
  }

  const spaceIdx = trimmed.search(/\s/)
  const sub = (spaceIdx < 0 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase()
  const rest = spaceIdx < 0 ? '' : trimmed.slice(spaceIdx + 1).trim()

  if (sub === 'help' || sub === '?') {
    return { kind: 'success', text: USAGE }
  }

  try {
    const swarm = pool.ensureSwarmForSession(sessionId, undefined, cwd)
    if (sub === 'title') {
      if (!rest) return { kind: 'error', text: 'usage: /swarm title <title>' }
      store.setTitle(swarm.swarm_id, rest)
      return { kind: 'success', text: `Swarm title set to "${rest}".` }
    }
    if (sub === 'post') {
      if (!rest) return { kind: 'error', text: 'usage: /swarm post <message>' }
      const { message, woken } = await pool.postMessage(swarm.swarm_id, { agent: 'coordinator', text: rest })
      return { kind: 'success', text: `Posted #${message.seq}${woken.length ? ` (woke: ${woken.map((w) => `@${w}`).join(', ')})` : ''}.` }
    }
    if (sub === 'kill') {
      if (!rest) return { kind: 'error', text: 'usage: /swarm kill <worker-name>' }
      await pool.killMember(swarm.swarm_id, 'coordinator', rest)
      return { kind: 'success', text: `Killed worker @${rest}.` }
    }
    if (sub === 'add') {
      const m = /^([a-z0-9][a-z0-9_-]{0,23})\s+([\s\S]+)$/i.exec(rest)
      if (!m) return { kind: 'error', text: 'usage: /swarm add <name> <brief>' }
      const spawned = await pool.addWorkers({
        swarmId: swarm.swarm_id,
        callerName: 'coordinator',
        callerAgent: agent as never,
        name: m[1]!.toLowerCase(),
        brief: m[2]!.trim(),
      })
      return {
        kind: 'success',
        text: `Spawned ${spawned.map((w) => `@${w.name}`).join(', ')} in ${swarm.swarm_id}. Call swarm_wait{since: ${swarm.head}} to wait for their reports while keeping this session active.`,
      }
    }

    // Default: treat full text as a goal to initialize the swarm & kick off coordinator turn
    const title = trimmed.length > 72 ? `${trimmed.slice(0, 72)}…` : trimmed
    store.setTitle(swarm.swarm_id, title)
    const { message } = await pool.postMessage(swarm.swarm_id, {
      agent: 'coordinator',
      text: `Swarm goal: ${trimmed}`,
    })
    const kickoff = await pool.kickoffCoordinator(
      agent as HostAgentLike | undefined,
      swarm.swarm_id,
      trimmed,
      attachments,
    )
    if (kickoff.dispatched) {
      return {
        kind: 'success',
        text: `Swarm ${swarm.swarm_id} started ("${title}", #${message.seq}). Coordinator turn queued via ${kickoff.method} — watch the Swarm tab & sidebar progress.`,
      }
    }
    return {
      kind: 'success',
      text: [
        `Swarm ${swarm.swarm_id} initialized ("${title}", #${message.seq}).`,
        'Send a prompt in this chat to kick off the coordinator:',
        '1. Use `swarm{action:"add", name, brief, workspace}` to spawn parallel workers on disjoint scopes.',
        `2. Immediately loop calling \`swarm_wait{since: ${message.seq}}\` after dispatching so this DSH main session stays actively running in the sidebar at zero LLM tokens until workers report back.`,
        '3. Post `[done]` on the board when all work is integrated.',
      ].join('\n'),
    }
  } catch (err) {
    return { kind: 'error', text: err instanceof Error ? err.message : String(err) }
  }
}

export function registerSwarmCommand(
  ctx: PluginContextLike,
  store: SwarmStore,
  pool: WorkerPool,
  config: Pick<SwarmConfig, 'registerSwarmCommandAlias'>,
): RegisteredCommandHandle {
  const commands = ctx.get<HostCommandsLike>('commands')
  if (!commands || typeof commands.register !== 'function') {
    return { dispose: () => {}, primaryCommand: config.registerSwarmCommandAlias ? 'swarm' : 'ag-swarm' }
  }

  const disposers: Array<() => void> = []
  const registerOne = (name: string): boolean => {
    if (typeof commands.has === 'function' && commands.has(name)) return false
    try {
      const dispose = commands.register({
        name,
        description: 'Antigravity Swarm: launch and manage persistent parallel workers, shared channel board, and coordinator swarm_wait.',
        input: { hint: '[<goal>|status|title <t>|add <name> <brief>|post <msg>|kill <name>|help]', attachments: true },
        handler: async (invocation) => {
          const rawInput = typeof invocation.rawInput === 'string' ? invocation.rawInput : ''
          const attachments = Array.isArray(invocation.attachments) ? invocation.attachments : undefined
          return handleAgSwarmCommand(store, pool, rawInput, invocation.agent, attachments)
        },
      })
      if (typeof dispose === 'function') disposers.push(dispose)
      return true
    } catch (err) {
      ctx.logger?.('ag-swarm').warn('failed to register command /%s: %s', name, String(err))
      return false
    }
  }

  let primaryCommand = 'ag-swarm'
  if (config.registerSwarmCommandAlias && registerOne('swarm')) {
    primaryCommand = 'swarm'
  }
  registerOne('ag-swarm')

  return {
    primaryCommand,
    dispose: () => {
      for (const dispose of disposers) {
        try { dispose() } catch { /* ignore */ }
      }
    },
  }
}
