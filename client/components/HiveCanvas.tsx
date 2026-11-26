import { useEffect, useMemo, useRef, useState } from 'react'
import type { BoardMessage, MemberRecord, SwarmSnapshotPayload } from '../../src/shared/protocol'
import { PixelBee, getBeeDataUrl } from '../bee-sprites'
import { t, useUiLocale } from '../i18n'

export interface HiveCanvasProps {
  snapshot: SwarmSnapshotPayload
  messages: BoardMessage[]
  replaySeq: number | null
  onJumpToSeq: (seq: number) => void
}

type HiveBeeStatus = 'working' | 'wait' | 'needs' | 'issue' | 'done' | 'idle' | 'retired' | 'unborn'

interface HiveBeeState {
  st: HiveBeeStatus
  who: string | null
}

interface HiveCell {
  id: string
  title: string
  goal: string
  bees: string[]
  total: number
  done: number
  count?: number
}

const HV_RING: ReadonlyArray<[number, number]> = [
  [0, -1],
  [1, -1],
  [1, 0],
  [0, 1],
  [-1, 1],
  [-1, 0],
]
const HV_FEW: Record<number, number[]> = {
  1: [0],
  2: [5, 1],
  3: [0, 2, 4],
  4: [5, 1, 4, 2],
  5: [5, 0, 1, 4, 2],
}
const HV_ASK = /\?|could you|can you|please|ping me|waiting on/i
const HV_BUSY_MS = 45 * 60 * 1000
const HV_ASK_MS = 6 * 3600 * 1000

function hiveSlots(n: number): Array<[number, number]> {
  if (n < 1) return []
  if (n < 6) return HV_FEW[n].map((k) => HV_RING[k])
  const out: Array<[number, number]> = []
  const dirs: ReadonlyArray<[number, number]> = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]]
  for (let k = 1; out.length < n; k++) {
    let q = 0
    let r = -k
    for (const [dq, dr] of dirs) {
      for (let j = 0; j < k; j++) {
        out.push([q, r])
        q += dq
        r += dr
      }
    }
  }
  return out.slice(0, n)
}

function hexPath(x: number, y: number, r: number, a0: number): string {
  let d = ''
  for (let k = 0; k < 6; k++) {
    const a = ((a0 + 60 * k) * Math.PI) / 180
    d += (k ? 'L' : 'M') + (x + r * Math.cos(a)).toFixed(1) + ' ' + (y + r * Math.sin(a)).toFixed(1)
  }
  return `${d}Z`
}

function wrapTitle(text: string, max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const w of String(text).split(' ')) {
    if (cur && (cur + ' ' + w).length > max) {
      out.push(cur)
      cur = w
    } else {
      cur = (cur + ' ' + w).trim()
    }
  }
  if (cur) out.push(cur)
  if (out.length > 2) {
    out.length = 2
    out[1] = out[1].replace(/.$/, '…')
  }
  return out
}

function clipText(text: string, max: number): string {
  const s = String(text)
  return s.length > max ? s.slice(0, Math.max(1, max - 1)).trimEnd() + '…' : s
}

