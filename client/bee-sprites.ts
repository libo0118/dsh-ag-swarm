import { createElement, useEffect, useRef } from 'react'
import type { MemberRole, MemberState } from '../src/shared/protocol'

export type BeeVisualState =
  | MemberState
  | 'landed'
  | 'parked'
  | 'needs_you'
  | 'waiting_on'

export interface BeeRamp {
  spec: string
  hi: string
  mid: string
  sh: string
  ol: string
  skh: string
  sk: string
  skd: string
}

export interface PixelBeeProps {
  name: string
  role?: MemberRole | string
  state?: BeeVisualState
  size?: 1 | 2 | 3
  showDot?: boolean
  dotVariant?: 'working' | 'waiting' | 'stuck' | 'error' | 'done' | 'needs'
  framed?: boolean
  className?: string
  title?: string
}

const PALETTE_HUES = [12, 150, 262, 330, 196, 228, 96, 28, 290, 175, 350, 60] as const

const HEX_BG_SVG = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='28' height='24.25' viewBox='0 0 28 24.25'>" +
    "<path d='M14 0l12.12 7v14l-12.12 7L1.88 21V7z' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1.2'/></svg>",
).replace(/'/g, '%27')

export function hashName(s: string): number {
  let acc = 7
  for (let i = 0; i < s.length; i += 1) {
    acc = (acc * 31 + s.charCodeAt(i)) >>> 0
  }
  return acc
}

export function isQueenBee(name: string, role?: string): boolean {
  return name === 'coordinator' || role === 'coordinator'
}

export function getBeeHue(name: string, role?: string): number {
  if (isQueenBee(name, role)) return 46
  return PALETTE_HUES[hashName(String(name || 'worker')) % PALETTE_HUES.length]
}

function hsl2hex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360
  const ss = s / 100
  const ll = l / 100
  const k = (n: number): number => (n + hh / 30) % 12
  const a = ss * Math.min(ll, 1 - ll)
  const f = (n: number): number => ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return (
    '#' +
    [f(0), f(8), f(4)]
      .map((x) => Math.round(x * 255).toString(16).padStart(2, '0'))
      .join('')
  )
}

function shiftHue(h: number, target: number, amt: number): number {
  const d = ((target - h + 540) % 360) - 180
  return h + d * amt
}

export function beeRamp(name: string, role?: string): BeeRamp {
  const h = getBeeHue(name, role)
  return {
    spec: hsl2hex(shiftHue(h, 55, 0.28), 96, 90),
    hi: hsl2hex(shiftHue(h, 55, 0.18), 90, 74),
    mid: hsl2hex(h, 78, 60),
    sh: hsl2hex(shiftHue(h, 265, 0.22), 58, 44),
    ol: hsl2hex(shiftHue(h, 265, 0.35), 42, 19),
    skh: hsl2hex(shiftHue(h, 265, 0.15), 20, 30),
    sk: hsl2hex(shiftHue(h, 265, 0.3), 24, 18),
    skd: hsl2hex(shiftHue(h, 265, 0.45), 32, 10),
  }
}

export function getBeeColor(name: string, role?: string): string {
  return hsl2hex(getBeeHue(name, role), 78, 60)
}

export function getBeeTileBg(name: string, role?: string): string {
  if (isQueenBee(name, role)) {
    return `#1C1B22 url("data:image/svg+xml,${HEX_BG_SVG}")`
  }
  return `color-mix(in srgb, ${getBeeColor(name, role)} 22%, var(--ag-card, #ffffff))`
}

function normalizeDrawState(state?: BeeVisualState): 'working' | 'waiting_on' | 'parked' | 'landed' {
  if (!state || state === 'working' || state === 'needs_you') return 'working'
  if (state === 'waiting_on') return 'waiting_on'
  if (state === 'waiting' || state === 'stopped' || state === 'parked') return 'parked'
  return 'landed'
}

