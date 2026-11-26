import fs from 'node:fs'
import type {
  AttentionItem,
  BoardMessage,
  EdgeView,
  MemberRecord,
  ScreenshotFrame,
  SwarmSnapshotPayload,
  ThreadPriorityState,
  ThreadView,
} from '../shared/protocol.js'
import {
  canMemberSeeMessage,
  extractScreenshots,
  isAllVisibilityMember,
  isControlMessage,
  isKilled,
  MAIN_CHANNEL,
  parseMentions,
} from './channels.js'
import type { SwarmState } from './store.js'

export interface BuildSnapshotOptions {
  etag?: string
  tail?: number
  since?: number
  knownMembers?: number
  now?: number
  callerName?: string
}

const DEFAULT_TAIL = 200
const PINNED_TEXT_CAP = 2048
const MAX_FRAMES = 24
const MAX_FRAME_BYTES = 8 * 1024 * 1024
const STUCK_THRESHOLD_MS = 10 * 60 * 1000
const BRIEF_MENTION_RE = /^@([a-z0-9][a-z0-9_-]*)/i
const STALL_TAG_RE = /\[stall\]/i
const DONE_TAG_RE = /\[done\]/i
const NUMBERED_GROUP_RE = /^(.+)-\d+$/

const THREAD_PRIORITY: Record<ThreadPriorityState, number> = {
  needs: 0,
  waiting: 1,
  stuck: 2,
  running: 3,
  queued: 4,
  done: 5,
}

function isRoleOnlyMember(name: string, member?: MemberRecord): boolean {
  if (member?.role === 'monitor') return true
  return /^(?:monitor|narrator)(?:-\d+)?$/i.test(name)
}

function isTeamWorker(name: string, member?: MemberRecord): boolean {
  if (!member) return false
  return member.role !== 'coordinator' && !isRoleOnlyMember(name, member)
}

function parseTimeMs(time?: string): number {
  if (!time) return 0
  const parsed = Date.parse(time)
  return Number.isFinite(parsed) ? parsed : 0
}

function isEffectiveFailure(m?: MemberRecord): boolean {
  if (!m?.failure) return false
  const failTs = parseTimeMs(m.failure.at)
  const postTs = parseTimeMs(m.last_post_time)
  if (postTs > 0 && failTs > 0 && postTs > failTs) return false
  if (m.state === 'working' && m.activity_kind !== 'error' && (m.steps_count ?? 0) > 1) return false
  return true
}

function isFrameSizeValid(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath)
    if (!stat.isFile()) return false
    return stat.size > 0 && stat.size <= MAX_FRAME_BYTES
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException | undefined)?.code
    // Keep metadata for non-local/synthetic paths so /frame can verify at request time.
    return code === 'ENOENT'
  }
}

