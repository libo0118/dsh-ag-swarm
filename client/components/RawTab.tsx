import { useCallback, useEffect, useState } from 'react'
import type { RawFilesPayload } from '../../src/shared/protocol'
import { swarmClientStore } from '../store'

type RawFileName = 'swarm.json' | 'members.json' | 'board.jsonl' | 'plan.json'

const FILE_ORDER: readonly RawFileName[] = ['swarm.json', 'members.json', 'board.jsonl', 'plan.json']

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback when clipboard API is restricted
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

export function RawTab(props: { swarmId: string }): JSX.Element {
  const { swarmId } = props
  const [selected, setSelected] = useState<RawFileName>('members.json')
  const [payload, setPayload] = useState<RawFilesPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    if (!swarmId) return
    setLoading(true)
    setError(null)
    try {
      const data = await swarmClientStore.fetchRawFiles(swarmId)
      setPayload(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [swarmId])

  useEffect(() => {
    void load()
  }, [load])

  const fileEntry = payload?.files.find((f) => f.name === selected) ?? null
  const content = fileEntry?.content ?? ''
  const bytes = fileEntry?.bytes ?? content.length
  const lines = fileEntry?.lines ?? (content ? content.split('\n').filter(Boolean).length : 0)
  const filePath = fileEntry?.path || (payload?.storage_path ? `${payload.storage_path}/${selected}` : selected)

  const handleCopy = useCallback(async () => {
    if (!content) return
    const ok = await copyToClipboard(content)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }, [content])

  return (
    <div className="ag-raw-tab" data-testid="swarm-raw-tab">
      <div
        className="ag-raw-toolbar"
        style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}
      >
        <div
          className="ag-segmented"
          role="tablist"
          aria-label="Raw swarm files"
          style={{
            display: 'inline-flex',
            gap: 2,
            padding: 2,
            borderRadius: 'var(--ag-r-lg, 8px)',
            background: 'var(--ag-fill, rgba(128,128,128,0.08))',
          }}
        >
          {FILE_ORDER.map((name) => {
            const on = selected === name
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={on}
                className={`ag-raw-btn${on ? ' on' : ''}`}
                onClick={() => setSelected(name)}
                style={{
                  height: 24,
                  padding: '0 10px',
                  border: 0,
                  borderRadius: 'var(--ag-r-md, 6px)',
                  background: on ? 'var(--ag-bg, #ffffff)' : 'transparent',
                  color: on ? 'var(--ag-fg, inherit)' : 'var(--ag-fg-muted, #5d676f)',
                  fontFamily: 'var(--ag-mono, monospace)',
                  fontSize: 'var(--ag-text-2xs, 11px)',
                  boxShadow: on ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                }}
              >
                {name}
              </button>
            )
          })}
        </div>
        <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            className="ag-ghost-btn"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <button
            type="button"
            className="ag-btn sm"
            onClick={() => void handleCopy()}
            disabled={!content}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div
        className="ag-raw-meta"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          marginBottom: 8,
          fontSize: 'var(--ag-text-xs, 12px)',
          color: 'var(--ag-fg-muted, #5d676f)',
        }}
      >
        <span
          className="ag-raw-path"
          title={filePath}
          style={{
            flex: '0 1 auto',
            minWidth: 0,
            fontFamily: 'var(--ag-mono, monospace)',
            fontSize: 'var(--ag-text-2xs, 11px)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            direction: 'rtl',
            textAlign: 'left',
          }}
        >
          <span dir="ltr">{filePath}</span>
        </span>
        <span className="ag-raw-size" style={{ flex: 'none', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          · {fmtBytes(bytes)} · {lines} {lines === 1 ? 'line' : 'lines'}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: 8,
            padding: '8px 10px',
            borderRadius: 'var(--ag-r-md, 6px)',
            background: 'color-mix(in srgb, var(--ag-error, #cb3d3d) 12%, transparent)',
            color: 'var(--ag-error, #cb3d3d)',
            fontSize: 'var(--ag-text-xs, 12px)',
          }}
        >
          Failed to load raw files: {error}
        </div>
      )}

      <pre
        className="ag-raw"
        data-testid="swarm-raw-content"
        style={{
          margin: 0,
          padding: 12,
          background: 'var(--ag-fill, rgba(128,128,128,0.08))',
          borderRadius: 'var(--ag-r-lg, 8px)',
          fontFamily: 'var(--ag-mono, monospace)',
          fontSize: 'var(--ag-text-xs, 12px)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: 'var(--ag-fg-2, inherit)',
          maxHeight: '65vh',
          overflow: 'auto',
          tabSize: 2,
        }}
      >
        {content || (loading ? 'Loading…' : '(empty)')}
      </pre>
    </div>
  )
}
