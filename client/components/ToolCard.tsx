import { useState } from 'react'
import { PixelBee } from '../bee-sprites'
import { t, useUiLocale } from '../i18n'

interface ToolCardProps {
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

interface ParsedSwarmInput {
  action?: string
  name?: string
  model?: string
  provider?: string
  reasoning_effort?: string
  role_preset?: string
  workspace?: string
  fork?: string
  n?: number
  tasks?: unknown[]
  title?: string
  brief?: string
  channel?: string
  topic?: string
  text?: string
  since?: number
  all?: boolean
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null
    } catch {
      return null
    }
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function extractInput(props: ToolCardProps): ParsedSwarmInput {
  if (props.toolCall?.input !== undefined) {
    return (asRecord(props.toolCall.input) ?? {}) as ParsedSwarmInput
  }
  const block = props.block
  if (block) {
    const raw = block.call?.argsRaw ?? block.argsRaw
    return (asRecord(raw) ?? {}) as ParsedSwarmInput
  }
  return {}
}

function extractOutputText(props: ToolCardProps): string {
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

function resolveStatus(props: ToolCardProps): 'running' | 'ok' | 'error' {
  const st = props.toolCall?.status?.toLowerCase()
  if (st === 'error' || st === 'failed' || props.block?.isError) return 'error'
  if (st === 'running' || st === 'pending' || st === 'in_progress') return 'running'
  if (props.block && !('kind' in props.block) && !props.toolCall?.output) return 'running'
  return 'ok'
}

function actionLabel(action: string | undefined, isZh: boolean): string {
  switch (action) {
    case 'add': return isZh ? '派发子代理' : 'Spawn worker'
    case 'status': return isZh ? '查看蜂群状态' : 'Swarm status'
    case 'models': return isZh ? '查询模型目录' : 'List models'
    case 'model': return isZh ? '切换模型' : 'Switch model'
    case 'kill': return isZh ? '终止成员' : 'Retire worker'
    case 'title': return isZh ? '设置蜂群标题' : 'Set swarm title'
    case 'channel': return isZh ? '频道操作' : 'Channel ops'
    default: return action ? t('tool.title', { action }) : (isZh ? '蜂群调度' : 'Swarm action')
  }
}

export function ToolCard(props: ToolCardProps): JSX.Element {
  const locale = useUiLocale()
  const isZh = locale === 'zh-CN'
  const [expanded, setExpanded] = useState(false)
  const [showFullDetails, setShowFullDetails] = useState(false)
  const input = extractInput(props)
  const outputText = extractOutputText(props)
  const status = resolveStatus(props)

  const action = input.action
  const workerName = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : ''
  const tasksCount = Array.isArray(input.tasks) ? input.tasks.length : 0
  const copies = typeof input.n === 'number' && input.n > 1 ? input.n : 0
  const beeName = workerName || 'coordinator'
  const beeRole = workerName ? 'worker' : 'coordinator'

  const tags: string[] = []
  if (workerName) {
    if (tasksCount > 0) tags.push(`@${workerName}-1..${tasksCount}`)
    else if (copies > 1) tags.push(`@${workerName}-1..${copies}`)
    else tags.push(`@${workerName}`)
  }
  if (input.role_preset) tags.push(`role:${input.role_preset}`)
  if (input.model) tags.push(input.provider ? `${input.provider}/${input.model}` : input.model)
  if (input.reasoning_effort) tags.push(`effort:${input.reasoning_effort}`)
  if (input.workspace) tags.push(`workspace:${input.workspace}`)
  if (input.fork) tags.push(`fork:${input.fork}`)
  if (input.channel) tags.push(`#${input.channel}`)
  if (tasksCount > 0) tags.push(isZh ? `${tasksCount} 分片` : `${tasksCount} shards`)
  if (input.all) tags.push(isZh ? '全部模型' : 'all models')

  const preview = input.title || input.brief || input.topic || input.text || ''
  const statusColor = status === 'error'
    ? 'var(--ag-error, #cb3d3d)'
    : status === 'running'
      ? 'var(--ag-primary, #007acc)'
      : 'var(--ag-success, #63984f)'

  return (
    <div
      className="ag-toolcard"
      data-testid="swarm-tool-card"
      style={{
        border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
        borderRadius: 'var(--ag-r-lg, 8px)',
        background: 'var(--ag-card, #ffffff)',
        padding: '8px 10px',
        fontSize: 'var(--ag-text-xs, 12px)',
        color: 'var(--ag-fg, inherit)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <PixelBee name={beeName} role={beeRole} state={status === 'running' ? 'working' : 'landed'} size={1} />
        <span style={{ fontWeight: 600, fontSize: 'var(--ag-text-sm, 13px)' }}>{actionLabel(action, isZh)}</span>
        <span
          className={`ag-tc-status ag-tc-${status}`}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '11px',
            fontWeight: 500,
            color: statusColor,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
          {status === 'running'
            ? (isZh ? '执行中' : 'Running')
            : status === 'error'
              ? (isZh ? '出错' : 'Error')
              : (isZh ? '已完成' : 'Done')}
        </span>
      </div>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {tags.map((tag) => (
            <span
              key={tag}
              className="ag-mtag"
              style={{
                fontSize: 11,
                lineHeight: '18px',
                padding: '0 6px',
                borderRadius: 999,
                background: 'var(--ag-fill, rgba(128,128,128,0.08))',
                color: 'var(--ag-fg-2, inherit)',
                fontFamily: 'var(--ag-mono, monospace)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {preview && (
        <div
          style={{
            marginTop: 6,
            color: 'var(--ag-fg-muted, #5d676f)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {preview}
        </div>
      )}
      {(outputText || Object.keys(input).length > 0) && (
        <div style={{ marginTop: 6 }}>
          <button
            type="button"
            className="ag-ghost-btn"
            onClick={() => setExpanded((v) => !v)}
            style={{
              border: 0,
              background: 'transparent',
              padding: '2px 4px',
              fontSize: 11,
              color: 'var(--ag-fg-muted, #5d676f)',
              cursor: 'pointer',
            }}
          >
            {expanded ? t('tool.hideDetails') : t('tool.showDetails')}
          </button>
          {expanded && (() => {
            let formatted = outputText || JSON.stringify(input, null, 2)
            if (outputText) {
              try {
                const parsedOut: unknown = JSON.parse(outputText)
                if (parsedOut && typeof parsedOut === 'object') formatted = JSON.stringify(parsedOut, null, 2)
              } catch { /* plain text */ }
            }
            const MAX_DETAIL = 3000
            const truncated = !showFullDetails && formatted.length > MAX_DETAIL
            const shownText = truncated ? `${formatted.slice(0, MAX_DETAIL)}…` : formatted
            return (
              <div>
                <pre
                  style={{
                    marginTop: 4,
                    maxHeight: 240,
                    overflow: 'auto',
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: 'var(--ag-fill, rgba(128,128,128,0.08))',
                    fontSize: 11,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {shownText}
                </pre>
                {(truncated || showFullDetails) && (
                  <button
                    type="button"
                    className="ag-ghost-btn"
                    onClick={() => setShowFullDetails((v) => !v)}
                    style={{ marginTop: 4, height: 20, padding: '0 4px', fontSize: 11 }}
                  >
                    {showFullDetails
                      ? t('common.showLess')
                      : (isZh ? `显示全部 (共 ${formatted.length} 字符)` : `Show full (${formatted.length} chars)`)}
                  </button>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
