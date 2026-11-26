import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type {
  HostAgentLike,
  HostAgentsLike,
  HostConnectionLike,
  HostMessageSourceMapLike,
  HostProfileContextLike,
  HostSessionQueryLike,
  HostSubagentsLike,
  PluginContextLike,
} from '../types/dsh-host.js'

export const PLUGIN_MESSAGE_SOURCE_KIND = 'plugin:dsh-ag-swarm' as const

export interface HostCapabilities {
  agents: {
    available: boolean
    hasCreate: boolean
    hasResume: boolean
    hasGet: boolean
  }
  subagents: {
    available: boolean
    mode: 'rc3-activation' | 'legacy-activation' | 'legacy-start' | 'none'
    hasSendMessage: boolean
    hasInterrupt: boolean
    hasListDescendants: boolean
  }
  worktrees: boolean
  tools: boolean
  commands: boolean
  skills: boolean
  webServer: boolean
  connection: boolean
  sessionQuery: boolean
}

export interface SubagentStartInput {
  provider: 'spawn' | 'fork'
  label: string
  name?: string
  childId?: string
  cwd?: string
  prompt: string | Array<{ type: string; text?: string }>
  parent: HostAgentLike
  signal?: AbortSignal
  agentOptions?: Record<string, unknown>
  agentPreset?: string
  outputSchema?: Record<string, unknown>
  maxDepth?: number
  persona?: string
  toolFilter?: Record<string, unknown>
}

export interface SubagentStartHandle {
  id: string
  name?: string
  result: Promise<Record<string, unknown>>
  dispose: () => Promise<void> | void
}

export interface SessionSeedSnapshot {
  events: unknown[]
  inheritedEventCount: number
  seed: unknown[]
}

export interface UnwrappedAgentHandle {
  agent: HostAgentLike
  dispose: () => Promise<void>
}

export interface AdmissionResult {
  admitted: boolean
  status: number
  actorId: string
  reason?: string
}

export function getDshHome(ctx?: PluginContextLike): string {
  const profile = ctx?.get<HostProfileContextLike>('profile')
  if (typeof profile?.home === 'string' && profile.home.trim().length > 0) {
    return profile.home.trim()
  }
  const envHome = process.env.DSH_HOME
  if (typeof envHome === 'string' && envHome.trim().length > 0) {
    return envHome.trim()
  }
  return join(homedir(), '.dsh')
}

export function detectHostCapabilities(ctx?: PluginContextLike): HostCapabilities {
  const agents = ctx?.get<HostAgentsLike>('agents')
  const subagents = ctx?.get<HostSubagentsLike>('subagents')
  const hasStartActivation = typeof subagents?.startActivation === 'function'
  const hasListDescendants = typeof subagents?.listDescendants === 'function'
  const hasLegacyStart = typeof subagents?.start === 'function'

  let subagentMode: HostCapabilities['subagents']['mode'] = 'none'
  if (hasStartActivation && hasListDescendants) {
    subagentMode = 'rc3-activation'
  } else if (hasStartActivation) {
    subagentMode = 'legacy-activation'
  } else if (hasLegacyStart) {
    subagentMode = 'legacy-start'
  }

  return {
    agents: {
      available: agents !== undefined,
      hasCreate: typeof agents?.create === 'function',
      hasResume: typeof agents?.resume === 'function',
      hasGet: typeof agents?.get === 'function',
    },
    subagents: {
      available: subagents !== undefined && subagentMode !== 'none',
      mode: subagentMode,
      hasSendMessage: typeof subagents?.sendMessage === 'function',
      hasInterrupt: typeof subagents?.interrupt === 'function',
      hasListDescendants,
    },
    worktrees: typeof ctx?.get<{ create?: unknown }>('worktrees')?.create === 'function',
    tools: typeof ctx?.get<{ register?: unknown }>('tools')?.register === 'function',
    commands: typeof ctx?.get<{ register?: unknown }>('commands')?.register === 'function',
    skills: typeof ctx?.get<{ register?: unknown }>('skills')?.register === 'function',
    webServer: typeof ctx?.get<{ register?: unknown }>('webServer')?.register === 'function',
    connection: typeof ctx?.get<HostConnectionLike>('connection')?.admit === 'function',
    sessionQuery: ctx?.get<HostSessionQueryLike>('sessionQuery') !== undefined,
  }
}

export function boundSummary(summary: string, maxChars = 120): string {
  const trimmed = summary.trim()
  if (trimmed.length <= maxChars) return trimmed
  return `${trimmed.slice(0, maxChars - 1)}…`
}

