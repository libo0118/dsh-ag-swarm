import type { BoardMessage, ChannelMeta, MemberRecord, SwarmConfig } from '../shared/protocol.js'

export interface MonitorSwarmView {
  swarmId: string
  head: number
  members: Record<string, MemberRecord>
  channels: Record<string, ChannelMeta>
  messages: BoardMessage[]
}

export interface StallDiagnosis {
  cause: 'unanswered_mention' | 'unaddressed_result' | 'waiting_chain' | 'idle_stall'
  signature: string
  target: string
  message: string
}

export interface StallMonitorDeps {
  config: Pick<SwarmConfig, 'enableStallMonitor' | 'stallCheckIntervalMs'>
  listSwarmViews: () => MonitorSwarmView[]
  postStallAlert: (swarmId: string, text: string) => Promise<void> | void
  logger?: { info: (...a: unknown[]) => void; warn: (...a: unknown[]) => void; error: (...a: unknown[]) => void }
}

interface SwarmTrackState {
  lastHead: number
  lastStateFingerprint: string
  lastSignature: string | null
  alertCount: number
  ticksSinceAlert: number
  pingedMentions: Set<string>
  dormant: boolean
}

const MIN_TICKS_BETWEEN_REPEAT = 3
const MAX_ALERTS_PER_STALL = 3

function stateFingerprint(members: Record<string, MemberRecord>): string {
  return Object.values(members)
    .filter((m) => m.role !== 'monitor')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => `${m.name}:${m.state}:${m.last_post_seq ?? 0}:${m.last_read_seq}`)
    .join('|')
}

function isCoordinatorDone(messages: BoardMessage[]): boolean {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]!
    if (msg.kind === 'control' || msg.kind === 'stall') continue
    if (msg.agent === 'coordinator' && (msg.kind === 'done' || /^\[done\]/i.test(msg.text.trim()) || /\s\[done\]/i.test(msg.text))) {
      return true
    }
    // If new substantive work happened after a previous [done], swarm resumed.
    if (msg.kind === 'brief' || msg.agent !== 'monitor') {
      return false
    }
  }
  return false
}

function isMemberTargetedByMessage(member: MemberRecord, msg: BoardMessage, channels: Record<string, ChannelMeta>): boolean {
  if (msg.agent === member.name) return false
  if (msg.kind === 'control' || msg.kind === 'stall') return false
  if (msg.is_all) return true
  if (msg.mentions.includes(member.name)) return true
  for (const ch of msg.channel_mentions) {
    const meta = channels[ch]
    if (meta && !meta.archived && meta.subscribers.includes(member.name)) return true
  }
  return false
}

