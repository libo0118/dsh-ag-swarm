import type { WorkspaceMode } from '../shared/protocol.js';
import type { HostAgentLike, PluginContextLike } from '../types/dsh-host.js';
export interface PrepareWorkspaceInput {
    ctx?: PluginContextLike;
    swarmId: string;
    memberName: string;
    mode: WorkspaceMode;
    baseCwd: string;
    storageDir: string;
    enableWorktrees: boolean;
    parentAgent?: HostAgentLike;
    signal?: AbortSignal;
}
export interface PreparedWorkspace {
    mode: WorkspaceMode;
    workspace: string;
    branch?: string;
    repoRoot?: string;
    owned: boolean;
    kind: 'inherit' | 'worktree' | 'clone' | 'copy';
}
export interface CleanupWorkspaceInput {
    workspace: string;
    mode: WorkspaceMode;
    baseCwd?: string;
    repoRoot?: string;
}
export declare function detectGitRoot(dir: string, signal?: AbortSignal): Promise<string | undefined>;
export declare function sanitizeSegment(raw: string): string;
export declare function buildSwarmBranchName(swarmId: string, memberName: string): string;
export declare function prepareWorkspace(input: PrepareWorkspaceInput): Promise<PreparedWorkspace>;
export declare function cleanupWorkspace(input: CleanupWorkspaceInput): Promise<void>;
