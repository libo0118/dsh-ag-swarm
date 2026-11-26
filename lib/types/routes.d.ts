import type { SwarmConfig } from './shared/protocol.js';
import type { SwarmStore } from './core/store.js';
import type { WorkerPool } from './runtime/worker-pool.js';
import type { PluginContextLike } from './types/dsh-host.js';
export declare const AG_SWARM_ROUTE_PREFIX = "/ag-swarm";
export interface SwarmRoutesOptions {
    config?: SwarmConfig;
    getWaitToolName?: () => string;
    getPrimaryCommand?: () => string;
}
export declare function registerSwarmRoutes(ctx: PluginContextLike, store: SwarmStore, pool: WorkerPool, options?: SwarmRoutesOptions): () => void;
