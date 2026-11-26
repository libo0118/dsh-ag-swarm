import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  MemberRecord,
  MemberTranscriptPayload,
  TranscriptStepView,
  UiActionRequest,
} from '../../src/shared/protocol'
import { PixelBee, getBeeTileBg } from '../bee-sprites'
import { t, useUiLocale } from '../i18n'
import { swarmClientStore, type CatalogModelOption } from '../store'

export interface MemberDrawerProps {
  swarmId: string
  member: MemberRecord | null
  models: CatalogModelOption[]
  onClose: () => void
  onJumpToSeq: (seq: number) => void
  onAction: (req: UiActionRequest) => Promise<void>
}

function stepBadgeColor(kind: TranscriptStepView['kind'], status?: TranscriptStepView['status']): string {
  if (status === 'error' || kind === 'error') return 'var(--ag-error, #cb3d3d)'
  if (status === 'running') return 'var(--ag-primary, #007acc)'
  if (kind === 'tool') return 'var(--ag-primary, #007acc)'
  if (kind === 'thinking') return 'var(--ag-warning, #bca136)'
  if (kind === 'model') return 'var(--ag-success, #63984f)'
  return 'var(--ag-fg-muted, #5d676f)'
}

export function MemberDrawer(props: MemberDrawerProps): JSX.Element | null {
  const { swarmId, member, models, onClose, onJumpToSeq, onAction } = props
  const locale = useUiLocale()
  const isZh = locale === 'zh-CN'
  const [transcript, setTranscript] = useState<MemberTranscriptPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [selectedModelKey, setSelectedModelKey] = useState('')
  const [selectedEffort, setSelectedEffort] = useState('')
  const [nudgeText, setNudgeText] = useState('')
  const [confirmKill, setConfirmKill] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const modelOptions = useMemo(() => {
    const map = new Map<string, CatalogModelOption>()
    for (const m of models) {
      map.set(`${m.provider}::${m.model}`, m)
    }
    if (member?.model) {
      const key = `${member.provider ?? ''}::${member.model}`
      if (!map.has(key)) {
        map.set(key, {
          provider: member.provider ?? '',
          model: member.model,
          label: member.model_display_name || member.model,
        })
      }
    }
    return [...map.entries()]
  }, [models, member?.model, member?.provider, member?.model_display_name])

  const loadTranscript = useCallback(async () => {
    if (!member) return
    setLoading(true)
    setTranscriptError(null)
    try {
      const data = await swarmClientStore.fetchMemberTranscript(swarmId, member.name)
      setTranscript(data)
    } catch (err) {
      setTranscriptError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [swarmId, member])

  useEffect(() => {
    if (!member) return
    setSelectedModelKey(`${member.provider ?? ''}::${member.model}`)
    setSelectedEffort(member.reasoning_effort ?? '')
    setConfirmKill(false)
    setActionFeedback(null)
    setNudgeText('')
    void swarmClientStore.listModels(true).catch(() => {})
    void loadTranscript()
  }, [member?.name, swarmId, loadTranscript])

  useEffect(() => {
    if (!member) return
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [member, onClose])

  if (!member) return null

  const isCoordinator = member.role === 'coordinator' || member.name === 'coordinator'
  const canSwitchModel = !member.killed && (member.state === 'waiting' || member.state === 'stopped')
  const selectedOpt = modelOptions.find(([k]) => k === selectedModelKey)?.[1]
  const efforts = selectedOpt?.efforts ?? []

  const runAction = async (label: string, req: UiActionRequest): Promise<void> => {
    setBusyAction(label)
    setActionFeedback(null)
    try {
      await onAction(req)
      setActionFeedback({ kind: 'ok', text: isZh ? `${label}已完成。` : `${label} succeeded.` })
      if (req.action === 'kill_worker') setConfirmKill(false)
      if (req.action === 'nudge_worker') setNudgeText('')
      void loadTranscript()
    } catch (err) {
      setActionFeedback({ kind: 'err', text: err instanceof Error ? err.message : String(err) })
    } finally {
      setBusyAction(null)
    }
  }

  const handleSwitchModel = (): void => {
    if (!selectedOpt) return
    void runAction(isZh ? '模型切换' : 'Model switch', {
      action: 'switch_model',
      swarmId,
      member: member.name,
      model: selectedOpt.model,
      ...(selectedOpt.provider ? { provider: selectedOpt.provider } : {}),
      ...(selectedEffort ? { reasoningEffort: selectedEffort } : {}),
    })
  }

  const handleNudge = (): void => {
    const trimmed = nudgeText.trim()
    void runAction(isZh ? '唤醒指令' : 'Nudge', {
      action: 'nudge_worker',
      swarmId,
      member: member.name,
      ...(trimmed ? { text: trimmed } : {}),
    })
  }

  const handleStop = (): void => {
    void runAction(isZh ? '停止子代理' : 'Stop worker', {
      action: 'stop_worker',
      swarmId,
      member: member.name,
    })
  }

  const handleKill = (): void => {
    void runAction(isZh ? '终止成员' : 'Kill worker', {
      action: 'kill_worker',
      swarmId,
      member: member.name,
    })
  }

  const steps = transcript?.steps ?? []
  const beeState = member.killed ? 'killed' : member.waiting_on?.length ? 'waiting_on' : member.state

  return (
    <div
      className="ag-drawer-backdrop"
      data-testid="swarm-member-drawer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0, 0, 0, 0.36)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <aside
        className="ag-drawer"
        role="dialog"
        aria-label={`Member @${member.name}`}
        style={{
          width: 'min(480px, 94vw)',
          height: '100%',
          background: 'var(--ag-bg, #f7f7f8)',
          color: 'var(--ag-fg, #1d1f21)',
          borderLeft: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
          boxShadow: '-8px 0 28px rgba(0, 0, 0, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          className="ag-drawer-head"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px',
            borderBottom: '1px solid var(--ag-line, rgba(128,128,128,0.14))',
            background: 'var(--ag-card, #ffffff)',
            flex: 'none',
          }}
        >
          <span
            style={{
              width: 50,
              height: 44,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              background: getBeeTileBg(member.name, member.role),
              boxShadow: 'inset 0 0 0 1px var(--ag-border, rgba(128,128,128,0.2))',
              flex: 'none',
            }}
          >
            <PixelBee name={member.name} role={member.role} state={beeState} size={2} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 15 }}>@{member.name}</strong>
              <span
                style={{
                  fontSize: 11,
                  padding: '1px 7px',
                  borderRadius: 999,
                  background: 'var(--ag-fill, rgba(128,128,128,0.1))',
                  color: 'var(--ag-fg-muted, #5d676f)',
                }}
              >
                {member.killed ? t('members.state.killed') : t(`members.state.${member.state}` as 'members.state.working')}
              </span>
              {member.last_post_seq ? (
                <button
                  type="button"
                  className="ag-ghost-btn"
                  onClick={() => {
                    onJumpToSeq(member.last_post_seq!)
                    onClose()
                  }}
                  style={{ height: 22, padding: '0 6px', fontFamily: 'var(--ag-mono, monospace)', fontSize: 11 }}
                  title={isZh ? `跳转到黑板 #${member.last_post_seq}` : `Jump to #${member.last_post_seq} on Board`}
                >
                  #{member.last_post_seq}
                </button>
              ) : null}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {member.model_display_name || member.model}
              {member.workspace_mode !== 'inherit' ? ` · ${member.workspace_mode}` : ''}
              {member.branch ? ` · ${member.branch}` : ''}
            </div>
          </div>
          <button
            type="button"
            className="ag-icon-btn"
            onClick={onClose}
            aria-label={t('common.close')}
            title={`${t('common.close')} (Esc)`}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {member.failure && (
            <div
              role="alert"
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                background: 'color-mix(in srgb, var(--ag-error, #cb3d3d) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--ag-error, #cb3d3d) 35%, transparent)',
                fontSize: 12,
              }}
            >
              <strong style={{ color: 'var(--ag-error, #cb3d3d)', textTransform: 'uppercase', fontSize: 11 }}>
                {member.failure.kind}
              </strong>
              <div style={{ marginTop: 2 }}>{member.failure.message}</div>
            </div>
          )}

          {actionFeedback && (
            <div
              role="status"
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                fontSize: 12,
                background: actionFeedback.kind === 'err'
                  ? 'color-mix(in srgb, var(--ag-error, #cb3d3d) 12%, transparent)'
                  : 'color-mix(in srgb, var(--ag-success, #63984f) 14%, transparent)',
                color: actionFeedback.kind === 'err' ? 'var(--ag-error, #cb3d3d)' : 'var(--ag-success, #63984f)',
              }}
            >
              {actionFeedback.text}
            </div>
          )}

          <section
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: 'var(--ag-card, #ffffff)',
              border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ag-fg-muted, #5d676f)' }}>
              {t('drawer.controls')}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)' }}>
                {t('drawer.switchModel')}
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <select
                  aria-label={t('drawer.switchBtn')}
                  value={selectedModelKey}
                  disabled={!canSwitchModel || busyAction !== null}
                  onChange={(e) => {
                    setSelectedModelKey(e.target.value)
                    setSelectedEffort('')
                  }}
                  style={{
                    flex: '1 1 180px',
                    height: 30,
                    padding: '0 8px',
                    borderRadius: 6,
                    border: '1px solid var(--ag-border, rgba(128,128,128,0.2))',
                    background: 'var(--ag-bg, #f7f7f8)',
                    fontSize: 12,
                  }}
                >
                  {modelOptions.map(([key, opt]) => (
                    <option key={key} value={key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {efforts.length > 0 && (
                  <select
                    aria-label={t('settings.effortDefault')}
                    value={selectedEffort}
                    disabled={!canSwitchModel || busyAction !== null}
                    onChange={(e) => setSelectedEffort(e.target.value)}
                    style={{
                      height: 30,
                      padding: '0 8px',
                      borderRadius: 6,
                      border: '1px solid var(--ag-border, rgba(128,128,128,0.2))',
                      background: 'var(--ag-bg, #f7f7f8)',
                      fontSize: 12,
                    }}
                  >
                    <option value="">
                      {selectedOpt?.defaultEffort
                        ? `${t('settings.effortDefault')} (${selectedOpt.defaultEffort})`
                        : t('settings.effortDefault')}
                    </option>
                    {efforts.map((ef) => (
                      <option key={ef.id} value={ef.id}>{ef.name}</option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  className="ag-btn primary sm"
                  disabled={!canSwitchModel || !selectedOpt || busyAction !== null}
                  onClick={handleSwitchModel}
                  style={{ height: 30 }}
                >
                  {busyAction === (isZh ? '模型切换' : 'Model switch') ? (isZh ? '切换中…' : 'Switching…') : t('drawer.switchBtn')}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)' }}>
                {t('drawer.nudge')}
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={nudgeText}
                  disabled={member.killed || busyAction !== null}
                  onChange={(e) => setNudgeText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !member.killed && busyAction === null) handleNudge()
                  }}
                  placeholder={t('drawer.nudgePlaceholder', { name: member.name })}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 30,
                    padding: '0 8px',
                    borderRadius: 6,
                    border: '1px solid var(--ag-border, rgba(128,128,128,0.2))',
                    background: 'var(--ag-bg, #f7f7f8)',
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  className="ag-btn sm"
                  disabled={member.killed || busyAction !== null}
                  onClick={handleNudge}
                  style={{ height: 30 }}
                >
                  {busyAction === (isZh ? '唤醒指令' : 'Nudge') ? (isZh ? '发送中…' : 'Sending…') : t('drawer.nudgeBtn')}
                </button>
              </div>
            </div>

            {!isCoordinator && !member.killed && (
              <div style={{ paddingTop: 6, borderTop: '1px solid var(--ag-line, rgba(128,128,128,0.14))' }}>
                {!confirmKill ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {member.state === 'working' && (
                      <button
                        type="button"
                        className="ag-btn sm"
                        data-testid="swarm-drawer-stop"
                        disabled={busyAction !== null}
                        onClick={handleStop}
                        style={{ color: 'var(--ag-error, #cb3d3d)' }}
                      >
                        {busyAction === (isZh ? '停止子代理' : 'Stop worker') ? t('subagents.stopping') : t('drawer.stop')}
                      </button>
                    )}
                    <button
                      type="button"
                      className="ag-btn danger sm"
                      disabled={busyAction !== null}
                      onClick={() => setConfirmKill(true)}
                    >
                      {t('drawer.kill')}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--ag-error, #cb3d3d)', fontWeight: 500 }}>
                      {t('drawer.killConfirm', { name: member.name })}
                    </span>
                    <button
                      type="button"
                      className="ag-btn danger sm"
                      disabled={busyAction !== null}
                      onClick={handleKill}
                    >
                      {busyAction === (isZh ? '终止成员' : 'Kill worker') ? (isZh ? '终止中…' : 'Killing…') : t('drawer.confirmKillBtn')}
                    </button>
                    <button
                      type="button"
                      className="ag-ghost-btn"
                      disabled={busyAction !== null}
                      onClick={() => setConfirmKill(false)}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ag-fg-muted, #5d676f)' }}>
                {t('drawer.transcript')} ({steps.length})
              </span>
              <button type="button" className="ag-ghost-btn" onClick={() => void loadTranscript()} disabled={loading}>
                {loading ? t('common.refreshing') : t('common.refresh')}
              </button>
            </div>
            {transcriptError && (
              <div style={{ fontSize: 12, color: 'var(--ag-error, #cb3d3d)' }}>
                {isZh ? `加载轨迹失败：${transcriptError}` : `Failed to load transcript: ${transcriptError}`}
              </div>
            )}
            {!loading && !transcriptError && steps.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)' }}>
                {t('drawer.noSteps')}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {steps.map((step) => (
                <div
                  key={`${step.index}-${step.kind}`}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'var(--ag-card, #ffffff)',
                    border: '1px solid var(--ag-border, rgba(128,128,128,0.16))',
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: 'var(--ag-fill, rgba(128,128,128,0.1))',
                        color: stepBadgeColor(step.kind, step.status),
                      }}
                    >
                      {step.kind}
                    </span>
                    <span style={{ fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {step.title}
                    </span>
                    {step.time && (
                      <span style={{ fontSize: 11, color: 'var(--ag-fg-faint, #9da5ab)', fontFamily: 'var(--ag-mono, monospace)' }}>
                        {step.time}
                      </span>
                    )}
                  </div>
                  {step.detail && (
                    <pre
                      style={{
                        margin: '6px 0 0',
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: 'var(--ag-fill, rgba(128,128,128,0.06))',
                        fontSize: 11,
                        maxHeight: 160,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {step.detail}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
