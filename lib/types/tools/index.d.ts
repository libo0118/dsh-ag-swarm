import type { SwarmStore } from '../core/store.js';
import type { WorkerPool } from '../runtime/worker-pool.js';
import type { PluginContextLike } from '../types/dsh-host.js';
export interface RegisteredToolsHandle {
    dispose: () => void;
    registeredNames: {
        swarm: string;
        post_message: string;
        read_board: string;
        swarm_wait: string;
    };
}
export declare function registerSwarmTools(ctx: PluginContextLike, store: SwarmStore, pool: WorkerPool): RegisteredToolsHandle;
