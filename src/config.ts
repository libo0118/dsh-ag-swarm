import Schema from '@deepseek-ai/schemastery'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { SwarmConfig } from './shared/protocol.js'

export type { SwarmConfig }

export const PLUGIN_VERSION = '0.1.1'

export function defaultStorageDir(): string {
  const home = process.env.DSH_HOME && process.env.DSH_HOME.trim().length > 0
    ? process.env.DSH_HOME.trim()
    : join(homedir(), '.dsh')
  return join(home, 'storages', 'ag-swarm')
}

export const DEFAULT_SWARM_CONFIG: Readonly<SwarmConfig> = Object.freeze({
  storageDir: defaultStorageDir(),
  maxWorkers: 12,
  maxDepth: 2,
  stallCheckIntervalMs: 180_000,
  enableStallMonitor: true,
  enableWorktrees: true,
  registerSwarmCommandAlias: true,
})

export const Config: Schema<SwarmConfig> = Schema.object({
  storageDir: Schema.string()
    .default(defaultStorageDir())
    .description('Directory for Antigravity swarm state, blackboard NDJSON logs, and plan files.'),
  maxWorkers: Schema.natural()
    .default(12)
    .min(1)
    .max(64)
    .description('Maximum concurrent live workers per swarm.'),
  maxDepth: Schema.natural()
    .default(2)
    .min(0)
    .max(6)
    .description('Maximum recursive helper depth (0 disables worker-spawned helpers).'),
  stallCheckIntervalMs: Schema.natural()
    .default(180_000)
    .min(5_000)
    .max(3_600_000)
    .description('Interval in milliseconds between automatic stall monitor sweeps.'),
  enableStallMonitor: Schema.boolean()
    .default(true)
    .description('Enable the built-in stall monitor to detect deadlocks and unanswered mentions.'),
  enableWorktrees: Schema.boolean()
    .default(true)
    .description('Use Git worktrees for share-mode workers when running inside a Git repository.'),
  registerSwarmCommandAlias: Schema.boolean()
    .default(true)
    .description('Register /swarm as the primary slash command (with /ag-swarm alias) unless /swarm is already claimed by another plugin.'),
})

export function resolveSwarmConfig(input?: Partial<SwarmConfig>): SwarmConfig {
  return {
    storageDir: typeof input?.storageDir === 'string' && input.storageDir.trim().length > 0
      ? input.storageDir
      : defaultStorageDir(),
    maxWorkers: clampInt(input?.maxWorkers, 1, 64, 12),
    maxDepth: clampInt(input?.maxDepth, 0, 6, 2),
    stallCheckIntervalMs: clampInt(input?.stallCheckIntervalMs, 5_000, 3_600_000, 180_000),
    enableStallMonitor: typeof input?.enableStallMonitor === 'boolean' ? input.enableStallMonitor : true,
    enableWorktrees: typeof input?.enableWorktrees === 'boolean' ? input.enableWorktrees : true,
    registerSwarmCommandAlias: typeof input?.registerSwarmCommandAlias === 'boolean' ? input.registerSwarmCommandAlias : true,
  }
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const n = Math.trunc(value)
  if (n < min) return min
  if (n > max) return max
  return n
}
