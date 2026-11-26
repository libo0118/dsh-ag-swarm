import { useMemo, useState } from 'react'
import type { MemberRecord, SwarmSnapshotPayload, UiActionRequest } from '../../src/shared/protocol'
import { PixelBee, getBeeTileBg } from '../bee-sprites'
import type { CatalogModelOption } from '../store'
import { MemberDrawer } from './MemberDrawer'

export interface MembersTabProps {
  snapshot: SwarmSnapshotPayload
  onJumpToSeq: (seq: number) => void
  onAction: (req: UiActionRequest) => Promise<void>
  models: CatalogModelOption[]
}

function shortWorkspace(ws: string): string {
  const norm = ws.replace(/\\/g, '/').replace(/\/+$/, '')
  const segs = norm.split('/').filter(Boolean)
  if (segs.length === 0) return norm
  const out = segs.length > 2 ? `…/${segs.slice(-2).join('/')}` : segs.join('/')
  return out.length > 44 ? `…${out.slice(-43)}` : out
}

function getStatusBadge(m: MemberRecord): { label: string; tone: 'info' | 'warn' | 'bad' | 'muted' } {
  if (m.killed || m.state === 'killed') return { label: 'Retired', tone: 'muted' }
  if (m.failure) {
    if (m.failure.kind === 'quota') return { label: 'Quota', tone: 'bad' }
    if (m.failure.kind === 'stuck') return { label: 'Stuck', tone: 'bad' }
    return { label: 'Error', tone: 'bad' }
  }
  if (m.state === 'working') {
    return { label: m.role === 'coordinator' ? 'Coordinator · Working' : 'Working', tone: 'info' }
  }
  if (m.waiting_on && m.waiting_on.length > 0) {
    return { label: `Waiting on @${m.waiting_on[0]}`, tone: 'warn' }
  }
  if (m.state === 'stopped') return { label: 'Stopped', tone: 'muted' }
  if (m.role === 'coordinator') return { label: 'Coordinator', tone: 'muted' }
  return { label: 'Waiting', tone: 'muted' }
}

function getDotVariant(m: MemberRecord): 'working' | 'waiting' | 'stuck' | 'error' | undefined {
  if (m.killed || m.state === 'killed') return undefined
  if (m.failure) return m.failure.kind === 'stuck' ? 'stuck' : 'error'
  if (m.state === 'working') return 'working'
  if (m.waiting_on && m.waiting_on.length > 0) return 'waiting'
  return undefined
}

