const USAGE = [
    'Antigravity Swarm commands (/ag-swarm):',
    '  /ag-swarm                       Show current swarm status & roster',
    '  /ag-swarm status                Show current swarm status & roster',
    '  /ag-swarm title <title>         Set the swarm title',
    '  /ag-swarm add <name> <brief>    Spawn a parallel worker with a brief',
    '  /ag-swarm post <message>        Post a message to the shared blackboard',
    '  /ag-swarm kill <name>           Permanently stop a worker & clean isolated workspace',
    '  /ag-swarm help                  Show this usage guide',
    '  /ag-swarm <goal>                Initialize a swarm for <goal> as coordinator',
    '',
    'Coordinator tip: after calling swarm{action:"add"}, immediately loop calling swarm_wait{since: head} so this DSH session stays actively running in the sidebar at zero LLM tokens until workers report back.',
].join('\n');
function sessionIdOf(agent) {
    const a = agent;
    const candidate = a?.session?.id ?? a?.id;
    return typeof candidate === 'string' && candidate.length > 0 ? candidate : 'default-session';
}
function cwdOf(agent) {
    const a = agent;
    const cwd = a?.session?.header?.cwd;
    return typeof cwd === 'string' && cwd.length > 0 ? cwd : process.cwd();
}
export async function handleAgSwarmCommand(store, pool, rawInput, agent) {
    const trimmed = rawInput.trim();
    const sessionId = sessionIdOf(agent);
    const cwd = cwdOf(agent);
    if (!trimmed || trimmed.toLowerCase() === 'status') {
        const existing = store.getSwarmBySession(sessionId);
        if (!existing) {
            const all = store.listSwarms();
            if (all.length === 0) {
                return { kind: 'success', text: 'No active swarm yet. Start one with `/ag-swarm <goal>` or call `swarm{action:"add"}`.' };
            }
            const lines = all.slice(0, 10).map((s) => `- ${s.swarm_id} "${s.title || '(untitled)'}" (head #${s.head}, ${s.workingCount}/${s.memberCount} working)`);
            return { kind: 'success', text: `Swarms:\n${lines.join('\n')}` };
        }
        const members = Object.values(existing.members);
        const lines = [
            `Swarm ${existing.swarm_id}: "${existing.title || '(untitled)'}" (head #${existing.head})`,
            ...members.map((m) => `  - @${m.name} [${m.role}/${m.state}] model=${m.model} ws=${m.workspace_mode} last=#${m.last_post_seq ?? 0}`),
        ];
        return { kind: 'success', text: lines.join('\n') };
    }
    const spaceIdx = trimmed.search(/\s/);
    const sub = (spaceIdx < 0 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase();
    const rest = spaceIdx < 0 ? '' : trimmed.slice(spaceIdx + 1).trim();
    if (sub === 'help' || sub === '?') {
        return { kind: 'success', text: USAGE };
    }
    try {
        const swarm = pool.ensureSwarmForSession(sessionId, undefined, cwd);
        if (sub === 'title') {
            if (!rest)
                return { kind: 'error', text: 'usage: /ag-swarm title <title>' };
            store.setTitle(swarm.swarm_id, rest);
            return { kind: 'success', text: `Swarm title set to "${rest}".` };
        }
        if (sub === 'post') {
            if (!rest)
                return { kind: 'error', text: 'usage: /ag-swarm post <message>' };
            const { message, woken } = await pool.postMessage(swarm.swarm_id, { agent: 'coordinator', text: rest });
            return { kind: 'success', text: `Posted #${message.seq}${woken.length ? ` (woke: ${woken.map((w) => `@${w}`).join(', ')})` : ''}.` };
        }
        if (sub === 'kill') {
            if (!rest)
                return { kind: 'error', text: 'usage: /ag-swarm kill <worker-name>' };
            await pool.killMember(swarm.swarm_id, 'coordinator', rest);
            return { kind: 'success', text: `Killed worker @${rest}.` };
        }
        if (sub === 'add') {
            const m = /^([a-z0-9][a-z0-9_-]{0,23})\s+([\s\S]+)$/i.exec(rest);
            if (!m)
                return { kind: 'error', text: 'usage: /ag-swarm add <name> <brief>' };
            const spawned = await pool.addWorkers({
                swarmId: swarm.swarm_id,
                callerName: 'coordinator',
                callerAgent: agent,
                name: m[1].toLowerCase(),
                brief: m[2].trim(),
            });
            return {
                kind: 'success',
                text: `Spawned ${spawned.map((w) => `@${w.name}`).join(', ')} in ${swarm.swarm_id}. Call swarm_wait{since: ${swarm.head}} to wait for their reports while keeping this session active.`,
            };
        }
        // Default: treat full text as a goal to initialize the swarm
        const title = trimmed.length > 72 ? `${trimmed.slice(0, 72)}…` : trimmed;
        store.setTitle(swarm.swarm_id, title);
        const { message } = await pool.postMessage(swarm.swarm_id, {
            agent: 'coordinator',
            text: `Swarm goal: ${trimmed}`,
        });
        return {
            kind: 'success',
            text: [
                `Swarm ${swarm.swarm_id} initialized ("${title}", #${message.seq}).`,
                'Next steps as coordinator:',
                '1. Use `swarm{action:"add", name, brief, workspace}` to spawn parallel workers on disjoint scopes.',
                `2. Immediately loop calling \`swarm_wait{since: ${message.seq}}\` after dispatching so this DSH main session stays actively running in the sidebar at zero LLM tokens until workers report back.`,
                '3. Post `[done]` on the board when all work is integrated.',
            ].join('\n'),
        };
    }
    catch (err) {
        return { kind: 'error', text: err instanceof Error ? err.message : String(err) };
    }
}
export function registerSwarmCommand(ctx, store, pool, config) {
    const commands = ctx.get('commands');
    if (!commands || typeof commands.register !== 'function')
        return () => { };
    const disposers = [];
    const registerOne = (name) => {
        try {
            const dispose = commands.register({
                name,
                description: 'Antigravity Swarm: launch and manage persistent parallel workers, shared channel board, and coordinator swarm_wait.',
                input: { hint: '[<goal>|status|title <t>|add <name> <brief>|post <msg>|kill <name>|help]' },
                handler: async (invocation) => {
                    const rawInput = typeof invocation.rawInput === 'string' ? invocation.rawInput : '';
                    return handleAgSwarmCommand(store, pool, rawInput, invocation.agent);
                },
            });
            if (typeof dispose === 'function')
                disposers.push(dispose);
        }
        catch (err) {
            ctx.logger?.('ag-swarm').warn('failed to register command /%s: %s', name, String(err));
        }
    };
    registerOne('ag-swarm');
    if (config.registerSwarmCommandAlias && !(typeof commands.has === 'function' && commands.has('swarm'))) {
        registerOne('swarm');
    }
    return () => {
        for (const dispose of disposers) {
            try {
                dispose();
            }
            catch { /* ignore */ }
        }
    };
}
