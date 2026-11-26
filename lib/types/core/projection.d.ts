import type { SwarmSnapshotPayload } from '../shared/protocol.js';
import type { SwarmState } from './store.js';
export interface BuildSnapshotOptions {
    etag?: string;
    tail?: number;
    since?: number;
    knownMembers?: number;
    now?: number;
    callerName?: string;
}
export declare function buildSnapshot(state: SwarmState, options?: BuildSnapshotOptions): SwarmSnapshotPayload;
