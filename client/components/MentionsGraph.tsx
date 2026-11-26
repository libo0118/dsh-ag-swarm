import { useEffect, useMemo, useRef, useState } from 'react'
import type { BoardMessage, MemberRecord, SwarmSnapshotPayload } from '../../src/shared/protocol'
import { getBeeDataUrl } from '../bee-sprites'
import { t, useUiLocale } from '../i18n'

export interface GraphNodeInfo {
  id: string
  row: number
  member: MemberRecord | null
}

export interface NodePos {
  x: number
  y: number
  w: number
  h: number
}

export interface GraphEdgeAgg {
  direct: number
  viaAll: number
}

export interface GraphLayoutState {
  nodes: GraphNodeInfo[]
  pos: Map<string, NodePos>
  height: number
  edges: Map<string, GraphEdgeAgg>
  unaddressed: Map<string, number>
  broadcasts: Map<string, number>
  current: BoardMessage | null
  curTargets: Set<string>
  max: number
  isActive: (id: string) => boolean
  isCur: (from: string, to: string) => boolean
  replaying: boolean
  upto: number
}

export interface EdgeGeom {
  d: string
  start: { x: number; y: number }
  mx: number
  my: number
  end: { x: number; y: number }
}

export interface MentionsGraphProps {
  snapshot: SwarmSnapshotPayload
  messages: BoardMessage[]
  replaying: boolean
  upto: number
  expandAll: boolean
  hideInactive: boolean
  onJumpToSeq: (seq: number) => void
}

function isRoleWorker(name: string, members: Record<string, MemberRecord>): boolean {
  const m = members[name]
  if (m && m.role === 'monitor') return true
  return /^(?:narrator|monitor)(?:-\d+)?$/i.test(name)
}

function pillWidth(id: string, maxW: number): number {
  const full = Math.max(76, 54 + Math.ceil(String(id).length * 6.8))
  return id === 'coordinator' ? full : Math.min(maxW, full)
}

function layoutNodes(nodes: GraphNodeInfo[], width: number): { pos: Map<string, NodePos>; height: number } {
  const nodeH = 28
  if (nodes.length <= 16) {
    const pos = new Map<string, NodePos>()
    const n = Math.max(1, nodes.length)
    const w = Math.min(162, Math.max(116, width / Math.max(4, Math.ceil(n / 2) + 1) - 10))
    const rx = Math.max(60, width / 2 - w / 2 - 14)
    const ry = n <= 2 ? 60 : Math.min(220, Math.max(110, n * 20))
    const cx = width / 2
    const cy = ry + nodeH / 2 + 20
    nodes.forEach((node, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n
      pos.set(node.id, {
        x: cx + rx * Math.cos(a),
        y: cy + ry * Math.sin(a),
        w: pillWidth(node.id, w),
        h: nodeH,
      })
    })
    return { pos, height: cy + ry + nodeH / 2 + 20 }
  }

  const rows = new Map<number, GraphNodeInfo[]>()
  for (const n of nodes) {
    const list = rows.get(n.row) ?? []
    list.push(n)
    rows.set(n.row, list)
  }
  const pos = new Map<string, NodePos>()
  const minNodeW = 114
  const lineH = 64
  const rowGap = 40
  const perLine = Math.max(1, Math.floor(width / (minNodeW + 12)))
  let y = 32
  for (const [, list] of [...rows.entries()].sort((a, b) => a[0] - b[0])) {
    for (let i = 0; i < list.length; i += perLine) {
      const line = list.slice(i, i + perLine)
      const gap = width / (line.length + 1)
      const w = Math.min(158, Math.max(minNodeW, gap - 12))
      line.forEach((n, j) => {
        pos.set(n.id, {
          x: gap * (j + 1),
          y: y + (line.length > 3 && j % 2 ? 14 : 0),
          w: pillWidth(n.id, Math.min(w, gap - 8)),
          h: nodeH,
        })
      })
      y += lineH
    }
    y += rowGap
  }
  return { pos, height: Math.max(160, y - rowGap + 14) }
}

