import { useCallback, useEffect, useState } from 'react'
import type { SwarmConfig, SwarmSummary } from '../../src/shared/protocol'
import { PixelBee } from '../bee-sprites'
import { swarmClientStore, type SwarmClientState } from '../store'

const DEFAULT_CONFIG: SwarmConfig = {
  storageDir: '~/.dsh/storages/ag-swarm',
  maxWorkers: 12,
  maxDepth: 2,
  stallCheckIntervalMs: 180000,
  enableStallMonitor: true,
  enableWorktrees: true,
  registerSwarmCommandAlias: false,
}

function formatUpdated(iso: string): string {
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return iso || ''
  const diffSec = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

export function SettingsSection(): JSX.Element {
  const [storeState, setStoreState] = useState<SwarmClientState>(() => swarmClientStore.getState())
  const [config, setConfig] = useState<SwarmConfig>(DEFAULT_CONFIG)
  const [jumpNotice, setJumpNotice] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const release = swarmClientStore.retain()
    const unsub = swarmClientStore.subscribe((next) => setStoreState(next))
    void swarmClientStore.listSwarms().catch(() => {})
    void fetch('/ag-swarm/api/config', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((raw: unknown) => {
        if (!raw || typeof raw !== 'object') return
        const obj = ((raw as { config?: unknown }).config ?? raw) as Partial<SwarmConfig>
        setConfig((prev) => ({ ...prev, ...obj }))
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
      await swarmClientStore.listSwarms()
    } catch {
      // store surfaces errors
    } finally {
      setRefreshing(false)
    }
  }, [])

  const handleSelectSwarm = useCallback((swarm: SwarmSummary) => {
    void swarmClientStore.selectSwarm(swarm.swarm_id)
    setJumpNotice(`Selected "${swarm.title || swarm.swarm_id}". Open the Swarm tab in your conversation view to inspect it.`)
  }, [])

  const swarms = storeState.swarms
  const totalWorking = swarms.reduce((acc, s) => acc + (s.workingCount || 0), 0)
  const syncColor = storeState.sync === 'live'
    ? 'var(--ag-success, #63984f)'
    : storeState.sync === 'reconnecting'
      ? 'var(--ag-warning, #bca136)'
      : 'var(--ag-fg-faint, #9da5ab)'

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PixelBee name="coordinator" role="coordinator" state={totalWorking > 0 ? 'working' : 'landed'} size={2} framed />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>DSH Hive Swarm</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: syncColor, display: 'inline-block' }} />
                {storeState.sync === 'live' ? 'Live SSE connected' : storeState.sync}
              </span>
              <span>· {swarms.length} {swarms.length === 1 ? 'swarm' : 'swarms'}</span>
              <span>· {totalWorking} working</span>
            </div>
          </div>
          <button type="button" className="ag-btn sm" onClick={() => void handleRefresh()} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
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
          Active Swarms ({swarms.length})
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
            No swarms recorded yet. Start one in any conversation with <code>/ag-swarm</code>.
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
                      {s.memberCount} members · {s.workingCount} working · {s.doneCount} done · #{s.head}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ag-fg-faint, #9da5ab)', whiteSpace: 'nowrap' }}>
                    {formatUpdated(s.updated_at)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
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
          Plugin Configuration
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, fontSize: 12 }}>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
            <div style={{ color: 'var(--ag-fg-muted, #5d676f)', fontSize: 11 }}>maxWorkers</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--ag-mono, monospace)' }}>{config.maxWorkers}</div>
          </div>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
            <div style={{ color: 'var(--ag-fg-muted, #5d676f)', fontSize: 11 }}>enableWorktrees</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--ag-mono, monospace)' }}>{config.enableWorktrees ? 'Enabled' : 'Disabled'}</div>
          </div>
          <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
            <div style={{ color: 'var(--ag-fg-muted, #5d676f)', fontSize: 11 }}>enableStallMonitor</div>
            <div style={{ fontWeight: 600, fontFamily: 'var(--ag-mono, monospace)' }}>
              {config.enableStallMonitor ? `Enabled (${Math.round(config.stallCheckIntervalMs / 1000)}s)` : 'Disabled'}
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
