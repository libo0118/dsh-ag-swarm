import { useEffect, useMemo, useState } from 'react'
import type {
  MemberRecord,
  ScreenshotFrame,
  SwarmSnapshotPayload,
  ThreadPriorityState,
  ThreadView,
} from '../../src/shared/protocol'
import { getBeeColor, getBeeDataUrl, getBeeTileBg, PixelBee } from '../bee-sprites'
import { t, useUiLocale } from '../i18n'
import { swarmClientStore } from '../store'
import type { WorkspaceTab } from './SwarmWorkspace'

export interface OverviewTabProps {
  snapshot: SwarmSnapshotPayload
  onJumpToSeq: (seq: number) => void
  onSwitchTab: (tab: WorkspaceTab) => void
}

const THREAD_ORDER: Record<ThreadPriorityState, number> = {
  needs: 0,
  waiting: 1,
  stuck: 2,
  running: 3,
  queued: 4,
  done: 5,
}

const THREAD_LABEL: Record<ThreadPriorityState, string> = {
  needs: 'Needs you',
  waiting: 'Waiting',
  stuck: 'Stuck',
  running: 'Moving',
  queued: 'Not started',
  done: 'Done',
}

function shimmerDelay(): string {
  return `-${Date.now() % 1900}ms`
}

function formatFrameTime(frame: ScreenshotFrame): string {
  if (Number.isFinite(frame.ts) && frame.ts > 0) {
    try {
      return new Date(frame.ts).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })
    } catch { /* fallback */ }
  }
  return frame.time || `#${frame.seq}`
}

function RingProgress({ done, running, blocked, queued }: { done: number; running: number; blocked: number; queued: number }): JSX.Element {
  const sum = done + running + blocked + queued
  if (sum > 0 && done === sum) {
    return <span className="ag-o2-ring-full" aria-hidden="true">✓</span>
  }
  const total = sum || 1
  const C = 43.98
  let off = 0
  const segs: Array<{ cls: string; len: number; offset: number }> = []
  for (const [cls, val] of [['done', done], ['running', running], ['blocked', blocked]] as const) {
    if (!val) continue
    const len = (val / total) * C
    segs.push({ cls, len, offset: -off })
    off += len
  }
  return (
    <svg className="ag-o2-ring" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="7" fill="none" className="trk" strokeWidth="2.2" />
      {segs.map((s) => (
        <circle
          key={s.cls}
          cx="9"
          cy="9"
          r="7"
          fill="none"
          className={`seg ${s.cls}`}
          strokeWidth="2.2"
          strokeDasharray={`${s.len.toFixed(2)} ${C.toFixed(2)}`}
          strokeDashoffset={s.offset.toFixed(2)}
        />
      ))}
    </svg>
  )
}

