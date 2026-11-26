import type { Context } from '@deepseek-ai/cordis'
import { Config, PLUGIN_VERSION, resolveSwarmConfig } from './config.js'
import type { SwarmConfig } from './shared/protocol.js'
import { SwarmStore } from './core/store.js'
import { registerSwarmCommand } from './command.js'
import { registerSwarmRoutes } from './routes.js'
import { registerSwarmSkills } from './skills.js'
import { registerSwarmTools } from './tools/index.js'
import { registerMessageSourceCompat } from './runtime/dsh-adapter.js'
import { SwarmStallMonitor } from './runtime/stall-monitor.js'
import { WorkerPool } from './runtime/worker-pool.js'
import type { PluginContextLike } from './types/dsh-host.js'

export const name = 'dsh-ag-swarm'
export { Config, PLUGIN_VERSION }
export type { SwarmConfig }

export { SwarmStore } from './core/store.js'
export { buildSnapshot } from './core/projection.js'
export { ModelPresetStore, resolveModelForWorker, sanitizeRoleModelMap } from './core/model-presets.js'
export * from './core/channels.js'
export { WorkerPool } from './runtime/worker-pool.js'
export { SwarmStallMonitor } from './runtime/stall-monitor.js'
export {
  detectHostCapabilities,
  getDshHome,
  readSessionSeed,
  registerMessageSourceCompat,
  selectAgentModelCompat,
  startSubagentCompat,
} from './runtime/dsh-adapter.js'
export { cleanupWorkspace, prepareWorkspace } from './runtime/workspace.js'

function wireWhenAvailable(
  ctx: PluginContextLike,
  serviceName: string,
  fn: () => (() => void) | void,
  timeoutMs = 60_000,
): () => void {
  const logger = ctx.logger?.('ag-swarm')
  const guarded = (): (() => void) | void => {
    try {
      return fn()
    } catch (err) {
      logger?.error('wiring %s failed (degraded): %s', serviceName, String(err))
      return undefined
    }
  }

  let inner: (() => void) | void
  let settled = false
  if (ctx.get(serviceName) !== undefined) {
    inner = guarded()
    settled = true
    return () => {
      if (typeof inner === 'function') inner()
    }
  }

  const poll = setInterval(() => {
    if (ctx.get(serviceName) !== undefined) {
      clearInterval(poll)
      clearTimeout(deadline)
      inner = guarded()
      settled = true
    }
  }, 500)
  poll.unref?.()

  const deadline = setTimeout(() => {
    clearInterval(poll)
  }, timeoutMs)
  deadline.unref?.()

  return () => {
    clearInterval(poll)
    clearTimeout(deadline)
    if (settled && typeof inner === 'function') {
      try { inner() } catch { /* ignore */ }
    }
  }
}

export function apply(ctx: Context, rawConfig?: Partial<SwarmConfig>): void {
  const hostCtx = ctx as unknown as PluginContextLike
  const logger = hostCtx.logger?.('ag-swarm')
  const config = resolveSwarmConfig(rawConfig)

  let store: SwarmStore
  let pool: WorkerPool
  let monitor: SwarmStallMonitor
  try {
    store = new SwarmStore(config.storageDir)
    pool = new WorkerPool(hostCtx, store, config)
    monitor = new SwarmStallMonitor({
      config,
      logger,
      listSwarmViews: () =>
        store.listSwarms().flatMap((summary) => {
          const state = store.getSwarm(summary.swarm_id)
          if (!state) return []
          return [
            {
              swarmId: state.swarm_id,
              head: state.head,
              members: state.members,
              channels: state.channels,
              messages: state.messages,
            },
          ]
        }),
      postStallAlert: async (swarmId, text) => {
        await pool.postMessage(swarmId, { agent: 'monitor', text, kind: 'stall' })
      },
    })
  } catch (err) {
    logger?.error('dsh-ag-swarm failed to initialize (disabled for this session): %s', String(err))
    return
  }

  hostCtx.effect(() => {
    const disposeSource = registerMessageSourceCompat(hostCtx)
    monitor.start()
    return () => {
      monitor.stop()
      disposeSource()
      void pool.dispose()
    }
  })

  let waitToolName = 'swarm_wait'
  let primaryCommand = config.registerSwarmCommandAlias ? 'swarm' : 'ag-swarm'
  hostCtx.effect(() =>
    wireWhenAvailable(hostCtx, 'tools', () => {
      const handle = registerSwarmTools(hostCtx, store, pool)
      waitToolName = handle.registeredNames.swarm_wait
      return handle.dispose
    }),
  )
  hostCtx.effect(() =>
    wireWhenAvailable(hostCtx, 'commands', () => {
      const handle = registerSwarmCommand(hostCtx, store, pool, config)
      primaryCommand = handle.primaryCommand
      return handle.dispose
    }),
  )
  hostCtx.effect(() => wireWhenAvailable(hostCtx, 'skills', () => registerSwarmSkills(hostCtx)))
  hostCtx.effect(() =>
    wireWhenAvailable(hostCtx, 'webServer', () =>
      registerSwarmRoutes(hostCtx, store, pool, {
        config,
        getWaitToolName: () => waitToolName,
        getPrimaryCommand: () => primaryCommand,
      }),
    ),
  )
}
