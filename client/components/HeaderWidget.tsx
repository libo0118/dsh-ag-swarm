import { useEffect, useRef, useState } from 'react'
import { PixelBee } from '../bee-sprites'
import { useSwarmStore } from '../store'

export interface HeaderWidgetProps {
  sessionId?: string
}

function detectTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'light'
  try {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--dsw-alias-bg-primary').trim()
      || getComputedStyle(document.body).backgroundColor
    const nums = bg.match(/[\d.]+/g)?.map(Number)
    if (nums && nums.length >= 3) {
      const lum = (0.2126 * nums[0] + 0.7152 * nums[1] + 0.0722 * nums[2]) / 255
      return lum < 0.5 ? 'dark' : 'light'
    }
  } catch { /* ignore */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function HeaderWidget(props: HeaderWidgetProps = {}): JSX.Element {
  const { snapshot, swarms, sync, error, selectSwarm } = useSwarmStore(props.sessionId)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const theme = detectTheme()

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent): void => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const members = snapshot ? Object.values(snapshot.members) : []
  const liveMembers = members.filter((m) => !m.killed)
  const workingCount = snapshot?.stats.workingCount ?? 0
  const attentionCount = (snapshot?.systemAttention.length ?? 0) + (snapshot?.stallBanner ? 1 : 0)
  const statusKind = attentionCount > 0 || error ? 'warn' : workingCount > 0 ? 'working' : 'idle'
  const recentPosts = snapshot
    ? snapshot.messages.filter((m) => m.kind !== 'control' && !m.control).slice(-3).reverse()
    : []

  return (
    <div className="ag-hbtn-wrap" ref={wrapRef} data-testid="ag-swarm-header-widget">
      <button
        type="button"
        className={`ag-hbtn ${statusKind}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={snapshot ? `${snapshot.title} · ${workingCount} working` : 'Hive Swarm'}
        onClick={() => setOpen((v) => !v)}
      >
        <PixelBee
          name="coordinator"
          role="coordinator"
          state={workingCount > 0 ? 'working' : 'landed'}
          size={1}
        />
        <span className="ag-hbtn-label">
          {snapshot ? (workingCount > 0 ? `${workingCount} working` : `${liveMembers.length} bees`) : 'Swarm'}
        </span>
        <span className={`ag-hbtn-dot ${statusKind}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="ag-hpop" role="dialog" aria-label="Hive Swarm status" data-theme={theme}>
          <div className="ag-hpop-head">
            <b>{snapshot?.title || 'Hive Swarm'}</b>
            <span className={`ag-live ${sync === 'live' ? '' : 'stale'}`}>
              <span className="ag-live-dot" aria-hidden="true" />
              <span>{sync === 'live' ? 'Live' : sync === 'reconnecting' ? 'Reconnecting' : sync}</span>
            </span>
          </div>

          {error && <p className="ag-hpop-err">{error}</p>}

          {swarms.length > 1 && (
            <select
              className="ag-swarm-select"
              aria-label="Switch swarm"
              value={snapshot?.swarm_id ?? ''}
              onChange={(e) => { void selectSwarm(e.target.value || null) }}
            >
              {swarms.map((s) => (
                <option key={s.swarm_id} value={s.swarm_id}>
                  {s.title || s.swarm_id.slice(0, 8)} ({s.workingCount} active)
                </option>
              ))}
            </select>
          )}

          {!snapshot ? (
            <p className="ag-hpop-empty">No active swarm in this session. Start one with <code>/ag-swarm</code>.</p>
          ) : (
            <>
              <div className="ag-hpop-stats">
                <span><b>{snapshot.stats.workingCount}</b> working</span>
                <span><b>{snapshot.stats.waitingCount}</b> waiting</span>
                <span><b>{snapshot.stats.doneTasks}/{snapshot.stats.totalTasks}</b> tasks</span>
                <span><b>#{snapshot.head}</b> posts</span>
              </div>

              {snapshot.stallBanner && (
                <div className="ag-hpop-warn">
                  Stalled: {snapshot.stallBanner.text.slice(0, 90)}
                </div>
              )}

              <div className="ag-hpop-list">
                {liveMembers.slice(0, 6).map((m) => (
                  <div key={m.name} className="ag-hpop-row">
                    <PixelBee name={m.name} role={m.role} state={m.state} size={1} showDot />
                    <div className="ag-hpop-row-main">
                      <div className="ag-hpop-row-top">
                        <b>@{m.name}</b>
                        <span className={`ag-hpop-st ${m.state}`}>{m.state}</span>
                      </div>
                      {m.activity && m.state === 'working' ? (
                        <div className="ag-hpop-act ag-shimmer">{m.activity}</div>
                      ) : m.task_hint ? (
                        <div className="ag-hpop-act">{m.task_hint}</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {recentPosts.length > 0 && (
                <div className="ag-hpop-posts">
                  <div className="ag-hpop-sub">Recent board posts</div>
                  {recentPosts.map((p) => (
                    <div key={p.seq} className="ag-hpop-post">
                      <span className="ag-hpop-pseq">#{p.seq}</span>
                      <b>@{p.agent}</b>
                      <span className="ag-hpop-ptxt">{p.text.replace(/\s+/g, ' ').slice(0, 72)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="ag-hpop-foot">Open the Swarm tab for Overview, Board &amp; Hive graph.</div>
        </div>
      )}
    </div>
  )
}
