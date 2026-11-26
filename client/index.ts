import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// @ts-ignore esbuild bundles .css imports as raw string via loader: { '.css': 'text' }
import stylesCss from './styles.css'
import { syncHostLocale, t } from './i18n'
import { swarmClientStore, type LegacyApiLike, type RemoteLike } from './store'
import { SwarmWorkspace } from './components/SwarmWorkspace'
import { HeaderWidget } from './components/HeaderWidget'
import { ToolCard } from './components/ToolCard'
import { SettingsSection } from './components/SettingsSection'

interface HostLocaleLike {
  current?: string
  locale?: string
  language?: string
  get?: () => string | undefined
  subscribe?: (fn: () => void) => (() => void) | void
}

function readHostLocale(loc: HostLocaleLike | undefined): string | undefined {
  if (!loc) return undefined
  try {
    return loc.current ?? loc.locale ?? loc.language ?? loc.get?.()
  } catch {
    return undefined
  }
}

export const name = 'dsh-ag-swarm-client'

/**
 * Deliberately only hard-inject `slots` so host version differences on
 * `remote` / `locale` / `connection` never stall client activation.
 */
export const inject = ['slots']

const STYLE_ATTR = 'data-dsh-ag-swarm'

export function apply(ctx: ClientContext): (() => void) | void {
  let styleEl: HTMLStyleElement | null = null
  if (typeof document !== 'undefined') {
    styleEl = document.head.querySelector<HTMLStyleElement>(`style[${STYLE_ATTR}]`)
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.setAttribute(STYLE_ATTR, '')
      styleEl.textContent = typeof stylesCss === 'string' ? stylesCss : ''
      document.head.appendChild(styleEl)
    }
  }

  // Defensive baseline getters first; dynamic ctx.inject upgrades them when available.
  swarmClientStore.setFacesGetter(() => {
    let api: LegacyApiLike | undefined
    try {
      api = (ctx.get('connection' as never) as { api?: unknown } | undefined)?.api as LegacyApiLike | undefined
    } catch { api = undefined }
    let remote: RemoteLike | undefined
    try {
      remote = (ctx as unknown as { remote?: unknown }).remote as RemoteLike | undefined
    } catch { remote = undefined }
    return { api, remote }
  })

  let offHostLocale: (() => void) | undefined
  try {
    const initialLoc = (ctx as unknown as { locale?: HostLocaleLike }).locale
    syncHostLocale(readHostLocale(initialLoc))
  } catch { /* ignore */ }

  try {
    (ctx as unknown as { inject?: (names: string[], cb: (scope: unknown) => void) => void }).inject?.(
      ['connection', 'remote', 'remote.llm', 'remote.session', 'locale'],
      (scope: unknown) => {
        const services = scope as { connection?: { api?: unknown }; remote?: unknown; locale?: HostLocaleLike }
        swarmClientStore.setFacesGetter(() => ({
          api: services.connection?.api as LegacyApiLike | undefined,
          remote: services.remote as RemoteLike | undefined,
        }))
        syncHostLocale(readHostLocale(services.locale))
        const unsub = services.locale?.subscribe?.(() => {
          syncHostLocale(readHostLocale(services.locale))
        })
        if (typeof unsub === 'function') offHostLocale = unsub
        void swarmClientStore.listModels(true).catch(() => {})
      },
    )
  } catch { /* dynamic inject unavailable on this host — baseline getters stand */ }

  ctx.slots.inject('conversation.view' as never, () =>
    ctx.slots.register(
      { name: 'conversation.view', id: 'ag-swarm', order: 21, label: t('slot.swarm') } as never,
      SwarmWorkspace as never,
    ),
  )

  ctx.slots.inject('conversation.session.header.actions' as never, () =>
    ctx.slots.register(
      { name: 'conversation.session.header.actions', id: 'ag-swarm-status' } as never,
      HeaderWidget as never,
    ),
  )

  ctx.slots.inject('tool.call.toolview' as never, () =>
    ctx.slots.register(
      { name: 'tool.call.toolview', key: 'swarm' } as never,
      ToolCard as never,
    ),
  )

  ctx.slots.inject('settings.section' as never, () =>
    ctx.slots.register(
      { name: 'settings.section', id: 'ag-swarm', order: 31, label: t('slot.settings') } as never,
      SettingsSection as never,
    ),
  )

  return () => {
    try { offHostLocale?.() } catch { /* ignore */ }
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl)
    }
  }
}