function matchesQuery(m: MemberRecord, query: string): boolean {
  if (!query) return true
  const hay = [
    m.name,
    m.role,
    m.state,
    m.model,
    m.model_display_name,
    m.task_hint ?? '',
    m.activity ?? '',
    m.workspace_mode,
    m.workspace,
    m.branch ?? '',
    ...(m.channels ?? []),
    ...(m.waiting_on ?? []),
    m.failure?.kind ?? '',
    m.failure?.message ?? '',
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(query)
}

export function MembersTab(props: MembersTabProps): JSX.Element {
  const { snapshot, onJumpToSeq, onAction, models } = props
  const [query, setQuery] = useState('')
  const [retiredOpen, setRetiredOpen] = useState(false)
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null)

  const normalizedQuery = query.trim().toLowerCase()

  const { coordinator, activeWorkers, standbyWorkers, retiredWorkers } = useMemo(() => {
    const all = Object.values(snapshot.members || {})
    const coord = all.find((m) => m.role === 'coordinator' || m.name === 'coordinator') ?? null
    const workers = all.filter((m) => m !== coord && m.role !== 'monitor')

    const live = workers.filter((m) => !m.killed && m.state !== 'killed')
    const retired = workers
      .filter((m) => m.killed || m.state === 'killed')
      .sort((a, b) => (b.last_post_seq ?? 0) - (a.last_post_seq ?? 0) || a.name.localeCompare(b.name))

    const active = live
      .filter((m) => m.state === 'working')
      .sort((a, b) => (b.last_post_seq ?? 0) - (a.last_post_seq ?? 0) || a.name.localeCompare(b.name))

    const standby = live
      .filter((m) => m.state !== 'working')
      .sort((a, b) => {
        const scoreA = a.failure ? 0 : a.waiting_on?.length ? 1 : 2
        const scoreB = b.failure ? 0 : b.waiting_on?.length ? 1 : 2
        if (scoreA !== scoreB) return scoreA - scoreB
        return (b.last_post_seq ?? 0) - (a.last_post_seq ?? 0) || a.name.localeCompare(b.name)
      })

    return {
      coordinator: coord && matchesQuery(coord, normalizedQuery) ? coord : null,
      activeWorkers: active.filter((m) => matchesQuery(m, normalizedQuery)),
      standbyWorkers: standby.filter((m) => matchesQuery(m, normalizedQuery)),
      retiredWorkers: retired.filter((m) => matchesQuery(m, normalizedQuery)),
    }
  }, [snapshot.members, normalizedQuery])

  const selectedMember = selectedMemberName ? (snapshot.members[selectedMemberName] ?? null) : null
  const shimmerDelay = `-${Date.now() % 1900}ms`

  const renderCard = (m: MemberRecord): JSX.Element => {
    const badge = getStatusBadge(m)
    const dotVariant = getDotVariant(m)
    const beeState = m.killed || m.state === 'killed'
      ? 'killed'
      : m.waiting_on?.length
        ? 'waiting_on'
        : m.state
    const modelShort = (m.model_display_name || m.model || '').replace(/-(?:dropdown|high|medium)$/i, '')
    const nonMainChannels = (m.channels ?? []).filter((c) => c && c !== 'main')
    const wsShort = m.workspace ? shortWorkspace(m.workspace) : ''
    const wsLabel = m.workspace_mode && m.workspace_mode !== 'inherit'
      ? (wsShort ? `${m.workspace_mode} · ${wsShort}` : m.workspace_mode)
      : wsShort
    const hasLiveShimmer = !m.killed && m.state === 'working' && !m.failure && Boolean(m.activity)
    const badgeColor = badge.tone === 'info'
      ? 'var(--ag-primary, #007acc)'
      : badge.tone === 'warn'
        ? 'var(--ag-warning, #bca136)'
        : badge.tone === 'bad'
          ? 'var(--ag-error, #cb3d3d)'
          : 'var(--ag-fg-muted, #5d676f)'

    return (
      <article
        key={m.name}
        className={`ag-mrow${m.killed ? ' retired' : ''}`}
        data-testid={`swarm-member-${m.name}`}
        onClick={() => setSelectedMemberName(m.name)}
        style={{
          display: 'grid',
          gridTemplateColumns: '50px minmax(0, 1fr)',
          columnGap: 12,
          padding: 10,
          margin: '2px -10px 0',
          borderRadius: 10,
          cursor: 'pointer',
          opacity: m.killed ? 0.68 : 1,
          transition: 'background-color 0.12s ease',
        }}
      >
        <span
          className="ag-mav"
          style={{
            position: 'relative',
            width: 50,
            height: 44,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: getBeeTileBg(m.name, m.role),
            boxShadow: 'inset 0 0 0 1px var(--ag-border, rgba(128,128,128,0.2))',
            flex: 'none',
          }}
        >
          <PixelBee
            name={m.name}
            role={m.role}
            state={beeState}
            size={2}
            showDot={Boolean(dotVariant)}
            dotVariant={dotVariant}
          />
        </span>

        <div className="ag-mcol" style={{ minWidth: 0 }}>
          <header
            className="ag-mhead"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 22 }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>@{m.name}</span>
              <span
                className={`ag-mstat ag-mstat-${badge.tone}`}
                style={{
                  fontSize: 12,
                  fontWeight: badge.tone === 'muted' ? 400 : 500,
                  color: badgeColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {badge.label}
              </span>
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                flex: 'none',
                fontFamily: 'var(--ag-mono, monospace)',
                fontSize: 11,
                color: 'var(--ag-fg-faint, #9da5ab)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {modelShort && <span>{modelShort}</span>}
              {m.last_post_seq ? (
                <button
                  type="button"
                  className="ag-ghost-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onJumpToSeq(m.last_post_seq!)
                  }}
                  title={`Go to #${m.last_post_seq} on Board`}
                  style={{ height: 20, padding: '0 4px', fontFamily: 'var(--ag-mono, monospace)', fontSize: 11 }}
                >
                  {modelShort ? '· ' : ''}#{m.last_post_seq}
                </button>
              ) : null}
            </span>
          </header>

          {m.task_hint && (
            <div
              className="ag-mrole"
              style={{
                fontSize: 12,
                color: 'var(--ag-fg-muted, #5d676f)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 1,
              }}
            >
              {m.task_hint}
            </div>
          )}

          {(wsLabel || m.branch || nonMainChannels.length > 0) && (
            <div className="ag-mtags" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {wsLabel && (
                <span
                  className="ag-mtag"
                  title={m.workspace || wsLabel}
                  style={{
                    fontSize: 11,
                    lineHeight: '18px',
                    padding: '0 6px',
                    borderRadius: 999,
                    color: 'var(--ag-fg-muted, #5d676f)',
                    background: 'var(--ag-fill, rgba(128,128,128,0.1))',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {wsLabel}
                </span>
              )}
              {m.branch && (
                <span
                  className="ag-mtag"
                  title={`Branch: ${m.branch}`}
                  style={{
                    fontSize: 11,
                    lineHeight: '18px',
                    padding: '0 6px',
                    borderRadius: 999,
                    fontFamily: 'var(--ag-mono, monospace)',
                    color: 'var(--ag-fg-muted, #5d676f)',
                    background: 'var(--ag-fill, rgba(128,128,128,0.1))',
                  }}
                >
                  {m.branch}
                </span>
              )}
              {nonMainChannels.length > 0 && (
                <span
                  className="ag-mtag"
                  style={{
                    fontSize: 11,
                    lineHeight: '18px',
                    padding: '0 6px',
                    borderRadius: 999,
                    color: 'var(--ag-fg-muted, #5d676f)',
                    background: 'var(--ag-fill, rgba(128,128,128,0.1))',
                  }}
                >
                  {nonMainChannels.includes('*') ? 'all channels' : nonMainChannels.map((c) => `#${c}`).join(' ')}
                </span>
              )}
            </div>
          )}

          {hasLiveShimmer ? (
            <div
              className="ag-mnow ag-mact"
              data-testid="swarm-member-activity"
              title={m.activity}
              style={{
                marginTop: 3,
                fontSize: 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontStyle: m.activity_kind === 'thinking' ? 'italic' : 'normal',
              }}
            >
              <span className="ag-shimmer animate-shimmer-text" style={{ animationDelay: shimmerDelay }}>
                {m.activity}
              </span>
            </div>
          ) : m.failure ? (
            <div style={{ marginTop: 3, fontSize: 12, color: 'var(--ag-error, #cb3d3d)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.failure.message}
            </div>
          ) : m.activity ? (
            <div style={{ marginTop: 3, fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.activity}
            </div>
          ) : null}
        </div>
      </article>
    )
  }

  const renderGroup = (title: string, list: MemberRecord[]): JSX.Element | null => {
    if (list.length === 0) return null
    return (
      <section className="ag-mgroup" style={{ marginBottom: 14 }}>
        <h3
          className="ag-msec"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            margin: '0 0 4px',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--ag-fg-muted, #5d676f)',
          }}
        >
          <span>{title}</span>
          <em style={{ fontStyle: 'normal', fontWeight: 500, color: 'var(--ag-fg-faint, #9da5ab)', fontVariantNumeric: 'tabular-nums' }}>
            {list.length}
          </em>
        </h3>
        <div className="ag-mlist" style={{ display: 'flex', flexDirection: 'column' }}>
          {list.map(renderCard)}
        </div>
      </section>
    )
  }

  const hasAnyVisible = Boolean(coordinator) || activeWorkers.length > 0 || standbyWorkers.length > 0 || retiredWorkers.length > 0

  return (
    <div className="ag-members" data-testid="swarm-members-tab">
      <div className="ag-mtop" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <label className="ag-search" style={{ flex: 1 }}>
          <svg className="ag-icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.25" />
            <path d="m10.25 10.25 3.25 3.25" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members, models, branches, tasks…"
            aria-label="Search members"
          />
        </label>
      </div>

      {coordinator && (
        <section
          className="ag-mgroup ag-mcoord"
          style={{
            paddingBottom: 8,
            marginBottom: 12,
            borderBottom: '1px solid var(--ag-border, rgba(128,128,128,0.16))',
          }}
        >
          {renderCard(coordinator)}
        </section>
      )}

      {renderGroup('Active', activeWorkers)}
      {renderGroup('Standing by', standbyWorkers)}

      {retiredWorkers.length > 0 && (
        <section
          className={`ag-mgroup ag-mretgrp${retiredOpen ? ' open' : ''}`}
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1px solid var(--ag-border, rgba(128,128,128,0.16))',
          }}
        >
          <button
            type="button"
            className="ag-mret"
            aria-expanded={retiredOpen}
            onClick={() => setRetiredOpen((v) => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 28,
              border: 0,
              background: 'transparent',
              padding: 0,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--ag-fg-muted, #5d676f)',
              cursor: 'pointer',
            }}
          >
            <span>Retired</span>
            <em style={{ fontStyle: 'normal', fontWeight: 500, color: 'var(--ag-fg-faint, #9da5ab)' }}>
              {retiredWorkers.length}
            </em>
            <span style={{ marginLeft: 'auto', fontSize: 10 }}>{retiredOpen ? '▾' : '▸'}</span>
          </button>
          {retiredOpen && (
            <div className="ag-mlist" style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
              {retiredWorkers.map(renderCard)}
            </div>
          )}
        </section>
      )}

      {!hasAnyVisible && (
        <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--ag-fg-muted, #5d676f)', fontSize: 13 }}>
          {normalizedQuery ? `No members match "${query}".` : 'No members in this swarm yet.'}
        </div>
      )}

      <MemberDrawer
        swarmId={snapshot.swarm_id}
        member={selectedMember}
        models={models}
        onClose={() => setSelectedMemberName(null)}
        onJumpToSeq={onJumpToSeq}
        onAction={onAction}
      />
    </div>
  )
}
