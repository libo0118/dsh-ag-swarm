import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, isAbsolute, resolve } from 'node:path';
import { resolveSwarmConfig } from './config.js';
import { buildSnapshot } from './core/projection.js';
import { admitHttpRequest } from './runtime/dsh-adapter.js';
export const AG_SWARM_ROUTE_PREFIX = '/ag-swarm';
const MAX_BODY_BYTES = 1024 * 1024;
const BODY_READ_TIMEOUT_MS = 10_000;
const MAX_URL_CHARS = 8192;
const MAX_SSE_STREAMS = 16;
const SSE_HEARTBEAT_MS = 15_000;
const MAX_FRAME_BYTES = 8 * 1024 * 1024;
const FRAME_MIME = Object.freeze({
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
});
class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
function sendJson(res, status, body, extra = {}) {
    if (res.destroyed || res.writableEnded)
        return;
    if (res.headersSent) {
        res.destroy();
        return;
    }
    try {
        const payload = JSON.stringify(body);
        res.writeHead(status, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
            'x-content-type-options': 'nosniff',
            ...extra,
        });
        res.end(payload);
    }
    catch {
        res.destroy();
    }
}
function parseQueryInt(raw, fallback) {
    if (raw === null || raw.trim() === '')
        return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
async function readJsonBody(req) {
    const contentType = req.headers['content-type'];
    if (typeof contentType !== 'string' || contentType.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
        throw new HttpError(415, 'POST actions require application/json');
    }
    const lenHeader = req.headers['content-length'];
    if (lenHeader !== undefined && (!/^\d+$/.test(String(lenHeader)) || Number(lenHeader) > MAX_BODY_BYTES)) {
        throw new HttpError(413, 'request body too large');
    }
    const raw = await new Promise((resolveBuf, rejectBuf) => {
        const chunks = [];
        let size = 0;
        let done = false;
        const cleanup = () => {
            clearTimeout(timer);
            req.off('data', onData);
            req.off('end', onEnd);
            req.off('error', onErr);
            req.off('aborted', onAbort);
        };
        const fail = (err) => {
            if (done)
                return;
            done = true;
            cleanup();
            rejectBuf(err);
        };
        const onData = (chunk) => {
            const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'utf8');
            size += buf.length;
            if (size > MAX_BODY_BYTES) {
                fail(new HttpError(413, 'request body too large'));
                return;
            }
            chunks.push(buf);
        };
        const onEnd = () => {
            if (done)
                return;
            done = true;
            cleanup();
            resolveBuf(Buffer.concat(chunks, size));
        };
        const onErr = () => fail(new HttpError(400, 'request body read failed'));
        const onAbort = () => fail(new HttpError(400, 'request aborted'));
        const timer = setTimeout(() => fail(new HttpError(408, 'request body timeout')), BODY_READ_TIMEOUT_MS);
        timer.unref?.();
        req.on('data', onData);
        req.once('end', onEnd);
        req.once('error', onErr);
        req.once('aborted', onAbort);
        if (req.aborted || req.destroyed) {
            onAbort();
        }
        else if (typeof req.resume === 'function') {
            req.resume();
        }
    });
    if (raw.length === 0)
        throw new HttpError(400, 'JSON body required');
    let parsed;
    try {
        parsed = JSON.parse(raw.toString('utf8'));
    }
    catch {
        throw new HttpError(400, 'invalid JSON body');
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new HttpError(400, 'JSON body must be an object');
    }
    return parsed;
}
function resolveTargetSwarm(store, swarmId, sessionId) {
    if (swarmId && swarmId.trim()) {
        return store.getSwarm(swarmId.trim());
    }
    if (sessionId && sessionId.trim()) {
        const bySession = store.getSwarmBySession(sessionId.trim());
        if (bySession)
            return bySession;
    }
    const latest = store.listSwarms()[0];
    return latest ? store.getSwarm(latest.swarm_id) : undefined;
}
function openSseStream(req, res, store, streams) {
    let closed = false;
    let heartbeat;
    const writeFrame = (payload) => {
        if (closed || res.destroyed || res.writableEnded)
            return;
        try {
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
        }
        catch {
            cleanup();
        }
    };
    const onUpdate = (ev) => {
        writeFrame({
            type: 'swarm_update',
            swarmId: ev.swarmId,
            sessionId: ev.sessionId,
            etag: ev.etag,
            reason: ev.reason,
        });
    };
    const cleanup = () => {
        if (closed)
            return;
        closed = true;
        if (heartbeat !== undefined)
            clearInterval(heartbeat);
        store.off('update', onUpdate);
        req.off('close', cleanup);
        req.off('aborted', cleanup);
        req.off('error', cleanup);
        res.off('close', cleanup);
        res.off('error', cleanup);
        streams.delete(cleanup);
        if (!res.destroyed && !res.writableEnded) {
            try {
                res.end();
            }
            catch {
                res.destroy();
            }
        }
    };
    streams.add(cleanup);
    req.on('close', cleanup);
    req.on('aborted', cleanup);
    req.on('error', cleanup);
    res.on('close', cleanup);
    res.on('error', cleanup);
    res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store, no-transform',
        'x-content-type-options': 'nosniff',
        connection: 'keep-alive',
    });
    writeFrame({ type: 'connected' });
    store.on('update', onUpdate);
    heartbeat = setInterval(() => {
        writeFrame({ type: 'ping' });
    }, SSE_HEARTBEAT_MS);
    heartbeat.unref?.();
}
async function handleFrameRequest(res, rawPath) {
    if (!rawPath || !rawPath.trim()) {
        throw new HttpError(400, 'path query parameter is required');
    }
    if (rawPath.includes('\0')) {
        throw new HttpError(400, 'invalid path');
    }
    // Reject explicit traversal segments (.. as path component)
    const segments = rawPath.split(/[\\/]+/);
    if (segments.includes('..')) {
        throw new HttpError(403, 'path traversal is not allowed');
    }
    if (!isAbsolute(rawPath)) {
        throw new HttpError(400, 'frame path must be absolute');
    }
    const normalized = resolve(rawPath);
    const ext = extname(normalized).toLowerCase();
    const mime = FRAME_MIME[ext];
    if (!mime) {
        throw new HttpError(415, 'only .png, .jpg, .jpeg, and .webp frames are allowed');
    }
    let info;
    try {
        info = await stat(normalized);
    }
    catch {
        throw new HttpError(404, 'frame file not found');
    }
    if (!info.isFile()) {
        throw new HttpError(400, 'frame path is not a regular file');
    }
    if (info.size <= 0 || info.size > MAX_FRAME_BYTES) {
        throw new HttpError(413, 'frame exceeds 8MB limit');
    }
    res.writeHead(200, {
        'content-type': mime,
        'content-length': String(info.size),
        'cache-control': 'private, max-age=60',
        'x-content-type-options': 'nosniff',
    });
    const stream = createReadStream(normalized);
    stream.on('error', () => {
        if (!res.destroyed)
            res.destroy();
    });
    stream.pipe(res);
}
async function handleUiAction(store, pool, body) {
    const req = body;
    const action = String(body.action ?? '');
    switch (action) {
        case 'post_message': {
            const swarmId = String(body.swarmId ?? '').trim();
            const text = String(body.text ?? '').trim();
            if (!swarmId || !text)
                throw new HttpError(400, 'swarmId and text are required');
            const channel = typeof body.channel === 'string' && body.channel.trim() ? body.channel.trim() : undefined;
            const asAgent = typeof body.asAgent === 'string' && body.asAgent.trim() ? body.asAgent.trim() : 'coordinator';
            const res = await pool.postMessage(swarmId, { agent: asAgent, text, channel });
            return { ok: true, seq: res.message.seq, woken: res.woken };
        }
        case 'switch_model': {
            const swarmId = String(body.swarmId ?? '').trim();
            const member = String(body.member ?? '').trim();
            const model = String(body.model ?? '').trim();
            if (!swarmId || !member || !model)
                throw new HttpError(400, 'swarmId, member, and model are required');
            const updated = await pool.switchModel({
                swarmId,
                callerName: 'coordinator',
                targetName: member,
                model,
                provider: typeof body.provider === 'string' ? body.provider : undefined,
                reasoning_effort: typeof body.reasoningEffort === 'string' ? body.reasoningEffort : undefined,
            });
            return { ok: true, member: updated.name, model: updated.model, provider: updated.provider };
        }
        case 'kill_worker': {
            const swarmId = String(body.swarmId ?? '').trim();
            const member = String(body.member ?? '').trim();
            if (!swarmId || !member)
                throw new HttpError(400, 'swarmId and member are required');
            await pool.killMember(swarmId, 'coordinator', member);
            return { ok: true, killed: member };
        }
        case 'nudge_worker': {
            const swarmId = String(body.swarmId ?? '').trim();
            const member = String(body.member ?? '').trim();
            if (!swarmId || !member)
                throw new HttpError(400, 'swarmId and member are required');
            const text = typeof body.text === 'string' && body.text.trim() ? body.text.trim() : undefined;
            const res = await pool.nudgeMember(swarmId, member, text);
            return { ok: true, seq: res.message.seq, woken: res.woken };
        }
        case 'create_channel': {
            const swarmId = String(body.swarmId ?? '').trim();
            const channel = String(body.channel ?? '').trim();
            if (!swarmId || !channel)
                throw new HttpError(400, 'swarmId and channel are required');
            const topic = typeof body.topic === 'string' ? body.topic : undefined;
            const created = store.createChannel(swarmId, { channel, topic, creator: 'coordinator' });
            return { ok: true, channel: created.channel };
        }
        case 'archive_channel': {
            const swarmId = String(body.swarmId ?? '').trim();
            const channel = String(body.channel ?? '').trim();
            if (!swarmId || !channel)
                throw new HttpError(400, 'swarmId and channel are required');
            const archived = store.archiveChannel(swarmId, { channel, actor: 'coordinator' });
            return { ok: true, channel: archived.channel };
        }
        case 'update_plan': {
            const swarmId = String(body.swarmId ?? '').trim();
            const plan = body.plan;
            if (!swarmId || !plan || typeof plan !== 'object')
                throw new HttpError(400, 'swarmId and plan are required');
            const saved = store.writePlan(swarmId, plan);
            return { ok: true, plan: saved };
        }
        case 'seed_demo': {
            if (process.env.DSH_AG_SWARM_ALLOW_DEMO !== '1') {
                throw new HttpError(403, 'seed_demo is disabled unless DSH_AG_SWARM_ALLOW_DEMO=1');
            }
            const sessionId = typeof body.sessionId === 'string' && body.sessionId.trim()
                ? body.sessionId.trim()
                : `demo-session-${Date.now().toString(36)}`;
            const swarm = store.createOrGetSwarm(sessionId, 'Demo Hive Swarm', process.cwd());
            if (!swarm.members['backend-dev']) {
                store.addMember(swarm.swarm_id, {
                    name: 'backend-dev',
                    role: 'worker',
                    state: 'working',
                    model: 'deepseek-reasoner',
                    provider: 'deepseek',
                    workspace_mode: 'share',
                    branch: 'ag-swarm/demo/backend-dev',
                    task_hint: 'Implement API endpoints & tests',
                    created_by: 'coordinator',
                    depth: 1,
                });
            }
            if (!swarm.members['ui-reviewer']) {
                store.addMember(swarm.swarm_id, {
                    name: 'ui-reviewer',
                    role: 'worker',
                    state: 'waiting',
                    model: 'deepseek-chat',
                    provider: 'deepseek',
                    workspace_mode: 'inherit',
                    task_hint: 'Review UI components & accessibility',
                    created_by: 'coordinator',
                    depth: 1,
                });
            }
            if (!swarm.channels.backend) {
                store.createChannel(swarm.swarm_id, {
                    channel: 'backend',
                    topic: 'Backend API & storage workstream',
                    creator: 'coordinator',
                    subscribers: ['backend-dev'],
                });
            }
            store.appendMessage(swarm.swarm_id, {
                agent: 'coordinator',
                text: '@backend-dev Please implement the /ag-swarm routes and report back to @coordinator.',
                kind: 'brief',
            });
            store.appendMessage(swarm.swarm_id, {
                agent: 'backend-dev',
                text: '@ui-reviewer API contract is ready for UI binding; @coordinator core tests pass.',
            });
            return { ok: true, swarm_id: swarm.swarm_id, session_id: swarm.session_id };
        }
        default:
            throw new HttpError(400, `unknown action: ${String(req.action)}`);
    }
}
export function registerSwarmRoutes(ctx, store, pool, options) {
    const webServer = ctx.get('webServer');
    if (!webServer || typeof webServer.register !== 'function')
        return () => { };
    const resolvedConfig = options?.config ?? resolveSwarmConfig();
    const streams = new Set();
    const unregister = webServer.register({
        kind: 'prefix',
        path: AG_SWARM_ROUTE_PREFIX,
        async handler(req, res) {
            // Strictly authenticate via host connection.admit before parsing anything.
            const admission = await admitHttpRequest(ctx, req.headers);
            if (!admission.admitted) {
                sendJson(res, admission.status, { error: admission.reason || 'request refused' }, { connection: 'close' });
                return;
            }
            try {
                const rawUrl = req.url ?? '';
                if (rawUrl.length > MAX_URL_CHARS)
                    throw new HttpError(414, 'URL too long');
                const url = new URL(rawUrl, 'http://localhost');
                const pathname = url.pathname;
                const method = req.method ?? 'GET';
                if (pathname === `${AG_SWARM_ROUTE_PREFIX}/api/config`) {
                    if (method !== 'GET') {
                        sendJson(res, 405, { error: 'method not allowed' }, { allow: 'GET' });
                        return;
                    }
                    sendJson(res, 200, {
                        storageDir: resolvedConfig.storageDir,
                        maxWorkers: resolvedConfig.maxWorkers,
                        maxDepth: resolvedConfig.maxDepth,
                        stallCheckIntervalMs: resolvedConfig.stallCheckIntervalMs,
                        enableStallMonitor: resolvedConfig.enableStallMonitor,
                        enableWorktrees: resolvedConfig.enableWorktrees,
                        registerSwarmCommandAlias: resolvedConfig.registerSwarmCommandAlias,
                        waitToolName: options?.getWaitToolName?.() ?? 'swarm_wait',
                    });
                    return;
                }
                if (pathname === `${AG_SWARM_ROUTE_PREFIX}/api/swarms`) {
                    if (method !== 'GET') {
                        sendJson(res, 405, { error: 'method not allowed' }, { allow: 'GET' });
                        return;
                    }
                    sendJson(res, 200, { swarms: store.listSwarms() });
                    return;
                }
                if (pathname === `${AG_SWARM_ROUTE_PREFIX}/api/swarm`) {
                    if (method !== 'GET') {
                        sendJson(res, 405, { error: 'method not allowed' }, { allow: 'GET' });
                        return;
                    }
                    const swarm = resolveTargetSwarm(store, url.searchParams.get('swarmId'), url.searchParams.get('sessionId'));
                    if (!swarm) {
                        sendJson(res, 200, { empty: true, swarm: null });
                        return;
                    }
                    const snapshot = buildSnapshot(swarm, {
                        etag: url.searchParams.get('etag') ?? undefined,
                        tail: parseQueryInt(url.searchParams.get('tail')),
                        since: parseQueryInt(url.searchParams.get('since')),
                        knownMembers: parseQueryInt(url.searchParams.get('knownMembers')),
                    });
                    sendJson(res, 200, snapshot);
                    return;
                }
                if (pathname === `${AG_SWARM_ROUTE_PREFIX}/api/swarm/messages`) {
                    if (method !== 'GET') {
                        sendJson(res, 405, { error: 'method not allowed' }, { allow: 'GET' });
                        return;
                    }
                    const swarm = resolveTargetSwarm(store, url.searchParams.get('swarmId'), url.searchParams.get('sessionId'));
                    if (!swarm)
                        throw new HttpError(404, 'swarm not found');
                    const beforeSeq = parseQueryInt(url.searchParams.get('beforeSeq') ?? url.searchParams.get('before'), swarm.head + 1);
                    const limit = parseQueryInt(url.searchParams.get('limit'), 200);
                    const fromSeq = parseQueryInt(url.searchParams.get('fromSeq') ?? url.searchParams.get('from'));
                    sendJson(res, 200, store.readBeforeSeq(swarm.swarm_id, { beforeSeq, limit, fromSeq }));
                    return;
                }
                if (pathname === `${AG_SWARM_ROUTE_PREFIX}/api/swarm/raw`) {
                    if (method !== 'GET') {
                        sendJson(res, 405, { error: 'method not allowed' }, { allow: 'GET' });
                        return;
                    }
                    const swarm = resolveTargetSwarm(store, url.searchParams.get('swarmId'), url.searchParams.get('sessionId'));
                    if (!swarm)
                        throw new HttpError(404, 'swarm not found');
                    sendJson(res, 200, store.getRawFiles(swarm.swarm_id));
                    return;
                }
                if (pathname === `${AG_SWARM_ROUTE_PREFIX}/api/frame`) {
                    if (method !== 'GET') {
                        sendJson(res, 405, { error: 'method not allowed' }, { allow: 'GET' });
                        return;
                    }
                    await handleFrameRequest(res, url.searchParams.get('path'));
                    return;
                }
                if (pathname === `${AG_SWARM_ROUTE_PREFIX}/api/member-transcript`) {
                    if (method !== 'GET') {
                        sendJson(res, 405, { error: 'method not allowed' }, { allow: 'GET' });
                        return;
                    }
                    const swarm = resolveTargetSwarm(store, url.searchParams.get('swarmId'), url.searchParams.get('sessionId'));
                    const member = url.searchParams.get('member')?.trim();
                    if (!swarm || !member)
                        throw new HttpError(400, 'swarmId and member are required');
                    const payload = await pool.getMemberTranscript(swarm.swarm_id, member);
                    sendJson(res, 200, payload);
                    return;
                }
                if (pathname === `${AG_SWARM_ROUTE_PREFIX}/api/events`) {
                    if (method !== 'GET') {
                        sendJson(res, 405, { error: 'method not allowed' }, { allow: 'GET' });
                        return;
                    }
                    if (streams.size >= MAX_SSE_STREAMS) {
                        sendJson(res, 429, { error: 'too many SSE streams' }, { 'retry-after': '15' });
                        return;
                    }
                    openSseStream(req, res, store, streams);
                    return;
                }
                if (pathname === `${AG_SWARM_ROUTE_PREFIX}/api/action`) {
                    if (method !== 'POST') {
                        sendJson(res, 405, { error: 'method not allowed' }, { allow: 'POST' });
                        return;
                    }
                    const body = await readJsonBody(req);
                    const result = await handleUiAction(store, pool, body);
                    sendJson(res, 200, result);
                    return;
                }
                sendJson(res, 404, { error: 'not found' });
            }
            catch (err) {
                const status = err instanceof HttpError ? err.status : 400;
                const msg = err instanceof Error ? err.message : String(err);
                sendJson(res, status, { error: msg.slice(0, 2048) });
            }
        },
    });
    let disposed = false;
    return () => {
        if (disposed)
            return;
        disposed = true;
        try {
            if (typeof unregister === 'function')
                unregister();
        }
        finally {
            for (const cleanup of [...streams])
                cleanup();
        }
    };
}
