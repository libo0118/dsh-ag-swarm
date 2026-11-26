import type { BoardMessage, ChannelMeta, MemberRecord, ScreenshotFrame } from '../shared/protocol.js';
export declare const MAIN_CHANNEL = "main";
export declare const ALL_CHANNELS = "*";
export declare const SCREENSHOT_EXTENSIONS: Set<string>;
export interface ParsedMentions {
    mentions: string[];
    channel_mentions: string[];
    via_channel: string[];
    is_all: boolean;
    targets: string[];
}
export declare function validateMemberName(name: string): boolean;
export declare function assertValidMemberName(name: string): void;
export declare function validateChannelName(ch: string): boolean;
export declare function assertValidChannelName(ch: string): void;
export declare function isKilled(member: Pick<MemberRecord, 'killed' | 'state'> | undefined | null): boolean;
export declare function isControlMessage(msg: Pick<BoardMessage, 'control' | 'kind'> | undefined | null): boolean;
export declare function countsAsUnread(msg: Pick<BoardMessage, 'control' | 'kind'> | undefined | null): boolean;
export declare function isAllVisibilityMember(member: Pick<MemberRecord, 'name' | 'role' | 'channels'>): boolean;
export declare function textMentionsName(text: string, memberName: string): boolean;
export declare function textMentionsAll(text: string): boolean;
export declare function extractChannelMentions(text: string): string[];
export declare function parseMentions(text: string, members: Record<string, MemberRecord> | MemberRecord[], channels?: Record<string, ChannelMeta> | ChannelMeta[], sender?: string): ParsedMentions;
export declare function canMemberSeeMessage(member: MemberRecord, msg: BoardMessage, channels?: Record<string, ChannelMeta> | ChannelMeta[]): boolean;
export declare function doesMessageWakeMember(member: MemberRecord, msg: BoardMessage, channels?: Record<string, ChannelMeta> | ChannelMeta[]): boolean;
export declare function extractScreenshots(text: string, msg: Pick<BoardMessage, 'seq' | 'agent' | 'time' | 'ts'>): ScreenshotFrame[];
