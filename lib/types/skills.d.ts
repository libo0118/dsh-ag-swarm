import type { PluginContextLike } from './types/dsh-host.js';
export declare const COORDINATOR_SKILL_NAME = "ag-swarm-coordinator";
export declare const WORKER_SKILL_NAME = "ag-swarm-worker";
export declare function registerSwarmSkills(ctx: PluginContextLike): () => void;
