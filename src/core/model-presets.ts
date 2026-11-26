import fs from 'node:fs'
import path from 'node:path'
import type { RoleModelMap, RoleModelPreset } from '../shared/protocol.js'

const ROLE_KEY_RE = /^[a-z0-9][a-z0-9_-]{0,23}$/
const WIN_RETRY_CODES = new Set(['EPERM', 'EACCES', 'EBUSY', 'ENOTEMPTY'])

const EXPLORER_RE = /explorer|research|audit|scout|inspect|discover/i
const VERIFIER_RE = /verifier|review|qa|test|check|validate/i
const MONITOR_RE = /monitor|watch|stall/i
const AUTHOR_RE = /author|builder|dev|coder|impl|fix|backend|frontend|ui|api|worker/i

export interface ResolveWorkerModelInput {
  explicitModel?: string
  explicitProvider?: string
  explicitEffort?: string
  rolePreset?: string
  workerName: string
  presets: RoleModelMap
}

export interface ResolvedWorkerModel {
  model: string
  provider?: string
  reasoningEffort?: string
  label?: string
  source: 'explicit' | 'role_preset' | 'name_match' | 'inferred_role' | 'default'
  matchedRole?: string
}

function atomicWriteFileSync(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const tmp = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2, 8)}.tmp`
  fs.writeFileSync(tmp, content, 'utf-8')
  let lastErr: unknown
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      fs.renameSync(tmp, filePath)
      return
    } catch (err: unknown) {
      lastErr = err
      const code = (err as NodeJS.ErrnoException | undefined)?.code
      if (!code || !WIN_RETRY_CODES.has(code)) break
      const until = Date.now() + 15 * (attempt + 1)
      while (Date.now() < until) {
        // brief retry window for Windows file locks
      }
    }
  }
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    try { fs.unlinkSync(tmp) } catch { /* ignore */ }
    return
  } catch {
    try { fs.unlinkSync(tmp) } catch { /* ignore */ }
    throw lastErr
  }
}

export function sanitizeRoleModelMap(raw: unknown): RoleModelMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: RoleModelMap = {}
  for (const [rawKey, rawVal] of Object.entries(raw as Record<string, unknown>)) {
    const key = rawKey.trim().toLowerCase()
    if (!ROLE_KEY_RE.test(key)) continue
    if (!rawVal || typeof rawVal !== 'object' || Array.isArray(rawVal)) continue
    const rec = rawVal as Record<string, unknown>
    const model = typeof rec.model === 'string' ? rec.model.trim() : ''
    if (!model) continue
    const provider = typeof rec.provider === 'string' && rec.provider.trim() ? rec.provider.trim() : undefined
    const reasoningEffort =
      typeof rec.reasoningEffort === 'string' && rec.reasoningEffort.trim()
        ? rec.reasoningEffort.trim()
        : undefined
    const label = typeof rec.label === 'string' && rec.label.trim() ? rec.label.trim() : undefined
    const entry: RoleModelPreset = {
      model,
      ...(provider ? { provider } : {}),
      ...(reasoningEffort ? { reasoningEffort } : {}),
      ...(label ? { label } : {}),
    }
    out[key] = entry
  }
  return out
}

function matchesCustomRoleKey(lowerWorkerName: string, roleKey: string): boolean {
  if (lowerWorkerName === roleKey) return true
  const segments = lowerWorkerName.split(/[-_]+/).filter(Boolean)
  if (segments.includes(roleKey)) return true
  if (
    lowerWorkerName.startsWith(`${roleKey}-`)
    || lowerWorkerName.endsWith(`-${roleKey}`)
    || lowerWorkerName.includes(`-${roleKey}-`)
    || lowerWorkerName.startsWith(`${roleKey}_`)
    || lowerWorkerName.endsWith(`_${roleKey}`)
    || lowerWorkerName.includes(`_${roleKey}_`)
  ) {
    return true
  }
  return false
}

export function inferBuiltinRoleFromName(workerName: string): 'explorer' | 'verifier' | 'monitor' | 'author' | undefined {
  if (EXPLORER_RE.test(workerName)) return 'explorer'
  if (VERIFIER_RE.test(workerName)) return 'verifier'
  if (MONITOR_RE.test(workerName)) return 'monitor'
  if (AUTHOR_RE.test(workerName)) return 'author'
  return undefined
}

export function resolveModelForWorker(input: ResolveWorkerModelInput): ResolvedWorkerModel | undefined {
  const explicitModel = typeof input.explicitModel === 'string' ? input.explicitModel.trim() : ''
  const explicitProvider = typeof input.explicitProvider === 'string' && input.explicitProvider.trim()
    ? input.explicitProvider.trim()
    : undefined
  const explicitEffort = typeof input.explicitEffort === 'string' && input.explicitEffort.trim()
    ? input.explicitEffort.trim()
    : undefined

  // 1) Explicit model override always wins
  if (explicitModel) {
    return {
      model: explicitModel,
      ...(explicitProvider ? { provider: explicitProvider } : {}),
      ...(explicitEffort ? { reasoningEffort: explicitEffort } : {}),
      source: 'explicit',
    }
  }

  const presets = input.presets ?? {}

  const fromPreset = (
    roleKey: string,
    preset: RoleModelPreset,
    source: ResolvedWorkerModel['source'],
  ): ResolvedWorkerModel => ({
    model: preset.model,
    ...(explicitProvider ?? preset.provider ? { provider: explicitProvider ?? preset.provider } : {}),
    ...(explicitEffort ?? preset.reasoningEffort ? { reasoningEffort: explicitEffort ?? preset.reasoningEffort } : {}),
    ...(preset.label ? { label: preset.label } : {}),
    source,
    matchedRole: roleKey,
  })

  // 2) Explicit role_preset key
  const roleKey = typeof input.rolePreset === 'string' ? input.rolePreset.trim().toLowerCase() : ''
  if (roleKey && presets[roleKey]) {
    return fromPreset(roleKey, presets[roleKey]!, 'role_preset')
  }

  // 3) Custom/built-in preset key exact or segment match against workerName (excluding 'default')
  const lowerName = input.workerName.trim().toLowerCase()
  const nonDefaultEntries = Object.entries(presets).filter(([k]) => k !== 'default')
  const exactMatch = nonDefaultEntries.find(([k]) => lowerName === k)
  if (exactMatch) {
    return fromPreset(exactMatch[0], exactMatch[1], 'name_match')
  }
  const segmentMatch = nonDefaultEntries.find(([k]) => matchesCustomRoleKey(lowerName, k))
  if (segmentMatch) {
    return fromPreset(segmentMatch[0], segmentMatch[1], 'name_match')
  }

  // 4) Semantic inference of built-in role from workerName
  const inferred = inferBuiltinRoleFromName(lowerName)
  if (inferred && presets[inferred]) {
    return fromPreset(inferred, presets[inferred]!, 'inferred_role')
  }

  // 5) Fallback to default preset
  if (presets.default) {
    return fromPreset('default', presets.default, 'default')
  }

  // 6) Inherit coordinator / main conversation model
  return undefined
}

export class ModelPresetStore {
  private readonly filePath: string
  private presets: RoleModelMap = {}

  constructor(storageDir: string) {
    this.filePath = path.join(path.resolve(storageDir), 'model-presets.json')
    this.loadFromDisk()
  }

  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.filePath)) {
        this.presets = {}
        return
      }
      const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf-8')) as unknown
      this.presets = sanitizeRoleModelMap(raw)
    } catch {
      this.presets = {}
    }
  }

  getAll(): RoleModelMap {
    const copy: RoleModelMap = {}
    for (const [k, v] of Object.entries(this.presets)) {
      copy[k] = { ...v }
    }
    return copy
  }

  setAll(raw: unknown): RoleModelMap {
    const clean = sanitizeRoleModelMap(raw)
    this.presets = clean
    atomicWriteFileSync(this.filePath, JSON.stringify(clean, null, 2) + '\n')
    return this.getAll()
  }
}
