import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UiActionRequest } from '../../src/shared/protocol'
import { useSwarmStore } from '../store'
import { OverviewTab } from './OverviewTab'
import { BoardTab, type JumpTarget } from './BoardTab'
import { MembersTab } from './MembersTab'
import { GraphTab } from './GraphTab'
import { RawTab } from './RawTab'

export type WorkspaceTab = 'overview' | 'feed' | 'members' | 'graph' | 'raw'

export interface SwarmWorkspaceProps {
  sessionId?: string
  initialTab?: WorkspaceTab
}

function detectHostTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'light'
  try {
    const probe = document.createElement('span')
    probe.style.cssText = 'position:absolute;visibility:hidden;color:var(--dsw-alias-bg-primary, var(--dsw-alias-bg-base, var(--background, #f7f7f8)))'
    document.documentElement.appendChild(probe)
    const c = getComputedStyle(probe).color
    probe.remove()
    const nums = (c.match(/[\d.]+/g) || []).map(Number)
    if (nums.length >= 3) {
      const scale = c.startsWith('color(') ? 1 : 255
      const lum = (0.2126 * nums[0] + 0.7152 * nums[1] + 0.0722 * nums[2]) / scale
      return lum < 0.5 ? 'dark' : 'light'
    }
  } catch { /* fallback */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function SwarmWorkspace(props: SwarmWorkspaceProps = {}): JSX.Element {
  const {
    snapshot,
    swarms,
    loading,
    error,
    sync,
    models,
    refresh,
    selectSwarm,
    postAction,
    fetchMessagesBefore,
  } = useSwarmStore(props.sessionId)

  const [tab, setTab] = useState<WorkspaceTab>(props.initialTab ?? 'overview')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => detectHostTheme())
  const [jumpTarget, setJumpTarget] = useState<JumpTarget | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [loadingEarlier, setLoadingEarlier] = useState(false)

  useEffect(() => {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return
    const update = (): void => setTheme(detectHostTheme())
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] })
    return () => obs.disconnect()
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev))
    }, 2800)
  }, [])

  const handleJumpToSeq = useCallback((seq: number) => {
    setTab('feed')
    setJumpTarget({ seq, nonce: Date.now() + Math.random() })
  }, [])

  const handleAction = useCallback(async (req: UiActionRequest) => {
    setActionError(null)
    try {
      await postAction(req)
      if (req.action === 'post_message') showToast('Posted to board')
      else if (req.action === 'switch_model') showToast(`Switched @${req.member} model`)
      else if (req.action === 'kill_worker') showToast(`Killed @${req.member}`)
      else if (req.action === 'nudge_worker') showToast(`Nudged @${req.member}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setActionError(msg)
      throw err
    }
  }, [postAction, showToast])

  const handleLoadEarlier = useCallback(async () => {
    if (!snapshot || loadingEarlier) return
    const firstSeq = snapshot.messages[0]?.seq ?? snapshot.head + 1
    setLoadingEarlier(true)
    try {
      await fetchMessagesBefore(snapshot.swarm_id, firstSeq, 200)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoadingEarlier(false)
    }
  }, [snapshot, loadingEarlier, fetchMessagesBefore])

  const counts = useMemo(() => {
    if (!snapshot) return { members: 0, attention: 0 }
    const liveMembers = Object.values(snapshot.members).filter((m) => !m.killed).length
    const attention = snapshot.systemAttention.length + (snapshot.stallBanner ? 1 : 0)
    return { members: liveMembers, attention }
  }, [snapshot])

  const liveClass = sync === 'live' ? '' : error ? 'error' : 'stale'
  const liveLabel = sync === 'live' ? 'Live' : sync === 'reconnecting' ? 'Reconnecting' : sync === 'connecting' ? 'Connecting' : 'Snapshot'

  return (
    <div className="ag-root" data-testid="swarm-board" data-theme={theme}>
      <header className="ag-header">
        <div className="ag-header-row">
          <h1 className="ag-swarm-title" title={snapshot ? `${snapshot.title}\n${snapshot.swarm_id}` : 'Hive Swarm'}>
            {snapshot?.title || 'Hive Swarm'}
          </h1>

          {swarms.length > 1 && (
            <select
              className="ag-swarm-select"
              aria-label="Select swarm"
              value={snapshot?.swarm_id ?? ''}
              onChange={(e) => { void selectSwarm(e.target.value || null) }}
            >
              {swarms.map((s) => (
                <option key={s.swarm_id} value={s.swarm_id}>
                  {s.title || s.swarm_id.slice(0, 8)} · #{s.head}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="ag-icon-btn"
            title="Refresh snapshot"
            aria-label="Refresh snapshot"
            onClick={() => { void refresh(true) }}
          >
            <svg className="ag-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M13 8a5 5 0 1 1-1.3-3.35M13 3v2.5h-2.5" />
            </svg>
          </button>

          <span className={`ag-live ${liveClass}`} title={error ?? 'Live SSE updates'}>
            <span className="ag-live-dot" aria-hidden="true" />
            <span>{liveLabel}</span>
          </span>
        </div>

        <nav className="ag-tabs" role="tablist" aria-label="Swarm views">
          <button
            type="button"
            role="tab"
            className={`ag-tab ${tab === 'overview' ? 'active' : ''}`}
            aria-selected={tab === 'overview'}
            data-testid="swarm-tab-overview"
            onClick={() => setTab('overview')}
          >
            <span>Overview</span>
            {counts.attention > 0 && <span className="ag-tab-badge">{counts.attention}</span>}
          </button>
          <button
            type="button"
            role="tab"
            className={`ag-tab ${tab === 'feed' ? 'active' : ''}`}
            aria-selected={tab === 'feed'}
            data-testid="swarm-tab-feed"
            onClick={() => setTab('feed')}
          >
            <span>Board</span>
            {snapshot && snapshot.head > 0 && <span className="ag-tab-count">{snapshot.head}</span>}
          </button>
          <button
            type="button"
            role="tab"
            className={`ag-tab ${tab === 'members' ? 'active' : ''}`}
            aria-selected={tab === 'members'}
            data-testid="swarm-tab-members"
            onClick={() => setTab('members')}
          >
            <span>Members</span>
            {counts.members > 0 && <span className="ag-tab-count">{counts.members}</span>}
          </button>
          <button
            type="button"
            role="tab"
            className={`ag-tab ${tab === 'graph' ? 'active' : ''}`}
            aria-selected={tab === 'graph'}
            data-testid="swarm-tab-graph"
            onClick={() => setTab('graph')}
          >
            <span>Graph</span>
          </button>
          <button
            type="button"
            role="tab"
            className={`ag-tab ${tab === 'raw' ? 'active' : ''}`}
            aria-selected={tab === 'raw'}
            data-testid="swarm-tab-raw"
            onClick={() => setTab('raw')}
          >
            <span>Raw</span>
          </button>
        </nav>
      </header>

      <div className="ag-scroll">
        <div className="ag-main">
          {actionError && (
            <div className="ag-ov-sys error" role="alert" style={{ marginBottom: 10 }}>
              <span className="ag-ov-sys-dot" aria-hidden="true" />
              <div className="ag-ov-sys-body">{actionError}</div>
              <button type="button" className="ag-ghost-btn" onClick={() => setActionError(null)}>Dismiss</button>
            </div>
          )}

          {loading && !snapshot ? (
            <div className="ag-loading" aria-busy="true">
              <div className="ag-skel" style={{ width: '58%', height: 14 }} />
              <div className="ag-skel" style={{ width: '88%', height: 10, marginTop: 10 }} />
              <div className="ag-skel" style={{ width: '74%', height: 10, marginTop: 8 }} />
              <p className="ag-loading-caption">Connecting to Hive Swarm…</p>
            </div>
          ) : !snapshot ? (
            <div className="ag-empty">
              <div className="ag-empty-card">
                <svg className="ag-empty-icon" viewBox="0 0 56 56" aria-hidden="true">
                  <g className="ag-empty-links">
                    <line x1="28" y1="12" x2="12" y2="40" />
                    <line x1="28" y1="12" x2="44" y2="40" />
                    <line x1="12" y1="40" x2="44" y2="40" />
                  </g>
                  <circle className="ag-empty-node" cx="28" cy="12" r="5" />
                  <circle className="ag-empty-node" cx="12" cy="40" r="5" />
                  <circle className="ag-empty-node" cx="44" cy="40" r="5" />
                </svg>
                <h2 className="ag-empty-title">No active swarm yet</h2>
                <p className="ag-empty-body">
                  Swarms started in this session appear here automatically with Overview, Board, Members, and Hive Graph. Start one with <code>/ag-swarm</code>.
                </p>
                {swarms.length > 0 && (
                  <div className="ag-empty-swarms">
                    {swarms.slice(0, 5).map((s) => (
                      <button
                        key={s.swarm_id}
                        type="button"
                        className="ag-btn sm"
                        onClick={() => { void selectSwarm(s.swarm_id) }}
                      >
                        Open {s.title || s.swarm_id.slice(0, 8)} (#{s.head})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {tab === 'overview' && (
                <OverviewTab
                  snapshot={snapshot}
                  onJumpToSeq={handleJumpToSeq}
                  onSwitchTab={setTab}
                />
              )}
              {tab === 'feed' && (
                <BoardTab
                  snapshot={snapshot}
                  jumpTarget={jumpTarget}
                  onJumpToSeq={handleJumpToSeq}
                  onAction={handleAction}
                  onLoadEarlier={handleLoadEarlier}
                  loadingEarlier={loadingEarlier}
                />
              )}
              {tab === 'members' && (
                <MembersTab
                  snapshot={snapshot}
                  onJumpToSeq={handleJumpToSeq}
                  onAction={handleAction}
                  models={models}
                />
              )}
              {tab === 'graph' && (
                <GraphTab
                  snapshot={snapshot}
                  onJumpToSeq={handleJumpToSeq}
                />
              )}
              {tab === 'raw' && <RawTab swarmId={snapshot.swarm_id} />}
            </>
          )}
        </div>
      </div>

      {toast && <div className="ag-toast" role="status">{toast}</div>}
    </div>
  )
}
