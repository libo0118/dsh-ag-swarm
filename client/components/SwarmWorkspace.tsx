import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UiActionRequest } from '../../src/shared/protocol'
import { t, toggleUiLocale, useUiLocale } from '../i18n'
import { useSwarmStore } from '../store'
import { OverviewTab } from './OverviewTab'
import { BoardTab, type JumpTarget } from './BoardTab'
import { MembersTab } from './MembersTab'
import { SubagentsTab } from './SubagentsTab'
import { GraphTab } from './GraphTab'
import { RawTab } from './RawTab'
import { RoleModelPresetsCard } from './SettingsSection'

export type WorkspaceTab = 'overview' | 'feed' | 'subagents' | 'members' | 'graph' | 'raw'

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
  const locale = useUiLocale()
  const zh = locale === 'zh-CN'
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
    listModels,
  } = useSwarmStore(props.sessionId)

  const [tab, setTab] = useState<WorkspaceTab>(props.initialTab ?? 'overview')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => detectHostTheme())
  const [jumpTarget, setJumpTarget] = useState<JumpTarget | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [loadingEarlier, setLoadingEarlier] = useState(false)
  const [showRoleModels, setShowRoleModels] = useState(false)
  const [selectedSubagent, setSelectedSubagent] = useState<string | null>(null)

  const openSubagent = useCallback((memberName: string) => {
    setSelectedSubagent(memberName)
    setTab('subagents')
  }, [])

  useEffect(() => {
    if (!showRoleModels) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setShowRoleModels(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showRoleModels])

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
      if (req.action === 'post_message') showToast(zh ? '已发布到黑板' : 'Posted to board')
      else if (req.action === 'switch_model') showToast(zh ? `已切换 @${req.member} 模型` : `Switched @${req.member} model`)
      else if (req.action === 'kill_worker') showToast(zh ? `已终止 @${req.member}` : `Killed @${req.member}`)
      else if (req.action === 'nudge_worker') showToast(zh ? `已唤醒 @${req.member}` : `Nudged @${req.member}`)
      else if (req.action === 'stop_worker') showToast(zh ? `已停止 @${req.member}（可 @唤醒继续）` : `Stopped @${req.member}`)
      else if (req.action === 'stop_workers') showToast(zh ? '已暂停全部运行中的子代理' : 'Stopped all working subagents')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setActionError(msg)
      throw err
    }
  }, [postAction, showToast, zh])

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
    if (!snapshot) return { members: 0, workers: 0, workingWorkers: 0, attention: 0 }
    const all = Object.values(snapshot.members)
    const liveMembers = all.filter((m) => !m.killed).length
    const workers = all.filter((m) => m.role !== 'coordinator' && m.role !== 'monitor' && !m.killed).length
    const workingWorkers = all.filter((m) => m.role !== 'coordinator' && m.role !== 'monitor' && !m.killed && m.state === 'working').length
    const attention = snapshot.systemAttention.length + (snapshot.stallBanner ? 1 : 0)
    return { members: liveMembers, workers, workingWorkers, attention }
  }, [snapshot])

  const liveClass = sync === 'live' ? '' : error ? 'error' : 'stale'
  const liveLabel =
    sync === 'live'
      ? t('common.live')
      : sync === 'reconnecting'
        ? t('common.reconnecting')
        : sync === 'connecting'
          ? (zh ? '连接中' : 'Connecting')
          : t('common.offline')

  return (
    <div className="ag-root" data-testid="swarm-board" data-theme={theme}>
      <header className="ag-header">
        <div className="ag-header-row">
          <h1 className="ag-swarm-title" title={snapshot ? `${snapshot.title}\n${snapshot.swarm_id}` : t('slot.swarm')}>
            {snapshot?.title || t('slot.swarm')}
          </h1>

          {swarms.length > 1 && (
            <select
              className="ag-swarm-select"
              aria-label={zh ? '切换蜂群' : 'Select swarm'}
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
            title={t('common.refresh')}
            aria-label={t('common.refresh')}
            onClick={() => {
              void refresh(true)
              void listModels(true)
            }}
          >
            <svg className="ag-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M13 8a5 5 0 1 1-1.3-3.35M13 3v2.5h-2.5" />
            </svg>
          </button>

          <button
            type="button"
            className="ag-ghost-btn"
            data-testid="swarm-open-role-models"
            title={zh ? '按角色定制子代理模型' : 'Configure per-role worker models'}
            onClick={() => {
              void listModels(true)
              setShowRoleModels(true)
            }}
          >
            {zh ? '角色模型' : 'Role Models'}
          </button>

          {snapshot && counts.workingWorkers > 0 && (
            <button
              type="button"
              className="ag-ghost-btn"
              data-testid="swarm-stop-all-workers"
              title={zh ? '立即停止全部运行中的子代理' : 'Stop all working subagents'}
              onClick={() => {
                void handleAction({ action: 'stop_workers', swarmId: snapshot.swarm_id })
              }}
              style={{ color: 'var(--ag-error, #cb3d3d)' }}
            >
              {zh ? '停止全部' : 'Stop all'}
            </button>
          )}

          <button
            type="button"
            className="ag-ghost-btn"
            data-testid="swarm-locale-toggle"
            title={zh ? 'Switch UI to English' : '切换界面为简体中文'}
            aria-label={zh ? 'Switch UI to English' : '切换界面为简体中文'}
            onClick={() => { toggleUiLocale() }}
          >
            {zh ? 'EN' : '中文'}
          </button>

          <span className={`ag-live ${liveClass}`} title={error ?? (zh ? 'SSE 实时推送中' : 'Live SSE updates')}>
            <span className="ag-live-dot" aria-hidden="true" />
            <span>{liveLabel}</span>
          </span>
        </div>

        <nav className="ag-tabs" role="tablist" aria-label={zh ? '蜂群视图切换' : 'Swarm views'}>
          <button
            type="button"
            role="tab"
            className={`ag-tab ${tab === 'overview' ? 'active' : ''}`}
            aria-selected={tab === 'overview'}
            data-testid="swarm-tab-overview"
            onClick={() => setTab('overview')}
          >
            <span>{t('tab.overview')}</span>
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
            <span>{t('tab.board')}</span>
            {snapshot && snapshot.head > 0 && <span className="ag-tab-count">{snapshot.head}</span>}
          </button>
          <button
            type="button"
            role="tab"
            className={`ag-tab ${tab === 'subagents' ? 'active' : ''}`}
            aria-selected={tab === 'subagents'}
            data-testid="swarm-tab-subagents"
            onClick={() => setTab('subagents')}
          >
            <span>{t('tab.subagents')}</span>
            {counts.workers > 0 && <span className="ag-tab-count">{counts.workers}</span>}
          </button>
          <button
            type="button"
            role="tab"
            className={`ag-tab ${tab === 'members' ? 'active' : ''}`}
            aria-selected={tab === 'members'}
            data-testid="swarm-tab-members"
            onClick={() => setTab('members')}
          >
            <span>{t('tab.members')}</span>
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
            <span>{t('tab.graph')}</span>
          </button>
          <button
            type="button"
            role="tab"
            className={`ag-tab ${tab === 'raw' ? 'active' : ''}`}
            aria-selected={tab === 'raw'}
            data-testid="swarm-tab-raw"
            onClick={() => setTab('raw')}
          >
            <span>{t('tab.raw')}</span>
          </button>
        </nav>
      </header>

      <div className="ag-scroll">
        <div className="ag-main" style={tab === 'subagents' ? { maxWidth: 1120 } : undefined}>
          {actionError && (
            <div className="ag-ov-sys error" role="alert" style={{ marginBottom: 10 }}>
              <span className="ag-ov-sys-dot" aria-hidden="true" />
              <div className="ag-ov-sys-body">{actionError}</div>
              <button type="button" className="ag-ghost-btn" onClick={() => setActionError(null)}>{t('common.close')}</button>
            </div>
          )}

          {loading && !snapshot ? (
            <div className="ag-loading" aria-busy="true">
              <div className="ag-skel" style={{ width: '58%', height: 14 }} />
              <div className="ag-skel" style={{ width: '88%', height: 10, marginTop: 10 }} />
              <div className="ag-skel" style={{ width: '74%', height: 10, marginTop: 8 }} />
              <p className="ag-loading-caption">{t('common.loading')}</p>
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
                <h2 className="ag-empty-title">{t('common.emptyTitle')}</h2>
                <p className="ag-empty-body">{t('common.emptyDesc')}</p>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="ag-btn sm"
                    onClick={() => setShowRoleModels(true)}
                  >
                    {zh ? '按角色定制模型' : 'Configure Role Models'}
                  </button>
                </div>
                {swarms.length > 0 && (
                  <div className="ag-empty-swarms">
                    {swarms.slice(0, 5).map((s) => (
                      <button
                        key={s.swarm_id}
                        type="button"
                        className="ag-btn sm"
                        onClick={() => { void selectSwarm(s.swarm_id) }}
                      >
                        {zh ? '查看 ' : 'Open '}{s.title || s.swarm_id.slice(0, 8)} (#{s.head})
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
                  onOpenMembers={() => setTab('members')}
                  onSelectSubagent={openSubagent}
                />
              )}
              {tab === 'subagents' && (
                <SubagentsTab
                  snapshot={snapshot}
                  initialMember={selectedSubagent}
                  onAction={handleAction}
                  onJumpToSeq={handleJumpToSeq}
                />
              )}
              {tab === 'members' && (
                <MembersTab
                  snapshot={snapshot}
                  onJumpToSeq={handleJumpToSeq}
                  onAction={handleAction}
                  models={models}
                  onInspectSubagent={openSubagent}
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

      {showRoleModels && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zh ? '按角色定制模型' : 'Role Model Presets'}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRoleModels(false)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: 'min(720px, 100%)',
              maxHeight: '88vh',
              overflowY: 'auto',
              borderRadius: 12,
              background: 'var(--ag-bg, #f7f7f8)',
              padding: 14,
              boxShadow: '0 18px 48px rgba(0, 0, 0, 0.28)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 13 }}>{zh ? '按角色定制子代理模型' : 'Role Model Presets'}</strong>
              <button
                type="button"
                className="ag-ghost-btn"
                onClick={() => setShowRoleModels(false)}
              >
                {t('common.close')}
              </button>
            </div>
            <RoleModelPresetsCard />
          </div>
        </div>
      )}

      {toast && <div className="ag-toast" role="status">{toast}</div>}
    </div>
  )
}
