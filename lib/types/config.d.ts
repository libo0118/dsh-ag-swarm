import Schema from '@deepseek-ai/schemastery';
import type { SwarmConfig } from './shared/protocol.js';
export type { SwarmConfig };
export declare const PLUGIN_VERSION = "0.1.6";
export declare function defaultStorageDir(): string;
export declare const DEFAULT_SWARM_CONFIG: Readonly<SwarmConfig>;
export declare const Config: Schema<SwarmConfig>;
export declare function resolveSwarmConfig(input?: Partial<SwarmConfig>): SwarmConfig;