function buildPinnedMessages(state: SwarmState, startOffset: number): BoardMessage[] {
  const all = state.messages
  if (startOffset <= 0 || !all.length) return []

  const pinnedIdx = new Set<number>()
  const addIdx = (idx: number) => {
    if (idx >= 0 && idx < startOffset) pinnedIdx.add(idx)
  }

  let firstTeamIdx = -1
  let lastStallIdx = -1
  const firstBriefIdx = new Map<string, number>()
  const lastTeamMsgIdx = new Map<string, number>()

  for (let i = 0; i < all.length; i++) {
    const m = all[i]
    if (isControlMessage(m)) continue
    if (m.kind === 'stall' || STALL_TAG_RE.test(m.text)) lastStallIdx = i
    const member = state.members[m.agent]
    if (isRoleOnlyMember(m.agent, member)) continue
    if (firstTeamIdx < 0) firstTeamIdx = i
    lastTeamMsgIdx.set(m.agent, i)
    if (m.kind === 'brief' || m.agent === 'coordinator') {
      const target = m.mentions[0] || BRIEF_MENTION_RE.exec(m.text)?.[1]?.toLowerCase()
      if (target && !firstBriefIdx.has(target)) firstBriefIdx.set(target, i)
    }
  }

  addIdx(firstTeamIdx)
  addIdx(lastStallIdx)
  for (const idx of firstBriefIdx.values()) addIdx(idx)
  for (const idx of lastTeamMsgIdx.values()) addIdx(idx)

  // Pin wakeup posts for currently working members
  for (const member of Object.values(state.members)) {
    if (isKilled(member) || member.state !== 'working' || isRoleOnlyMember(member.name, member)) continue
    const lastOwnIdx = lastTeamMsgIdx.get(member.name) ?? -1
    const wakeAfter = Math.max(member.wait_since || 0, lastOwnIdx >= 0 ? all[lastOwnIdx].seq : 0)
    for (let i = all.length - 1; i >= 0; i--) {
      const q = all[i]
      if (q.seq <= wakeAfter) break
      if (isControlMessage(q) || q.agent === member.name) continue
      const parsed = parseMentions(q.text, state.members, state.channels, q.agent)
      if (parsed.targets.includes(member.name)) {
        addIdx(i)
        break
      }
    }
  }

  return [...pinnedIdx]
    .sort((a, b) => a - b)
    .map((idx) => {
      const msg = all[idx]
      if (idx === lastStallIdx || msg.text.length <= PINNED_TEXT_CAP) return msg
      return { ...msg, text: msg.text.slice(0, PINNED_TEXT_CAP) }
    })
}

function computeEdges(state: SwarmState): EdgeView[] {
  const edgeMap = new Map<string, EdgeView>()
  const memberNames = Object.keys(state.members)

  const recordEdge = (from: string, to: string, kind: EdgeView['kind'], msg: BoardMessage) => {
    if (from === to || isRoleOnlyMember(from, state.members[from]) || isRoleOnlyMember(to, state.members[to])) return
    const key = `${from}\0${to}\0${kind}`
    const existing = edgeMap.get(key)
    if (existing) {
      existing.count += 1
      if (msg.seq >= existing.lastSeq) {
        existing.lastSeq = msg.seq
        existing.lastTime = msg.time
      }
    } else {
      edgeMap.set(key, { from, to, count: 1, kind, lastSeq: msg.seq, lastTime: msg.time })
    }
  }

  for (const msg of state.messages) {
    if (isControlMessage(msg)) continue
    const from = msg.agent
    const directSet = new Set<string>()
    for (const to of msg.mentions) {
      if (to !== from) {
        directSet.add(to)
        recordEdge(from, to, 'direct', msg)
      }
    }
    const channelSet = new Set<string>()
    for (const chName of msg.channel_mentions) {
      const ch = state.channels[chName]
      if (!ch) continue
      for (const sub of ch.subscribers) {
        if (sub !== from && !directSet.has(sub) && !channelSet.has(sub)) {
          channelSet.add(sub)
          recordEdge(from, sub, 'channel', msg)
        }
      }
    }
    if (msg.is_all) {
      for (const to of memberNames) {
        if (to !== from && !directSet.has(to) && !channelSet.has(to)) {
          recordEdge(from, to, 'all', msg)
        }
      }
    }
  }

  return [...edgeMap.values()].sort((a, b) => b.lastSeq - a.lastSeq || b.count - a.count || a.from.localeCompare(b.from))
}

function extractValidFrames(state: SwarmState): ScreenshotFrame[] {
  const byPath = new Map<string, ScreenshotFrame>()
  for (const msg of state.messages) {
    if (isControlMessage(msg)) continue
    for (const frame of extractScreenshots(msg.text, msg)) {
      if (!isFrameSizeValid(frame.path)) continue
      const key = frame.path.replace(/\\/g, '/')
      byPath.delete(key)
      byPath.set(key, frame)
    }
  }
  return [...byPath.values()].slice(-MAX_FRAMES)
}

function computeDoneMembers(state: SwarmState): Set<string> {
  const done = new Set<string>()
  for (const msg of state.messages) {
    if (isControlMessage(msg)) continue
    if (msg.kind === 'done' || DONE_TAG_RE.test(msg.text)) {
      done.add(msg.agent)
    }
  }
  return done
}