export function buildPluginUserMessage(text: string, summary = 'swarm notification'): Record<string, unknown> {
  return Object.freeze({
    id: randomUUID(),
    role: 'user',
    content: Object.freeze([Object.freeze({ type: 'text', text })]),
    source: Object.freeze({
      kind: PLUGIN_MESSAGE_SOURCE_KIND,
      form: 'notice',
      summary: boundSummary(summary),
    }),
  })
}

export function registerMessageSourceCompat(ctx?: PluginContextLike): () => void {
  if (!ctx) return () => {}
  const candidate =
    ctx.get<HostMessageSourceMapLike>('messageSources')
    ?? ctx.get<HostMessageSourceMapLike>('messageSourceMap')
    ?? (ctx.get<{ messageSources?: HostMessageSourceMapLike }>('llm')?.messageSources)
  if (typeof candidate?.register === 'function') {
    try {
      const dispose = candidate.register(PLUGIN_MESSAGE_SOURCE_KIND, { form: 'notice' })
      return typeof dispose === 'function' ? dispose : () => {}
    } catch {
      return () => {}
    }
  }
  return () => {}
}

export function unwrapAgentHandle(maybeHandle: unknown): UnwrappedAgentHandle | undefined {
  if (!maybeHandle || typeof maybeHandle !== 'object') return undefined
  const record = maybeHandle as Record<string, unknown>
  if (record.agent && typeof record.agent === 'object') {
    const agent = record.agent as HostAgentLike
    const dispose = typeof record.dispose === 'function'
      ? async () => { await (record.dispose as () => Promise<void> | void)() }
      : async () => { await agent.dispose?.() }
    return { agent, dispose }
  }
  if (typeof record.id === 'string') {
    const agent = record as unknown as HostAgentLike
    return {
      agent,
      dispose: async () => { await agent.dispose?.() },
    }
  }
  return undefined
}

export async function startSubagentCompat(
  ctx: PluginContextLike,
  input: SubagentStartInput,
): Promise<SubagentStartHandle> {
  const subagents = ctx.get<HostSubagentsLike>('subagents')
  if (!subagents) {
    throw new Error('DSH host subagents service is unavailable')
  }
  const promptBlocks = typeof input.prompt === 'string'
    ? [{ type: 'text', text: input.prompt }]
    : input.prompt

  const baseRequest: Record<string, unknown> = {
    prompt: promptBlocks,
    parent: input.parent,
    ...(input.cwd !== undefined ? { cwd: input.cwd } : {}),
    ...(input.agentOptions !== undefined ? { agentOptions: input.agentOptions } : {}),
    ...(input.outputSchema !== undefined ? { outputSchema: input.outputSchema } : {}),
    ...(input.maxDepth !== undefined ? { maxDepth: input.maxDepth } : {}),
  }

  if (typeof subagents.startActivation === 'function') {
    const isRc3 = typeof subagents.listDescendants === 'function'
    const spec: Record<string, unknown> = {
      provider: input.provider,
      label: input.label,
      ...(input.childId !== undefined ? { childId: input.childId } : {}),
      ...(isRc3
        ? {
            ...baseRequest,
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.agentPreset !== undefined ? { agentPreset: input.agentPreset } : {}),
          }
        : {
            request: {
              ...baseRequest,
              ...(input.agentPreset !== undefined ? { agentPreset: input.agentPreset } : {}),
            },
          }),
      ...(input.signal !== undefined ? { signal: input.signal } : {}),
      delivery: 'caller',
    }
    const activation = await subagents.startActivation(spec)
    return {
      id: activation.childId,
      name: activation.name,
      result: activation.result,
      dispose: () => activation.dispose(),
    }
  }

  if (typeof subagents.start === 'function') {
    const handle = await subagents.start(input.provider, {
      label: input.label,
      ...baseRequest,
      ...(input.signal !== undefined ? { signal: input.signal } : {}),
      ...(input.persona !== undefined ? { persona: input.persona } : {}),
      ...(input.toolFilter !== undefined ? { toolFilter: input.toolFilter } : {}),
    })
    return {
      id: handle.id,
      result: handle.result,
      dispose: () => handle.dispose(),
    }
  }

  throw new Error('DSH host subagents service supports neither startActivation nor start')
}

