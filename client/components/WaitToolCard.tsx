import { useState } from 'react'
import { PixelBee } from '../bee-sprites'
import { t, useUiLocale } from '../i18n'
import { useSwarmStore } from '../store'

interface WaitToolCardProps {
  toolCall?: {
    input?: unknown
    output?: unknown
    status?: string
  }
  block?: {
    argsRaw?: string
    call?: { argsRaw?: string } | null
    content?: ReadonlyArray<{ type: string; text?: string }>
    isError?: boolean
    kind?: string
  }
}

interface ParsedWaitMessage {
  seq?: number
  agent?: string
  channel?: string
  text?: string
  time?: string
}

interface ParsedWorkerSummary {
  name?: string
  state?: string
  steps_count?: number
  activity?: string
  last_post_seq?: number
}

interface ParsedWaitOutput {
  status?: string
  reason?: string
  head?: number
  messages?: ParsedWaitMessage[]
  worker_summary?: ParsedWorkerSummary[]
  note?: string
  timedOut?: boolean
}

const MAX_MSG_PREVIEW = 320
const MAX_RAW_PREVIEW = 3000

function truncateText(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) return { text, truncated: false }
  return { text: `${text.slice(0, maxChars)}…`, truncated: true }
}

function formatPrettyJson(raw: string, parsed: unknown): string {
  if (parsed && typeof parsed === 'object') {
    try {
      return JSON.stringify(parsed, null, 2)
    } catch { /* fallback */ }
  }
  return raw
}

function resolveStatus(props: WaitToolCardProps): 'running' | 'ok' | 'error' {
  const st = props.toolCall?.status?.toLowerCase()
  if (st === 'error' || st === 'failed' || props.block?.isError) return 'error'
  if (st === 'running' || st === 'pending' || st === 'in_progress') return 'running'
  if (props.block && !('kind' in props.block) && !props.toolCall?.output) return 'running'
  return 'ok'
}

function extractOutputText(props: WaitToolCardProps): string {
  const out = props.toolCall?.output
  if (out !== undefined && out !== null) {
    if (typeof out === 'string') return out
    try {
      return JSON.stringify(out, null, 2)
    } catch {
      return String(out)
    }
  }
  const content = props.block?.content
  if (Array.isArray(content) && content.length > 0) {
    return content
      .map((item) => (item.type === 'text' && typeof item.text === 'string' ? item.text : JSON.stringify(item)))
      .join('\n')
  }
  return ''
}

function parseWaitOutput(raw: string): ParsedWaitOutput | null {
  if (!raw.trim()) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as ParsedWaitOutput) : null
  } catch {
    return null
  }
}

function finishedSummaryLabel(parsed: ParsedWaitOutput | null, isError: boolean, isZh: boolean): string {
  if (isError) return isZh ? '等待已中断' : 'Wait interrupted'
  switch (parsed?.status) {
    case 'messages': {
      const n = Array.isArray(parsed.messages) ? parsed.messages.length : 0
      return isZh ? `收到 ${n} 条黑板汇报` : `Received ${n} board update(s)`
    }
    case 'timeout':
      return isZh ? '心跳检查点 · 已更新阶段进度' : 'Heartbeat checkpoint'
    case 'all_idle':
      return isZh ? '全部子代理已空闲待命' : 'All workers idle'
    case 'interrupted':
      return isZh ? '收到用户新消息，已唤醒协调者' : 'Resumed on user input'
    case 'waiting':
      return isZh ? '已进入休眠等待 @提及' : 'Sleeping on board'
    default:
      return isZh ? '等待结束' : 'Wait finished'
  }
}

