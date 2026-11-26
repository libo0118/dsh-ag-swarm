import type { BoardMessage, CatalogEffortOption, MemberRecord, MemberTranscriptPayload, RoleModelMap, SwarmConfig, WorkspaceMode } from '../shared/protocol.js';
import type { SwarmState, SwarmStore } from '../core/store.js';
import type { HostAgentLike, PluginContextLike } from '../types/dsh-host.js';
export interface AddWorkersInput {
    swarmId: string;
    callerName: string;
    callerAgent?: HostAgentLike;
    name: string;
    brief: string;
    n?: number;
    tasks?: string[];
    fork?: string;
    workspace?: WorkspaceMode;
    model?: string;
    provider?: string;
    reasoning_effort?: string;
    role_preset?: string;
    signal?: AbortSignal;
}
export interface WaitBoardInput {
    swarmId: string;
    callerName: string;
    since: number;
    mentions_only?: boolean;
    timeout_ms?: number;
    agent?: HostAgentLike;
    signal?: AbortSignal;
}
export interface WaitBoardResult {
    status: 'messages' | 'waiting' | 'all_idle' | 'interrupted' | 'timeout';
    reason?: string;
    head: number;
    timedOut: boolean;
    messages?: BoardMessage[];
    wake_mode?: 'mentions' | 'anything';
    since?: number;
    note?: string;
    worker_summary?: Array<{
        name: string;
        state: MemberRecord['state'];
        steps_count?: number;
        activity?: string;
        last_post_seq?: number;
    }>;
}
export interface SwitchModelInput {
    swarmId: string;
    callerName: string;
    targetName: string;
    model: string;
    provider?: string;
    reasoning_effort?: string;
}
export interface CatalogModelInfo {
    provider: string;
    model: string;
    label: string;
    efforts?: CatalogEffortOption[];
    defaultEffort?: string;
    reasoningKnown?: boolean;
}
export declare class WorkerPool {
    private readonly ctx;
    private readonly store;
    private readonly config;
    private readonly liveHandles;
    private readonly sessionIndex;
    private readonly pendingWakeups;
    private readonly eventDisposers;
    private readonly lifetime;
    private readonly modelPresets;
    private disposed;
    constructor(ctx: PluginContextLike, store: SwarmStore, config: SwarmConfig);
    getModelPresets(): RoleModelMap;
    setModelPresets(next: unknown): RoleModelMap;
    getModelCatalogWithPresets(): Promise<{
        models: CatalogModelInfo[];
        role_presets: RoleModelMap;
    }>;
    private rebuildSessionIndex;
    private reconcileStaleStateOnStartup;
    cancelActiveWorkers(swarmId: string, reason?: string): Promise<string[]>;
    private installHostListeners;
    ensureSwarmForSession(sessionId: string, title?: string, baseWorkspace?: string, agent?: HostAgentLike): SwarmState;
    private syncCoordinatorFromAgent;
    resolveCaller(agent?: HostAgentLike, explicitSwarmId?: string): {
        swarm: SwarmState;
        member: MemberRecord;
        callerName: string;
        sessionId: string;
        cwd: string;
    };
    getRosterStatus(swarmId: string): {
        swarm_id: string;
        title: string;
        head: number;
        channels: {
            name: string;
            topic: string | undefined;
            archived: boolean;
            subscribers: string[];
        }[];
        members: {
            name: string;
            role: import("../shared/protocol.js").MemberRole;
            state: import("../shared/protocol.js").MemberState;
            model: string;
            provider: string | undefined;
            workspace_mode: WorkspaceMode;
            workspace: string;
            branch: string | undefined;
            wake_mode: import("../shared/protocol.js").WakeMode;
            wait_since: number;
            last_read_seq: number;
            last_post_seq: number | undefined;
            last_post_time: string | undefined;
            channels: string[];
            created_by: string | undefined;
            depth: number;
            activity: string | undefined;
            failure: {
                kind: "error" | "quota" | "stuck";
                message: string;
                at: string;
            } | undefined;
        }[];
    };
    addWorkers(input: AddWorkersInput): Promise<MemberRecord[]>;
    private spawnSingleWorker;
    postMessage(swarmId: string, input: {
        agent: string;
        text: string;
        channel?: string;
        kind?: BoardMessage['kind'];
        request_id?: string;
    }): Promise<{
        message: BoardMessage;
        woken: string[];
    }>;
    private deliverDoorbell;
    private flushPendingWakeups;
    private wakeMemberWithItems;
    waitForBoard(input: WaitBoardInput): Promise<WaitBoardResult>;
    switchModel(input: SwitchModelInput): Promise<MemberRecord>;
    killMember(swarmId: string, callerName: string, targetName: string): Promise<void>;
    nudgeMember(swarmId: string, memberName: string, text?: string): Promise<{
        message: BoardMessage;
        woken: string[];
    }>;
    manageChannel(swarmId: string, callerName: string, input: {
        op: 'create' | 'archive' | 'subscribe' | 'unsubscribe';
        channel: string;
        topic?: string;
        members?: string[];
    }): {
        channel: import("../shared/protocol.js").ChannelMeta;
        message: BoardMessage;
    };
    private sanitizeReasoningEffort;
    listModels(): Promise<CatalogModelInfo[]>;
    getMemberTranscript(swarmId: string, memberName: string): Promise<MemberTranscriptPayload>;
    kickoffCoordinator(agent: HostAgentLike | undefined, swarmId: string, goal: string, attachments?: readonly unknown[]): Promise<{
        dispatched: boolean;
        method?: 'followup' | 'steer';
    }>;
    dispose(): Promise<void>;
}
