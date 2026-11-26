import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BoardMessage, MemberRecord, SwarmSnapshotPayload } from '../../src/shared/protocol'
import { createGifEncoder } from '../gif-encoder'
import { HiveCanvas } from './HiveCanvas'
import { MentionsGraph, computeEdgeGeom, computeGraphState, type GraphLayoutState } from './MentionsGraph'

export interface GraphTabProps {
  snapshot: SwarmSnapshotPayload
  onJumpToSeq: (seq: number) => void
}

type GraphViewMode = 'hive' | 'mentions'
type PacingMode = 'even' | 'realtime'

const SPEEDS = [0.5, 1, 2, 4, 8] as const

function msgMs(m: BoardMessage | undefined): number {
  if (!m) return 0
  if (Number.isFinite(m.ts) && m.ts > 0) return m.ts
  const parsed = Date.parse(m.time.replace(' ', 'T'))
  return Number.isFinite(parsed) ? parsed : 0
}

function fmtDur(ms: number): string {
  const s = Math.max(0, Math.round((ms || 0) / 1000))
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`
}

function fmtClock(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return ''
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function computeStepDelay(all: BoardMessage[], idx: number, pacing: PacingMode, speed: number): number {
  if (pacing === 'even' || idx <= 0 || idx >= all.length) {
    return 1400 / speed
  }
  const gap = Math.max(0, msgMs(all[idx]) - msgMs(all[idx - 1]))
  return Math.min(4000, Math.max(250, gap / 60 / speed))
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

function fitCanvasText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  const s = String(text || '')
  if (maxW <= 0) return ''
  if (ctx.measureText(s).width <= maxW) return s
  const ell = '…'
  const ellW = ctx.measureText(ell).width
  let lo = 0
  let hi = s.length
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1
    if (ctx.measureText(s.slice(0, mid)).width + ellW <= maxW) lo = mid
    else hi = mid - 1
  }
  return lo > 0 ? s.slice(0, lo) + ell : ''
}

interface GifTheme {
  bg: string
  fg: string
  fg2: string
  muted: string
  faint: string
  fill: string
  line: string
  track: string
  success: string
  nodeBorder: string
  ringStroke: string
  bcastBorder: string
  arrow: string
  font: string
}

function resolveCanvasTheme(): GifTheme {
  const probe = document.createElement('span')
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
  document.documentElement.appendChild(probe)
  const read = (expr: string, fallback: string): string => {
    probe.style.color = ''
    probe.style.color = expr
    return getComputedStyle(probe).color || fallback
  }
  const fallbackFont = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  probe.style.fontFamily = `var(--ag-font, ${fallbackFont})`
  const computedFont = getComputedStyle(probe).fontFamily
  const font = computedFont && !computedFont.includes('var(') ? computedFont : fallbackFont
  const theme: GifTheme = {
    bg: read('var(--ag-bg, #f7f7f8)', '#f7f7f8'),
    fg: read('var(--ag-fg, #1d1f21)', '#1d1f21'),
    fg2: read('var(--ag-fg-2, #3d4348)', '#3d4348'),
    muted: read('var(--ag-fg-muted, #5d676f)', '#5d676f'),
    faint: read('var(--ag-fg-faint, #9da5ab)', '#9da5ab'),
    fill: read('var(--ag-fill, rgba(29,31,33,0.06))', 'rgba(29,31,33,0.06)'),
    line: read('var(--ag-line, rgba(29,31,33,0.08))', 'rgba(29,31,33,0.08)'),
    track: read('color-mix(in srgb, var(--ag-fg, #1d1f21) 12%, transparent)', 'rgba(29,31,33,0.12)'),
    success: read('var(--ag-success, #63984f)', '#63984f'),
    nodeBorder: read('color-mix(in srgb, var(--ag-fg, #1d1f21) 22%, transparent)', 'rgba(29,31,33,0.22)'),
    ringStroke: read('color-mix(in srgb, var(--ag-fg, #1d1f21) 30%, transparent)', 'rgba(29,31,33,0.30)'),
    bcastBorder: read('color-mix(in srgb, var(--ag-fg, #1d1f21) 18%, transparent)', 'rgba(29,31,33,0.18)'),
    arrow: read('color-mix(in srgb, var(--ag-fg, #1d1f21) 45%, transparent)', 'rgba(29,31,33,0.45)'),
    font,
  }
  probe.remove()
  return theme
}

function drawGraphGifFrame(
  ctx: CanvasRenderingContext2D,
  opts: {
    width: number
    height: number
    headerH: number
    footerH: number
    graphOffsetY: number
    scale: number
    theme: GifTheme
    title: string
    g: GraphLayoutState
    expandAll: boolean
    totalPosts: number
    memberCount: number
    totalDurMs: number
    dotT: number | null
    stepLabel: string
    isOverview: boolean
  },
): void {
  const {
    width, height, headerH, footerH, graphOffsetY, scale, theme, title, g,
    expandAll, totalPosts, memberCount, totalDurMs, dotT, stepLabel, isOverview,
  } = opts
  ctx.save()
  ctx.scale(scale, scale)
  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, width, height)

  const padX = 16
  ctx.font = `500 11px ${theme.font}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'right'
  ctx.fillStyle = theme.muted
  const stepW = ctx.measureText(stepLabel).width
  ctx.fillText(stepLabel, width - padX, headerH / 2)

  ctx.font = `600 13px ${theme.font}`
  ctx.textAlign = 'left'
  ctx.fillStyle = theme.fg
  ctx.fillText(fitCanvasText(ctx, title, Math.max(40, width - padX * 2 - stepW - 14)), padX, headerH / 2)

  ctx.strokeStyle = theme.line
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, headerH - 0.5)
  ctx.lineTo(width, headerH - 0.5)
  ctx.stroke()

  ctx.save()
  ctx.translate(0, graphOffsetY)
  const countLabels: Array<{ x: number; y: number; text: string }> = []
  const movingDots: Array<ReturnType<typeof computeEdgeGeom>> = []

  for (const [k, e] of g.edges) {
    const [from, to] = k.split('>')
    const a = g.pos.get(from)
    const b = g.pos.get(to)
    if (!a || !b) continue
    const n = e.direct + e.viaAll
    const geom = computeEdgeGeom(a, b)
    const w = 1 + (3 * n) / g.max
    const cur = g.isCur(from, to)

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(geom.start.x, geom.start.y)
    ctx.quadraticCurveTo(geom.mx, geom.my, geom.end.x, geom.end.y)
    ctx.strokeStyle = theme.fg
    ctx.lineWidth = w
    ctx.lineCap = 'round'
    if (!e.direct) ctx.setLineDash([4, 4])
    ctx.globalAlpha = cur ? 0.85 : g.replaying ? 0.12 : e.direct ? 0.28 : 0.18
    ctx.stroke()
    ctx.restore()

    const ang = Math.atan2(geom.end.y - geom.my, geom.end.x - geom.mx)
    ctx.save()
    ctx.translate(geom.end.x, geom.end.y)
    ctx.rotate(ang)
    ctx.beginPath()
    ctx.moveTo(-6, -3)
    ctx.lineTo(0.4, 0)
    ctx.lineTo(-6, 3)
    ctx.quadraticCurveTo(-4.7, 0, -6, -3)
    ctx.closePath()
    ctx.fillStyle = cur ? theme.fg : theme.arrow
    ctx.globalAlpha = cur ? 0.85 : g.replaying ? 0.4 : 1
    ctx.fill()
    ctx.restore()

    if (n > 1) countLabels.push({ x: geom.mx, y: geom.my, text: String(n) })
    if (cur && dotT !== null) movingDots.push(geom)
  }

  for (const n of g.nodes) {
    const p = g.pos.get(n.id)
    if (!p) continue
    const status = n.member?.killed ? 'killed' : n.member?.state ?? ''
    const dotX = p.x - p.w / 2 + 14
    const labelX = status ? dotX + 9 : p.x - p.w / 2 + 12
    const maxChars = Math.max(4, Math.floor((p.x + p.w / 2 - 10 - labelX) / 6.8))
    const label = n.id.length > maxChars ? `${n.id.slice(0, maxChars - 1)}…` : n.id
    const hot = Boolean(g.current && (n.id === g.current.agent || g.curTargets.has(n.id)))
    const ring = g.unaddressed.get(n.id) ?? 0
    const bcast = expandAll ? 0 : g.broadcasts.get(n.id) ?? 0
    const killed = status === 'killed'
    const outsider = !n.member

    ctx.save()
    if (!g.isActive(n.id)) ctx.globalAlpha = 0.2
    if (ring > 0) {
      ctx.save()
      roundRectPath(ctx, p.x - p.w / 2 - 4, p.y - p.h / 2 - 4, p.w + 8, p.h + 8, p.h / 2 + 4)
      ctx.strokeStyle = theme.ringStroke
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2.5])
      ctx.stroke()
      ctx.restore()
    }

    roundRectPath(ctx, p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, p.h / 2)
    ctx.fillStyle = theme.bg
    ctx.fill()
    if (hot) {
      ctx.fillStyle = theme.fill
      ctx.fill()
    }
    ctx.save()
    ctx.strokeStyle = hot ? theme.fg : theme.nodeBorder
    ctx.lineWidth = hot ? 1.5 : 1
    if (outsider) ctx.setLineDash([3, 2])
    else if (killed) ctx.setLineDash([2, 2])
    ctx.stroke()
    ctx.restore()

    if (status) {
      ctx.beginPath()
      ctx.arc(dotX, p.y, 3.25, 0, Math.PI * 2)
      if (status === 'working') {
        ctx.fillStyle = theme.success
        ctx.fill()
      } else if (status === 'waiting' || status === 'stopped') {
        ctx.strokeStyle = theme.faint
        ctx.lineWidth = 1.5
        ctx.stroke()
      } else if (status === 'killed') {
        ctx.fillStyle = theme.faint
        ctx.fill()
      }
    }

    ctx.font = `500 12px ${theme.font}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = killed ? theme.muted : theme.fg
    ctx.fillText(label, labelX, p.y + 0.5)
    if (killed) {
      const tw = ctx.measureText(label).width
      ctx.strokeStyle = theme.muted
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(labelX, p.y + 0.5)
      ctx.lineTo(labelX + tw, p.y + 0.5)
      ctx.stroke()
    }

    if (bcast > 0) {
      const bw = 30 + 6 * String(bcast).length
      const bx = p.x + p.w / 2 - bw + 6
      const by = p.y - p.h / 2 - 7
      roundRectPath(ctx, bx, by, bw, 14, 7)
      ctx.fillStyle = theme.bg
      ctx.fill()
      ctx.strokeStyle = theme.bcastBorder
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.font = `600 9px ${theme.font}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = theme.muted
      ctx.fillText(`@all ${bcast}`, bx + bw / 2, by + 7.5)
    }
    ctx.restore()
  }

  if (countLabels.length > 0) {
    ctx.font = `500 10px ${theme.font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 4
    ctx.lineJoin = 'round'
    ctx.strokeStyle = theme.bg
    ctx.fillStyle = theme.muted
    for (const c of countLabels) {
      ctx.strokeText(c.text, c.x, c.y + 0.5)
      ctx.fillText(c.text, c.x, c.y + 0.5)
    }
  }

  if (dotT !== null) {
    for (const geom of movingDots) {
      const t = dotT
      const u = 1 - t
      const dx = u * u * geom.start.x + 2 * u * t * geom.mx + t * t * geom.end.x
      const dy = u * u * geom.start.y + 2 * u * t * geom.my + t * t * geom.end.y
      if (t < 1) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(dx, dy, 7.5, 0, Math.PI * 2)
        ctx.fillStyle = theme.fg
        ctx.globalAlpha = 0.16
        ctx.fill()
        ctx.restore()
      }
      ctx.beginPath()
      ctx.arc(dx, dy, 4.5, 0, Math.PI * 2)
      ctx.fillStyle = theme.fg
      ctx.fill()
      ctx.strokeStyle = theme.bg
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
  ctx.restore()

  const footY = height - footerH
  const pct = totalPosts > 0 ? Math.min(1, g.upto / totalPosts) : isOverview ? 1 : 0
  ctx.fillStyle = theme.track
  ctx.fillRect(0, footY, width, 2)
  if (pct > 0) {
    ctx.fillStyle = theme.fg2
    ctx.fillRect(0, footY, Math.round(width * pct), 2)
  }

  const capY = footY + 2 + (footerH - 2) / 2
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  let x = padX
  const maxRight = width - padX
  if (g.current) {
    const sender = `@${g.current.agent}`
    ctx.font = `600 11.5px ${theme.font}`
    ctx.fillStyle = theme.fg
    ctx.fillText(sender, x, capY)
    x += ctx.measureText(sender).width
    const recips = [
      ...(g.current.mentions || []).filter((n) => n !== g.current!.agent).map((n) => `@${n}`),
      ...(g.current.channel_mentions || []).map((c) => `@#${c}`),
      ...(g.current.is_all ? ['@all'] : []),
    ].join(' ')
    const snippet = g.current.text.replace(/\s+/g, ' ').trim()
    const rest = `${recips ? ` → ${recips}` : ''}${snippet ? ` · ${snippet}` : ''}`
    if (rest && x < maxRight - 10) {
      ctx.font = `400 11.5px ${theme.font}`
      ctx.fillStyle = theme.muted
      ctx.fillText(fitCanvasText(ctx, rest, maxRight - x), x, capY)
    }
  } else {
    ctx.font = `400 11.5px ${theme.font}`
    ctx.fillStyle = theme.muted
    const summary = isOverview
      ? `${totalPosts} posts · ${memberCount} members${totalDurMs > 0 ? ` · ${fmtDur(totalDurMs)}` : ''}`
      : `Swarm start · ${memberCount} members`
    ctx.fillText(fitCanvasText(ctx, summary, maxRight - x), x, capY)
  }
  ctx.restore()
}

