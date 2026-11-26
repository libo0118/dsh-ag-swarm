import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  canMemberSeeMessage,
  countsAsUnread,
  doesMessageWakeMember,
  extractScreenshots,
  parseMentions,
  validateChannelName,
  validateMemberName,
} from '../src/core/channels.js'
import { buildSnapshot } from '../src/core/projection.js'
import { SwarmStore } from '../src/core/store.js'
import type { BoardMessage, ChannelMeta, MemberRecord, PlanFile } from '../src/shared/protocol.js'

const tempDirs: string[] = []

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-ag-swarm-core-'))
  tempDirs.push(dir)
  return dir
}

function makeMember(overrides: Partial<MemberRecord> & { name: string }): MemberRecord {
  return {
    conversation_id: overrides.conversation_id ?? `conv-${overrides.name}`,
    role: overrides.role ?? 'worker',
    state: overrides.state ?? 'waiting',
    killed: overrides.killed ?? false,
    model: overrides.model ?? 'default',
    model_display_name: overrides.model_display_name ?? 'Default',
    workspace_mode: overrides.workspace_mode ?? 'inherit',
    workspace: overrides.workspace ?? '/repo',
    wake_mode: overrides.wake_mode ?? 'mentions',
    wait_since: overrides.wait_since ?? 0,
    last_read_seq: overrides.last_read_seq ?? 0,
    channels: overrides.channels ?? [],
    depth: overrides.depth ?? 1,
    ...overrides,
  }
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

describe('channels & mention parsing', () => {
  it('validates member and channel names strictly', () => {
    expect(validateMemberName('worker-1')).toBe(true)
    expect(validateMemberName('core_author')).toBe(true)
    expect(validateMemberName('a'.repeat(24))).toBe(true)
    expect(validateMemberName('a'.repeat(25))).toBe(false)
    expect(validateMemberName('all')).toBe(false)
    expect(validateMemberName('coordinator')).toBe(false)
    expect(validateMemberName('coordinator-1')).toBe(false)
    expect(validateMemberName('UpperCase')).toBe(false)
    expect(validateMemberName('-bad')).toBe(false)

    expect(validateChannelName('backend')).toBe(true)
    expect(validateChannelName('ui-v2')).toBe(true)
    expect(validateChannelName('main')).toBe(false)
    expect(validateChannelName('all')).toBe(false)
    expect(validateChannelName('here')).toBe(false)
    expect(validateChannelName('1digit')).toBe(false)
    expect(validateChannelName('has_underscore')).toBe(false)
  })

  it('parses @name, numbered group prefixes, @all, @#channel, and ignores emails', () => {
    const members: Record<string, MemberRecord> = {
      coordinator: makeMember({ name: 'coordinator', role: 'coordinator', state: 'working' }),
      'worker-1': makeMember({ name: 'worker-1', channels: ['backend'] }),
      'worker-2': makeMember({ name: 'worker-2', channels: ['backend'] }),
      'worker-3': makeMember({ name: 'worker-3', killed: true, state: 'killed', channels: ['backend'] }),
      frontend: makeMember({ name: 'frontend', channels: ['ui'] }),
    }
    const channels: Record<string, ChannelMeta> = {
      backend: { name: 'backend', creator: 'coordinator', created_at: '2026-01-01T00:00:00Z', archived: false, subscribers: ['worker-1', 'worker-2', 'worker-3'] },
      old: { name: 'old', creator: 'coordinator', created_at: '2026-01-01T00:00:00Z', archived: true, subscribers: ['frontend'] },
    }

    const emailParsed = parseMentions('contact a@worker-1.com or foo@all.io', members, channels, 'coordinator')
    expect(emailParsed.mentions).toEqual([])
    expect(emailParsed.is_all).toBe(false)
    expect(emailParsed.targets).toEqual([])

    const groupParsed = parseMentions('请：@Worker，同步进度！', members, channels, 'coordinator')
    expect(groupParsed.mentions).toEqual(['worker-1', 'worker-2', 'worker-3'])
    expect(groupParsed.targets).toEqual(['worker-1', 'worker-2'])

    const allParsed = parseMentions('通知 @ALL 集合', members, channels, 'coordinator')
    expect(allParsed.is_all).toBe(true)
    expect(allParsed.targets.sort()).toEqual(['frontend', 'worker-1', 'worker-2'])

    const chParsed = parseMentions('@#BACKEND @#main @#old @#ghost check', members, channels, 'frontend')
    expect(chParsed.channel_mentions).toEqual(['backend'])
    expect(chParsed.via_channel).toEqual(['worker-1', 'worker-2'])
    expect(chParsed.targets).toEqual(['worker-1', 'worker-2'])
  })

  it('enforces channel visibility, cross-channel mentions, and control message isolation', () => {
    const coordinator = makeMember({ name: 'coordinator', role: 'coordinator' })
    const monitor = makeMember({ name: 'monitor', role: 'monitor' })
    const alice = makeMember({ name: 'alice', channels: ['backend'] })
    const bob = makeMember({ name: 'bob', channels: ['ui'] })
    const channels: Record<string, ChannelMeta> = {
      backend: { name: 'backend', creator: 'coordinator', created_at: '2026-01-01T00:00:00Z', archived: false, subscribers: ['alice'] },
      ui: { name: 'ui', creator: 'coordinator', created_at: '2026-01-01T00:00:00Z', archived: false, subscribers: ['bob'] },
    }

    const backendMsg: BoardMessage = {
      seq: 2, agent: 'alice', text: 'internal api detail', time: '2026-01-01T00:00:01Z', ts: 1000,
      channel: 'backend', kind: 'normal', mentions: [], channel_mentions: [], is_all: false,
    }
    expect(canMemberSeeMessage(coordinator, backendMsg, channels)).toBe(true)
    expect(canMemberSeeMessage(monitor, backendMsg, channels)).toBe(true)
    expect(canMemberSeeMessage(alice, backendMsg, channels)).toBe(true)
    expect(canMemberSeeMessage(bob, backendMsg, channels)).toBe(false)

    const crossMentionMsg: BoardMessage = {
      ...backendMsg, seq: 3, text: 'hey @bob and @#ui review this', mentions: ['bob'], channel_mentions: ['ui'],
    }
    expect(canMemberSeeMessage(bob, crossMentionMsg, channels)).toBe(true)
    expect(doesMessageWakeMember(bob, crossMentionMsg, channels)).toBe(true)

    const controlMsg: BoardMessage = {
      seq: 4, agent: 'coordinator', text: 'created #backend', time: '2026-01-01T00:00:02Z', ts: 2000,
      channel: 'backend', kind: 'control', mentions: [], channel_mentions: [], is_all: false,
      control: { op: 'create', channel: 'backend' },
    }
    expect(countsAsUnread(controlMsg)).toBe(false)
    expect(doesMessageWakeMember(alice, controlMsg, channels)).toBe(false)
    expect(doesMessageWakeMember({ ...alice, wake_mode: 'anything' }, controlMsg, channels)).toBe(false)
  })

  it('extracts Screenshot lines for POSIX and Windows paths', () => {
    const frames = extractScreenshots(
      [
        'Done!',
        'Screenshot: /tmp/preview-1.png | Initial header layout',
        '- Screenshot: `C:\\shots\\after.webp` | Final dark mode',
        'Screenshot: relative/bad.png | ignored',
        'Screenshot: /tmp/doc.pdf | ignored ext',
      ].join('\n'),
      { seq: 5, agent: 'ui-1', time: '2026-01-01T00:00:05Z', ts: 5000 },
    )
    expect(frames).toHaveLength(2)
    expect(frames[0]).toMatchObject({ path: '/tmp/preview-1.png', caption: 'Initial header layout', seq: 5, agent: 'ui-1' })
    expect(frames[1]).toMatchObject({ path: 'C:\\shots\\after.webp', caption: 'Final dark mode', seq: 5, agent: 'ui-1' })
  })
})

describe('SwarmStore persistence, channels, and pagination', () => {
  it('persists swarm, members, channels, messages, and plan across store restarts', () => {
    const dir = makeTempDir()
    const updates: string[] = []
    const store1 = new SwarmStore(dir)
    store1.on('update', (ev) => updates.push(ev.reason))

    const swarm = store1.createOrGetSwarm('sess-1', 'Alpha Build', '/repo')
    store1.setTitle(swarm.swarm_id, 'Alpha Build v2')
    store1.addMember(swarm.swarm_id, { name: 'worker-1', model: 'm1', model_display_name: 'M1', task_hint: 'API' })
    store1.addMember(swarm.swarm_id, { name: 'worker-2', model: 'm2', model_display_name: 'M2', task_hint: 'UI' })
    store1.createChannel(swarm.swarm_id, { channel: 'backend', topic: 'API work', creator: 'coordinator', subscribers: ['worker-1'] })
    store1.subscribeChannel(swarm.swarm_id, { channel: 'backend', members: ['worker-2'], actor: 'coordinator' })
    store1.unsubscribeChannel(swarm.swarm_id, { channel: 'backend', members: ['worker-2'], actor: 'coordinator' })

    const m1 = store1.appendMessage(swarm.swarm_id, { agent: 'coordinator', text: '@worker-1 build api', kind: 'brief' })
    const m2 = store1.appendMessage(swarm.swarm_id, { agent: 'worker-1', text: 'working in backend', channel: 'backend' })
    const m3 = store1.appendMessage(swarm.swarm_id, { agent: 'worker-1', text: '@coordinator [done] api ready', channel: 'backend' })
    expect(m1.kind).toBe('brief')
    expect(m2.kind).toBe('normal')
    expect(m3.kind).toBe('done')

    store1.archiveChannel(swarm.swarm_id, { channel: 'backend', actor: 'coordinator' })
    expect(() => store1.appendMessage(swarm.swarm_id, { agent: 'worker-1', text: 'late', channel: 'backend' })).toThrow(/archived/i)

    const plan: PlanFile = {
      goal: { title: 'Ship v2', line: 'Complete API & UI' },
      tasks: { 'worker-1': 'Build API', 'worker-2': 'Build UI' },
      threads: [{ id: 't1', title: 'Core', goal: 'Deliver core', tasks: ['worker-1', 'worker-2'] }],
    }
    store1.writePlan(swarm.swarm_id, plan)
    store1.killMember(swarm.swarm_id, 'worker-2')
    expect(() => store1.addMember(swarm.swarm_id, { name: 'worker-2' })).toThrow(/already exists/i)

    const store2 = new SwarmStore(dir)
    const reloaded = store2.getSwarmBySession('sess-1')
    expect(reloaded).toBeDefined()
    expect(reloaded!.title).toBe('Alpha Build v2')
    expect(reloaded!.head).toBe(7)
    expect(reloaded!.channels.backend.archived).toBe(true)
    expect(reloaded!.channels.backend.subscribers).toEqual(['worker-1'])
    expect(reloaded!.members['worker-1'].last_post_seq).toBe(m3.seq)
    expect(reloaded!.members['worker-2'].killed).toBe(true)
    expect(reloaded!.plan?.goal.title).toBe('Ship v2')
    expect(updates).toContain('plan')
    expect(store2.listSwarms()[0].swarm_id).toBe(swarm.swarm_id)

    const raw = store2.getRawFiles(swarm.swarm_id)
    expect(raw.files.map((f) => f.name)).toEqual(['swarm.json', 'members.json', 'board.jsonl', 'plan.json'])
    expect(raw.files.find((f) => f.name === 'board.jsonl')!.lines).toBe(7)
  })

  it('supports readBoard filtering, cursor advance, seqs jump, and readBeforeSeq pagination', () => {
    const dir = makeTempDir()
    const store = new SwarmStore(dir)
    const swarm = store.createOrGetSwarm('sess-page', 'Paging')
    store.addMember(swarm.swarm_id, { name: 'alice' })
    store.createChannel(swarm.swarm_id, { channel: 'secret', creator: 'coordinator' })

    for (let i = 1; i <= 10; i++) {
      store.appendMessage(swarm.swarm_id, { agent: 'coordinator', text: `msg ${i}` })
    }
    store.appendMessage(swarm.swarm_id, { agent: 'coordinator', text: 'hidden secret', channel: 'secret' })

    const first = store.readBoard(swarm.swarm_id, { since: 1, limit: 3, callerName: 'alice' })
    expect(first.messages.map((m) => m.seq)).toEqual([2, 3, 4])
    expect(first.truncated).toBe(true)
    expect(store.getSwarm(swarm.swarm_id)!.members.alice.last_read_seq).toBe(4)

    const secretRead = store.readBoard(swarm.swarm_id, { since: 0, limit: 50, callerName: 'alice' })
    expect(secretRead.messages.some((m) => m.text === 'hidden secret')).toBe(false)

    const jump = store.readBoard(swarm.swarm_id, { seqs: [3, 7], callerName: 'coordinator' })
    expect(jump.messages.map((m) => m.seq)).toEqual([3, 7])

    const page = store.readBeforeSeq(swarm.swarm_id, { beforeSeq: 10, limit: 3 })
    expect(page.messages.map((m) => m.seq)).toEqual([7, 8, 9])
    expect(page.hasMore).toBe(true)

    const jumpPage = store.readBeforeSeq(swarm.swarm_id, { beforeSeq: 10, limit: 3, fromSeq: 4 })
    expect(jumpPage.messages[0].seq).toBeLessThanOrEqual(4)
    expect(jumpPage.messages[jumpPage.messages.length - 1].seq).toBe(9)
  })
})

describe('buildSnapshot projection', () => {
  it('supports unchanged short-circuit, delta mode, control fallback, tail, and pinnedMessages', () => {
    const dir = makeTempDir()
    const store = new SwarmStore(dir)
    const swarm = store.createOrGetSwarm('sess-proj', 'Projection Test')
    store.addMember(swarm.swarm_id, { name: 'worker-1', state: 'working' })
    store.addMember(swarm.swarm_id, { name: 'monitor', role: 'monitor', state: 'waiting' })

    const brief = store.appendMessage(swarm.swarm_id, { agent: 'coordinator', text: '@worker-1 start', kind: 'brief' })
    const stall = store.appendMessage(swarm.swarm_id, { agent: 'monitor', text: '@coordinator [stall] idle warning' })
    for (let i = 0; i < 6; i++) {
      store.appendMessage(swarm.swarm_id, { agent: 'worker-1', text: `progress ${i}` })
    }

    const full = buildSnapshot(store.getSwarm(swarm.swarm_id)!, { tail: 3 })
    expect(full.messages).toHaveLength(3)
    expect(full.messagesOffset).toBe(5)
    expect(full.pinnedMessages.map((m) => m.seq)).toContain(brief.seq)
    expect(full.pinnedMessages.map((m) => m.seq)).toContain(stall.seq)
    expect(full.stallBanner?.seq).toBe(stall.seq)

    const unchanged = buildSnapshot(store.getSwarm(swarm.swarm_id)!, { etag: full.etag })
    expect(unchanged.unchanged).toBe(true)
    expect(unchanged.messages).toEqual([])

    const prevHead = store.getSwarm(swarm.swarm_id)!.head
    const mNext = store.appendMessage(swarm.swarm_id, { agent: 'worker-1', text: 'new delta post' })
    const delta = buildSnapshot(store.getSwarm(swarm.swarm_id)!, { since: prevHead, knownMembers: 3 })
    expect(delta.delta).toBe(true)
    expect(delta.messages.map((m) => m.seq)).toEqual([mNext.seq])

    const headBeforeCtrl = store.getSwarm(swarm.swarm_id)!.head
    store.createChannel(swarm.swarm_id, { channel: 'ops', creator: 'coordinator' })
    const afterCtrl = buildSnapshot(store.getSwarm(swarm.swarm_id)!, { since: headBeforeCtrl, knownMembers: 3 })
    expect(afterCtrl.delta).toBeUndefined()
    expect(afterCtrl.messages.length).toBeGreaterThan(1)
  })

  it('derives edges, prioritized threads, systemAttention, and validated frames', () => {
    const dir = makeTempDir()
    const store = new SwarmStore(dir)
    const swarm = store.createOrGetSwarm('sess-viz', 'Viz Test')
    const now = Date.now()
    store.addMember(swarm.swarm_id, { name: 'err-worker', state: 'stopped' })
    store.addMember(swarm.swarm_id, { name: 'wait-worker', state: 'waiting' })
    store.addMember(swarm.swarm_id, { name: 'stuck-worker', state: 'working' })
    store.addMember(swarm.swarm_id, { name: 'run-worker', state: 'working' })
    store.addMember(swarm.swarm_id, { name: 'queue-worker', state: 'stopped' })
    store.addMember(swarm.swarm_id, { name: 'done-worker', state: 'waiting' })

    store.updateMember(swarm.swarm_id, 'err-worker', { failure: { kind: 'quota', message: '0% quota', at: new Date(now).toISOString() } })
    store.updateMember(swarm.swarm_id, 'wait-worker', { waiting_on: ['run-worker'] })
    store.updateMember(swarm.swarm_id, 'stuck-worker', { last_post_time: new Date(now - 15 * 60 * 1000).toISOString() })
    store.updateMember(swarm.swarm_id, 'run-worker', { last_post_time: new Date(now - 60 * 1000).toISOString(), activity: 'Running tests' })

    store.createChannel(swarm.swarm_id, { channel: 'qa', creator: 'coordinator', subscribers: ['done-worker'] })
    store.appendMessage(swarm.swarm_id, { agent: 'coordinator', text: '@run-worker check @#qa' })
    store.appendMessage(swarm.swarm_id, { agent: 'coordinator', text: '@all sync up' })
    store.appendMessage(swarm.swarm_id, { agent: 'done-worker', text: '@coordinator [done] qa passed' })

    const smallShot = path.join(dir, 'ok.png')
    const bigShot = path.join(dir, 'huge.png')
    fs.writeFileSync(smallShot, Buffer.alloc(1024, 1))
    fs.writeFileSync(bigShot, Buffer.alloc(8 * 1024 * 1024 + 10, 2))
    store.appendMessage(swarm.swarm_id, {
      agent: 'run-worker',
      text: `Screenshot: ${smallShot} | Valid\nScreenshot: ${bigShot} | Too Big\nScreenshot: ${smallShot} | Latest Caption`,
    })

    store.writePlan(swarm.swarm_id, {
      goal: { title: 'Deliver', line: 'All threads' },
      tasks: { 'done-worker': 'QA', 'err-worker': 'Quota', 'wait-worker': 'Wait', 'stuck-worker': 'Stuck', 'run-worker': 'Run', 'queue-worker': 'Queue' },
      threads: [
        { id: 't-done', title: 'Done', goal: '', tasks: ['done-worker'] },
        { id: 't-queue', title: 'Queue', goal: '', tasks: ['queue-worker'] },
        { id: 't-run', title: 'Run', goal: '', tasks: ['run-worker'] },
        { id: 't-stuck', title: 'Stuck', goal: '', tasks: ['stuck-worker'] },
        { id: 't-wait', title: 'Wait', goal: '', tasks: ['wait-worker'] },
        { id: 't-needs', title: 'Needs', goal: '', tasks: ['err-worker'] },
      ],
    })

    const snap = buildSnapshot(store.getSwarm(swarm.swarm_id)!, { now })
    expect(snap.threads.map((t) => t.state)).toEqual(['needs', 'waiting', 'stuck', 'running', 'queued', 'done'])
    expect(snap.systemAttention.map((a) => `${a.member}:${a.kind}`).sort()).toEqual(['err-worker:quota', 'stuck-worker:stuck'])
    expect(snap.edges.some((e) => e.from === 'coordinator' && e.to === 'run-worker' && e.kind === 'direct')).toBe(true)
    expect(snap.edges.some((e) => e.from === 'coordinator' && e.to === 'done-worker' && e.kind === 'channel')).toBe(true)
    expect(snap.edges.some((e) => e.from === 'coordinator' && e.to === 'wait-worker' && e.kind === 'all')).toBe(true)
    expect(snap.frames).toHaveLength(1)
    expect(snap.frames[0]).toMatchObject({ path: smallShot, caption: 'Latest Caption' })
  })

  it('auto-groups threads when plan.json is absent and caps screenshot frames at 24', () => {
    const dir = makeTempDir()
    const store = new SwarmStore(dir)
    const swarm = store.createOrGetSwarm('sess-auto', 'Auto Group')
    store.addMember(swarm.swarm_id, { name: 'api-1', state: 'working' })
    store.addMember(swarm.swarm_id, { name: 'api-2', state: 'waiting' })
    store.addMember(swarm.swarm_id, { name: 'ui-dev', state: 'working' })
    store.createChannel(swarm.swarm_id, { channel: 'frontend', topic: 'UI polish', creator: 'coordinator', subscribers: ['ui-dev'] })

    for (let i = 1; i <= 28; i++) {
      store.appendMessage(swarm.swarm_id, { agent: 'ui-dev', text: `Screenshot: /virtual/shot-${i}.png | Step ${i}` })
    }

    const snap = buildSnapshot(store.getSwarm(swarm.swarm_id)!)
    expect(snap.plan).toBeNull()
    expect(snap.threads.map((t) => t.title).sort()).toEqual(['#frontend', 'api'])
    expect(snap.frames).toHaveLength(24)
    expect(snap.frames[0].path).toBe('/virtual/shot-5.png')
    expect(snap.frames[23].path).toBe('/virtual/shot-28.png')
  })
})
