import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BoardMessage, MemberRecord, SwarmSnapshotPayload, UiActionRequest } from '../../src/shared/protocol'
import { getBeeDataUrl, getBeeTileBg } from '../bee-sprites'
import { t, useUiLocale } from '../i18n'

export interface JumpTarget {
  seq: number
  nonce: number
}

export interface BoardTabProps {
  snapshot: SwarmSnapshotPayload
  jumpTarget: JumpTarget | null
  onJumpToSeq: (seq: number) => void
  onAction: (req: UiActionRequest) => Promise<void>
  onLoadEarlier: () => Promise<void>
  loadingEarlier: boolean
  onOpenMembers?: () => void
  onSelectSubagent?: (memberName: string) => void
}

const clockFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const dayClockFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
const fullFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' })

function msgMs(m: BoardMessage): number {
  if (Number.isFinite(m.ts) && m.ts > 0) return m.ts
  const parsed = Date.parse(String(m.time || '').replace(' ', 'T'))
  return Number.isFinite(parsed) ? parsed : 0
}

function fmtClock(ms: number): string {
  if (!ms) return ''
  const d = new Date(ms)
  const now = new Date()
  const same = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  return (same ? clockFmt : dayClockFmt).format(d)
}

function chanOf(m: BoardMessage): string {
  return m.channel && m.channel.length > 0 ? m.channel : 'main'
}

function isControl(m: BoardMessage): boolean {
  return m.kind === 'control' || Boolean(m.control)
}

function stripLeadingMentions(text: string): string {
  const rest = text.replace(/^(\s*@[A-Za-z0-9_#.-]+[,:]?)+\s*/, '')
  return rest.length > 0 ? rest : text
}

function collapseRecipientGroups(names: string[], roster: MemberRecord[]): string[] {
  if (names.length === 0) return names
  const set = new Set(names)
  const groups = new Map<string, string[]>()
  for (const mem of roster) {
    const match = mem.name.match(/^(.+)-\d+$/)
    if (!match) continue
    const prefix = match[1]
    const list = groups.get(prefix) ?? []
    list.push(mem.name)
    groups.set(prefix, list)
  }
  const collapsed = new Set<string>()
  const out: string[] = []
  for (const n of names) {
    const match = n.match(/^(.+)-\d+$/)
    const prefix = match?.[1]
    const group = prefix ? groups.get(prefix) : undefined
    if (group && group.length >= 2 && group.every((g) => set.has(g))) {
      if (!collapsed.has(prefix!)) {
        collapsed.add(prefix!)
        out.push(prefix!)
      }
    } else {
      out.push(n)
    }
  }
  return out
}

const TOKEN_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|@#[a-z][a-z0-9-]{0,23}|@[A-Za-z0-9_-]+|#[1-9]\d{0,8})/g

function InlineMarkdown({
  text,
  members,
  channelNames,
  msgBySeq,
  onJumpToSeq,
}: {
  text: string
  members: Record<string, MemberRecord>
  channelNames: Set<string>
  msgBySeq: Map<number, BoardMessage>
  onJumpToSeq: (seq: number) => void
}): JSX.Element {
  const parts: Array<string | JSX.Element> = []
  let lastIndex = 0
  let key = 0
  for (const match of text.matchAll(TOKEN_RE)) {
    const idx = match.index ?? 0
    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx))
    const tok = match[0]
    if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2) {
      parts.push(<code key={key++}>{tok.slice(1, -1)}</code>)
    } else if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
      parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>)
    } else if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2) {
      parts.push(<em key={key++}>{tok.slice(1, -1)}</em>)
    } else if (tok.startsWith('@#')) {
      const ch = tok.slice(2).toLowerCase()
      if (channelNames.has(ch)) {
        parts.push(<span key={key++} className="ag-mention channel">{tok}</span>)
      } else {
        parts.push(tok)
      }
    } else if (tok.startsWith('@')) {
      const name = tok.slice(1)
      const lower = name.toLowerCase()
      if (lower === 'all' || members[name] || Object.keys(members).some((k) => k.toLowerCase() === lower)) {
        parts.push(<span key={key++} className={`ag-mention ${lower === 'all' ? 'all' : ''}`}>{tok}</span>)
      } else {
        parts.push(tok)
      }
    } else if (tok.startsWith('#')) {
      const seq = Number(tok.slice(1))
      const prevChar = idx > 0 ? text[idx - 1] : ''
      if (Number.isInteger(seq) && seq > 0 && !/[A-Za-z0-9_&#/-]/.test(prevChar)) {
        const target = msgBySeq.get(seq)
        parts.push(
          <button
            key={key++}
            type="button"
            className="ag-seq-ref"
            data-testid="swarm-seq-ref"
            title={target ? `Go to #${seq} (@${target.agent})` : `Go to #${seq}`}
            onClick={(e) => { e.stopPropagation(); onJumpToSeq(seq) }}
          >
            #{seq}
          </button>,
        )
      } else {
        parts.push(tok)
      }
    } else {
      parts.push(tok)
    }
    lastIndex = idx + tok.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <Fragment>{parts}</Fragment>
}