export function drawBee(
  cv: HTMLCanvasElement,
  name: string,
  state: BeeVisualState | undefined,
  frame: 0 | 1,
  role?: string,
): void {
  const W = 22
  const H = 18
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')
  if (!ctx) return
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, W, H)

  const R = beeRamp(name, role)
  const queen = isQueenBee(name, role)
  const norm = normalizeDrawState(state)
  const landed = norm === 'parked' || norm === 'landed'
  const asleep = norm === 'parked'

  const P = (x: number, y: number, col: string): void => {
    if (x < 0 || y < 0 || x >= W || y >= H) return
    ctx.fillStyle = col
    ctx.fillRect(x, y, 1, 1)
  }

  const cx = 11
  const cy = 10.5
  const rx = 7.3
  const ry = 4.8
  const inside = (x: number, y: number): boolean => {
    const nx = (x + 0.5 - cx) / rx
    const ny = (y + 0.5 - cy) / ry
    return nx * nx + ny * ny <= 1
  }

  const Lraw = [-0.42, -0.62, 0.66]
  const Ln = Math.hypot(Lraw[0], Lraw[1], Lraw[2])
  const L = [Lraw[0] / Ln, Lraw[1] / Ln, Lraw[2] / Ln]
  const N4: ReadonlyArray<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const rows = (spec: ReadonlyArray<[number, number, number]>): Array<[number, number]> => {
    const pts: Array<[number, number]> = []
    for (const [y, x0, x1] of spec) {
      for (let x = x0; x <= x1; x += 1) pts.push([x, y])
    }
    return pts
  }

  const drawWing = (pts: ReadonlyArray<[number, number]>, glint: boolean): void => {
    const set = new Set(pts.map((p) => `${p[0]},${p[1]}`))
    for (const [x, y] of pts) {
      const edge = N4.some(([dx, dy]) => !set.has(`${x + dx},${y + dy}`))
      P(x, y, edge ? 'rgba(140,160,192,0.9)' : 'rgba(255,255,255,0.72)')
    }
    if (glint) {
      const inner = pts
        .filter(([x, y]) => !N4.some(([dx, dy]) => !set.has(`${x + dx},${y + dy}`)))
        .sort((a, b) => a[1] - b[1] || a[0] - b[0])
      if (inner[0]) P(inner[0][0], inner[0][1], '#FFFFFF')
    }
  }

  let back: Array<[number, number]> | null = null
  let front: Array<[number, number]>
  if (landed) {
    front = rows([[5, 14, 17], [6, 13, 18]])
  } else if (frame === 0) {
    back = rows([[1, 16, 17], [2, 16, 18], [3, 15, 18], [4, 15, 17], [5, 15, 16]])
    front = rows([[0, 13, 14], [1, 12, 15], [2, 11, 15], [3, 11, 14], [4, 11, 13], [5, 11, 12]])
  } else {
    back = rows([[3, 16, 18], [4, 15, 19], [5, 16, 18]])
    front = rows([[3, 13, 16], [4, 12, 17], [5, 12, 17], [6, 13, 15]])
  }
  if (back) drawWing(back, false)

  const stripe = (x: number, y: number): boolean => {
    const ny = (y + 0.5 - cy) / ry
    const u = x + 0.5 + 1.15 * ny * ny
    return (u > 10.6 && u < 12.5) || (u > 14.3 && u < 16.1) || u > 17.9
  }

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (!inside(x, y)) continue
      const nx = (x + 0.5 - cx) / rx
      const ny = (y + 0.5 - cy) / ry
      const rr = Math.min(1, nx * nx + ny * ny)
      const nz = Math.sqrt(1 - rr)
      const I = nx * L[0] + ny * L[1] + nz * L[2]
      const col = stripe(x, y)
        ? I > 0.8 ? R.skh : I > 0.3 ? R.sk : R.skd
        : I > 0.965 ? R.spec : I > 0.78 ? R.hi : I > 0.26 ? R.mid : R.sh
      P(x, y, col)
    }
  }

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (inside(x, y)) continue
      const nbs = N4.filter(([dx, dy]) => inside(x + dx, y + dy))
      if (nbs.length === 0) continue
      const nx = (x + 0.5 - cx) / rx
      const ny = (y + 0.5 - cy) / ry
      const n = Math.hypot(nx, ny) || 1
      const d = (nx / n) * L[0] + (ny / n) * L[1]
      const nextToStripe = nbs.some(([dx, dy]) => stripe(x + dx, y + dy))
      P(x, y, d > 0.5 && !nextToStripe ? R.sh : R.ol)
    }
  }

  // Stinger
  P(19, 10, R.ol)
  P(20, 10, R.ol)

  // Face: asleep = closed eye line; awake = highlight + dark pupil
  if (asleep) {
    P(6, 10, R.ol)
    P(7, 10, R.ol)
  } else {
    P(6, 9, '#FFFFFF')
    P(7, 9, R.skd)
    P(6, 10, R.skd)
    P(7, 10, R.skd)
  }
  P(5, 11, 'rgba(255,128,150,0.55)')
  P(4, 11, 'rgba(255,128,150,0.35)')

  // Crown for coordinator, antennae for workers
  if (queen) {
    const g1 = '#F7CE5B'
    const g2 = '#FFE9A6'
    const g3 = '#C98A2B'
    for (const [x, y] of [[5, 5], [6, 5], [7, 5], [8, 5], [9, 5]]) P(x, y, g1)
    P(5, 4, g2)
    P(7, 4, g2)
    P(9, 4, g2)
    P(7, 3, g2)
    P(5, 5, g3)
    P(9, 5, g3)
    P(7, 5, '#E4566A')
  } else {
    for (const [x, y] of [[7, 5], [6, 4], [5, 3]]) P(x, y, R.ol)
    P(4, 3, R.sk)
    for (const [x, y] of [[9, 5], [9, 4], [9, 3]]) P(x, y, R.ol)
    P(8, 2, R.sk)
  }

  drawWing(front, true)

  if (asleep) {
    const z = '#8C90A6'
    for (const [x, y] of [
      [0, 0], [1, 0], [2, 0], [3, 0],
      [2, 1], [1, 2],
      [0, 3], [1, 3], [2, 3], [3, 3],
    ]) {
      P(x, y, z)
    }
  }
}

