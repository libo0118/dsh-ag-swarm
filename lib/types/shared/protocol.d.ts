export type MemberRole = 'coordinator' | 'worker' | 'monitor';
export type MemberState = 'working' | 'waiting' | 'stopped' | 'killed';
export type WakeMode = 'mentions' | 'anything' | 'working';
export type WorkspaceMode = 'inherit' | 'share' | 'branch';
export interface SwarmConfig {
    storageDir: string;
    maxWorkers: number;
    maxDepth: number;
    stallCheckIntervalMs: number;
    enableStallMonitor: boolean;
    enableWorktrees: boolean;
    registerSwarmCommandAlias: boolean;
}
export interface SwarmManifest {
    version: 1;
    backend: 'dsh';
    swarm_id: string;
    session_id: string;
    created_at: string;
}
export interface MemberRecord {
    name: string;
    conversation_id: string;
    role: MemberRole;
    state: MemberState;
    killed: boolean;
    model: string;
    provider?: string;
    model_display_name: string;
    reasoning_effort?: string;
    workspace_mode: WorkspaceMode;
    workspace: string;
    branch?: string;
    wake_mode: WakeMode;
    wait_since: number;
    last_read_seq: number;
    last_post_seq?: number;
    last_post_time?: string;
    channels: string[];
    created_by?: string;
    depth: number;
    task_hint?: string;
    activity?: string;
    activity_kind?: 'tool' | 'thinking' | 'wakeup' | 'idle' | 'error';
    steps_count?: number;
    waiting_on?: string[];
    failure?: {
        kind: 'error' | 'quota' | 'stuck';
        message: string;
        at: string;
    };
}
export interface ChannelMeta {
    name: string;
    topic?: string;
    creator: string;
    created_at: string;
    archived?: boolean;
    subscribers: string[];
}
export interface ControlPayload {
    op: 'create' | 'archive' | 'subscribe' | 'unsubscribe';
    channel: string;
    topic?: string;
    members?: string[];
    prev?: string[];
    next?: string[];
}
export interface BoardMessage {
    seq: number;
    agent: string;
    text: string;
    time: string;
    ts: number;
    channel: string;
    kind?: 'brief' | 'control' | 'done' | 'stall' | 'normal';
    mentions: string[];
    channel_mentions: string[];
    is_all: boolean;
    control?: ControlPayload;
    request_id?: string;
}
export interface PlanThread {
    id: string;
    title: string;
    goal: string;
    tasks: string[];
}
export interface PlanFile {
    goal: {
        title: string;
        line: string;
    };
    tasks: Record<string, string>;
    threads: PlanThread[];
}
export interface ScreenshotFrame {
    path: string;
    seq: number;
    agent: string;
    caption: string;
    time: string;
    ts: number;
}
export type ThreadPriorityState = 'needs' | 'waiting' | 'stuck' | 'running' | 'queued' | 'done';
export interface ThreadView {
    id: string;
    title: string;
    goal: string;
    state: ThreadPriorityState;
    now?: string;
    tasks: Array<{
        name: string;
        label: string;
        state: MemberState;
        done: boolean;
        activity?: string;
        waiting_on?: string[];
        failure?: string;
    }>;
    progress: {
        done: number;
        total: number;
    };
}
export interface EdgeView {
    from: string;
    to: string;
    count: number;
    kind: 'direct' | 'channel' | 'all';
    lastSeq: number;
    lastTime: string;
}
export interface AttentionItem {
    id: string;
    kind: 'error' | 'quota' | 'stuck' | 'stall';
    severity: 'high' | 'med';
    member: string;
    title: string;
    detail: string;
    seq?: number;
}
export interface SwarmSnapshotPayload {
    swarm_id: string;
    session_id: string;
    title: string;
    etag: string;
    unchanged?: boolean;
    delta?: boolean;
    head: number;
    messagesOffset: number;
    messages: BoardMessage[];
    pinnedMessages: BoardMessage[];
    members: Record<string, MemberRecord>;
    channels: Record<string, ChannelMeta>;
    plan: PlanFile | null;
    threads: ThreadView[];
    edges: EdgeView[];
    frames: ScreenshotFrame[];
    systemAttention: AttentionItem[];
    stallBanner: {
        seq: number;
        agent: string;
        text: string;
        time: string;
    } | null;
    stats: {
        totalTasks: number;
        doneTasks: number;
        workingCount: number;
        waitingCount: number;
        stuckCount: number;
        errorCount: number;
    };
    unseen: number;
    created_at: string;
    updated_at: string;
}
export interface SwarmSummary {
    swarm_id: string;
    session_id: string;
    title: string;
    head: number;
    workingCount: number;
    memberCount: number;
    doneCount: number;
    updated_at: string;
}
export interface TranscriptStepView {
    index: number;
    kind: 'user' | 'assistant' | 'tool' | 'thinking' | 'error' | 'model';
    title: string;
    detail?: string;
    time?: string;
    status?: 'ok' | 'running' | 'error';
}
export interface MemberTranscriptPayload {
    swarm_id: string;
    member: string;
    conversation_id: string;
    model: string;
    workspace_mode: WorkspaceMode;
    workspace: string;
    branch?: string;
    steps: TranscriptStepView[];
}
export interface RawFilesPayload {
    swarm_id: string;
    storage_path: string;
    files: Array<{
        name: 'swarm.json' | 'members.json' | 'board.jsonl' | 'plan.json';
        path: string;
        bytes: number;
        lines: number;
        content: string;
    }>;
}
export type UiActionRequest = {
    action: 'post_message';
    swarmId: string;
    text: string;
    channel?: string;
    asAgent?: string;
} | {
    action: 'switch_model';
    swarmId: string;
    member: string;
    model: string;
    provider?: string;
    reasoningEffort?: string;
} | {
    action: 'kill_worker';
    swarmId: string;
    member: string;
} | {
    action: 'nudge_worker';
    swarmId: string;
    member: string;
    text?: string;
} | {
    action: 'create_channel';
    swarmId: string;
    channel: string;
    topic?: string;
} | {
    action: 'archive_channel';
    swarmId: string;
    channel: string;
} | {
    action: 'update_plan';
    swarmId: string;
    plan: PlanFile;
} | {
    action: 'seed_demo';
    sessionId?: string;
};
export interface SseEventPayload {
    type: 'connected' | 'swarm_update' | 'ping';
    swarmId?: string;
    sessionId?: string;
    etag?: string;
    reason?: string;
}
export declare const BUILTIN_MODEL_ROLES: readonly ["default", "explorer", "author", "verifier", "monitor"];
export type BuiltinModelRole = (typeof BUILTIN_MODEL_ROLES)[number];
export interface RoleModelPreset {
    provider?: string;
    model: string;
    reasoningEffort?: string;
    label?: string;
}
export type RoleModelMap = Record<string, RoleModelPreset>;
export interface ConfigPayload extends SwarmConfig {
    waitToolName: string;
    primaryCommand: string;
    modelPresets: RoleModelMap;
}
