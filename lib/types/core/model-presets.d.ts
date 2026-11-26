import type { RoleModelMap } from '../shared/protocol.js';
export interface ResolveWorkerModelInput {
    explicitModel?: string;
    explicitProvider?: string;
    explicitEffort?: string;
    rolePreset?: string;
    workerName: string;
    presets: RoleModelMap;
}
export interface ResolvedWorkerModel {
    model: string;
    provider?: string;
    reasoningEffort?: string;
    label?: string;
    source: 'explicit' | 'role_preset' | 'name_match' | 'inferred_role' | 'default';
    matchedRole?: string;
}
export declare function sanitizeRoleModelMap(raw: unknown): RoleModelMap;
export declare function inferBuiltinRoleFromName(workerName: string): 'explorer' | 'verifier' | 'monitor' | 'author' | undefined;
export declare function resolveModelForWorker(input: ResolveWorkerModelInput): ResolvedWorkerModel | undefined;
export declare class ModelPresetStore {
    private readonly filePath;
    private presets;
    constructor(storageDir: string);
    private loadFromDisk;
    getAll(): RoleModelMap;
    setAll(raw: unknown): RoleModelMap;
}