export async function readSessionSeed(
  ctx: PluginContextLike | undefined,
  sessionId: string,
): Promise<SessionSeedSnapshot> {
  let rawEvents: unknown[] = []

  const liveAgent = ctx?.get<HostAgentsLike>('agents')?.get?.(sessionId) as
    | (HostAgentLike & {
        session?: {
          snapshotEvents?: (from?: number) => unknown[]
          events?: unknown[]
        }
      })
    | undefined

  if (liveAgent?.session) {
    if (typeof liveAgent.session.snapshotEvents === 'function') {
      try {
        const snap = liveAgent.session.snapshotEvents(0)
        if (Array.isArray(snap)) rawEvents = [...snap]
      } catch {
        // Fall back to sessionQuery below.
      }
    } else if (Array.isArray(liveAgent.session.events)) {
      rawEvents = [...liveAgent.session.events]
    }
  }

  if (rawEvents.length === 0 && ctx) {
    const sq = ctx.get<
      HostSessionQueryLike & {
        readSession?: (id: string) => Promise<{ events?: unknown[] }> | { events?: unknown[] }
      }
    >('sessionQuery')
    if (sq) {
      try {
        if (typeof sq.readSession === 'function') {
          const snap = await sq.readSession(sessionId)
          if (Array.isArray(snap?.events)) rawEvents = [...snap.events]
        } else if (typeof sq.readEvents === 'function') {
          const evs = await sq.readEvents(sessionId)
          if (Array.isArray(evs)) rawEvents = [...evs]
        } else if (typeof sq.getEvents === 'function') {
          const evs = await sq.getEvents(sessionId)
          if (Array.isArray(evs)) rawEvents = [...evs]
        }
      } catch {
        rawEvents = []
      }
    }
  }

  if (rawEvents.length === 0) {
    return { events: [], inheritedEventCount: 0, seed: [] }
  }

  const last = rawEvents[rawEvents.length - 1] as { time?: number; type?: string } | undefined
  const lastTime = typeof last?.time === 'number' ? last.time : Date.now()
  const seed = [...rawEvents]
  if (last?.type !== 'session/end-seed') {
    seed.push({
      type: 'session/end-seed',
      seq: rawEvents.length,
      time: lastTime,
      data: { inherited: true },
    })
  }

  return {
    events: rawEvents,
    inheritedEventCount: rawEvents.length,
    seed,
  }
}

export async function selectAgentModelCompat(
  agent: HostAgentLike | undefined,
  selection: { provider?: string; model: string; reasoningEffort?: string },
): Promise<boolean> {
  if (!agent?.model || typeof agent.model.select !== 'function') {
    return false
  }
  const current = (agent.model as { current?: () => { provider?: string } | undefined }).current?.()
  const opts = (agent as { options?: { provider?: string } }).options
  const provider = selection.provider ?? current?.provider ?? opts?.provider ?? 'default'
  await agent.model.select({
    provider,
    model: selection.model,
    ...(selection.reasoningEffort !== undefined ? { reasoningEffort: selection.reasoningEffort } : {}),
  })
  return true
}

export async function admitHttpRequest(
  ctx: PluginContextLike,
  headers: Record<string, unknown>,
): Promise<AdmissionResult> {
  const connection = ctx.get<HostConnectionLike>('connection')
  if (!connection || typeof connection.admit !== 'function') {
    return { admitted: false, status: 503, actorId: '', reason: 'connection service unavailable' }
  }
  try {
    const result = (await connection.admit({ headers })) as unknown
    if (typeof result === 'boolean') {
      return result
        ? { admitted: true, status: 200, actorId: 'authenticated-dashboard' }
        : { admitted: false, status: 403, actorId: '', reason: 'request refused' }
    }
    if (result && typeof result === 'object') {
      const rec = result as { rejection?: number; peer?: { id?: unknown } | unknown }
      if ('rejection' in rec && typeof rec.rejection === 'number') {
        const status = rec.rejection === 401 ? 401 : 403
        return { admitted: false, status, actorId: '', reason: 'request refused' }
      }
      if ('peer' in rec && rec.peer !== undefined && rec.peer !== null) {
        const peerId = typeof rec.peer === 'object' ? (rec.peer as { id?: unknown }).id : undefined
        const actorId = typeof peerId === 'string' && peerId.length <= 128 ? `peer:${peerId}` : 'authenticated-dashboard'
        return { admitted: true, status: 200, actorId }
      }
    }
    return { admitted: false, status: 403, actorId: '', reason: 'invalid admission response' }
  } catch {
    return { admitted: false, status: 503, actorId: '', reason: 'connection admission unavailable' }
  }
}
