import type { HostAgentLike, PluginContextLike } from '../types/dsh-host.js';
export declare const PLUGIN_MESSAGE_SOURCE_KIND: "plugin:dsh-ag-swarm";
export interface HostCapabilities {
    agents: {
        available: boolean;
        hasCreate: boolean;
        hasResume: boolean;
        hasGet: boolean;
    };
    subagents: {
        available: boolean;
        mode: 'rc3-activation' | 'legacy-activation' | 'legacy-start' | 'none';
        hasSendMessage: boolean;
        hasInterrupt: boolean;
        hasListDescendants: boolean;
    };
    worktrees: boolean;
    tools: boolean;
    commands: boolean;
    skills: boolean;
    webServer: boolean;
    connection: boolean;
    sessionQuery: boolean;
}
export interface SubagentStartInput {
    provider: 'spawn' | 'fork';
    label: string;
    name?: string;
    childId?: string;
    cwd?: string;
    prompt: string | Array<{
        type: string;
        text?: string;
    }>;
    parent: HostAgentLike;
    signal?: AbortSignal;
    agentOptions?: Record<string, unknown>;
    agentPreset?: string;
    outputSchema?: Record<string, unknown>;
    maxDepth?: number;
    persona?: string;
    toolFilter?: Record<string, unknown>;
}
export interface SubagentStartHandle {
    id: string;
    name?: string;
    result: Promise<Record<string, unknown>>;
    dispose: () => Promise<void> | void;
}
export interface SessionSeedSnapshot {
    events: unknown[];
    inheritedEventCount: number;
    seed: unknown[];
}
export interface UnwrappedAgentHandle {
    agent: HostAgentLike;
    dispose: () => Promise<void>;
}
export interface AdmissionResult {
    admitted: boolean;
    status: number;
    actorId: string;
    reason?: string;
}
export declare function getDshHome(ctx?: PluginContextLike): string;
export declare function detectHostCapabilities(ctx?: PluginContextLike): HostCapabilities;
export declare function boundSummary(summary: string, maxChars?: number): string;
export declare function buildPluginUserMessage(text: string, summary?: string): Record<string, unknown>;
export declare function buildUserKickoffMessage(text: string, attachments?: readonly unknown[]): Record<string, unknown>;
export interface ParentAgentInheritance {
    agentOptions: Record<string, unknown>;
    agentPreset?: string;
}
export declare function resolveParentAgentOptions(parent?: HostAgentLike): ParentAgentInheritance;
export declare function registerMessageSourceCompat(ctx?: PluginContextLike): () => void;
export declare function unwrapAgentHandle(maybeHandle: unknown): UnwrappedAgentHandle | undefined;
export declare function startSubagentCompat(ctx: PluginContextLike, input: SubagentStartInput): Promise<SubagentStartHandle>;
export declare function readSessionSeed(ctx: PluginContextLike | undefined, sessionId: string): Promise<SessionSeedSnapshot>;
export declare function selectAgentModelCompat(agent: HostAgentLike | undefined, selection: {
    provider?: string;
    model: string;
    reasoningEffort?: string;
}): Promise<boolean>;
export declare function admitHttpRequest(ctx: PluginContextLike, headers: Record<string, unknown>): Promise<AdmissionResult>;
