import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import type {
  MemberRecord,
  MemberTranscriptPayload,
  SwarmSnapshotPayload,
  TranscriptStepView,
  UiActionRequest,
} from '../../src/shared/protocol'
import { t, useUiLocale } from '../i18n'
import { swarmClientStore } from '../store'

export interface SubagentsTabProps {
  snapshot: SwarmSnapshotPayload
  initialMember?: string | null
  onAction: (req: UiActionRequest) => Promise<void>
  onJumpToSeq: (seq: number) => void
}

type StreamBlock =
  | { kind: 'worked'; id: string; durationLabel: string; steps: TranscriptStepView[] }
  | { kind: 'user'; id: string; step: TranscriptStepView }
  | { kind: 'assistant'; id: string; step: TranscriptStepView }

function formatDurationMs(ms: number, isZh: boolean): string {
  const sec = Math.max(1, Math.round(ms / 1000))
  if (sec < 60) return isZh ? `${sec}秒` : `${sec}s`
  const min = Math.floor(sec / 60)
  const rem = sec % 60
  return isZh ? (rem > 0 ? `${min}分${rem}秒` : `${min}分`) : (rem > 0 ? `${min}m ${rem}s` : `${min}m`)
}

function groupTranscriptBlocks(steps: TranscriptStepView[], isZh: boolean): StreamBlock[] {
  const blocks: StreamBlock[] = []
  let workBuf: TranscriptStepView[] = []

  const flushWork = (): void => {
    if (workBuf.length === 0) return
    const items = workBuf
    workBuf = []
    let ms = items.reduce((acc, s) => acc + (s.durationMs ?? 0), 0)
    const times = items.map((s) => s.ts ?? (s.time ? Date.parse(s.time) : NaN)).filter((n) => Number.isFinite(n))
    if (ms <= 0 && times.length >= 2) {
      ms = Math.max(0, times[times.length - 1]! - times[0]!)
    }
    const label = ms > 0 ? t('subagents.workedFor', { duration: formatDurationMs(ms, isZh) }) : t('subagents.stepsCount', { count: items.length })
    blocks.push({ kind: 'worked', id: `w-${items[0]!.index}-${items.length}`, durationLabel: label, steps: items })
  }

  for (const step of steps) {
    if (step.kind === 'assistant') {
      flushWork()
      blocks.push({ kind: 'assistant', id: `a-${step.index}`, step })
    } else if (step.kind === 'user') {
      flushWork()
      blocks.push({ kind: 'user', id: `u-${step.index}`, step })
    } else {
      workBuf.push(step)
    }
  }
  flushWork()
  return blocks
}

