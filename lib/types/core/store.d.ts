import { EventEmitter } from 'node:events';
import type { BoardMessage, ChannelMeta, MemberRecord, MemberRole, MemberState, PlanFile, RawFilesPayload, SwarmManifest, SwarmSummary, WakeMode, WorkspaceMode } from '../shared/protocol.js';
export interface SwarmState {
    manifest: SwarmManifest;
    swarm_id: string;
    session_id: string;
    title: string;
    base_workspace: string;
    created_at: string;
    updated_at: string;
    head: number;
    etag: string;
    members: Record<string, MemberRecord>;
    channels: Record<string, ChannelMeta>;
    messages: BoardMessage[];
    plan: PlanFile | null;
    storage_path: string;
}
export interface SwarmUpdateEvent {
    swarmId: string;
    sessionId: string;
    etag: string;
    reason: string;
}
export interface AddMemberInput {
    name: string;
    conversation_id?: string;
    role?: MemberRole;
    state?: MemberState;
    model?: string;
    provider?: string;
    model_display_name?: string;
    reasoning_effort?: string;
    workspace_mode?: WorkspaceMode;
    workspace?: string;
    branch?: string;
    wake_mode?: WakeMode;
    wait_since?: number;
    last_read_seq?: number;
    channels?: string[];
    created_by?: string;
    depth?: number;
    task_hint?: string;
}
export interface AppendMessageInput {
    agent: string;
    text: string;
    channel?: string;
    kind?: BoardMessage['kind'];
    request_id?: string;
}
export interface ReadBoardOptions {
    since?: number;
    limit?: number;
    seqs?: number[];
    channel?: string;
    callerName?: string;
}
export interface ReadBoardResult {
    messages: BoardMessage[];
    head: number;
    truncated: boolean;
}
export interface ReadBeforeSeqOptions {
    beforeSeq: number;
    limit?: number;
    fromSeq?: number;
}
export interface ReadBeforeSeqResult {
    messages: BoardMessage[];
    hasMore: boolean;
    offset: number;
    total: number;
}
export declare class SwarmStore extends EventEmitter {
    private readonly storageDir;
    private readonly swarms;
    private readonly sessionIndex;
    private readonly versions;
    constructor(storageDir: string);
    private swarmDir;
    private loadAllFromDisk;
    private requireSwarm;
    private bumpAndEmit;
    private persistMeta;
    private persistMembers;
    createOrGetSwarm(sessionId: string, title?: string, baseWorkspace?: string): SwarmState;
    getSwarm(swarmId: string): SwarmState | undefined;
    getSwarmBySession(sessionId: string): SwarmState | undefined;
    listSwarms(): SwarmSummary[];
    setTitle(swarmId: string, title: string): SwarmState;
    addMember(swarmId: string, input: AddMemberInput): MemberRecord;
    updateMember(swarmId: string, name: string, patch: Partial<MemberRecord>): MemberRecord;
    killMember(swarmId: string, name: string): MemberRecord;
    private appendControlMessage;
    createChannel(swarmId: string, options: {
        channel: string;
        topic?: string;
        creator?: string;
        subscribers?: string[];
    }): {
        channel: ChannelMeta;
        message: BoardMessage;
    };
    archiveChannel(swarmId: string, options: {
        channel: string;
        actor?: string;
    }): {
        channel: ChannelMeta;
        message: BoardMessage;
    };
    subscribeChannel(swarmId: string, options: {
        channel: string;
        members: string[];
        actor?: string;
    }): {
        channel: ChannelMeta;
        message: BoardMessage;
    };
    unsubscribeChannel(swarmId: string, options: {
        channel: string;
        members: string[];
        actor?: string;
    }): {
        channel: ChannelMeta;
        message: BoardMessage;
    };
    appendMessage(swarmId: string, input: AppendMessageInput): BoardMessage;
    readBoard(swarmId: string, options?: ReadBoardOptions): ReadBoardResult;
    readBeforeSeq(swarmId: string, options: ReadBeforeSeqOptions): ReadBeforeSeqResult;
    writePlan(swarmId: string, plan: PlanFile): PlanFile;
    getRawFiles(swarmId: string): RawFilesPayload;
}
