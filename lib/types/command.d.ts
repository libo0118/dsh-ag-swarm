import type { PluginContextLike } from './types/dsh-host.js';
import type { SwarmConfig } from './shared/protocol.js';
import type { SwarmStore } from './core/store.js';
import type { WorkerPool } from './runtime/worker-pool.js';
export interface AgSwarmCommandResult {
    kind: 'success' | 'error';
    text: string;
}
export interface RegisteredCommandHandle {
    dispose: () => void;
    primaryCommand: string;
}
export declare function handleAgSwarmCommand(store: SwarmStore, pool: WorkerPool, rawInput: string, agent?: unknown): Promise<AgSwarmCommandResult>;
export declare function registerSwarmCommand(ctx: PluginContextLike, store: SwarmStore, pool: WorkerPool, config: Pick<SwarmConfig, 'registerSwarmCommandAlias'>): RegisteredCommandHandle;