export function diagnoseStall(
  view: MonitorSwarmView,
  pingedMentions: ReadonlySet<string>,
): StallDiagnosis | null {
  const nonMonitor = Object.values(view.members).filter((m) => m.role !== 'monitor' && !m.killed)
  if (nonMonitor.length === 0) return null
  const workers = nonMonitor.filter((m) => m.role !== 'coordinator')
  if (workers.length === 0) return null
  if (isCoordinatorDone(view.messages)) return null

  // If anyone is actively working, the swarm is making progress.
  if (nonMonitor.some((m) => m.state === 'working')) return null

  const coordinator = view.members.coordinator
  const lastMsg = [...view.messages].reverse().find((m) => m.kind !== 'control' && m.kind !== 'stall')
  const sinceTime = lastMsg?.time ?? ''

  // 1. Check unanswered @mentions targeting any live member
  for (let i = view.messages.length - 1; i >= 0; i--) {
    const msg = view.messages[i]!
    if (msg.kind === 'control' || msg.kind === 'stall') continue
    for (const member of nonMonitor) {
      if (member.name === 'coordinator') continue
      if (!isMemberTargetedByMessage(member, msg, view.channels)) continue
      const lastPosted = member.last_post_seq ?? 0
      if (msg.seq > lastPosted) {
        const mentionKey = `${member.name}:${msg.seq}`
        if (pingedMentions.has(mentionKey)) {
          return {
            cause: 'unanswered_mention',
            signature: `escalate:${mentionKey}:${view.head}`,
            target: 'coordinator',
            message: `@coordinator [stall] @${member.name} has not replied to #${msg.seq} after a re-ping (may be out of quota or errored — consider switching model).`,
          }
        }
        return {
          cause: 'unanswered_mention',
          signature: `mention:${mentionKey}`,
          target: member.name,
          message: `@${member.name} [stall] #${msg.seq} is for you (unanswered since ${msg.time}).`,
        }
      }
    }
  }

  // 2. Check results addressed to nobody / unread posts for coordinator
  if (coordinator && !coordinator.killed) {
    const coordRead = coordinator.last_read_seq ?? 0
    const unread = view.messages.filter(
      (m) =>
        m.seq > coordRead &&
        m.agent !== 'coordinator' &&
        m.agent !== 'monitor' &&
        m.kind !== 'control' &&
        m.kind !== 'stall',
    )
    if (unread.length > 0) {
      const seqList = unread.slice(-5).map((m) => `#${m.seq} (${m.agent}${m.channel !== 'main' ? ` in #${m.channel}` : ''})`).join(', ')
      return {
        cause: 'unaddressed_result',
        signature: `unaddressed:${unread[unread.length - 1]!.seq}`,
        target: 'coordinator',
        message: `@coordinator [stall] ${seqList} went unread/unaddressed; everyone has been waiting since ${sinceTime}.`,
      }
    }
  }

  // 3. Check waiting chains or channel deadlocks
  const waitingChain = nonMonitor.filter((m) => Array.isArray(m.waiting_on) && m.waiting_on.length > 0)
  if (waitingChain.length > 0) {
    const chainSummary = waitingChain.map((m) => `${m.name}->${m.waiting_on!.join(',')}`).join('; ')
    const lastRef = lastMsg ? `#${lastMsg.seq}` : '#0'
    return {
      cause: 'waiting_chain',
      signature: `chain:${chainSummary}:${view.head}`,
      target: 'coordinator',
      message: `@coordinator [stall] Waiting chain detected (${chainSummary}) with no active worker since ${sinceTime} (last ${lastRef}).`,
    }
  }

  // 4. General idle stall: everyone waiting/stopped with nothing active
  const rosterSummary = nonMonitor
    .map((m) => `${m.name}(${m.state}, #${m.last_post_seq ?? 0})`)
    .join(', ')
  return {
    cause: 'idle_stall',
    signature: `idle:${view.head}:${stateFingerprint(view.members)}`,
    target: 'coordinator',
    message: `@coordinator [stall] All members are waiting/stopped (${rosterSummary}) since ${sinceTime}.`,
  }
}

export class SwarmStallMonitor {
  private readonly tracks = new Map<string, SwarmTrackState>()
  private timer: ReturnType<typeof setInterval> | undefined
  private disposed = false

  constructor(private readonly deps: StallMonitorDeps) {}

  start(): void {
    if (this.disposed || !this.deps.config.enableStallMonitor) return
    if (this.timer !== undefined) return
    const intervalMs = Math.max(5_000, this.deps.config.stallCheckIntervalMs || 180_000)
    this.timer = setInterval(() => {
      void this.tick()
    }, intervalMs)
    this.timer.unref?.()
  }

  stop(): void {
    this.disposed = true
    if (this.timer !== undefined) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

  async tick(): Promise<Array<{ swarmId: string; diagnosis: StallDiagnosis }>> {
    const fired: Array<{ swarmId: string; diagnosis: StallDiagnosis }> = []
    let views: MonitorSwarmView[]
    try {
      views = this.deps.listSwarmViews()
    } catch (err) {
      this.deps.logger?.warn('stall monitor failed to list swarms: %s', String(err))
      return fired
    }

    for (const view of views) {
      const result = await this.checkSwarm(view)
      if (result) fired.push({ swarmId: view.swarmId, diagnosis: result })
    }
    return fired
  }

  async checkSwarm(view: MonitorSwarmView): Promise<StallDiagnosis | null> {
    let track = this.tracks.get(view.swarmId)
    if (!track) {
      track = {
        lastHead: view.head,
        lastStateFingerprint: stateFingerprint(view.members),
        lastSignature: null,
        alertCount: 0,
        ticksSinceAlert: MIN_TICKS_BETWEEN_REPEAT,
        pingedMentions: new Set(),
        dormant: false,
      }
      this.tracks.set(view.swarmId, track)
    }

    const done = isCoordinatorDone(view.messages)
    if (done) {
      track.dormant = true
      track.lastHead = view.head
      track.lastStateFingerprint = stateFingerprint(view.members)
      return null
    }

    const fp = stateFingerprint(view.members)
    const changed = view.head !== track.lastHead || fp !== track.lastStateFingerprint
    if (changed) {
      track.dormant = false
      track.lastHead = view.head
      track.lastStateFingerprint = fp
    }

    const diagnosis = diagnoseStall(view, track.pingedMentions)
    if (!diagnosis) {
      track.lastSignature = null
      track.alertCount = 0
      track.ticksSinceAlert = MIN_TICKS_BETWEEN_REPEAT
      if (changed) track.pingedMentions.clear()
      return null
    }

    const sameSignature = track.lastSignature === diagnosis.signature
    if (sameSignature) {
      track.ticksSinceAlert += 1
      if (track.alertCount >= MAX_ALERTS_PER_STALL) return null
      if (track.ticksSinceAlert < MIN_TICKS_BETWEEN_REPEAT) return null
    } else {
      track.lastSignature = diagnosis.signature
      track.alertCount = 0
      track.ticksSinceAlert = MIN_TICKS_BETWEEN_REPEAT
    }

    if (diagnosis.signature.startsWith('mention:')) {
      track.pingedMentions.add(diagnosis.signature.slice('mention:'.length))
    }

    track.alertCount += 1
    track.ticksSinceAlert = 0

    try {
      await this.deps.postStallAlert(view.swarmId, diagnosis.message)
      track.lastHead = view.head + 1
    } catch (err) {
      this.deps.logger?.warn('stall monitor post failed for %s: %s', view.swarmId, String(err))
    }
    return diagnosis
  }
}
