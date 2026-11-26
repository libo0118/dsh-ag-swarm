import { useEffect, useState } from 'react'
import type {
  BoardMessage,
  MemberTranscriptPayload,
  RawFilesPayload,
  SseEventPayload,
  SwarmSnapshotPayload,
  SwarmSummary,
  UiActionRequest,
} from '../src/shared/protocol'

export interface CatalogModelOption {
  provider: string
  model: string
  label: string
  efforts?: string[]
}

export type SwarmSyncState = 'connecting' | 'live' | 'reconnecting' | 'snapshot' | 'stopped'

export interface SwarmClientState {
  swarms: SwarmSummary[]
  activeSwarmId: string | null
  sessionId: string | undefined
  snapshot: SwarmSnapshotPayload | null
  loading: boolean
  error: string | null
  sync: SwarmSyncState
  models: CatalogModelOption[]
  modelsLoading: boolean
  lastUpdatedAt: number
}

interface RemoteReply<T> {
  ok: boolean
  value?: T
  error?: { code?: string; message?: string }
}

interface SessionCatalogModel {
  id?: string
  name?: string
  efforts?: string[]
  reasoningEfforts?: string[]
}

interface SessionCatalogGroup {
  id?: string
  name?: string
  models?: SessionCatalogModel[]
}

export interface RemoteLike {
  session?: {
    modelCatalog(): Promise<RemoteReply<{ groups?: SessionCatalogGroup[] }>>
  }
  llm?: {
    listProviders(): Promise<RemoteReply<Array<{ id?: string; name?: string }>>>
    listConfigurableProviders(): Promise<RemoteReply<Array<{ provider?: string; displayName?: string; settingsNs?: string }>>>
    discoverModels(settingsNs: string, request: { provider?: string }): Promise<RemoteReply<SessionCatalogModel[]>>
  }
  $on?(event: string, handler: () => void): () => void
}

export interface LegacyApiLike {
  llm: {
    providers(input: Record<string, never>): Promise<{ result: { ok: boolean; value?: { providers?: Array<{ provider?: string; displayName?: string }> } } }>
    models(input: Record<string, never>): Promise<{ result: { ok: boolean; value?: { groups?: SessionCatalogGroup[] } } }>
  }
}

export interface CatalogFaces {
  remote?: RemoteLike
  api?: LegacyApiLike
}

type StoreListener = (state: SwarmClientState) => void

let getFaces: () => CatalogFaces = () => ({})

async function fetchCatalogModels(): Promise<CatalogModelOption[]> {
  const faces = getFaces()
  const remote = faces.remote
  const collected = new Map<string, CatalogModelOption>()

  const addModel = (provider: string, id: string, name?: string, efforts?: string[]): void => {
    const key = `${provider}/${id}`
    if (!collected.has(key)) {
      collected.set(key, {
        provider,
        model: id,
        label: name && name !== id ? `${name} (${provider})` : `${provider}/${id}`,
        ...(efforts && efforts.length > 0 ? { efforts } : {}),
      })
    }
  }

  if (typeof remote?.session?.modelCatalog === 'function') {
    try {
      const reply = await remote.session.modelCatalog()
      if (reply.ok && Array.isArray(reply.value?.groups)) {
        for (const group of reply.value.groups) {
          if (!group?.id) continue
          for (const m of group.models ?? []) {
            if (!m?.id) continue
            addModel(group.id, m.id, m.name, m.efforts ?? m.reasoningEfforts)
          }
        }
        if (collected.size > 0) return sortModels([...collected.values()])
      }
    } catch { /* fall through to remote.llm */ }
  }

  if (remote?.llm) {
    try {
      const [provReply, confReply] = await Promise.all([
        remote.llm.listProviders(),
        remote.llm.listConfigurableProviders().catch((): RemoteReply<Array<{ provider?: string; settingsNs?: string }>> => ({ ok: false })),
      ])
      const registered = new Set<string>()
      if (provReply.ok) {
        for (const p of provReply.value ?? []) {
          if (p?.id) registered.add(p.id)
        }
      }
      const confs = confReply.ok ? confReply.value ?? [] : []
      await Promise.all(
        confs.map(async (entry) => {
          if (!entry?.provider || !entry.settingsNs || !registered.has(entry.provider)) return
          try {
            const res = await remote.llm!.discoverModels(entry.settingsNs, { provider: entry.provider })
            if (!res.ok) return
            for (const m of res.value ?? []) {
              if (m?.id) addModel(entry.provider, m.id, m.name, m.efforts ?? m.reasoningEfforts)
            }
          } catch { /* skip provider that refuses discovery */ }
        }),
      )
      if (collected.size > 0) return sortModels([...collected.values()])
    } catch { /* fall through to legacy api */ }
  }

  if (faces.api?.llm) {
    try {
      const modelsReply = await faces.api.llm.models({})
      if (modelsReply.result?.ok) {
        for (const group of modelsReply.result.value?.groups ?? []) {
          if (!group?.id) continue
          for (const m of group.models ?? []) {
            if (m?.id) addModel(group.id, m.id, m.name, m.efforts ?? m.reasoningEfforts)
          }
        }
      }
    } catch { /* degraded: no live catalog */ }
  }

  return sortModels([...collected.values()])
}