export function computeEdgeGeom(a: NodePos, b: NodePos): EdgeGeom {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const bend = 24
  const mx = (a.x + b.x) / 2 + nx * bend
  const my = (a.y + b.y) / 2 + ny * bend

  const trim = (p: NodePos, q: { x: number; y: number }): { x: number; y: number } => {
    const tx = q.x - p.x
    const ty = q.y - p.y
    const l = Math.hypot(tx, ty) || 1
    const ux = tx / l
    const uy = ty / l
    const toBorder = Math.min(
      ux ? p.w / 2 / Math.abs(ux) : Infinity,
      uy ? p.h / 2 / Math.abs(uy) : Infinity,
    )
    const t = Math.min(0.45 * l, toBorder + 4)
    return { x: p.x + ux * t, y: p.y + uy * t }
  }

  const start = trim(a, { x: mx, y: my })
  const end = trim(b, { x: mx, y: my })
  return {
    d: `M${start.x.toFixed(1)},${start.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${end.x.toFixed(1)},${end.y.toFixed(1)}`,
    start,
    mx,
    my,
    end,
  }
}

function messageTargets(
  m: BoardMessage,
  expandAll: boolean,
  members: Record<string, MemberRecord>,
  channels: SwarmSnapshotPayload['channels'],
): { direct: Set<string>; viaAll: Set<string> } {
  if (isRoleWorker(m.agent, members)) return { direct: new Set(), viaAll: new Set() }
  const direct = new Set<string>()
  for (const target of m.mentions || []) {
    if (target !== m.agent && !isRoleWorker(target, members)) direct.add(target)
  }
  for (const chName of m.channel_mentions || []) {
    const ch = channels?.[chName]
    if (ch && !ch.archived) {
      for (const sub of ch.subscribers || []) {
        if (sub !== m.agent && !isRoleWorker(sub, members)) direct.add(sub)
      }
    }
  }
  const viaAll = new Set<string>()
  if (m.is_all && expandAll) {
    for (const mem of Object.values(members)) {
      if (mem.name !== m.agent && !direct.has(mem.name) && !isRoleWorker(mem.name, members)) {
        viaAll.add(mem.name)
      }
    }
  }
  return { direct, viaAll }
}

export function computeGraphState(
  snapshot: SwarmSnapshotPayload,
  messages: BoardMessage[],
  opts: { replaying: boolean; upto: number; expandAll: boolean; hideInactive: boolean; width: number },
): GraphLayoutState {
  const members = snapshot.members || {}
  const channels = snapshot.channels || {}
  const memberList = Object.values(members).filter((m) => !isRoleWorker(m.name, members))
  const memberNames = new Set(memberList.map((m) => m.name))
  const outsiders = [...new Set(messages.map((m) => m.agent))].filter(
    (n) => !memberNames.has(n) && !isRoleWorker(n, members),
  )

  const allNodes: GraphNodeInfo[] = [
    ...memberList
      .sort((a, b) => (a.role === 'coordinator' ? -1 : b.role === 'coordinator' ? 1 : a.name.localeCompare(b.name)))
      .map((m) => ({ id: m.name, row: m.role === 'coordinator' ? 0 : 1, member: m })),
    ...outsiders.map((n) => ({ id: n, row: 2, member: null })),
  ]

  const active = new Set<string>(['coordinator'])
  const edges = new Map<string, GraphEdgeAgg>()
  const unaddressed = new Map<string, number>()
  const broadcasts = new Map<string, number>()

  const bump = (k: string, field: 'direct' | 'viaAll'): void => {
    const e = edges.get(k) ?? { direct: 0, viaAll: 0 }
    e[field]++
    edges.set(k, e)
  }

  const limit = Math.max(0, Math.min(opts.upto, messages.length))
  for (let i = 0; i < limit; i++) {
    const m = messages[i]
    if (isRoleWorker(m.agent, members)) continue
    active.add(m.agent)
    const { direct, viaAll } = messageTargets(m, opts.expandAll, members, channels)
    if (m.is_all) broadcasts.set(m.agent, (broadcasts.get(m.agent) ?? 0) + 1)
    if (!direct.size && !viaAll.size && !m.is_all) {
      unaddressed.set(m.agent, (unaddressed.get(m.agent) ?? 0) + 1)
    }
    for (const t of direct) {
      active.add(t)
      bump(`${m.agent}>${t}`, 'direct')
    }
    for (const t of viaAll) {
      if (!opts.hideInactive) active.add(t)
      bump(`${m.agent}>${t}`, 'viaAll')
    }
  }

  const current = opts.replaying && limit > 0 ? messages[limit - 1] : null
  const currentDirect = current
    ? new Set<string>([current.agent, ...messageTargets(current, false, members, channels).direct])
    : new Set<string>()
  const nodes = opts.hideInactive
    ? allNodes.filter((n) => currentDirect.has(n.id) || (active.has(n.id) && !(n.member?.killed || n.member?.state === 'killed')))
    : allNodes

  const { pos, height } = layoutNodes(nodes, Math.max(320, opts.width))
  const isActive = (id: string): boolean => !opts.replaying || active.has(id)
  let curTargets = new Set<string>()
  if (current) {
    const { direct, viaAll } = messageTargets(current, opts.expandAll, members, channels)
    curTargets = new Set([...direct, ...viaAll])
  }
  const isCur = (from: string, to: string): boolean => Boolean(current && from === current.agent && curTargets.has(to))

  let max = 1
  for (const [k, e] of edges) {
    const [from, to] = k.split('>')
    if (pos.has(from) && pos.has(to)) {
      const total = e.direct + e.viaAll
      if (total > max) max = total
    }
  }

  return {
    nodes,
    pos,
    height,
    edges,
    unaddressed,
    broadcasts,
    current,
    curTargets,
    max,
    isActive,
    isCur,
    replaying: opts.replaying,
    upto: limit,
  }
}

