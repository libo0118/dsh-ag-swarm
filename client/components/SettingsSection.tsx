import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BUILTIN_MODEL_ROLES,
  type ConfigPayload,
  type RoleModelMap,
  type RoleModelPreset,
  type SwarmSummary,
} from '../../src/shared/protocol'
import { PixelBee } from '../bee-sprites'
import { t, toggleUiLocale, useUiLocale, type I18nKey } from '../i18n'
import { swarmClientStore, type CatalogModelOption, type SwarmClientState } from '../store'

const DEFAULT_CONFIG: ConfigPayload = {
  storageDir: '~/.dsh/storages/ag-swarm',
  maxWorkers: 12,
  maxDepth: 2,
  stallCheckIntervalMs: 180000,
  enableStallMonitor: true,
  enableWorktrees: true,
  registerSwarmCommandAlias: true,
  waitToolName: 'swarm_wait',
  primaryCommand: 'swarm',
  modelPresets: {},
}

const ROLE_NAME_RE = /^[a-z0-9][a-z0-9_-]{0,23}$/
const BUILTIN_SET = new Set<string>(BUILTIN_MODEL_ROLES)

function formatUpdated(iso: string, isZh: boolean): string {
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return iso || ''
  const diffSec = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (diffSec < 60) return isZh ? `${diffSec}秒前` : `${diffSec}s ago`
  if (diffSec < 3600) return isZh ? `${Math.floor(diffSec / 60)}分钟前` : `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return isZh ? `${Math.floor(diffSec / 3600)}小时前` : `${Math.floor(diffSec / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

function roleDisplayLabel(role: string): string {
  if (BUILTIN_SET.has(role)) {
    return t(`role.${role}` as I18nKey)
  }
  return role
}

function catalogKey(provider: string | undefined, model: string): string {
  return `${provider ?? ''}::${model}`
}

export function RoleModelPresetsCard(): JSX.Element {
  const locale = useUiLocale()
  const isZh = locale === 'zh-CN'
  const [storeState, setStoreState] = useState<SwarmClientState>(() => swarmClientStore.getState())
  const [draftPresets, setDraftPresets] = useState<RoleModelMap>({})
  const [customRoles, setCustomRoles] = useState<string[]>([])
  const [manualRoles, setManualRoles] = useState<Record<string, boolean>>({})
  const [newRoleInput, setNewRoleInput] = useState('')
  const [roleInputErr, setRoleInputErr] = useState<string | null>(null)
  const [savingPresets, setSavingPresets] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    const release = swarmClientStore.retain()
    const unsub = swarmClientStore.subscribe((next) => setStoreState(next))
    void swarmClientStore.listModels(true).catch(() => {})
    void fetch('/ag-swarm/api/config', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw: unknown) => {
        if (!raw || typeof raw !== 'object') return
        const obj = ((raw as { config?: unknown }).config ?? raw) as Partial<ConfigPayload>
        if (obj.modelPresets && typeof obj.modelPresets === 'object') {
          const presets = obj.modelPresets
          setDraftPresets(presets)
          setCustomRoles(Object.keys(presets).filter((k) => !BUILTIN_SET.has(k)))
        }
      })
      .catch(() => {})
    return () => {
      unsub()
      release()
    }
  }, [])

  const catalogByKey = useMemo(() => {
    const map = new Map<string, CatalogModelOption>()
    for (const m of storeState.models) {
      map.set(catalogKey(m.provider, m.model), m)
    }
    return map
  }, [storeState.models])

  const allRoleKeys = useMemo(() => {
    const seen = new Set<string>(BUILTIN_MODEL_ROLES)
    const extras = customRoles.filter((r) => !seen.has(r))
    return [...BUILTIN_MODEL_ROLES, ...extras]
  }, [customRoles])

  const updateRolePreset = useCallback((role: string, updater: (prev: RoleModelPreset | undefined) => RoleModelPreset | undefined) => {
    setSaveFeedback(null)
    setDraftPresets((prev) => {
      const next = { ...prev }
      const updated = updater(prev[role])
      if (!updated || !updated.model.trim()) {
        delete next[role]
      } else {
        next[role] = updated
      }
      return next
    })
  }, [])

  const handleAddRole = useCallback(() => {
    const normalized = newRoleInput.trim().toLowerCase()
    if (!normalized) return
    if (!ROLE_NAME_RE.test(normalized)) {
      setRoleInputErr(
        isZh
          ? '角色名需为小写字母/数字开头，仅含 a-z、0-9、-、_（最多 24 字符）'
          : 'Role name must match ^[a-z0-9][a-z0-9_-]{0,23}$',
      )
      return
    }
    if (BUILTIN_SET.has(normalized) || customRoles.includes(normalized)) {
      setRoleInputErr(isZh ? `角色 "${normalized}" 已存在` : `Role "${normalized}" already exists`)
      return
    }
    setRoleInputErr(null)
    setCustomRoles((prev) => [...prev, normalized])
    setNewRoleInput('')
  }, [newRoleInput, customRoles, isZh])

  const handleRemoveRole = useCallback((role: string) => {
    if (BUILTIN_SET.has(role)) return
    setCustomRoles((prev) => prev.filter((r) => r !== role))
    setManualRoles((prev) => {
      const next = { ...prev }
      delete next[role]
      return next
    })
    setDraftPresets((prev) => {
      const next = { ...prev }
      delete next[role]
      return next
    })
    setSaveFeedback(null)
  }, [])

  const handleSavePresets = useCallback(async () => {
    setSavingPresets(true)
    setSaveFeedback(null)
    try {
      const cleaned: RoleModelMap = {}
      for (const role of allRoleKeys) {
        const p = draftPresets[role]
        if (p && p.model.trim()) {
          const cat = catalogByKey.get(catalogKey(p.provider, p.model))
          const rawEff = p.reasoningEffort?.trim()
          const validEff = rawEff && (!cat?.reasoningKnown || cat.efforts?.some((e) => e.id === rawEff))
            ? rawEff
            : undefined
          cleaned[role] = {
            ...(p.provider?.trim() ? { provider: p.provider.trim() } : {}),
            model: p.model.trim(),
            ...(validEff ? { reasoningEffort: validEff } : {}),
            ...(p.label?.trim() ? { label: p.label.trim() } : {}),
          }
        }
      }
      const res = await fetch('/ag-swarm/api/model-presets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ modelPresets: cleaned }),
      })
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        modelPresets?: RoleModelMap
      }
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || `HTTP ${res.status}`)
      }
      const saved = json.modelPresets ?? cleaned
      setDraftPresets(saved)
      setSaveFeedback({ kind: 'ok', text: t('settings.presetsSaved') })
    } catch (err) {
      setSaveFeedback({
        kind: 'err',
        text: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setSavingPresets(false)
    }
  }, [allRoleKeys, draftPresets, catalogByKey])

  return (
    <div
      className="ag-settings-card"
      data-testid="swarm-role-models-card"
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
        background: 'var(--ag-card, #ffffff)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ag-fg-muted, #5d676f)' }}>
            {t('settings.roleModelsTitle')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)', marginTop: 3 }}>
            {t('settings.roleModelsDesc')}
          </div>
        </div>
        <button
          type="button"
          className="ag-ghost-btn"
          data-testid="swarm-refresh-models"
          disabled={storeState.modelsLoading}
          onClick={() => { void swarmClientStore.listModels(true) }}
          style={{ flex: 'none', height: 26, padding: '0 8px', fontSize: 11.5 }}
        >
          {storeState.modelsLoading ? t('common.refreshing') : t('settings.refreshModels')}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {allRoleKeys.map((role) => {
          const preset = draftPresets[role]
          const isBuiltin = BUILTIN_SET.has(role)
          const curKey = preset?.model ? catalogKey(preset.provider, preset.model) : ''
          const matchedCatalog = curKey ? catalogByKey.get(curKey) : undefined
          const hasUnknownSaved = Boolean(preset?.model && !matchedCatalog)
          const isManual = Boolean(manualRoles[role]) || (storeState.models.length === 0 && Boolean(preset?.model))
          const supportedEfforts = matchedCatalog?.efforts ?? []
          const savedEffort = preset?.reasoningEffort?.trim() || ''
          const savedUnsupported = Boolean(
            savedEffort && matchedCatalog?.reasoningKnown && !supportedEfforts.some((e) => e.id === savedEffort),
          )
          const defaultEffortLabel = matchedCatalog?.defaultEffort
            ? `${t('settings.effortDefault')} (${matchedCatalog.defaultEffort})`
            : t('settings.effortDefault')

          return (
            <div
              key={role}
              data-testid={`swarm-role-row-${role}`}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 8,
                background: 'var(--ag-fill, rgba(128,128,128,0.06))',
              }}
            >
              <div style={{ minWidth: 160, flex: '0 1 185px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {roleDisplayLabel(role)}
                </span>
                {!isBuiltin && (
                  <button
                    type="button"
                    className="ag-icon-btn"
                    onClick={() => handleRemoveRole(role)}
                    aria-label={isZh ? `删除角色 ${role}` : `Remove role ${role}`}
                    title={isZh ? '删除自定义角色' : 'Remove custom role'}
                    style={{ width: 20, height: 20, fontSize: 11 }}
                  >
                    ×
                  </button>
                )}
              </div>

              {!isManual ? (
                <select
                  aria-label={`${role} model`}
                  value={curKey}
                  onChange={(e) => {
                    const val = e.target.value
                    if (!val) {
                      updateRolePreset(role, () => undefined)
                      return
                    }
                    const opt = catalogByKey.get(val)
                    if (opt) {
                      updateRolePreset(role, (prev) => {
                        const prevEffort = prev?.reasoningEffort?.trim()
                        const keepEffort = Boolean(prevEffort && opt.efforts?.some((ef) => ef.id === prevEffort))
                        return {
                          provider: opt.provider,
                          model: opt.model,
                          label: opt.label,
                          ...(keepEffort && prevEffort ? { reasoningEffort: prevEffort } : {}),
                        }
                      })
                    } else {
                      const sep = val.indexOf('::')
                      const provider = sep >= 0 ? val.slice(0, sep) : ''
                      const model = sep >= 0 ? val.slice(sep + 2) : val
                      updateRolePreset(role, () => ({
                        ...(provider ? { provider } : {}),
                        model,
                      }))
                    }
                  }}
                  style={{
                    flex: '1 1 200px',
                    minWidth: 160,
                    height: 30,
                    padding: '0 8px',
                    borderRadius: 6,
                    border: '1px solid var(--ag-border, rgba(128,128,128,0.2))',
                    background: 'var(--ag-bg, #f7f7f8)',
                    fontSize: 12,
                  }}
                >
                  <option value="">{t('settings.inheritMain')}</option>
                  {hasUnknownSaved && preset && (
                    <option value={curKey}>
                      {preset.provider ? `${preset.provider} / ${preset.model}` : preset.model}
                    </option>
                  )}
                  {storeState.models.map((opt) => {
                    const k = catalogKey(opt.provider, opt.model)
                    return (
                      <option key={k} value={k}>
                        {opt.provider ? `${opt.provider} / ${opt.label}` : opt.label}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  aria-label={`${role} custom model`}
                  value={preset?.model ?? ''}
                  placeholder={t('settings.customModelPlaceholder')}
                  onChange={(e) => {
                    const val = e.target.value
                    updateRolePreset(role, (prev) =>
                      val.trim()
                        ? {
                            ...(prev?.provider ? { provider: prev.provider } : {}),
                            model: val,
                            ...(prev?.reasoningEffort ? { reasoningEffort: prev.reasoningEffort } : {}),
                          }
                        : undefined,
                    )
                  }}
                  style={{
                    flex: '1 1 200px',
                    minWidth: 160,
                    height: 30,
                    padding: '0 8px',
                    borderRadius: 6,
                    border: '1px solid var(--ag-border, rgba(128,128,128,0.2))',
                    background: 'var(--ag-bg, #f7f7f8)',
                    fontSize: 12,
                  }}
                />
              )}

              {!isManual && matchedCatalog ? (
                <select
                  aria-label={`${role} reasoning effort`}
                  value={savedEffort}
                  disabled={!preset?.model?.trim() || (supportedEfforts.length === 0 && !savedUnsupported)}
                  onChange={(e) => {
                    const eff = e.target.value
                    updateRolePreset(role, (prev) => {
                      if (!prev?.model) return prev
                      return {
                        ...(prev.provider ? { provider: prev.provider } : {}),
                        model: prev.model,
                        ...(prev.label ? { label: prev.label } : {}),
                        ...(eff ? { reasoningEffort: eff } : {}),
                      }
                    })
                  }}
                  style={{
                    flex: '0 0 132px',
                    height: 30,
                    padding: '0 8px',
                    borderRadius: 6,
                    border: `1px solid ${savedUnsupported ? 'var(--ag-warning, #bca136)' : 'var(--ag-border, rgba(128,128,128,0.2))'}`,
                    background: 'var(--ag-bg, #f7f7f8)',
                    fontSize: 12,
                  }}
                >
                  {supportedEfforts.length === 0 ? (
                    <>
                      <option value="">
                        {savedUnsupported
                          ? (isZh ? '清除不支持的思维度' : 'Clear unsupported')
                          : (isZh ? '该模型不支持思维度' : 'Not supported')}
                      </option>
                      {savedUnsupported && (
                        <option value={savedEffort}>
                          {savedEffort} ({isZh ? '不支持' : 'unsupported'})
                        </option>
                      )}
                    </>
                  ) : (
                    <>
                      <option value="">{defaultEffortLabel}</option>
                      {supportedEfforts.map((ef) => (
                        <option key={ef.id} value={ef.id}>{ef.name}</option>
                      ))}
                      {savedUnsupported && (
                        <option value={savedEffort}>
                          {savedEffort} ({isZh ? '不支持' : 'unsupported'})
                        </option>
                      )}
                    </>
                  )}
                </select>
              ) : (
                <input
                  type="text"
                  aria-label={`${role} reasoning effort`}
                  value={preset?.reasoningEffort ?? ''}
                  disabled={!preset?.model?.trim()}
                  placeholder={isZh ? '默认思维度（可选）' : 'Default effort (optional)'}
                  onChange={(e) => {
                    const eff = e.target.value
                    updateRolePreset(role, (prev) => {
                      if (!prev?.model) return prev
                      return {
                        ...(prev.provider ? { provider: prev.provider } : {}),
                        model: prev.model,
                        ...(prev.label ? { label: prev.label } : {}),
                        ...(eff.trim() ? { reasoningEffort: eff } : {}),
                      }
                    })
                  }}
                  style={{
                    flex: '0 0 132px',
                    height: 30,
                    padding: '0 8px',
                    borderRadius: 6,
                    border: '1px solid var(--ag-border, rgba(128,128,128,0.2))',
                    background: 'var(--ag-bg, #f7f7f8)',
                    fontSize: 12,
                  }}
                />
              )}

              <button
                type="button"
                className="ag-ghost-btn"
                onClick={() => setManualRoles((prev) => ({ ...prev, [role]: !isManual }))}
                style={{ height: 28, padding: '0 7px', fontSize: 11 }}
                title={isManual ? (isZh ? '切换回模型目录选择' : 'Switch to catalog dropdown') : (isZh ? '手动输入模型 ID' : 'Type model ID manually')}
              >
                {isManual ? (isZh ? '选目录' : 'Catalog') : (isZh ? '手动' : 'Manual')}
              </button>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingTop: 4 }}>
        <input
          type="text"
          value={newRoleInput}
          onChange={(e) => {
            setNewRoleInput(e.target.value)
            if (roleInputErr) setRoleInputErr(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddRole()
            }
          }}
          placeholder={t('settings.addRolePlaceholder')}
          aria-label={t('settings.addRolePlaceholder')}
          style={{
            flex: '1 1 200px',
            minWidth: 160,
            height: 30,
            padding: '0 8px',
            borderRadius: 6,
            border: '1px solid var(--ag-border, rgba(128,128,128,0.2))',
            background: 'var(--ag-bg, #f7f7f8)',
            fontSize: 12,
          }}
        />
        <button type="button" className="ag-btn sm" onClick={handleAddRole} style={{ height: 30 }}>
          + {t('settings.addRoleBtn')}
        </button>
        <button
          type="button"
          className="ag-btn primary sm"
          disabled={savingPresets}
          onClick={() => void handleSavePresets()}
          data-testid="swarm-save-role-presets"
          style={{ height: 30, marginLeft: 'auto' }}
        >
          {savingPresets ? t('common.saving') : t('settings.savePresets')}
        </button>
      </div>

      {roleInputErr && (
        <div role="alert" style={{ fontSize: 12, color: 'var(--ag-error, #cb3d3d)' }}>
          {roleInputErr}
        </div>
      )}

      {saveFeedback && (
        <div
          role="status"
          style={{
            padding: '7px 10px',
            borderRadius: 8,
            fontSize: 12,
            background: saveFeedback.kind === 'err'
              ? 'color-mix(in srgb, var(--ag-error, #cb3d3d) 12%, transparent)'
              : 'color-mix(in srgb, var(--ag-success, #63984f) 14%, transparent)',
            color: saveFeedback.kind === 'err' ? 'var(--ag-error, #cb3d3d)' : 'var(--ag-success, #63984f)',
          }}
        >
          {saveFeedback.text}
        </div>
      )}
    </div>
  )
}

export function SettingsSection(): JSX.Element {
  const locale = useUiLocale()
  const isZh = locale === 'zh-CN'
  const [storeState, setStoreState] = useState<SwarmClientState>(() => swarmClientStore.getState())
  const [config, setConfig] = useState<ConfigPayload>(DEFAULT_CONFIG)
  const [jumpNotice, setJumpNotice] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const release = swarmClientStore.retain()
    const unsub = swarmClientStore.subscribe((next) => setStoreState(next))
    void swarmClientStore.listSwarms().catch(() => {})
    void swarmClientStore.listModels().catch(() => {})
    void fetch('/ag-swarm/api/config', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw: unknown) => {
        if (!raw || typeof raw !== 'object') return
        const obj = ((raw as { config?: unknown }).config ?? raw) as Partial<ConfigPayload>
        setConfig((prev) => ({
          ...prev,
          ...obj,
          modelPresets: obj.modelPresets && typeof obj.modelPresets === 'object' ? obj.modelPresets : prev.modelPresets,
        }))
      })
      .catch(() => {})
    return () => {
      unsub()
      release()
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        swarmClientStore.listSwarms(),
        swarmClientStore.listModels(true),
      ])
    } catch {
      // store surfaces errors
    } finally {
      setRefreshing(false)
    }
  }, [])

  const handleSelectSwarm = useCallback(
    (swarm: SwarmSummary) => {
      void swarmClientStore.selectSwarm(swarm.swarm_id)
      const label = swarm.title || swarm.swarm_id
      setJumpNotice(
        isZh
          ? `已选中「${label}」，请切换到对话页顶部「蜂群」标签查看。`
          : `Selected "${label}". Open the Swarm tab in your conversation view to inspect it.`,
      )
    },
    [isZh],
  )

  const swarms = storeState.swarms
  const totalWorking = swarms.reduce((acc, s) => acc + (s.workingCount || 0), 0)
  const syncColor = storeState.sync === 'live'
    ? 'var(--ag-success, #63984f)'
    : storeState.sync === 'reconnecting'
      ? 'var(--ag-warning, #bca136)'
      : 'var(--ag-fg-faint, #9da5ab)'
  const syncText = storeState.sync === 'live'
    ? t('common.live')
    : storeState.sync === 'reconnecting'
      ? t('common.reconnecting')
      : t('common.offline')

  return (
    <div
      className="ag-settings"
      data-testid="swarm-settings-section"
      style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--ag-fg, inherit)' }}
    >
      <div
        className="ag-settings-card"
        style={{
          padding: '12px 14px',
          borderRadius: 10,
          border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
          background: 'var(--ag-card, #ffffff)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <PixelBee name="coordinator" role="coordinator" state={totalWorking > 0 ? 'working' : 'landed'} size={2} framed />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{t('settings.title')}</span>
              <button
                type="button"
                className="ag-ghost-btn"
                onClick={() => toggleUiLocale()}
                data-testid="swarm-settings-locale-toggle"
                title={isZh ? 'Switch to English' : '切换为简体中文'}
                style={{
                  height: 22,
                  padding: '0 7px',
                  fontSize: 11,
                  border: '1px solid var(--ag-border, rgba(128,128,128,0.2))',
                  borderRadius: 999,
                }}
              >
                {isZh ? 'EN' : '中文'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: syncColor, display: 'inline-block' }} />
                {syncText}
              </span>
              <span>· {isZh ? `${swarms.length} 个蜂群` : `${swarms.length} ${swarms.length === 1 ? 'swarm' : 'swarms'}`}</span>
              <span>· {t('header.working', { count: totalWorking })}</span>
            </div>
          </div>
          <button type="button" className="ag-btn sm" onClick={() => void handleRefresh()} disabled={refreshing}>
            {refreshing ? t('common.refreshing') : t('common.refresh')}
          </button>
        </div>
      </div>

      <div
        className="ag-settings-card"
        style={{
          padding: '12px 14px',
          borderRadius: 10,
          border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
          background: 'var(--ag-card, #ffffff)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ag-fg-muted, #5d676f)', marginBottom: 8 }}>
          {t('settings.activeSwarms')} ({swarms.length})
        </div>
        {jumpNotice && (
          <div
            role="status"
            style={{
              marginBottom: 8,
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 12,
              background: 'color-mix(in srgb, var(--ag-primary, #007acc) 12%, transparent)',
              color: 'var(--ag-fg, inherit)',
            }}
          >
            {jumpNotice}
          </div>
        )}
        {swarms.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)' }}>
            {t('settings.noSwarms')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {swarms.map((s) => {
              const selected = storeState.activeSwarmId === s.swarm_id
              return (
                <button
                  key={s.swarm_id}
                  type="button"
                  onClick={() => handleSelectSwarm(s)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: selected ? '1px solid var(--ag-primary, #007acc)' : '1px solid var(--ag-border, rgba(128,128,128,0.16))',
                    background: selected ? 'color-mix(in srgb, var(--ag-primary, #007acc) 8%, transparent)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <PixelBee name={s.swarm_id} role="worker" state={s.workingCount > 0 ? 'working' : 'landed'} size={1} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.title || s.swarm_id}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ag-fg-muted, #5d676f)', fontFamily: 'var(--ag-mono, monospace)' }}>
                      {isZh
                        ? `${s.memberCount} 成员 · ${s.workingCount} 工作中 · ${s.doneCount} 完成 · #${s.head}`
                        : `${s.memberCount} members · ${s.workingCount} working · ${s.doneCount} done · #${s.head}`}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ag-fg-faint, #9da5ab)', whiteSpace: 'nowrap' }}>
                    {formatUpdated(s.updated_at, isZh)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <RoleModelPresetsCard />

      <div
        className="ag-settings-card"
        style={{
          padding: '12px 14px',
          borderRadius: 10,
          border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
          background: 'var(--ag-card, #ffffff)',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ag-fg-muted, #5d676f)', marginBottom: 8 }}>
          {t('settings.pluginConfig')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8, fontSize: 12 }}>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
            <div style={{ color: 'var(--ag-fg-muted, #5d676f)', fontSize: 11 }}>{t('settings.primaryCmd')}</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--ag-mono, monospace)' }}>/{config.primaryCommand || 'swarm'}</div>
          </div>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
            <div style={{ color: 'var(--ag-fg-muted, #5d676f)', fontSize: 11 }}>{t('settings.waitTool')}</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--ag-mono, monospace)' }}>{config.waitToolName || 'swarm_wait'}</div>
          </div>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
            <div style={{ color: 'var(--ag-fg-muted, #5d676f)', fontSize: 11 }}>maxWorkers</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--ag-mono, monospace)' }}>{config.maxWorkers}</div>
          </div>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
            <div style={{ color: 'var(--ag-fg-muted, #5d676f)', fontSize: 11 }}>enableWorktrees</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--ag-mono, monospace)' }}>
              {config.enableWorktrees ? (isZh ? '已启用' : 'Enabled') : (isZh ? '未启用' : 'Disabled')}
            </div>
          </div>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
            <div style={{ color: 'var(--ag-fg-muted, #5d676f)', fontSize: 11 }}>enableStallMonitor</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--ag-mono, monospace)' }}>
              {config.enableStallMonitor
                ? `${isZh ? '已启用' : 'Enabled'} (${Math.round(config.stallCheckIntervalMs / 1000)}s)`
                : (isZh ? '未启用' : 'Disabled')}
            </div>
          </div>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
            <div style={{ color: 'var(--ag-fg-muted, #5d676f)', fontSize: 11 }}>maxDepth</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--ag-mono, monospace)' }}>{config.maxDepth}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
