import { useEffect, useRef, useState } from 'react'
import { PixelBee } from '../bee-sprites'
import { t, useUiLocale } from '../i18n'
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
  const locale = useUiLocale()
  const { snapshot, swarms, sync, error, selectSwarm } = useSwarmStore(props.sessionId)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const theme = detectTheme()
  const zh = locale === 'zh-CN'

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

  const pillLabel = !snapshot
    ? t('header.noSwarm')
    : workingCount > 0
      ? t('header.working', { count: workingCount })
      : t('header.waiting')
  const syncLabel = sync === 'live' ? t('common.live') : sync === 'reconnecting' ? t('common.reconnecting') : t('common.offline')
  const stateLabel = (s: string): string => {
    if (s === 'working' || s === 'waiting' || s === 'stopped' || s === 'killed') {
      return t(`members.state.${s}`)
    }
    return s
  }

  return (
    <div className="ag-hbtn-wrap" ref={wrapRef} data-testid="ag-swarm-header-widget">
      <button
        type="button"
        className={`ag-hbtn ${statusKind}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={snapshot ? `${snapshot.title} · ${pillLabel}` : t('slot.swarm')}
        onClick={() => setOpen((v) => !v)}
      >
        <PixelBee
          name="coordinator"
          role="coordinator"
          state={workingCount > 0 ? 'working' : 'landed'}
          size={1}
        />
        <span className="ag-hbtn-label">{pillLabel}</span>
        <span className={`ag-hbtn-dot ${statusKind}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="ag-hpop" role="dialog" aria-label={t('header.title')} data-theme={theme}>
          <div className="ag-hpop-head">
            <b>{snapshot?.title || t('header.title')}</b>
            <span className={`ag-live ${sync === 'live' ? '' : 'stale'}`}>
              <span className="ag-live-dot" aria-hidden="true" />
              <span>{syncLabel}</span>
            </span>
          </div>

          {error && <p className="ag-hpop-err">{error}</p>}

          {swarms.length > 1 && (
            <select
              className="ag-swarm-select"
              aria-label={zh ? '切换蜂群' : 'Switch swarm'}
              value={snapshot?.swarm_id ?? ''}
              onChange={(e) => { void selectSwarm(e.target.value || null) }}
            >
              {swarms.map((s) => (
                <option key={s.swarm_id} value={s.swarm_id}>
                  {s.title || s.swarm_id.slice(0, 8)} ({t('header.working', { count: s.workingCount })})
                </option>
              ))}
            </select>
          )}

          {!snapshot ? (
            <p className="ag-hpop-empty">
              {zh ? <>当前会话暂无活跃蜂群，可在聊天框输入 <code>/swarm</code> 启动。</> : <>No active swarm in this session. Start one with <code>/swarm</code>.</>}
            </p>
          ) : (
            <>
              <div className="ag-hpop-stats">
                <span><b>{snapshot.stats.workingCount}</b> {t('members.state.working')}</span>
                <span><b>{snapshot.stats.waitingCount}</b> {t('members.state.waiting')}</span>
                <span><b>{snapshot.stats.doneTasks}/{snapshot.stats.totalTasks}</b> {zh ? '任务' : 'tasks'}</span>
                <span><b>#{snapshot.head}</b> {zh ? '发言' : 'posts'}</span>
              </div>

              {snapshot.stallBanner && (
                <div className="ag-hpop-warn">
                  {zh ? '停滞预警：' : 'Stalled: '}{snapshot.stallBanner.text.slice(0, 90)}
                </div>
              )}

              <div className="ag-hpop-list">
                {liveMembers.slice(0, 6).map((m) => (
                  <div key={m.name} className="ag-hpop-row">
                    <PixelBee name={m.name} role={m.role} state={m.state} size={1} showDot />
                    <div className="ag-hpop-row-main">
                      <div className="ag-hpop-row-top">
                        <b>@{m.name}</b>
                        <span className={`ag-hpop-st ${m.state}`}>{stateLabel(m.state)}</span>
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
                  <div className="ag-hpop-sub">{t('header.recent')}</div>
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

          <div className="ag-hpop-foot">
            {zh ? '切换到「蜂群」标签页可查看总览、黑板与蜂巢图谱。' : 'Open the Swarm tab for Overview, Board & Hive graph.'}
          </div>
        </div>
      )}
    </div>
  )
}
