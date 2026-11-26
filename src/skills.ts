import type { HostSkillsLike, PluginContextLike } from './types/dsh-host.js'

export const COORDINATOR_SKILL_NAME = 'ag-swarm-coordinator'
export const WORKER_SKILL_NAME = 'ag-swarm-worker'

const COORDINATOR_SKILL_CONTENT = `# Antigravity Swarm Coordinator Guide

You are coordinating a multi-agent swarm using the shared blackboard and persistent parallel workers.

## Core Tools
- \`/swarm\` (alias \`/ag-swarm\`): initialize or inspect the swarm from the slash-command bar.
- \`swarm\`: manage swarm lifecycle and roster:
  - \`title\`: set a concise title for the swarm.
  - \`add\`: spawn one or more parallel workers (\`name\`, \`brief\`, optional \`role_preset\`, \`n\`, \`tasks[]\`, \`fork\`, \`workspace: "inherit" | "share" | "branch"\`, \`model\`, \`provider\`, \`reasoning_effort\`).
    - Pass \`role_preset\` (e.g. \`explorer\`, \`author\`, \`verifier\`, \`monitor\`, or a custom role) or name workers with \`-explorer\` / \`-author\` / \`-verifier\` suffixes so they automatically inherit the user's configured role model presets from Settings.
  - \`status\`: inspect every member's live state (\`working\` / \`waiting\` / \`stopped\` / \`killed\`), model, workspace, channels, and last posted \`#seq\`.
  - \`models\`: list available host models and configured \`role_presets\`.
  - \`model\`: switch a \`waiting\` worker's model in place without losing its session history.
  - \`kill\`: permanently terminate a worker and clean up its isolated \`share\`/\`branch\` workspace (land work first).
  - \`channel\`: create/archive topic channels (\`create\`, \`archive\`, \`subscribe\`, \`unsubscribe\`).
- \`post_message\`: post to \`main\` or a custom channel. Always use \`@name\`, \`@prefix\`, \`@all\`, or \`@#channel\` to wake sleeping members.
- \`read_board\`: read messages since a sequence number (\`since\`), fetch specific \`seqs\`, or inspect \`status: true\`.
- \`swarm_wait\`: **CRITICAL FOR COORDINATOR**. After dispatching workers with \`swarm{action: "add"}\` or nudging them with \`post_message\`, immediately call \`swarm_wait{since: head}\` in a loop until the swarm finishes.
  - Calling \`swarm_wait\` as the coordinator suspends inside the tool at **zero LLM token cost** while keeping the DSH session actively running in the sidebar (an embedded card shows live worker activity to the user).
  - It wakes immediately when a worker posts \`@coordinator\` / \`@all\`, when all workers finish working, when the human sends a message, or on the ~2.5m heartbeat timeout (\`reason: "heartbeat"\`, with \`worker_summary\` — post a 1-2 line progress note to the user and immediately call \`swarm_wait\` again).

## Best Practices
1. Give every worker a clear, non-overlapping file scope and explicit done criteria in its \`brief\`.
2. Use \`workspace: "share"\` when multiple workers edit/build concurrently in a Git repo, or \`workspace: "inherit"\` for disjoint files and read-only explorers.
3. Reuse existing \`waiting\` workers via \`post_message\` with \`@name\` instead of spawning duplicates.
4. When the whole goal is finished and integrated, post a final summary starting with \`[done]\` so the stall monitor goes dormant.
`

const WORKER_SKILL_CONTENT = `# Antigravity Swarm Worker Guide

You are a persistent worker in a multi-agent swarm connected to a shared blackboard.

## Core Rules
1. Start your assigned work immediately — do not post greetings or acknowledgments.
2. Stay strictly within your assigned file/module scope and workspace directory.
3. Use \`read_board\` to catch up on missed messages (pass the last \`seq\` you read as \`since\`). Refer to earlier messages by \`#seq\`.
4. Use \`post_message\` to report concrete results, ask peer questions (\`@peer-name\`), or hand off work.
   - Address only the member(s) who need to act next (\`@name\` is a wakeup doorbell, not a CC).
   - Start your final deliverable post with \`@coordinator [done] ...\` (or the member who spawned you).
5. You may spawn helpers with \`swarm{action: "add"}\` if your depth allows, and you may \`kill\` or \`model\`-switch helpers you created.
6. When you have finished your current work and have nothing left to do, call \`swarm_wait{since: LAST_SEQ}\` and stop your turn. You will sleep at zero token cost until another \`@mention\` wakes you.
`

export function registerSwarmSkills(ctx: PluginContextLike): () => void {
  const skills = ctx.get<HostSkillsLike>('skills')
  if (!skills || typeof skills.register !== 'function') {
    return () => {}
  }

  const disposers: Array<() => void> = []
  const registerOne = (skill: {
    name: string
    description: string
    source: string
    content: string
    invocation: { modelInvocable: boolean; userInvocable: boolean }
  }) => {
    try {
      const dispose = skills.register(skill)
      if (typeof dispose === 'function') disposers.push(dispose)
    } catch (err) {
      ctx.logger?.('ag-swarm').warn('failed to register skill %s: %s', skill.name, String(err))
    }
  }

  registerOne({
    name: COORDINATOR_SKILL_NAME,
    description: 'Coordinate an Antigravity-style multi-agent swarm with persistent parallel workers, shared channel blackboard, and zero-token blocking swarm_wait.',
    source: 'runtime',
    content: COORDINATOR_SKILL_CONTENT,
    invocation: { modelInvocable: true, userInvocable: true },
  })

  registerOne({
    name: WORKER_SKILL_NAME,
    description: 'Operating rules for a persistent worker inside an Antigravity-style multi-agent swarm.',
    source: 'runtime',
    content: WORKER_SKILL_CONTENT,
    invocation: { modelInvocable: true, userInvocable: false },
  })

  return () => {
    for (const dispose of disposers) {
      try { dispose() } catch { /* ignore */ }
    }
  }
}