function computeHiveStates(
  snapshot: SwarmSnapshotPayload,
  messages: BoardMessage[],
  replaySeq: number | null,
): { st: Record<string, HiveBeeState>; doneCheck: ((n: string) => boolean) | null; beam: BoardMessage | null } {
  const members = snapshot.members || {}
  const names = Object.keys(members).filter((n) => members[n]?.role !== 'monitor')
  const out: Record<string, HiveBeeState> = {}

  if (replaySeq === null) {
    const doneTaskOwners = new Set<string>()
    const openTaskOwners = new Set<string>()
    for (const th of snapshot.threads || []) {
      for (const t of th.tasks || []) {
        if (t.done) doneTaskOwners.add(t.name)
        else openTaskOwners.add(t.name)
      }
    }
    for (const n of names) {
      const m = members[n]
      let st: HiveBeeStatus = 'idle'
      let who: string | null = null
      if (m.killed || m.state === 'killed') st = 'retired'
      else if (m.failure) st = 'issue'
      else if (m.state === 'working') st = 'working'
      else if (m.waiting_on && m.waiting_on.length > 0) {
        st = 'wait'
        who = m.waiting_on[0]
      } else if (n !== 'coordinator' && doneTaskOwners.has(n) && !openTaskOwners.has(n)) {
        st = 'done'
      }
      out[n] = { st, who }
    }
    const coordAttention = (snapshot.systemAttention || []).some(
      (a) => a.member === 'coordinator' || a.kind === 'stall',
    )
    if (coordAttention && out.coordinator && out.coordinator.st !== 'retired') {
      out.coordinator = { st: 'needs', who: null }
    }
    const lp = messages.length > 0 ? messages[messages.length - 1] : null
    const freshBeam = lp && Date.now() - (lp.ts || Date.parse(lp.time) || 0) < 90_000 ? lp : null
    return { st: out, doneCheck: null, beam: freshBeam }
  }

  let idx = -1
  while (idx + 1 < messages.length && messages[idx + 1].seq <= replaySeq) idx++

  const fin: Record<string, number> = {}
  const lastPost: Record<string, number> = {}
  const lastIn: Record<string, number> = {}
  const born: Record<string, boolean> = { coordinator: true }
  const tms = (k: number): number => messages[k]?.ts || Date.parse(messages[k]?.time || '') || 0

  messages.forEach((p, k) => {
    fin[p.agent] = k
  })
  const targetsOfMsg = (p: BoardMessage): string[] =>
    p.is_all ? [] : (p.mentions || []).filter((n) => n !== p.agent && members[n]?.role !== 'monitor')

  for (let k = 0; k <= idx; k++) {
    const p = messages[k]
    born[p.agent] = true
    lastPost[p.agent] = k
    for (const target of targetsOfMsg(p)) {
      born[target] = true
      lastIn[target] = k
    }
  }
  const now = idx >= 0 ? tms(idx) : 0
  for (const n of names) {
    const m = members[n]
    const lp = lastPost[n] ?? -1
    const li = lastIn[n] ?? -1
    let st: HiveBeeStatus = 'idle'
    let who: string | null = null
    if (!born[n]) {
      st = 'unborn'
    } else if (
      m.killed &&
      (fin[n] != null ? idx >= fin[n] && (idx > fin[n] + 8 || now - tms(fin[n]) > HV_BUSY_MS) : idx > li + 8)
    ) {
      st = 'retired'
    } else if (li > lp && now - tms(li) < HV_BUSY_MS) {
      st = 'working'
      who = messages[li].agent
    } else if (
      lp >= 0 &&
      HV_ASK.test(messages[lp].text) &&
      targetsOfMsg(messages[lp]).length > 0 &&
      now - tms(lp) < HV_ASK_MS &&
      (lastPost[targetsOfMsg(messages[lp])[0]] ?? -1) <= lp
    ) {
      st = 'wait'
      who = targetsOfMsg(messages[lp])[0]
    } else if (lp >= 0 && fin[n] <= idx && n !== 'coordinator') {
      st = 'done'
    } else if (lp >= 0 && idx - lp < 3 && now - tms(lp) < 4 * 60 * 1000) {
      st = 'working'
    }
    out[n] = { st, who: who === n ? null : who }
  }

  return {
    st: out,
    doneCheck: (n: string) => Boolean(out[n] && (out[n].st === 'retired' || (fin[n] != null && fin[n] <= idx))),
    beam: idx >= 0 ? messages[idx] : null,
  }
}

function buildHiveCells(
  snapshot: SwarmSnapshotPayload,
  st: Record<string, HiveBeeState>,
  doneCheck: ((n: string) => boolean) | null,
  isZh: boolean,
): HiveCell[] {
  const members = snapshot.members || {}
  const workers = Object.keys(members).filter(
    (n) => members[n]?.role !== 'monitor' && n !== 'coordinator' && Boolean(st[n]),
  )
  const settled = (n: string): boolean => st[n]?.st === 'done' || st[n]?.st === 'retired'
  const cells: HiveCell[] = []
  const threads = snapshot.threads || []

  if (threads.length > 0) {
    const homed = new Set<string>()
    for (const th of threads) {
      const taskNames = (th.tasks || []).map((t) => t.name).filter((n) => n !== 'coordinator' && Boolean(st[n]))
      const uniqueBees = [...new Set(taskNames)]
      const total = th.tasks.length
      const done = doneCheck
        ? th.tasks.filter((t) => t.name === 'coordinator' || doneCheck(t.name)).length
        : th.progress.done
      cells.push({
        id: th.id,
        title: th.title,
        goal: th.goal || '',
        bees: [],
        total,
        done,
      })
      for (const b of uniqueBees) {
        if (!homed.has(b)) {
          cells[cells.length - 1].bees.push(b)
          homed.add(b)
        }
      }
    }
    const rest = workers.filter((n) => !homed.has(n))
    if (rest.length > 0) {
      cells.push({
        id: '_other',
        title: isZh ? '其他成员' : 'Other',
        goal: '',
        bees: rest,
        total: rest.length,
        done: rest.filter(settled).length,
      })
    }
  } else {
    const buckets: Array<[string, string, (n: string) => boolean, boolean]> = [
      ['_working', t('members.state.working'), (n) => st[n]?.st === 'working', false],
      ['_waiting', t('members.state.waiting'), (n) => st[n]?.st === 'wait' || st[n]?.st === 'issue', false],
      ['_resting', isZh ? '休眠中' : 'Resting', (n) => st[n]?.st === 'idle', false],
      ['_done', isZh ? '已完成' : 'Done', settled, true],
    ]
    for (const [id, title, pick, isDone] of buckets) {
      const bees = workers.filter(pick)
      if (bees.length > 0) {
        cells.push({
          id,
          title,
          goal: '',
          bees,
          total: bees.length,
          done: isDone ? bees.length : 0,
          count: bees.length,
        })
      }
    }
  }

  return cells.slice(0, 400)
}