function gifFilename(title: string): string {
  const slug = String(title || 'swarm')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return `${slug || 'swarm'}-graph.gif`
}

export function GraphTab(props: GraphTabProps): JSX.Element {
  const { snapshot, onJumpToSeq } = props
  const [view, setView] = useState<GraphViewMode>('hive')
  const [replayIdx, setReplayIdx] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [pacing, setPacing] = useState<PacingMode>('even')
  const [speed, setSpeed] = useState<number>(1)
  const [expandAll, setExpandAll] = useState(false)
  const [hideInactive, setHideInactive] = useState(false)
  const [exportProgress, setExportProgress] = useState<string | null>(null)
  const [gifPreview, setGifPreview] = useState<{ url: string; filename: string; meta: string } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const graphMsgs = useMemo(
    () =>
      (snapshot.messages || []).filter(
        (m) => m.kind !== 'control' && !m.control && snapshot.members[m.agent]?.role !== 'monitor',
      ),
    [snapshot.messages, snapshot.members],
  )

  const total = graphMsgs.length
  const replaying = replayIdx !== null
  const upto = replaying ? Math.min(replayIdx, total) : total
  const current = replaying && upto > 0 ? graphMsgs[upto - 1] : null
  const replaySeq = replaying ? (current ? current.seq : 0) : null

  const stopPlayback = useCallback(() => {
    setPlaying(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (gifPreview?.url) URL.revokeObjectURL(gifPreview.url)
    }
  }, [gifPreview?.url])

  useEffect(() => {
    if (!playing) return
    if (replayIdx === null || replayIdx >= total) {
      stopPlayback()
      return
    }
    const delay = computeStepDelay(graphMsgs, replayIdx, pacing, speed)
    timerRef.current = setTimeout(() => {
      setReplayIdx((prev) => {
        const next = (prev ?? 0) + 1
        if (next >= total) {
          setPlaying(false)
          return total
        }
        return next
      })
    }, delay)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [playing, replayIdx, total, graphMsgs, pacing, speed, stopPlayback])

  const handleTogglePlay = useCallback(() => {
    if (playing) {
      stopPlayback()
      return
    }
    if (total === 0) return
    if (replayIdx === null || replayIdx >= total) {
      setReplayIdx(0)
    }
    setPlaying(true)
  }, [playing, total, replayIdx, stopPlayback])

  const handleSeek = useCallback(
    (idx: number) => {
      stopPlayback()
      setReplayIdx(Math.max(0, Math.min(total, idx)))
    },
    [stopPlayback, total],
  )

  const handleLive = useCallback(() => {
    stopPlayback()
    setReplayIdx(null)
  }, [stopPlayback])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (e.code === 'Space') {
        e.preventDefault()
        handleTogglePlay()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleSeek((replayIdx ?? total) - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (replayIdx !== null) handleSeek(replayIdx + 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleTogglePlay, handleSeek, replayIdx, total])

  const handleExportGif = useCallback(async () => {
    if (exportProgress !== null) return
    setExportProgress('Preparing…')
    try {
      const logicalW = 640
      const title = snapshot.title || 'Untitled swarm'
      const filename = gifFilename(title)
      const theme = resolveCanvasTheme()
      const memberCount = Object.values(snapshot.members || {}).filter(
        (m: MemberRecord) => m.role !== 'monitor',
      ).length

      const MAX_STEPS = 120
      const stepKs: number[] = []
      if (graphMsgs.length <= MAX_STEPS) {
        for (let k = 1; k <= graphMsgs.length; k++) stepKs.push(k)
      } else {
        for (let i = 0; i < MAX_STEPS; i++) {
          const k = Math.max(1, Math.min(graphMsgs.length, Math.round(1 + (i * (graphMsgs.length - 1)) / (MAX_STEPS - 1))))
          if (stepKs[stepKs.length - 1] !== k) stepKs.push(k)
        }
      }

      const dotTs = graphMsgs.length <= 25 ? [0.15, 0.55, 1.0] : graphMsgs.length <= 60 ? [0.45, 1.0] : [1.0]

      interface FrameSpec {
        k: number
        isOverview: boolean
        dotT: number | null
        stepLabel: string
        delayMs: number
      }
      const plan: FrameSpec[] = []
      let maxGraphH = 220

      if (graphMsgs.length === 0) {
        const overview = computeGraphState(snapshot, graphMsgs, {
          replaying: false,
          upto: 0,
          expandAll,
          hideInactive,
          width: logicalW,
        })
        maxGraphH = Math.max(maxGraphH, overview.height)
        plan.push({ k: 0, isOverview: true, dotT: null, stepLabel: 'Overview', delayMs: 1200 })
      } else {
        const startG = computeGraphState(snapshot, graphMsgs, {
          replaying: true,
          upto: 0,
          expandAll,
          hideInactive,
          width: logicalW,
        })
        maxGraphH = Math.max(maxGraphH, startG.height)
        plan.push({ k: 0, isOverview: false, dotT: null, stepLabel: `0 / ${graphMsgs.length}`, delayMs: 450 })

        for (const k of stepKs) {
          const g = computeGraphState(snapshot, graphMsgs, {
            replaying: true,
            upto: k,
            expandAll,
            hideInactive,
            width: logicalW,
          })
          if (g.height > maxGraphH) maxGraphH = g.height
          const postMs = Math.round(Math.min(2000, Math.max(240, computeStepDelay(graphMsgs, k, pacing, speed))))
          const seq = g.current?.seq ?? k
          const stepLabel = `${k} / ${graphMsgs.length} · #${seq}`
          const hasCurEdge = dotTs.length > 1 && [...g.edges.keys()].some((ek) => {
            const [from, to] = ek.split('>')
            return g.isCur(from, to) && g.pos.has(from) && g.pos.has(to)
          })
          if (hasCurEdge) {
            const travelTotal = Math.min(Math.round(postMs * 0.55), 480)
            const subDelay = Math.max(70, Math.round(travelTotal / (dotTs.length - 1)))
            for (let i = 0; i < dotTs.length - 1; i++) {
              plan.push({ k, isOverview: false, dotT: dotTs[i], stepLabel, delayMs: subDelay })
            }
            plan.push({ k, isOverview: false, dotT: 1.0, stepLabel, delayMs: Math.max(140, postMs - subDelay * (dotTs.length - 1)) })
          } else {
            plan.push({ k, isOverview: false, dotT: 1.0, stepLabel, delayMs: postMs })
          }
        }

        const endG = computeGraphState(snapshot, graphMsgs, {
          replaying: false,
          upto: graphMsgs.length,
          expandAll,
          hideInactive,
          width: logicalW,
        })
        if (endG.height > maxGraphH) maxGraphH = endG.height
        plan.push({ k: graphMsgs.length, isOverview: true, dotT: null, stepLabel: 'Overview', delayMs: 1400 })
      }

      const headerH = 36
      const footerH = 34
      const padY = 8
      const logicalH = Math.ceil(headerH + padY * 2 + maxGraphH + footerH)
      const scale = logicalH > 820 ? 820 / logicalH : 1
      const canvasW = Math.max(1, Math.round(logicalW * scale))
      const canvasH = Math.max(1, Math.round(logicalH * scale))
      const canvas = document.createElement('canvas')
      canvas.width = canvasW
      canvas.height = canvasH
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) throw new Error('Canvas 2D context unavailable')

      const totalDurMs = graphMsgs.length > 1
        ? Math.max(0, msgMs(graphMsgs[graphMsgs.length - 1]) - msgMs(graphMsgs[0]))
        : 0

      const renderFrame = (f: FrameSpec): Uint8ClampedArray => {
        const g = computeGraphState(snapshot, graphMsgs, {
          replaying: !f.isOverview,
          upto: f.k,
          expandAll,
          hideInactive,
          width: logicalW,
        })
        drawGraphGifFrame(ctx, {
          width: logicalW,
          height: logicalH,
          headerH,
          footerH,
          graphOffsetY: headerH + padY + (maxGraphH - g.height) / 2,
          scale,
          theme,
          title,
          g,
          expandAll,
          totalPosts: graphMsgs.length,
          memberCount,
          totalDurMs,
          dotT: f.dotT,
          stepLabel: f.stepLabel,
          isOverview: f.isOverview,
        })
        return ctx.getImageData(0, 0, canvasW, canvasH).data
      }

      const sampleIdxSet = new Set<number>([0, plan.length - 1])
      const sampleCap = Math.min(plan.length, 8)
      for (let i = 1; i < sampleCap - 1; i++) {
        sampleIdxSet.add(Math.round((i * (plan.length - 1)) / (sampleCap - 1)))
      }
      const sampleFrames = [...sampleIdxSet].sort((a, b) => a - b).map((idx) => new Uint8Array(renderFrame(plan[idx])))

      const enc = createGifEncoder({
        width: canvasW,
        height: canvasH,
        sampleFrames,
        repeat: 0,
        useDelta: plan.length > 1,
      })

      let lastYield = performance.now()
      for (let i = 0; i < plan.length; i++) {
        const rgba = renderFrame(plan[i])
        enc.addFrame(rgba, plan[i].delayMs)
        if (i + 1 < plan.length && performance.now() - lastYield >= 16) {
          setExportProgress(`Exporting ${Math.round(((i + 1) / plan.length) * 100)}%`)
          await new Promise((r) => setTimeout(r, 0))
          lastYield = performance.now()
        }
      }
      const bytes = enc.finish()
      const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], { type: 'image/gif' })
      const url = URL.createObjectURL(blob)
      const meta = `${plan.length} ${plan.length === 1 ? 'frame' : 'frames'} · ${fmtBytes(bytes.length)}`
      setGifPreview((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url)
        return { url, filename, meta }
      })
      try {
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
      } catch {
        // Preview modal remains open so user can download/save manually
      }
    } catch (err) {
      console.warn('[dsh-ag-swarm] GIF export failed:', err)
    } finally {
      setExportProgress(null)
    }
  }, [exportProgress, snapshot, graphMsgs, expandAll, hideInactive, pacing, speed])

  const t0 = graphMsgs.length > 0 ? msgMs(graphMsgs[0]) : 0
  const lastMs = graphMsgs.length > 0 ? msgMs(graphMsgs[graphMsgs.length - 1]) : 0
  const pct = total > 0 ? (100 * upto) / total : 100

  return (
    <div className="ag-graph-tab" data-testid="swarm-graph-tab">
      <div className="ag-player" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        <div className="ag-player-row" style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <button
            type="button"
            className="ag-icon-btn"
            disabled={replayIdx === 0 || total === 0}
            title="Reset to start"
            aria-label="Reset replay"
            onClick={() => handleSeek(0)}
          >
            ⏮
          </button>
          <button
            type="button"
            className="ag-icon-btn"
            disabled={upto <= 0 || total === 0}
            title="Previous post (←)"
            aria-label="Previous post"
            onClick={() => handleSeek(upto - 1)}
          >
            ◀
          </button>
          <button
            type="button"
            className="ag-icon-btn"
            disabled={total === 0}
            title={playing ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={playing ? 'Pause replay' : 'Play replay'}
            onClick={handleTogglePlay}
            style={{ background: 'var(--ag-fill, rgba(128,128,128,0.1))', color: 'var(--ag-fg, inherit)' }}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="ag-icon-btn"
            disabled={!replaying || upto >= total}
            title="Next post (→)"
            aria-label="Next post"
            onClick={() => handleSeek(upto + 1)}
          >
            ▶
          </button>
          <input
            type="range"
            className="ag-slider"
            min={0}
            max={total}
            value={upto}
            disabled={total === 0}
            aria-label="Replay timeline"
            onChange={(e) => handleSeek(Number(e.target.value))}
            style={{
              flex: '1 1 auto',
              minWidth: 60,
              cursor: 'pointer',
              accentColor: 'var(--ag-fg, #1d1f21)',
              background: `linear-gradient(to right, var(--ag-fg-2, #3d4348) ${pct}%, color-mix(in srgb, var(--ag-fg, #1d1f21) 14%, transparent) ${pct}%)`,
              height: 4,
              borderRadius: 999,
            }}
          />
          <button
            type="button"
            className={`ag-pill-btn${!replaying ? ' on' : ''}`}
            aria-pressed={!replaying}
            onClick={handleLive}
            title="Return to live view"
          >
            <span
              className="ag-live-dot"
              style={{
                background: !replaying ? 'var(--ag-success, #63984f)' : 'var(--ag-fg-faint, #9da5ab)',
              }}
            />
            Live
          </button>
        </div>

        <div
          className="ag-player-row ag-player-sub"
          style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 10px' }}
        >
          <div
            className="ag-segmented"
            role="group"
            aria-label="Graph view mode"
            style={{
              display: 'inline-flex',
              gap: 2,
              padding: 2,
              borderRadius: 8,
              background: 'var(--ag-fill, rgba(128,128,128,0.08))',
            }}
          >
            {(['hive', 'mentions'] as const).map((mode) => {
              const on = view === mode
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setView(mode)}
                  style={{
                    height: 24,
                    padding: '0 10px',
                    border: 0,
                    borderRadius: 6,
                    fontSize: 12,
                    background: on ? 'var(--ag-bg, #ffffff)' : 'transparent',
                    color: on ? 'var(--ag-fg, inherit)' : 'var(--ag-fg-muted, #5d676f)',
                    boxShadow: on ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {mode === 'hive' ? 'Hive' : 'Mentions'}
                </button>
              )
            })}
          </div>

          <span
            className="ag-replay-label"
            style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)', fontVariantNumeric: 'tabular-nums' }}
          >
            {!replaying ? (
              <>
                <strong style={{ color: 'var(--ag-fg, inherit)' }}>{total} {total === 1 ? 'post' : 'posts'}</strong>
                {total > 1 && lastMs > t0 ? ` over ${fmtDur(lastMs - t0)}` : ''}
              </>
            ) : (
              <>
                <strong style={{ color: 'var(--ag-fg, inherit)' }}>{upto}</strong> of {total}
                {current ? ` · #${current.seq} at ${fmtClock(msgMs(current))} (+${fmtDur(msgMs(current) - t0)})` : ''}
              </>
            )}
          </span>

          <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <label className="ag-select" title="Replay pacing">
              <select
                aria-label="Replay pacing"
                value={pacing}
                onChange={(e) => setPacing(e.target.value as PacingMode)}
                style={{ fontSize: 12, height: 26 }}
              >
                <option value="even">Even pacing</option>
                <option value="realtime">Real-time gaps</option>
              </select>
            </label>

            <label className="ag-select" title="Playback speed">
              <select
                aria-label="Playback speed"
                value={String(speed)}
                onChange={(e) => setSpeed(Number(e.target.value) || 1)}
                style={{ fontSize: 12, height: 26 }}
              >
                {SPEEDS.map((sp) => (
                  <option key={sp} value={String(sp)}>
                    {sp}×
                  </option>
                ))}
              </select>
            </label>

            {view === 'mentions' && (
              <>
                <label className="ag-switch">
                  <input type="checkbox" checked={hideInactive} onChange={(e) => setHideInactive(e.target.checked)} />
                  <span className="ag-switch-track" />
                  <span>Hide inactive</span>
                </label>
                <label className="ag-switch">
                  <input type="checkbox" checked={expandAll} onChange={(e) => setExpandAll(e.target.checked)} />
                  <span className="ag-switch-track" />
                  <span>Expand @all</span>
                </label>
              </>
            )}

            <button
              type="button"
              className="ag-btn sm"
              disabled={exportProgress !== null}
              onClick={() => void handleExportGif()}
              data-testid="swarm-export-gif"
            >
              {exportProgress ?? 'Export GIF'}
            </button>
          </div>
        </div>
      </div>

      {view === 'hive' ? (
        <HiveCanvas
          snapshot={snapshot}
          messages={graphMsgs}
          replaySeq={replaySeq}
          onJumpToSeq={onJumpToSeq}
        />
      ) : (
        <MentionsGraph
          snapshot={snapshot}
          messages={graphMsgs}
          replaying={replaying}
          upto={upto}
          expandAll={expandAll}
          hideInactive={hideInactive}
          onJumpToSeq={onJumpToSeq}
        />
      )}

      {current && (
        <div
          className="ag-replay-caption"
          data-testid="swarm-replay-caption"
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 8,
            background: 'var(--ag-fill, rgba(128,128,128,0.08))',
            fontSize: 13,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <strong>@{current.agent}</strong>
            {(current.mentions.length > 0 || current.channel_mentions.length > 0 || current.is_all) && (
              <span style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)' }}>
                →{' '}
                {[
                  ...current.mentions.filter((n) => n !== current.agent).map((n) => `@${n}`),
                  ...current.channel_mentions.map((c) => `@#${c}`),
                  ...(current.is_all ? ['@all'] : []),
                ].join(' ')}
              </span>
            )}
            <button
              type="button"
              className="ag-ghost-btn"
              onClick={() => onJumpToSeq(current.seq)}
              style={{ marginLeft: 'auto', height: 22, padding: '0 6px', fontFamily: 'var(--ag-mono, monospace)', fontSize: 11 }}
            >
              #{current.seq} · {fmtClock(msgMs(current))}
            </button>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 160, overflow: 'auto', color: 'var(--ag-fg-2, inherit)' }}>
            {current.text}
          </div>
        </div>
      )}

      {gifPreview && (
        <div
          className="ag-gif-modal"
          data-testid="swarm-gif-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setGifPreview(null)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            display: 'grid',
            placeItems: 'center',
            padding: 16,
            background: 'rgba(0, 0, 0, 0.48)',
          }}
        >
          <div
            style={{
              width: 'min(92vw, 720px)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 10,
              background: 'var(--ag-card, #ffffff)',
              color: 'var(--ag-fg, inherit)',
              border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.28)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--ag-line, rgba(128,128,128,0.14))' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {gifPreview.filename}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ag-fg-muted, #5d676f)' }}>{gifPreview.meta}</div>
              </div>
              <a
                href={gifPreview.url}
                download={gifPreview.filename}
                className="ag-btn primary sm"
                style={{ textDecoration: 'none' }}
              >
                Download GIF
              </a>
              <button type="button" className="ag-icon-btn" onClick={() => setGifPreview(null)} aria-label="Close preview">
                ✕
              </button>
            </div>
            <div style={{ padding: 12, overflow: 'auto', display: 'flex', justifyContent: 'center', background: 'var(--ag-bg, #f7f7f8)' }}>
              <img
                src={gifPreview.url}
                alt={`${snapshot.title || 'Swarm'} graph replay`}
                style={{ maxWidth: '100%', maxHeight: '66vh', borderRadius: 6, border: '1px solid var(--ag-line, rgba(128,128,128,0.14))' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
