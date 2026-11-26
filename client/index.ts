import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// @ts-ignore esbuild bundles .css imports as raw string via loader: { '.css': 'text' }
import stylesCss from './styles.css'
import { swarmClientStore, type LegacyApiLike, type RemoteLike } from './store'
import { SwarmWorkspace } from './components/SwarmWorkspace'
import { HeaderWidget } from './components/HeaderWidget'
import { ToolCard } from './components/ToolCard'
import { SettingsSection } from './components/SettingsSection'

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

  try {
    (ctx as unknown as { inject?: (names: string[], cb: (scope: unknown) => void) => void }).inject?.(
      ['connection', 'remote', 'remote.llm', 'remote.session', 'locale'],
      (scope: unknown) => {
        const services = scope as { connection?: { api?: unknown }; remote?: unknown }
        swarmClientStore.setFacesGetter(() => ({
          api: services.connection?.api as LegacyApiLike | undefined,
          remote: services.remote as RemoteLike | undefined,
        }))
        void swarmClientStore.listModels(true).catch(() => {})
      },
    )
  } catch { /* dynamic inject unavailable on this host — baseline getters stand */ }

  ctx.slots.inject('conversation.view' as never, () =>
    ctx.slots.register(
      { name: 'conversation.view', id: 'ag-swarm', order: 21, label: 'Swarm' } as never,
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
      { name: 'settings.section', id: 'ag-swarm', order: 31, label: 'Hive Swarm' } as never,
      SettingsSection as never,
    ),
  )

  return () => {
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl)
    }
  }
}