function ReelLightbox({
  frames,
  swarmId,
  initialIndex,
  totalTasks,
  onClose,
  onIndexChange,
}: {
  frames: ScreenshotFrame[]
  swarmId: string
  initialIndex: number
  totalTasks: number
  onClose: () => void
  onIndexChange: (idx: number) => void
}): JSX.Element {
  const [idx, setIdx] = useState(initialIndex)
  const [zoomed, setZoomed] = useState(false)

  const go = (next: number): void => {
    const clamped = Math.max(0, Math.min(frames.length - 1, next))
    setIdx(clamped)
    setZoomed(false)
    onIndexChange(clamped)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1) }
      else if (e.key === 'Home') { e.preventDefault(); go(0) }
      else if (e.key === 'End') { e.preventDefault(); go(frames.length - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const locale = useUiLocale()
  const zh = locale === 'zh-CN'
  const frame = frames[idx]
  if (!frame) return <></>
  const src = swarmClientStore.frameUrl(swarmId, frame.path)

  return (
    <div
      className="ag-tv"
      role="dialog"
      aria-modal="true"
      aria-label={t('overview.reel')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="ag-tvh">
        <b>{t('overview.reel')}</b>
        <span className="ag-tvpos">
          {idx === frames.length - 1
            ? `${zh ? '当前' : 'Now'} · ${idx + 1} / ${frames.length}`
            : `${idx + 1} / ${frames.length}`}
        </span>
        <span className="ag-tvwhen">{formatFrameTime(frame)}</span>
        <button type="button" className="ag-tvx" aria-label={t('common.close')} onClick={onClose}>✕</button>
      </div>
      <div className="ag-tvstage">
        <div
          className={`ag-tvscroll ${zoomed ? 'zoom' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <img
            className="ag-tvimg"
            src={src}
            alt={frame.caption}
            onClick={() => setZoomed((z) => !z)}
          />
        </div>
        <button type="button" className="ag-tvnav prev" aria-label={zh ? '上一帧' : 'Previous'} disabled={idx <= 0} onClick={() => go(idx - 1)}>‹</button>
        <button type="button" className="ag-tvnav next" aria-label={zh ? '下一帧' : 'Next'} disabled={idx >= frames.length - 1} onClick={() => go(idx + 1)}>›</button>
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{frame.caption || (zh ? `第 #${frame.seq} 条动态截图` : `Frame at #${frame.seq}`)}</p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(241,243,244,0.66)' }}>
          @{frame.agent} · #{frame.seq}{totalTasks > 0 ? (zh ? ` · 共跟踪 ${totalTasks} 项任务` : ` · ${totalTasks} tasks tracked`) : ''}
        </p>
      </div>
      <div className="ag-tvstrip" role="listbox" aria-label="Frames">
        {frames.map((f, k) => (
          <button
            key={`${f.seq}-${k}`}
            type="button"
            role="option"
            aria-selected={k === idx}
            className={`ag-tvth ${k === idx ? 'on' : ''}`}
            onClick={() => go(k)}
          >
            <img src={swarmClientStore.frameUrl(swarmId, f.path)} alt={f.caption} loading="lazy" />
            <span>{k + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function OnboardingView({ snapshot }: { snapshot: SwarmSnapshotPayload }): JSX.Element {
  const locale = useUiLocale()
  const zh = locale === 'zh-CN'
  const realWorkers = Object.values(snapshot.members)
    .filter((m) => m.role !== 'coordinator' && !m.killed)
    .map((m) => m.name)
    .slice(0, 3)
  const ws = [...realWorkers, 'worker-a', 'worker-b', 'worker-c'].slice(0, 3)
  const Y = [30, 78, 126]

  return (
    <section className="ag-onb" data-testid="swarm-onboarding">
      <div className="ag-onb-stage" aria-hidden="true">
        <svg className="ag-onb-paths" viewBox="0 0 320 156" width="320" height="156">
          <g className="ag-onb-lines">
            {Y.map((y, i) => (
              <path key={i} id={`ag-onb-p${i}`} d={`M84 78 C150 78 160 ${y} 226 ${y}`} />
            ))}
          </g>
          {ws.map((n, i) => (
            <g key={n}>
              <circle r="3" fill={getBeeColor('coordinator', 'coordinator')} opacity="0">
                <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                  <mpath href={`#ag-onb-p${i}`} />
                </animateMotion>
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
              </circle>
              <circle r="3" fill={getBeeColor(n)} opacity="0">
                <animateMotion dur="2.4s" begin={`${i * 0.8 + 1.2}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                  <mpath href={`#ag-onb-p${i}`} />
                </animateMotion>
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="2.4s" begin={`${i * 0.8 + 1.2}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>
        <span className="ag-onb-bee" style={{ left: 24, top: 56, background: getBeeTileBg('coordinator', 'coordinator') }}>
          <PixelBee name="coordinator" role="coordinator" state="working" size={2} />
        </span>
        {ws.map((n, i) => (
          <span
            key={n}
            className={`ag-onb-bee ag-onb-w s${i}`}
            style={{ left: 236, top: Y[i] - 22, background: getBeeTileBg(n) }}
          >
            <PixelBee name={n} state="working" size={2} />
          </span>
        ))}
      </div>
      <h2 className="ag-onb-h">{t('overview.onboardingTitle')}</h2>
      <ol className="ag-onb-steps">
        <li>
          <span className="ag-onb-i" style={{ background: getBeeTileBg('coordinator', 'coordinator') }}>
            <img src={getBeeDataUrl('coordinator', 'coordinator', 'landed')} alt="" width={22} height={18} />
          </span>
          <div>
            <b>{zh ? '一个目标' : 'One goal'}</b>
            <span>{zh ? '协调者将目标拆解为多个独立并行轨道。' : 'The coordinator splits it into parallel tracks.'}</span>
          </div>
        </li>
        <li>
          <span className="ag-onb-i" style={{ background: getBeeTileBg(ws[0]) }}>
            <img src={getBeeDataUrl(ws[0], 'worker', 'landed')} alt="" width={22} height={18} />
          </span>
          <div>
            <b>{zh ? '多子代理并发' : 'Many workers'}</b>
            <span>{zh ? '每位成员认领专属范围并真正并行执行。' : 'Each owns a slice and runs concurrently.'}</span>
          </div>
        </li>
        <li>
          <span className="ag-onb-i" style={{ background: getBeeTileBg(ws[1]) }}>
            <img src={getBeeDataUrl(ws[1], 'worker', 'landed')} alt="" width={22} height={18} />
          </span>
          <div>
            <b>{zh ? '统一共享黑板' : 'One board'}</b>
            <span>{t('overview.onboardingDesc')}</span>
          </div>
        </li>
      </ol>
      <p className="ag-onb-wait">
        <span className="ag-shimmer" style={{ animationDelay: shimmerDelay() }}>
          {zh ? '正在等待首条黑板动态…' : 'Waiting for the first update'}
        </span>
      </p>
    </section>
  )
}

function ProgressReelCard({
  frames,
  swarmId,
  totalTasks,
  doneTasks,
}: {
  frames: ScreenshotFrame[]
  swarmId: string
  totalTasks: number
  doneTasks: number
}): JSX.Element | null {
  const [index, setIndex] = useState<number>(() => Math.max(0, frames.length - 1))
  const [compare, setCompare] = useState(false)
  const [swipe, setSwipe] = useState(50)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setIndex((prev) => Math.min(Math.max(0, prev), Math.max(0, frames.length - 1)))
  }, [frames.length])

  const locale = useUiLocale()
  const zh = locale === 'zh-CN'
  if (frames.length === 0) return null
  const clampedIdx = Math.min(index, frames.length - 1)
  const cur = frames[clampedIdx]
  const latest = frames[frames.length - 1]
  const curSrc = swarmClientStore.frameUrl(swarmId, cur.path)
  const latestSrc = swarmClientStore.frameUrl(swarmId, latest.path)
  const canCompare = frames.length >= 2

  return (
    <>
      <section className="ag-o2-reel" data-testid="swarm-progress-reel">
        <div className="ag-o2-rh">
          <span className="ag-o2-glbl">{t('overview.reel')}</span>
          <span className="ag-o2-rwhen">{formatFrameTime(cur)}</span>
          {canCompare && (
            <button
              type="button"
              className="ag-btn sm"
              aria-pressed={compare}
              onClick={() => setCompare((c) => !c)}
            >
              {compare ? t('overview.exitCompare') : t('overview.compare')}
            </button>
          )}
        </div>

        <div className="ag-o2-rstage">
          {compare && canCompare && <img src={latestSrc} alt={zh ? '最新截图' : 'Latest frame'} />}
          <img
            src={curSrc}
            alt={cur.caption || `#${cur.seq}`}
            style={{
              clipPath: compare && canCompare ? `inset(0 ${100 - swipe}% 0 0)` : 'none',
              cursor: compare ? 'ew-resize' : 'zoom-in',
            }}
            onClick={() => { if (!compare) setLightboxOpen(true) }}
          />
          {compare && canCompare && (
            <>
              <i className="ag-o2-rline" style={{ left: `${swipe}%` }} aria-hidden="true" />
              <input
                className="ag-o2-rswipe"
                type="range"
                min={0}
                max={100}
                value={swipe}
                aria-label={zh ? '拖动对比历史与当前' : 'Compare then and now'}
                onChange={(e) => setSwipe(Number(e.target.value))}
              />
            </>
          )}
          <span className="ag-o2-rtag">
            {clampedIdx === frames.length - 1 ? (zh ? '当前' : 'Now') : `${clampedIdx + 1} / ${frames.length}`}
          </span>
          <button
            type="button"
            className="ag-o2-rexp"
            aria-label={zh ? '全屏查看时间轴' : 'Open full timeline'}
            title={zh ? '全屏查看时间轴' : 'Open full timeline'}
            onClick={() => setLightboxOpen(true)}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <p className="ag-o2-rcap">{cur.caption || (zh ? `@${cur.agent} 汇报 (#${cur.seq})` : `Update by @${cur.agent} (#${cur.seq})`)}</p>
        <p className="ag-o2-rmeta">
          @{cur.agent} · #{cur.seq}{totalTasks > 0 ? ` · ${t('overview.tasksDone', { done: doneTasks, total: totalTasks })}` : ''}
        </p>

        {frames.length > 1 && (
          <div className="ag-o2-rtrack">
            {frames.map((f, k) => (
              <i
                key={`${f.seq}-${k}`}
                style={{ left: `${(k / (frames.length - 1)) * 100}%` }}
                aria-hidden="true"
              />
            ))}
            <input
              className="ag-o2-rscrub"
              type="range"
              min={0}
              max={frames.length - 1}
              step={1}
              value={clampedIdx}
              aria-label="Scrub through progress"
              onChange={(e) => setIndex(Number(e.target.value))}
            />
          </div>
        )}
      </section>

      {lightboxOpen && (
        <ReelLightbox
          frames={frames}
          swarmId={swarmId}
          initialIndex={clampedIdx}
          totalTasks={totalTasks}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={(next) => setIndex(next)}
        />
      )}
    </>
  )
}

function threadStatusLabel(th: ThreadView, zh: boolean): string {
  if (th.state === 'waiting') {
    const waiters = new Set<string>()
    for (const task of th.tasks) {
      for (const w of task.waiting_on ?? []) waiters.add(w)
    }
    if (waiters.size === 1) return t('members.waitingOn', { target: [...waiters][0] })
    if (waiters.size > 1) return zh ? `等待 ${waiters.size} 位成员` : `Waiting on ${waiters.size}`
    return t('members.state.waiting')
  }
  if (zh) {
    const map: Record<ThreadPriorityState, string> = {
      needs: '需要关注',
      waiting: '等待中',
      stuck: '疑似卡住',
      running: '推进中',
      queued: '待启动',
      done: '已完成',
    }
    return map[th.state]
  }
  return THREAD_LABEL[th.state]
}

export function OverviewTab({ snapshot, onJumpToSeq, onSwitchTab }: OverviewTabProps): JSX.Element {
  const locale = useUiLocale()
  const zh = locale === 'zh-CN'
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [doneOpen, setDoneOpen] = useState(false)
  const [showAllRun, setShowAllRun] = useState(false)
  const [showAllDone, setShowAllDone] = useState(false)
  const [openThreads, setOpenThreads] = useState<Record<string, boolean>>({})

  const membersList = useMemo(() => Object.values(snapshot.members), [snapshot.members])
  const coordinator = useMemo<MemberRecord | undefined>(
    () => snapshot.members.coordinator ?? membersList.find((m) => m.role === 'coordinator'),
    [snapshot.members, membersList],
  )
  const crew = useMemo(() => {
    const rank = (m: MemberRecord): number => (m.failure ? 0 : m.state === 'working' ? 1 : m.waiting_on?.length ? 2 : 3)
    return membersList
      .filter((m) => m.name !== (coordinator?.name ?? 'coordinator') && !m.killed)
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
  }, [membersList, coordinator])

  const activeFilter = selectedWorker && snapshot.members[selectedWorker] && !snapshot.members[selectedWorker].killed
    ? selectedWorker
    : null

  const hasWorkerPosted = useMemo(
    () => snapshot.messages.some((m) => m.agent !== (coordinator?.name ?? 'coordinator') && m.kind !== 'control'),
    [snapshot.messages, coordinator],
  )
  const isOnboarding = !hasWorkerPosted && snapshot.threads.length === 0 && !snapshot.plan && snapshot.messages.length <= 1

  const filteredThreads = useMemo(() => {
    const base = snapshot.threads
      .map((t) => {
        if (!activeFilter) return t
        const tasks = t.tasks.filter((task) => task.name === activeFilter)
        if (tasks.length === 0) return null
        const done = tasks.filter((x) => x.done).length
        return { ...t, tasks, progress: { done, total: tasks.length } }
      })
      .filter((t): t is ThreadView => t !== null)
    return base.sort((a, b) => THREAD_ORDER[a.state] - THREAD_ORDER[b.state])
  }, [snapshot.threads, activeFilter])

  const taskSummary = useMemo(() => {
    const running: Array<{ id: string; label: string; owner: string; blocked: boolean; waitingOn?: string[]; activity?: string; failure?: string }> = []
    const done: Array<{ id: string; label: string; owner: string }> = []
    const queued: Array<{ id: string; label: string; owner: string }> = []
    const seen = new Set<string>()
    for (const t of filteredThreads) {
      for (const task of t.tasks) {
        const key = `${t.id}:${task.name}:${task.label}`
        if (seen.has(key)) continue
        seen.add(key)
        if (task.done) {
          done.push({ id: key, label: task.label, owner: task.name })
        } else if (task.state === 'working' || (task.waiting_on && task.waiting_on.length > 0) || task.failure) {
          const m = snapshot.members[task.name]
          running.push({
            id: key,
            label: task.label,
            owner: task.name,
            blocked: Boolean(task.waiting_on?.length || task.failure),
            waitingOn: task.waiting_on,
            activity: task.activity ?? m?.activity,
            failure: task.failure ?? m?.failure?.message,
          })
        } else {
          queued.push({ id: key, label: task.label, owner: task.name })
        }
      }
    }
    if (seen.size === 0) {
      for (const m of crew) {
        if (activeFilter && m.name !== activeFilter) continue
        if (m.state === 'working' || m.waiting_on?.length || m.failure) {
          running.push({
            id: m.name,
            label: m.task_hint || `@${m.name}`,
            owner: m.name,
            blocked: Boolean(m.waiting_on?.length || m.failure),
            waitingOn: m.waiting_on,
            activity: m.activity,
            failure: m.failure?.message,
          })
        }
      }
    }
    running.sort((a, b) => (a.blocked ? 0 : 1) - (b.blocked ? 0 : 1))
    const tot = {
      done: done.length,
      running: running.filter((r) => !r.blocked).length,
      blocked: running.filter((r) => r.blocked).length,
      queued: queued.length,
    }
    return { running, done, queued, tot }
  }, [filteredThreads, snapshot.members, crew, activeFilter])

  const teamSection = useMemo(() => {
    const MAXT = 5
    let shown = crew.length > MAXT + 1 ? crew.slice(0, MAXT) : crew
    if (activeFilter && !shown.some((m) => m.name === activeFilter)) {
      const sel = crew.find((m) => m.name === activeFilter)
      if (sel) shown = [...shown.slice(0, MAXT - 1), sel]
    }
    const extra = crew.length - shown.length
    const trio = crew.slice(0, 3)

    return (
      <section className="ag-o2-team">
        <h3 className="ag-o2-h">
          <span>{t('overview.team')}</span>
          {activeFilter && (
            <button type="button" className="ag-ghost-btn" onClick={() => setSelectedWorker(null)}>
              {t('overview.filterBy', { name: activeFilter })} · {t('overview.clearFilter')}
            </button>
          )}
        </h3>
        <div className="ag-o2-lead">
          <span className="ag-o2-tile lg" style={{ background: getBeeTileBg('coordinator', 'coordinator') }}>
            <PixelBee
              name="coordinator"
              role="coordinator"
              state={coordinator?.state ?? 'waiting'}
              size={3}
            />
          </span>
          <div className="ag-o2-lb">
            <b>{t('members.coordinator')}</b>
            {coordinator?.activity && coordinator.state === 'working' ? (
              <p className="ag-shimmer" style={{ animationDelay: shimmerDelay() }}>{coordinator.activity}</p>
            ) : (
              <p>
                {coordinator?.task_hint ||
                  snapshot.plan?.goal.line ||
                  (zh ? `${crew.length} 位活跃成员` : `${crew.length} active team member${crew.length === 1 ? '' : 's'}`)}
              </p>
            )}
          </div>
        </div>

        {crew.length > 0 && (
          <div className="ag-o2-crew" role="group" aria-label={zh ? '按成员筛选' : 'Filter by worker'}>
            <button
              type="button"
              className={`ag-o2-m ${!activeFilter ? 'on' : ''}`}
              aria-pressed={!activeFilter}
              title={t('overview.clearFilter')}
              onClick={() => setSelectedWorker(null)}
            >
              <span className="ag-o2-tile sm all">
                <span className="ag-o2-swarm" aria-hidden="true">
                  {trio.map((m, i) => (
                    <span key={m.name} className={`ag-o2-sb s${i}`}>
                      <PixelBee name={m.name} role={m.role} state={m.state === 'working' ? 'working' : 'landed'} size={1} />
                    </span>
                  ))}
                </span>
              </span>
              <span>{t('common.all')}</span>
            </button>

            {shown.map((m) => {
              const dotCls = m.failure ? 'error' : m.state === 'working' ? 'working' : m.waiting_on?.length ? 'waiting' : ''
              return (
                <button
                  key={m.name}
                  type="button"
                  className={`ag-o2-m ${activeFilter === m.name ? 'on' : ''}`}
                  aria-pressed={activeFilter === m.name}
                  title={`@${m.name}${m.task_hint ? `: ${m.task_hint}` : ''}`}
                  onClick={() => setSelectedWorker((prev) => (prev === m.name ? null : m.name))}
                >
                  <span className="ag-o2-tile sm" style={{ background: getBeeTileBg(m.name, m.role) }}>
                    <PixelBee name={m.name} role={m.role} state={m.state} size={2} />
                  </span>
                  {dotCls && <i className={`ag-o2-st ${dotCls}`} aria-hidden="true" />}
                  <span>@{m.name}</span>
                </button>
              )
            })}

            {extra > 0 && (
              <button
                type="button"
                className="ag-o2-m"
                title={zh ? `查看全部 ${crew.length} 位成员` : `View all ${crew.length} members`}
                onClick={() => onSwitchTab('members')}
              >
                <span className="ag-o2-tile sm plus">+{extra}</span>
                <span>{zh ? '更多' : 'More'}</span>
              </button>
            )}
          </div>
        )}
      </section>
    )
  }, [crew, activeFilter, coordinator, snapshot.plan, onSwitchTab, zh])

  if (isOnboarding) {
    return (
      <div className="ag-o2">
        <OnboardingView snapshot={snapshot} />
        {teamSection}
      </div>
    )
  }

  const goalTitle = snapshot.plan?.goal.title || snapshot.title || 'Swarm Goal'
  const goalLine = snapshot.plan?.goal.line || ''
  const visibleRunning = showAllRun ? taskSummary.running : taskSummary.running.slice(0, 8)
  const visibleDone = showAllDone ? taskSummary.done : taskSummary.done.slice(0, 8)
  const totalTasks = taskSummary.tot.done + taskSummary.tot.running + taskSummary.tot.blocked + taskSummary.tot.queued
  const openThreadsCount = filteredThreads.filter((t) => t.state !== 'done').length

  return (
    <div className="ag-o2">
      {snapshot.systemAttention.length > 0 && (
        <div className="ag-ov-system" data-testid="swarm-attention-list">
          {snapshot.systemAttention.map((item) => (
            <div
              key={item.id}
              className={`ag-ov-sys ${item.kind === 'error' || item.kind === 'quota' ? 'error' : ''}`}
            >
              <span className="ag-ov-sys-dot" aria-hidden="true" />
              <div className="ag-ov-sys-body">
                <div className="ag-ov-sys-title">{item.title}</div>
                <div className="ag-ov-sys-detail">{item.detail}</div>
              </div>
              {item.seq ? (
                <button type="button" className="ag-o2-sttag" onClick={() => onJumpToSeq(item.seq!)}>
                  #{item.seq}
                </button>
              ) : (
                <button type="button" className="ag-ghost-btn" onClick={() => onSwitchTab('members')}>
                  @{item.member}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {snapshot.stallBanner && (
        <section className="ag-o2-stall" data-testid="swarm-stall-banner">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ag-o2-sttop">
              <span className="ag-o2-stdot" aria-hidden="true" />
              <b>{t('overview.stallTitle')}</b>
              <button
                type="button"
                className="ag-o2-sttag"
                title={zh ? `跳转到黑板 #${snapshot.stallBanner.seq}` : `Go to #${snapshot.stallBanner.seq} on the Board`}
                onClick={() => onJumpToSeq(snapshot.stallBanner!.seq)}
              >
                @{snapshot.stallBanner.agent} #{snapshot.stallBanner.seq}
              </button>
            </div>
            <p className="ag-o2-sttxt">{snapshot.stallBanner.text}</p>
          </div>
        </section>
      )}

      <section className="ag-o2-card">
        <div className="ag-o2-glbl">{t('overview.goal')}</div>
        <b className="ag-o2-goal-title">{goalTitle}</b>
        {goalLine && <p className="ag-o2-goal-line">{goalLine}</p>}
      </section>

      {taskSummary.running.length > 0 && (
        <section className="ag-o2-card" data-testid="swarm-running-card">
          <div className="ag-o2-runh">
            <span className="ag-o2-rundot" aria-hidden="true" />
            <b>{t('overview.running')}</b>
            <em>{taskSummary.running.length}</em>
          </div>
          <ul className="ag-o2-runlist">
            {visibleRunning.map((item) => {
              const owner = snapshot.members[item.owner]
              const stCls = item.blocked ? 'blocked' : 'running'
              return (
                <li key={item.id} className="ag-o2-runrow">
                  <span className={`ag-o2-ti ${stCls}`} aria-label={stCls} />
                  <div className="ag-o2-runmain">
                    <div className="ag-o2-runtop">
                      <b className="ag-o2-runt">{item.label}</b>
                      <span className="ag-o2-wchips">
                        <span className="ag-o2-wchip" title={`@${item.owner}`}>
                          <PixelBee
                            name={item.owner}
                            role={owner?.role}
                            state={owner?.state === 'working' ? 'working' : 'landed'}
                            size={1}
                          />
                          <span>{item.owner}</span>
                        </span>
                      </span>
                    </div>
                    {item.activity && !item.blocked ? (
                      <p className="ag-o2-runnote" data-testid="swarm-running-activity" title={item.activity}>
                        <span className="ag-shimmer" style={{ animationDelay: shimmerDelay() }}>{item.activity}</span>
                      </p>
                    ) : item.failure ? (
                      <p className="ag-o2-runnote" style={{ color: 'var(--ag-error)' }}>{item.failure}</p>
                    ) : item.waitingOn && item.waitingOn.length > 0 ? (
                      <p className="ag-o2-runnote" style={{ color: 'var(--ag-warning)' }}>
                        {t('members.waitingOn', { target: item.waitingOn.join(', @') })}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
          {taskSummary.running.length > visibleRunning.length && (
            <button type="button" className="ag-o2-more" onClick={() => setShowAllRun((v) => !v)}>
              {t('common.showMore')} (+{taskSummary.running.length - visibleRunning.length})
            </button>
          )}
        </section>
      )}

      <section className={`ag-o2-prog ${doneOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="ag-o2-progh"
          aria-expanded={doneOpen}
          onClick={() => setDoneOpen((v) => !v)}
        >
          <RingProgress
            done={taskSummary.tot.done}
            running={taskSummary.tot.running}
            blocked={taskSummary.tot.blocked}
            queued={taskSummary.tot.queued}
          />
          <span className="ag-o2-progt">
            <b>{t('overview.tasksDone', { done: taskSummary.tot.done, total: totalTasks || snapshot.stats.totalTasks })}</b>
          </span>
          <span className="ag-o2-progr">
            {taskSummary.tot.blocked > 0 && (
              <span className="ag-o2-pchip warn"><i aria-hidden="true" />{t('overview.waitingCount', { count: taskSummary.tot.blocked })}</span>
            )}
            {snapshot.stats.stuckCount > 0 && (
              <span className="ag-o2-pchip bad"><i aria-hidden="true" />{t('overview.stuckCount', { count: snapshot.stats.stuckCount })}</span>
            )}
            {openThreadsCount > 0 ? (
              <span className="ag-o2-pchip">{t('overview.threadsOpen', { count: openThreadsCount })}</span>
            ) : taskSummary.tot.running > 0 ? (
              <span className="ag-o2-pchip info"><i aria-hidden="true" />{t('header.working', { count: taskSummary.tot.running })}</span>
            ) : null}
            <span className="ag-o2-chev" aria-hidden="true" />
          </span>
        </button>

        {doneOpen && (
          <div className="ag-o2-progb">
            {visibleDone.length > 0 ? (
              <>
                <div className="ag-o2-qhdr">{t('overview.doneList')} · {taskSummary.done.length}</div>
                <ul className="ag-o2-donelist">
                  {visibleDone.map((item) => {
                    const m = snapshot.members[item.owner]
                    return (
                      <li key={item.id}>
                        <span className="ag-o2-ti done" aria-label={t('overview.doneList')}>✓</span>
                        <div className="ag-o2-donem"><b>{item.label}</b></div>
                        <span className="ag-o2-wchip">
                          <PixelBee name={item.owner} role={m?.role} state="landed" size={1} />
                          <span>{item.owner}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
                {taskSummary.done.length > visibleDone.length && (
                  <button type="button" className="ag-o2-more" onClick={() => setShowAllDone((v) => !v)}>
                    {t('common.showMore')} (+{taskSummary.done.length - visibleDone.length})
                  </button>
                )}
              </>
            ) : (
              <p style={{ margin: '6px 0 2px', fontSize: 12.5, color: 'var(--ag-fg-muted)' }}>
                {zh ? '暂无已完成的任务。' : 'No tasks completed yet.'}
              </p>
            )}

            {taskSummary.queued.length > 0 && (
              <div>
                <div className="ag-o2-qhdr">{t('overview.upNext')} · {taskSummary.queued.length}</div>
                <ul className="ag-o2-donelist">
                  {taskSummary.queued.slice(0, 6).map((item) => {
                    const m = snapshot.members[item.owner]
                    return (
                      <li key={item.id}>
                        <span className="ag-o2-ti queued" aria-label={t('overview.upNext')} />
                        <div className="ag-o2-donem"><b>{item.label}</b></div>
                        <span className="ag-o2-wchip">
                          <PixelBee name={item.owner} role={m?.role} state="landed" size={1} />
                          <span>{item.owner}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <ProgressReelCard
        frames={snapshot.frames}
        swarmId={snapshot.swarm_id}
        totalTasks={totalTasks || snapshot.stats.totalTasks}
        doneTasks={taskSummary.tot.done || snapshot.stats.doneTasks}
      />

      {filteredThreads.length > 0 && (
        <section className="ag-o2-threads">
          <h3 className="ag-o2-h">{t('overview.threads')} <em>{filteredThreads.length}</em></h3>
          {filteredThreads.map((th) => {
            const defaultOpen = th.state === 'needs' || th.state === 'waiting' || th.state === 'stuck'
            const isOpen = th.tasks.length > 0 && (openThreads[th.id] ?? defaultOpen)
            const doneN = th.tasks.filter((x) => x.done).length
            const runN = th.tasks.filter((x) => !x.done && x.state === 'working' && !x.waiting_on?.length && !x.failure).length
            const blkN = th.tasks.filter((x) => !x.done && (Boolean(x.waiting_on?.length) || Boolean(x.failure))).length
            const queN = Math.max(0, th.tasks.length - doneN - runN - blkN)
            const statusLbl = threadStatusLabel(th, zh)

            return (
              <section key={th.id} className={`ag-o2-th ${th.state} ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="ag-o2-thh"
                  aria-expanded={isOpen}
                  disabled={th.tasks.length === 0}
                  onClick={() => setOpenThreads((prev) => ({ ...prev, [th.id]: !isOpen }))}
                >
                  <span className={`ag-o2-thd ${th.state}`} aria-hidden="true" />
                  <span className="ag-o2-tht">
                    <b>{th.title}</b>
                    {statusLbl !== th.title && <em>{statusLbl}</em>}
                  </span>
                  <span className="ag-o2-thc">
                    {th.tasks.length > 0 && (
                      <>
                        <span className="ag-o2-mbar" aria-hidden="true">
                          {doneN > 0 && <i className="done" style={{ flex: doneN }} />}
                          {runN > 0 && <i className="running" style={{ flex: runN }} />}
                          {blkN > 0 && <i className="blocked" style={{ flex: blkN }} />}
                          {queN > 0 && <i className="queued" style={{ flex: queN }} />}
                        </span>
                        <span>{doneN}/{th.tasks.length}</span>
                      </>
                    )}
                  </span>
                  {th.tasks.length > 0 && <span className="ag-o2-chev" aria-hidden="true" />}
                </button>
                {th.goal && <p className="ag-o2-thg">{th.goal}</p>}
                {th.now && (
                  <p className="ag-o2-thn">
                    {th.state !== 'done' && <span>{zh ? '当前' : 'Now'}</span>}
                    {th.now}
                  </p>
                )}
                {isOpen && (
                  <ul className="ag-o2-tasks">
                    {th.tasks.map((task, idx) => {
                      const st = task.done
                        ? 'done'
                        : task.failure || task.waiting_on?.length
                          ? 'blocked'
                          : task.state === 'working'
                            ? 'running'
                            : 'queued'
                      const m = snapshot.members[task.name]
                      return (
                        <li key={`${task.name}-${idx}`} className={st}>
                          <span className={`ag-o2-ti ${st}`} aria-label={st}>{st === 'done' ? '✓' : ''}</span>
                          <span className="ag-o2-tt">
                            {task.label}
                            {task.waiting_on && task.waiting_on.length > 0 && (
                              <span className="ag-o2-tw">{t('members.waitingOn', { target: task.waiting_on.join(', @') })}</span>
                            )}
                          </span>
                          <span className="ag-o2-wchip">
                            <PixelBee name={task.name} role={m?.role} state={m?.state === 'working' ? 'working' : 'landed'} size={1} />
                            <span>{task.name}</span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          })}
        </section>
      )}

      {teamSection}
    </div>
  )
}