function computeStuckMembers(state: SwarmState, nowMs: number): Set<string> {
  const stuck = new Set<string>()
  const lastActivityTs = new Map<string, number>()

  for (const msg of state.messages) {
    if (isControlMessage(msg)) continue
    const ts = Number.isFinite(msg.ts) && msg.ts > 0 ? msg.ts : parseTimeMs(msg.time)
    if (ts > 0) {
      lastActivityTs.set(msg.agent, Math.max(lastActivityTs.get(msg.agent) ?? 0, ts))
      for (const m of msg.mentions) {
        if (!lastActivityTs.has(m)) lastActivityTs.set(m, ts)
      }
    }
  }

  const fallbackTs = parseTimeMs(state.created_at)
  for (const member of Object.values(state.members)) {
    if (isKilled(member) || isRoleOnlyMember(member.name, member)) continue
    if (member.failure?.kind === 'stuck') {
      stuck.add(member.name)
      continue
    }
    if (member.state !== 'working') continue
    const postTs = parseTimeMs(member.last_post_time)
    const msgTs = lastActivityTs.get(member.name) ?? 0
    const memberLastTs = postTs > 0 || msgTs > 0 ? Math.max(postTs, msgTs) : fallbackTs
    if (memberLastTs > 0 && nowMs - memberLastTs > STUCK_THRESHOLD_MS) {
      stuck.add(member.name)
    }
  }
  return stuck
}

function resolveThreadState(
  tasks: ThreadView['tasks'],
  members: Record<string, MemberRecord>,
  stuckSet: Set<string>,
): { state: ThreadPriorityState; now?: string } {
  if (!tasks.length) return { state: 'queued' }
  let hasNeeds = false
  let hasWaiting = false
  let hasStuck = false
  let hasRunning = false
  let hasQueued = false
  let needsDetail: string | undefined
  let waitingDetail: string | undefined
  let stuckDetail: string | undefined
  let runningDetail: string | undefined

  for (const t of tasks) {
    const m = members[t.name]
    const active = !isKilled(m)
    if (active && isEffectiveFailure(m) && (m!.failure!.kind === 'error' || m!.failure!.kind === 'quota')) {
      hasNeeds = true
      needsDetail ||= `@${t.name}: ${m!.failure!.message}`
    } else if (active && t.state === 'waiting' && t.waiting_on && t.waiting_on.length > 0 && !t.done) {
      hasWaiting = true
      waitingDetail ||= `@${t.name} waiting on ${t.waiting_on.map((w) => `@${w}`).join(', ')}`
    } else if (active && stuckSet.has(t.name)) {
      hasStuck = true
      stuckDetail ||= `@${t.name} working >10m without update`
    } else if (active && t.state === 'working') {
      hasRunning = true
      runningDetail ||= t.activity ? `@${t.name}: ${t.activity}` : `@${t.name} working`
    } else if (!t.done && active) {
      hasQueued = true
    }
  }

  if (hasNeeds) return { state: 'needs', now: needsDetail }
  if (hasWaiting) return { state: 'waiting', now: waitingDetail }
  if (hasStuck) return { state: 'stuck', now: stuckDetail }
  if (hasRunning) return { state: 'running', now: runningDetail }
  if (hasQueued) return { state: 'queued' }
  return { state: 'done' }
}

