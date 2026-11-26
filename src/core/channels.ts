import type { BoardMessage, ChannelMeta, MemberRecord, ScreenshotFrame } from '../shared/protocol.js'

export const MAIN_CHANNEL = 'main'
export const ALL_CHANNELS = '*'
export const SCREENSHOT_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

const MEMBER_NAME_RE = /^[a-z0-9][a-z0-9_-]{0,23}$/
const CHANNEL_NAME_RE = /^[a-z][a-z0-9-]{0,23}$/
const RESERVED_CHANNEL_NAMES = new Set(['main', 'all', 'here'])
const NAME_RUNE = /[\p{L}\p{Nd}_-]/u
const ROLE_WORKER_NAME_RE = /^(?:narrator|monitor)(?:-\d+)?$/
const ALL_VISIBILITY_ROLES = new Set<string>(['coordinator', 'monitor', 'narrator'])
const NUMBERED_GROUP_RE = /^(.+)-\d+$/
const SHOT_LINE_RE = /^\s*(?:[-*]\s*)?screenshot:\s*`?((?:\/|[a-zA-Z]:[\\/])[^`|\r\n]+?\.(?:png|jpe?g|webp))`?\s*(?:\|\s*(.*?))?\s*$/i

export interface ParsedMentions {
  mentions: string[]
  channel_mentions: string[]
  via_channel: string[]
  is_all: boolean
  targets: string[]
}

export function validateMemberName(name: string): boolean {
  if (typeof name !== 'string' || !MEMBER_NAME_RE.test(name)) return false
  if (name === 'all' || name === 'coordinator' || name.startsWith('coordinator-')) return false
  return true
}

export function assertValidMemberName(name: string): void {
  if (!validateMemberName(name)) {
    throw new Error(
      `Invalid member name "${name}": must match ^[a-z0-9][a-z0-9_-]{0,23}$ and cannot be "all", "coordinator", or "coordinator-*"`,
    )
  }
}

export function validateChannelName(ch: string): boolean {
  if (typeof ch !== 'string' || !CHANNEL_NAME_RE.test(ch)) return false
  return !RESERVED_CHANNEL_NAMES.has(ch)
}

export function assertValidChannelName(ch: string): void {
  if (!validateChannelName(ch)) {
    throw new Error(
      `Invalid channel name "${ch}": must match ^[a-z][a-z0-9-]{0,23}$ and cannot be "main", "all", or "here"`,
    )
  }
}

export function isKilled(member: Pick<MemberRecord, 'killed' | 'state'> | undefined | null): boolean {
  return Boolean(member && (member.killed || member.state === 'killed'))
}

export function isControlMessage(msg: Pick<BoardMessage, 'control' | 'kind'> | undefined | null): boolean {
  return Boolean(msg && (msg.control || msg.kind === 'control'))
}

export function countsAsUnread(msg: Pick<BoardMessage, 'control' | 'kind'> | undefined | null): boolean {
  return !isControlMessage(msg)
}

export function isAllVisibilityMember(member: Pick<MemberRecord, 'name' | 'role' | 'channels'>): boolean {
  if (ALL_VISIBILITY_ROLES.has(member.role)) return true
  if (Array.isArray(member.channels) && member.channels.includes(ALL_CHANNELS)) return true
  if ((!member.role || member.role === 'worker') && ROLE_WORKER_NAME_RE.test(member.name)) return true
  return false
}

function normalizeMembers(members: Record<string, MemberRecord> | MemberRecord[]): MemberRecord[] {
  return Array.isArray(members) ? members : Object.values(members)
}

function normalizeChannels(channels?: Record<string, ChannelMeta> | ChannelMeta[]): Record<string, ChannelMeta> {
  if (!channels) return {}
  if (!Array.isArray(channels)) return channels
  const map: Record<string, ChannelMeta> = {}
  for (const ch of channels) map[ch.name] = ch
  return map
}

function prevRune(text: string, idx: number): string {
  if (idx <= 0) return ''
  const chars = [...text.slice(Math.max(0, idx - 2), idx)]
  return chars[chars.length - 1] ?? ''
}

function nextRune(text: string, idx: number): string {
  if (idx >= text.length) return ''
  const cp = text.codePointAt(idx)
  return cp === undefined ? '' : String.fromCodePoint(cp)
}

function matchesAtBoundary(lowerText: string, token: string): boolean {
  if (!token) return false
  for (let i = lowerText.indexOf('@'); i >= 0; i = lowerText.indexOf('@', i + 1)) {
    const before = prevRune(lowerText, i)
    if (before && NAME_RUNE.test(before)) continue
    if (!lowerText.startsWith(token, i + 1)) continue
    const end = i + 1 + token.length
    const after = nextRune(lowerText, end)
    if (!after || !NAME_RUNE.test(after)) return true
  }
  return false
}

export function textMentionsName(text: string, memberName: string): boolean {
  const lowerText = String(text || '').toLowerCase()
  const lowerName = String(memberName || '').toLowerCase()
  if (!lowerName) return false
  if (matchesAtBoundary(lowerText, lowerName)) return true
  const groupMatch = lowerName.match(NUMBERED_GROUP_RE)
  return groupMatch ? matchesAtBoundary(lowerText, groupMatch[1]) : false
}

export function textMentionsAll(text: string): boolean {
  return matchesAtBoundary(String(text || '').toLowerCase(), 'all')
}

export function extractChannelMentions(text: string): string[] {
  const lower = String(text || '').toLowerCase()
  const found: string[] = []
  for (let i = lower.indexOf('@#'); i >= 0; i = lower.indexOf('@#', i + 1)) {
    const before = prevRune(lower, i)
    if (before && NAME_RUNE.test(before)) continue
    let j = i + 2
    while (j < lower.length) {
      const r = nextRune(lower, j)
      if (!r || !NAME_RUNE.test(r)) break
      j += r.length
    }
    const ch = lower.slice(i + 2, j)
    if (ch && validateChannelName(ch) && !found.includes(ch)) {
      found.push(ch)
    }
  }
  return found
}

function isMemberSubscribed(
  member: Pick<MemberRecord, 'name' | 'channels'>,
  channelName: string,
  channels: Record<string, ChannelMeta>,
): boolean {
  if (Array.isArray(member.channels)) {
    if (member.channels.includes(ALL_CHANNELS) || member.channels.includes(channelName)) return true
  }
  const meta = channels[channelName]
  return Boolean(meta && Array.isArray(meta.subscribers) && meta.subscribers.includes(member.name))
}

export function parseMentions(
  text: string,
  members: Record<string, MemberRecord> | MemberRecord[],
  channels?: Record<string, ChannelMeta> | ChannelMeta[],
  sender?: string,
): ParsedMentions {
  const memberList = normalizeMembers(members)
  const memberMap = new Map(memberList.map((m) => [m.name, m]))
  const chMap = normalizeChannels(channels)

  const is_all = textMentionsAll(text)
  const mentions = memberList.filter((m) => textMentionsName(text, m.name)).map((m) => m.name)
  const channel_mentions = extractChannelMentions(text).filter((ch) => {
    const meta = chMap[ch]
    return Boolean(meta && !meta.archived)
  })

  const via_channel: string[] = []
  for (const m of memberList) {
    if (isKilled(m) || m.name === sender || mentions.includes(m.name)) continue
    if (channel_mentions.some((ch) => isMemberSubscribed(m, ch, chMap))) {
      via_channel.push(m.name)
    }
  }

  const targetSet = new Set<string>()
  for (const name of mentions) {
    const m = memberMap.get(name)
    if (m && !isKilled(m) && name !== sender) targetSet.add(name)
  }
  for (const name of via_channel) targetSet.add(name)
  if (is_all) {
    for (const m of memberList) {
      if (!isKilled(m) && m.name !== sender) targetSet.add(m.name)
    }
  }

  return { mentions, channel_mentions, via_channel, is_all, targets: [...targetSet] }
}

export function canMemberSeeMessage(
  member: MemberRecord,
  msg: BoardMessage,
  channels?: Record<string, ChannelMeta> | ChannelMeta[],
): boolean {
  if (isAllVisibilityMember(member)) return true
  const msgChannel = msg.channel || MAIN_CHANNEL
  if (msgChannel === MAIN_CHANNEL || msg.agent === member.name) return true
  const chMap = normalizeChannels(channels)
  if (isMemberSubscribed(member, msgChannel, chMap)) return true
  if (isControlMessage(msg)) return false
  if (msg.is_all || textMentionsAll(msg.text)) return true
  if (msg.mentions.includes(member.name) || textMentionsName(msg.text, member.name)) return true
  const chMentions = msg.channel_mentions?.length ? msg.channel_mentions : extractChannelMentions(msg.text)
  const hasChannelMap = Boolean(channels)
  return chMentions.some((ch) => {
    if (ch === MAIN_CHANNEL) return false
    if (hasChannelMap && (!chMap[ch] || chMap[ch].archived)) return false
    return isMemberSubscribed(member, ch, chMap)
  })
}

export function doesMessageWakeMember(
  member: MemberRecord,
  msg: BoardMessage,
  channels?: Record<string, ChannelMeta> | ChannelMeta[],
): boolean {
  if (isKilled(member) || isControlMessage(msg) || msg.agent === member.name) return false
  const chMap = normalizeChannels(channels)
  if (member.wake_mode === 'anything') return canMemberSeeMessage(member, msg, chMap)
  if (msg.is_all || textMentionsAll(msg.text)) return true
  if (msg.mentions.includes(member.name) || textMentionsName(msg.text, member.name)) return true
  const chMentions = msg.channel_mentions?.length ? msg.channel_mentions : extractChannelMentions(msg.text)
  return chMentions.some(
    (ch) => ch !== MAIN_CHANNEL && Boolean(chMap[ch] && !chMap[ch].archived) && isMemberSubscribed(member, ch, chMap),
  )
}

export function extractScreenshots(
  text: string,
  msg: Pick<BoardMessage, 'seq' | 'agent' | 'time' | 'ts'>,
): ScreenshotFrame[] {
  const frames: ScreenshotFrame[] = []
  for (const line of String(text || '').split(/\r?\n/)) {
    const m = SHOT_LINE_RE.exec(line)
    if (!m) continue
    const filePath = m[1].trim()
    const caption = (m[2] ?? '').trim()
    frames.push({ path: filePath, seq: msg.seq, agent: msg.agent, caption, time: msg.time, ts: msg.ts })
  }
  return frames
}