const spriteCanvases = new Map<string, HTMLCanvasElement>()
const beeDataUrls = new Map<string, string>()

function getCachedCanvas(name: string, role: string | undefined, state: BeeVisualState | undefined, frame: 0 | 1): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  const key = `${name}\0${role ?? ''}\0${normalizeDrawState(state)}\0${frame}`
  let cv = spriteCanvases.get(key)
  if (!cv) {
    if (spriteCanvases.size > 1024) spriteCanvases.clear()
    cv = document.createElement('canvas')
    drawBee(cv, name, state, frame, role)
    spriteCanvases.set(key, cv)
  }
  return cv
}

function blitBee(dst: HTMLCanvasElement | null, name: string, role: string | undefined, state: BeeVisualState | undefined, frame: 0 | 1): void {
  if (!dst) return
  const src = getCachedCanvas(name, role, state, frame)
  if (!src) return
  if (dst.width !== src.width) dst.width = src.width
  if (dst.height !== src.height) dst.height = src.height
  const ctx = dst.getContext('2d')
  if (!ctx) return
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, src.width, src.height)
  ctx.drawImage(src, 0, 0)
}

export function getBeeDataUrl(name: string, role?: string, state: BeeVisualState = 'landed'): string {
  const key = `${name}\0${role ?? ''}\0${normalizeDrawState(state)}`
  const existing = beeDataUrls.get(key)
  if (existing !== undefined) return existing
  const cv = getCachedCanvas(name, role, state, 0)
  if (!cv) return ''
  try {
    const url = cv.toDataURL()
    if (beeDataUrls.size > 512) beeDataUrls.clear()
    beeDataUrls.set(key, url)
    return url
  } catch {
    return ''
  }
}

function resolveDotVariant(
  state?: BeeVisualState,
  explicit?: PixelBeeProps['dotVariant'],
): string | null {
  if (explicit) return explicit
  if (state === 'working') return 'working'
  if (state === 'needs_you' || state === 'waiting_on') return 'waiting'
  return null
}

export function PixelBee(props: PixelBeeProps): JSX.Element {
  const { name, role, state = 'working', size = 2, showDot = false, dotVariant, framed = false, className = '', title } = props
  const c0Ref = useRef<HTMLCanvasElement | null>(null)
  const c1Ref = useRef<HTMLCanvasElement | null>(null)
  const isKilled = state === 'killed'
  const norm = isKilled ? 'landed' : normalizeDrawState(state)

  useEffect(() => {
    blitBee(c0Ref.current, name, role, isKilled ? 'landed' : state, 0)
    blitBee(c1Ref.current, name, role, isKilled ? 'landed' : state, 1)
  }, [name, role, state, isKilled])

  const dotCls = showDot ? resolveDotVariant(state, dotVariant) : null
  const cls = [
    'ag-beebox',
    `sz-${size}`,
    isKilled ? 'killed' : '',
    framed ? 'framed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const style = framed ? { background: getBeeTileBg(name, role) } : undefined

  return createElement(
    'span',
    {
      className: cls,
      'data-state': isKilled ? 'landed' : state === 'needs_you' ? 'needs_you' : norm,
      style,
      title,
      'aria-hidden': title ? undefined : true,
    },
    createElement(
      'span',
      { className: 'ag-beewrap' },
      createElement('canvas', { ref: c0Ref, width: 22, height: 18 }),
      createElement('canvas', { ref: c1Ref, width: 22, height: 18 }),
    ),
    dotCls ? createElement('i', { className: `ag-beedot ${dotCls}`, 'aria-hidden': true }) : null,
  )
}