export function MentionsGraph(props: MentionsGraphProps): JSX.Element {
  const { snapshot, messages, replaying, upto, expandAll, hideInactive, onJumpToSeq } = props
  const locale = useUiLocale()
  const isZh = locale === 'zh-CN'
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [width, setWidth] = useState(640)
  const lastAnimatedSeqRef = useRef<number | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const w = Math.floor(el.clientWidth)
      if (w >= 200) setWidth(w)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const g = useMemo(
    () => computeGraphState(snapshot, messages, { replaying, upto, expandAll, hideInactive, width }),
    [snapshot, messages, replaying, upto, expandAll, hideInactive, width],
  )

  const animateCur = Boolean(g.current && g.current.seq !== lastAnimatedSeqRef.current)
  useEffect(() => {
    lastAnimatedSeqRef.current = g.current ? g.current.seq : null
    if (!svgRef.current) return
    const anims = svgRef.current.querySelectorAll<SVGAnimateMotionElement>('.ag-dot-anim')
    anims.forEach((a) => {
      try {
        (a as unknown as { beginElement?: () => void }).beginElement?.()
      } catch {
        // SMIL unsupported
      }
    })
  }, [g.current?.seq])

  const edgeEntries = useMemo(() => {
    const items: Array<{
      key: string
      id: string
      from: string
      to: string
      direct: number
      viaAll: number
      total: number
      geom: EdgeGeom
      strokeW: number
      cur: boolean
    }> = []
    let curIdx = 0
    for (const [key, e] of g.edges) {
      const [from, to] = key.split('>')
      const a = g.pos.get(from)
      const b = g.pos.get(to)
      if (!a || !b) continue
      const total = e.direct + e.viaAll
      const cur = g.isCur(from, to)
      items.push({
        key,
        id: cur ? `ag-cur-edge-${curIdx++}` : '',
        from,
        to,
        direct: e.direct,
        viaAll: e.viaAll,
        total,
        geom: computeEdgeGeom(a, b),
        strokeW: 1 + (3 * total) / g.max,
        cur,
      })
    }
    return items
  }, [g])

  const lastSeqByAgent = useMemo(() => {
    const map = new Map<string, number>()
    for (const m of messages) {
      map.set(m.agent, m.seq)
    }
    return map
  }, [messages])

  return (
    <div ref={wrapRef} className="ag-graph-wrap" style={{ width: '100%' }}>
      <svg
        ref={svgRef}
        className="ag-graph"
        data-testid="swarm-graph"
        viewBox={`0 0 ${width} ${g.height}`}
        style={{ width: '100%', height: `${g.height}px`, display: 'block', fontFamily: 'var(--ag-font, sans-serif)' }}
        role="img"
        aria-label="Member @mention directed graph"
      >
        <defs>
          <marker
            id="ag-arrow"
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M1,1.2 L9,5 L1,8.8 Q2.6,5 1,1.2 z" fill="color-mix(in srgb, var(--ag-fg, #1d1f21) 45%, transparent)" />
          </marker>
        </defs>

        {edgeEntries.map((item) => {
          const isViaAll = item.direct === 0
          const opacity = item.cur ? 0.85 : g.replaying ? 0.12 : isViaAll ? 0.18 : 0.28
          return (
            <path
              key={item.key}
              id={item.id || undefined}
              className={`ag-edge${isViaAll ? ' via-all' : ''}${item.cur ? ' cur' : ''}`}
              d={item.geom.d}
              fill="none"
              stroke="var(--ag-fg, #1d1f21)"
              strokeWidth={item.strokeW.toFixed(2)}
              strokeLinecap="round"
              strokeDasharray={isViaAll ? '4 4' : undefined}
              strokeOpacity={opacity}
              markerEnd="url(#ag-arrow)"
            >
              <title>
                {`${item.from} → ${item.to}: ${item.direct} direct${item.viaAll ? `, ${item.viaAll} via @all` : ''}`}
              </title>
            </path>
          )
        })}

        {g.nodes.map((node) => {
          const p = g.pos.get(node.id)
          if (!p) return null
          const mem = node.member
          const state = mem?.killed ? 'killed' : mem?.state ?? ''
          const beeSrc = getBeeDataUrl(node.id, mem?.role, state === 'killed' ? 'landed' : 'landed')
          const beeX = p.x - p.w / 2 + 8
          const dotX = beeSrc ? beeX + 22 : p.x - p.w / 2 + 14
          const dotY = beeSrc ? p.y - 7 : p.y
          const labelX = beeSrc ? beeX + 28 : state ? dotX + 9 : p.x - p.w / 2 + 12
          const maxChars = Math.max(4, Math.floor((p.x + p.w / 2 - 10 - labelX) / 6.8))
          const label = node.id.length > maxChars ? `${node.id.slice(0, maxChars - 1)}…` : node.id
          const hot = Boolean(g.current && (node.id === g.current.agent || g.curTargets.has(node.id)))
          const ring = g.unaddressed.get(node.id) ?? 0
          const bcast = expandAll ? 0 : g.broadcasts.get(node.id) ?? 0
          const bw = 30 + 6 * String(bcast).length
          const killed = state === 'killed'
          const inactive = !g.isActive(node.id)
          const jumpSeq = mem?.last_post_seq ?? lastSeqByAgent.get(node.id)

          return (
            <g
              key={node.id}
              className={`ag-node${inactive ? ' inactive' : ''}${hot ? ' hot' : ''}${killed ? ' killed' : ''}`}
              style={{ cursor: jumpSeq ? 'pointer' : 'default', opacity: inactive ? 0.2 : 1, transition: 'opacity 0.25s ease' }}
              onClick={() => {
                if (jumpSeq) onJumpToSeq(jumpSeq)
              }}
            >
              <title>
                {mem
                  ? `@${node.id} · ${mem.role}${mem.model_display_name ? ` · ${mem.model_display_name}` : ''} · ${state}${ring ? ` · ${ring} unaddressed` : ''}${bcast ? ` · ${bcast} @all` : ''}`
                  : `@${node.id} (off-roster)`}
              </title>
              {ring > 0 && (
                <rect
                  x={p.x - p.w / 2 - 4}
                  y={p.y - p.h / 2 - 4}
                  width={p.w + 8}
                  height={p.h + 8}
                  rx={p.h / 2 + 4}
                  fill="none"
                  stroke="color-mix(in srgb, var(--ag-fg, #1d1f21) 30%, transparent)"
                  strokeDasharray="2 2.5"
                  strokeWidth={1}
                />
              )}
              <rect
                x={p.x - p.w / 2}
                y={p.y - p.h / 2}
                width={p.w}
                height={p.h}
                rx={p.h / 2}
                fill={hot ? 'var(--ag-fill, rgba(128,128,128,0.1))' : 'var(--ag-bg, #f7f7f8)'}
                stroke={hot ? 'var(--ag-fg, #1d1f21)' : 'color-mix(in srgb, var(--ag-fg, #1d1f21) 22%, transparent)'}
                strokeWidth={hot ? 1.5 : 1}
                strokeDasharray={!mem ? '3 2' : killed ? '2 2' : undefined}
              />
              {beeSrc && (
                <image
                  href={beeSrc}
                  x={beeX}
                  y={p.y - 9}
                  width={22}
                  height={18}
                  style={{
                    imageRendering: 'pixelated',
                    filter: killed ? 'grayscale(1)' : undefined,
                    opacity: killed ? 0.5 : 1,
                  }}
                />
              )}
              {state && (
                <circle
                  cx={dotX}
                  cy={dotY}
                  r={beeSrc ? 3 : 3.25}
                  fill={state === 'working' ? 'var(--ag-success, #63984f)' : state === 'killed' ? 'var(--ag-fg-faint, #9da5ab)' : 'none'}
                  stroke={state === 'waiting' || state === 'stopped' ? 'var(--ag-fg-faint, #9da5ab)' : 'none'}
                  strokeWidth={1.5}
                />
              )}
              <text
                x={labelX}
                y={p.y + 4}
                fill={killed ? 'var(--ag-fg-muted, #5d676f)' : 'var(--ag-fg, #1d1f21)'}
                fontSize={12}
                fontWeight={500}
                textDecoration={killed ? 'line-through' : undefined}
              >
                {label}
              </text>
              {bcast > 0 && (
                <g>
                  <rect
                    x={p.x + p.w / 2 - bw + 6}
                    y={p.y - p.h / 2 - 7}
                    width={bw}
                    height={14}
                    rx={7}
                    fill="var(--ag-bg, #f7f7f8)"
                    stroke="color-mix(in srgb, var(--ag-fg, #1d1f21) 18%, transparent)"
                    strokeWidth={1}
                  />
                  <text
                    x={p.x + p.w / 2 - bw / 2 + 6}
                    y={p.y - p.h / 2 + 3}
                    textAnchor="middle"
                    fill="var(--ag-fg-muted, #5d676f)"
                    fontSize={9}
                    fontWeight={600}
                  >
                    @all {bcast}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {edgeEntries
          .filter((item) => item.total > 1)
          .map((item) => (
            <text
              key={`cnt-${item.key}`}
              x={item.geom.mx}
              y={item.geom.my + 3}
              textAnchor="middle"
              fontSize={10}
              fontWeight={500}
              fill="var(--ag-fg-muted, #5d676f)"
              stroke="var(--ag-bg, #f7f7f8)"
              strokeWidth={4}
              strokeLinejoin="round"
              style={{ paintOrder: 'stroke' }}
            >
              {item.total}
            </text>
          ))}

        {edgeEntries
          .filter((item) => Boolean(item.id))
          .map((item) =>
            animateCur ? (
              <circle
                key={`dot-${item.id}-${g.current?.seq}`}
                r={4.5}
                fill="var(--ag-fg, #1d1f21)"
                stroke="var(--ag-bg, #f7f7f8)"
                strokeWidth={2}
              >
                <animateMotion className="ag-dot-anim" dur="0.9s" begin="indefinite" fill="freeze">
                  <mpath href={`#${item.id}`} />
                </animateMotion>
              </circle>
            ) : (
              <circle
                key={`dot-static-${item.id}`}
                r={4.5}
                cx={item.geom.end.x}
                cy={item.geom.end.y}
                fill="var(--ag-fg, #1d1f21)"
                stroke="var(--ag-bg, #f7f7f8)"
                strokeWidth={2}
              />
            ),
          )}
      </svg>

      <div
        className="ag-graph-legend"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 16px',
          marginTop: 8,
          fontSize: 11,
          color: 'var(--ag-fg-muted, #5d676f)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden="true">
            <line x1="0" y1="4" x2="17" y2="4" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="15,1 22,4 15,7" fill="currentColor" />
          </svg>
          {t('graph.legendDirect')}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden="true">
            <line x1="0" y1="4" x2="17" y2="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
            <polygon points="15,1 22,4 15,7" fill="currentColor" />
          </svg>
          {t('graph.legendAll')}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden="true">
            <rect x="1" y="1" width="14" height="8" rx="4" fill="none" stroke="currentColor" strokeDasharray="2 2" />
          </svg>
          {t('graph.legendUnaddressed')}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ padding: '0 5px', borderRadius: 999, fontSize: 9, fontWeight: 600, background: 'var(--ag-fill, rgba(128,128,128,0.1))' }}>
            @all N
          </span>
          {isZh ? '@all 广播次数' : 'Broadcast count'}
        </span>
      </div>
    </div>
  )
}