function computeThreads(state: SwarmState, doneSet: Set<string>, stuckSet: Set<string>): ThreadView[] {
  const toTaskView = (name: string, label?: string): ThreadView['tasks'][number] => {
    const m = state.members[name]
    const isDone = Boolean(doneSet.has(name) && m?.state !== 'working')
    return {
      name,
      label: label || state.plan?.tasks[name] || m?.task_hint || name,
      state: m?.state ?? 'stopped',
      done: isDone,
      activity: m?.activity,
      waiting_on: m?.waiting_on,
      failure: isEffectiveFailure(m) ? m?.failure?.message : undefined,
    }
  }

  const threads: ThreadView[] = []
  if (state.plan && Array.isArray(state.plan.threads) && state.plan.threads.length > 0) {
    const covered = new Set<string>()
    for (const pt of state.plan.threads) {
      const tasks = pt.tasks.map((name) => {
        covered.add(name)
        return toTaskView(name, state.plan?.tasks[name])
      })
      const { state: threadState, now } = resolveThreadState(tasks, state.members, stuckSet)
      const done = tasks.filter((t) => t.done).length
      threads.push({ id: pt.id, title: pt.title, goal: pt.goal, state: threadState, now, tasks, progress: { done, total: tasks.length } })
    }
    const extra = Object.values(state.members).filter((m) => isTeamWorker(m.name, m) && !covered.has(m.name))
    if (extra.length > 0) {
      const tasks = extra.map((m) => toTaskView(m.name))
      const { state: threadState, now } = resolveThreadState(tasks, state.members, stuckSet)
      const done = tasks.filter((t) => t.done).length
      threads.push({ id: 'other', title: 'Other Workers', goal: 'Unassigned swarm members', state: threadState, now, tasks, progress: { done, total: tasks.length } })
    }
  } else {
    const groups = new Map<string, { title: string; goal: string; members: MemberRecord[] }>()
    for (const m of Object.values(state.members)) {
      if (!isTeamWorker(m.name, m)) continue
      const primaryCh = m.channels.find((c) => c !== MAIN_CHANNEL && c !== '*')
      const groupMatch = m.name.match(NUMBERED_GROUP_RE)
      const key = primaryCh ? `ch:${primaryCh}` : groupMatch ? `grp:${groupMatch[1]}` : 'general'
      const title = primaryCh ? `#${primaryCh}` : groupMatch ? groupMatch[1] : 'Main Team'
      const goal = primaryCh && state.channels[primaryCh]?.topic ? state.channels[primaryCh].topic! : state.title || 'Active swarm tasks'
      const bucket = groups.get(key) ?? { title, goal, members: [] }
      bucket.members.push(m)
      groups.set(key, bucket)
    }
    for (const [id, group] of groups.entries()) {
      const tasks = group.members.map((m) => toTaskView(m.name))
      const { state: threadState, now } = resolveThreadState(tasks, state.members, stuckSet)
      const done = tasks.filter((t) => t.done).length
      threads.push({ id, title: group.title, goal: group.goal, state: threadState, now, tasks, progress: { done, total: tasks.length } })
    }
  }

  return threads.sort((a, b) => THREAD_PRIORITY[a.state] - THREAD_PRIORITY[b.state] || a.id.localeCompare(b.id))
}

function computeSystemAttention(state: SwarmState, stuckSet: Set<string>): AttentionItem[] {
  const items: AttentionItem[] = []
  for (const m of Object.values(state.members)) {
    if (isKilled(m) || isRoleOnlyMember(m.name, m)) continue
    if (isEffectiveFailure(m) && m.failure) {
      items.push({
        id: `failure:${m.name}`,
        kind: m.failure.kind,
        severity: m.failure.kind === 'stuck' ? 'med' : 'high',
        member: m.name,
        title: m.failure.kind === 'quota' ? `@${m.name} hit quota limit` : m.failure.kind === 'stuck' ? `@${m.name} appears stuck` : `@${m.name} encountered an error`,
        detail: m.failure.message,
      })
    } else if (stuckSet.has(m.name)) {
      items.push({
        id: `stuck:${m.name}`,
        kind: 'stuck',
        severity: 'med',
        member: m.name,
        title: `@${m.name} appears stuck`,
        detail: 'Working for more than 10 minutes without a board update',
      })
    }
  }
  return items
}

function findStallBanner(messages: BoardMessage[]): SwarmSnapshotPayload['stallBanner'] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (isControlMessage(m)) continue
    if (m.kind === 'stall' || STALL_TAG_RE.test(m.text)) {
      return { seq: m.seq, agent: m.agent, text: m.text, time: m.time }
    }
  }
  return null
}