function statusText(s: HiveBeeState | undefined, isZh: boolean): string {
  if (!s) return ''
  switch (s.st) {
    case 'working':
      return s.who
        ? (isZh ? `协助 @${s.who} 工作中` : `Working for @${s.who}`)
        : t('members.state.working')
    case 'wait':
      return s.who ? t('members.waitingOn', { target: s.who }) : t('members.state.waiting')
    case 'needs': return isZh ? '需要关注' : 'Needs attention'
    case 'issue': return isZh ? '异常 / 卡住' : 'Issue / Stuck'
    case 'done': return isZh ? '已完成' : 'Done'
    case 'idle': return isZh ? '休眠中' : 'Resting'
    case 'retired': return t('members.state.killed')
    case 'unborn': return isZh ? '未启动' : 'Not started'
  }
}

export function HiveCanvas(props: HiveCanvasProps): JSX.Element {
  const { snapshot, messages, replaySeq, onJumpToSeq } = props
  const locale = useUiLocale()
  const isZh = locale === 'zh-CN'
  const rootRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [paneW, setPaneW] = useState(640)
  const [zoom, setZoom] = useState(1)
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null)
  const [panning, setPanning] = useState(false)
  const draggedRef = useRef(false)
  const lastBeamSeqRef = useRef<number | null>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const w = Math.floor(el.clientWidth)
      if (w >= 40) setPaneW(w)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && selectedCellId) setSelectedCellId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCellId])

  const hs = useMemo(() => computeHiveStates(snapshot, messages, replaySeq), [snapshot, messages, replaySeq])
  const cells = useMemo(() => buildHiveCells(snapshot, hs.st, hs.doneCheck, isZh), [snapshot, hs, isZh])
  const slots = useMemo(() => hiveSlots(cells.length), [cells.length])
  const selCell = useMemo(() => cells.find((c) => c.id === selectedCellId) ?? null, [cells, selectedCellId])

  const K = Math.sqrt(3) / 2
  const ux = (q: number): number => 1.5 * q
  const uy = (q: number, r: number): number => 2 * K * (r + q / 2)

  const geometry = useMemo(() => {
    const xs = [0, ...slots.map(([q]) => ux(q))]
    const ys = [0, ...slots.map(([q, r]) => uy(q, r))]
    const spanX = Math.max(...xs) - Math.min(...xs) + 2
    const spanY = Math.max(...ys) - Math.min(...ys) + 2 * K
    const fit = (paneW - 8) / spanX
    const gap = fit < 44 ? 3 : 7
    const Rfit = Math.max(12, Math.min(108, fit - gap / 2))
    const zmax = Math.max(1, 108 / Rfit)
    const clampedZoom = Math.max(1, Math.min(zmax, zoom))
    const R = Math.min(108, Rfit * clampedZoom)
    const G = R + gap / 2
    const mode: 'full' | 'mid' | 'tiny' = R >= 76 ? 'full' : R >= 40 ? 'mid' : 'tiny'
    const CW = Math.max(paneW, Math.ceil(spanX * G + 8))
    const ox = CW / 2 - ((Math.max(...xs) + Math.min(...xs)) / 2) * G
    const oy = 4 + K * R - Math.min(...ys) * G
    const H = Math.ceil(spanY * G + 8)
    const fitH = Math.ceil(spanY * (Rfit + gap / 2) + 8)
    return { R, Rfit, G, mode, CW, H, ox, oy, zmax, clampedZoom, fitH, names: R >= 92 }
  }, [slots, paneW, zoom])

  const { R, G, mode, CW, H, ox, oy, zmax, clampedZoom, fitH, names } = geometry
  const zoomed = clampedZoom > 1.001

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const onWheel = (e: WheelEvent): void => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setZoom((prev) => Math.max(1, Math.min(zmax, prev * Math.exp(-e.deltaY * 0.01))))
    }
    view.addEventListener('wheel', onWheel, { passive: false })
    return () => view.removeEventListener('wheel', onWheel)
  }, [zmax])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    const view = viewRef.current
    if (e.button !== 0 || !zoomed || !view) return
    const x0 = e.clientX
    const y0 = e.clientY
    const sl = view.scrollLeft
    const st = view.scrollTop
    let moved = false
    const onMove = (ev: PointerEvent): void => {
      const dx = ev.clientX - x0
      const dy = ev.clientY - y0
      if (!moved && Math.hypot(dx, dy) < 5) return
      moved = true
      setPanning(true)
      view.scrollLeft = sl - dx
      view.scrollTop = st - dy
    }
    const onUp = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      setPanning(false)
      if (moved) {
        draggedRef.current = true
        setTimeout(() => {
          draggedRef.current = false
        }, 0)
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  const layoutData = useMemo(() => {
    const pos: Record<string, { x: number; y: number; size: 'q' | 'm' | 'xs'; cell?: boolean }> = {}
    const tucked = new Set<string>()
    const cellDraw: Array<{
      cell: HiveCell
      x: number
      y: number
      ratio: number
      agg: '' | 'bad' | 'warn' | 'busy'
      lines: string[]
      extraCount: number
      extraPos?: { x: number; y: number }
    }> = []

    const aggOf = (c: HiveCell): '' | 'bad' | 'warn' | 'busy' => {
      const sts = c.bees.map((n) => hs.st[n]?.st)
      if (sts.includes('issue')) return 'bad'
      if (sts.includes('wait')) return 'warn'
      if (sts.includes('working')) return 'busy'
      return ''
    }

    if (mode === 'full') pos.coordinator = { x: ox, y: oy - R * 0.12, size: 'q' }
    else if (mode === 'mid') pos.coordinator = { x: ox, y: oy - 6, size: 'm' }
    else pos.coordinator = { x: ox, y: oy, size: R >= 26 ? 'm' : 'xs' }

    cells.forEach((c, k) => {
      const [q, r] = slots[k]
      const x = ox + ux(q) * G
      const y = oy + uy(q, r) * G
      const ratio = c.total > 0 ? Math.min(1, c.done / c.total) : 0
      const agg = aggOf(c)
      const rankMap: Partial<Record<HiveBeeStatus, number>> = { issue: 0, wait: 1, working: 2 }
      const rank = (n: string): number => rankMap[hs.st[n]?.st ?? 'idle'] ?? 3
      const born = c.bees.filter((n) => hs.st[n]?.st !== 'unborn').sort((a, b) => rank(a) - rank(b))
      for (const n of c.bees) {
        if (!born.includes(n)) pos[n] = { x, y, size: 'xs' }
      }

      let lines: string[] = []
      let extraCount = 0
      let extraPos: { x: number; y: number } | undefined

      if (mode === 'tiny') {
        const pick = R >= 18
          ? c.bees.find((n) => hs.st[n]?.st === 'issue') ||
            c.bees.find((n) => hs.st[n]?.st === 'wait') ||
            c.bees.find((n) => hs.st[n]?.st === 'working')
          : undefined
        for (const n of c.bees) {
          if (n === pick) pos[n] = { x, y, size: 'xs' }
          else {
            pos[n] = { x, y, size: 'xs', cell: true }
            tucked.add(n)
          }
        }
      } else if (mode === 'mid') {
        lines = [clipText(c.title, Math.floor((R + 8) / 6.2))]
        const show = born.length > 3 ? born.slice(0, 2) : born
        const by = y + R * 0.34
        show.forEach((n, j) => {
          const span = show.length - 1 + (show.length < born.length ? 1 : 0)
          pos[n] = { x: x + (j - span / 2) * 24, y: by, size: 'xs' }
        })
        if (show.length < born.length) {
          extraCount = born.length - show.length
          extraPos = { x: x + 24, y: by + 4 }
          for (const n of born.slice(show.length)) {
            pos[n] = { x: x + 24, y: by, size: 'xs' }
            tucked.add(n)
          }
        }
      } else {
        lines = wrapTitle(c.title, names ? 15 : 12)
        const ty = y - K * R + (lines.length > 1 ? 20 : 26)
        const per = Math.max(2, Math.min(3, Math.floor((1.6 * R) / 50)))
        const cap = per * 2
        const show = born.length > cap ? born.slice(0, cap - 1) : born
        const sw = Math.min(58, (1.66 * R) / per)
        const rows = show.length > per ? [show.slice(0, per), show.slice(per)] : [show]
        const rg = names ? 54 : 40
        const top = ty + lines.length * 14 + 8
        const bot = y + K * R - (names ? 16 : 6)
        const y0 = (top + bot) / 2 - ((rows.length - 1) * rg) / 2 - (names ? 6 : 0)
        rows.forEach((rw, ri) => {
          rw.forEach((n, j) => {
            pos[n] = { x: x + (j - (rw.length - 1) / 2) * sw, y: y0 + ri * rg, size: 'm' }
          })
        })
        if (show.length < born.length) {
          const lr = rows[rows.length - 1]
          const px = x + ((lr.length + 1) / 2) * sw - sw / 2 + 4
          const py = y0 + (rows.length - 1) * rg
          extraCount = born.length - show.length
          extraPos = { x: px, y: py + 4 }
          for (const n of born.slice(show.length)) {
            pos[n] = { x: px, y: py, size: 'xs' }
            tucked.add(n)
          }
        }
      }

      cellDraw.push({ cell: c, x, y, ratio, agg, lines, extraCount, extraPos })
    })

    return { pos, tucked, cellDraw }
  }, [cells, slots, hs.st, mode, ox, oy, R, G, K, names])

  const beam = hs.beam
  const freshBeam = Boolean(beam && lastBeamSeqRef.current !== beam.seq)

  useEffect(() => {
    lastBeamSeqRef.current = beam ? beam.seq : null
    if (!svgRef.current) return
    svgRef.current.querySelectorAll<SVGAnimateMotionElement>('.ag-hv-fly').forEach((a) => {
      try {
        (a as unknown as { beginElement?: () => void }).beginElement?.()
      } catch {
        // ignore
      }
    })
  }, [beam?.seq])

  const links = useMemo(() => {
    const { pos } = layoutData
    const PAD: Record<'q' | 'm' | 'xs', number> = { q: 36, m: 24, xs: 13 }
    const padOf = (p: { size: 'q' | 'm' | 'xs'; cell?: boolean }): number => (p.cell ? R * 0.5 : PAD[p.size])
    const seen = (n: string): boolean => Boolean(pos[n] && hs.st[n] && hs.st[n].st !== 'unborn')
    const drawn = new Set<string>()
    const out: Array<{
      key: string
      cls: 'wait' | 'beam'
      d: string
      short: boolean
      x2: number
      y2: number
      arrowPath: string
    }> = []

    const addLink = (fromName: string, toName: string, cls: 'wait' | 'beam'): void => {
      const a = pos[fromName]
      const b = pos[toName]
      if (!a || !b) return
      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.hypot(dx, dy) || 1
      const pa = padOf(a)
      const pb = padOf(b)
      if (len < pa + pb + 6) return
      const id = `${cls}|${a.x.toFixed(0)},${a.y.toFixed(0)}|${b.x.toFixed(0)},${b.y.toFixed(0)}`
      if (drawn.has(id)) return
      drawn.add(id)
      const vx = dx / len
      const vy = dy / len
      const x1 = a.x + vx * pa
      const y1 = a.y + vy * pa
      const x2 = b.x - vx * pb
      const y2 = b.y - vy * pb
      const bend = Math.min(26, (len - pa - pb) * 0.2)
      const mx = (x1 + x2) / 2 - vy * bend
      const my = (y1 + y2) / 2 + vx * bend
      const short = len - pa - pb < 30
      const cut = cls === 'wait' && !short ? 9 : 0
      const hl = Math.hypot(x2 - mx, y2 - my) || 1
      const ex = x2 - ((x2 - mx) / hl) * cut
      const ey = y2 - ((y2 - my) / hl) * cut
      const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
      let arrowPath = ''
      if (cls === 'wait') {
        const fx = short ? a.x : mx
        const fy = short ? a.y : my
        const al = Math.hypot(x2 - fx, y2 - fy) || 1
        const tx = (x2 - fx) / al
        const ty = (y2 - fy) / al
        const bx = x2 - tx * 10
        const by = y2 - ty * 10
        arrowPath = `M${x2.toFixed(1)} ${y2.toFixed(1)}L${(bx - ty * 3.8).toFixed(1)} ${(by + tx * 3.8).toFixed(1)}L${(bx + ty * 3.8).toFixed(1)} ${(by - tx * 3.8).toFixed(1)}Z`
      }
      out.push({ key: id, cls, d, short, x2, y2, arrowPath })
    }

    for (const [n, s] of Object.entries(hs.st)) {
      if (
        s.st === 'wait' &&
        s.who &&
        seen(n) &&
        seen(s.who) &&
        (selCell ? selCell.bees.includes(n) || selCell.bees.includes(s.who) : cells.length <= 18)
      ) {
        addLink(n, s.who, 'wait')
      }
    }
    if (beam && seen(beam.agent)) {
      const targets = (beam.mentions || []).filter((t) => t !== beam.agent)
      for (const t of targets) {
        if (seen(t)) addLink(beam.agent, t, 'beam')
      }
    }
    return out
  }, [layoutData, hs.st, R, selCell, cells.length, beam])

  const allDone = hs.doneCheck
    ? cells.reduce((a, c) => a + c.done, 0)
    : snapshot.stats.doneTasks
  const allTot = hs.doneCheck
    ? cells.reduce((a, c) => a + c.total, 0)
    : Math.max(snapshot.stats.totalTasks, cells.reduce((a, c) => a + c.total, 0))
  const coordNeeds = hs.st.coordinator?.st === 'needs'

  const cellFill = (agg: '' | 'bad' | 'warn' | 'busy', full: boolean, sel: boolean): string => {
    if (sel) return 'color-mix(in srgb, var(--ag-primary, #007acc) 10%, var(--ag-card, #ffffff))'
    if (mode === 'tiny') {
      if (agg === 'bad') return 'color-mix(in srgb, var(--ag-error, #cb3d3d) 30%, var(--ag-card, #ffffff))'
      if (agg === 'warn') return 'color-mix(in srgb, var(--ag-warning, #bca136) 34%, var(--ag-card, #ffffff))'
      if (agg === 'busy') return 'color-mix(in srgb, var(--ag-primary, #007acc) 22%, var(--ag-card, #ffffff))'
      if (full) return 'color-mix(in srgb, var(--ag-success, #63984f) 26%, var(--ag-card, #ffffff))'
    } else if (full && !agg) {
      return 'color-mix(in srgb, var(--ag-success, #63984f) 9%, var(--ag-card, #ffffff))'
    }
    return 'var(--ag-card, #ffffff)'
  }

  return (
    <div ref={rootRef} className="ag-hv" data-testid="swarm-hive" data-size={mode} style={{ position: 'relative' }}>
      <div className="ag-hv-bar" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)', fontVariantNumeric: 'tabular-nums' }}>
          {t('graph.cellsDone', { cells: cells.length, done: allDone, total: allTot })}
        </div>
        <div
          className="ag-hv-zoom"
          role="group"
          aria-label={isZh ? '蜂巢缩放控制' : 'Hive zoom controls'}
          style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 2 }}
        >
          <button
            type="button"
            className="ag-icon-btn"
            disabled={!zoomed}
            title={isZh ? '缩小' : 'Zoom out'}
            aria-label={isZh ? '缩小' : 'Zoom out'}
            onClick={() => setZoom((z) => Math.max(1, z / 1.6))}
          >
            −
          </button>
          <button
            type="button"
            className="ag-icon-btn"
            disabled={clampedZoom > zmax - 0.01}
            title={isZh ? '放大（或按住 Ctrl+滚轮）' : 'Zoom in (or Ctrl+wheel)'}
            aria-label={isZh ? '放大' : 'Zoom in'}
            onClick={() => setZoom((z) => Math.min(zmax, z * 1.6))}
          >
            +
          </button>
          <button
            type="button"
            className="ag-ghost-btn"
            disabled={!zoomed}
            title={isZh ? '适配整个蜂巢' : 'Fit the whole hive'}
            onClick={() => setZoom(1)}
            style={{ height: 26, padding: '0 7px' }}
          >
            {isZh ? '适配' : 'Fit'}
          </button>
        </div>
      </div>

      <div
        ref={viewRef}
        className={`ag-hv-view${zoomed ? ' zoomed' : ''}${panning ? ' panning' : ''}`}
        onPointerDown={onPointerDown}
        style={{
          overflow: zoomed ? 'auto' : 'visible',
          maxHeight: zoomed ? Math.max(320, Math.min(fitH, 540)) : undefined,
          cursor: zoomed ? (panning ? 'grabbing' : 'grab') : 'default',
          borderRadius: 12,
          userSelect: panning ? 'none' : undefined,
        }}
      >
        <div className="ag-hv-stage" style={{ position: 'relative', width: `${CW}px`, height: `${H}px`, margin: '0 auto' }}>
          <svg
            ref={svgRef}
            className="ag-hv-svg"
            viewBox={`0 0 ${CW} ${H}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
            role="img"
            aria-label="Swarm honeycomb topology"
          >
            {/* Coordinator center hex */}
            <g>
              <path
                d={hexPath(ox, oy, R, 0)}
                fill="var(--ag-card, #ffffff)"
                stroke={mode === 'tiny' ? 'var(--ag-fg-muted, #5d676f)' : 'var(--ag-border, rgba(128,128,128,0.25))'}
                strokeWidth={1.2}
                onClick={() => setSelectedCellId(null)}
              >
                <title>{`Coordinator · ${allDone} of ${allTot} done`}</title>
              </path>
              {allTot > 0 && allDone > 0 && (
                <path
                  d={hexPath(ox, oy, R - 2, -120)}
                  pathLength={1}
                  fill="none"
                  stroke="var(--ag-success, #63984f)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min(1, allDone / allTot).toFixed(3)} 1`}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {mode === 'full' && (
                <>
                  <text x={ox} y={oy + R * 0.44} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--ag-fg, #1d1f21)" style={{ pointerEvents: 'none' }}>
                    {t('members.coordinator')}
                  </text>
                  <text
                    x={ox}
                    y={oy + R * 0.44 + 15}
                    textAnchor="middle"
                    fontSize={11}
                    fill={coordNeeds ? 'var(--ag-warning, #bca136)' : 'var(--ag-fg-muted, #5d676f)'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {coordNeeds ? (isZh ? '需要关注' : 'Needs attention') : (isZh ? `完成 ${allDone}/${allTot}` : `${allDone} of ${allTot} done`)}
                  </text>
                </>
              )}
              {mode === 'mid' && (
                <text
                  x={ox}
                  y={oy + R * 0.62}
                  textAnchor="middle"
                  fontSize={10}
                  fill={coordNeeds ? 'var(--ag-warning, #bca136)' : 'var(--ag-fg-muted, #5d676f)'}
                  style={{ pointerEvents: 'none' }}
                >
                  {coordNeeds ? (isZh ? '需关注' : 'Needs attention') : `${allDone}/${allTot}`}
                </text>
              )}
            </g>

            {/* Surrounding thread/group cells */}
            {layoutData.cellDraw.map((item) => {
              const isSel = selCell?.id === item.cell.id
              const isFull = item.ratio >= 1
              return (
                <g key={item.cell.id}>
                  <path
                    d={hexPath(item.x, item.y, R, 0)}
                    fill={cellFill(item.agg, isFull, isSel)}
                    stroke="var(--ag-border, rgba(128,128,128,0.22))"
                    strokeWidth={1}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (draggedRef.current) return
                      if (mode === 'tiny' && zmax >= 1.15) {
                        setZoom((z) => Math.min(zmax, Math.max(z * 1.6, 2.2)))
                        return
                      }
                      setSelectedCellId((prev) => (prev === item.cell.id ? null : item.cell.id))
                    }}
                  >
                    <title>{`${item.cell.title} · ${item.cell.count ?? `${item.cell.done}/${item.cell.total} done`}`}</title>
                  </path>
                  {((item.ratio > 0 && item.ratio < 1) || (isFull && mode !== 'tiny')) && (
                    <path
                      d={hexPath(item.x, item.y, R - 2, -120)}
                      pathLength={1}
                      fill="none"
                      stroke="var(--ag-success, #63984f)"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(1, item.ratio).toFixed(3)} 1`}
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                  {isSel && (
                    <path
                      d={hexPath(item.x, item.y, R + 1.5, 0)}
                      fill="none"
                      stroke="var(--ag-primary, #007acc)"
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                  {mode === 'mid' && (
                    <>
                      <text x={item.x} y={item.y - K * R + 15} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--ag-fg, #1d1f21)" style={{ pointerEvents: 'none' }}>
                        {item.lines[0]}
                      </text>
                      <text x={item.x} y={item.y - K * R + 27} textAnchor="middle" fontSize={10} fill="var(--ag-fg-muted, #5d676f)" style={{ pointerEvents: 'none' }}>
                        {item.cell.count ?? `${item.cell.done}/${item.cell.total}`}
                      </text>
                    </>
                  )}
                  {mode === 'full' && (
                    <>
                      {item.lines.map((line, idx) => (
                        <text
                          key={idx}
                          x={item.x}
                          y={item.y - K * R + (item.lines.length > 1 ? 20 : 26) + idx * 14}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight={600}
                          fill="var(--ag-fg, #1d1f21)"
                          style={{ pointerEvents: 'none' }}
                        >
                          {line}
                        </text>
                      ))}
                      <text
                        x={item.x}
                        y={item.y - K * R + (item.lines.length > 1 ? 20 : 26) + item.lines.length * 14}
                        textAnchor="middle"
                        fontSize={11}
                        fill="var(--ag-fg-muted, #5d676f)"
                        style={{ pointerEvents: 'none' }}
                      >
                        {item.cell.count ?? `${item.cell.done}/${item.cell.total}`}
                      </text>
                    </>
                  )}
                  {item.extraCount > 0 && item.extraPos && (
                    <text
                      x={item.extraPos.x}
                      y={item.extraPos.y}
                      textAnchor="middle"
                      fontSize={mode === 'mid' ? 10 : 11}
                      fill="var(--ag-fg-muted, #5d676f)"
                      style={{ pointerEvents: 'none' }}
                    >
                      +{item.extraCount}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Waiting & Beam links */}
            {links.map((ln) => (
              <g key={ln.key} style={{ pointerEvents: 'none' }}>
                {!(ln.cls === 'wait' && ln.short) && (
                  <path
                    d={ln.d}
                    fill="none"
                    stroke={ln.cls === 'wait' ? 'var(--ag-warning, #bca136)' : 'var(--ag-primary, #007acc)'}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeDasharray={ln.cls === 'wait' ? '4 4' : undefined}
                    strokeOpacity={0.62}
                  />
                )}
                {ln.cls === 'wait' && ln.arrowPath && (
                  <path d={ln.arrowPath} fill="var(--ag-warning, #bca136)" fillOpacity={0.62} />
                )}
                {ln.cls === 'beam' &&
                  (freshBeam ? (
                    <circle r={3} fill="var(--ag-primary, #007acc)" fillOpacity={0.92}>
                      <animateMotion
                        className="ag-hv-fly"
                        dur="0.7s"
                        begin="indefinite"
                        fill="freeze"
                        path={ln.d}
                      />
                    </circle>
                  ) : (
                    <circle r={3} cx={ln.x2} cy={ln.y2} fill="var(--ag-primary, #007acc)" fillOpacity={0.92} />
                  ))}
              </g>
            ))}
          </svg>

          {/* Animated Pixel Bee overlay */}
          <div className="ag-hv-bees" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Object.entries(layoutData.pos).map(([n, p]) => {
              const m: MemberRecord | undefined = snapshot.members[n]
              const st = hs.st[n]
              if (!m || !st || layoutData.tucked.has(n)) return null
              const [w, h] = p.size === 'q' ? [66, 54] : p.size === 'm' ? [44, 36] : [22, 18]
              const beeSz: 1 | 2 | 3 = p.size === 'q' ? 3 : p.size === 'm' ? 2 : 1
              const beeVisual = st.st === 'working' ? 'working' : st.st === 'wait' ? 'waiting_on' : st.st === 'retired' ? 'killed' : 'landed'
              const dotVar = st.st === 'issue' ? 'stuck' : st.st === 'wait' || st.st === 'needs' ? 'waiting' : st.st === 'done' ? 'done' : undefined
              const tip = `@${n}${m.task_hint && n !== 'coordinator' ? ` · ${m.task_hint}` : ''} · ${statusText(st, isZh)}`

              return (
                <button
                  key={n}
                  type="button"
                  title={tip}
                  aria-label={tip}
                  tabIndex={st.st === 'unborn' ? -1 : 0}
                  onClick={() => {
                    if (draggedRef.current) return
                    if (m.last_post_seq) onJumpToSeq(m.last_post_seq)
                  }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    border: 0,
                    padding: 0,
                    background: 'transparent',
                    pointerEvents: st.st === 'unborn' || panning ? 'none' : 'auto',
                    cursor: m.last_post_seq ? 'pointer' : 'default',
                    opacity: st.st === 'unborn' ? 0 : st.st === 'retired' ? 0.36 : 1,
                    filter: st.st === 'retired' ? 'grayscale(1)' : undefined,
                    transform: `translate(${Math.round(p.x - w / 2)}px, ${Math.round(p.y - h / 2)}px)`,
                    transition: 'transform 0.5s cubic-bezier(.3,.7,.2,1), opacity 0.25s ease',
                  }}
                >
                  <PixelBee
                    name={n}
                    role={m.role}
                    state={beeVisual}
                    size={beeSz}
                    showDot={Boolean(dotVar)}
                    dotVariant={dotVar}
                  />
                  {names && n !== 'coordinator' && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: 1,
                        maxWidth: 58,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 10,
                        color: 'var(--ag-fg-muted, #5d676f)',
                      }}
                    >
                      {n}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="ag-hv-key"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 10, fontSize: 11, color: 'var(--ag-fg-muted, #5d676f)' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <i style={{ display: 'inline-block', width: 16, borderTop: '2px solid var(--ag-success, #63984f)' }} />
          {t('graph.legendDone')}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <i style={{ display: 'inline-block', width: 16, borderTop: '2px solid var(--ag-primary, #007acc)' }} />
          {t('graph.legendMsg')}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <i style={{ display: 'inline-block', width: 16, borderTop: '2px dashed var(--ag-warning, #bca136)' }} />
          {t('graph.legendWait')}
        </span>
      </div>

      {/* Selected Thread / Cell Detail Card */}
      {selCell && (
        <section
          className="ag-hv-card"
          data-testid="swarm-hive-card"
          aria-live="polite"
          style={{
            marginTop: 12,
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid var(--ag-card-border, rgba(128,128,128,0.2))',
            background: 'var(--ag-card, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{selCell.title}</div>
              {selCell.goal && (
                <div style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)', marginTop: 2 }}>{selCell.goal}</div>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {selCell.count == null && selCell.total
                ? (isZh ? `已完成 ${selCell.done}/${selCell.total}` : `${selCell.done} of ${selCell.total} done`)
                : (isZh ? `${selCell.bees.length} 位成员` : `${selCell.bees.length} bees`)}
            </span>
            <button
              type="button"
              className="ag-icon-btn"
              onClick={() => setSelectedCellId(null)}
              aria-label={t('common.close')}
            >
              ✕
            </button>
          </div>
          {selCell.bees.length === 0 ? (
            <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)' }}>
              {isZh ? '该工作区暂未分配成员。' : 'No members assigned to this cell yet.'}
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selCell.bees.map((n) => {
                const m = snapshot.members[n]
                const st = hs.st[n]
                if (!m) return null
                const imgSrc = getBeeDataUrl(n, m.role, 'landed')
                return (
                  <li key={n}>
                    <button
                      type="button"
                      onClick={() => {
                        if (m.last_post_seq) onJumpToSeq(m.last_post_seq)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '6px 8px',
                        border: 0,
                        borderRadius: 8,
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: m.last_post_seq ? 'pointer' : 'default',
                      }}
                    >
                      {imgSrc && <img src={imgSrc} alt="" width={33} height={27} style={{ imageRendering: 'pixelated', flex: 'none' }} />}
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <strong style={{ fontSize: 13 }}>@{n}</strong>
                          {m.task_hint && (
                            <span style={{ fontSize: 12, color: 'var(--ag-fg-muted, #5d676f)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.task_hint}
                            </span>
                          )}
                        </span>
                        {m.activity && st?.st !== 'unborn' && (
                          <span style={{ display: 'block', fontSize: 11, color: 'var(--ag-fg-muted, #5d676f)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.activity}
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ag-fg-muted, #5d676f)', whiteSpace: 'nowrap' }}>
                        {statusText(st, isZh)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