function MarkdownBody(props: {
  text: string
  members: Record<string, MemberRecord>
  channelNames: Set<string>
  msgBySeq: Map<number, BoardMessage>
  onJumpToSeq: (seq: number) => void
}): JSX.Element {
  const lines = String(props.text || '').split('\n')
  const blocks: JSX.Element[] = []
  let inCode = false
  let codeLines: string[] = []
  let listItems: string[] = []
  let k = 0

  const flushList = (): void => {
    if (listItems.length === 0) return
    const items = listItems
    listItems = []
    blocks.push(
      <ul key={k++}>
        {items.map((item, i) => (
          <li key={i}>
            <InlineMarkdown {...props} text={item} />
          </li>
        ))}
      </ul>,
    )
  }

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        blocks.push(<pre key={k++}><code>{codeLines.join('\n')}</code></pre>)
        codeLines = []
        inCode = false
      } else {
        flushList()
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeLines.push(line)
      continue
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) {
      flushList()
      blocks.push(<p key={k++}><strong><InlineMarkdown {...props} text={h[2]} /></strong></p>)
      continue
    }
    const li = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/)
    if (li) {
      listItems.push(li[1])
      continue
    }
    flushList()
    if (line.trim().length > 0) {
      blocks.push(<p key={k++}><InlineMarkdown {...props} text={line} /></p>)
    }
  }
  if (inCode && codeLines.length > 0) {
    blocks.push(<pre key={k++}><code>{codeLines.join('\n')}</code></pre>)
  }
  flushList()
  return <div className="ag-md">{blocks}</div>
}

