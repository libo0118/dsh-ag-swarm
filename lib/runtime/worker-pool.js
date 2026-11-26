import { randomUUID } from 'node:crypto';
import { assertValidMemberName, doesMessageWakeMember, isControlMessage, isKilled, MAIN_CHANNEL, } from '../core/channels.js';
import { ModelPresetStore, resolveModelForWorker } from '../core/model-presets.js';
import { appendDelegatedPolicyOverridesCompat, buildPluginUserMessage, buildUserKickoffMessage, captureDelegatedPolicyOverridesCompat, composeChildAgentPresetCompat, readSessionSeed, resolveParentAgentOptions, selectAgentModelCompat, startSubagentCompat, unwrapAgentHandle, } from './dsh-adapter.js';
import { cleanupWorkspace, prepareWorkspace } from './workspace.js';
const DEFAULT_COORDINATOR_WAIT_MS = 150_000;
const MIN_COORDINATOR_WAIT_MS = 1_000;
const MAX_COORDINATOR_WAIT_MS = 300_000;
function clampWaitMs(raw) {
    if (typeof raw !== 'number' || !Number.isFinite(raw))
        return DEFAULT_COORDINATOR_WAIT_MS;
    const n = Math.trunc(raw);
    if (n < MIN_COORDINATOR_WAIT_MS)
        return MIN_COORDINATOR_WAIT_MS;
    if (n > MAX_COORDINATOR_WAIT_MS)
        return MAX_COORDINATOR_WAIT_MS;
    return n;
}
function formatAbortError(reason, fallback) {
    if (reason instanceof Error)
        return reason;
    if (typeof reason === 'string' && reason.trim())
        return new Error(reason);
    if (reason && typeof reason === 'object') {
        const rec = reason;
        if (typeof rec.message === 'string' && rec.message.trim())
            return new Error(rec.message);
        if (rec.kind === 'user')
            return new Error('Cancelled by user');
        if (typeof rec.reason === 'string' && rec.reason.trim())
            return new Error(rec.reason);
        try {
            const json = JSON.stringify(reason);
            if (json && json !== '{}')
                return new Error(`${fallback}: ${json}`);
        }
        catch { /* ignore */ }
    }
    return new Error(fallback);
}
function classifyFailureKind(err) {
    const msg = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : String(err);
    const code = typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : '';
    const status = typeof err === 'object' && err !== null && 'status' in err ? Number(err.status) : 0;
    if (status === 429 || /quota|rate[_\s-]?limit|insufficient|capacity|429/i.test(`${code} ${msg}`)) {
        return { kind: 'quota', message: msg.slice(0, 512) };
    }
    return { kind: 'error', message: msg.slice(0, 512) };
}
function buildWorkerPersona(memberName, swarmId, workspace, mode) {
    return [
        `You are "${memberName}", a persistent worker in Antigravity Swarm (${swarmId}).`,
        `Your workspace (${mode}): ${workspace}`,
        'Rules:',
        '- Start working on your assigned brief immediately; do not post greetings or acknowledgments.',
        '- Use read_board to read missed messages (pass your last read seq as since) and post_message to report results or ask peers.',
        '- @mention only the member(s) who need to act next. Start your final completion post with "@coordinator [done] ..." (or the member who spawned you).',
        '- When done with nothing left to do, call swarm_wait{since: LAST_SEQ} and end your turn without further tool calls.',
    ].join('\n');
}
function formatWakeupPrompt(memberName, items) {
    const lines = items.map((item) => {
        const ch = item.channel && item.channel !== MAIN_CHANNEL ? ` in #${item.channel}` : '';
        return `[board #${item.seq}] @${item.from}${ch}: ${item.text}`;
    });
    return `[swarm wakeup for @${memberName}]\n${lines.join('\n')}\nUse read_board/post_message to respond, and call swarm_wait when finished.`;
}
export class WorkerPool {
    ctx;
    store;
    config;
    liveHandles = new Map();
    sessionIndex = new Map();
    pendingWakeups = new Map();
    eventDisposers = [];
    lifetime = new AbortController();
    modelPresets;
    disposed = false;
    constructor(ctx, store, config) {
        this.ctx = ctx;
        this.store = store;
        this.config = config;
        this.modelPresets = new ModelPresetStore(config.storageDir);
        this.rebuildSessionIndex();
        this.reconcileStaleStateOnStartup();
        this.installHostListeners();
    }
    getModelPresets() {
        return this.modelPresets.getAll();
    }
    setModelPresets(next) {
        return this.modelPresets.setAll(next);
    }
    async getModelCatalogWithPresets() {
        return {
            models: await this.listModels(),
            role_presets: this.modelPresets.getAll(),
        };
    }
    rebuildSessionIndex() {
        for (const summary of this.store.listSwarms()) {
            const state = this.store.getSwarm(summary.swarm_id);
            if (!state)
                continue;
            this.sessionIndex.set(state.session_id, { swarmId: state.swarm_id, memberName: 'coordinator' });
            for (const member of Object.values(state.members)) {
                if (member.conversation_id) {
                    this.sessionIndex.set(member.conversation_id, { swarmId: state.swarm_id, memberName: member.name });
                }
            }
        }
    }
    reconcileStaleStateOnStartup() {
        const agents = this.ctx.get('agents');
        for (const summary of this.store.listSwarms()) {
            const state = this.store.getSwarm(summary.swarm_id);
            if (!state)
                continue;
            for (const member of Object.values(state.members)) {
                if (isKilled(member))
                    continue;
                const patch = {};
                if (member.failure) {
                    const failTs = Date.parse(member.failure.at);
                    const postTs = member.last_post_time ? Date.parse(member.last_post_time) : 0;
                    const hasPostedAfter = Number.isFinite(postTs) && Number.isFinite(failTs) && postTs > failTs;
                    const advancedBeyondFirstStep = member.activity_kind !== 'error' && (member.steps_count ?? 0) > 1;
                    if (hasPostedAfter || advancedBeyondFirstStep) {
                        patch.failure = undefined;
                    }
                }
                if (member.state === 'working') {
                    const live = typeof agents?.get === 'function' ? agents.get(member.conversation_id) : undefined;
                    if (!live || live.status !== 'running') {
                        if (member.role === 'coordinator') {
                            patch.state = 'waiting';
                            patch.activity = undefined;
                            patch.activity_kind = 'idle';
                        }
                        else {
                            patch.state = 'stopped';
                            patch.activity = '已随重启休眠（可 @唤醒继续）';
                            patch.activity_kind = 'idle';
                        }
                    }
                }
                if (Object.keys(patch).length > 0) {
                    this.store.updateMember(state.swarm_id, member.name, patch);
                }
            }
        }
    }
    async cancelWorker(swarmId, memberName, reason = 'user_stopped') {
        const swarm = this.store.getSwarm(swarmId);
        if (!swarm)
            throw new Error(`Swarm not found: ${swarmId}`);
        if (memberName === 'coordinator' || memberName === 'monitor') {
            throw new Error(`Cannot stop "${memberName}"`);
        }
        const member = swarm.members[memberName];
        if (!member)
            throw new Error(`Member "${memberName}" not found`);
        if (isKilled(member)) {
            throw new Error(`Member "${memberName}" has already been killed`);
        }
        const agents = this.ctx.get('agents');
        const subagents = this.ctx.get('subagents');
        const convId = member.conversation_id;
        this.pendingWakeups.delete(convId);
        const handle = this.liveHandles.get(convId);
        const live = handle?.agent ?? agents?.get?.(convId);
        const wasRunning = member.state === 'working' || live?.status === 'running';
        if (live && typeof live.cancel === 'function') {
            try {
                await live.cancel({ kind: 'user', reason });
            }
            catch { /* best-effort worker cancel */ }
        }
        else if (typeof subagents?.interrupt === 'function') {
            try {
                await subagents.interrupt(convId, { kind: 'user' });
            }
            catch { /* ignore if not managed by subagents */ }
        }
        if (wasRunning) {
            this.store.updateMember(swarmId, member.name, {
                state: 'waiting',
                activity: '已手动停止（可 @唤醒继续）',
                activity_kind: 'idle',
            });
            return true;
        }
        return false;
    }
    async cancelActiveWorkers(swarmId, reason = 'coordinator_stopped') {
        const swarm = this.store.getSwarm(swarmId);
        if (!swarm)
            return [];
        const agents = this.ctx.get('agents');
        const subagents = this.ctx.get('subagents');
        const stopped = [];
        for (const member of Object.values(swarm.members)) {
            if (isKilled(member) || member.role === 'coordinator' || member.role === 'monitor')
                continue;
            const convId = member.conversation_id;
            this.pendingWakeups.delete(convId);
            const handle = this.liveHandles.get(convId);
            const live = handle?.agent ?? agents?.get?.(convId);
            const wasRunning = member.state === 'working' || live?.status === 'running';
            if (live && typeof live.cancel === 'function') {
                try {
                    await live.cancel({ kind: 'user', reason });
                }
                catch { /* best-effort worker cancel */ }
            }
            else if (typeof subagents?.interrupt === 'function') {
                try {
                    await subagents.interrupt(convId, { kind: 'user' });
                }
                catch { /* ignore if not managed by subagents */ }
            }
            if (wasRunning) {
                this.store.updateMember(swarmId, member.name, {
                    state: 'waiting',
                    activity: '已随主对话停止而暂停（可 @唤醒继续）',
                    activity_kind: 'idle',
                });
                stopped.push(member.name);
            }
        }
        return stopped;
    }
    installHostListeners() {
        const safeOn = (event, listener, options) => {
            try {
                const off = this.ctx.on(event, listener, options);
                if (typeof off === 'function')
                    this.eventDisposers.push(off);
            }
            catch {
                // Ignore if host context does not expose this event.
            }
        };
        safeOn('agent/status', (payload) => {
            const id = payload?.agent?.id;
            if (!id)
                return;
            const ref = this.sessionIndex.get(id);
            if (!ref)
                return;
            const state = this.store.getSwarm(ref.swarmId);
            const member = state?.members[ref.memberName];
            if (!member || isKilled(member))
                return;
            if (payload.status === 'running') {
                this.store.updateMember(ref.swarmId, ref.memberName, {
                    state: 'working',
                    activity: member.activity || 'Working',
                    activity_kind: member.activity_kind === 'error' ? 'thinking' : (member.activity_kind ?? 'thinking'),
                    ...(member.failure ? { failure: undefined } : {}),
                });
            }
            else if (payload.status === 'idle') {
                if (member.state === 'working') {
                    this.store.updateMember(ref.swarmId, ref.memberName, {
                        state: 'waiting',
                        activity: 'Idle on board',
                        activity_kind: 'idle',
                    });
                }
                if (ref.memberName === 'coordinator') {
                    let cancelled = payload.stopReason === 'cancelled' ||
                        payload.stopReason === 'aborted' ||
                        payload.reason?.kind === 'user';
                    if (!cancelled) {
                        try {
                            const snapFn = payload.agent?.session?.snapshotEvents;
                            const events = typeof snapFn === 'function' ? snapFn() : undefined;
                            if (Array.isArray(events)) {
                                const tail = events.slice(-3);
                                cancelled = tail.some((e) => e?.data?.stopReason === 'cancelled' || e?.data?.stopReason === 'aborted' || e?.data?.cancelled === true);
                            }
                        }
                        catch { /* ignore */ }
                    }
                    if (cancelled) {
                        void this.cancelActiveWorkers(ref.swarmId, 'coordinator_cancelled');
                    }
                }
                void this.flushPendingWakeups(ref.swarmId, ref.memberName);
            }
        });
        safeOn('workspace/session-stop', (payload) => {
            const sid = payload?.sessionId;
            if (!sid)
                return;
            const ref = this.sessionIndex.get(sid);
            if (ref && ref.memberName === 'coordinator') {
                void this.cancelActiveWorkers(ref.swarmId, 'session_stop');
            }
        });
        safeOn('agent/pre-step', async (payload, next) => {
            const id = payload?.agent?.id;
            const ref = id ? this.sessionIndex.get(id) : undefined;
            if (ref) {
                const member = this.store.getSwarm(ref.swarmId)?.members[ref.memberName];
                if (member && !isKilled(member)) {
                    const nextSteps = (member.steps_count ?? 0) + 1;
                    const stepNum = payload.step ?? nextSteps;
                    this.store.updateMember(ref.swarmId, ref.memberName, {
                        steps_count: nextSteps,
                        activity: `Step #${stepNum}`,
                        activity_kind: 'thinking',
                        ...(member.failure && stepNum > 1 ? { failure: undefined } : {}),
                    });
                }
            }
            return typeof next === 'function' ? next() : undefined;
        });
        safeOn('tools/pre-execute', async (exec, next) => {
            const id = exec?.agent?.id ?? exec?.agent?.session?.id;
            const ref = id ? this.sessionIndex.get(id) : undefined;
            if (ref && typeof exec?.name === 'string' && exec.name) {
                const member = this.store.getSwarm(ref.swarmId)?.members[ref.memberName];
                if (member && !isKilled(member)) {
                    this.store.updateMember(ref.swarmId, ref.memberName, {
                        state: 'working',
                        activity: member.steps_count ? `Step #${member.steps_count} · ${exec.name}` : `Calling ${exec.name}`,
                        activity_kind: 'tool',
                        ...(member.failure ? { failure: undefined } : {}),
                    });
                }
            }
            return typeof next === 'function' ? next() : undefined;
        });
        safeOn('agent/assistant-stream', (payload) => {
            const id = payload?.agent?.id;
            const ref = id ? this.sessionIndex.get(id) : undefined;
            if (!ref || payload.frame?.type !== 'chunk')
                return;
            const member = this.store.getSwarm(ref.swarmId)?.members[ref.memberName];
            if (!member || isKilled(member))
                return;
            const chunk = payload.frame.chunk;
            if (!chunk)
                return;
            if (chunk.type === 'tool-call' || chunk.type === 'tool_use') {
                const toolName = chunk.toolName || chunk.name || 'tool';
                this.store.updateMember(ref.swarmId, ref.memberName, {
                    activity: `Calling ${toolName}`,
                    activity_kind: 'tool',
                    ...(member.failure ? { failure: undefined } : {}),
                });
            }
            else if (chunk.type === 'reasoning' || chunk.type === 'thinking') {
                if (member.activity_kind !== 'thinking' || member.failure) {
                    this.store.updateMember(ref.swarmId, ref.memberName, {
                        activity: 'Thinking…',
                        activity_kind: 'thinking',
                        ...(member.failure ? { failure: undefined } : {}),
                    });
                }
            }
            else if ((chunk.type === 'text' || chunk.type === 'text-delta') && member.failure) {
                this.store.updateMember(ref.swarmId, ref.memberName, {
                    failure: undefined,
                    activity_kind: member.activity_kind === 'error' ? 'thinking' : member.activity_kind,
                });
            }
        });
        safeOn('agent/request-error', async (payload, next) => {
            const id = payload?.agent?.id;
            const ref = id ? this.sessionIndex.get(id) : undefined;
            if (ref) {
                const member = this.store.getSwarm(ref.swarmId)?.members[ref.memberName];
                if (member && !isKilled(member)) {
                    const classified = classifyFailureKind(payload.failure);
                    this.store.updateMember(ref.swarmId, ref.memberName, {
                        failure: { kind: classified.kind, message: classified.message, at: new Date().toISOString() },
                        activity: `${classified.kind === 'quota' ? 'Quota' : 'Error'}: ${classified.message.slice(0, 80)}`,
                        activity_kind: 'error',
                    });
                }
            }
            return typeof next === 'function' ? next() : undefined;
        });
        safeOn('agent/error', (payload) => {
            const id = payload?.agent?.id;
            const ref = id ? this.sessionIndex.get(id) : undefined;
            if (!ref)
                return;
            const member = this.store.getSwarm(ref.swarmId)?.members[ref.memberName];
            if (!member || isKilled(member))
                return;
            const classified = classifyFailureKind(payload.error);
            this.store.updateMember(ref.swarmId, ref.memberName, {
                state: 'waiting',
                failure: { kind: classified.kind, message: classified.message, at: new Date().toISOString() },
                activity: `${classified.kind === 'quota' ? 'Quota' : 'Error'}: ${classified.message.slice(0, 80)}`,
                activity_kind: 'error',
            });
        });
        safeOn('agent/disposed', (payload) => {
            const id = payload?.agent?.id;
            if (!id)
                return;
            this.liveHandles.delete(id);
            const ref = this.sessionIndex.get(id);
            if (!ref)
                return;
            const member = this.store.getSwarm(ref.swarmId)?.members[ref.memberName];
            if (!member || isKilled(member))
                return;
            if (member.role === 'coordinator') {
                void this.cancelActiveWorkers(ref.swarmId, 'coordinator_disposed');
                return;
            }
            this.store.updateMember(ref.swarmId, ref.memberName, {
                state: 'stopped',
                activity: 'Stopped (can revive on @mention)',
                activity_kind: 'idle',
            });
        });
    }
    ensureSwarmForSession(sessionId, title, baseWorkspace, agent) {
        const state = this.store.createOrGetSwarm(sessionId, title, baseWorkspace);
        this.sessionIndex.set(sessionId, { swarmId: state.swarm_id, memberName: 'coordinator' });
        if (agent)
            this.syncCoordinatorFromAgent(state.swarm_id, agent);
        return state;
    }
    syncCoordinatorFromAgent(swarmId, agent) {
        const swarm = this.store.getSwarm(swarmId);
        const coord = swarm?.members.coordinator;
        if (!swarm || !coord || isKilled(coord))
            return;
        const liveState = agent.status === 'running' ? 'working' : 'waiting';
        const inherited = resolveParentAgentOptions(agent);
        const liveModel = typeof inherited.agentOptions.model === 'string' ? inherited.agentOptions.model : undefined;
        const liveProvider = typeof inherited.agentOptions.provider === 'string' ? inherited.agentOptions.provider : undefined;
        const patch = {};
        if (coord.state !== liveState)
            patch.state = liveState;
        if (liveModel && (coord.model === 'default' || coord.model !== liveModel)) {
            patch.model = liveModel;
            patch.model_display_name = liveModel;
        }
        if (liveProvider && coord.provider !== liveProvider)
            patch.provider = liveProvider;
        if (Object.keys(patch).length > 0) {
            this.store.updateMember(swarmId, 'coordinator', patch);
        }
    }
    resolveCaller(agent, explicitSwarmId) {
        const sessionId = (typeof agent?.session?.id === 'string' && agent.session.id) ||
            (typeof agent?.id === 'string' && agent.id) ||
            'default-session';
        const cwd = typeof agent?.session?.header?.cwd === 'string' && agent.session.header.cwd.length > 0
            ? agent.session.header.cwd
            : process.cwd();
        const indexed = this.sessionIndex.get(sessionId);
        if (indexed) {
            const swarm = this.store.getSwarm(indexed.swarmId);
            const member = swarm?.members[indexed.memberName];
            if (swarm && member) {
                if (indexed.memberName === 'coordinator' && agent) {
                    this.syncCoordinatorFromAgent(swarm.swarm_id, agent);
                }
                return { swarm, member: swarm.members[indexed.memberName] ?? member, callerName: indexed.memberName, sessionId, cwd };
            }
        }
        if (explicitSwarmId) {
            const swarm = this.store.getSwarm(explicitSwarmId);
            if (swarm) {
                if (agent)
                    this.syncCoordinatorFromAgent(swarm.swarm_id, agent);
                const coord = swarm.members.coordinator;
                return { swarm, member: coord, callerName: 'coordinator', sessionId, cwd };
            }
        }
        const swarm = this.ensureSwarmForSession(sessionId, undefined, cwd, agent);
        return { swarm, member: swarm.members.coordinator, callerName: 'coordinator', sessionId, cwd };
    }
    getRosterStatus(swarmId) {
        const swarm = this.store.getSwarm(swarmId);
        if (!swarm)
            throw new Error(`Swarm not found: ${swarmId}`);
        return {
            swarm_id: swarm.swarm_id,
            title: swarm.title,
            head: swarm.head,
            channels: Object.values(swarm.channels).map((c) => ({
                name: c.name,
                topic: c.topic,
                archived: Boolean(c.archived),
                subscribers: c.subscribers,
            })),
            members: Object.values(swarm.members).map((m) => ({
                name: m.name,
                role: m.role,
                state: m.state,
                model: m.model,
                provider: m.provider,
                workspace_mode: m.workspace_mode,
                workspace: m.workspace,
                branch: m.branch,
                wake_mode: m.wake_mode,
                wait_since: m.wait_since,
                last_read_seq: m.last_read_seq,
                last_post_seq: m.last_post_seq,
                last_post_time: m.last_post_time,
                channels: m.channels,
                created_by: m.created_by,
                depth: m.depth,
                activity: m.activity,
                failure: m.failure,
            })),
        };
    }
    async addWorkers(input) {
        const swarm = this.store.getSwarm(input.swarmId);
        if (!swarm)
            throw new Error(`Swarm not found: ${input.swarmId}`);
        const caller = swarm.members[input.callerName];
        if (!caller || isKilled(caller)) {
            throw new Error(`Caller "${input.callerName}" is not an active member of swarm ${input.swarmId}`);
        }
        const nextDepth = (caller.depth ?? 0) + 1;
        if (nextDepth > this.config.maxDepth) {
            throw new Error(`Worker nesting depth ${nextDepth} exceeds maxDepth (${this.config.maxDepth})`);
        }
        const specs = [];
        if (Array.isArray(input.tasks) && input.tasks.length > 0) {
            for (let i = 0; i < input.tasks.length; i++) {
                const slice = input.tasks[i].trim();
                const workerName = `${input.name}-${i + 1}`;
                assertValidMemberName(workerName);
                specs.push({
                    name: workerName,
                    brief: `${input.brief}\n\nYour assigned slice: ${slice}`,
                    taskHint: slice.slice(0, 120),
                });
            }
        }
        else if (typeof input.n === 'number' && input.n > 1) {
            const count = Math.trunc(input.n);
            for (let i = 1; i <= count; i++) {
                const workerName = `${input.name}-${i}`;
                assertValidMemberName(workerName);
                specs.push({
                    name: workerName,
                    brief: input.brief,
                    taskHint: input.brief.split(/\r?\n/, 1)[0]?.slice(0, 120) || workerName,
                });
            }
        }
        else {
            assertValidMemberName(input.name);
            specs.push({
                name: input.name,
                brief: input.brief,
                taskHint: input.brief.split(/\r?\n/, 1)[0]?.slice(0, 120) || input.name,
            });
        }
        const activeWorkers = Object.values(swarm.members).filter((m) => m.role === 'worker' && !isKilled(m)).length;
        if (activeWorkers + specs.length > this.config.maxWorkers) {
            throw new Error(`Adding ${specs.length} worker(s) exceeds maxWorkers (${this.config.maxWorkers})`);
        }
        for (const spec of specs) {
            if (swarm.members[spec.name]) {
                throw new Error(`Member "${spec.name}" already exists in swarm ${input.swarmId}`);
            }
        }
        let forkSeed;
        if (input.fork) {
            const sourceMember = swarm.members[input.fork];
            if (!sourceMember)
                throw new Error(`Fork source member "${input.fork}" not found`);
            const snap = await readSessionSeed(this.ctx, sourceMember.conversation_id);
            forkSeed = { seed: snap.seed, inheritedEventCount: snap.inheritedEventCount };
        }
        const baseCwd = caller.workspace || swarm.base_workspace || process.cwd();
        const workspaceMode = input.workspace ?? 'inherit';
        // Spawn all workers truly concurrently!
        return Promise.all(specs.map((spec) => this.spawnSingleWorker({
            swarm,
            callerName: input.callerName,
            callerAgent: input.callerAgent,
            workerName: spec.name,
            brief: spec.brief,
            taskHint: spec.taskHint,
            depth: nextDepth,
            baseCwd,
            workspaceMode,
            model: input.model,
            provider: input.provider,
            reasoningEffort: input.reasoning_effort,
            rolePreset: input.role_preset,
            forkSeed,
            signal: input.signal,
        })));
    }
    async spawnSingleWorker(params) {
        const { swarm, workerName, brief } = params;
        const agents = this.ctx.get('agents');
        const parentAgent = params.callerAgent ?? agents?.get?.(swarm.session_id);
        // Capture parent permission overrides synchronously before the first await.
        const delegatedPolicies = captureDelegatedPolicyOverridesCompat(parentAgent);
        const inherited = resolveParentAgentOptions(parentAgent);
        const fallbackDefaultPreset = this.ctx.get('agentPresets')?.defaultId;
        const effectivePreset = inherited.agentPreset
            ?? (typeof fallbackDefaultPreset === 'string' && fallbackDefaultPreset.trim().length > 0
                ? fallbackDefaultPreset.trim()
                : undefined);
        const prepared = await prepareWorkspace({
            ctx: this.ctx,
            swarmId: swarm.swarm_id,
            memberName: workerName,
            mode: params.workspaceMode,
            baseCwd: params.baseCwd,
            storageDir: this.config.storageDir,
            enableWorktrees: this.config.enableWorktrees,
            parentAgent: parentAgent,
            signal: params.signal,
        });
        const sessionId = `agw-${swarm.swarm_id.slice(-8)}-${workerName}-${randomUUID().slice(0, 6)}`;
        const resolvedModel = resolveModelForWorker({
            explicitModel: params.model,
            explicitProvider: params.provider,
            explicitEffort: params.reasoningEffort,
            rolePreset: params.rolePreset,
            workerName,
            presets: this.modelPresets.getAll(),
        });
        const parentModel = typeof inherited.agentOptions.model === 'string' ? inherited.agentOptions.model : undefined;
        const parentProvider = typeof inherited.agentOptions.provider === 'string' ? inherited.agentOptions.provider : undefined;
        const callerMember = swarm.members[params.callerName];
        const callerModel = callerMember?.model && callerMember.model !== 'default' ? callerMember.model : undefined;
        const modelName = resolvedModel?.model || callerModel || parentModel || 'default';
        const providerName = resolvedModel?.provider || params.provider || callerMember?.provider || parentProvider;
        const routeChanged = (providerName !== undefined && providerName !== parentProvider) ||
            (resolvedModel?.model !== undefined && resolvedModel.model !== parentModel);
        const rawReasoningEffort = resolvedModel?.reasoningEffort ||
            params.reasoningEffort ||
            (!routeChanged
                ? (callerMember?.reasoning_effort ||
                    (typeof inherited.agentOptions.reasoningEffort === 'string' ? inherited.agentOptions.reasoningEffort : undefined))
                : undefined);
        const effectiveModelForValidation = resolvedModel?.model ?? parentModel ?? callerModel;
        const reasoningEffort = await this.sanitizeReasoningEffort(providerName, effectiveModelForValidation, rawReasoningEffort);
        const modelDisplayName = resolvedModel?.label || modelName;
        const member = this.store.addMember(swarm.swarm_id, {
            name: workerName,
            conversation_id: sessionId,
            role: 'worker',
            state: 'working',
            model: modelName,
            provider: providerName,
            model_display_name: modelDisplayName,
            reasoning_effort: reasoningEffort,
            workspace_mode: prepared.mode,
            workspace: prepared.workspace,
            branch: prepared.branch,
            wake_mode: 'mentions',
            wait_since: swarm.head,
            last_read_seq: swarm.head,
            created_by: params.callerName,
            depth: params.depth,
            task_hint: params.taskHint,
        });
        this.sessionIndex.set(sessionId, { swarmId: swarm.swarm_id, memberName: workerName });
        const briefText = `@${workerName} ${brief}`;
        const briefMsg = this.store.appendMessage(swarm.swarm_id, {
            agent: params.callerName,
            text: briefText,
            kind: 'brief',
        });
        const persona = buildWorkerPersona(workerName, swarm.swarm_id, prepared.workspace, prepared.mode);
        const initialPrompt = [
            persona,
            '',
            `Your assignment (recorded on the board as #${briefMsg.seq}):`,
            brief,
        ].join('\n');
        const effectiveModelForOptions = resolvedModel?.model ?? parentModel;
        const agentOptions = {
            ...inherited.agentOptions,
            ...(providerName ? { provider: providerName } : {}),
            ...(effectiveModelForOptions ? { model: effectiveModelForOptions } : {}),
            ...(reasoningEffort ? { reasoningEffort } : {}),
            subagentDepth: params.depth,
        };
        if (routeChanged && !resolvedModel?.reasoningEffort && !params.reasoningEffort) {
            delete agentOptions.reasoningEffort;
        }
        if (typeof agents?.create === 'function') {
            const parentSession = parentAgent?.session?.id ?? parentAgent?.id ?? swarm.session_id;
            const rawHandle = await agents.create({
                sessionId,
                meta: {
                    cwd: prepared.workspace,
                    parentSession,
                    isSeeded: Boolean(params.forkSeed && params.forkSeed.seed.length > 0),
                    origin: 'subagent',
                    delegationDepth: params.depth,
                    ...(effectivePreset ? { agentPreset: effectivePreset } : {}),
                },
                ...(params.forkSeed && params.forkSeed.seed.length > 0
                    ? {
                        seed: params.forkSeed.seed,
                        inheritedEventCount: params.forkSeed.inheritedEventCount,
                    }
                    : {}),
                ...(Object.keys(agentOptions).length > 0 ? { agentOptions } : {}),
                signal: params.signal,
                setup: async (agentCtx, child) => {
                    const typedCtx = agentCtx;
                    const childAgent = child;
                    appendDelegatedPolicyOverridesCompat(childAgent?.session, delegatedPolicies);
                    const wd = typedCtx?.get?.('workingDirectory');
                    if (childAgent && prepared.workspace && typeof wd?.set === 'function') {
                        try {
                            await wd.set(childAgent, prepared.workspace, params.signal);
                        }
                        catch (err) {
                            this.ctx.logger?.('ag-swarm').warn('workingDirectory.set failed for @%s: %s', workerName, String(err));
                        }
                    }
                    await composeChildAgentPresetCompat({
                        childCtx: typedCtx,
                        fallbackCtx: this.ctx,
                        parentAgent,
                        childSession: childAgent?.session,
                        logger: this.ctx.logger?.('ag-swarm'),
                    });
                    const sp = typedCtx?.systemPrompt;
                    if (typeof sp?.context === 'function') {
                        sp.context({ name: 'ag-swarm:worker', order: 900, text: persona });
                    }
                },
            });
            const unwrapped = unwrapAgentHandle(rawHandle);
            if (!unwrapped)
                throw new Error(`Host agents.create returned invalid handle for worker "${workerName}"`);
            const actualId = unwrapped.agent.id || sessionId;
            if (actualId !== sessionId) {
                this.sessionIndex.set(actualId, { swarmId: swarm.swarm_id, memberName: workerName });
                this.store.updateMember(swarm.swarm_id, workerName, { conversation_id: actualId });
            }
            this.liveHandles.set(actualId, {
                swarmId: swarm.swarm_id,
                memberName: workerName,
                sessionId: actualId,
                agent: unwrapped.agent,
                dispose: unwrapped.dispose,
                engine: 'agent',
                repoRoot: prepared.repoRoot,
            });
            const wakeupMsg = buildPluginUserMessage(initialPrompt, `swarm brief #${briefMsg.seq} for @${workerName}`);
            if (typeof unwrapped.agent.steer === 'function') {
                await unwrapped.agent.steer(wakeupMsg);
            }
            else if (typeof unwrapped.agent.followup === 'function') {
                await unwrapped.agent.followup(wakeupMsg);
            }
            return this.store.getSwarm(swarm.swarm_id)?.members[workerName] ?? member;
        }
        // Fallback engine: startSubagentCompat when ctx.agents.create is unavailable
        const parent = params.callerAgent ?? agents?.get?.(swarm.session_id) ?? { id: swarm.session_id };
        const subHandle = await startSubagentCompat(this.ctx, {
            provider: params.forkSeed ? 'fork' : 'spawn',
            label: `ag-swarm:${workerName}`,
            name: workerName,
            childId: sessionId,
            cwd: prepared.workspace,
            prompt: initialPrompt,
            parent,
            agentOptions: Object.keys(agentOptions).length > 0 ? agentOptions : undefined,
            maxDepth: this.config.maxDepth,
            persona,
            signal: params.signal,
        });
        const actualId = subHandle.id || sessionId;
        if (actualId !== sessionId) {
            this.sessionIndex.set(actualId, { swarmId: swarm.swarm_id, memberName: workerName });
            this.store.updateMember(swarm.swarm_id, workerName, { conversation_id: actualId });
        }
        this.liveHandles.set(actualId, {
            swarmId: swarm.swarm_id,
            memberName: workerName,
            sessionId: actualId,
            dispose: async () => { await subHandle.dispose(); },
            engine: 'subagent',
            repoRoot: prepared.repoRoot,
        });
        void Promise.resolve(subHandle.result)
            .then(() => {
            const cur = this.store.getSwarm(swarm.swarm_id)?.members[workerName];
            if (cur && !isKilled(cur) && cur.state === 'working') {
                this.store.updateMember(swarm.swarm_id, workerName, { state: 'waiting', activity: 'Idle', activity_kind: 'idle' });
            }
        })
            .catch((err) => {
            const cur = this.store.getSwarm(swarm.swarm_id)?.members[workerName];
            if (cur && !isKilled(cur)) {
                const classified = classifyFailureKind(err);
                this.store.updateMember(swarm.swarm_id, workerName, {
                    state: 'waiting',
                    failure: { kind: classified.kind, message: classified.message, at: new Date().toISOString() },
                    activity_kind: 'error',
                });
            }
        });
        return this.store.getSwarm(swarm.swarm_id)?.members[workerName] ?? member;
    }
    async postMessage(swarmId, input) {
        const swarm = this.store.getSwarm(swarmId);
        if (!swarm)
            throw new Error(`Swarm not found: ${swarmId}`);
        const message = this.store.appendMessage(swarmId, input);
        if (isControlMessage(message)) {
            return { message, woken: [] };
        }
        const woken = [];
        const wakePromises = [];
        const item = {
            seq: message.seq,
            from: message.agent,
            channel: message.channel,
            text: message.text,
        };
        for (const member of Object.values(swarm.members)) {
            if (member.role === 'monitor')
                continue;
            if (!doesMessageWakeMember(member, message, swarm.channels))
                continue;
            woken.push(member.name);
            wakePromises.push(this.deliverDoorbell(swarm, member, item));
        }
        await Promise.allSettled(wakePromises);
        return { message, woken };
    }
    async deliverDoorbell(swarm, member, item) {
        if (isKilled(member))
            return;
        const convId = member.conversation_id;
        if (member.state === 'working' && member.role !== 'coordinator') {
            const queue = this.pendingWakeups.get(convId) ?? [];
            queue.push(item);
            this.pendingWakeups.set(convId, queue);
            return;
        }
        await this.wakeMemberWithItems(swarm, member, [item]);
    }
    async flushPendingWakeups(swarmId, memberName) {
        const swarm = this.store.getSwarm(swarmId);
        const member = swarm?.members[memberName];
        if (!swarm || !member || isKilled(member))
            return;
        const queued = this.pendingWakeups.get(member.conversation_id);
        if (!queued || queued.length === 0)
            return;
        this.pendingWakeups.delete(member.conversation_id);
        await this.wakeMemberWithItems(swarm, member, queued);
    }
    async wakeMemberWithItems(swarm, member, items) {
        if (items.length === 0 || isKilled(member))
            return;
        const convId = member.conversation_id;
        const text = formatWakeupPrompt(member.name, items);
        const summary = `swarm wakeup #${items[items.length - 1].seq} for @${member.name}`;
        const pluginMsg = buildPluginUserMessage(text, summary);
        const agents = this.ctx.get('agents');
        let live = this.liveHandles.get(convId)?.agent ?? agents?.get?.(convId);
        // Cold-resume stopped or evicted worker via ctx.agents.resume
        if (!live && member.role !== 'coordinator' && typeof agents?.resume === 'function') {
            try {
                let resumedRaw;
                try {
                    // DSH v0.2.2-rc.3 signature: resume({ resumeSessionId, ... })
                    const coordAgent = agents?.get?.(swarm.session_id);
                    const persona = buildWorkerPersona(member.name, swarm.swarm_id, member.workspace, member.workspace_mode);
                    resumedRaw = await agents.resume({
                        resumeSessionId: convId,
                        ...(member.model && member.model !== 'default'
                            ? {
                                agentOptions: {
                                    ...(member.provider ? { provider: member.provider } : {}),
                                    model: member.model,
                                    ...(member.reasoning_effort ? { reasoningEffort: member.reasoning_effort } : {}),
                                },
                            }
                            : {}),
                        setup: async (agentCtx, child) => {
                            const typedCtx = agentCtx;
                            const childAgent = child;
                            await composeChildAgentPresetCompat({
                                childCtx: typedCtx,
                                fallbackCtx: this.ctx,
                                parentAgent: coordAgent,
                                childSession: childAgent?.session,
                                logger: this.ctx.logger?.('ag-swarm'),
                            });
                            const sp = typedCtx?.systemPrompt;
                            if (typeof sp?.context === 'function') {
                                sp.context({ name: 'ag-swarm:worker', order: 900, text: persona });
                            }
                        },
                    });
                }
                catch {
                    // Legacy / mock signature: resume(sessionId, options)
                    resumedRaw = await agents.resume(convId, {
                        cwd: member.workspace,
                        model: member.model,
                        provider: member.provider,
                    });
                }
                const unwrapped = unwrapAgentHandle(resumedRaw);
                if (unwrapped) {
                    live = unwrapped.agent;
                    this.liveHandles.set(convId, {
                        swarmId: swarm.swarm_id,
                        memberName: member.name,
                        sessionId: convId,
                        agent: unwrapped.agent,
                        dispose: unwrapped.dispose,
                        engine: 'agent',
                    });
                }
            }
            catch (err) {
                this.ctx.logger?.('ag-swarm').warn('resume failed for @%s (%s): %s', member.name, convId, String(err));
            }
        }
        if (live) {
            if (member.role !== 'coordinator') {
                this.store.updateMember(swarm.swarm_id, member.name, {
                    state: 'working',
                    activity: `Woken by #${items[items.length - 1].seq}`,
                    activity_kind: 'wakeup',
                    ...(member.failure ? { failure: undefined } : {}),
                });
            }
            if (typeof live.steer === 'function') {
                await live.steer(pluginMsg);
                return;
            }
            if (typeof live.followup === 'function') {
                await live.followup(pluginMsg);
                return;
            }
            if (typeof live.inject === 'function') {
                await live.inject(pluginMsg);
                return;
            }
        }
        // Subagent fallback wake via subagents.sendMessage
        const subagents = this.ctx.get('subagents');
        if (member.role !== 'coordinator' && typeof subagents?.sendMessage === 'function') {
            const sender = agents?.get?.(swarm.session_id) ?? { id: swarm.session_id };
            this.store.updateMember(swarm.swarm_id, member.name, {
                state: 'working',
                activity: `Woken by #${items[items.length - 1].seq}`,
                activity_kind: 'wakeup',
            });
            await subagents.sendMessage(sender, convId, [{ type: 'text', text }]);
        }
    }
    async waitForBoard(input) {
        const swarm = this.store.getSwarm(input.swarmId);
        if (!swarm)
            throw new Error(`Swarm not found: ${input.swarmId}`);
        const member = swarm.members[input.callerName];
        if (!member || isKilled(member)) {
            throw new Error(`Member "${input.callerName}" is not active in swarm ${input.swarmId}`);
        }
        const mentionsOnly = input.mentions_only !== false;
        const wakeMode = mentionsOnly ? 'mentions' : 'anything';
        const findMatchingMessages = (state) => {
            const m = state.members[input.callerName];
            if (!m)
                return [];
            const probe = { ...m, wake_mode: wakeMode };
            return state.messages.filter((msg) => msg.seq > input.since && doesMessageWakeMember(probe, msg, state.channels));
        };
        const initialMatches = findMatchingMessages(swarm);
        if (initialMatches.length > 0) {
            const maxSeq = initialMatches[initialMatches.length - 1].seq;
            if (maxSeq > member.last_read_seq) {
                this.store.updateMember(swarm.swarm_id, member.name, { last_read_seq: maxSeq });
            }
            return {
                status: 'messages',
                reason: 'unread',
                head: swarm.head,
                timedOut: false,
                messages: initialMatches,
            };
        }
        // Worker role: zero-cost sleep; end turn and wait for @mention doorbell steer.
        if (member.role !== 'coordinator') {
            this.store.updateMember(swarm.swarm_id, member.name, {
                state: 'waiting',
                wake_mode: wakeMode,
                wait_since: input.since,
                activity: 'Waiting on board',
                activity_kind: 'idle',
            });
            return {
                status: 'waiting',
                reason: 'parked',
                head: swarm.head,
                timedOut: false,
                wake_mode: wakeMode,
                since: input.since,
                note: 'Now sleeping at zero LLM token cost. End your turn without further tool calls; @mention will wake you automatically.',
            };
        }
        // Coordinator role: block inside execute() so DSH keeps main session status === 'running'
        // in the sidebar at zero LLM token cost until a reply, all-idle, user steer, abort, or timeout.
        if (input.signal?.aborted) {
            void this.cancelActiveWorkers(input.swarmId, 'coordinator_aborted');
            throw formatAbortError(input.signal.reason, 'swarm_wait aborted');
        }
        if (this.lifetime.signal.aborted) {
            throw formatAbortError(this.lifetime.signal.reason, 'dsh-ag-swarm plugin unloaded');
        }
        const timeoutMs = clampWaitMs(input.timeout_ms);
        const coordSessionId = input.agent?.id ?? input.agent?.session?.id ?? swarm.session_id;
        const matchesCoordinator = (candidate) => {
            if (!candidate)
                return false;
            if (input.agent && candidate === input.agent)
                return true;
            return candidate.id === coordSessionId || candidate.session?.id === coordSessionId;
        };
        return new Promise((resolve, reject) => {
            let settled = false;
            let timer;
            let offInbox = () => { };
            let offDisposed = () => { };
            const currentHead = () => this.store.getSwarm(input.swarmId)?.head ?? swarm.head;
            const finish = (settle) => {
                if (settled)
                    return;
                settled = true;
                if (timer !== undefined)
                    clearTimeout(timer);
                this.store.off('update', onStoreUpdate);
                try {
                    offInbox();
                }
                catch { /* ignore */ }
                try {
                    offDisposed();
                }
                catch { /* ignore */ }
                input.signal?.removeEventListener('abort', onAbort);
                this.lifetime.signal.removeEventListener('abort', onUnload);
                settle();
            };
            const checkNow = () => {
                const latest = this.store.getSwarm(input.swarmId);
                if (!latest) {
                    finish(() => resolve({ status: 'all_idle', reason: 'swarm_missing', head: 0, timedOut: false }));
                    return;
                }
                const matched = findMatchingMessages(latest);
                if (matched.length > 0) {
                    const maxSeq = matched[matched.length - 1].seq;
                    const coord = latest.members[input.callerName];
                    if (coord && maxSeq > coord.last_read_seq) {
                        this.store.updateMember(latest.swarm_id, coord.name, { last_read_seq: maxSeq });
                    }
                    finish(() => resolve({
                        status: 'messages',
                        reason: 'message',
                        head: latest.head,
                        timedOut: false,
                        messages: matched,
                    }));
                    return;
                }
                const liveWorkers = Object.values(latest.members).filter((m) => m.role !== 'coordinator' && m.role !== 'monitor' && !isKilled(m));
                if (liveWorkers.length > 0 && liveWorkers.every((w) => w.state !== 'working')) {
                    finish(() => resolve({
                        status: 'all_idle',
                        reason: 'all_workers_idle',
                        head: latest.head,
                        timedOut: false,
                        note: `All ${liveWorkers.length} live worker(s) have left the working state.`,
                    }));
                }
            };
            const onStoreUpdate = (ev) => {
                if (ev?.swarmId === input.swarmId)
                    checkNow();
            };
            const onAbort = () => {
                finish(() => reject(formatAbortError(input.signal?.reason, 'swarm_wait aborted')));
                void this.cancelActiveWorkers(input.swarmId, 'coordinator_aborted');
            };
            const onUnload = () => {
                finish(() => reject(formatAbortError(this.lifetime.signal.reason, 'swarm_wait aborted on plugin unload')));
            };
            this.store.on('update', onStoreUpdate);
            try {
                offInbox = this.ctx.on('agent/inbox/inserted', (payload) => {
                    if (matchesCoordinator(payload?.agent)) {
                        finish(() => resolve({
                            status: 'interrupted',
                            reason: 'inbox_inserted',
                            head: currentHead(),
                            timedOut: false,
                        }));
                    }
                });
            }
            catch {
                offInbox = () => { };
            }
            try {
                offDisposed = this.ctx.on('agent/disposed', (payload) => {
                    if (matchesCoordinator(payload?.agent)) {
                        finish(() => reject(new Error('swarm_wait ended because coordinator agent was disposed')));
                    }
                });
            }
            catch {
                offDisposed = () => { };
            }
            input.signal?.addEventListener('abort', onAbort, { once: true });
            this.lifetime.signal.addEventListener('abort', onUnload, { once: true });
            timer = setTimeout(() => {
                const latest = this.store.getSwarm(input.swarmId);
                const workerSummary = latest
                    ? Object.values(latest.members)
                        .filter((m) => m.role !== 'coordinator' && m.role !== 'monitor' && !isKilled(m))
                        .map((m) => ({
                        name: m.name,
                        state: m.state,
                        ...(m.steps_count !== undefined ? { steps_count: m.steps_count } : {}),
                        ...(m.activity ? { activity: m.activity } : {}),
                        ...(m.last_post_seq !== undefined ? { last_post_seq: m.last_post_seq } : {}),
                    }))
                    : [];
                finish(() => resolve({
                    status: 'timeout',
                    reason: 'heartbeat',
                    head: latest?.head ?? currentHead(),
                    timedOut: true,
                    worker_summary: workerSummary,
                    note: 'Heartbeat checkpoint: write a concise 1-2 line progress update for the user based on worker_summary, then immediately call swarm_wait again while workers are still running.',
                }));
            }, timeoutMs);
            timer.unref?.();
            if (input.signal?.aborted) {
                onAbort();
            }
            else {
                checkNow();
            }
        });
    }
    async switchModel(input) {
        const swarm = this.store.getSwarm(input.swarmId);
        if (!swarm)
            throw new Error(`Swarm not found: ${input.swarmId}`);
        const target = swarm.members[input.targetName];
        if (!target || isKilled(target)) {
            throw new Error(`Member "${input.targetName}" not found or already killed`);
        }
        const isSelf = input.callerName === input.targetName;
        const isCoordinator = input.callerName === 'coordinator';
        const isCreator = target.created_by === input.callerName;
        if (!isCoordinator && !isSelf && !isCreator) {
            throw new Error(`ACL denied: "${input.callerName}" may only switch model for itself or workers it created`);
        }
        if (!isSelf && target.state === 'working') {
            throw new Error(`Cannot switch model for "@${target.name}" while it is working; wait until it is waiting or stopped`);
        }
        const nextProvider = input.provider ?? target.provider;
        const sameRoute = nextProvider === target.provider && input.model === target.model;
        const rawEffort = input.reasoning_effort !== undefined
            ? (input.reasoning_effort.trim() || undefined)
            : (sameRoute ? target.reasoning_effort : undefined);
        const validatedEffort = await this.sanitizeReasoningEffort(nextProvider, input.model, rawEffort);
        const agents = this.ctx.get('agents');
        const live = this.liveHandles.get(target.conversation_id)?.agent ?? agents?.get?.(target.conversation_id);
        if (live) {
            await selectAgentModelCompat(live, {
                provider: nextProvider,
                model: input.model,
                reasoningEffort: validatedEffort,
            });
        }
        return this.store.updateMember(swarm.swarm_id, target.name, {
            model: input.model,
            provider: nextProvider,
            model_display_name: input.model,
            reasoning_effort: validatedEffort,
            failure: undefined,
            activity: `Switched model to ${input.model}`,
            activity_kind: target.activity_kind === 'error' ? 'idle' : target.activity_kind,
        });
    }
    async killMember(swarmId, callerName, targetName) {
        const swarm = this.store.getSwarm(swarmId);
        if (!swarm)
            throw new Error(`Swarm not found: ${swarmId}`);
        if (targetName === 'coordinator' || targetName === 'monitor') {
            throw new Error(`Cannot kill "${targetName}"`);
        }
        const target = swarm.members[targetName];
        if (!target)
            throw new Error(`Member "${targetName}" not found`);
        if (callerName !== 'coordinator' && target.created_by !== callerName) {
            throw new Error(`ACL denied: "${callerName}" can only kill workers it created`);
        }
        if (isKilled(target))
            return;
        const handle = this.liveHandles.get(target.conversation_id);
        this.liveHandles.delete(target.conversation_id);
        this.pendingWakeups.delete(target.conversation_id);
        if (handle) {
            try {
                await handle.dispose();
            }
            catch {
                // Best-effort live handle disposal.
            }
        }
        else {
            const subagents = this.ctx.get('subagents');
            try {
                await subagents?.interrupt?.(target.conversation_id, { kind: 'user' });
            }
            catch {
                // Ignore if not managed by subagents.
            }
        }
        if (target.workspace_mode !== 'inherit' && target.workspace) {
            await cleanupWorkspace({
                workspace: target.workspace,
                mode: target.workspace_mode,
                baseCwd: swarm.base_workspace || undefined,
                repoRoot: handle?.repoRoot,
            });
        }
        // Do NOT cascade-kill helpers created by targetName!
        this.store.killMember(swarmId, targetName);
    }
    async nudgeMember(swarmId, memberName, text) {
        const body = text && text.trim().length > 0
            ? text.trim()
            : 'Status check: please report your current progress or continue your assigned work.';
        const formatted = body.includes(`@${memberName}`) ? body : `@${memberName} ${body}`;
        return this.postMessage(swarmId, { agent: 'coordinator', text: formatted });
    }
    manageChannel(swarmId, callerName, input) {
        switch (input.op) {
            case 'create':
                return this.store.createChannel(swarmId, {
                    channel: input.channel,
                    topic: input.topic,
                    creator: callerName,
                    subscribers: input.members,
                });
            case 'archive':
                return this.store.archiveChannel(swarmId, { channel: input.channel, actor: callerName });
            case 'subscribe':
                return this.store.subscribeChannel(swarmId, {
                    channel: input.channel,
                    members: input.members ?? [callerName],
                    actor: callerName,
                });
            case 'unsubscribe':
                return this.store.unsubscribeChannel(swarmId, {
                    channel: input.channel,
                    members: input.members ?? [callerName],
                    actor: callerName,
                });
        }
    }
    async sanitizeReasoningEffort(provider, model, effort) {
        const trimmed = typeof effort === 'string' ? effort.trim() : '';
        if (!trimmed)
            return undefined;
        if (!provider || !model || model === 'default')
            return trimmed;
        const llm = this.ctx.get('llm');
        if (typeof llm?.resolveModelInfo !== 'function')
            return trimmed;
        try {
            const info = await Promise.resolve(llm.resolveModelInfo(provider, model));
            if (!info || typeof info !== 'object')
                return trimmed;
            const efforts = info.reasoning?.efforts;
            if (!Array.isArray(efforts) || efforts.length === 0) {
                this.ctx.logger?.('ag-swarm').warn('stripping unsupported reasoningEffort "%s" for %s/%s (model does not support reasoning efforts)', trimmed, provider, model);
                return undefined;
            }
            if (!efforts.some((e) => typeof e?.id === 'string' && e.id === trimmed)) {
                this.ctx.logger?.('ag-swarm').warn('stripping unsupported reasoningEffort "%s" for %s/%s', trimmed, provider, model);
                return undefined;
            }
            return trimmed;
        }
        catch {
            return trimmed;
        }
    }
    async listModels() {
        const out = [];
        const llm = this.ctx.get('llm');
        if (!llm)
            return out;
        const pushEfforts = (rawReasoning) => {
            if (!rawReasoning || typeof rawReasoning !== 'object')
                return {};
            const r = rawReasoning;
            if (!Array.isArray(r.efforts) || r.efforts.length === 0)
                return {};
            const efforts = [];
            for (const item of r.efforts) {
                if (typeof item === 'string' && item.trim()) {
                    efforts.push({ id: item.trim(), name: item.trim() });
                }
                else if (item && typeof item === 'object') {
                    const obj = item;
                    if (typeof obj.id === 'string' && obj.id.trim()) {
                        efforts.push({
                            id: obj.id.trim(),
                            name: typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : obj.id.trim(),
                            ...(typeof obj.description === 'string' && obj.description ? { description: obj.description } : {}),
                        });
                    }
                }
            }
            const defaultEffort = typeof r.defaultEffort === 'string' && r.defaultEffort.trim() ? r.defaultEffort.trim() : undefined;
            return { ...(efforts.length > 0 ? { efforts } : {}), ...(defaultEffort ? { defaultEffort } : {}) };
        };
        try {
            if (typeof llm.listProviders === 'function' && typeof llm.listModels === 'function') {
                const providersRaw = await Promise.resolve(llm.listProviders());
                const providers = Array.isArray(providersRaw) ? providersRaw : [];
                for (const pItem of providers) {
                    const pRec = (pItem && typeof pItem === 'object' ? pItem : {});
                    const providerId = typeof pRec.id === 'string' ? pRec.id : typeof pRec.provider === 'string' ? pRec.provider : '';
                    if (!providerId)
                        continue;
                    try {
                        const modelsRaw = await Promise.resolve(llm.listModels(providerId));
                        const models = Array.isArray(modelsRaw) ? modelsRaw : [];
                        for (const mItem of models) {
                            if (!mItem || typeof mItem !== 'object')
                                continue;
                            const mRec = mItem;
                            const modelId = typeof mRec.id === 'string' ? mRec.id : typeof mRec.model === 'string' ? mRec.model : '';
                            if (!modelId)
                                continue;
                            let effortsMeta = {};
                            let reasoningKnown = false;
                            if (typeof llm.resolveModelInfo === 'function') {
                                try {
                                    const resolved = await Promise.resolve(llm.resolveModelInfo(providerId, modelId));
                                    if (resolved && typeof resolved === 'object') {
                                        reasoningKnown = true;
                                        effortsMeta = pushEfforts(resolved.reasoning);
                                    }
                                }
                                catch { /* per-model resolve fallback */ }
                            }
                            if (!reasoningKnown && Array.isArray(mRec.efforts)) {
                                reasoningKnown = true;
                                effortsMeta = pushEfforts({ efforts: mRec.efforts });
                            }
                            const label = typeof mRec.name === 'string' && mRec.name !== modelId
                                ? `${mRec.name} (${providerId})`
                                : typeof mRec.label === 'string'
                                    ? mRec.label
                                    : `${providerId}/${modelId}`;
                            out.push({
                                provider: providerId,
                                model: modelId,
                                label,
                                ...(effortsMeta.efforts ? { efforts: effortsMeta.efforts } : {}),
                                ...(effortsMeta.defaultEffort ? { defaultEffort: effortsMeta.defaultEffort } : {}),
                                ...(reasoningKnown ? { reasoningKnown: true } : {}),
                            });
                        }
                    }
                    catch { /* skip provider that refuses listModels */ }
                }
                return out;
            }
            const raw = Array.isArray(llm.models) ? llm.models : [];
            for (const item of raw) {
                if (!item || typeof item !== 'object')
                    continue;
                const rec = item;
                const model = typeof rec.model === 'string' ? rec.model : typeof rec.id === 'string' ? rec.id : '';
                if (!model)
                    continue;
                const provider = typeof rec.provider === 'string' ? rec.provider : 'default';
                const label = typeof rec.label === 'string' ? rec.label : typeof rec.name === 'string' ? rec.name : `${provider}/${model}`;
                const meta = rec.reasoning ? pushEfforts(rec.reasoning) : Array.isArray(rec.efforts) ? pushEfforts({ efforts: rec.efforts }) : {};
                out.push({
                    provider,
                    model,
                    label,
                    ...(meta.efforts ? { efforts: meta.efforts } : {}),
                    ...(meta.defaultEffort ? { defaultEffort: meta.defaultEffort } : {}),
                });
            }
        }
        catch {
            // Never crash the host on model catalog lookup.
        }
        return out;
    }
    async getMemberTranscript(swarmId, memberName) {
        const swarm = this.store.getSwarm(swarmId);
        if (!swarm)
            throw new Error(`Swarm not found: ${swarmId}`);
        const member = swarm.members[memberName];
        if (!member)
            throw new Error(`Member not found: ${memberName}`);
        const snap = await readSessionSeed(this.ctx, member.conversation_id);
        const steps = [];
        let stepStartTs;
        let lastDurationMs;
        const pushStep = (step) => {
            steps.push({ index: steps.length + 1, ...step });
        };
        for (let i = 0; i < snap.events.length; i++) {
            const ev = snap.events[i];
            if (!ev || typeof ev !== 'object')
                continue;
            const type = String(ev.type ?? '');
            const data = (ev.data ?? {});
            const ts = typeof ev.time === 'number' && Number.isFinite(ev.time) ? ev.time : undefined;
            const time = ts !== undefined ? new Date(ts).toISOString() : undefined;
            if (type === 'step/start') {
                if (ts !== undefined)
                    stepStartTs = ts;
                continue;
            }
            if (type === 'step/end') {
                if (ts !== undefined && stepStartTs !== undefined && ts >= stepStartTs) {
                    lastDurationMs = ts - stepStartTs;
                }
                stepStartTs = undefined;
                continue;
            }
            if (type === 'user/message') {
                pushStep({ kind: 'user', title: 'Prompt / Wakeup', detail: extractEventText(data, 2000), time, ts, status: 'ok' });
            }
            else if (type === 'assistant/message' || type === 'assistant/attempt') {
                const msg = data.message;
                const content = msg?.content ?? data.content;
                const stepDuration = typeof data.durationMs === 'number' ? data.durationMs : lastDurationMs;
                lastDurationMs = undefined;
                if (Array.isArray(content)) {
                    for (const block of content) {
                        if (!block || typeof block !== 'object')
                            continue;
                        const rec = block;
                        const bType = String(rec.type ?? '');
                        if (bType === 'thinking' || bType === 'reasoning') {
                            const txt = String(rec.thinking ?? rec.text ?? '').trim();
                            if (txt)
                                pushStep({ kind: 'thinking', title: 'Thinking', detail: txt.slice(0, 1500), time, ts, status: 'ok' });
                        }
                        else if (bType === 'tool-call' || bType === 'tool_use') {
                            const toolName = String(rec.name ?? rec.toolName ?? 'tool');
                            pushStep({ kind: 'tool', toolName, title: `Call: ${toolName}`, detail: extractEventText(rec, 1500), time, ts, status: 'ok' });
                        }
                        else if (bType === 'text') {
                            const txt = String(rec.text ?? '').trim();
                            if (txt)
                                pushStep({ kind: 'assistant', title: 'Assistant response', detail: txt.slice(0, 4000), time, ts, durationMs: stepDuration, status: 'ok' });
                        }
                    }
                }
                else {
                    const detail = extractEventText(data, 4000);
                    if (detail)
                        pushStep({ kind: 'assistant', title: 'Assistant response', detail, time, ts, durationMs: stepDuration, status: 'ok' });
                }
            }
            else if (type === 'tool/call' || type === 'tool/result' || type === 'tool/ptc-dispatch') {
                const toolName = String(data.name ?? data.toolName ?? 'tool');
                const prefix = type === 'tool/result' ? 'Result' : 'Call';
                pushStep({
                    kind: 'tool',
                    toolName,
                    title: `${prefix}: ${toolName}`,
                    detail: extractEventText(data, 1500),
                    time,
                    ts,
                    status: data.isError === true ? 'error' : 'ok',
                });
            }
            else if (type === 'model/selection') {
                pushStep({
                    kind: 'model',
                    title: `Model switched to ${String(data.model ?? '')}`,
                    detail: `${String(data.provider ?? '')}/${String(data.model ?? '')}`,
                    time,
                    ts,
                    status: 'ok',
                });
            }
            else if (type.includes('error')) {
                pushStep({ kind: 'error', title: 'Error', detail: extractEventText(data, 1500), time, ts, status: 'error' });
            }
        }
        if (steps.length === 0) {
            const boardMsgs = swarm.messages.filter((m) => m.agent === memberName || m.mentions.includes(memberName));
            for (const m of boardMsgs.slice(-50)) {
                steps.push({
                    index: steps.length + 1,
                    kind: m.agent === memberName ? 'assistant' : 'user',
                    title: `#${m.seq} @${m.agent}${m.channel !== MAIN_CHANNEL ? ` in #${m.channel}` : ''}`,
                    detail: m.text.slice(0, 600),
                    time: m.time,
                    status: 'ok',
                });
            }
        }
        const boundedSteps = steps.length > 300 ? steps.slice(-300) : steps;
        return {
            swarm_id: swarm.swarm_id,
            member: member.name,
            conversation_id: member.conversation_id,
            model: member.model,
            workspace_mode: member.workspace_mode,
            workspace: member.workspace,
            branch: member.branch,
            state: member.state,
            activity: member.activity,
            steps_count: member.steps_count,
            failure: member.failure,
            steps: boundedSteps,
        };
    }
    async kickoffCoordinator(agent, swarmId, goal, attachments) {
        const swarm = this.store.getSwarm(swarmId);
        if (!swarm)
            return { dispatched: false };
        if (agent)
            this.syncCoordinatorFromAgent(swarmId, agent);
        const presets = this.modelPresets.getAll();
        const presetEntries = Object.entries(presets);
        const presetSummary = presetEntries.length > 0
            ? presetEntries.map(([k, v]) => `${k}=${v.provider ? `${v.provider}/` : ''}${v.model}`).join(', ')
            : 'none (workers inherit your current chat model)';
        const waitTool = this.ctx.get('tools')?.has?.('ag_swarm_wait')
            ? 'ag_swarm_wait'
            : 'swarm_wait';
        const prompt = [
            `[Swarm Coordinator Kickoff — ${swarmId} (board head #${swarm.head})]`,
            `User Goal: ${goal}`,
            `Configured Role Model Presets: ${presetSummary}`,
            '',
            'Execute as the Antigravity Swarm coordinator:',
            '1. Split the goal into independent parallel tracks with disjoint file/module ownership.',
            '2. Call `swarm{action:"add", name, brief, role_preset, workspace}` in parallel to spawn workers (use `workspace:"share"` for concurrent file editors, `role_preset` like `"explorer"` / `"author"` / `"verifier"`, and instruct every worker to report back with `@coordinator [done] ...`).',
            '3. Call `swarm{action:"plan", goal:{title,line}, plan_tasks:{...}, threads:[...]}` so the Overview tab renders live progress.',
            `4. IMMEDIATELY loop calling \`${waitTool}{since: <head>}\` after dispatching workers — it suspends with zero LLM token burn (~2.5m heartbeat checkpoint) while an embedded UI card displays live worker steps; when a heartbeat returns (\`reason: "heartbeat"\`), share a concise 1-2 line progress update and immediately re-enter \`${waitTool}\`.`,
            '5. Review results, integrate changes, run final verification, and post `[done] <summary>` (without `@`) via `post_message` before replying to the user.',
        ].join('\n');
        const msg = buildUserKickoffMessage(prompt, attachments);
        if (agent && typeof agent.followup === 'function') {
            await agent.followup(msg);
            return { dispatched: true, method: 'followup' };
        }
        if (agent && typeof agent.steer === 'function') {
            await agent.steer(msg);
            return { dispatched: true, method: 'steer' };
        }
        return { dispatched: false };
    }
    async dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.lifetime.abort(new Error('WorkerPool disposed'));
        for (const off of this.eventDisposers) {
            try {
                off();
            }
            catch { /* ignore */ }
        }
        this.eventDisposers.length = 0;
        const handles = [...this.liveHandles.values()];
        this.liveHandles.clear();
        this.pendingWakeups.clear();
        await Promise.allSettled(handles.map((h) => h.dispose()));
    }
}
function extractEventText(data, maxChars = 600) {
    if (typeof data.text === 'string')
        return data.text.slice(0, maxChars);
    const msg = data.message;
    const content = msg?.content ?? data.content;
    if (typeof content === 'string')
        return content.slice(0, maxChars);
    if (Array.isArray(content)) {
        const parts = content
            .map((b) => (typeof b === 'object' && b !== null && 'text' in b ? String(b.text ?? '') : ''))
            .filter(Boolean);
        if (parts.length > 0)
            return parts.join('\n').slice(0, maxChars);
    }
    try {
        return JSON.stringify(data).slice(0, Math.min(maxChars, 1500));
    }
    catch {
        return '';
    }
}