export function WaitToolCard(props: WaitToolCardProps): JSX.Element {
  const locale = useUiLocale()
  const isZh = locale === 'zh-CN'
  const [expanded, setExpanded] = useState(false)
  const [showRawJson, setShowRawJson] = useState(false)
  const [showFullRaw, setShowFullRaw] = useState(false)
  const [expandedMsgs, setExpandedMsgs] = useState<Record<number, boolean>>({})
  const [stopping, setStopping] = useState(false)
  const { snapshot, postAction } = useSwarmStore()

  const status = resolveStatus(props)
  const outputText = extractOutputText(props)
  const parsed = status === 'running' ? null : parseWaitOutput(outputText)

  if (status !== 'running') {
    const label = finishedSummaryLabel(parsed, status === 'error', isZh)
    const color = status === 'error' ? 'var(--ag-error, #cb3d3d)' : 'var(--ag-success, #63984f)'
    const msgs = Array.isArray(parsed?.messages) ? parsed!.messages! : []
    const workers = Array.isArray(parsed?.worker_summary) ? parsed!.worker_summary! : []
    const prettyRaw = outputText ? formatPrettyJson(outputText, parsed) : ''
    const rawPreview = showFullRaw ? { text: prettyRaw, truncated: false } : truncateText(prettyRaw, MAX_RAW_PREVIEW)
    const compactLine = msgs.length > 0
      ? `#${msgs[0]?.seq ?? '?'} @${msgs[0]?.agent ?? 'worker'}: ${truncateText(String(msgs[0]?.text ?? '').replace(/\s+/g, ' '), 100).text}`
      : workers.length > 0
        ? (() => {
            const active = workers.filter((w) => w.state === 'working')
            return active.length > 0
              ? `${active.length} ${isZh ? '工作中' : 'working'} · ${active.slice(0, 2).map((w) => `@${w.name} ${w.activity || ''}`.trim()).join(' | ')}`
              : `${workers.length} ${isZh ? '成员待命' : 'workers idle'}`
          })()
        : parsed?.note || ''

    return (
      <div
        className="ag-toolcard"
        data-testid="swarm-wait-card"
        style={{
          border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
          borderRadius: 'var(--ag-r-lg, 8px)',
          background: 'var(--ag-card, #ffffff)',
          padding: '8px 10px',
          fontSize: 'var(--ag-text-xs, 12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PixelBee name="coordinator" role="coordinator" state="landed" size={1} />
          <span style={{ fontWeight: 600 }}>{label}</span>
          <span style={{ marginLeft: 'auto', color, fontSize: 11, fontWeight: 500 }}>
            {status === 'error' ? (isZh ? '已中断' : 'Stopped') : (isZh ? '已完成' : 'Done')}
          </span>
        </div>
        {!expanded && compactLine && (
          <div
            style={{
              marginTop: 4,
              color: 'var(--ag-fg-muted, #5d676f)',
              fontSize: 11.5,
              lineHeight: '18px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={compactLine}
          >
            {compactLine}
          </div>
        )}
        {outputText && (
          <div style={{ marginTop: 4 }}>
            <button type="button" className="ag-ghost-btn" onClick={() => setExpanded((v) => !v)} style={{ height: 22, fontSize: 11, padding: '0 4px' }}>
              {expanded ? t('tool.hideDetails') : t('tool.showDetails')}
            </button>
            {expanded && (
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                {workers.length > 0 && workers.map((w, i) => (
                  <div key={`${w.name ?? i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))' }}>
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>@{w.name}</span>
                    <span style={{ fontSize: 11, color: w.state === 'working' ? 'var(--ag-primary, #007acc)' : 'var(--ag-fg-muted, #5d676f)', whiteSpace: 'nowrap' }}>
                      {w.state === 'working' ? (isZh ? '工作中' : 'Working') : (w.state || '')}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ag-fg-muted, #5d676f)' }}>
                      {w.activity || '—'}
                    </span>
                    {typeof w.steps_count === 'number' && w.steps_count > 0 && (
                      <span style={{ fontFamily: 'var(--ag-mono, monospace)', fontSize: 11, color: 'var(--ag-fg-faint, #9da5ab)' }}>
                        {isZh ? `${w.steps_count} 步` : `${w.steps_count}s`}
                      </span>
                    )}
                  </div>
                ))}
                {msgs.length > 0 && msgs.map((m, idx) => {
                  const rawMsg = String(m.text ?? '')
                  const isMsgOpen = Boolean(expandedMsgs[idx])
                  const preview = isMsgOpen ? { text: rawMsg, truncated: false } : truncateText(rawMsg, MAX_MSG_PREVIEW)
                  return (
                    <div key={`${m.seq ?? idx}`} style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ag-fg-muted, #5d676f)' }}>
                        <strong style={{ color: 'var(--ag-fg, inherit)' }}>@{m.agent || 'worker'}</strong>
                        <span style={{ fontFamily: 'var(--ag-mono, monospace)' }}>#{m.seq ?? '?'}</span>
                        {m.channel && m.channel !== 'main' && <span>#{m.channel}</span>}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{preview.text}</div>
                      {(preview.truncated || isMsgOpen) && (
                        <button type="button" className="ag-ghost-btn" onClick={() => setExpandedMsgs((p) => ({ ...p, [idx]: !isMsgOpen }))} style={{ alignSelf: 'flex-start', height: 20, padding: '0 4px', fontSize: 11 }}>
                          {isMsgOpen ? (isZh ? '收起' : 'Show less') : (isZh ? `展开全文 (共 ${rawMsg.length} 字)` : `Show full (${rawMsg.length} chars)`)}
                        </button>
                      )}
                    </div>
                  )
                })}
                {workers.length === 0 && msgs.length === 0 && (
                  <div style={{ padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.06))', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {parsed?.note || (status === 'error' ? outputText : label)}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" className="ag-ghost-btn" onClick={() => setShowRawJson((v) => !v)} style={{ height: 20, padding: '0 4px', fontSize: 11 }}>
                    {showRawJson ? (isZh ? '隐藏原始 JSON' : 'Hide raw JSON') : (isZh ? '原始 JSON' : 'Raw JSON')}
                  </button>
                </div>
                {showRawJson && (
                  <div>
                    <pre style={{ margin: 0, maxHeight: 200, overflow: 'auto', padding: '6px 8px', borderRadius: 6, background: 'var(--ag-fill, rgba(128,128,128,0.08))', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {rawPreview.text}
                    </pre>
                    {(rawPreview.truncated || showFullRaw) && (
                      <button type="button" className="ag-ghost-btn" onClick={() => setShowFullRaw((v) => !v)} style={{ marginTop: 4, height: 20, padding: '0 4px', fontSize: 11 }}>
                        {showFullRaw ? (isZh ? '收起预览' : 'Collapse') : (isZh ? `显示全部 (共 ${prettyRaw.length} 字符)` : `Show full (${prettyRaw.length} chars)`)}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const allWorkers = snapshot
    ? Object.values(snapshot.members).filter((m) => m.role !== 'coordinator' && m.role !== 'monitor' && !m.killed)
    : []
  const workingWorkers = allWorkers.filter((m) => m.state === 'working')
  const standbyCount = Math.max(0, allWorkers.length - workingWorkers.length)
  const recentPosts = snapshot
    ? snapshot.messages.filter((m) => m.kind !== 'control').slice(-2)
    : []

  return (
    <div
      className="ag-toolcard"
      data-testid="swarm-wait-card"
      style={{
        border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
        borderRadius: 'var(--ag-r-lg, 8px)',
        background: 'var(--ag-card, #ffffff)',
        padding: '10px 12px',
        fontSize: 'var(--ag-text-xs, 12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <PixelBee name="coordinator" role="coordinator" state="working" size={1} />
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          {isZh ? '正在协同等待子代理推进…' : 'Coordinating swarm workers…'}
        </span>
        {allWorkers.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--ag-primary, #007acc)', fontWeight: 500 }}>
            {isZh ? `${workingWorkers.length} 工作中` : `${workingWorkers.length} working`}
            {standbyCount > 0 && (
              <span style={{ color: 'var(--ag-fg-muted, #5d676f)', fontWeight: 400 }}>
                {isZh ? ` · ${standbyCount} 待命` : ` · ${standbyCount} standby`}
              </span>
            )}
          </span>
        )}
        <span className="ag-spacer" />
        {snapshot && workingWorkers.length > 0 && (
          <button
            type="button"
            className="ag-ghost-btn"
            disabled={stopping}
            onClick={() => {
              setStopping(true)
              void postAction({ action: 'stop_workers', swarmId: snapshot.swarm_id }).finally(() => setStopping(false))
            }}
            style={{ height: 22, padding: '0 7px', fontSize: 11, color: 'var(--ag-error, #cb3d3d)' }}
          >
            {stopping ? (isZh ? '停止中…' : 'Stopping…') : (isZh ? '停止全部' : 'Stop all')}
          </button>
        )}
      </div>

      {workingWorkers.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {workingWorkers.map((m) => (
            <div
              key={m.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 8px',
                borderRadius: 6,
                background: 'var(--ag-fill, rgba(128,128,128,0.06))',
              }}
            >
              <PixelBee name={m.name} role={m.role} state="working" size={1} />
              <span style={{ fontWeight: 600, lineHeight: '20px', whiteSpace: 'nowrap' }}>@{m.name}</span>
              <span
                className={m.activity ? 'ag-shimmer' : ''}
                style={{
                  flex: 1,
                  minWidth: 0,
                  lineHeight: '20px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'var(--ag-fg-muted, #5d676f)',
                }}
                title={m.activity || ''}
              >
                {m.activity || (isZh ? '工作中…' : 'Working…')}
              </span>
              {typeof m.steps_count === 'number' && m.steps_count > 0 && (
                <span style={{ fontFamily: 'var(--ag-mono, monospace)', fontSize: 11, lineHeight: '20px', color: 'var(--ag-fg-faint, #9da5ab)' }}>
                  {isZh ? `${m.steps_count} 步` : `${m.steps_count}s`}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : allWorkers.length > 0 ? (
        <div style={{ fontSize: 11.5, color: 'var(--ag-fg-muted, #5d676f)', lineHeight: '20px' }}>
          {isZh ? '等待子代理唤醒…' : 'Waiting for workers to wake…'}
        </div>
      ) : null}

      {recentPosts.length > 0 && (
        <div style={{ borderTop: '1px solid var(--ag-line, rgba(128,128,128,0.12))', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {recentPosts.map((msg) => (
            <div key={msg.seq} style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--ag-fg-muted, #5d676f)', minWidth: 0 }}>
              <span style={{ fontFamily: 'var(--ag-mono, monospace)', flex: 'none' }}>#{msg.seq} @{msg.agent}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.text.slice(0, 120)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