function SubagentText({ text }: { text: string }): JSX.Element {
  const lines = String(text || '').split(/\r?\n/)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, lineHeight: 1.62, color: 'var(--ag-fg)' }}>
      {lines.map((line, i) => {
        if (!line.trim()) return null
        const parts = line.split(/(`[^`]+`)/g)
        return (
          <p key={i} style={{ margin: 0, overflowWrap: 'anywhere' }}>
            {parts.map((part, j) =>
              part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
                <code key={j}>{part.slice(1, -1)}</code>
              ) : (
                <Fragment key={j}>{part}</Fragment>
              ),
            )}
          </p>
        )
      })}
    </div>
  )
}

export function SubagentsTab({ snapshot, initialMember, onAction, onJumpToSeq }: SubagentsTabProps): JSX.Element {
  const locale = useUiLocale()
  const isZh = locale === 'zh-CN'

  const { workers, coordinator, workingWorkers, completedWorkers } = useMemo(() => {
    const all = Object.values(snapshot.members || {}).filter((m) => m.role !== 'monitor')
    const coord = all.find((m) => m.role === 'coordinator' || m.name === 'coordinator') ?? null
    const wList = all.filter((m) => m !== coord)
    const working = wList.filter((m) => !m.killed && m.state === 'working')
    const completed = wList.filter((m) => m.killed || m.state !== 'working')
    return { workers: wList, coordinator: coord, workingWorkers: working, completedWorkers: completed }
  }, [snapshot.members])

  const defaultSelected = useMemo(() => {
    if (initialMember && snapshot.members[initialMember]) return initialMember
    return workingWorkers[0]?.name ?? completedWorkers[0]?.name ?? coordinator?.name ?? ''
  }, [initialMember, snapshot.members, workingWorkers, completedWorkers, coordinator])

  const [selectedName, setSelectedName] = useState<string>(() => defaultSelected)
  const [fullView, setFullView] = useState(false)
  const [sideOpen, setSideOpen] = useState(true)
  const [showAllCompleted, setShowAllCompleted] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [transcript, setTranscript] = useState<MemberTranscriptPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nudgeText, setNudgeText] = useState('')
  const [sendingNudge, setSendingNudge] = useState(false)

  useEffect(() => {
    if (initialMember && snapshot.members[initialMember]) setSelectedName(initialMember)
  }, [initialMember, snapshot.members])

  useEffect(() => {
    if (!selectedName || !snapshot.members[selectedName]) {
      if (defaultSelected) setSelectedName(defaultSelected)
    }
  }, [selectedName, snapshot.members, defaultSelected])

  useEffect(() => {
    if (!fullView) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setFullView(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullView])

  const selectedMember: MemberRecord | null = selectedName ? (snapshot.members[selectedName] ?? null) : null
  const fetchTrace = useCallback(async (quiet = false) => {
    if (!selectedName || !snapshot.members[selectedName]) return
    if (!quiet) setLoading(true)
    setError(null)
    try {
      const data = await swarmClientStore.fetchMemberTranscript(snapshot.swarm_id, selectedName)
      setTranscript(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      if (!quiet) setLoading(false)
    }
  }, [snapshot.swarm_id, selectedName, snapshot.members])

  useEffect(() => {
    void fetchTrace(false)
  }, [selectedName, selectedMember?.steps_count, selectedMember?.activity, fetchTrace])

  useEffect(() => {
    if (!selectedMember || selectedMember.state !== 'working') return
    const timer = setInterval(() => {
      void fetchTrace(true)
    }, 2000)
    return () => clearInterval(timer)
  }, [selectedMember?.name, selectedMember?.state, fetchTrace])

  const blocks = useMemo(() => groupTranscriptBlocks(transcript?.steps ?? [], isZh), [transcript?.steps, isZh])
  const visibleCompleted = showAllCompleted ? completedWorkers : completedWorkers.slice(0, 6)
  const hiddenCompletedCount = Math.max(0, completedWorkers.length - 6)

  const sendNudge = async (): Promise<void> => {
    const text = nudgeText.trim()
    if (!text || !selectedMember || selectedMember.killed || sendingNudge) return
    setSendingNudge(true)
    try {
      await onAction({ action: 'nudge_worker', swarmId: snapshot.swarm_id, member: selectedMember.name, text })
      setNudgeText('')
      void fetchTrace(true)
    } finally {
      setSendingNudge(false)
    }
  }

  if (workers.length === 0 && !coordinator) {
    return (
      <div className="ag-empty">
        <div className="ag-empty-card">
          <p className="ag-empty-body">{t('subagents.empty')}</p>
        </div>
      </div>
    )
  }

  const displayTitle = selectedMember
    ? (selectedMember.role === 'coordinator' ? `@coordinator` : `Swarm Worker (${selectedMember.name})`)
    : t('tab.subagents')

  return (
    <div className={`ag-sub-wrap${fullView ? ' full' : ''}`} data-testid="swarm-subagents-view">
      <div className="ag-sub-topbar">
        <strong style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayTitle}
        </strong>
        {selectedMember && (
          <span
            style={{
              fontSize: 11,
              padding: '1px 7px',
              borderRadius: 999,
              background: 'var(--ag-fill)',
              color: selectedMember.state === 'working' ? 'var(--ag-primary)' : 'var(--ag-fg-muted)',
            }}
          >
            {selectedMember.killed ? t('members.state.killed') : t(`members.state.${selectedMember.state}` as 'members.state.working')}
          </span>
        )}
        {selectedMember?.model && (
          <span style={{ fontSize: 11, fontFamily: 'var(--ag-mono)', color: 'var(--ag-fg-faint)' }}>
            {selectedMember.model_display_name || selectedMember.model}
          </span>
        )}
        <span className="ag-spacer" />
        {selectedMember?.last_post_seq ? (
          <button
            type="button"
            className="ag-ghost-btn"
            onClick={() => onJumpToSeq(selectedMember.last_post_seq!)}
            style={{ fontSize: 11, fontFamily: 'var(--ag-mono)' }}
          >
            #{selectedMember.last_post_seq}
          </button>
        ) : null}
        <button type="button" className="ag-ghost-btn" onClick={() => void fetchTrace(false)} disabled={loading}>
          {loading ? t('common.refreshing') : t('common.refresh')}
        </button>
        <button type="button" className="ag-ghost-btn" onClick={() => setFullView((v) => !v)} data-testid="swarm-subagent-fullview">
          {fullView ? t('subagents.exitFullView') : t('subagents.fullView')}
        </button>
        <button
          type="button"
          className="ag-icon-btn"
          aria-label="Toggle subagents list"
          onClick={() => setSideOpen((v) => !v)}
          style={{ width: 26, height: 26, fontSize: 13 }}
        >
          ☰
        </button>
      </div>

      <div className={`ag-sub-layout${sideOpen ? '' : ' noside'}`}>
        <div className="ag-sub-main">
          <div className="ag-sub-stream">
            {error && (
              <div style={{ fontSize: 12, color: 'var(--ag-error)' }}>
                {error}
              </div>
            )}
            {selectedMember?.failure && (
              <div
                role="alert"
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  background: 'color-mix(in srgb, var(--ag-error) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--ag-error) 30%, transparent)',
                }}
              >
                <strong style={{ color: 'var(--ag-error)' }}>{selectedMember.failure.kind}: </strong>
                {selectedMember.failure.message}
              </div>
            )}
            {!loading && blocks.length === 0 && (
              <div style={{ fontSize: 12.5, color: 'var(--ag-fg-muted)' }}>
                {t('drawer.noSteps')}
              </div>
            )}
            {blocks.map((block) => {
              if (block.kind === 'worked') {
                const isOpen = Boolean(expandedGroups[block.id])
                return (
                  <div key={block.id}>
                    <button
                      type="button"
                      className="ag-sub-worked"
                      onClick={() => setExpandedGroups((p) => ({ ...p, [block.id]: !isOpen }))}
                    >
                      <span>{block.durationLabel}</span>
                      <span>{isOpen ? '▾' : '›'}</span>
                    </button>
                    {isOpen && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, paddingLeft: 10, borderLeft: '2px solid var(--ag-line)' }}>
                        {block.steps.map((step) => (
                          <div key={step.index} style={{ fontSize: 12, background: 'var(--ag-fill)', borderRadius: 6, padding: '6px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong style={{ fontSize: 10.5, textTransform: 'uppercase', color: step.status === 'error' ? 'var(--ag-error)' : 'var(--ag-fg-muted)' }}>
                                {step.toolName || step.kind}
                              </strong>
                              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.title}</span>
                              {step.time && <span className="ag-ts">{step.time}</span>}
                            </div>
                            {step.detail && (
                              <pre style={{ margin: '4px 0 0', fontSize: 11, maxHeight: 140, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {step.detail}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              if (block.kind === 'user') {
                const detail = block.step.detail || ''
                const isOpen = detail.length <= 160 || Boolean(expandedGroups[block.id])
                return (
                  <div key={block.id} style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--ag-fill)', fontSize: 12 }}>
                    <button
                      type="button"
                      className="ag-sub-worked"
                      style={{ width: '100%', justifyContent: 'space-between', padding: 0 }}
                      onClick={() => setExpandedGroups((p) => ({ ...p, [block.id]: !isOpen }))}
                    >
                      <span style={{ fontWeight: 600 }}>{block.step.title}</span>
                      <span>{isOpen ? '▾' : '›'}</span>
                    </button>
                    {isOpen && detail && <div style={{ marginTop: 4, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: 'var(--ag-fg-2)' }}>{detail}</div>}
                  </div>
                )
              }
              return (
                <div key={block.id} style={{ padding: '2px 0' }}>
                  <SubagentText text={block.step.detail || block.step.title} />
                </div>
              )
            })}
            {selectedMember?.state === 'working' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ag-fg-muted)', paddingTop: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ag-success)' }} />
                <span className="ag-shimmer">{selectedMember.activity || (isZh ? '正在执行…' : 'Working…')}</span>
              </div>
            )}
          </div>

          {selectedMember && !selectedMember.killed && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid var(--ag-line)', background: 'var(--ag-card)' }}>
              <input
                type="text"
                value={nudgeText}
                disabled={sendingNudge}
                onChange={(e) => setNudgeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !sendingNudge) void sendNudge()
                }}
                placeholder={t('drawer.nudgePlaceholder', { name: selectedMember.name })}
                style={{
                  flex: 1, minWidth: 0, height: 30, padding: '0 10px',
                  borderRadius: 6, border: '1px solid var(--ag-border)', background: 'var(--ag-field)', fontSize: 12,
                }}
              />
              <button type="button" className="ag-btn sm" disabled={!nudgeText.trim() || sendingNudge} onClick={() => void sendNudge()} style={{ height: 30 }}>
                {sendingNudge ? (isZh ? '发送中…' : 'Sending…') : t('drawer.nudgeBtn')}
              </button>
            </div>
          )}
        </div>

        {sideOpen && (
          <aside className="ag-sub-side" aria-label={t('tab.subagents')}>
            {workingWorkers.length > 0 && (
              <div>
                <div className="ag-sub-sgroup">{t('subagents.working')}</div>
                {workingWorkers.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    className={`ag-sub-sitem${selectedName === m.name ? ' on' : ''}`}
                    onClick={() => setSelectedName(m.name)}
                  >
                    <span className="ag-sub-dotgrid" aria-hidden="true"><i /><i /><i /><i /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Swarm Worker ({m.name})
                      </span>
                      {m.activity && (
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--ag-fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.activity}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {completedWorkers.length > 0 && (
              <div>
                <div className="ag-sub-sgroup">{t('subagents.completed')}</div>
                {visibleCompleted.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    className={`ag-sub-sitem${selectedName === m.name ? ' on' : ''}`}
                    onClick={() => setSelectedName(m.name)}
                  >
                    <span style={{ width: 12, textAlign: 'center', color: m.failure ? 'var(--ag-error)' : 'var(--ag-fg-muted)', flex: 'none' }}>
                      {m.failure ? '!' : '✓'}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Swarm Worker ({m.name})
                    </span>
                  </button>
                ))}
                {hiddenCompletedCount > 0 && (
                  <button
                    type="button"
                    className="ag-ghost-btn"
                    onClick={() => setShowAllCompleted((v) => !v)}
                    style={{ width: '100%', textAlign: 'left', padding: '4px 8px', fontSize: 11.5 }}
                  >
                    {showAllCompleted
                      ? t('subagents.showLess')
                      : t('subagents.showMore', { count: hiddenCompletedCount })}
                  </button>
                )}
              </div>
            )}

            {coordinator && (
              <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--ag-line)' }}>
                <div className="ag-sub-sgroup">{t('members.coordinator')}</div>
                <button
                  type="button"
                  className={`ag-sub-sitem${selectedName === coordinator.name ? ' on' : ''}`}
                  onClick={() => setSelectedName(coordinator.name)}
                >
                  <span style={{ width: 12, textAlign: 'center', color: coordinator.state === 'working' ? 'var(--ag-success)' : 'var(--ag-fg-muted)' }}>
                    ●
                  </span>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    @coordinator
                  </span>
                </button>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