function FeedMessageRow({
  msg,
  roster,
  members,
  channelNames,
  msgBySeq,
  highlighted,
  onSelectChannel,
  onJumpToSeq,
}: {
  msg: BoardMessage
  roster: MemberRecord[]
  members: Record<string, MemberRecord>
  channelNames: Set<string>
  msgBySeq: Map<number, BoardMessage>
  highlighted: boolean
  onSelectChannel: (ch: string) => void
  onJumpToSeq: (seq: number) => void
}): JSX.Element {
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [overflows, setOverflows] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const ts = msgMs(msg)
  const ch = chanOf(msg)
  const control = isControl(msg)
  const directNames = control
    ? []
    : collapseRecipientGroups((msg.mentions || []).filter((n) => n !== msg.agent), roster)
  const hasRecipients = !control && (directNames.length > 0 || (msg.channel_mentions?.length ?? 0) > 0 || msg.is_all)
  const displayBody = control ? '' : (hasRecipients ? stripLeadingMentions(msg.text) : msg.text)

  useEffect(() => {
    if (control) return
    const el = bodyRef.current
    if (!el) return
    const lineH = parseFloat(getComputedStyle(el).lineHeight) || 21.7
    const limit = lineH * 5 + 4
    setOverflows(el.scrollHeight > limit)
  }, [control, displayBody])

  if (control) {
    const cleanText = String(msg.text || '').replace(/^\[channel\]\s*/, '')
    return (
      <div
        className={`ag-msg-system ${highlighted ? 'ag-msg-target' : ''}`}
        data-seq={msg.seq}
        data-testid="swarm-control-message"
        role="note"
      >
        <span className="ag-sys-text" title={`#${msg.seq} · @${msg.agent} · ${ts ? fullFmt.format(new Date(ts)) : msg.time}`}>
          {cleanText}
        </span>
        <time className="ag-ts">#{msg.seq} · {fmtClock(ts) || msg.time}</time>
      </div>
    )
  }

  const member = members[msg.agent]
  const avatarSrc = getBeeDataUrl(msg.agent, member?.role, 'landed')

  return (
    <article
      className={`ag-msg ${highlighted ? 'ag-msg-target' : ''}`}
      data-seq={msg.seq}
      data-testid="swarm-message"
    >
      <span
        className="ag-msg-av"
        style={{ background: getBeeTileBg(msg.agent, member?.role) }}
        aria-hidden="true"
      >
        {avatarSrc ? <img src={avatarSrc} alt="" width={22} height={18} /> : msg.agent.slice(0, 1).toUpperCase()}
      </span>

      <header className="ag-msg-head">
        <span className="ag-msg-who">
          <span className="ag-msg-author">@{msg.agent}</span>
          {ch !== 'main' && (
            <button
              type="button"
              className="ag-msg-channel"
              data-testid="swarm-message-channel"
              title={`Filter to #${ch}`}
              onClick={() => onSelectChannel(ch)}
            >
              #{ch}
            </button>
          )}
          {hasRecipients && (
            <span className="ag-msg-to">
              <span aria-hidden="true">→</span>
              {directNames.map((n) => <span key={`u-${n}`}>@{n}</span>)}
              {(msg.channel_mentions || []).map((c) => <span key={`c-${c}`}>@#{c}</span>)}
              {msg.is_all && <span>@all</span>}
            </span>
          )}
        </span>
        <time className="ag-ts" title={`#${msg.seq} · ${ts ? fullFmt.format(new Date(ts)) : msg.time}`}>
          #{msg.seq} · {fmtClock(ts) || msg.time}
        </time>
      </header>

      <div
        ref={bodyRef}
        className={`ag-msg-body ${overflows ? 'clamped' : ''} ${expanded ? 'open' : ''}`}
      >
        <MarkdownBody
          text={displayBody}
          members={members}
          channelNames={channelNames}
          msgBySeq={msgBySeq}
          onJumpToSeq={onJumpToSeq}
        />
      </div>

      {overflows && (
        <button
          type="button"
          className="ag-msg-more"
          data-testid="swarm-message-more"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? t('common.showLess') : t('common.showMore')}
        </button>
      )}
    </article>
  )
}

export function BoardTab({
  snapshot,
  jumpTarget,
  onJumpToSeq,
  onAction,
  onLoadEarlier,
  loadingEarlier,
  onOpenMembers,
  onSelectSubagent,
}: BoardTabProps): JSX.Element {
  const locale = useUiLocale()
  const zh = locale === 'zh-CN'
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [fromAgent, setFromAgent] = useState('')
  const [toAgent, setToAgent] = useState('')
  const [channel, setChannel] = useState('')
  const [hiddenAgents, setHiddenAgents] = useState<Set<string>>(() => new Set())
  const [follow, setFollow] = useState(true)
  const [showLatestBtn, setShowLatestBtn] = useState(false)
  const [highlightedSeq, setHighlightedSeq] = useState<number | null>(null)

  const [composerOpen, setComposerOpen] = useState(false)
  const [draftChannel, setDraftChannel] = useState('main')
  const [draftText, setDraftText] = useState('')
  const [sending, setSending] = useState(false)

  const feedRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const roster = useMemo(() => Object.values(snapshot.members), [snapshot.members])
  const msgBySeq = useMemo(() => {
    const m = new Map<number, BoardMessage>()
    for (const msg of snapshot.messages) m.set(msg.seq, msg)
    return m
  }, [snapshot.messages])

  const channelsList = useMemo(() => {
    const map = new Map(Object.entries(snapshot.channels))
    for (const msg of snapshot.messages) {
      const ch = chanOf(msg)
      if (ch !== 'main' && !map.has(ch)) {
        map.set(ch, { name: ch, creator: msg.agent, created_at: msg.time, subscribers: [] })
      }
    }
    return [...map.values()].filter((c) => c.name !== 'main')
  }, [snapshot.channels, snapshot.messages])

  const channelNames = useMemo(() => new Set(['main', ...channelsList.map((c) => c.name)]), [channelsList])
  const hasChannels = channelsList.length > 0

  const channelCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of snapshot.messages) {
      if (isControl(m)) continue
      const ch = chanOf(m)
      counts.set(ch, (counts.get(ch) ?? 0) + 1)
    }
    return counts
  }, [snapshot.messages])

  const postCountsByAgent = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of snapshot.messages) {
      if (isControl(m)) continue
      counts.set(m.agent, (counts.get(m.agent) ?? 0) + 1)
    }
    return counts
  }, [snapshot.messages])

  const posters = useMemo(() => {
    const set = new Set<string>(roster.map((m) => m.name))
    for (const m of snapshot.messages) set.add(m.agent)
    return [...set]
  }, [roster, snapshot.messages])

  const visibleMessages = useMemo(() => {
    const q = search.trim().toLowerCase()
    return snapshot.messages.filter((m) => {
      if (channel && chanOf(m) !== channel) return false
      if (hiddenAgents.has(m.agent)) return false
      if (fromAgent && m.agent !== fromAgent) return false
      if (toAgent === '@none' && ((m.mentions?.length ?? 0) > 0 || m.is_all || (m.channel_mentions?.length ?? 0) > 0)) return false
      if (toAgent === '@all' && !m.is_all) return false
      if (toAgent && !toAgent.startsWith('@') && !(m.is_all || (m.mentions || []).includes(toAgent))) return false
      if (q && !`${m.agent}\n${m.text}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [snapshot.messages, channel, hiddenAgents, fromAgent, toAgent, search])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
    setShowLatestBtn(false)
  }, [])

  useEffect(() => {
    if (follow && !jumpTarget) {
      scrollToBottom('auto')
    }
  }, [visibleMessages.length, follow, jumpTarget, scrollToBottom])

  useEffect(() => {
    const scrollHost = feedRef.current?.closest('.ag-scroll')
    if (!scrollHost) return
    const onScroll = (): void => {
      const dist = scrollHost.scrollHeight - scrollHost.scrollTop - scrollHost.clientHeight
      const nearBottom = dist < 80
      setShowLatestBtn(!nearBottom)
      if (!nearBottom && follow) setFollow(false)
      if (nearBottom && !follow) setFollow(true)
    }
    scrollHost.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollHost.removeEventListener('scroll', onScroll)
  }, [follow])

  useEffect(() => {
    if (!jumpTarget) return
    const targetSeq = jumpTarget.seq
    const exists = snapshot.messages.some((m) => m.seq === targetSeq)
    if (!exists && snapshot.messagesOffset > 0 && !loadingEarlier) {
      void onLoadEarlier()
      return
    }
    // Clear filters that would hide the target message
    if (!visibleMessages.some((m) => m.seq === targetSeq)) {
      setSearch('')
      setFromAgent('')
      setToAgent('')
      setChannel('')
      setHiddenAgents(new Set())
    }
    setFollow(false)
    setHighlightedSeq(targetSeq)
    const raf = requestAnimationFrame(() => {
      const el = feedRef.current?.querySelector<HTMLElement>(`[data-seq="${targetSeq}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    const timer = setTimeout(() => {
      setHighlightedSeq((prev) => (prev === targetSeq ? null : prev))
    }, 2000)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [jumpTarget, snapshot.messages, snapshot.messagesOffset, loadingEarlier, onLoadEarlier])

  const activeFilters = Boolean(fromAgent || toAgent || hiddenAgents.size > 0)
  const anyFilter = activeFilters || Boolean(search.trim() || channel)

  const toggleHiddenAgent = (name: string): void => {
    setHiddenAgents((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleSend = async (): Promise<void> => {
    const text = draftText.trim()
    if (!text || sending) return
    setSending(true)
    try {
      await onAction({
        action: 'post_message',
        swarmId: snapshot.swarm_id,
        text,
        channel: draftChannel || 'main',
      })
      setDraftText('')
      setFollow(true)
    } finally {
      setSending(false)
    }
  }

  const insertToken = (tok: string): void => {
    setDraftText((prev) => (prev.length === 0 || prev.endsWith(' ') ? `${prev}${tok} ` : `${prev} ${tok} `))
  }

  return (
    <div ref={feedRef}>
      <div className="ag-toolbar">
        <div className="ag-searchbar">
          <label className="ag-search">
            <svg className="ag-icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.25" />
              <path d="m10.25 10.25 3.25 3.25" />
            </svg>
            <input
              type="search"
              placeholder={t('board.search')}
              aria-label={t('board.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <button
            type="button"
            className={`ag-icon-btn ag-filter-toggle ${filtersOpen ? 'open' : ''}`}
            aria-expanded={filtersOpen}
            title={activeFilters ? `${t('board.filter')} (${zh ? '已启用' : 'active'})` : t('board.filter')}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <svg className="ag-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2.5 4h11M4.5 8h7M6.5 12h3" />
            </svg>
            {activeFilters && <span className="ag-filter-dot" aria-hidden="true" />}
          </button>

          <label className="ag-switch" title={zh ? '有新动态时自动滚到底部' : 'Auto-scroll to latest posts'}>
            <input type="checkbox" checked={follow} onChange={(e) => { setFollow(e.target.checked); if (e.target.checked) scrollToBottom('smooth') }} />
            <span className="ag-switch-track" aria-hidden="true" />
            <span>{t('board.follow')}</span>
          </label>
        </div>

        {filtersOpen && (
          <div className="ag-filters">
            <div className="ag-toolbar-row">
              <span className="ag-select">
                <select
                  aria-label={t('board.from')}
                  className={fromAgent ? 'set' : ''}
                  value={fromAgent}
                  onChange={(e) => setFromAgent(e.target.value)}
                >
                  <option value="">{t('board.from')}：{t('common.all')}</option>
                  {posters.map((n) => (
                    <option key={n} value={n}>{t('board.from')} @{n}</option>
                  ))}
                </select>
              </span>

              <span className="ag-select">
                <select
                  aria-label={t('board.to')}
                  className={toAgent ? 'set' : ''}
                  value={toAgent}
                  onChange={(e) => setToAgent(e.target.value)}
                >
                  <option value="">{t('board.to')}：{t('common.all')}</option>
                  <option value="@none">{zh ? '无 @提及' : 'To no one'}</option>
                  <option value="@all">{zh ? '提及 @all' : 'To @all'}</option>
                  {roster.map((m) => (
                    <option key={m.name} value={m.name}>{t('board.to')} @{m.name}</option>
                  ))}
                </select>
              </span>

              {hasChannels && (
                <span className="ag-select">
                  <select
                    aria-label={t('board.channel')}
                    className={channel ? 'set' : ''}
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option value="">{t('board.channel')}：{t('common.all')}</option>
                    <option value="main">#main</option>
                    {channelsList.map((c) => (
                      <option key={c.name} value={c.name}>
                        #{c.name}{c.archived ? (zh ? '（已归档）' : ' (archived)') : ''}
                      </option>
                    ))}
                  </select>
                </span>
              )}

              {anyFilter && (
                <button
                  type="button"
                  className="ag-ghost-btn"
                  onClick={() => {
                    setSearch('')
                    setFromAgent('')
                    setToAgent('')
                    setChannel('')
                    setHiddenAgents(new Set())
                  }}
                >
                  {zh ? '清除筛选' : 'Clear filters'}
                </button>
              )}
            </div>

            {roster.length > 0 && (
              <div className="ag-agents" role="group" aria-label={zh ? '按成员显示或隐藏' : 'Toggle members in feed'}>
                {roster.map((m) => {
                  const hidden = hiddenAgents.has(m.name)
                  return (
                    <button
                      key={m.name}
                      type="button"
                      className={`ag-chip ${hidden ? 'dim' : ''} ${m.killed ? 'killed' : ''}`}
                      data-testid="swarm-member-chip"
                      aria-pressed={!hidden}
                      onClick={() => toggleHiddenAgent(m.name)}
                    >
                      <span className="ag-chip-name">{m.name}</span>
                      <span className="ag-chip-count">{postCountsByAgent.get(m.name) ?? 0}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {hasChannels && (
          <div className="ag-channel-tabs" role="tablist" aria-label={t('board.channel')}>
            <button
              type="button"
              role="tab"
              className={`ag-channel-tab ${channel === '' ? 'on' : ''}`}
              aria-selected={channel === ''}
              data-testid="swarm-channel-tab"
              onClick={() => setChannel('')}
            >
              {t('common.all')}
            </button>
            <button
              type="button"
              role="tab"
              className={`ag-channel-tab ${channel === 'main' ? 'on' : ''}`}
              aria-selected={channel === 'main'}
              data-testid="swarm-channel-tab"
              onClick={() => setChannel('main')}
            >
              #main <span className="ag-chip-count">{channelCounts.get('main') ?? 0}</span>
            </button>
            {channelsList.map((c) => (
              <button
                key={c.name}
                type="button"
                role="tab"
                className={`ag-channel-tab ${channel === c.name ? 'on' : ''} ${c.archived ? 'archived' : ''}`}
                aria-selected={channel === c.name}
                title={c.topic ? `#${c.name} · ${c.topic}` : `#${c.name}`}
                data-testid="swarm-channel-tab"
                onClick={() => setChannel(c.name)}
              >
                #{c.name} <span className="ag-chip-count">{channelCounts.get(c.name) ?? 0}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {(() => {
        const workingMembers = roster.filter((m) => !m.killed && m.state === 'working')
        if (workingMembers.length === 0) return null
        return (
          <div
            data-testid="swarm-board-live-strip"
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 6,
              padding: '6px 10px',
              marginBottom: 8,
              borderRadius: 8,
              background: 'var(--ag-fill, rgba(128,128,128,0.06))',
              border: '1px solid var(--ag-line, rgba(128,128,128,0.14))',
              fontSize: 12,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontWeight: 600,
                color: 'var(--ag-success, #63984f)',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--ag-success, #63984f)',
                }}
              />
              {zh ? `${workingMembers.length} 工作中` : `${workingMembers.length} working`}
            </span>
            {workingMembers.map((m) => (
              <button
                key={m.name}
                type="button"
                className="ag-chip"
                onClick={() => (onSelectSubagent ? onSelectSubagent(m.name) : onOpenMembers?.())}
                title={m.activity || (zh ? '点击查看成员详情' : 'Open Members tab')}
                style={{ height: 22, padding: '0 8px', fontSize: 11, maxWidth: 260 }}
              >
                <span style={{ fontWeight: 600 }}>@{m.name}</span>
                {m.activity && (
                  <span style={{ color: 'var(--ag-fg-muted, #5d676f)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    · {m.activity}
                  </span>
                )}
              </button>
            ))}
          </div>
        )
      })()}

      <div className="ag-feed">
        {snapshot.messagesOffset > 0 && (
          <div className="ag-feed-earlier">
            <button
              type="button"
              className="ag-btn sm"
              data-testid="swarm-load-earlier"
              disabled={loadingEarlier}
              onClick={() => { void onLoadEarlier() }}
            >
              {loadingEarlier
                ? (zh ? `正在加载更早发言…（还有 ${snapshot.messagesOffset} 条）` : `Loading earlier posts… (${snapshot.messagesOffset} older)`)
                : `${t('board.showEarlier')} (${snapshot.messagesOffset})`}
            </button>
          </div>
        )}

        {visibleMessages.length === 0 ? (
          <div className="ag-feed-empty">
            <div>
              {anyFilter
                ? (zh ? '当前筛选条件下暂无匹配发言。' : 'No posts match the current filters.')
                : (zh ? '黑板上暂无发言。' : 'No messages posted to the board yet.')}
            </div>
            {anyFilter && (
              <button
                type="button"
                className="ag-btn sm"
                onClick={() => {
                  setSearch('')
                  setFromAgent('')
                  setToAgent('')
                  setChannel('')
                  setHiddenAgents(new Set())
                }}
              >
                {zh ? '重置筛选' : 'Reset filters'}
              </button>
            )}
          </div>
        ) : (
          visibleMessages.map((msg) => (
            <FeedMessageRow
              key={msg.seq}
              msg={msg}
              roster={roster}
              members={snapshot.members}
              channelNames={channelNames}
              msgBySeq={msgBySeq}
              highlighted={highlightedSeq === msg.seq}
              onSelectChannel={(ch) => setChannel(ch)}
              onJumpToSeq={onJumpToSeq}
            />
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {showLatestBtn && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', pointerEvents: 'none' }}>
          <button
            type="button"
            className="ag-jump"
            style={{ pointerEvents: 'auto' }}
            onClick={() => {
              setFollow(true)
              scrollToBottom('smooth')
            }}
          >
            ↓ {t('board.latest')}
          </button>
        </div>
      )}

      <div className="ag-composer" data-testid="swarm-composer">
        <button
          type="button"
          className="ag-composer-bar"
          aria-expanded={composerOpen}
          onClick={() => setComposerOpen((v) => !v)}
        >
          <span>{t('board.composePlaceholder', { channel: draftChannel || 'main' })}</span>
          <span>{composerOpen ? `▾ ${t('common.showLess')}` : `▴ ${t('board.composeBtn')}`}</span>
        </button>

        {composerOpen && (
          <div className="ag-composer-form">
            <div className="ag-composer-top">
              <span className="ag-select">
                <select
                  aria-label={t('board.channel')}
                  value={draftChannel}
                  onChange={(e) => setDraftChannel(e.target.value)}
                >
                  <option value="main">#main</option>
                  {channelsList
                    .filter((c) => !c.archived)
                    .map((c) => (
                      <option key={c.name} value={c.name}>#{c.name}</option>
                    ))}
                </select>
              </span>

              <div className="ag-composer-chips">
                <button type="button" className="ag-pill-btn" onClick={() => insertToken('@all')}>@all</button>
                {roster
                  .filter((m) => !m.killed)
                  .slice(0, 6)
                  .map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      className="ag-pill-btn"
                      onClick={() => insertToken(`@${m.name}`)}
                    >
                      @{m.name}
                    </button>
                  ))}
              </div>
            </div>

            <textarea
              placeholder={zh ? '输入黑板发言内容…（Ctrl+Enter 快捷发送）' : 'Write a board message… (Ctrl+Enter to send)'}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault()
                  void handleSend()
                }
              }}
            />

            <div className="ag-composer-foot">
              <span>{zh ? '发帖会立即唤醒被 @提及 的待命成员。' : 'Posting wakes mentioned waiting agents immediately.'}</span>
              <button
                type="button"
                className="ag-btn primary sm"
                disabled={sending || !draftText.trim()}
                onClick={() => { void handleSend() }}
              >
                {sending ? (zh ? '发送中…' : 'Sending…') : t('board.send')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
