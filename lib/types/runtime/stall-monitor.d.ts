import type { BoardMessage, ChannelMeta, MemberRecord, SwarmConfig } from '../shared/protocol.js';
export interface MonitorSwarmView {
    swarmId: string;
    head: number;
    paused?: boolean;
    members: Record<string, MemberRecord>;
    channels: Record<string, ChannelMeta>;
    messages: BoardMessage[];
}
export interface StallDiagnosis {
    cause: 'unanswered_mention' | 'unaddressed_result' | 'waiting_chain' | 'idle_stall';
    signature: string;
    target: string;
    message: string;
}
export interface StallMonitorDeps {
    config: Pick<SwarmConfig, 'enableStallMonitor' | 'stallCheckIntervalMs'>;
    listSwarmViews: () => MonitorSwarmView[];
    postStallAlert: (swarmId: string, text: string) => Promise<void> | void;
    logger?: {
        info: (...a: unknown[]) => void;
        warn: (...a: unknown[]) => void;
        error: (...a: unknown[]) => void;
    };
}
export declare function diagnoseStall(view: MonitorSwarmView, pingedMentions: ReadonlySet<string>): StallDiagnosis | null;
export declare class SwarmStallMonitor {
    private readonly deps;
    private readonly tracks;
    private timer;
    private disposed;
    constructor(deps: StallMonitorDeps);
    start(): void;
    stop(): void;
    tick(): Promise<Array<{
        swarmId: string;
        diagnosis: StallDiagnosis;
    }>>;
    checkSwarm(view: MonitorSwarmView): Promise<StallDiagnosis | null>;
}
