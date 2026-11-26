function toHostToolDefinition(spec) {
    return {
        name: spec.name,
        description: spec.description,
        parameters: spec.parameters,
        output: {
            schema: { type: 'string' },
            render: (_args, value) => [
                { type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) },
            ],
        },
        isConcurrencySafe: spec.isConcurrencySafe,
        ...(spec.timeoutMs !== undefined ? { timeoutMs: spec.timeoutMs } : {}),
        execute: spec.execute,
    };
}
function registerToolWithFallback(tools, primary, fallbackName, logger) {
    const tryRegister = (spec) => {
        if (typeof tools.has === 'function' && tools.has(spec.name))
            return undefined;
        try {
            const dispose = tools.register(toHostToolDefinition(spec));
            return typeof dispose === 'function' ? dispose : () => { };
        }
        catch (err) {
            if (fallbackName && spec.name !== fallbackName) {
                logger?.warn('tool "%s" registration conflicted (%s); falling back to "%s"', spec.name, String(err), fallbackName);
                return undefined;
            }
            logger?.warn('tool "%s" registration failed: %s', spec.name, String(err));
            return () => { };
        }
    };
    const first = tryRegister(primary);
    if (first)
        return { name: primary.name, dispose: first };
    if (fallbackName) {
        const fallbackSpec = { ...primary, name: fallbackName };
        const second = tryRegister(fallbackSpec);
        if (second)
            return { name: fallbackName, dispose: second };
    }
    return { name: fallbackName ?? primary.name, dispose: () => { } };
}
export function registerSwarmTools(ctx, store, pool) {
    const tools = ctx.get('tools');
    const logger = ctx.logger?.('ag-swarm');
    if (!tools || typeof tools.register !== 'function') {
        return {
            dispose: () => { },
            registeredNames: {
                swarm: 'swarm',
                post_message: 'post_message',
                read_board: 'read_board',
                swarm_wait: 'swarm_wait',
            },
        };
    }
    const disposers = [];
    const swarmReg = registerToolWithFallback(tools, {
        name: 'swarm',
        description: 'Manage an Antigravity-style multi-agent swarm: spawn persistent parallel workers (add), inspect roster (status), list models (models), switch a waiting worker model in place (model), kill a worker (kill), set swarm title (title), manage topic channels (channel), or publish Overview plan/threads (plan).',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                action: {
                    type: 'string',
                    enum: ['status', 'models', 'add', 'model', 'kill', 'title', 'channel', 'plan'],
                    description: 'Swarm management action to execute.',
                },
                name: { type: 'string', description: 'Worker roster name (lowercase a-z0-9_-, max 24 chars) or base name for n/tasks.' },
                brief: { type: 'string', description: 'Worker assignment posted publicly to the board for action=add.' },
                n: { type: 'integer', description: 'Spawn n homogeneous copies (<name>-1..n) for action=add.' },
                tasks: { type: 'array', items: { type: 'string' }, description: 'Per-worker slice targets (<name>-1..k) for action=add.' },
                fork: { type: 'string', description: 'Member name (or "coordinator") whose session history to fork for action=add.' },
                workspace: { type: 'string', enum: ['inherit', 'share', 'branch'], description: 'Workspace isolation mode for action=add.' },
                model: { type: 'string', description: 'Model id for action=add or action=model.' },
                provider: { type: 'string', description: 'Optional provider id for action=add or action=model.' },
                reasoning_effort: { type: 'string', description: 'Optional reasoning effort for action=add or action=model.' },
                role_preset: { type: 'string', description: 'Optional role preset key (e.g. explorer, author, verifier, monitor, or custom role from Settings) for action=add.' },
                title: { type: 'string', description: 'Short swarm title for action=title.' },
                channel_op: { type: 'string', enum: ['create', 'archive', 'subscribe', 'unsubscribe'], description: 'Channel operation for action=channel.' },
                channel: { type: 'string', description: 'Channel name (without #) for action=channel.' },
                topic: { type: 'string', description: 'Channel topic for channel_op=create.' },
                members: { type: 'array', items: { type: 'string' }, description: 'Member names for channel subscribe/unsubscribe/create.' },
                goal: {
                    type: 'object',
                    description: 'Overview goal { title, line } for action=plan.',
                    properties: { title: { type: 'string' }, line: { type: 'string' } },
                },
                plan_tasks: {
                    type: 'object',
                    description: 'Map of worker name -> short task description for action=plan.',
                },
                threads: {
                    type: 'array',
                    description: 'Overview workstream groups [{ id, title, goal, tasks }] for action=plan.',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            goal: { type: 'string' },
                            tasks: { type: 'array', items: { type: 'string' } },
                        },
                    },
                },
            },
            required: ['action'],
        },
        isConcurrencySafe: (args) => {
            const action = typeof args?.action === 'string' ? args.action : '';
            return action === 'status' || action === 'models' || action === 'add';
        },
        execute: async (args, exec) => {
            const caller = pool.resolveCaller(exec.agent);
            const action = String(args.action || '');
            switch (action) {
                case 'title': {
                    if (caller.callerName !== 'coordinator') {
                        throw new Error('Only the coordinator can set the swarm title');
                    }
                    const title = String(args.title ?? '').trim();
                    if (!title)
                        throw new Error('title is required for action="title"');
                    store.setTitle(caller.swarm.swarm_id, title);
                    return JSON.stringify({ ok: true, swarm_id: caller.swarm.swarm_id, title });
                }
                case 'status': {
                    return JSON.stringify(pool.getRosterStatus(caller.swarm.swarm_id));
                }
                case 'models': {
                    return JSON.stringify(await pool.getModelCatalogWithPresets());
                }
                case 'add': {
                    const name = String(args.name ?? '').trim();
                    const brief = String(args.brief ?? '').trim();
                    if (!name || !brief)
                        throw new Error('name and brief are required for action="add"');
                    const spawned = await pool.addWorkers({
                        swarmId: caller.swarm.swarm_id,
                        callerName: caller.callerName,
                        callerAgent: exec.agent,
                        name,
                        brief,
                        n: typeof args.n === 'number' ? args.n : undefined,
                        tasks: Array.isArray(args.tasks) ? args.tasks.map(String) : undefined,
                        fork: typeof args.fork === 'string' && args.fork.trim() ? args.fork.trim() : undefined,
                        workspace: args.workspace ?? 'inherit',
                        model: typeof args.model === 'string' ? args.model : undefined,
                        provider: typeof args.provider === 'string' ? args.provider : undefined,
                        reasoning_effort: typeof args.reasoning_effort === 'string' ? args.reasoning_effort : undefined,
                        role_preset: typeof args.role_preset === 'string' && args.role_preset.trim() ? args.role_preset.trim() : undefined,
                        signal: exec.signal,
                    });
                    return JSON.stringify({
                        ok: true,
                        swarm_id: caller.swarm.swarm_id,
                        head: store.getSwarm(caller.swarm.swarm_id)?.head ?? 0,
                        spawned: spawned.map((m) => ({
                            name: m.name,
                            state: m.state,
                            model: m.model,
                            workspace_mode: m.workspace_mode,
                            workspace: m.workspace,
                            branch: m.branch,
                        })),
                    });
                }
                case 'model': {
                    const target = typeof args.name === 'string' && args.name.trim() ? args.name.trim() : caller.callerName;
                    const model = String(args.model ?? '').trim();
                    if (!model)
                        throw new Error('model is required for action="model"');
                    const updated = await pool.switchModel({
                        swarmId: caller.swarm.swarm_id,
                        callerName: caller.callerName,
                        targetName: target,
                        model,
                        provider: typeof args.provider === 'string' ? args.provider : undefined,
                        reasoning_effort: typeof args.reasoning_effort === 'string' ? args.reasoning_effort : undefined,
                    });
                    return JSON.stringify({ ok: true, member: updated.name, model: updated.model, provider: updated.provider });
                }
                case 'kill': {
                    const target = String(args.name ?? '').trim();
                    if (!target)
                        throw new Error('name is required for action="kill"');
                    await pool.killMember(caller.swarm.swarm_id, caller.callerName, target);
                    return JSON.stringify({ ok: true, killed: target });
                }
                case 'channel': {
                    const op = String(args.channel_op ?? '');
                    const channel = String(args.channel ?? '').trim();
                    if (!op || !channel)
                        throw new Error('channel_op and channel are required for action="channel"');
                    const res = pool.manageChannel(caller.swarm.swarm_id, caller.callerName, {
                        op: op,
                        channel,
                        topic: typeof args.topic === 'string' ? args.topic : undefined,
                        members: Array.isArray(args.members) ? args.members.map(String) : undefined,
                    });
                    return JSON.stringify({ ok: true, ...res });
                }
                case 'plan': {
                    if (caller.callerName !== 'coordinator') {
                        throw new Error('Only the coordinator can update the swarm Overview plan');
                    }
                    const rawGoal = args.goal;
                    const goalTitle = typeof rawGoal?.title === 'string' && rawGoal.title.trim()
                        ? rawGoal.title.trim()
                        : caller.swarm.title || 'Swarm Plan';
                    const goalLine = typeof rawGoal?.line === 'string' ? rawGoal.line.trim() : '';
                    const rawTasks = (args.plan_tasks && typeof args.plan_tasks === 'object' ? args.plan_tasks : {});
                    const tasks = {};
                    for (const [k, v] of Object.entries(rawTasks)) {
                        if (typeof v === 'string' && v.trim())
                            tasks[k] = v.trim();
                    }
                    const rawThreads = Array.isArray(args.threads) ? args.threads : [];
                    const threads = rawThreads
                        .filter((item) => Boolean(item && typeof item === 'object'))
                        .map((item, idx) => ({
                        id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `t-${idx + 1}`,
                        title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Workstream ${idx + 1}`,
                        goal: typeof item.goal === 'string' ? item.goal.trim() : '',
                        tasks: Array.isArray(item.tasks) ? item.tasks.map(String) : [],
                    }));
                    const plan = {
                        goal: { title: goalTitle, line: goalLine },
                        tasks,
                        threads,
                    };
                    store.writePlan(caller.swarm.swarm_id, plan);
                    return JSON.stringify({ ok: true, swarm_id: caller.swarm.swarm_id, plan });
                }
                default:
                    throw new Error(`Unsupported swarm action: ${action}`);
            }
        },
    }, 'ag_swarm', logger);
    disposers.push(swarmReg.dispose);
    const postReg = registerToolWithFallback(tools, {
        name: 'post_message',
        description: 'Post a message to the shared swarm blackboard (main or a custom channel). Use @name, @prefix, @all, or @#channel to wake sleeping members.',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                text: { type: 'string', description: 'Message content to post on the board.' },
                channel: { type: 'string', description: 'Optional channel name (without #); defaults to main.' },
            },
            required: ['text'],
        },
        isConcurrencySafe: () => true,
        execute: async (args, exec) => {
            const caller = pool.resolveCaller(exec.agent);
            const text = String(args.text ?? '').trim();
            if (!text)
                throw new Error('text is required for post_message');
            const channel = typeof args.channel === 'string' && args.channel.trim() ? args.channel.trim() : undefined;
            const { message, woken } = await pool.postMessage(caller.swarm.swarm_id, {
                agent: caller.callerName,
                text,
                channel,
            });
            return JSON.stringify({
                ok: true,
                seq: message.seq,
                channel: message.channel,
                woken,
            });
        },
    }, 'ag_post_message', logger);
    disposers.push(postReg.dispose);
    const readReg = registerToolWithFallback(tools, {
        name: 'read_board',
        description: 'Read messages from the shared swarm blackboard (oldest first after `since`, exact `seqs`, or latest messages) or inspect roster status (`status: true`).',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                since: { type: 'integer', description: 'Return messages with seq > since.' },
                limit: { type: 'integer', description: 'Maximum messages to return (default 20).' },
                seqs: { type: 'array', items: { type: 'integer' }, description: 'Fetch exact message sequence numbers.' },
                channel: { type: 'string', description: 'Filter by channel name (or "*" for all visible).' },
                status: { type: 'boolean', description: 'When true, return the live member roster instead of messages.' },
            },
        },
        isConcurrencySafe: () => true,
        execute: async (args, exec) => {
            const caller = pool.resolveCaller(exec.agent);
            if (args.status === true) {
                return JSON.stringify(pool.getRosterStatus(caller.swarm.swarm_id));
            }
            const res = store.readBoard(caller.swarm.swarm_id, {
                since: typeof args.since === 'number' ? args.since : undefined,
                limit: typeof args.limit === 'number' ? args.limit : undefined,
                seqs: Array.isArray(args.seqs) ? args.seqs.map(Number).filter(Number.isFinite) : undefined,
                channel: typeof args.channel === 'string' ? args.channel : undefined,
                callerName: caller.callerName,
            });
            return JSON.stringify(res);
        },
    }, 'ag_read_board', logger);
    disposers.push(readReg.dispose);
    const waitReg = registerToolWithFallback(tools, {
        name: 'swarm_wait',
        description: 'Wait for board messages at zero LLM token cost. For coordinator: blocks inside the tool (keeping DSH session actively running in sidebar while UI shows live worker steps) until @coordinator/@all arrives, all workers become idle, user sends input, or the heartbeat timeout fires (default 2.5m). On heartbeat timeout, output a brief 1-2 line progress update from worker_summary and loop back into swarm_wait.',
        parameters: {
            type: 'object',
            additionalProperties: false,
            properties: {
                since: { type: 'integer', description: 'Highest board seq already read; wakes on messages after this seq.' },
                mentions_only: { type: 'boolean', description: 'Default true (wake on @mention/@all/@#channel); false wakes on any visible post.' },
                timeout_ms: { type: 'integer', description: 'Coordinator heartbeat checkpoint timeout in ms (1000..300000, default 150000 = 2.5m).' },
            },
            required: ['since'],
        },
        isConcurrencySafe: () => true,
        timeoutMs: 360_000,
        execute: async (args, exec) => {
            const caller = pool.resolveCaller(exec.agent);
            const since = typeof args.since === 'number' && Number.isFinite(args.since) ? Math.trunc(args.since) : 0;
            const result = await pool.waitForBoard({
                swarmId: caller.swarm.swarm_id,
                callerName: caller.callerName,
                since,
                mentions_only: typeof args.mentions_only === 'boolean' ? args.mentions_only : true,
                timeout_ms: typeof args.timeout_ms === 'number' ? args.timeout_ms : undefined,
                agent: exec.agent,
                signal: exec.signal,
            });
            return JSON.stringify(result);
        },
    }, 'ag_swarm_wait', logger);
    disposers.push(waitReg.dispose);
    return {
        dispose: () => {
            for (const d of disposers) {
                try {
                    d();
                }
                catch { /* ignore */ }
            }
        },
        registeredNames: {
            swarm: swarmReg.name,
            post_message: postReg.name,
            read_board: readReg.name,
            swarm_wait: waitReg.name,
        },
    };
}
