export interface HostProfileContextLike {
  home?: string
  startedBundles?: string[]
}

export interface HostMessageSourceMapLike {
  register?: (kind: string, options?: Record<string, unknown>) => (() => void) | void
}

export interface HostModelSelectionLike {
  select?: (selection: { provider?: string; model: string; reasoningEffort?: string }) => Promise<void> | void
}

export interface HostAgentPresetsLike {
  defaultId?: string
  composedPreset?: (ctx: unknown) => string | undefined
  presetForSession?: (session: unknown) => string | null | undefined
  composeFrom?: (childCtx: unknown, parentCtx: unknown) => string | undefined
  mount?: (childCtx: unknown, id?: string) => Promise<{ id: string } | void>
}

export interface HostPermissionPresetsLike {
  current?: (session: unknown) => string | undefined
}

export interface HostSandboxPolicyLike {
  overrideOf?: (session: unknown) => string | undefined
}

export interface HostWorkingDirectoryLike {
  set?: (agent: HostAgentLike, path: string, signal?: AbortSignal) => Promise<string | void> | void
}

export interface HostAgentContextLike {
  get?: <T = unknown>(name: string) => T | undefined
  systemPrompt?: {
    context?: (opts: Record<string, unknown>) => void
  }
}

export interface HostAgentLike {
  id: string
  status?: string
  options?: Record<string, unknown>
  ctx?: HostAgentContextLike
  session?: {
    id?: string
    header?: Record<string, unknown>
    requestHeader?: () => { config?: { provider?: string; model?: string; reasoningEffort?: string } } | undefined
    append?: (type: string, data: Record<string, unknown>) => void
  }
  model?: HostModelSelectionLike
  steer?: (message: unknown) => Promise<void> | void
  followup?: (message: unknown) => Promise<void> | void
  inject?: (message: unknown) => Promise<void> | void
  cancel?: (reason?: unknown, options?: Record<string, unknown>) => Promise<void> | void
  whenIdle?: () => Promise<void>
  dispose?: () => Promise<void> | void
}

export interface HostAgentsLike {
  get?: (sessionId: string) => HostAgentLike | undefined
  create?: (options: Record<string, unknown>) => Promise<HostAgentLike>
  resume?: (sessionId: string, options?: Record<string, unknown>) => Promise<HostAgentLike>
}

export interface HostSubagentActivationLike {
  childId: string
  name?: string
  result: Promise<Record<string, unknown>>
  dispose: () => Promise<void> | void
}

export interface HostSubagentsLike {
  start?: (provider: string, request: Record<string, unknown>) => Promise<{ id: string; result: Promise<Record<string, unknown>>; dispose: () => Promise<void> | void }>
  startActivation?: (spec: Record<string, unknown>) => Promise<HostSubagentActivationLike>
  sendMessage?: (sender: HostAgentLike, targetId: string, content: unknown, options?: { signal?: AbortSignal }) => Promise<unknown>
  interrupt?: (targetSessionId: string, reason: unknown) => Promise<void> | void
  listDescendants?: (rootIds: string[]) => unknown[]
  getProvider?: (name: string) => unknown
}

export interface HostWorktreesLike {
  create?: (agent: HostAgentLike, request: { name?: string; from?: string }, signal?: AbortSignal) => Promise<{ path: string; branch?: string; repositoryRoot?: string }>
}

export interface HostSessionQueryLike {
  readEvents?: (sessionId: string) => Promise<unknown[]> | unknown[]
  getEvents?: (sessionId: string) => Promise<unknown[]> | unknown[]
}

export interface HostToolDefLike {
  name: string
  description: string
  parameters: unknown
  isConcurrencySafe?: boolean
  timeoutMs?: number
  execute: (args: Record<string, unknown>, exec: { agent?: HostAgentLike; signal?: AbortSignal }) => Promise<unknown>
}

export interface HostToolsLike {
  register: (tool: HostToolDefLike, options?: Record<string, unknown>) => (() => void) | void
  has?: (name: string) => boolean
  get?: (name: string) => unknown
}

export interface HostCommandsLike {
  register: (command: {
    name: string
    description: string
    input?: { hint?: string; attachments?: boolean }
    handler: (invocation: Record<string, unknown>) => Promise<{ kind: 'success' | 'error'; text?: string }>
  }) => (() => void) | void
  has?: (name: string) => boolean
}

export interface HostSkillsLike {
  register: (skill: { name: string; description: string; content: string; [key: string]: unknown }) => (() => void) | void
}

export interface HostWebServerLike {
  register: (route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => Promise<void> | void
  }) => (() => void) | void
}

export interface HostConnectionLike {
  admit?: (input: { headers: Record<string, unknown> }) => boolean | Promise<boolean>
}

export interface PluginContextLike {
  get: <T = unknown>(name: string) => T | undefined
  effect: (fn: () => (() => void) | void) => () => void
  on: (event: string, listener: (...args: any[]) => any, options?: Record<string, unknown>) => () => void
  logger?: (name: string) => { info: (...a: unknown[]) => void; warn: (...a: unknown[]) => void; error: (...a: unknown[]) => void }
}