function sortModels(list: CatalogModelOption[]): CatalogModelOption[] {
  return list.sort((a, b) =>
    a.provider === b.provider ? a.model.localeCompare(b.model) : a.provider.localeCompare(b.provider),
  )
}

function normalizeSwarmsResponse(raw: unknown): SwarmSummary[] {
  if (Array.isArray(raw)) return raw as SwarmSummary[]
  if (raw && typeof raw === 'object' && Array.isArray((raw as { swarms?: unknown }).swarms)) {
    return (raw as { swarms: SwarmSummary[] }).swarms
  }
  return []
}

function unwrapSnapshotResponse(raw: unknown): { unchanged?: boolean; snapshot: SwarmSnapshotPayload | null } {
  if (!raw || typeof raw !== 'object') return { snapshot: null }
  const obj = raw as Record<string, unknown>
  if (obj.unchanged === true) return { unchanged: true, snapshot: null }
  if (obj.snapshot && typeof obj.snapshot === 'object') {
    return { snapshot: obj.snapshot as SwarmSnapshotPayload }
  }
  if (typeof obj.swarm_id === 'string') {
    return { snapshot: obj as unknown as SwarmSnapshotPayload }
  }
  return { snapshot: null }
}

export class SwarmClientStore {
  private state: SwarmClientState = {
    swarms: [],
    activeSwarmId: null,
    sessionId: undefined,
    snapshot: null,
    loading: false,
    error: null,
    sync: 'stopped',
    models: [],
    modelsLoading: false,
    lastUpdatedAt: 0,
  }

  private readonly listeners = new Set<StoreListener>()
  private source: EventSource | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private refetchTimer: ReturnType<typeof setTimeout> | null = null
  private inFlight: AbortController | null = null
  private refs = 0
  private stopped = true
  private generation = 0
  private trailing = false
  private etag = ''
  private manualSwarmId: string | null = null
  private modelsFetched = false

  setFacesGetter(getter: () => CatalogFaces): void {
    getFaces = getter
  }