function computeUnseen(state: SwarmState, callerName?: string): number {
  const viewer = (callerName ? state.members[callerName] : undefined) ?? state.members.coordinator
  const cursor = viewer?.last_read_seq ?? 0
  let count = 0
  for (const m of state.messages) {
    if (m.seq <= cursor || isControlMessage(m)) continue
    if (viewer) {
      if (m.agent === viewer.name) continue
      if (!isAllVisibilityMember(viewer) && !canMemberSeeMessage(viewer, m, state.channels)) continue
    }
    count++
  }
  return count
}

export function buildSnapshot(state: SwarmState, options: BuildSnapshotOptions = {}): SwarmSnapshotPayload {
  if (options.etag && options.etag === state.etag) {
    return {
      swarm_id: state.swarm_id,
      session_id: state.session_id,
      title: state.title,
      etag: state.etag,
      unchanged: true,
      head: state.head,
      messagesOffset: state.messages.length,
      messages: [],
      pinnedMessages: [],
      members: {},
      channels: {},
      plan: null,
      threads: [],
      edges: [],
      frames: [],
      systemAttention: [],
      stallBanner: null,
      stats: { totalTasks: 0, doneTasks: 0, workingCount: 0, waitingCount: 0, stuckCount: 0, errorCount: 0 },
      unseen: 0,
      created_at: state.created_at,
      updated_at: state.updated_at,
    }
  }

  const nowMs = options.now ?? Date.now()
  const memberCount = Object.keys(state.members).length
  const canDelta =
    typeof options.since === 'number' &&
    options.since >= 0 &&
    options.since <= state.head &&
    (options.knownMembers === undefined || options.knownMembers === memberCount)

  let isDelta = false
  let messages: BoardMessage[] = []
  let messagesOffset = 0
  let pinnedMessages: BoardMessage[] = []

  if (canDelta) {
    const deltaMsgs = state.messages.filter((m) => m.seq > options.since!)
    const hasControlChange = deltaMsgs.some((m) => isControlMessage(m))
    if (!hasControlChange) {
      isDelta = true
      messages = deltaMsgs
      messagesOffset = state.messages.length - deltaMsgs.length
    }
  }

  if (!isDelta) {
    const tailCount = options.tail !== undefined ? options.tail : DEFAULT_TAIL
    if (tailCount > 0 && state.messages.length > tailCount) {
      messagesOffset = state.messages.length - tailCount
      messages = state.messages.slice(messagesOffset)
      pinnedMessages = buildPinnedMessages(state, messagesOffset)
    } else {
      messagesOffset = 0
      messages = state.messages.slice()
      pinnedMessages = []
    }
  }

  const doneSet = computeDoneMembers(state)
  const stuckSet = computeStuckMembers(state, nowMs)
  const threads = computeThreads(state, doneSet, stuckSet)
  const edges = computeEdges(state)
  const frames = extractValidFrames(state)
  const systemAttention = computeSystemAttention(state, stuckSet)
  const stallBanner = findStallBanner(state.messages)

  const allMembers = Object.values(state.members)
  const activeMembers = allMembers.filter((m) => !isKilled(m))
  const totalTasks = threads.reduce((sum, t) => sum + t.progress.total, 0)
  const doneTasks = threads.reduce((sum, t) => sum + t.progress.done, 0)
  const workingCount = activeMembers.filter((m) => m.state === 'working').length
  const waitingCount = activeMembers.filter((m) => m.state === 'waiting').length
  const errorCount = activeMembers.filter((m) => isEffectiveFailure(m) && (m.failure?.kind === 'error' || m.failure?.kind === 'quota')).length

  return {
    swarm_id: state.swarm_id,
    session_id: state.session_id,
    title: state.title,
    etag: state.etag,
    ...(isDelta ? { delta: true } : {}),
    head: state.head,
    messagesOffset,
    messages,
    pinnedMessages,
    members: { ...state.members },
    channels: { ...state.channels },
    plan: state.plan,
    threads,
    edges,
    frames,
    systemAttention,
    stallBanner,
    stats: { totalTasks, doneTasks, workingCount, waitingCount, stuckCount: stuckSet.size, errorCount },
    unseen: computeUnseen(state, options.callerName),
    created_at: state.created_at,
    updated_at: state.updated_at,
  }
}
