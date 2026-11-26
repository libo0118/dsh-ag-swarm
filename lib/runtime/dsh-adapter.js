import { randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';
export const PLUGIN_MESSAGE_SOURCE_KIND = 'plugin:dsh-ag-swarm';
export function getDshHome(ctx) {
    const profile = ctx?.get('profile');
    if (typeof profile?.home === 'string' && profile.home.trim().length > 0) {
        return profile.home.trim();
    }
    const envHome = process.env.DSH_HOME;
    if (typeof envHome === 'string' && envHome.trim().length > 0) {
        return envHome.trim();
    }
    return join(homedir(), '.dsh');
}
export function detectHostCapabilities(ctx) {
    const agents = ctx?.get('agents');
    const subagents = ctx?.get('subagents');
    const hasStartActivation = typeof subagents?.startActivation === 'function';
    const hasListDescendants = typeof subagents?.listDescendants === 'function';
    const hasLegacyStart = typeof subagents?.start === 'function';
    let subagentMode = 'none';
    if (hasStartActivation && hasListDescendants) {
        subagentMode = 'rc3-activation';
    }
    else if (hasStartActivation) {
        subagentMode = 'legacy-activation';
    }
    else if (hasLegacyStart) {
        subagentMode = 'legacy-start';
    }
    return {
        agents: {
            available: agents !== undefined,
            hasCreate: typeof agents?.create === 'function',
            hasResume: typeof agents?.resume === 'function',
            hasGet: typeof agents?.get === 'function',
        },
        subagents: {
            available: subagents !== undefined && subagentMode !== 'none',
            mode: subagentMode,
            hasSendMessage: typeof subagents?.sendMessage === 'function',
            hasInterrupt: typeof subagents?.interrupt === 'function',
            hasListDescendants,
        },
        worktrees: typeof ctx?.get('worktrees')?.create === 'function',
        tools: typeof ctx?.get('tools')?.register === 'function',
        commands: typeof ctx?.get('commands')?.register === 'function',
        skills: typeof ctx?.get('skills')?.register === 'function',
        webServer: typeof ctx?.get('webServer')?.register === 'function',
        connection: typeof ctx?.get('connection')?.admit === 'function',
        sessionQuery: ctx?.get('sessionQuery') !== undefined,
    };
}
export function boundSummary(summary, maxChars = 120) {
    const trimmed = summary.trim();
    if (trimmed.length <= maxChars)
        return trimmed;
    return `${trimmed.slice(0, maxChars - 1)}…`;
}
export function buildPluginUserMessage(text, summary = 'swarm notification') {
    return Object.freeze({
        id: randomUUID(),
        role: 'user',
        content: Object.freeze([Object.freeze({ type: 'text', text })]),
        source: Object.freeze({
            kind: PLUGIN_MESSAGE_SOURCE_KIND,
            form: 'notice',
            summary: boundSummary(summary),
        }),
    });
}
export function registerMessageSourceCompat(ctx) {
    if (!ctx)
        return () => { };
    const candidate = ctx.get('messageSources')
        ?? ctx.get('messageSourceMap')
        ?? (ctx.get('llm')?.messageSources);
    if (typeof candidate?.register === 'function') {
        try {
            const dispose = candidate.register(PLUGIN_MESSAGE_SOURCE_KIND, { form: 'notice' });
            return typeof dispose === 'function' ? dispose : () => { };
        }
        catch {
            return () => { };
        }
    }
    return () => { };
}
export function unwrapAgentHandle(maybeHandle) {
    if (!maybeHandle || typeof maybeHandle !== 'object')
        return undefined;
    const record = maybeHandle;
    if (record.agent && typeof record.agent === 'object') {
        const agent = record.agent;
        const dispose = typeof record.dispose === 'function'
            ? async () => { await record.dispose(); }
            : async () => { await agent.dispose?.(); };
        return { agent, dispose };
    }
    if (typeof record.id === 'string') {
        const agent = record;
        return {
            agent,
            dispose: async () => { await agent.dispose?.(); },
        };
    }
    return undefined;
}
export async function startSubagentCompat(ctx, input) {
    const subagents = ctx.get('subagents');
    if (!subagents) {
        throw new Error('DSH host subagents service is unavailable');
    }
    const promptBlocks = typeof input.prompt === 'string'
        ? [{ type: 'text', text: input.prompt }]
        : input.prompt;
    const baseRequest = {
        prompt: promptBlocks,
        parent: input.parent,
        ...(input.cwd !== undefined ? { cwd: input.cwd } : {}),
        ...(input.agentOptions !== undefined ? { agentOptions: input.agentOptions } : {}),
        ...(input.outputSchema !== undefined ? { outputSchema: input.outputSchema } : {}),
        ...(input.maxDepth !== undefined ? { maxDepth: input.maxDepth } : {}),
    };
    if (typeof subagents.startActivation === 'function') {
        const isRc3 = typeof subagents.listDescendants === 'function';
        const spec = {
            provider: input.provider,
            label: input.label,
            ...(input.childId !== undefined ? { childId: input.childId } : {}),
            ...(isRc3
                ? {
                    ...baseRequest,
                    ...(input.name !== undefined ? { name: input.name } : {}),
                    ...(input.agentPreset !== undefined ? { agentPreset: input.agentPreset } : {}),
                }
                : {
                    request: {
                        ...baseRequest,
                        ...(input.agentPreset !== undefined ? { agentPreset: input.agentPreset } : {}),
                    },
                }),
            ...(input.signal !== undefined ? { signal: input.signal } : {}),
            delivery: 'caller',
        };
        const activation = await subagents.startActivation(spec);
        return {
            id: activation.childId,
            name: activation.name,
            result: activation.result,
            dispose: () => activation.dispose(),
        };
    }
    if (typeof subagents.start === 'function') {
        const handle = await subagents.start(input.provider, {
            label: input.label,
            ...baseRequest,
            ...(input.signal !== undefined ? { signal: input.signal } : {}),
            ...(input.persona !== undefined ? { persona: input.persona } : {}),
            ...(input.toolFilter !== undefined ? { toolFilter: input.toolFilter } : {}),
        });
        return {
            id: handle.id,
            result: handle.result,
            dispose: () => handle.dispose(),
        };
    }
    throw new Error('DSH host subagents service supports neither startActivation nor start');
}
export async function readSessionSeed(ctx, sessionId) {
    let rawEvents = [];
    const liveAgent = ctx?.get('agents')?.get?.(sessionId);
    if (liveAgent?.session) {
        if (typeof liveAgent.session.snapshotEvents === 'function') {
            try {
                const snap = liveAgent.session.snapshotEvents(0);
                if (Array.isArray(snap))
                    rawEvents = [...snap];
            }
            catch {
                // Fall back to sessionQuery below.
            }
        }
        else if (Array.isArray(liveAgent.session.events)) {
            rawEvents = [...liveAgent.session.events];
        }
    }
    if (rawEvents.length === 0 && ctx) {
        const sq = ctx.get('sessionQuery');
        if (sq) {
            try {
                if (typeof sq.readSession === 'function') {
                    const snap = await sq.readSession(sessionId);
                    if (Array.isArray(snap?.events))
                        rawEvents = [...snap.events];
                }
                else if (typeof sq.readEvents === 'function') {
                    const evs = await sq.readEvents(sessionId);
                    if (Array.isArray(evs))
                        rawEvents = [...evs];
                }
                else if (typeof sq.getEvents === 'function') {
                    const evs = await sq.getEvents(sessionId);
                    if (Array.isArray(evs))
                        rawEvents = [...evs];
                }
            }
            catch {
                rawEvents = [];
            }
        }
    }
    if (rawEvents.length === 0) {
        return { events: [], inheritedEventCount: 0, seed: [] };
    }
    const last = rawEvents[rawEvents.length - 1];
    const lastTime = typeof last?.time === 'number' ? last.time : Date.now();
    const seed = [...rawEvents];
    if (last?.type !== 'session/end-seed') {
        seed.push({
            type: 'session/end-seed',
            seq: rawEvents.length,
            time: lastTime,
            data: { inherited: true },
        });
    }
    return {
        events: rawEvents,
        inheritedEventCount: rawEvents.length,
        seed,
    };
}
export async function selectAgentModelCompat(agent, selection) {
    if (!agent?.model || typeof agent.model.select !== 'function') {
        return false;
    }
    const current = agent.model.current?.();
    const opts = agent.options;
    const provider = selection.provider ?? current?.provider ?? opts?.provider ?? 'default';
    await agent.model.select({
        provider,
        model: selection.model,
        ...(selection.reasoningEffort !== undefined ? { reasoningEffort: selection.reasoningEffort } : {}),
    });
    return true;
}
export async function admitHttpRequest(ctx, headers) {
    const connection = ctx.get('connection');
    if (!connection || typeof connection.admit !== 'function') {
        return { admitted: false, status: 503, actorId: '', reason: 'connection service unavailable' };
    }
    try {
        const result = (await connection.admit({ headers }));
        if (typeof result === 'boolean') {
            return result
                ? { admitted: true, status: 200, actorId: 'authenticated-dashboard' }
                : { admitted: false, status: 403, actorId: '', reason: 'request refused' };
        }
        if (result && typeof result === 'object') {
            const rec = result;
            if ('rejection' in rec && typeof rec.rejection === 'number') {
                const status = rec.rejection === 401 ? 401 : 403;
                return { admitted: false, status, actorId: '', reason: 'request refused' };
            }
            if ('peer' in rec && rec.peer !== undefined && rec.peer !== null) {
                const peerId = typeof rec.peer === 'object' ? rec.peer.id : undefined;
                const actorId = typeof peerId === 'string' && peerId.length <= 128 ? `peer:${peerId}` : 'authenticated-dashboard';
                return { admitted: true, status: 200, actorId };
            }
        }
        return { admitted: false, status: 403, actorId: '', reason: 'invalid admission response' };
    }
    catch {
        return { admitted: false, status: 503, actorId: '', reason: 'connection admission unavailable' };
    }
}