  getState(): SwarmClientState {
    return this.state
  }

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => {
      this.listeners.delete(listener)
    }
  }

  retain(): () => void {
    this.refs += 1
    if (this.refs === 1) this.start()
    let released = false
    return () => {
      if (released) return
      released = true
      this.refs = Math.max(0, this.refs - 1)
      if (this.refs === 0) this.stop()
    }
  }

  setSessionId(sessionId?: string): void {
    if (this.state.sessionId === sessionId) return
    this.manualSwarmId = null
    this.etag = ''
    this.patch({ sessionId, activeSwarmId: null, snapshot: null, loading: true, error: null })
    if (!this.stopped) {
      void this.refresh({ force: true })
    }
  }

  async selectSwarm(swarmId: string | null): Promise<SwarmSnapshotPayload | null> {
    this.manualSwarmId = swarmId
    this.etag = ''
    this.patch({ activeSwarmId: swarmId, loading: true, error: null })
    return this.refresh({ force: true, swarmId: swarmId ?? undefined })
  }

  async listSwarms(): Promise<SwarmSummary[]> {
    const res = await fetch('/ag-swarm/api/swarms', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const swarms = normalizeSwarmsResponse(await res.json())
    this.patch({ swarms })
    return swarms
  }

  async listModels(force = false): Promise<CatalogModelOption[]> {
    if (this.modelsFetched && !force && this.state.models.length > 0) {
      return this.state.models
    }
    this.patch({ modelsLoading: true })
    try {
      const models = await fetchCatalogModels()
      this.modelsFetched = true
      this.patch({ models, modelsLoading: false })
      return models
    } catch {
      this.patch({ modelsLoading: false })
      return this.state.models
    }
  }

  async fetchMessagesBefore(
    swarmId: string,
    beforeSeq: number,
    limit = 200,
  ): Promise<{ messages: BoardMessage[]; hasMore: boolean }> {
    const q = new URLSearchParams({
      swarmId,
      before: String(beforeSeq),
      limit: String(limit),
    })
    const res = await fetch(`/ag-swarm/api/swarm/messages?${q.toString()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = (await res.json()) as unknown
    let older: BoardMessage[] = []
    let hasMore = false
    if (Array.isArray(raw)) {
      older = raw as BoardMessage[]
      hasMore = older.length >= limit
    } else if (raw && typeof raw === 'object') {
      const obj = raw as { messages?: BoardMessage[]; hasMore?: boolean; messagesOffset?: number }
      older = Array.isArray(obj.messages) ? obj.messages : []
      hasMore = typeof obj.hasMore === 'boolean' ? obj.hasMore : (obj.messagesOffset ?? 0) > 0
    }
    const snap = this.state.snapshot
    if (snap && snap.swarm_id === swarmId && older.length > 0) {
      const seen = new Set(snap.messages.map((m) => m.seq))
      const prepend = older.filter((m) => !seen.has(m.seq))
      const merged = [...prepend, ...snap.messages].sort((a, b) => a.seq - b.seq)
      const nextOffset = hasMore ? Math.max(0, snap.messagesOffset - prepend.length) : 0
      this.patch({
        snapshot: {
          ...snap,
          messages: merged,
          messagesOffset: nextOffset,
        },
      })
    } else if (snap && snap.swarm_id === swarmId && !hasMore && snap.messagesOffset > 0) {
      this.patch({ snapshot: { ...snap, messagesOffset: 0 } })
    }
    return { messages: older, hasMore }
  }

  async fetchRawFiles(swarmId: string): Promise<RawFilesPayload> {
    const q = new URLSearchParams({ swarmId })
    const res = await fetch(`/ag-swarm/api/swarm/raw?${q.toString()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as RawFilesPayload
  }

  async fetchMemberTranscript(swarmId: string, member: string): Promise<MemberTranscriptPayload> {
    const q = new URLSearchParams({ swarmId, member })
    const res = await fetch(`/ag-swarm/api/member-transcript?${q.toString()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as MemberTranscriptPayload
  }

  async postAction(req: UiActionRequest): Promise<Record<string, unknown>> {
    const res = await fetch('/ag-swarm/api/action', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
    })
    let json: Record<string, unknown> = {}
    try {
      json = (await res.json()) as Record<string, unknown>
    } catch { /* non-json error body */ }
    if (!res.ok || json.ok === false) {
      const msg = typeof json.error === 'string' ? json.error : `HTTP ${res.status}`
      throw new Error(msg)
    }
    this.scheduleRefetch(60)
    return json
  }

  frameUrl(swarmId: string, framePath: string): string {
    const q = new URLSearchParams({ swarmId, path: framePath })
    return `/ag-swarm/api/frame?${q.toString()}`
  }

  private start(): void {
    if (!this.stopped) return
    this.stopped = false
    const gen = ++this.generation
    this.patch({ sync: typeof EventSource === 'undefined' ? 'snapshot' : 'connecting', error: null })
    void this.refresh({ force: true })
    void this.listModels()
    this.openEventSource(gen)
  }

  private openEventSource(gen: number): void {
    if (this.stopped || gen !== this.generation || typeof EventSource === 'undefined') return
    if (this.source) {
      this.source.close()
      this.source = null
    }
    let es: EventSource
    try {
      es = new EventSource('/ag-swarm/api/events')
    } catch {
      this.patch({ sync: 'snapshot' })
      return
    }
    this.source = es
    const owns = (): boolean => !this.stopped && this.generation === gen && this.source === es

    es.onopen = () => {
      if (!owns()) return
      this.patch({ sync: 'live', error: null })
      this.scheduleRefetch(80)
    }
    es.onmessage = (evt) => {
      if (!owns()) return
      try {
        const payload = JSON.parse(evt.data) as SseEventPayload
        if (payload.type === 'ping') return
        if (payload.type === 'connected') {
          this.patch({ sync: 'live' })
          return
        }
        if (payload.type === 'swarm_update') {
          this.scheduleRefetch(120)
        }
      } catch {
        this.scheduleRefetch(150)
      }
    }
    es.onerror = () => {
      if (!owns()) return
      this.patch({ sync: 'reconnecting' })
      if (es.readyState === EventSource.CLOSED) {
        es.close()
        this.source = null
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null
          this.openEventSource(gen)
        }, 2500)
      }
    }
  }

  private stop(): void {
    this.stopped = true
    this.generation += 1
    if (this.source) {
      this.source.close()
      this.source = null
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.refetchTimer) {
      clearTimeout(this.refetchTimer)
      this.refetchTimer = null
    }
    this.inFlight?.abort()
    this.inFlight = null
    this.trailing = false
    this.patch({ sync: 'stopped' })
  }

  private scheduleRefetch(delay = 140): void {
    if (this.stopped) return
    if (this.inFlight) {
      this.trailing = true
      return
    }
    if (this.refetchTimer) return
    this.refetchTimer = setTimeout(() => {
      this.refetchTimer = null
      void this.refresh()
    }, delay)
  }

  async refresh(opts: { force?: boolean; sessionId?: string; swarmId?: string } = {}): Promise<SwarmSnapshotPayload | null> {
    if (this.refetchTimer) {
      clearTimeout(this.refetchTimer)
      this.refetchTimer = null
    }
    if (this.inFlight && !opts.force) {
      this.trailing = true
      return this.state.snapshot
    }
    if (this.inFlight && opts.force) {
      this.inFlight.abort()
    }

    const gen = this.generation
    const controller = new AbortController()
    this.inFlight = controller
    this.trailing = false
    const owns = (): boolean => !this.stopped && gen === this.generation && this.inFlight === controller && !controller.signal.aborted

    try {
      const swarmsRes = await fetch('/ag-swarm/api/swarms', { signal: controller.signal, cache: 'no-store' })
      let swarms = this.state.swarms
      if (swarmsRes.ok) {
        swarms = normalizeSwarmsResponse(await swarmsRes.json())
      }
      if (!owns()) return this.state.snapshot

      const targetSession = opts.sessionId ?? this.state.sessionId
      const targetSwarm = opts.swarmId ?? this.manualSwarmId ?? undefined
      const q = new URLSearchParams()
      if (targetSwarm) q.set('swarmId', targetSwarm)
      else if (targetSession) q.set('sessionId', targetSession)
      if (!opts.force && this.etag && this.state.snapshot) {
        q.set('etag', this.etag)
      }

      const snapRes = await fetch(`/ag-swarm/api/swarm${q.toString() ? `?${q.toString()}` : ''}`, {
        signal: controller.signal,
        cache: 'no-store',
      })
      if (!owns()) return this.state.snapshot

      if (snapRes.status === 404 || snapRes.status === 204) {
        // Fallback to latest swarm from list if session has no swarm yet and none was manually selected
        if (!targetSwarm && targetSession && swarms.length > 0) {
          const fallback = swarms[0]
          const fbRes = await fetch(`/ag-swarm/api/swarm?swarmId=${encodeURIComponent(fallback.swarm_id)}`, {
            signal: controller.signal,
            cache: 'no-store',
          })
          if (owns() && fbRes.ok) {
            const fbParsed = unwrapSnapshotResponse(await fbRes.json())
            if (fbParsed.snapshot) {
              this.etag = fbParsed.snapshot.etag || ''
              this.patch({
                swarms,
                activeSwarmId: fbParsed.snapshot.swarm_id,
                snapshot: fbParsed.snapshot,
                loading: false,
                error: null,
                lastUpdatedAt: Date.now(),
              })
              return fbParsed.snapshot
            }
          }
        }
        this.etag = ''
        this.patch({ swarms, activeSwarmId: null, snapshot: null, loading: false, error: null, lastUpdatedAt: Date.now() })
        return null
      }

      if (!snapRes.ok) throw new Error(`HTTP ${snapRes.status}`)
      const parsed = unwrapSnapshotResponse(await snapRes.json())
      if (!owns()) return this.state.snapshot

      if (parsed.unchanged) {
        this.patch({ swarms, loading: false, error: null, lastUpdatedAt: Date.now() })
        return this.state.snapshot
      }

      const snap = parsed.snapshot
      this.etag = snap?.etag || ''
      this.patch({
        swarms,
        activeSwarmId: snap?.swarm_id ?? null,
        snapshot: snap,
        loading: false,
        error: null,
        lastUpdatedAt: Date.now(),
      })
      return snap
    } catch (err) {
      if (!owns()) return this.state.snapshot
      const msg = err instanceof Error ? err.message : String(err)
      this.patch({ loading: false, error: msg })
      return this.state.snapshot
    } finally {
      if (owns()) {
        this.inFlight = null
        if (this.trailing) {
          this.trailing = false
          this.scheduleRefetch(140)
        }
      }
    }
  }

  private patch(partial: Partial<SwarmClientState>): void {
    this.state = { ...this.state, ...partial }
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }
}

export const swarmClientStore = new SwarmClientStore()

export interface UseSwarmStoreResult extends SwarmClientState {
  store: SwarmClientStore
  refresh: (force?: boolean) => Promise<SwarmSnapshotPayload | null>
  selectSwarm: (swarmId: string | null) => Promise<SwarmSnapshotPayload | null>
  postAction: (req: UiActionRequest) => Promise<Record<string, unknown>>
  fetchMessagesBefore: (swarmId: string, beforeSeq: number, limit?: number) => Promise<{ messages: BoardMessage[]; hasMore: boolean }>
  fetchRawFiles: (swarmId: string) => Promise<RawFilesPayload>
  fetchMemberTranscript: (swarmId: string, member: string) => Promise<MemberTranscriptPayload>
  listModels: (force?: boolean) => Promise<CatalogModelOption[]>
}

export function useSwarmStore(sessionId?: string): UseSwarmStoreResult {
  const [state, setState] = useState<SwarmClientState>(() => swarmClientStore.getState())

  useEffect(() => {
    const release = swarmClientStore.retain()
    const unsub = swarmClientStore.subscribe(setState)
    return () => {
      unsub()
      release()
    }
  }, [])

  useEffect(() => {
    if (sessionId !== undefined) {
      swarmClientStore.setSessionId(sessionId)
    }
  }, [sessionId])

  return {
    ...state,
    store: swarmClientStore,
    refresh: (force = false) => swarmClientStore.refresh({ force }),
    selectSwarm: (swarmId) => swarmClientStore.selectSwarm(swarmId),
    postAction: (req) => swarmClientStore.postAction(req),
    fetchMessagesBefore: (swarmId, beforeSeq, limit) => swarmClientStore.fetchMessagesBefore(swarmId, beforeSeq, limit),
    fetchRawFiles: (swarmId) => swarmClientStore.fetchRawFiles(swarmId),
    fetchMemberTranscript: (swarmId, member) => swarmClientStore.fetchMemberTranscript(swarmId, member),
    listModels: (force) => swarmClientStore.listModels(force),
  }
}
