import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { assertValidChannelName, assertValidMemberName, canMemberSeeMessage, isControlMessage, isKilled, MAIN_CHANNEL, parseMentions, } from './channels.js';
const WIN_RETRY_CODES = new Set(['EPERM', 'EACCES', 'EBUSY', 'ENOTEMPTY']);
function atomicWriteFileSync(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2, 8)}.tmp`;
    fs.writeFileSync(tmp, content, 'utf-8');
    let lastErr;
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            fs.renameSync(tmp, filePath);
            return;
        }
        catch (err) {
            lastErr = err;
            const code = err?.code;
            if (!code || !WIN_RETRY_CODES.has(code))
                break;
            const until = Date.now() + 15 * (attempt + 1);
            while (Date.now() < until) {
                // brief retry window for Windows file locks
            }
        }
    }
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
        try {
            fs.unlinkSync(tmp);
        }
        catch {
            // ignore cleanup failure
        }
        return;
    }
    catch {
        try {
            fs.unlinkSync(tmp);
        }
        catch {
            // ignore cleanup failure
        }
        throw lastErr;
    }
}
function readJsonSafe(filePath) {
    try {
        if (!fs.existsSync(filePath))
            return null;
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    catch {
        return null;
    }
}
function parseBoardJsonl(content) {
    const out = [];
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed && typeof parsed === 'object' && typeof parsed.seq === 'number') {
                out.push({
                    ...parsed,
                    channel: parsed.channel || MAIN_CHANNEL,
                    mentions: Array.isArray(parsed.mentions) ? parsed.mentions : [],
                    channel_mentions: Array.isArray(parsed.channel_mentions) ? parsed.channel_mentions : [],
                    is_all: Boolean(parsed.is_all),
                });
            }
        }
        catch {
            // skip torn or invalid trailing line
        }
    }
    return out;
}
function makeEtag(swarmId, head, version, updatedAt) {
    const hash = crypto
        .createHash('sha1')
        .update(`${swarmId}:${head}:${version}:${updatedAt}`)
        .digest('hex')
        .slice(0, 12);
    return `"${head}-${version}-${hash}"`;
}
function inferMessageKind(text, explicit) {
    if (explicit)
        return explicit;
    if (/\[done\]/i.test(text))
        return 'done';
    if (/\[stall\]/i.test(text))
        return 'stall';
    return 'normal';
}
function rebuildChannelsFromMessages(existing, messages, members) {
    const channels = {};
    for (const [k, v] of Object.entries(existing)) {
        channels[k] = { ...v, subscribers: Array.isArray(v.subscribers) ? [...v.subscribers] : [] };
    }
    for (const msg of messages) {
        const ctrl = msg.control;
        if (!ctrl || !ctrl.channel)
            continue;
        if (ctrl.op === 'create' && !channels[ctrl.channel]) {
            channels[ctrl.channel] = {
                name: ctrl.channel,
                topic: ctrl.topic,
                creator: msg.agent,
                created_at: msg.time,
                archived: false,
                subscribers: Array.isArray(ctrl.members) ? [...ctrl.members] : [],
            };
        }
        else if (ctrl.op === 'archive' && channels[ctrl.channel]) {
            channels[ctrl.channel].archived = true;
        }
        else if ((ctrl.op === 'subscribe' || ctrl.op === 'unsubscribe') && channels[ctrl.channel]) {
            if (Array.isArray(ctrl.next)) {
                channels[ctrl.channel].subscribers = [...ctrl.next];
            }
        }
    }
    for (const ch of Object.values(channels)) {
        for (const name of ch.subscribers) {
            const m = members[name];
            if (m && !m.channels.includes(ch.name))
                m.channels.push(ch.name);
        }
    }
    return channels;
}
export class SwarmStore extends EventEmitter {
    storageDir;
    swarms = new Map();
    sessionIndex = new Map();
    versions = new Map();
    constructor(storageDir) {
        super();
        this.storageDir = path.resolve(storageDir);
        fs.mkdirSync(this.storageDir, { recursive: true });
        this.loadAllFromDisk();
    }
    swarmDir(swarmId) {
        return path.join(this.storageDir, swarmId);
    }
    loadAllFromDisk() {
        let entries;
        try {
            entries = fs.readdirSync(this.storageDir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            const dir = path.join(this.storageDir, entry.name);
            const meta = readJsonSafe(path.join(dir, 'swarm.json'));
            if (!meta || !meta.swarm_id)
                continue;
            const rawMembers = readJsonSafe(path.join(dir, 'members.json'));
            const members = rawMembers && 'members' in rawMembers && typeof rawMembers.members === 'object' && !('role' in rawMembers)
                ? { ...rawMembers.members }
                : rawMembers && typeof rawMembers === 'object'
                    ? { ...rawMembers }
                    : {};
            const diskChannels = rawMembers && 'channels' in rawMembers && typeof rawMembers.channels === 'object' && !('role' in rawMembers)
                ? { ...rawMembers.channels }
                : {};
            const boardPath = path.join(dir, 'board.jsonl');
            const messages = fs.existsSync(boardPath) ? parseBoardJsonl(fs.readFileSync(boardPath, 'utf-8')) : [];
            const channels = rebuildChannelsFromMessages(diskChannels, messages, members);
            const plan = readJsonSafe(path.join(dir, 'plan.json'));
            const head = messages.reduce((acc, m) => Math.max(acc, m.seq), 0);
            const updatedAt = meta.updated_at || messages[messages.length - 1]?.time || meta.created_at;
            const version = 1;
            const manifest = {
                version: 1,
                backend: 'dsh',
                swarm_id: meta.swarm_id,
                session_id: meta.session_id,
                created_at: meta.created_at,
            };
            const state = {
                manifest,
                swarm_id: meta.swarm_id,
                session_id: meta.session_id,
                title: meta.title || (rawMembers && 'title' in rawMembers && typeof rawMembers.title === 'string' ? rawMembers.title : ''),
                base_workspace: meta.base_workspace || '',
                created_at: meta.created_at,
                updated_at: updatedAt,
                head,
                etag: makeEtag(meta.swarm_id, head, version, updatedAt),
                members,
                channels,
                messages,
                plan,
                storage_path: dir,
            };
            this.swarms.set(state.swarm_id, state);
            this.sessionIndex.set(state.session_id, state.swarm_id);
            this.versions.set(state.swarm_id, version);
        }
    }
    requireSwarm(swarmId) {
        const state = this.swarms.get(swarmId);
        if (!state)
            throw new Error(`Swarm not found: ${swarmId}`);
        return state;
    }
    bumpAndEmit(state, reason) {
        const nextVersion = (this.versions.get(state.swarm_id) ?? 0) + 1;
        this.versions.set(state.swarm_id, nextVersion);
        state.etag = makeEtag(state.swarm_id, state.head, nextVersion, state.updated_at);
        const event = {
            swarmId: state.swarm_id,
            sessionId: state.session_id,
            etag: state.etag,
            reason,
        };
        this.emit('update', event);
    }
    persistMeta(state) {
        const meta = {
            ...state.manifest,
            title: state.title,
            base_workspace: state.base_workspace,
            updated_at: state.updated_at,
        };
        atomicWriteFileSync(path.join(state.storage_path, 'swarm.json'), JSON.stringify(meta, null, 2) + '\n');
    }
    persistMembers(state) {
        const payload = {
            title: state.title,
            members: state.members,
            channels: state.channels,
        };
        atomicWriteFileSync(path.join(state.storage_path, 'members.json'), JSON.stringify(payload, null, 2) + '\n');
    }
    createOrGetSwarm(sessionId, title, baseWorkspace) {
        const existingId = this.sessionIndex.get(sessionId);
        if (existingId) {
            const existing = this.swarms.get(existingId);
            if (existing) {
                let changed = false;
                if (title && !existing.title) {
                    existing.title = title;
                    changed = true;
                }
                if (baseWorkspace && !existing.base_workspace) {
                    existing.base_workspace = baseWorkspace;
                    if (existing.members.coordinator && !existing.members.coordinator.workspace) {
                        existing.members.coordinator.workspace = baseWorkspace;
                    }
                    changed = true;
                }
                if (changed) {
                    existing.updated_at = new Date().toISOString();
                    this.persistMeta(existing);
                    this.persistMembers(existing);
                    this.bumpAndEmit(existing, 'swarm_updated');
                }
                return existing;
            }
        }
        const now = new Date().toISOString();
        const swarmId = `swarm-${crypto.randomUUID().slice(0, 12)}`;
        const dir = this.swarmDir(swarmId);
        fs.mkdirSync(dir, { recursive: true });
        const manifest = { version: 1, backend: 'dsh', swarm_id: swarmId, session_id: sessionId, created_at: now };
        const coordinator = {
            name: 'coordinator',
            conversation_id: sessionId,
            role: 'coordinator',
            state: 'waiting',
            killed: false,
            model: 'default',
            model_display_name: 'Default',
            workspace_mode: 'inherit',
            workspace: baseWorkspace || '',
            wake_mode: 'mentions',
            wait_since: 0,
            last_read_seq: 0,
            channels: [],
            depth: 0,
        };
        const state = {
            manifest, swarm_id: swarmId, session_id: sessionId, title: title || '',
            base_workspace: baseWorkspace || '', created_at: now, updated_at: now,
            head: 0, etag: '', members: { coordinator }, channels: {}, messages: [], plan: null, storage_path: dir,
        };
        this.swarms.set(swarmId, state);
        this.sessionIndex.set(sessionId, swarmId);
        this.persistMeta(state);
        this.persistMembers(state);
        this.bumpAndEmit(state, 'swarm_created');
        return state;
    }
    getSwarm(swarmId) {
        return this.swarms.get(swarmId);
    }
    getSwarmBySession(sessionId) {
        const id = this.sessionIndex.get(sessionId);
        return id ? this.swarms.get(id) : undefined;
    }
    listSwarms() {
        const out = [];
        for (const s of this.swarms.values()) {
            const doneAgents = new Set();
            for (const m of s.messages) {
                if (!isControlMessage(m) && (m.kind === 'done' || /\[done\]/i.test(m.text))) {
                    doneAgents.add(m.agent);
                }
            }
            const members = Object.values(s.members);
            const activeMembers = members.filter((m) => !isKilled(m));
            const workingCount = activeMembers.filter((m) => m.state === 'working').length;
            const doneCount = members.filter((m) => m.role === 'worker' && doneAgents.has(m.name) && m.state !== 'working').length;
            out.push({
                swarm_id: s.swarm_id,
                session_id: s.session_id,
                title: s.title,
                head: s.head,
                workingCount,
                memberCount: activeMembers.length,
                doneCount,
                updated_at: s.updated_at,
            });
        }
        return out.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    }
    setTitle(swarmId, title) {
        const state = this.requireSwarm(swarmId);
        state.title = String(title ?? '').trim();
        state.updated_at = new Date().toISOString();
        this.persistMeta(state);
        this.persistMembers(state);
        this.bumpAndEmit(state, 'title');
        return state;
    }
    addMember(swarmId, input) {
        const state = this.requireSwarm(swarmId);
        const isCoordinator = input.name === 'coordinator' && (!input.role || input.role === 'coordinator');
        if (!isCoordinator) {
            assertValidMemberName(input.name);
            if (state.members[input.name]) {
                throw new Error(`Member "${input.name}" already exists (killed names cannot be reused)`);
            }
        }
        const existing = isCoordinator ? state.members.coordinator : undefined;
        const channels = [...new Set((input.channels ?? existing?.channels ?? []).filter(Boolean))];
        const record = {
            name: input.name,
            conversation_id: input.conversation_id ?? existing?.conversation_id ?? `${state.swarm_id}:${input.name}`,
            role: input.role ?? existing?.role ?? 'worker',
            state: input.state ?? existing?.state ?? 'working',
            killed: false,
            model: input.model ?? existing?.model ?? 'default',
            provider: input.provider ?? existing?.provider,
            model_display_name: input.model_display_name ?? existing?.model_display_name ?? input.model ?? 'Default',
            reasoning_effort: input.reasoning_effort ?? existing?.reasoning_effort,
            workspace_mode: input.workspace_mode ?? existing?.workspace_mode ?? 'inherit',
            workspace: input.workspace ?? existing?.workspace ?? state.base_workspace,
            branch: input.branch ?? existing?.branch,
            wake_mode: input.wake_mode ?? existing?.wake_mode ?? 'mentions',
            wait_since: input.wait_since ?? existing?.wait_since ?? state.head,
            last_read_seq: input.last_read_seq ?? existing?.last_read_seq ?? 0,
            last_post_seq: existing?.last_post_seq,
            last_post_time: existing?.last_post_time,
            channels,
            created_by: input.created_by ?? existing?.created_by,
            depth: input.depth ?? existing?.depth ?? (isCoordinator ? 0 : 1),
            task_hint: input.task_hint ?? existing?.task_hint,
        };
        state.members[record.name] = record;
        for (const chName of channels) {
            const ch = state.channels[chName];
            if (ch && !ch.archived && !ch.subscribers.includes(record.name)) {
                ch.subscribers.push(record.name);
            }
        }
        state.updated_at = new Date().toISOString();
        this.persistMeta(state);
        this.persistMembers(state);
        this.bumpAndEmit(state, 'member_added');
        return record;
    }
    updateMember(swarmId, name, patch) {
        const state = this.requireSwarm(swarmId);
        const member = state.members[name];
        if (!member)
            throw new Error(`Member not found: ${name}`);
        const updated = { ...member, ...patch, name: member.name };
        if (patch.killed === true || patch.state === 'killed') {
            updated.killed = true;
            updated.state = 'killed';
        }
        state.members[name] = updated;
        state.updated_at = new Date().toISOString();
        this.persistMeta(state);
        this.persistMembers(state);
        this.bumpAndEmit(state, 'member_updated');
        return updated;
    }
    killMember(swarmId, name) {
        const state = this.requireSwarm(swarmId);
        if (name === 'coordinator')
            throw new Error('Cannot kill coordinator');
        const member = state.members[name];
        if (!member)
            throw new Error(`Member not found: ${name}`);
        member.killed = true;
        member.state = 'killed';
        member.waiting_on = undefined;
        member.activity = undefined;
        member.activity_kind = 'idle';
        state.updated_at = new Date().toISOString();
        this.persistMeta(state);
        this.persistMembers(state);
        this.bumpAndEmit(state, 'member_killed');
        return member;
    }
    appendControlMessage(state, agent, channel, text, control) {
        const ts = Date.now();
        const time = new Date(ts).toISOString();
        const seq = state.head + 1;
        const msg = {
            seq,
            agent,
            text,
            time,
            ts,
            channel,
            kind: 'control',
            mentions: [],
            channel_mentions: [],
            is_all: false,
            control,
        };
        fs.appendFileSync(path.join(state.storage_path, 'board.jsonl'), JSON.stringify(msg) + '\n', 'utf-8');
        state.messages.push(msg);
        state.head = seq;
        state.updated_at = time;
        return msg;
    }
    createChannel(swarmId, options) {
        const state = this.requireSwarm(swarmId);
        assertValidChannelName(options.channel);
        if (state.channels[options.channel]) {
            throw new Error(`Channel "#${options.channel}" already exists`);
        }
        const creator = options.creator || 'coordinator';
        const now = new Date().toISOString();
        const subscribers = [...new Set((options.subscribers ?? []).filter((n) => Boolean(state.members[n])))];
        const meta = {
            name: options.channel,
            topic: options.topic,
            creator,
            created_at: now,
            archived: false,
            subscribers,
        };
        state.channels[options.channel] = meta;
        for (const name of subscribers) {
            const m = state.members[name];
            if (m && !m.channels.includes(options.channel))
                m.channels.push(options.channel);
        }
        const text = options.topic ? `created #${options.channel}: ${options.topic}` : `created #${options.channel}`;
        const message = this.appendControlMessage(state, creator, options.channel, text, {
            op: 'create',
            channel: options.channel,
            topic: options.topic,
            members: [...subscribers],
        });
        this.persistMeta(state);
        this.persistMembers(state);
        this.bumpAndEmit(state, 'channel_created');
        return { channel: meta, message };
    }
    archiveChannel(swarmId, options) {
        const state = this.requireSwarm(swarmId);
        if (options.channel === MAIN_CHANNEL)
            throw new Error('Cannot archive main channel');
        const ch = state.channels[options.channel];
        if (!ch)
            throw new Error(`Channel "#${options.channel}" not found`);
        ch.archived = true;
        const actor = options.actor || 'coordinator';
        const message = this.appendControlMessage(state, actor, options.channel, `archived #${options.channel}`, {
            op: 'archive',
            channel: options.channel,
        });
        this.persistMeta(state);
        this.persistMembers(state);
        this.bumpAndEmit(state, 'channel_archived');
        return { channel: ch, message };
    }
    subscribeChannel(swarmId, options) {
        const state = this.requireSwarm(swarmId);
        const ch = state.channels[options.channel];
        if (!ch)
            throw new Error(`Channel "#${options.channel}" not found`);
        if (ch.archived)
            throw new Error(`Channel "#${options.channel}" is archived`);
        const prev = [...ch.subscribers];
        const targetMembers = [...new Set(options.members.filter((n) => Boolean(state.members[n])))];
        for (const name of targetMembers) {
            if (!ch.subscribers.includes(name))
                ch.subscribers.push(name);
            const m = state.members[name];
            if (m && !m.channels.includes(options.channel))
                m.channels.push(options.channel);
        }
        const next = [...ch.subscribers];
        const actor = options.actor || 'coordinator';
        const text = `subscribed ${targetMembers.map((m) => `@${m}`).join(', ')} to #${options.channel}`;
        const message = this.appendControlMessage(state, actor, options.channel, text, {
            op: 'subscribe',
            channel: options.channel,
            members: targetMembers,
            prev,
            next,
        });
        this.persistMeta(state);
        this.persistMembers(state);
        this.bumpAndEmit(state, 'channel_subscribed');
        return { channel: ch, message };
    }
    unsubscribeChannel(swarmId, options) {
        const state = this.requireSwarm(swarmId);
        const ch = state.channels[options.channel];
        if (!ch)
            throw new Error(`Channel "#${options.channel}" not found`);
        const prev = [...ch.subscribers];
        const removeSet = new Set(options.members);
        const targetMembers = [...removeSet].filter((n) => Boolean(state.members[n]));
        ch.subscribers = ch.subscribers.filter((n) => !removeSet.has(n));
        for (const name of targetMembers) {
            const m = state.members[name];
            if (m)
                m.channels = m.channels.filter((c) => c !== options.channel);
        }
        const next = [...ch.subscribers];
        const actor = options.actor || 'coordinator';
        const text = `unsubscribed ${targetMembers.map((m) => `@${m}`).join(', ')} from #${options.channel}`;
        const message = this.appendControlMessage(state, actor, options.channel, text, {
            op: 'unsubscribe',
            channel: options.channel,
            members: targetMembers,
            prev,
            next,
        });
        this.persistMeta(state);
        this.persistMembers(state);
        this.bumpAndEmit(state, 'channel_unsubscribed');
        return { channel: ch, message };
    }
    appendMessage(swarmId, input) {
        const state = this.requireSwarm(swarmId);
        const channel = input.channel || MAIN_CHANNEL;
        if (channel !== MAIN_CHANNEL) {
            const ch = state.channels[channel];
            if (!ch)
                throw new Error(`Channel "#${channel}" does not exist`);
            if (ch.archived)
                throw new Error(`Channel "#${channel}" is archived`);
        }
        const ts = Date.now();
        const time = new Date(ts).toISOString();
        const seq = state.head + 1;
        const kind = inferMessageKind(input.text, input.kind);
        const parsed = kind === 'control' ? null : parseMentions(input.text, state.members, state.channels, input.agent);
        const msg = {
            seq,
            agent: input.agent,
            text: input.text,
            time,
            ts,
            channel,
            kind,
            mentions: parsed ? parsed.mentions : [],
            channel_mentions: parsed ? parsed.channel_mentions : [],
            is_all: parsed ? parsed.is_all : false,
            ...(input.request_id ? { request_id: input.request_id } : {}),
        };
        fs.appendFileSync(path.join(state.storage_path, 'board.jsonl'), JSON.stringify(msg) + '\n', 'utf-8');
        state.messages.push(msg);
        state.head = seq;
        state.updated_at = time;
        const poster = state.members[input.agent];
        if (poster && kind !== 'control') {
            poster.last_post_seq = seq;
            poster.last_post_time = time;
            if (kind !== 'stall' && poster.failure) {
                poster.failure = undefined;
                if (poster.activity_kind === 'error')
                    poster.activity_kind = 'idle';
            }
            this.persistMembers(state);
        }
        this.persistMeta(state);
        this.bumpAndEmit(state, 'message');
        return msg;
    }
    readBoard(swarmId, options = {}) {
        const state = this.requireSwarm(swarmId);
        const caller = options.callerName ? state.members[options.callerName] : undefined;
        const filterVisible = (msgs) => {
            let list = msgs;
            if (options.channel && options.channel !== '*') {
                list = list.filter((m) => (m.channel || MAIN_CHANNEL) === options.channel);
            }
            else if (caller && options.channel !== '*') {
                list = list.filter((m) => canMemberSeeMessage(caller, m, state.channels));
            }
            return list;
        };
        let selected;
        let truncated = false;
        if (Array.isArray(options.seqs) && options.seqs.length > 0) {
            const seqSet = new Set(options.seqs);
            selected = filterVisible(state.messages.filter((m) => seqSet.has(m.seq)));
        }
        else {
            const visible = filterVisible(state.messages);
            const limit = options.limit && options.limit > 0 ? options.limit : 20;
            if (typeof options.since === 'number') {
                const after = visible.filter((m) => m.seq > options.since);
                truncated = after.length > limit;
                selected = after.slice(0, limit);
            }
            else {
                truncated = visible.length > limit;
                selected = visible.slice(-limit);
            }
        }
        if (caller && selected.length > 0) {
            const maxSeq = selected[selected.length - 1].seq;
            if (maxSeq > caller.last_read_seq) {
                caller.last_read_seq = maxSeq;
                this.persistMembers(state);
                this.bumpAndEmit(state, 'read_cursor');
            }
        }
        return { messages: selected, head: state.head, truncated };
    }
    readBeforeSeq(swarmId, options) {
        const state = this.requireSwarm(swarmId);
        const all = state.messages;
        let beforeIdx = all.findIndex((m) => m.seq >= options.beforeSeq);
        if (beforeIdx < 0)
            beforeIdx = all.length;
        const limit = options.limit && options.limit > 0 ? options.limit : 200;
        let startIdx;
        if (typeof options.fromSeq === 'number' && options.fromSeq > 0) {
            const targetIdx = all.findIndex((m) => m.seq >= options.fromSeq);
            if (targetIdx < 0 || targetIdx >= beforeIdx) {
                return { messages: [], hasMore: beforeIdx > 0, offset: beforeIdx, total: all.length };
            }
            const span = beforeIdx - targetIdx;
            const pages = Math.ceil(span / limit);
            startIdx = Math.max(0, beforeIdx - pages * limit);
        }
        else {
            startIdx = Math.max(0, beforeIdx - limit);
        }
        return {
            messages: all.slice(startIdx, beforeIdx),
            hasMore: startIdx > 0,
            offset: startIdx,
            total: all.length,
        };
    }
    writePlan(swarmId, plan) {
        const state = this.requireSwarm(swarmId);
        state.plan = plan;
        state.updated_at = new Date().toISOString();
        atomicWriteFileSync(path.join(state.storage_path, 'plan.json'), JSON.stringify(plan, null, 2) + '\n');
        this.persistMeta(state);
        this.bumpAndEmit(state, 'plan');
        return plan;
    }
    getRawFiles(swarmId) {
        const state = this.requireSwarm(swarmId);
        const names = ['swarm.json', 'members.json', 'board.jsonl', 'plan.json'];
        const files = names.map((name) => {
            const filePath = path.join(state.storage_path, name);
            let content = '';
            let bytes = 0;
            if (fs.existsSync(filePath)) {
                const buf = fs.readFileSync(filePath);
                bytes = buf.byteLength;
                content = buf.toString('utf-8');
            }
            const lines = content ? content.split(/\r?\n/).filter((l, i, arr) => i < arr.length - 1 || l.length > 0).length : 0;
            return { name, path: filePath, bytes, lines, content };
        });
        return {
            swarm_id: state.swarm_id,
            storage_path: state.storage_path,
            files,
        };
    }
}
