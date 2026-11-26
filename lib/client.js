window.__ModuleLoader__.load({
	id: "dsh-ag-swarm",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		"use strict";
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
		var __export = (target, all) => {
		  for (var name2 in all)
		    __defProp(target, name2, { get: all[name2], enumerable: true });
		};
		var __copyProps = (to, from, except, desc) => {
		  if (from && typeof from === "object" || typeof from === "function") {
		    for (let key of __getOwnPropNames(from))
		      if (!__hasOwnProp.call(to, key) && key !== except)
		        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
		  }
		  return to;
		};
		var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
		var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
		
		// client/index.ts
		var index_exports = {};
		__export(index_exports, {
		  apply: () => apply,
		  inject: () => inject,
		  name: () => name
		});
		module.exports = __toCommonJS(index_exports);
		
		// client/styles.css
		var styles_default = '/*\n * dsh-ag-swarm Web UI styles \u2014 Antigravity quiet monochrome + pixel bee Hive\n * Strictly scoped under .ag-* selectors; maps DSH --dsw-alias-* tokens with\n * automatic light/dark fallbacks.\n */\n:root {\n  --ag-bg: var(--dsw-alias-bg-primary, var(--dsw-alias-bg-base, var(--background, #f7f7f8)));\n  --ag-card: var(--dsw-alias-bg-elevated, var(--dsw-specific-menu, var(--card, #ffffff)));\n  --ag-secondary: var(--dsw-alias-interactive-bg-hover, var(--secondary, #e6e7e9));\n  --ag-muted: var(--dsw-alias-markdown-code-block, var(--muted, #eff0f1));\n  --ag-fg: var(--dsw-alias-text-primary, var(--dsw-alias-label-primary, var(--foreground, #1d1f21)));\n  --ag-fg-2: var(--dsw-alias-label-secondary, var(--secondary-foreground, #3d4348));\n  --ag-fg-muted: var(--dsw-alias-label-tertiary, var(--muted-foreground, #5d676f));\n  --ag-fg-faint: var(--dsw-alias-label-caption, var(--placeholder, #9da5ab));\n  --ag-border: var(--dsw-alias-border-subtle, var(--dsw-alias-border-l1, var(--border, rgba(128, 128, 128, 0.16))));\n  --ag-card-border: var(--dsw-alias-border-l2, var(--dsw-alias-border-subtle, var(--card-border, rgba(128, 128, 128, 0.2))));\n  --ag-primary: var(--dsw-static-blue-450, var(--primary, #007acc));\n  --ag-primary-fg: var(--primary-foreground, #ffffff);\n  --ag-success: #63984f;\n  --ag-warning: #bca136;\n  --ag-error: var(--dsw-alias-state-error-primary, #cb3d3d);\n  --ag-hover: color-mix(in srgb, var(--ag-fg) 5%, transparent);\n  --ag-press: color-mix(in srgb, var(--ag-fg) 9%, transparent);\n  --ag-ring: color-mix(in srgb, var(--ag-primary) 70%, transparent);\n  --ag-line: color-mix(in srgb, var(--ag-fg) 9%, transparent);\n  --ag-fill: color-mix(in srgb, var(--ag-fg) 6%, transparent);\n  --ag-field: color-mix(in srgb, var(--ag-fg) 5%, transparent);\n  --ag-font: var(--dsw-font-family-sans, "Google Sans Flex", "Google Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);\n  --ag-mono: var(--ds-font-family-code, "Google Sans Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);\n  --ag-text-2xs: 11px;\n  --ag-text-xs: 12px;\n  --ag-text-sm: 13px;\n  --ag-text-base: 14px;\n  --ag-r-sm: 4px;\n  --ag-r-md: 6px;\n  --ag-r-lg: 8px;\n  --ag-pad-x: 16px;\n  --ag-col: 760px;\n  --ag-inline: max(var(--ag-pad-x), calc((100% - var(--ag-col)) / 2));\n}\n\n.ag-root[data-theme="dark"],\n.ag-hpop[data-theme="dark"] {\n  --ag-success: #7aae66;\n  --ag-warning: #cab43e;\n  --ag-hover: color-mix(in srgb, var(--ag-fg) 6%, transparent);\n  --ag-press: color-mix(in srgb, var(--ag-fg) 11%, transparent);\n  --ag-fill: color-mix(in srgb, var(--ag-fg) 8%, transparent);\n  --ag-field: color-mix(in srgb, var(--ag-fg) 6.5%, transparent);\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --ag-success: #7aae66;\n    --ag-warning: #cab43e;\n  }\n}\n\n.ag-root {\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  background: var(--ag-bg);\n  color: var(--ag-fg);\n  font-family: var(--ag-font);\n  font-size: var(--ag-text-base);\n  line-height: 1.5;\n  overflow: hidden;\n  box-sizing: border-box;\n  -webkit-font-smoothing: antialiased;\n}\n.ag-root *, .ag-root *::before, .ag-root *::after,\n.ag-hpop *, .ag-tv * { box-sizing: border-box; }\n.ag-root button, .ag-root input, .ag-root select, .ag-root textarea { font: inherit; color: inherit; }\n.ag-root button { cursor: pointer; }\n.ag-root :focus-visible { outline: 2px solid var(--ag-ring); outline-offset: 1px; }\n.ag-root code, .ag-root pre { font-family: var(--ag-mono); }\n.ag-root code {\n  font-size: 0.9em;\n  padding: 1px 4px;\n  border-radius: var(--ag-r-sm);\n  background: var(--ag-fill);\n}\n.ag-root pre {\n  margin: 6px 0;\n  padding: 10px 12px;\n  font-size: var(--ag-text-xs);\n  line-height: 1.6;\n  overflow-x: auto;\n  border-radius: var(--ag-r-md);\n  background: var(--ag-fill);\n}\n.ag-root pre code { padding: 0; background: none; }\n.ag-hidden { display: none !important; }\n.ag-spacer { flex: 1 1 auto; }\n.ag-icon {\n  width: 16px; height: 16px; flex: none;\n  fill: none; stroke: currentColor; stroke-width: 1.5;\n  stroke-linecap: round; stroke-linejoin: round;\n}\n.ag-icon-fill { fill: currentColor; stroke: none; }\n\n/* \u2500\u2500 Header & Tabs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-header {\n  position: sticky; top: 0; z-index: 10; flex: none;\n  background: var(--ag-bg);\n  border-bottom: 1px solid var(--ag-line);\n  padding: 12px var(--ag-inline) 0;\n  display: flex; flex-direction: column; gap: 2px;\n}\n.ag-header-row { display: flex; align-items: center; gap: 10px; min-width: 0; }\n.ag-swarm-title {\n  flex: 1 1 auto; min-width: 0; margin: 0;\n  font-size: var(--ag-text-base); font-weight: 600; line-height: 22px;\n  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\n}\n.ag-swarm-select {\n  appearance: none; -webkit-appearance: none;\n  max-width: 220px; height: 26px; padding: 0 22px 0 8px;\n  border: 1px solid var(--ag-border); border-radius: var(--ag-r-md);\n  background: var(--ag-field); color: var(--ag-fg);\n  font-size: var(--ag-text-xs); cursor: pointer;\n}\n.ag-swarm-select option { background: var(--ag-card); color: var(--ag-fg); }\n\n.ag-live {\n  flex: none;\n  display: inline-flex; align-items: center; gap: 6px;\n  height: 20px;\n  font-size: var(--ag-text-xs);\n  color: var(--ag-fg-muted);\n}\n.ag-live-dot {\n  position: relative; flex: none;\n  width: 6px; height: 6px; border-radius: 50%;\n  background: var(--ag-success);\n}\n.ag-live-dot::after {\n  content: ""; position: absolute; inset: 0; border-radius: 50%;\n  background: inherit; opacity: 0.5;\n  animation: ag-ping 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;\n}\n@keyframes ag-ping {\n  0% { transform: scale(1); opacity: 0.5; }\n  70%, 100% { transform: scale(2.6); opacity: 0; }\n}\n.ag-live.stale .ag-live-dot { background: var(--ag-warning); }\n.ag-live.stale .ag-live-dot::after { animation: none; }\n.ag-live.error .ag-live-dot { background: var(--ag-error); }\n.ag-live.error .ag-live-dot::after { animation: none; }\n\n.ag-tabs {\n  display: flex; gap: 20px; margin-top: 6px;\n  overflow-x: auto; scrollbar-width: none;\n}\n.ag-tabs::-webkit-scrollbar { display: none; }\n.ag-tab {\n  position: relative; flex: none;\n  display: inline-flex; align-items: center; gap: 6px;\n  height: 34px; padding: 0; border: 0; background: transparent;\n  color: var(--ag-fg-muted);\n  font-size: var(--ag-text-sm); font-weight: 500;\n  transition: color 0.12s ease;\n}\n.ag-tab::after {\n  content: ""; position: absolute; left: 0; right: 0; bottom: -1px;\n  height: 2px; border-radius: 2px 2px 0 0;\n  background: transparent; transition: background-color 0.12s ease;\n}\n.ag-tab:hover, .ag-tab.active { color: var(--ag-fg); }\n.ag-tab.active::after { background: var(--ag-fg); }\n.ag-tab-count {\n  font-size: var(--ag-text-xs); font-weight: 400;\n  font-variant-numeric: tabular-nums; color: var(--ag-fg-muted);\n}\n.ag-tab-badge {\n  min-width: 16px; height: 16px; padding: 0 5px; border-radius: 8px;\n  font-size: var(--ag-text-2xs); font-weight: 600; line-height: 16px; text-align: center;\n  font-variant-numeric: tabular-nums;\n  background: color-mix(in srgb, var(--ag-warning) 20%, transparent);\n  color: var(--ag-warning);\n}\n\n.ag-scroll {\n  flex: 1 1 auto; min-height: 0; overflow-y: auto;\n  padding: 12px var(--ag-inline) 36px;\n}\n.ag-main { width: 100%; max-width: var(--ag-col); margin: 0 auto; }\n\n/* \u2500\u2500 ShimmerText \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n@keyframes ag-shimmer-text {\n  0% { -webkit-mask-position: 100% 50%; mask-position: 100% 50%; }\n  68%, 100% { -webkit-mask-position: 0% 50%; mask-position: 0% 50%; }\n}\n.ag-shimmer,\n.animate-shimmer-text {\n  color: var(--ag-fg);\n  -webkit-mask-image: linear-gradient(90deg,\n    rgb(0 0 0 / 0.45) 0%, rgb(0 0 0 / 0.45) 35%, rgb(0 0 0 / 0.8) 43%, rgb(0 0 0 / 1) 50%,\n    rgb(0 0 0 / 0.8) 57%, rgb(0 0 0 / 0.45) 65%, rgb(0 0 0 / 0.45) 100%);\n  mask-image: linear-gradient(90deg,\n    rgb(0 0 0 / 0.45) 0%, rgb(0 0 0 / 0.45) 35%, rgb(0 0 0 / 0.8) 43%, rgb(0 0 0 / 1) 50%,\n    rgb(0 0 0 / 0.8) 57%, rgb(0 0 0 / 0.45) 65%, rgb(0 0 0 / 0.45) 100%);\n  -webkit-mask-size: 300% 100%;\n  mask-size: 300% 100%;\n  animation: ag-shimmer-text 1900ms linear infinite;\n}\n\n/* \u2500\u2500 Pixel Bee Sprites \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-beebox {\n  position: relative; display: inline-block; flex: none;\n  --cell: 2px; width: calc(22 * var(--cell)); height: calc(18 * var(--cell));\n  vertical-align: middle;\n}\n.ag-beebox.sz-1 { --cell: 1px; }\n.ag-beebox.sz-2 { --cell: 2px; }\n.ag-beebox.sz-3 { --cell: 3px; }\n.ag-beewrap { position: absolute; inset: 0; display: block; }\n.ag-beewrap canvas {\n  position: absolute; inset: 0; width: 100%; height: 100%;\n  image-rendering: pixelated;\n}\n.ag-beewrap canvas:nth-child(2) { opacity: 0; }\n.ag-beebox.killed .ag-beewrap { filter: grayscale(1); opacity: 0.52; }\n@keyframes ag-flap { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }\n.ag-beebox[data-state="working"] .ag-beewrap canvas:nth-child(2),\n.ag-beebox[data-state="needs_you"] .ag-beewrap canvas:nth-child(2) {\n  animation: ag-flap 0.2s steps(1, end) infinite;\n}\n.ag-beebox[data-state="waiting_on"] .ag-beewrap canvas:nth-child(2) {\n  animation: ag-flap 0.9s steps(1, end) infinite;\n}\n.ag-beedot {\n  position: absolute; right: -2px; bottom: -2px;\n  width: 8px; height: 8px; border-radius: 999px;\n  box-shadow: 0 0 0 2px var(--ag-bg);\n  background: var(--ag-success); z-index: 2;\n}\n.ag-beedot.waiting, .ag-beedot.needs { background: var(--ag-warning); }\n.ag-beedot.stuck, .ag-beedot.error { background: var(--ag-error); }\n.ag-beedot.done { background: var(--ag-success); }\n.ag-beebox.framed {\n  display: inline-grid; place-items: center;\n  border-radius: 8px; box-shadow: inset 0 0 0 1px var(--ag-border);\n  padding: 4px; width: auto; height: auto;\n}\n.ag-beebox.framed .ag-beewrap { position: relative; width: calc(22 * var(--cell)); height: calc(18 * var(--cell)); }\n\n/* \u2500\u2500 Buttons, Inputs, Selects, Switches \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-btn {\n  display: inline-flex; align-items: center; justify-content: center; gap: 6px;\n  height: 28px; padding: 0 10px; border: 0; border-radius: var(--ag-r-md);\n  background: var(--ag-secondary); color: var(--ag-fg-2);\n  font-size: var(--ag-text-sm); font-weight: 500; white-space: nowrap;\n  transition: background-color 0.12s ease, color 0.12s ease;\n}\n.ag-btn:hover:not(:disabled) { color: var(--ag-fg); background: var(--ag-press); }\n.ag-btn:disabled { opacity: 0.45; cursor: default; }\n.ag-btn.primary { background: var(--ag-primary); color: var(--ag-primary-fg); }\n.ag-btn.primary:hover:not(:disabled) { filter: brightness(1.06); }\n.ag-btn.danger {\n  background: color-mix(in srgb, var(--ag-error) 14%, transparent);\n  color: var(--ag-error);\n}\n.ag-btn.danger:hover:not(:disabled) {\n  background: color-mix(in srgb, var(--ag-error) 22%, transparent);\n}\n.ag-btn.sm { height: 24px; padding: 0 8px; font-size: var(--ag-text-xs); }\n\n.ag-icon-btn, .ag-ghost-btn, .ag-pill-btn {\n  display: inline-flex; align-items: center; justify-content: center; gap: 6px;\n  border: 0; background: transparent; color: var(--ag-fg-muted);\n  transition: background-color 0.12s ease, color 0.12s ease;\n}\n.ag-icon-btn { width: 28px; height: 28px; border-radius: var(--ag-r-md); }\n.ag-ghost-btn { height: 28px; padding: 0 8px; border-radius: var(--ag-r-md); font-size: var(--ag-text-xs); }\n.ag-icon-btn:hover:not(:disabled), .ag-ghost-btn:hover:not(:disabled) { background: var(--ag-hover); color: var(--ag-fg); }\n.ag-icon-btn:disabled, .ag-ghost-btn:disabled { opacity: 0.4; cursor: default; }\n.ag-pill-btn { height: 26px; padding: 0 10px; border-radius: 999px; font-size: var(--ag-text-xs); }\n.ag-pill-btn:hover { color: var(--ag-fg); background: var(--ag-hover); }\n.ag-pill-btn.on { color: var(--ag-fg); background: var(--ag-fill); }\n\n.ag-search {\n  flex: 1 1 auto; min-width: 0;\n  display: flex; align-items: center; gap: 8px;\n  height: 32px; padding: 0 10px; border-radius: var(--ag-r-lg);\n  background: var(--ag-field); border: 1px solid transparent;\n  color: var(--ag-fg-muted);\n  transition: border-color 0.12s ease, background-color 0.12s ease;\n}\n.ag-search:focus-within {\n  background: var(--ag-bg);\n  border-color: color-mix(in srgb, var(--ag-primary) 55%, transparent);\n}\n.ag-search input {\n  flex: 1; min-width: 0; height: 100%; border: 0; outline: none;\n  background: transparent; font-size: var(--ag-text-sm); color: var(--ag-fg);\n}\n.ag-search input::placeholder { color: var(--ag-fg-muted); }\n\n.ag-select { position: relative; display: inline-flex; min-width: 0; }\n.ag-select select {\n  appearance: none; -webkit-appearance: none;\n  height: 28px; max-width: 180px; padding: 0 22px 0 8px;\n  border: 0; border-radius: var(--ag-r-md);\n  background: transparent; color: var(--ag-fg-muted);\n  font-size: var(--ag-text-sm); cursor: pointer;\n}\n.ag-select select:hover { background: var(--ag-hover); color: var(--ag-fg); }\n.ag-select select.set { color: var(--ag-fg); background: var(--ag-fill); }\n.ag-select::after {\n  content: ""; position: absolute; right: 8px; top: 50%;\n  width: 6px; height: 6px; margin-top: -4px;\n  border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor;\n  color: var(--ag-fg-faint); transform: rotate(45deg); pointer-events: none;\n}\n.ag-select option { background: var(--ag-card); color: var(--ag-fg); }\n\n.ag-switch {\n  position: relative; display: inline-flex; align-items: center; gap: 6px;\n  font-size: var(--ag-text-xs); color: var(--ag-fg-muted);\n  cursor: pointer; user-select: none; white-space: nowrap;\n}\n.ag-switch input {\n  position: absolute; inset: 0; z-index: 1; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer;\n}\n.ag-switch-track {\n  position: relative; flex: none; width: 24px; height: 14px; border-radius: 999px;\n  background: color-mix(in srgb, var(--ag-fg) 20%, transparent);\n  transition: background-color 0.15s ease; pointer-events: none;\n}\n.ag-switch-track::after {\n  content: ""; position: absolute; left: 2px; top: 2px; width: 10px; height: 10px;\n  border-radius: 50%; background: var(--ag-bg); transition: transform 0.15s ease;\n}\n.ag-switch input:checked + .ag-switch-track { background: var(--ag-fg-2); }\n.ag-switch input:checked + .ag-switch-track::after { transform: translateX(10px); }\n\n/* \u2500\u2500 Overview (Antigravity o2 style) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-o2 { padding: 4px 0 24px; display: flex; flex-direction: column; gap: 12px; }\n.ag-o2-h {\n  display: flex; align-items: center; gap: 8px;\n  min-height: 28px; margin: 0 0 8px;\n  font-size: var(--ag-text-sm); font-weight: 600; color: var(--ag-fg);\n}\n.ag-o2-h em { font-style: normal; font-weight: 400; color: var(--ag-fg-muted); font-variant-numeric: tabular-nums; }\n.ag-o2-more {\n  display: inline-flex; align-items: center; height: 24px; padding: 0 8px;\n  margin: 6px 0 0 -8px; border: 0; border-radius: var(--ag-r-md);\n  background: transparent; font-size: var(--ag-text-xs); font-weight: 500;\n  color: var(--ag-fg-muted);\n}\n.ag-o2-more:hover { color: var(--ag-fg); background: var(--ag-secondary); }\n\n/* System Alerts & Stall Banner */\n.ag-ov-system { display: flex; flex-direction: column; gap: 6px; }\n.ag-ov-sys {\n  display: flex; align-items: center; gap: 8px;\n  padding: 8px 10px; border-radius: var(--ag-r-lg);\n  font-size: var(--ag-text-sm); border: 1px solid color-mix(in srgb, var(--ag-warning) 35%, var(--ag-border));\n  background: color-mix(in srgb, var(--ag-warning) 10%, var(--ag-card));\n}\n.ag-ov-sys.error {\n  border-color: color-mix(in srgb, var(--ag-error) 40%, var(--ag-border));\n  background: color-mix(in srgb, var(--ag-error) 10%, var(--ag-card));\n}\n.ag-ov-sys-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; background: var(--ag-warning); }\n.ag-ov-sys.error .ag-ov-sys-dot { background: var(--ag-error); }\n.ag-ov-sys-body { flex: 1 1 auto; min-width: 0; }\n.ag-ov-sys-title { font-weight: 600; font-size: var(--ag-text-sm); }\n.ag-ov-sys-detail { font-size: var(--ag-text-xs); color: var(--ag-fg-muted); margin-top: 1px; }\n\n.ag-o2-stall {\n  display: flex; align-items: flex-start; gap: 10px;\n  padding: 10px 12px; border-radius: 10px;\n  background: color-mix(in srgb, var(--ag-warning) 10%, var(--ag-card));\n  border: 1px solid color-mix(in srgb, var(--ag-warning) 45%, var(--ag-border));\n}\n.ag-o2-sttop { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; font-size: var(--ag-text-sm); }\n.ag-o2-stdot { width: 8px; height: 8px; border-radius: 999px; background: var(--ag-warning); flex: none; }\n.ag-o2-sttag {\n  border: 0; cursor: pointer; flex: none; white-space: nowrap;\n  font-size: var(--ag-text-2xs); font-weight: 500; padding: 2px 7px; border-radius: 999px;\n  color: var(--ag-warning); background: color-mix(in srgb, var(--ag-warning) 16%, transparent);\n  font-variant-numeric: tabular-nums;\n}\n.ag-o2-sttag:hover { background: color-mix(in srgb, var(--ag-warning) 26%, transparent); }\n.ag-o2-sttxt { margin: 4px 0 0 15px; font-size: var(--ag-text-xs); line-height: 1.45; color: var(--ag-fg-2); overflow-wrap: anywhere; }\n\n/* Goal & Running Cards */\n.ag-o2-card {\n  padding: 12px 14px; border-radius: 12px;\n  background: var(--ag-card); border: 1px solid var(--ag-card-border);\n}\n.ag-o2-glbl {\n  font-size: var(--ag-text-2xs); font-weight: 600;\n  letter-spacing: 0.04em; text-transform: uppercase; color: var(--ag-fg-muted);\n}\n.ag-o2-goal-title { display: block; margin-top: 3px; font-size: 15px; font-weight: 600; line-height: 1.35; }\n.ag-o2-goal-line { margin: 3px 0 0; font-size: var(--ag-text-sm); line-height: 1.45; color: var(--ag-fg-muted); }\n\n.ag-o2-runh { display: flex; align-items: center; gap: 8px; font-size: var(--ag-text-sm); }\n.ag-o2-runh em { font-style: normal; font-size: var(--ag-text-xs); color: var(--ag-fg-muted); font-variant-numeric: tabular-nums; }\n.ag-o2-rundot {\n  width: 8px; height: 8px; border-radius: 999px; background: var(--ag-primary); flex: none;\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ag-primary) 20%, transparent);\n}\n.ag-o2-runlist { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; }\n.ag-o2-runrow {\n  display: flex; align-items: flex-start; gap: 9px; padding: 8px 0;\n  border-top: 1px solid color-mix(in srgb, var(--ag-border) 75%, transparent);\n}\n.ag-o2-runrow > .ag-o2-ti { margin-top: 4px; }\n.ag-o2-runmain { flex: 1; min-width: 0; }\n.ag-o2-runtop { display: flex; align-items: center; gap: 6px; min-height: 22px; }\n.ag-o2-runt {\n  font-size: var(--ag-text-sm); font-weight: 600; min-width: 0; flex: 1 1 0;\n  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n}\n.ag-o2-runnote {\n  margin: 2px 0 0; font-size: var(--ag-text-xs); line-height: 1.4; color: var(--ag-fg-muted);\n  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n}\n\n/* Worker chips, Progress ring, Threads, Team */\n.ag-o2-wchips { display: inline-flex; align-items: center; gap: 4px; flex: none; }\n.ag-o2-wchip {\n  display: inline-flex; align-items: center; gap: 3px; height: 22px;\n  padding: 0 7px 0 3px; border-radius: 999px;\n  font-size: var(--ag-text-2xs); font-weight: 500; color: var(--ag-fg-2);\n  background: color-mix(in srgb, var(--ag-secondary) 75%, transparent); white-space: nowrap;\n}\n.ag-o2-wchip.more { padding: 0 6px; color: var(--ag-fg-muted); }\n\n.ag-o2-prog {\n  border-radius: 10px; background: var(--ag-card); border: 1px solid var(--ag-card-border); overflow: hidden;\n}\n.ag-o2-progh {\n  width: 100%; display: flex; align-items: center; gap: 9px; padding: 9px 12px;\n  border: 0; background: transparent; text-align: left;\n  font-size: var(--ag-text-sm); color: var(--ag-fg-2); transition: background-color 0.12s ease;\n}\n.ag-o2-progh:hover { background: var(--ag-hover); color: var(--ag-fg); }\n.ag-o2-progt { font-variant-numeric: tabular-nums; white-space: nowrap; }\n.ag-o2-progt b { font-weight: 600; color: var(--ag-fg); }\n.ag-o2-progr {\n  margin-left: auto; display: inline-flex; flex-wrap: wrap; justify-content: flex-end;\n  align-items: center; gap: 2px 8px; min-width: 0;\n}\n.ag-o2-chev {\n  margin-left: 2px; width: 7px; height: 7px;\n  border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor;\n  color: var(--ag-fg-faint); transform: rotate(45deg); flex: none; transition: transform 0.14s ease;\n}\n.ag-o2-prog.open .ag-o2-chev, .ag-o2-th.open .ag-o2-chev { transform: rotate(-135deg); margin-top: 3px; }\n.ag-o2-ring { flex: none; transform: rotate(-90deg); }\n.ag-o2-ring .trk { stroke: var(--ag-secondary); }\n.ag-o2-ring .seg.done { stroke: var(--ag-success); }\n.ag-o2-ring .seg.running { stroke: var(--ag-primary); }\n.ag-o2-ring .seg.blocked { stroke: var(--ag-warning); }\n.ag-o2-ring-full {\n  width: 18px; height: 18px; border-radius: 999px; display: inline-grid; place-items: center;\n  background: color-mix(in srgb, var(--ag-success) 22%, transparent);\n  color: var(--ag-success); font-size: 10px; font-weight: 700; flex: none;\n}\n.ag-o2-pchip {\n  display: inline-flex; align-items: center; gap: 5px;\n  font-size: var(--ag-text-xs); color: var(--ag-fg-muted);\n  font-variant-numeric: tabular-nums; white-space: nowrap;\n}\n.ag-o2-pchip > i { width: 6px; height: 6px; border-radius: 999px; background: currentColor; }\n.ag-o2-pchip.warn { color: var(--ag-warning); font-weight: 500; }\n.ag-o2-pchip.bad { color: var(--ag-error); font-weight: 500; }\n.ag-o2-pchip.info { color: var(--ag-primary); }\n.ag-o2-progb { padding: 4px 12px 10px; border-top: 1px solid var(--ag-border); }\n.ag-o2-donelist { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }\n.ag-o2-donelist li {\n  display: flex; align-items: center; gap: 8px; padding: 6px 0;\n  border-top: 1px solid color-mix(in srgb, var(--ag-border) 55%, transparent);\n}\n.ag-o2-donelist li:first-child { border-top: 0; }\n.ag-o2-donem { flex: 1; min-width: 0; }\n.ag-o2-donem b { display: block; font-size: 12.5px; font-weight: 500; color: var(--ag-fg); }\n.ag-o2-donem span { display: block; font-size: 11.5px; color: var(--ag-fg-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.ag-o2-qhdr { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ag-fg-muted); margin: 8px 0 2px; }\n\n.ag-o2-ti {\n  width: 14px; height: 14px; flex: none; border-radius: 999px;\n  display: inline-grid; place-items: center; font-size: 9px; font-weight: 700;\n}\n.ag-o2-ti.done { background: color-mix(in srgb, var(--ag-success) 22%, transparent); color: var(--ag-success); }\n.ag-o2-ti.running { border: 2px solid var(--ag-primary); border-right-color: transparent; animation: ag-spin 1.2s linear infinite; }\n.ag-o2-ti.blocked { border: 2px solid var(--ag-warning); }\n.ag-o2-ti.queued { border: 1.5px dashed var(--ag-fg-faint); }\n@keyframes ag-spin { to { transform: rotate(360deg); } }\n\n.ag-o2-threads { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }\n.ag-o2-th {\n  padding: 10px 12px 12px; border-radius: 10px;\n  background: var(--ag-card); border: 1px solid var(--ag-card-border);\n}\n.ag-o2-th.stuck { border-color: color-mix(in srgb, var(--ag-error) 35%, var(--ag-border)); }\n.ag-o2-th.needs, .ag-o2-th.waiting { border-color: color-mix(in srgb, var(--ag-warning) 40%, var(--ag-border)); }\n.ag-o2-th.done { background: transparent; }\n.ag-o2-thh {\n  width: 100%; display: flex; align-items: center; gap: 8px; min-height: 26px;\n  padding: 0; border: 0; background: transparent; text-align: left;\n}\n.ag-o2-thd { width: 8px; height: 8px; border-radius: 999px; flex: none; background: var(--ag-fg-faint); }\n.ag-o2-thd.stuck { background: var(--ag-error); }\n.ag-o2-thd.needs, .ag-o2-thd.waiting { background: var(--ag-warning); }\n.ag-o2-thd.running { background: var(--ag-primary); }\n.ag-o2-thd.done { background: var(--ag-success); }\n.ag-o2-tht { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 8px; }\n.ag-o2-tht b { font-size: var(--ag-text-base); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.ag-o2-tht em { font-style: normal; font-size: var(--ag-text-xs); color: var(--ag-fg-muted); white-space: nowrap; }\n.ag-o2-th.needs .ag-o2-tht em, .ag-o2-th.waiting .ag-o2-tht em { color: var(--ag-warning); }\n.ag-o2-th.stuck .ag-o2-tht em { color: var(--ag-error); }\n.ag-o2-thc { display: inline-flex; align-items: center; gap: 6px; font-size: var(--ag-text-xs); color: var(--ag-fg-muted); font-variant-numeric: tabular-nums; flex: none; }\n.ag-o2-mbar { display: inline-flex; gap: 1px; width: 26px; height: 4px; border-radius: 999px; overflow: hidden; background: var(--ag-secondary); }\n.ag-o2-mbar i { display: block; height: 100%; }\n.ag-o2-mbar i.done { background: var(--ag-success); }\n.ag-o2-mbar i.running { background: var(--ag-primary); }\n.ag-o2-mbar i.blocked { background: var(--ag-warning); }\n.ag-o2-mbar i.queued { background: color-mix(in srgb, var(--ag-fg-faint) 45%, transparent); }\n.ag-o2-thg { margin: 2px 0 0 16px; font-size: var(--ag-text-sm); color: var(--ag-fg-2); }\n.ag-o2-thn { margin: 5px 0 0 16px; font-size: 12.5px; color: var(--ag-fg-muted); }\n.ag-o2-thn span { margin-right: 6px; font-weight: 600; color: var(--ag-fg-2); }\n.ag-o2-tasks {\n  list-style: none; margin: 10px 0 0 16px; padding: 8px 0 0;\n  border-top: 1px solid var(--ag-border); display: flex; flex-direction: column; gap: 6px;\n}\n.ag-o2-tasks li { display: flex; align-items: center; gap: 8px; font-size: var(--ag-text-sm); color: var(--ag-fg-2); min-height: 22px; }\n.ag-o2-tasks li.done .ag-o2-tt { color: var(--ag-fg-muted); }\n.ag-o2-tt { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.ag-o2-tw { display: block; font-size: var(--ag-text-xs); font-weight: 500; color: var(--ag-warning); }\n\n/* \u2500\u2500 Progress Reel & Full-screen Lightbox \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-o2-reel {\n  padding: 12px 14px 14px; border-radius: 12px;\n  background: var(--ag-card); border: 1px solid var(--ag-card-border);\n}\n.ag-o2-rh { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }\n.ag-o2-rwhen { font-size: var(--ag-text-xs); color: var(--ag-fg-muted); }\n.ag-o2-rh .ag-btn { margin-left: auto; }\n.ag-o2-rstage {\n  position: relative; aspect-ratio: 16 / 10; border-radius: var(--ag-r-lg);\n  overflow: hidden; background: #0c0d10; border: 1px solid var(--ag-border);\n}\n.ag-o2-rstage img {\n  position: absolute; inset: 0; width: 100%; height: 100%;\n  object-fit: cover; object-position: top;\n}\n.ag-o2-rline {\n  position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px;\n  background: rgba(255, 255, 255, 0.92); z-index: 2; pointer-events: none;\n}\n.ag-o2-rswipe {\n  position: absolute; inset: 0; width: 100%; height: 100%; margin: 0;\n  opacity: 0; cursor: ew-resize; z-index: 3;\n}\n.ag-o2-rtag {\n  position: absolute; left: 8px; top: 8px; z-index: 2;\n  font-size: var(--ag-text-xs); font-weight: 500; padding: 1px 7px;\n  border-radius: var(--ag-r-md); background: rgba(0, 0, 0, 0.72); color: #fff;\n}\n.ag-o2-rexp {\n  position: absolute; right: 8px; top: 8px; z-index: 4;\n  width: 26px; height: 26px; display: grid; place-items: center;\n  border: 0; border-radius: var(--ag-r-md); background: rgba(0, 0, 0, 0.72); color: #fff;\n}\n.ag-o2-rexp:hover { background: rgba(0, 0, 0, 0.88); }\n.ag-o2-rcap { margin: 10px 0 0; font-size: var(--ag-text-sm); font-weight: 500; }\n.ag-o2-rmeta { margin: 2px 0 0; font-size: var(--ag-text-xs); color: var(--ag-fg-muted); }\n.ag-o2-rtrack { position: relative; height: 24px; margin-top: 8px; }\n.ag-o2-rtrack::before {\n  content: ""; position: absolute; left: 0; right: 0; top: 11px; height: 2px;\n  border-radius: 2px; background: var(--ag-secondary);\n}\n.ag-o2-rtrack > i {\n  position: absolute; top: 9px; width: 6px; height: 6px; margin-left: -3px;\n  border-radius: 999px; background: color-mix(in srgb, var(--ag-fg-faint) 75%, transparent); pointer-events: none;\n}\n.ag-o2-rscrub {\n  position: absolute; inset: 0; width: 100%; height: 24px; margin: 0;\n  background: transparent; appearance: none; -webkit-appearance: none; cursor: pointer;\n}\n.ag-o2-rscrub::-webkit-slider-thumb {\n  -webkit-appearance: none; width: 12px; height: 20px; border-radius: 5px;\n  background: var(--ag-fg); box-shadow: 0 0 0 3px var(--ag-card);\n}\n\n.ag-tv {\n  position: fixed; inset: 0; z-index: 1000;\n  display: flex; flex-direction: column; gap: 8px; padding: 12px 16px;\n  background: #0b0c0e; color: #f1f3f4; font-family: var(--ag-font);\n}\n.ag-tvh { display: flex; align-items: center; gap: 10px; min-height: 28px; font-size: var(--ag-text-sm); }\n.ag-tvpos, .ag-tvwhen { color: rgba(241, 243, 244, 0.66); font-size: var(--ag-text-xs); font-variant-numeric: tabular-nums; }\n.ag-tvx {\n  margin-left: auto; width: 28px; height: 28px; border: 0; border-radius: var(--ag-r-md);\n  background: transparent; color: rgba(241, 243, 244, 0.85); font-size: 15px; cursor: pointer;\n}\n.ag-tvx:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }\n.ag-tvstage { position: relative; flex: 1; min-height: 0; border-radius: var(--ag-r-lg); overflow: hidden; }\n.ag-tvscroll { position: absolute; inset: 0; display: grid; place-items: center; overflow: hidden; }\n.ag-tvscroll.zoom { overflow: auto; place-items: start; }\n.ag-tvimg { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; cursor: zoom-in; }\n.ag-tvscroll.zoom .ag-tvimg { max-width: none; max-height: none; cursor: zoom-out; }\n.ag-tvnav {\n  position: absolute; top: 50%; z-index: 2; width: 34px; height: 48px; margin-top: -24px;\n  border: 0; border-radius: var(--ag-r-lg); font-size: 24px;\n  background: rgba(0, 0, 0, 0.6); color: #fff; cursor: pointer;\n}\n.ag-tvnav.prev { left: 8px; }\n.ag-tvnav.next { right: 8px; }\n.ag-tvnav:disabled { opacity: 0.2; cursor: default; }\n.ag-tvstrip { display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 4px; }\n.ag-tvth {\n  position: relative; flex: none; width: 92px; aspect-ratio: 16 / 10; padding: 0;\n  border: 0; border-radius: 5px; overflow: hidden; opacity: 0.55; cursor: pointer;\n  background: #000;\n}\n.ag-tvth.on { opacity: 1; box-shadow: 0 0 0 2px #fff; }\n.ag-tvth img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }\n.ag-tvth span {\n  position: absolute; left: 4px; bottom: 3px; font-size: 10px; font-weight: 600;\n  padding: 0 4px; border-radius: 4px; background: rgba(0, 0, 0, 0.72); color: #fff;\n}\n\n/* \u2500\u2500 The Team & Onboarding \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-o2-team { margin-top: 8px; }\n.ag-o2-lead {\n  display: flex; gap: 12px; align-items: center; padding: 10px;\n  border-radius: 10px; background: var(--ag-card); border: 1px solid var(--ag-card-border);\n}\n.ag-o2-tile {\n  position: relative; display: grid; place-items: center;\n  border-radius: 8px; overflow: hidden; flex: none;\n  box-shadow: inset 0 0 0 1px var(--ag-border);\n}\n.ag-o2-tile.lg { width: 72px; height: 72px; border-radius: 10px; }\n.ag-o2-tile.sm { width: 44px; height: 44px; }\n.ag-o2-tile.all { background: var(--ag-secondary); }\n.ag-o2-tile.plus { background: var(--ag-secondary); font-size: var(--ag-text-xs); font-weight: 500; color: var(--ag-fg-2); }\n.ag-o2-lb { min-width: 0; flex: 1; }\n.ag-o2-lb b { display: block; font-size: var(--ag-text-base); font-weight: 600; }\n.ag-o2-lb p { margin: 2px 0 0; font-size: var(--ag-text-sm); color: var(--ag-fg-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.ag-o2-crew { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }\n.ag-o2-m {\n  border: 0; background: transparent; padding: 2px 0; width: 52px;\n  display: flex; flex-direction: column; align-items: center; gap: 4px; position: relative;\n}\n.ag-o2-m > span:last-child {\n  font-size: 11px; color: var(--ag-fg-muted); max-width: 52px;\n  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\n}\n.ag-o2-m:hover .ag-o2-tile { box-shadow: inset 0 0 0 1px var(--ag-border), 0 0 0 2px color-mix(in srgb, var(--ag-fg) 18%, transparent); }\n.ag-o2-m.on .ag-o2-tile { box-shadow: 0 0 0 2px var(--ag-fg); }\n.ag-o2-m.on > span:last-child { color: var(--ag-fg); font-weight: 500; }\n.ag-o2-st {\n  position: absolute; top: -2px; left: 38px; width: 10px; height: 10px;\n  border-radius: 999px; box-shadow: 0 0 0 2px var(--ag-bg);\n}\n.ag-o2-st.working { background: var(--ag-success); }\n.ag-o2-st.waiting { background: var(--ag-warning); }\n.ag-o2-st.error { background: var(--ag-error); }\n.ag-o2-swarm { position: relative; width: 44px; height: 44px; }\n.ag-o2-sb { position: absolute; }\n.ag-o2-sb.s0 { left: 3px; top: 6px; }\n.ag-o2-sb.s1 { left: 19px; top: 3px; }\n.ag-o2-sb.s2 { left: 11px; top: 21px; }\n\n.ag-onb { padding: 10px 0 4px; text-align: center; }\n.ag-onb-stage { position: relative; width: 320px; height: 156px; margin: 4px auto 14px; }\n.ag-onb-paths { position: absolute; inset: 0; overflow: visible; }\n.ag-onb-lines path { fill: none; stroke: var(--ag-border); stroke-width: 1.5; stroke-dasharray: 3 5; }\n.ag-onb-bee {\n  position: absolute; width: 50px; height: 44px; border-radius: 10px;\n  display: grid; place-items: center; box-shadow: inset 0 0 0 1px var(--ag-border);\n}\n.ag-onb-w { animation: ag-bob 2.6s ease-in-out infinite; }\n.ag-onb-w.s1 { animation-delay: -0.9s; }\n.ag-onb-w.s2 { animation-delay: -1.7s; }\n@keyframes ag-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }\n.ag-onb-h { margin: 0 0 12px; font-size: 18px; font-weight: 600; }\n.ag-onb-steps {\n  list-style: none; margin: 0 auto; padding: 0; max-width: 340px;\n  display: flex; flex-direction: column; gap: 10px; text-align: left;\n}\n.ag-onb-steps li { display: grid; grid-template-columns: 32px minmax(0, 1fr); column-gap: 12px; align-items: center; }\n.ag-onb-steps b { display: block; font-size: var(--ag-text-base); font-weight: 600; }\n.ag-onb-steps span { font-size: var(--ag-text-sm); color: var(--ag-fg-muted); }\n.ag-onb-i {\n  width: 32px; height: 28px; border-radius: 8px;\n  display: grid; place-items: center; box-shadow: inset 0 0 0 1px var(--ag-border);\n}\n.ag-onb-i img { width: 22px; height: 18px; image-rendering: pixelated; }\n.ag-onb-wait { margin: 16px 0 6px; font-size: var(--ag-text-xs); }\n\n/* \u2500\u2500 Board Feed, Toolbar, Filters, Channels \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-toolbar {\n  position: sticky; top: 0; z-index: 8;\n  display: flex; flex-direction: column; gap: 8px;\n  padding: 0 0 10px; background: var(--ag-bg);\n  border-bottom: 1px solid var(--ag-line); margin-bottom: 8px;\n}\n.ag-searchbar { display: flex; align-items: center; gap: 6px; }\n.ag-toolbar-row { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }\n.ag-filter-toggle { position: relative; width: 32px; height: 32px; }\n.ag-filter-toggle.open { background: var(--ag-fill); color: var(--ag-fg); }\n.ag-filter-dot {\n  position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;\n  border-radius: 50%; background: var(--ag-primary); box-shadow: 0 0 0 2px var(--ag-bg);\n}\n.ag-filters { display: flex; flex-direction: column; gap: 8px; }\n\n.ag-agents { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; }\n.ag-chip {\n  flex: none; display: inline-flex; align-items: center; gap: 6px;\n  height: 26px; padding: 0 10px; border-radius: 999px; border: 0;\n  background: var(--ag-fill); color: var(--ag-fg); font-size: var(--ag-text-xs); white-space: nowrap;\n}\n.ag-chip:hover { background: var(--ag-press); }\n.ag-chip.dim { background: transparent; color: var(--ag-fg-faint); box-shadow: inset 0 0 0 1px var(--ag-line); }\n.ag-chip.killed .ag-chip-name { text-decoration: line-through; }\n.ag-chip-count { font-variant-numeric: tabular-nums; color: var(--ag-fg-muted); }\n\n.ag-channel-tabs { display: flex; gap: 2px; overflow-x: auto; }\n.ag-channel-tab {\n  flex: none; display: inline-flex; align-items: center; gap: 6px;\n  height: 26px; padding: 0 10px; border: 0; border-radius: var(--ag-r-md);\n  background: transparent; color: var(--ag-fg-muted); font-size: var(--ag-text-xs); white-space: nowrap;\n}\n.ag-channel-tab:hover { background: var(--ag-hover); color: var(--ag-fg); }\n.ag-channel-tab.on { background: var(--ag-fill); color: var(--ag-fg); font-weight: 500; }\n.ag-channel-tab.archived { color: var(--ag-fg-faint); text-decoration: line-through; }\n\n.ag-feed { display: flex; flex-direction: column; }\n.ag-feed-earlier { display: flex; justify-content: center; margin: 4px 0 10px; }\n.ag-msg {\n  position: relative;\n  display: grid; grid-template-columns: 32px minmax(0, 1fr); column-gap: 12px;\n  margin: 2px -10px 0; padding: 10px; border-radius: var(--ag-r-lg);\n  transition: background-color 0.12s ease;\n}\n.ag-msg:hover { background: var(--ag-hover); }\n.ag-msg-target { animation: ag-target 1.8s ease-out; }\n@keyframes ag-target {\n  from {\n    background: color-mix(in srgb, var(--ag-primary) 18%, transparent);\n    box-shadow: 0 0 0 4px color-mix(in srgb, var(--ag-primary) 18%, transparent);\n  }\n}\n.ag-msg-system {\n  display: flex; align-items: baseline; gap: 8px;\n  padding: 6px 2px; font-size: var(--ag-text-xs); color: var(--ag-fg-muted);\n}\n.ag-sys-text { flex: 1 1 auto; min-width: 0; font-style: italic; overflow-wrap: anywhere; }\n.ag-msg-av {\n  grid-column: 1; grid-row: 1 / span 3; align-self: start;\n  width: 32px; height: 28px; margin-top: 1px; border-radius: 8px;\n  display: grid; place-items: center; box-shadow: inset 0 0 0 1px var(--ag-border);\n}\n.ag-msg-av img { width: 22px; height: 18px; image-rendering: pixelated; }\n.ag-msg-head { grid-column: 2; display: flex; align-items: baseline; gap: 8px; min-height: 20px; }\n.ag-msg-who { flex: 1 1 auto; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 6px; }\n.ag-msg-author { font-size: var(--ag-text-sm); font-weight: 600; color: var(--ag-fg); }\n.ag-msg-to {\n  display: inline-flex; flex-wrap: wrap; align-items: baseline; column-gap: 4px;\n  font-size: var(--ag-text-xs); color: var(--ag-fg-muted);\n}\n.ag-msg-channel {\n  display: inline-flex; align-items: center; height: 18px; padding: 0 6px; border: 0; border-radius: 9px;\n  font-family: var(--ag-mono); font-size: var(--ag-text-2xs);\n  background: color-mix(in srgb, var(--ag-primary) 12%, transparent); color: var(--ag-fg-2);\n}\n.ag-msg-channel:hover { background: color-mix(in srgb, var(--ag-primary) 22%, transparent); }\n.ag-ts {\n  flex: none; font-family: var(--ag-mono); font-size: var(--ag-text-2xs);\n  color: var(--ag-fg-faint); font-variant-numeric: tabular-nums; white-space: nowrap;\n}\n\n.ag-msg-body {\n  grid-column: 2; position: relative;\n  font-size: var(--ag-text-sm); line-height: 1.55; color: var(--ag-fg-2);\n  overflow-wrap: anywhere; margin-top: 2px;\n}\n.ag-msg-body.clamped {\n  max-height: 7.75em; overflow: clip;\n  -webkit-mask-image: linear-gradient(to bottom, #000 78%, transparent);\n  mask-image: linear-gradient(to bottom, #000 78%, transparent);\n}\n.ag-msg-body.clamped.open { max-height: none; -webkit-mask-image: none; mask-image: none; }\n.ag-msg-more {\n  grid-column: 2; justify-self: start; margin-top: 4px; padding: 0; border: 0;\n  background: none; font-size: var(--ag-text-xs); color: var(--ag-fg-muted);\n}\n.ag-msg-more:hover { color: var(--ag-fg); }\n\n.ag-md p { margin: 0 0 5px; }\n.ag-md p:last-child, .ag-md ul:last-child, .ag-md pre:last-child { margin-bottom: 0; }\n.ag-md ul { margin: 2px 0 6px; padding-left: 18px; }\n.ag-md li { margin: 2px 0; }\n.ag-mention {\n  padding: 0 4px; border-radius: var(--ag-r-sm); font-weight: 500;\n  color: var(--ag-fg); background: var(--ag-fill); white-space: nowrap;\n}\n.ag-mention.all { background: color-mix(in srgb, var(--ag-warning) 16%, transparent); }\n.ag-mention.channel { background: color-mix(in srgb, var(--ag-primary) 14%, transparent); }\n.ag-seq-ref {\n  display: inline-flex; align-items: center; padding: 0 5px; height: 19px;\n  border: 0; border-radius: var(--ag-r-sm); font-family: var(--ag-mono);\n  font-size: var(--ag-text-xs); font-weight: 500;\n  background: var(--ag-fill); color: var(--ag-fg-2); vertical-align: baseline;\n}\n.ag-seq-ref:hover { background: var(--ag-press); color: var(--ag-fg); }\n\n.ag-feed-empty {\n  display: flex; flex-direction: column; align-items: center; gap: 6px;\n  padding: 40px 16px; text-align: center; color: var(--ag-fg-muted); font-size: var(--ag-text-sm);\n}\n.ag-jump {\n  position: sticky; bottom: 72px; align-self: flex-end; z-index: 9;\n  display: inline-flex; align-items: center; gap: 5px;\n  height: 28px; padding: 0 12px; border-radius: 999px;\n  border: 1px solid var(--ag-card-border); background: var(--ag-card); color: var(--ag-fg);\n  font-size: var(--ag-text-xs); font-weight: 500; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);\n}\n\n/* \u2500\u2500 Collapsible Board Composer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-composer {\n  position: sticky; bottom: 0; z-index: 8; margin-top: 14px;\n  border: 1px solid var(--ag-card-border); border-radius: 10px;\n  background: var(--ag-card); box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);\n}\n.ag-composer-bar {\n  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;\n  padding: 8px 12px; border: 0; background: transparent;\n  font-size: var(--ag-text-xs); color: var(--ag-fg-muted); text-align: left;\n}\n.ag-composer-bar:hover { color: var(--ag-fg); }\n.ag-composer-form { padding: 8px 12px 10px; display: flex; flex-direction: column; gap: 8px; }\n.ag-composer-top { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }\n.ag-composer-chips { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; }\n.ag-composer textarea {\n  width: 100%; min-height: 62px; max-height: 180px; resize: vertical;\n  padding: 8px 10px; border-radius: var(--ag-r-md);\n  border: 1px solid var(--ag-border); background: var(--ag-field);\n  font-size: var(--ag-text-sm); line-height: 1.45; color: var(--ag-fg);\n}\n.ag-composer textarea:focus { outline: none; border-color: var(--ag-ring); background: var(--ag-bg); }\n.ag-composer-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: var(--ag-text-2xs); color: var(--ag-fg-muted); }\n\n/* \u2500\u2500 Loading, Empty, Toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-loading { padding: 24px 0; }\n.ag-skel {\n  border-radius: var(--ag-r-sm);\n  background: linear-gradient(110deg, var(--ag-fill) 25%, color-mix(in srgb, var(--ag-fg) 12%, transparent) 40%, var(--ag-fill) 55%);\n  background-size: 200% 100%; animation: ag-skel 1.5s ease-in-out infinite;\n}\n@keyframes ag-skel { from { background-position: 200% 0; } to { background-position: -200% 0; } }\n.ag-loading-caption { margin: 20px 0 0; text-align: center; font-size: var(--ag-text-xs); color: var(--ag-fg-muted); }\n\n.ag-empty { display: flex; align-items: center; justify-content: center; min-height: 360px; padding: 24px 16px; }\n.ag-empty-card { max-width: 340px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }\n.ag-empty-icon { width: 56px; height: 56px; margin-bottom: 6px; }\n.ag-empty-links line { stroke: var(--ag-fg-faint); stroke-width: 2; stroke-dasharray: 3 4; stroke-linecap: round; }\n.ag-empty-node { fill: var(--ag-bg); stroke: var(--ag-fg-faint); stroke-width: 2; }\n.ag-empty-title { margin: 0; font-size: var(--ag-text-base); font-weight: 600; }\n.ag-empty-body { margin: 0; font-size: var(--ag-text-sm); line-height: 1.55; color: var(--ag-fg-muted); }\n.ag-empty-swarms { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 8px; }\n\n.ag-toast {\n  position: fixed; left: 50%; bottom: 16px; z-index: 90; transform: translateX(-50%);\n  max-width: min(92vw, 480px); padding: 8px 14px; border-radius: var(--ag-r-lg);\n  font-size: var(--ag-text-xs); background: var(--ag-fg); color: var(--ag-bg);\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.22);\n}\n\n/* \u2500\u2500 HeaderWidget Pill & Popover \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-hbtn-wrap { position: relative; display: inline-flex; align-items: center; font-family: var(--ag-font); }\n.ag-hbtn {\n  display: inline-flex; align-items: center; gap: 6px;\n  height: 28px; padding: 0 9px 0 6px; border-radius: 999px;\n  border: 1px solid var(--ag-border); background: transparent; color: var(--ag-fg);\n  font-size: var(--ag-text-xs); font-weight: 500; cursor: pointer;\n  transition: background-color 0.12s ease, border-color 0.12s ease;\n}\n.ag-hbtn:hover { background: var(--ag-hover); }\n.ag-hbtn.working { border-color: color-mix(in srgb, var(--ag-success) 45%, var(--ag-border)); }\n.ag-hbtn.warn { border-color: color-mix(in srgb, var(--ag-warning) 55%, var(--ag-border)); }\n.ag-hbtn-label { white-space: nowrap; font-variant-numeric: tabular-nums; }\n.ag-hbtn-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ag-fg-faint); flex: none; }\n.ag-hbtn-dot.working { background: var(--ag-success); }\n.ag-hbtn-dot.warn { background: var(--ag-warning); }\n\n.ag-hpop {\n  position: absolute; right: 0; top: calc(100% + 6px); z-index: 9999; width: 320px;\n  padding: 12px; border-radius: 12px;\n  background: var(--ag-card); color: var(--ag-fg);\n  border: 1px solid var(--ag-card-border);\n  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);\n  display: flex; flex-direction: column; gap: 8px; font-size: var(--ag-text-xs);\n}\n.ag-hpop-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }\n.ag-hpop-head b { font-size: var(--ag-text-sm); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.ag-hpop-err { margin: 0; color: var(--ag-error); }\n.ag-hpop-empty { margin: 4px 0; color: var(--ag-fg-muted); line-height: 1.45; }\n.ag-hpop-stats {\n  display: flex; flex-wrap: wrap; gap: 8px; padding: 6px 8px; border-radius: var(--ag-r-md);\n  background: var(--ag-fill); font-variant-numeric: tabular-nums; color: var(--ag-fg-muted);\n}\n.ag-hpop-stats b { color: var(--ag-fg); }\n.ag-hpop-warn {\n  padding: 6px 8px; border-radius: var(--ag-r-md); color: var(--ag-warning);\n  background: color-mix(in srgb, var(--ag-warning) 12%, transparent);\n}\n.ag-hpop-list { display: flex; flex-direction: column; gap: 6px; max-height: 190px; overflow-y: auto; }\n.ag-hpop-row { display: flex; align-items: center; gap: 8px; min-width: 0; }\n.ag-hpop-row-main { flex: 1; min-width: 0; }\n.ag-hpop-row-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }\n.ag-hpop-st { font-size: 11px; color: var(--ag-fg-muted); }\n.ag-hpop-st.working { color: var(--ag-success); font-weight: 500; }\n.ag-hpop-act { font-size: 11px; color: var(--ag-fg-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.ag-hpop-posts { border-top: 1px solid var(--ag-border); padding-top: 6px; display: flex; flex-direction: column; gap: 4px; }\n.ag-hpop-sub { font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ag-fg-muted); }\n.ag-hpop-post { display: flex; align-items: baseline; gap: 5px; font-size: 11.5px; min-width: 0; }\n.ag-hpop-pseq { font-family: var(--ag-mono); color: var(--ag-fg-faint); flex: none; }\n.ag-hpop-ptxt { color: var(--ag-fg-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.ag-hpop-foot { border-top: 1px solid var(--ag-border); padding-top: 6px; color: var(--ag-fg-muted); font-size: 11px; }\n\n/* \u2500\u2500 Antigravity Split Subagent View \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ag-sub-wrap {\n  display: flex; flex-direction: column;\n  border: 1px solid var(--ag-card-border); border-radius: 12px;\n  background: var(--ag-card); overflow: hidden; min-height: 480px;\n}\n.ag-sub-wrap.full {\n  position: fixed; inset: 0; z-index: 75;\n  border-radius: 0; border: 0; height: 100vh; min-height: 0;\n  background: var(--ag-bg);\n}\n.ag-sub-topbar {\n  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;\n  padding: 10px 14px; border-bottom: 1px solid var(--ag-line);\n  background: var(--ag-card); flex: none;\n}\n.ag-sub-layout {\n  display: grid; grid-template-columns: minmax(0, 1fr) 268px;\n  flex: 1 1 auto; min-height: 0;\n}\n.ag-sub-layout.noside { grid-template-columns: minmax(0, 1fr); }\n.ag-sub-main {\n  display: flex; flex-direction: column; min-width: 0; min-height: 0;\n}\n.ag-sub-stream {\n  flex: 1 1 auto; overflow-y: auto; padding: 14px 18px 20px;\n  display: flex; flex-direction: column; gap: 10px;\n  max-height: 68vh;\n}\n.ag-sub-wrap.full .ag-sub-stream { max-height: none; }\n.ag-sub-side {\n  border-left: 1px solid var(--ag-line);\n  background: color-mix(in srgb, var(--ag-fg) 2%, transparent);\n  padding: 12px 10px; overflow-y: auto;\n  display: flex; flex-direction: column; gap: 10px;\n  max-height: 68vh;\n}\n.ag-sub-wrap.full .ag-sub-side { max-height: none; }\n.ag-sub-sgroup { font-size: 11px; font-weight: 600; color: var(--ag-fg-muted); padding: 2px 6px; }\n.ag-sub-sitem {\n  width: 100%; display: flex; align-items: flex-start; gap: 8px;\n  padding: 7px 8px; border: 0; border-radius: 8px;\n  background: transparent; text-align: left; color: var(--ag-fg-2);\n  font-size: 12.5px; transition: background-color 0.12s ease;\n}\n.ag-sub-sitem:hover { background: var(--ag-hover); color: var(--ag-fg); }\n.ag-sub-sitem.on { background: var(--ag-fill); color: var(--ag-fg); font-weight: 500; }\n.ag-sub-dotgrid {\n  display: grid; grid-template-columns: repeat(2, 4px); gap: 2px;\n  width: 10px; height: 10px; margin-top: 4px; flex: none;\n}\n.ag-sub-dotgrid i {\n  width: 4px; height: 4px; border-radius: 999px; background: var(--ag-primary);\n  animation: ag-sub-pulse 1.2s ease-in-out infinite;\n}\n.ag-sub-dotgrid i:nth-child(2) { animation-delay: 0.2s; }\n.ag-sub-dotgrid i:nth-child(3) { animation-delay: 0.4s; }\n.ag-sub-dotgrid i:nth-child(4) { animation-delay: 0.6s; }\n@keyframes ag-sub-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }\n.ag-sub-worked {\n  border: 0; background: transparent; padding: 3px 0;\n  display: inline-flex; align-items: center; gap: 6px;\n  font-size: 12px; color: var(--ag-fg-muted); text-align: left;\n}\n.ag-sub-worked:hover { color: var(--ag-fg); }\n@media (max-width: 720px) {\n  .ag-sub-layout { grid-template-columns: minmax(0, 1fr); }\n  .ag-sub-side { border-left: 0; border-top: 1px solid var(--ag-line); max-height: 220px; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .ag-root *, .ag-hpop * { animation: none !important; transition: none !important; }\n}\n';
		
		// client/i18n.ts
		var import_react = require("react");
		var STORAGE_KEY = "dsh-ag-swarm:locale";
		var currentLocale = "zh-CN";
		var hasExplicitUserPref = false;
		var listeners = /* @__PURE__ */ new Set();
		if (typeof window !== "undefined") {
		  try {
		    const saved = window.localStorage?.getItem(STORAGE_KEY);
		    if (saved === "en" || saved === "zh-CN") {
		      currentLocale = saved;
		      hasExplicitUserPref = true;
		    }
		  } catch {
		  }
		}
		function setUiLocale(next) {
		  if (next !== "zh-CN" && next !== "en") return;
		  currentLocale = next;
		  hasExplicitUserPref = true;
		  if (typeof window !== "undefined") {
		    try {
		      window.localStorage?.setItem(STORAGE_KEY, next);
		    } catch {
		    }
		  }
		  for (const fn of listeners) fn();
		}
		function toggleUiLocale() {
		  const next = currentLocale === "zh-CN" ? "en" : "zh-CN";
		  setUiLocale(next);
		  return next;
		}
		function syncHostLocale(hostLocale) {
		  if (hasExplicitUserPref || !hostLocale) return;
		  if (hostLocale.toLowerCase().startsWith("zh")) {
		    currentLocale = "zh-CN";
		    for (const fn of listeners) fn();
		  }
		}
		function useUiLocale() {
		  const [loc, setLoc] = (0, import_react.useState)(() => currentLocale);
		  (0, import_react.useEffect)(() => {
		    const fn = () => setLoc(currentLocale);
		    listeners.add(fn);
		    return () => {
		      listeners.delete(fn);
		    };
		  }, []);
		  return loc;
		}
		var MESSAGES = {
		  "zh-CN": {
		    "slot.swarm": "\u8702\u7FA4",
		    "slot.settings": "\u8702\u7FA4\u8BBE\u7F6E",
		    "common.refresh": "\u5237\u65B0",
		    "common.refreshing": "\u5237\u65B0\u4E2D\u2026",
		    "common.copy": "\u590D\u5236",
		    "common.copied": "\u5DF2\u590D\u5236",
		    "common.cancel": "\u53D6\u6D88",
		    "common.save": "\u4FDD\u5B58",
		    "common.saving": "\u4FDD\u5B58\u4E2D\u2026",
		    "common.close": "\u5173\u95ED",
		    "common.all": "\u5168\u90E8",
		    "common.live": "\u5B9E\u65F6",
		    "common.reconnecting": "\u91CD\u8FDE\u4E2D",
		    "common.offline": "\u79BB\u7EBF",
		    "common.showMore": "\u5C55\u5F00\u66F4\u591A",
		    "common.showLess": "\u6536\u8D77",
		    "common.loading": "\u6B63\u5728\u52A0\u8F7D\u8702\u7FA4\u9762\u677F\u2026",
		    "common.emptyTitle": "\u5F53\u524D\u4F1A\u8BDD\u5C1A\u672A\u542F\u52A8\u8702\u7FA4",
		    "common.emptyDesc": "\u5728\u804A\u5929\u6846\u8F93\u5165 `/swarm <\u76EE\u6807>` \u5373\u53EF\u521B\u5EFA\u5E76\u53D1\u591A\u5B50\u4EE3\u7406\u8702\u7FA4\uFF1B\u82E5\u5DF2\u6709\u5176\u4ED6\u5386\u53F2\u8702\u7FA4\uFF0C\u4E5F\u53EF\u4ECE\u53F3\u4E0A\u89D2\u4E0B\u62C9\u5207\u6362\u67E5\u770B\u3002",
		    "tab.overview": "\u603B\u89C8",
		    "tab.board": "\u9ED1\u677F",
		    "tab.subagents": "\u5B50\u4EE3\u7406",
		    "tab.members": "\u6210\u5458",
		    "tab.graph": "\u56FE\u8C31",
		    "tab.raw": "\u539F\u59CB\u6570\u636E",
		    "subagents.working": "\u5DE5\u4F5C\u4E2D",
		    "subagents.completed": "\u5DF2\u5B8C\u6210 / \u5F85\u547D",
		    "subagents.fullView": "\u5168\u5C4F\u89C6\u56FE",
		    "subagents.exitFullView": "\u9000\u51FA\u5168\u5C4F",
		    "subagents.showMore": "\u663E\u793A\u5176\u4F59 {count} \u4E2A\u5B50\u4EE3\u7406",
		    "subagents.showLess": "\u6536\u8D77\u5176\u4F59\u5B50\u4EE3\u7406",
		    "subagents.workedFor": "\u5DF2\u6267\u884C {duration}",
		    "subagents.stepsCount": "{count} \u6B65\u5DE5\u5177/\u601D\u8003",
		    "subagents.empty": "\u5F53\u524D\u8702\u7FA4\u6682\u65E0\u5B50\u4EE3\u7406\uFF0C\u6D3E\u53D1\u540E\u5C06\u5B9E\u65F6\u663E\u793A\u5728\u8FD9\u91CC\u3002",
		    "overview.goal": "\u8702\u7FA4\u76EE\u6807",
		    "overview.running": "\u8FDB\u884C\u4E2D",
		    "overview.progress": "\u6574\u4F53\u8FDB\u5EA6",
		    "overview.tasksDone": "\u5DF2\u5B8C\u6210 {done}/{total} \u9879\u4EFB\u52A1",
		    "overview.waitingCount": "{count} \u7B49\u5F85\u4E2D",
		    "overview.stuckCount": "{count} \u7591\u4F3C\u5361\u4F4F",
		    "overview.threadsOpen": "{count} \u4E2A\u5DE5\u4F5C\u6D41",
		    "overview.doneList": "\u5DF2\u5B8C\u6210",
		    "overview.upNext": "\u5F85\u63A8\u8FDB",
		    "overview.reel": "\u8FDB\u5EA6\u622A\u56FE\u65F6\u95F4\u8F74",
		    "overview.compare": "\u4E0E\u5F53\u524D\u5BF9\u6BD4",
		    "overview.exitCompare": "\u9000\u51FA\u5BF9\u6BD4",
		    "overview.threads": "\u5DE5\u4F5C\u6D41\u5206\u7EC4",
		    "overview.team": "\u8702\u7FA4\u56E2\u961F",
		    "overview.filterBy": "\u7B5B\u9009\u6210\u5458\uFF1A{name}",
		    "overview.clearFilter": "\u67E5\u770B\u5168\u90E8",
		    "overview.stallTitle": "\u8702\u7FA4\u6682\u505C\u63A8\u8FDB \u2014 \u5F53\u524D\u65E0\u6210\u5458\u5DE5\u4F5C\u4E2D",
		    "overview.stuckAlert": "@{name} \u7591\u4F3C\u5361\u4F4F",
		    "overview.stuckDetail": "\u6301\u7EED\u5DE5\u4F5C\u8D85\u8FC7 10 \u5206\u949F\u672A\u5728\u9ED1\u677F\u6C47\u62A5",
		    "overview.onboardingTitle": "\u6B63\u5728\u5524\u9192\u591A\u5B50\u4EE3\u7406\u8702\u7FA4\u2026",
		    "overview.onboardingDesc": "\u534F\u8C03\u8005\u6B63\u5728\u62C6\u5206\u4EFB\u52A1\u5E76\u6D3E\u53D1\u5E76\u53D1\u6210\u5458\uFF0C\u9996\u4E2A\u9ED1\u677F\u64AD\u62A5\u5230\u8FBE\u540E\u8FD9\u91CC\u5C06\u81EA\u52A8\u5C55\u5F00\u3002",
		    "board.search": "\u641C\u7D22\u9ED1\u677F\u53D1\u8A00\uFF08\u6210\u5458\u540D\u6216\u6B63\u6587\uFF09\u2026",
		    "board.filter": "\u7B5B\u9009",
		    "board.follow": "\u81EA\u52A8\u8DDF\u968F",
		    "board.from": "\u53D1\u9001\u65B9",
		    "board.to": "\u63D0\u53CA\u5BF9\u8C61",
		    "board.channel": "\u9891\u9053",
		    "board.showEarlier": "\u52A0\u8F7D\u66F4\u65E9\u53D1\u8A00",
		    "board.latest": "\u56DE\u5230\u5E95\u90E8\u6700\u65B0",
		    "board.newDivider": "\u65B0\u6D88\u606F",
		    "board.composePlaceholder": "\u53D1\u5E16\u5230 #{channel} \u6216 @\u67D0\u4F4D\u6210\u5458\u2026",
		    "board.composeBtn": "\u53D1\u5E16",
		    "board.send": "\u53D1\u9001",
		    "members.search": "\u641C\u7D22\u6210\u5458\u3001\u6A21\u578B\u3001\u5206\u652F\u6216\u4EFB\u52A1\u2026",
		    "members.coordinator": "\u534F\u8C03\u8005",
		    "members.active": "\u5DE5\u4F5C\u4E2D",
		    "members.standingBy": "\u5F85\u547D\u4E2D",
		    "members.retired": "\u5DF2\u505C\u6B62",
		    "members.state.working": "\u5DE5\u4F5C\u4E2D",
		    "members.state.waiting": "\u7B49\u5F85\u4E2D",
		    "members.state.stopped": "\u5DF2\u4F11\u7720",
		    "members.state.killed": "\u5DF2\u7EC8\u6B62",
		    "members.waitingOn": "\u7B49\u5F85 @{target}",
		    "members.wokenBy": "\u88AB #{seq} \u5524\u9192",
		    "drawer.controls": "\u5B9E\u65F6\u63A7\u5236",
		    "drawer.switchModel": "\u539F\u5730\u5207\u6362\u6A21\u578B\uFF08\u7B49\u5F85/\u4F11\u7720\u6001\u53EF\u7528\uFF0C\u4FDD\u7559\u5B8C\u6574\u5386\u53F2\uFF09",
		    "drawer.switchBtn": "\u5207\u6362\u6A21\u578B",
		    "drawer.nudge": "\u5524\u9192 / \u53D1\u9001\u6307\u4EE4\uFF08Nudge\uFF09",
		    "drawer.nudgePlaceholder": "\u8F93\u5165\u8981\u53D1\u9001\u7ED9 @{name} \u7684\u6D88\u606F\u2026",
		    "drawer.nudgeBtn": "\u5524\u9192",
		    "drawer.kill": "\u7EC8\u6B62\u6210\u5458\uFF08Kill\uFF09",
		    "drawer.killConfirm": "\u786E\u8BA4\u7EC8\u6B62 @{name}\uFF1F\uFF08\u5C06\u6E05\u7406\u5176\u72EC\u7ACB worktree\uFF09",
		    "drawer.confirmKillBtn": "\u786E\u8BA4\u7EC8\u6B62",
		    "drawer.transcript": "\u5DE5\u4F5C\u4E0A\u4E0B\u6587\u4E0E\u6267\u884C\u8F68\u8FF9",
		    "drawer.noSteps": "\u6682\u65E0\u53EF\u5C55\u793A\u7684\u6267\u884C\u8F68\u8FF9\u8BB0\u5F55\u3002",
		    "graph.hive": "\u8702\u5DE2\u89C6\u56FE",
		    "graph.mentions": "\u63D0\u53CA\u7F51\u7EDC",
		    "graph.evenPacing": "\u5747\u5300\u8282\u594F",
		    "graph.realTime": "\u771F\u5B9E\u95F4\u9694",
		    "graph.exportGif": "\u5BFC\u51FA GIF",
		    "graph.exporting": "\u7F16\u7801 GIF \u4E2D\u2026",
		    "graph.hideInactive": "\u9690\u85CF\u65E0\u4EA4\u4E92",
		    "graph.expandAll": "\u5C55\u5F00 @all",
		    "graph.postsOver": "{count} \u6761\u52A8\u6001 \xB7 \u8DE8\u5EA6 {span}",
		    "graph.cellsDone": "{cells} \u4E2A\u5DE5\u4F5C\u533A \xB7 \u5DF2\u5B8C\u6210 {done}/{total}",
		    "graph.legendDone": "\u4EFB\u52A1\u5B8C\u6210",
		    "graph.legendMsg": "\u6D88\u606F\u6D41\u5411",
		    "graph.legendWait": "\u7B49\u5F85\u4F9D\u8D56",
		    "graph.legendDirect": "\u76F4\u8FDE / \u9891\u9053",
		    "graph.legendAll": "@all \u5E7F\u64AD",
		    "graph.legendUnaddressed": "\u65E0\u5B9A\u5411\u53D1\u8A00",
		    "raw.refresh": "\u5237\u65B0\u539F\u6587",
		    "header.working": "{count} \u5DE5\u4F5C\u4E2D",
		    "header.waiting": "\u5168\u90E8\u5F85\u547D",
		    "header.noSwarm": "\u8702\u7FA4\u5F85\u547D",
		    "header.title": "\u5B9E\u65F6\u8702\u7FA4\u961F\u5217",
		    "header.recent": "\u6700\u8FD1\u9ED1\u677F\u52A8\u6001",
		    "settings.title": "DSH \u8702\u7FA4\uFF08Hive Swarm\uFF09",
		    "settings.activeSwarms": "\u6D3B\u8DC3\u8702\u7FA4\u5217\u8868",
		    "settings.noSwarms": "\u6682\u65E0\u8702\u7FA4\u8BB0\u5F55\u3002\u53EF\u5728\u4EFB\u610F\u4F1A\u8BDD\u8F93\u5165 `/swarm <\u76EE\u6807>` \u542F\u52A8\u3002",
		    "settings.roleModelsTitle": "\u6309\u89D2\u8272\u5B9A\u5236\u6A21\u578B",
		    "settings.roleModelsDesc": "\u4E3A\u4E0D\u540C\u804C\u8D23\u7684\u6210\u5458\u9884\u8BBE\u6A21\u578B\u4E0E\u601D\u8003\u5F3A\u5EA6\uFF1B\u6D3E\u53D1 Worker \u65F6\u82E5\u672A\u663E\u5F0F\u6307\u5B9A\u6A21\u578B\uFF0C\u5C06\u81EA\u52A8\u6309\u6B64\u6620\u5C04\u9009\u7528\u3002",
		    "settings.inheritMain": "\u7EE7\u627F\u4E3B\u5BF9\u8BDD\u6A21\u578B\uFF08\u9ED8\u8BA4\uFF09",
		    "settings.customModelPlaceholder": "\u6216\u624B\u52A8\u8F93\u5165\u6A21\u578B ID\uFF08\u5982 deepseek-v4-pro\uFF09",
		    "settings.effortDefault": "\u9ED8\u8BA4\u5F3A\u5EA6",
		    "settings.addRolePlaceholder": "\u6DFB\u52A0\u81EA\u5B9A\u4E49\u89D2\u8272\uFF08\u5982 frontend\u3001docs\uFF09",
		    "settings.addRoleBtn": "\u6DFB\u52A0\u89D2\u8272",
		    "settings.savePresets": "\u4FDD\u5B58\u89D2\u8272\u6A21\u578B\u914D\u7F6E",
		    "settings.presetsSaved": "\u89D2\u8272\u6A21\u578B\u9884\u8BBE\u5DF2\u4FDD\u5B58\uFF0C\u65B0\u6D3E\u53D1\u7684 Worker \u5C06\u81EA\u52A8\u751F\u6548\u3002",
		    "settings.pluginConfig": "\u63D2\u4EF6\u8FD0\u884C\u53C2\u6570",
		    "settings.primaryCmd": "\u4E3B\u659C\u6760\u547D\u4EE4",
		    "settings.waitTool": "\u963B\u585E\u7B49\u5F85\u5DE5\u5177",
		    "role.default": "\u9ED8\u8BA4\u5B50\u4EE3\u7406 (default)",
		    "role.explorer": "\u63A2\u7D22 / \u8C03\u7814 (explorer)",
		    "role.author": "\u7F16\u7801 / \u5B9E\u73B0 (author)",
		    "role.verifier": "\u5BA1\u67E5 / \u9A8C\u8BC1 (verifier)",
		    "role.monitor": "\u5DE1\u68C0\u76D1\u63A7 (monitor)",
		    "tool.title": "\u8702\u7FA4\u8C03\u5EA6\uFF1A{action}",
		    "tool.showDetails": "\u67E5\u770B\u8BE6\u60C5",
		    "tool.hideDetails": "\u6536\u8D77\u8BE6\u60C5"
		  },
		  en: {
		    "slot.swarm": "Swarm",
		    "slot.settings": "Hive Swarm",
		    "common.refresh": "Refresh",
		    "common.refreshing": "Refreshing\u2026",
		    "common.copy": "Copy",
		    "common.copied": "Copied",
		    "common.cancel": "Cancel",
		    "common.save": "Save",
		    "common.saving": "Saving\u2026",
		    "common.close": "Close",
		    "common.all": "All",
		    "common.live": "Live",
		    "common.reconnecting": "Reconnecting",
		    "common.offline": "Offline",
		    "common.showMore": "Show more",
		    "common.showLess": "Show less",
		    "common.loading": "Loading swarm workspace\u2026",
		    "common.emptyTitle": "No active swarm in this conversation",
		    "common.emptyDesc": "Start one with `/swarm <goal>` in chat, or switch to an existing swarm from the header.",
		    "tab.overview": "Overview",
		    "tab.board": "Board",
		    "tab.subagents": "Subagents",
		    "tab.members": "Members",
		    "tab.graph": "Graph",
		    "tab.raw": "Raw",
		    "subagents.working": "Working",
		    "subagents.completed": "Completed",
		    "subagents.fullView": "Full View",
		    "subagents.exitFullView": "Exit Full View",
		    "subagents.showMore": "Show {count} more subagents",
		    "subagents.showLess": "Show fewer subagents",
		    "subagents.workedFor": "Worked for {duration}",
		    "subagents.stepsCount": "{count} tool/thinking steps",
		    "subagents.empty": "No subagents in this swarm yet.",
		    "overview.goal": "GOAL",
		    "overview.running": "Running",
		    "overview.progress": "Progress",
		    "overview.tasksDone": "{done} of {total} tasks done",
		    "overview.waitingCount": "{count} waiting",
		    "overview.stuckCount": "{count} stuck",
		    "overview.threadsOpen": "{count} threads open",
		    "overview.doneList": "Done",
		    "overview.upNext": "Up next",
		    "overview.reel": "PROGRESS",
		    "overview.compare": "Compare with now",
		    "overview.exitCompare": "Exit compare",
		    "overview.threads": "Threads",
		    "overview.team": "The team",
		    "overview.filterBy": "Filtered by @{name}",
		    "overview.clearFilter": "Show all",
		    "overview.stallTitle": "Swarm stalled \u2014 no agents working",
		    "overview.stuckAlert": "@{name} appears stuck",
		    "overview.stuckDetail": "Working for more than 10 minutes without a board update",
		    "overview.onboardingTitle": "Spinning up parallel swarm\u2026",
		    "overview.onboardingDesc": "Coordinator is splitting work across parallel workers; live updates appear once the first post arrives.",
		    "board.search": "Search board posts\u2026",
		    "board.filter": "Filter",
		    "board.follow": "Follow",
		    "board.from": "From",
		    "board.to": "To",
		    "board.channel": "Channel",
		    "board.showEarlier": "Show earlier posts",
		    "board.latest": "Latest",
		    "board.newDivider": "New",
		    "board.composePlaceholder": "Post to #{channel} or @mention a member\u2026",
		    "board.composeBtn": "Compose",
		    "board.send": "Send",
		    "members.search": "Search members, models, branches, tasks\u2026",
		    "members.coordinator": "Coordinator",
		    "members.active": "ACTIVE",
		    "members.standingBy": "STANDING BY",
		    "members.retired": "RETIRED",
		    "members.state.working": "Working",
		    "members.state.waiting": "Waiting",
		    "members.state.stopped": "Stopped",
		    "members.state.killed": "Retired",
		    "members.waitingOn": "Waiting on @{target}",
		    "members.wokenBy": "Woken by #{seq}",
		    "drawer.controls": "CONTROLS",
		    "drawer.switchModel": "Switch model (available while waiting/stopped)",
		    "drawer.switchBtn": "Switch",
		    "drawer.nudge": "Nudge (send wakeup message)",
		    "drawer.nudgePlaceholder": "Wake @{name} with optional note\u2026",
		    "drawer.nudgeBtn": "Nudge",
		    "drawer.kill": "Terminate worker",
		    "drawer.killConfirm": "Terminate @{name}? (Cleans up isolated worktree)",
		    "drawer.confirmKillBtn": "Confirm Kill",
		    "drawer.transcript": "WORK CONTEXT & TRANSCRIPT",
		    "drawer.noSteps": "No transcript steps recorded yet.",
		    "graph.hive": "Hive",
		    "graph.mentions": "Mentions",
		    "graph.evenPacing": "Even pacing",
		    "graph.realTime": "Real-time gaps",
		    "graph.exportGif": "Export GIF",
		    "graph.exporting": "Encoding GIF\u2026",
		    "graph.hideInactive": "Hide inactive",
		    "graph.expandAll": "Expand @all",
		    "graph.postsOver": "{count} posts over {span}",
		    "graph.cellsDone": "{cells} cells \xB7 {done}/{total} done",
		    "graph.legendDone": "Tasks done",
		    "graph.legendMsg": "Message sent",
		    "graph.legendWait": "Waiting on",
		    "graph.legendDirect": "Direct / channel",
		    "graph.legendAll": "Via @all",
		    "graph.legendUnaddressed": "Unaddressed post",
		    "raw.refresh": "Refresh",
		    "header.working": "{count} working",
		    "header.waiting": "All idle",
		    "header.noSwarm": "Swarm idle",
		    "header.title": "Live Swarm Roster",
		    "header.recent": "Recent board activity",
		    "settings.title": "DSH Hive Swarm",
		    "settings.activeSwarms": "ACTIVE SWARMS",
		    "settings.noSwarms": "No swarms recorded yet. Start one with `/swarm <goal>`.",
		    "settings.roleModelsTitle": "ROLE MODEL PRESETS",
		    "settings.roleModelsDesc": "Customize models and reasoning effort per role. Workers without an explicit model inherit from this table.",
		    "settings.inheritMain": "Inherit main chat model (default)",
		    "settings.customModelPlaceholder": "Or type custom model ID (e.g. deepseek-v4-pro)",
		    "settings.effortDefault": "Default effort",
		    "settings.addRolePlaceholder": "Add custom role (e.g. frontend, docs)",
		    "settings.addRoleBtn": "Add role",
		    "settings.savePresets": "Save Role Presets",
		    "settings.presetsSaved": "Role model presets saved. New workers will use them automatically.",
		    "settings.pluginConfig": "PLUGIN CONFIGURATION",
		    "settings.primaryCmd": "Primary command",
		    "settings.waitTool": "Wait tool",
		    "role.default": "Default Worker (default)",
		    "role.explorer": "Explorer / Researcher (explorer)",
		    "role.author": "Author / Builder (author)",
		    "role.verifier": "Verifier / Reviewer (verifier)",
		    "role.monitor": "Stall Monitor (monitor)",
		    "tool.title": "Swarm: {action}",
		    "tool.showDetails": "Show details",
		    "tool.hideDetails": "Hide details"
		  }
		};
		function t(key, params) {
		  const table = MESSAGES[currentLocale] ?? MESSAGES["zh-CN"];
		  let text = table[key] ?? MESSAGES["zh-CN"][key] ?? key;
		  if (params) {
		    for (const [k, v] of Object.entries(params)) {
		      text = text.replaceAll(`{${k}}`, String(v));
		    }
		  }
		  return text;
		}
		
		// client/store.ts
		var import_react2 = require("react");
		var getFaces = () => ({});
		function normalizeEfforts(raw) {
		  if (!Array.isArray(raw) || raw.length === 0) return void 0;
		  const seen = /* @__PURE__ */ new Set();
		  const out = [];
		  for (const item of raw) {
		    if (typeof item === "string") {
		      const id = item.trim();
		      if (!id || seen.has(id)) continue;
		      seen.add(id);
		      out.push({ id, name: id });
		    } else if (item && typeof item === "object" && typeof item.id === "string") {
		      const id = item.id.trim();
		      if (!id || seen.has(id)) continue;
		      seen.add(id);
		      out.push({
		        id,
		        name: typeof item.name === "string" && item.name.trim() ? item.name.trim() : id,
		        ...typeof item.description === "string" && item.description ? { description: item.description } : {}
		      });
		    }
		  }
		  return out.length > 0 ? out : void 0;
		}
		async function fetchCatalogModels() {
		  const faces = getFaces();
		  const remote = faces.remote;
		  const collected = /* @__PURE__ */ new Map();
		  const addModel = (provider, id, name2, rawEfforts, defaultEffort, reasoningKnown) => {
		    const key = `${provider}/${id}`;
		    const efforts = normalizeEfforts(rawEfforts);
		    const next = {
		      provider,
		      model: id,
		      label: name2 && name2 !== id ? `${name2} (${provider})` : `${provider}/${id}`,
		      ...efforts ? { efforts } : {},
		      ...typeof defaultEffort === "string" && defaultEffort.trim() ? { defaultEffort: defaultEffort.trim() } : {},
		      ...reasoningKnown ? { reasoningKnown: true } : {}
		    };
		    const existing = collected.get(key);
		    if (!existing) {
		      collected.set(key, next);
		    } else if (next.reasoningKnown && (!existing.reasoningKnown || next.efforts && !existing.efforts)) {
		      collected.set(key, {
		        ...existing,
		        ...next.efforts ? { efforts: next.efforts } : {},
		        ...next.defaultEffort ? { defaultEffort: next.defaultEffort } : {},
		        reasoningKnown: true
		      });
		    }
		  };
		  if (typeof remote?.session?.modelCatalog === "function") {
		    try {
		      const reply = await remote.session.modelCatalog();
		      if (reply.ok && Array.isArray(reply.value?.groups)) {
		        for (const group of reply.value.groups) {
		          if (!group?.id) continue;
		          for (const m of group.models ?? []) {
		            if (!m?.id) continue;
		            addModel(
		              group.id,
		              m.id,
		              m.name,
		              m.reasoning?.efforts ?? m.efforts ?? m.reasoningEfforts,
		              m.reasoning?.defaultEffort,
		              true
		            );
		          }
		        }
		        if (collected.size > 0) return sortModels([...collected.values()]);
		      }
		    } catch {
		    }
		  }
		  try {
		    const apiRes = await fetch("/ag-swarm/api/models", { cache: "no-store" });
		    if (apiRes.ok) {
		      const body = await apiRes.json();
		      for (const m of body.models ?? []) {
		        if (!m?.model) continue;
		        addModel(m.provider || "default", m.model, m.label, m.efforts, m.defaultEffort, m.reasoningKnown ?? true);
		      }
		      if (collected.size > 0) return sortModels([...collected.values()]);
		    }
		  } catch {
		  }
		  if (remote?.llm) {
		    try {
		      const [provReply, confReply] = await Promise.all([
		        remote.llm.listProviders(),
		        remote.llm.listConfigurableProviders().catch(() => ({ ok: false }))
		      ]);
		      const registered = /* @__PURE__ */ new Set();
		      if (provReply.ok) {
		        for (const p of provReply.value ?? []) {
		          if (p?.id) registered.add(p.id);
		        }
		      }
		      const confs = confReply.ok ? confReply.value ?? [] : [];
		      await Promise.all(
		        confs.map(async (entry) => {
		          if (!entry?.provider || !entry.settingsNs || !registered.has(entry.provider)) return;
		          try {
		            const res = await remote.llm.discoverModels(entry.settingsNs, { provider: entry.provider });
		            if (!res.ok) return;
		            for (const m of res.value ?? []) {
		              if (m?.id) {
		                addModel(
		                  entry.provider,
		                  m.id,
		                  m.name,
		                  m.reasoning?.efforts ?? m.efforts ?? m.reasoningEfforts,
		                  m.reasoning?.defaultEffort,
		                  m.reasoning !== void 0 || m.efforts !== void 0 || m.reasoningEfforts !== void 0
		                );
		              }
		            }
		          } catch {
		          }
		        })
		      );
		      if (collected.size > 0) return sortModels([...collected.values()]);
		    } catch {
		    }
		  }
		  if (faces.api?.llm) {
		    try {
		      const modelsReply = await faces.api.llm.models({});
		      if (modelsReply.result?.ok) {
		        for (const group of modelsReply.result.value?.groups ?? []) {
		          if (!group?.id) continue;
		          for (const m of group.models ?? []) {
		            if (m?.id) {
		              addModel(
		                group.id,
		                m.id,
		                m.name,
		                m.reasoning?.efforts ?? m.efforts ?? m.reasoningEfforts,
		                m.reasoning?.defaultEffort,
		                true
		              );
		            }
		          }
		        }
		      }
		    } catch {
		    }
		  }
		  return sortModels([...collected.values()]);
		}
		function sortModels(list) {
		  return list.sort(
		    (a, b) => a.provider === b.provider ? a.model.localeCompare(b.model) : a.provider.localeCompare(b.provider)
		  );
		}
		function normalizeSwarmsResponse(raw) {
		  if (Array.isArray(raw)) return raw;
		  if (raw && typeof raw === "object" && Array.isArray(raw.swarms)) {
		    return raw.swarms;
		  }
		  return [];
		}
		function unwrapSnapshotResponse(raw) {
		  if (!raw || typeof raw !== "object") return { snapshot: null };
		  const obj = raw;
		  if (obj.unchanged === true) return { unchanged: true, snapshot: null };
		  if (obj.snapshot && typeof obj.snapshot === "object") {
		    return { snapshot: obj.snapshot };
		  }
		  if (typeof obj.swarm_id === "string") {
		    return { snapshot: obj };
		  }
		  return { snapshot: null };
		}
		var SwarmClientStore = class {
		  constructor() {
		    __publicField(this, "state", {
		      swarms: [],
		      activeSwarmId: null,
		      sessionId: void 0,
		      snapshot: null,
		      loading: false,
		      error: null,
		      sync: "stopped",
		      models: [],
		      modelsLoading: false,
		      lastUpdatedAt: 0
		    });
		    __publicField(this, "listeners", /* @__PURE__ */ new Set());
		    __publicField(this, "source", null);
		    __publicField(this, "reconnectTimer", null);
		    __publicField(this, "refetchTimer", null);
		    __publicField(this, "pollTimer", null);
		    __publicField(this, "visibilityListener", null);
		    __publicField(this, "inFlight", null);
		    __publicField(this, "refs", 0);
		    __publicField(this, "stopped", true);
		    __publicField(this, "generation", 0);
		    __publicField(this, "trailing", false);
		    __publicField(this, "etag", "");
		    __publicField(this, "manualSwarmId", null);
		    __publicField(this, "modelsFetched", false);
		  }
		  setFacesGetter(getter) {
		    getFaces = getter;
		  }
		  getState() {
		    return this.state;
		  }
		  subscribe(listener) {
		    this.listeners.add(listener);
		    listener(this.state);
		    return () => {
		      this.listeners.delete(listener);
		    };
		  }
		  retain() {
		    this.refs += 1;
		    if (this.refs === 1) this.start();
		    let released = false;
		    return () => {
		      if (released) return;
		      released = true;
		      this.refs = Math.max(0, this.refs - 1);
		      if (this.refs === 0) this.stop();
		    };
		  }
		  setSessionId(sessionId) {
		    if (this.state.sessionId === sessionId) return;
		    this.manualSwarmId = null;
		    this.etag = "";
		    this.patch({ sessionId, activeSwarmId: null, snapshot: null, loading: true, error: null });
		    if (!this.stopped) {
		      void this.refresh({ force: true });
		    }
		  }
		  async selectSwarm(swarmId) {
		    this.manualSwarmId = swarmId;
		    this.etag = "";
		    this.patch({ activeSwarmId: swarmId, loading: true, error: null });
		    return this.refresh({ force: true, swarmId: swarmId ?? void 0 });
		  }
		  async listSwarms() {
		    const res = await fetch("/ag-swarm/api/swarms", { cache: "no-store" });
		    if (!res.ok) throw new Error(`HTTP ${res.status}`);
		    const swarms = normalizeSwarmsResponse(await res.json());
		    this.patch({ swarms });
		    return swarms;
		  }
		  async listModels(force = false) {
		    if (this.modelsFetched && !force && this.state.models.length > 0) {
		      return this.state.models;
		    }
		    this.patch({ modelsLoading: true });
		    try {
		      const models = await fetchCatalogModels();
		      this.modelsFetched = true;
		      this.patch({ models, modelsLoading: false });
		      return models;
		    } catch {
		      this.patch({ modelsLoading: false });
		      return this.state.models;
		    }
		  }
		  async fetchMessagesBefore(swarmId, beforeSeq, limit = 200) {
		    const q = new URLSearchParams({
		      swarmId,
		      before: String(beforeSeq),
		      limit: String(limit)
		    });
		    const res = await fetch(`/ag-swarm/api/swarm/messages?${q.toString()}`, { cache: "no-store" });
		    if (!res.ok) throw new Error(`HTTP ${res.status}`);
		    const raw = await res.json();
		    let older = [];
		    let hasMore = false;
		    if (Array.isArray(raw)) {
		      older = raw;
		      hasMore = older.length >= limit;
		    } else if (raw && typeof raw === "object") {
		      const obj = raw;
		      older = Array.isArray(obj.messages) ? obj.messages : [];
		      hasMore = typeof obj.hasMore === "boolean" ? obj.hasMore : (obj.messagesOffset ?? 0) > 0;
		    }
		    const snap = this.state.snapshot;
		    if (snap && snap.swarm_id === swarmId && older.length > 0) {
		      const seen = new Set(snap.messages.map((m) => m.seq));
		      const prepend = older.filter((m) => !seen.has(m.seq));
		      const merged = [...prepend, ...snap.messages].sort((a, b) => a.seq - b.seq);
		      const nextOffset = hasMore ? Math.max(0, snap.messagesOffset - prepend.length) : 0;
		      this.patch({
		        snapshot: {
		          ...snap,
		          messages: merged,
		          messagesOffset: nextOffset
		        }
		      });
		    } else if (snap && snap.swarm_id === swarmId && !hasMore && snap.messagesOffset > 0) {
		      this.patch({ snapshot: { ...snap, messagesOffset: 0 } });
		    }
		    return { messages: older, hasMore };
		  }
		  async fetchRawFiles(swarmId) {
		    const q = new URLSearchParams({ swarmId });
		    const res = await fetch(`/ag-swarm/api/swarm/raw?${q.toString()}`, { cache: "no-store" });
		    if (!res.ok) throw new Error(`HTTP ${res.status}`);
		    return await res.json();
		  }
		  async fetchMemberTranscript(swarmId, member) {
		    const q = new URLSearchParams({ swarmId, member });
		    const res = await fetch(`/ag-swarm/api/member-transcript?${q.toString()}`, { cache: "no-store" });
		    if (!res.ok) throw new Error(`HTTP ${res.status}`);
		    return await res.json();
		  }
		  async fetchConfig() {
		    const res = await fetch("/ag-swarm/api/config", { cache: "no-store" });
		    if (!res.ok) throw new Error(`HTTP ${res.status}`);
		    const raw = await res.json();
		    const base = raw.config && typeof raw.config === "object" ? { ...raw.config, ...raw } : raw;
		    const presets = base.modelPresets && typeof base.modelPresets === "object" ? base.modelPresets : {};
		    return {
		      ...base,
		      primaryCommand: typeof base.primaryCommand === "string" && base.primaryCommand ? base.primaryCommand : "/swarm",
		      waitToolName: typeof base.waitToolName === "string" && base.waitToolName ? base.waitToolName : "swarm_wait",
		      modelPresets: presets
		    };
		  }
		  async saveModelPresets(presets) {
		    const res = await fetch("/ag-swarm/api/model-presets", {
		      method: "POST",
		      headers: { "content-type": "application/json" },
		      body: JSON.stringify({ modelPresets: presets })
		    });
		    let json = {};
		    try {
		      json = await res.json();
		    } catch {
		    }
		    if (!res.ok || json.ok === false) {
		      throw new Error(typeof json.error === "string" ? json.error : `HTTP ${res.status}`);
		    }
		    const saved = json.modelPresets ?? json.presets;
		    return saved && typeof saved === "object" ? saved : presets;
		  }
		  async postAction(req) {
		    const res = await fetch("/ag-swarm/api/action", {
		      method: "POST",
		      headers: { "content-type": "application/json" },
		      body: JSON.stringify(req)
		    });
		    let json = {};
		    try {
		      json = await res.json();
		    } catch {
		    }
		    if (!res.ok || json.ok === false) {
		      const msg = typeof json.error === "string" ? json.error : `HTTP ${res.status}`;
		      throw new Error(msg);
		    }
		    this.scheduleRefetch(60);
		    return json;
		  }
		  frameUrl(swarmId, framePath) {
		    const q = new URLSearchParams({ swarmId, path: framePath });
		    return `/ag-swarm/api/frame?${q.toString()}`;
		  }
		  start() {
		    if (!this.stopped) return;
		    this.stopped = false;
		    const gen = ++this.generation;
		    this.patch({ sync: typeof EventSource === "undefined" ? "snapshot" : "connecting", error: null });
		    void this.refresh({ force: true });
		    void this.listModels();
		    this.openEventSource(gen);
		    this.schedulePoll(gen);
		    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
		      const onVis = () => {
		        if (document.visibilityState === "visible") this.scheduleRefetch(40);
		      };
		      this.visibilityListener = onVis;
		      document.addEventListener("visibilitychange", onVis);
		    }
		  }
		  schedulePoll(gen) {
		    if (this.stopped || gen !== this.generation) return;
		    if (this.pollTimer) clearTimeout(this.pollTimer);
		    const snap = this.state.snapshot;
		    const active = snap ? Object.values(snap.members).some((m) => !m.killed && m.state === "working") : false;
		    const interval = active || this.state.sync !== "live" ? 1500 : 6e3;
		    this.pollTimer = setTimeout(() => {
		      this.pollTimer = null;
		      if (this.stopped || gen !== this.generation) return;
		      this.scheduleRefetch(0);
		      this.schedulePoll(gen);
		    }, interval);
		  }
		  openEventSource(gen) {
		    if (this.stopped || gen !== this.generation || typeof EventSource === "undefined") return;
		    if (this.source) {
		      this.source.close();
		      this.source = null;
		    }
		    let es;
		    try {
		      es = new EventSource("/ag-swarm/api/events");
		    } catch {
		      this.patch({ sync: "snapshot" });
		      return;
		    }
		    this.source = es;
		    const owns = () => !this.stopped && this.generation === gen && this.source === es;
		    es.onopen = () => {
		      if (!owns()) return;
		      this.patch({ sync: "live", error: null });
		      this.scheduleRefetch(80);
		    };
		    es.onmessage = (evt) => {
		      if (!owns()) return;
		      try {
		        const payload = JSON.parse(evt.data);
		        if (payload.type === "ping") return;
		        if (payload.type === "connected") {
		          this.patch({ sync: "live" });
		          return;
		        }
		        if (payload.type === "swarm_update") {
		          this.scheduleRefetch(50);
		        }
		      } catch {
		        this.scheduleRefetch(100);
		      }
		    };
		    es.onerror = () => {
		      if (!owns()) return;
		      this.patch({ sync: "reconnecting" });
		      this.scheduleRefetch(300);
		      if (es.readyState === EventSource.CLOSED) {
		        es.close();
		        this.source = null;
		        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		        this.reconnectTimer = setTimeout(() => {
		          this.reconnectTimer = null;
		          this.openEventSource(gen);
		        }, 2500);
		      }
		    };
		  }
		  stop() {
		    this.stopped = true;
		    this.generation += 1;
		    if (this.source) {
		      this.source.close();
		      this.source = null;
		    }
		    if (this.reconnectTimer) {
		      clearTimeout(this.reconnectTimer);
		      this.reconnectTimer = null;
		    }
		    if (this.refetchTimer) {
		      clearTimeout(this.refetchTimer);
		      this.refetchTimer = null;
		    }
		    if (this.pollTimer) {
		      clearTimeout(this.pollTimer);
		      this.pollTimer = null;
		    }
		    if (this.visibilityListener && typeof document !== "undefined") {
		      document.removeEventListener("visibilitychange", this.visibilityListener);
		      this.visibilityListener = null;
		    }
		    this.inFlight?.abort();
		    this.inFlight = null;
		    this.trailing = false;
		    this.patch({ sync: "stopped" });
		  }
		  scheduleRefetch(delay = 140) {
		    if (this.stopped) return;
		    if (this.inFlight) {
		      this.trailing = true;
		      return;
		    }
		    if (this.refetchTimer) return;
		    this.refetchTimer = setTimeout(() => {
		      this.refetchTimer = null;
		      void this.refresh();
		    }, delay);
		  }
		  async refresh(opts = {}) {
		    if (this.refetchTimer) {
		      clearTimeout(this.refetchTimer);
		      this.refetchTimer = null;
		    }
		    if (this.inFlight && !opts.force) {
		      this.trailing = true;
		      return this.state.snapshot;
		    }
		    if (this.inFlight && opts.force) {
		      this.inFlight.abort();
		    }
		    const gen = this.generation;
		    const controller = new AbortController();
		    this.inFlight = controller;
		    this.trailing = false;
		    const owns = () => !this.stopped && gen === this.generation && this.inFlight === controller && !controller.signal.aborted;
		    try {
		      const swarmsRes = await fetch("/ag-swarm/api/swarms", { signal: controller.signal, cache: "no-store" });
		      let swarms = this.state.swarms;
		      if (swarmsRes.ok) {
		        swarms = normalizeSwarmsResponse(await swarmsRes.json());
		      }
		      if (!owns()) return this.state.snapshot;
		      const targetSession = opts.sessionId ?? this.state.sessionId;
		      const targetSwarm = opts.swarmId ?? this.manualSwarmId ?? void 0;
		      const q = new URLSearchParams();
		      if (targetSwarm) q.set("swarmId", targetSwarm);
		      else if (targetSession) q.set("sessionId", targetSession);
		      if (!opts.force && this.etag && this.state.snapshot) {
		        q.set("etag", this.etag);
		      }
		      const snapRes = await fetch(`/ag-swarm/api/swarm${q.toString() ? `?${q.toString()}` : ""}`, {
		        signal: controller.signal,
		        cache: "no-store"
		      });
		      if (!owns()) return this.state.snapshot;
		      if (snapRes.status === 404 || snapRes.status === 204) {
		        if (!targetSwarm && targetSession && swarms.length > 0) {
		          const fallback = swarms[0];
		          const fbRes = await fetch(`/ag-swarm/api/swarm?swarmId=${encodeURIComponent(fallback.swarm_id)}`, {
		            signal: controller.signal,
		            cache: "no-store"
		          });
		          if (owns() && fbRes.ok) {
		            const fbParsed = unwrapSnapshotResponse(await fbRes.json());
		            if (fbParsed.snapshot) {
		              this.etag = fbParsed.snapshot.etag || "";
		              this.patch({
		                swarms,
		                activeSwarmId: fbParsed.snapshot.swarm_id,
		                snapshot: fbParsed.snapshot,
		                loading: false,
		                error: null,
		                lastUpdatedAt: Date.now()
		              });
		              return fbParsed.snapshot;
		            }
		          }
		        }
		        this.etag = "";
		        this.patch({ swarms, activeSwarmId: null, snapshot: null, loading: false, error: null, lastUpdatedAt: Date.now() });
		        return null;
		      }
		      if (!snapRes.ok) throw new Error(`HTTP ${snapRes.status}`);
		      const parsed = unwrapSnapshotResponse(await snapRes.json());
		      if (!owns()) return this.state.snapshot;
		      if (parsed.unchanged) {
		        this.patch({ swarms, loading: false, error: null, lastUpdatedAt: Date.now() });
		        return this.state.snapshot;
		      }
		      const snap = parsed.snapshot;
		      this.etag = snap?.etag || "";
		      this.patch({
		        swarms,
		        activeSwarmId: snap?.swarm_id ?? null,
		        snapshot: snap,
		        loading: false,
		        error: null,
		        lastUpdatedAt: Date.now()
		      });
		      return snap;
		    } catch (err) {
		      if (!owns()) return this.state.snapshot;
		      const msg = err instanceof Error ? err.message : String(err);
		      this.patch({ loading: false, error: msg });
		      return this.state.snapshot;
		    } finally {
		      if (owns()) {
		        this.inFlight = null;
		        if (this.trailing) {
		          this.trailing = false;
		          this.scheduleRefetch(140);
		        }
		      }
		    }
		  }
		  patch(partial) {
		    this.state = { ...this.state, ...partial };
		    for (const listener of this.listeners) {
		      listener(this.state);
		    }
		  }
		};
		var swarmClientStore = new SwarmClientStore();
		function useSwarmStore(sessionId) {
		  const [state, setState] = (0, import_react2.useState)(() => swarmClientStore.getState());
		  (0, import_react2.useEffect)(() => {
		    const release = swarmClientStore.retain();
		    const unsub = swarmClientStore.subscribe(setState);
		    return () => {
		      unsub();
		      release();
		    };
		  }, []);
		  (0, import_react2.useEffect)(() => {
		    if (sessionId !== void 0) {
		      swarmClientStore.setSessionId(sessionId);
		    }
		  }, [sessionId]);
		  return {
		    ...state,
		    store: swarmClientStore,
		    refresh: (force = false) => swarmClientStore.refresh({ force }),
		    selectSwarm: (swarmId) => swarmClientStore.selectSwarm(swarmId),
		    postAction: (req) => swarmClientStore.postAction(req),
		    fetchMessagesBefore: (swarmId, beforeSeq, limit) => swarmClientStore.fetchMessagesBefore(swarmId, beforeSeq, limit),
		    fetchRawFiles: (swarmId) => swarmClientStore.fetchRawFiles(swarmId),
		    fetchMemberTranscript: (swarmId, member) => swarmClientStore.fetchMemberTranscript(swarmId, member),
		    fetchConfig: () => swarmClientStore.fetchConfig(),
		    saveModelPresets: (presets) => swarmClientStore.saveModelPresets(presets),
		    listModels: (force) => swarmClientStore.listModels(force)
		  };
		}
		
		// client/components/SwarmWorkspace.tsx
		var import_react14 = require("react");
		
		// client/components/OverviewTab.tsx
		var import_react4 = require("react");
		
		// client/bee-sprites.ts
		var import_react3 = require("react");
		var PALETTE_HUES = [12, 150, 262, 330, 196, 228, 96, 28, 290, 175, 350, 60];
		var HEX_BG_SVG = encodeURIComponent(
		  "<svg xmlns='http://www.w3.org/2000/svg' width='28' height='24.25' viewBox='0 0 28 24.25'><path d='M14 0l12.12 7v14l-12.12 7L1.88 21V7z' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1.2'/></svg>"
		).replace(/'/g, "%27");
		function hashName(s) {
		  let acc = 7;
		  for (let i = 0; i < s.length; i += 1) {
		    acc = acc * 31 + s.charCodeAt(i) >>> 0;
		  }
		  return acc;
		}
		function isQueenBee(name2, role) {
		  return name2 === "coordinator" || role === "coordinator";
		}
		function getBeeHue(name2, role) {
		  if (isQueenBee(name2, role)) return 46;
		  return PALETTE_HUES[hashName(String(name2 || "worker")) % PALETTE_HUES.length];
		}
		function hsl2hex(h, s, l) {
		  const hh = (h % 360 + 360) % 360;
		  const ss = s / 100;
		  const ll = l / 100;
		  const k = (n) => (n + hh / 30) % 12;
		  const a = ss * Math.min(ll, 1 - ll);
		  const f = (n) => ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
		  return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
		}
		function shiftHue(h, target, amt) {
		  const d = (target - h + 540) % 360 - 180;
		  return h + d * amt;
		}
		function beeRamp(name2, role) {
		  const h = getBeeHue(name2, role);
		  return {
		    spec: hsl2hex(shiftHue(h, 55, 0.28), 96, 90),
		    hi: hsl2hex(shiftHue(h, 55, 0.18), 90, 74),
		    mid: hsl2hex(h, 78, 60),
		    sh: hsl2hex(shiftHue(h, 265, 0.22), 58, 44),
		    ol: hsl2hex(shiftHue(h, 265, 0.35), 42, 19),
		    skh: hsl2hex(shiftHue(h, 265, 0.15), 20, 30),
		    sk: hsl2hex(shiftHue(h, 265, 0.3), 24, 18),
		    skd: hsl2hex(shiftHue(h, 265, 0.45), 32, 10)
		  };
		}
		function getBeeColor(name2, role) {
		  return hsl2hex(getBeeHue(name2, role), 78, 60);
		}
		function getBeeTileBg(name2, role) {
		  if (isQueenBee(name2, role)) {
		    return `#1C1B22 url("data:image/svg+xml,${HEX_BG_SVG}")`;
		  }
		  return `color-mix(in srgb, ${getBeeColor(name2, role)} 22%, var(--ag-card, #ffffff))`;
		}
		function normalizeDrawState(state) {
		  if (!state || state === "working" || state === "needs_you") return "working";
		  if (state === "waiting_on") return "waiting_on";
		  if (state === "waiting" || state === "stopped" || state === "parked") return "parked";
		  return "landed";
		}
		function drawBee(cv, name2, state, frame, role) {
		  const W = 22;
		  const H = 18;
		  cv.width = W;
		  cv.height = H;
		  const ctx = cv.getContext("2d");
		  if (!ctx) return;
		  ctx.imageSmoothingEnabled = false;
		  ctx.clearRect(0, 0, W, H);
		  const R = beeRamp(name2, role);
		  const queen = isQueenBee(name2, role);
		  const norm = normalizeDrawState(state);
		  const landed = norm === "parked" || norm === "landed";
		  const asleep = norm === "parked";
		  const P = (x, y, col) => {
		    if (x < 0 || y < 0 || x >= W || y >= H) return;
		    ctx.fillStyle = col;
		    ctx.fillRect(x, y, 1, 1);
		  };
		  const cx = 11;
		  const cy = 10.5;
		  const rx = 7.3;
		  const ry = 4.8;
		  const inside = (x, y) => {
		    const nx = (x + 0.5 - cx) / rx;
		    const ny = (y + 0.5 - cy) / ry;
		    return nx * nx + ny * ny <= 1;
		  };
		  const Lraw = [-0.42, -0.62, 0.66];
		  const Ln = Math.hypot(Lraw[0], Lraw[1], Lraw[2]);
		  const L = [Lraw[0] / Ln, Lraw[1] / Ln, Lraw[2] / Ln];
		  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
		  const rows = (spec) => {
		    const pts = [];
		    for (const [y, x0, x1] of spec) {
		      for (let x = x0; x <= x1; x += 1) pts.push([x, y]);
		    }
		    return pts;
		  };
		  const drawWing = (pts, glint) => {
		    const set = new Set(pts.map((p) => `${p[0]},${p[1]}`));
		    for (const [x, y] of pts) {
		      const edge = N4.some(([dx, dy]) => !set.has(`${x + dx},${y + dy}`));
		      P(x, y, edge ? "rgba(140,160,192,0.9)" : "rgba(255,255,255,0.72)");
		    }
		    if (glint) {
		      const inner = pts.filter(([x, y]) => !N4.some(([dx, dy]) => !set.has(`${x + dx},${y + dy}`))).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
		      if (inner[0]) P(inner[0][0], inner[0][1], "#FFFFFF");
		    }
		  };
		  let back = null;
		  let front;
		  if (landed) {
		    front = rows([[5, 14, 17], [6, 13, 18]]);
		  } else if (frame === 0) {
		    back = rows([[1, 16, 17], [2, 16, 18], [3, 15, 18], [4, 15, 17], [5, 15, 16]]);
		    front = rows([[0, 13, 14], [1, 12, 15], [2, 11, 15], [3, 11, 14], [4, 11, 13], [5, 11, 12]]);
		  } else {
		    back = rows([[3, 16, 18], [4, 15, 19], [5, 16, 18]]);
		    front = rows([[3, 13, 16], [4, 12, 17], [5, 12, 17], [6, 13, 15]]);
		  }
		  if (back) drawWing(back, false);
		  const stripe = (x, y) => {
		    const ny = (y + 0.5 - cy) / ry;
		    const u = x + 0.5 + 1.15 * ny * ny;
		    return u > 10.6 && u < 12.5 || u > 14.3 && u < 16.1 || u > 17.9;
		  };
		  for (let y = 0; y < H; y += 1) {
		    for (let x = 0; x < W; x += 1) {
		      if (!inside(x, y)) continue;
		      const nx = (x + 0.5 - cx) / rx;
		      const ny = (y + 0.5 - cy) / ry;
		      const rr = Math.min(1, nx * nx + ny * ny);
		      const nz = Math.sqrt(1 - rr);
		      const I = nx * L[0] + ny * L[1] + nz * L[2];
		      const col = stripe(x, y) ? I > 0.8 ? R.skh : I > 0.3 ? R.sk : R.skd : I > 0.965 ? R.spec : I > 0.78 ? R.hi : I > 0.26 ? R.mid : R.sh;
		      P(x, y, col);
		    }
		  }
		  for (let y = 0; y < H; y += 1) {
		    for (let x = 0; x < W; x += 1) {
		      if (inside(x, y)) continue;
		      const nbs = N4.filter(([dx, dy]) => inside(x + dx, y + dy));
		      if (nbs.length === 0) continue;
		      const nx = (x + 0.5 - cx) / rx;
		      const ny = (y + 0.5 - cy) / ry;
		      const n = Math.hypot(nx, ny) || 1;
		      const d = nx / n * L[0] + ny / n * L[1];
		      const nextToStripe = nbs.some(([dx, dy]) => stripe(x + dx, y + dy));
		      P(x, y, d > 0.5 && !nextToStripe ? R.sh : R.ol);
		    }
		  }
		  P(19, 10, R.ol);
		  P(20, 10, R.ol);
		  if (asleep) {
		    P(6, 10, R.ol);
		    P(7, 10, R.ol);
		  } else {
		    P(6, 9, "#FFFFFF");
		    P(7, 9, R.skd);
		    P(6, 10, R.skd);
		    P(7, 10, R.skd);
		  }
		  P(5, 11, "rgba(255,128,150,0.55)");
		  P(4, 11, "rgba(255,128,150,0.35)");
		  if (queen) {
		    const g1 = "#F7CE5B";
		    const g2 = "#FFE9A6";
		    const g3 = "#C98A2B";
		    for (const [x, y] of [[5, 5], [6, 5], [7, 5], [8, 5], [9, 5]]) P(x, y, g1);
		    P(5, 4, g2);
		    P(7, 4, g2);
		    P(9, 4, g2);
		    P(7, 3, g2);
		    P(5, 5, g3);
		    P(9, 5, g3);
		    P(7, 5, "#E4566A");
		  } else {
		    for (const [x, y] of [[7, 5], [6, 4], [5, 3]]) P(x, y, R.ol);
		    P(4, 3, R.sk);
		    for (const [x, y] of [[9, 5], [9, 4], [9, 3]]) P(x, y, R.ol);
		    P(8, 2, R.sk);
		  }
		  drawWing(front, true);
		  if (asleep) {
		    const z = "#8C90A6";
		    for (const [x, y] of [
		      [0, 0],
		      [1, 0],
		      [2, 0],
		      [3, 0],
		      [2, 1],
		      [1, 2],
		      [0, 3],
		      [1, 3],
		      [2, 3],
		      [3, 3]
		    ]) {
		      P(x, y, z);
		    }
		  }
		}
		var spriteCanvases = /* @__PURE__ */ new Map();
		var beeDataUrls = /* @__PURE__ */ new Map();
		function getCachedCanvas(name2, role, state, frame) {
		  if (typeof document === "undefined") return null;
		  const key = `${name2}\0${role ?? ""}\0${normalizeDrawState(state)}\0${frame}`;
		  let cv = spriteCanvases.get(key);
		  if (!cv) {
		    if (spriteCanvases.size > 1024) spriteCanvases.clear();
		    cv = document.createElement("canvas");
		    drawBee(cv, name2, state, frame, role);
		    spriteCanvases.set(key, cv);
		  }
		  return cv;
		}
		function blitBee(dst, name2, role, state, frame) {
		  if (!dst) return;
		  const src = getCachedCanvas(name2, role, state, frame);
		  if (!src) return;
		  if (dst.width !== src.width) dst.width = src.width;
		  if (dst.height !== src.height) dst.height = src.height;
		  const ctx = dst.getContext("2d");
		  if (!ctx) return;
		  ctx.imageSmoothingEnabled = false;
		  ctx.clearRect(0, 0, src.width, src.height);
		  ctx.drawImage(src, 0, 0);
		}
		function getBeeDataUrl(name2, role, state = "landed") {
		  const key = `${name2}\0${role ?? ""}\0${normalizeDrawState(state)}`;
		  const existing = beeDataUrls.get(key);
		  if (existing !== void 0) return existing;
		  const cv = getCachedCanvas(name2, role, state, 0);
		  if (!cv) return "";
		  try {
		    const url = cv.toDataURL();
		    if (beeDataUrls.size > 512) beeDataUrls.clear();
		    beeDataUrls.set(key, url);
		    return url;
		  } catch {
		    return "";
		  }
		}
		function resolveDotVariant(state, explicit) {
		  if (explicit) return explicit;
		  if (state === "working") return "working";
		  if (state === "needs_you" || state === "waiting_on") return "waiting";
		  return null;
		}
		function PixelBee(props) {
		  const { name: name2, role, state = "working", size = 2, showDot = false, dotVariant, framed = false, className = "", title } = props;
		  const c0Ref = (0, import_react3.useRef)(null);
		  const c1Ref = (0, import_react3.useRef)(null);
		  const isKilled = state === "killed";
		  const norm = isKilled ? "landed" : normalizeDrawState(state);
		  (0, import_react3.useEffect)(() => {
		    blitBee(c0Ref.current, name2, role, isKilled ? "landed" : state, 0);
		    blitBee(c1Ref.current, name2, role, isKilled ? "landed" : state, 1);
		  }, [name2, role, state, isKilled]);
		  const dotCls = showDot ? resolveDotVariant(state, dotVariant) : null;
		  const cls = [
		    "ag-beebox",
		    `sz-${size}`,
		    isKilled ? "killed" : "",
		    framed ? "framed" : "",
		    className
		  ].filter(Boolean).join(" ");
		  const style = framed ? { background: getBeeTileBg(name2, role) } : void 0;
		  return (0, import_react3.createElement)(
		    "span",
		    {
		      className: cls,
		      "data-state": isKilled ? "landed" : state === "needs_you" ? "needs_you" : norm,
		      style,
		      title,
		      "aria-hidden": title ? void 0 : true
		    },
		    (0, import_react3.createElement)(
		      "span",
		      { className: "ag-beewrap" },
		      (0, import_react3.createElement)("canvas", { ref: c0Ref, width: 22, height: 18 }),
		      (0, import_react3.createElement)("canvas", { ref: c1Ref, width: 22, height: 18 })
		    ),
		    dotCls ? (0, import_react3.createElement)("i", { className: `ag-beedot ${dotCls}`, "aria-hidden": true }) : null
		  );
		}
		
		// client/components/OverviewTab.tsx
		var import_jsx_runtime = require("react/jsx-runtime");
		var THREAD_ORDER = {
		  needs: 0,
		  waiting: 1,
		  stuck: 2,
		  running: 3,
		  queued: 4,
		  done: 5
		};
		var THREAD_LABEL = {
		  needs: "Needs you",
		  waiting: "Waiting",
		  stuck: "Stuck",
		  running: "Moving",
		  queued: "Not started",
		  done: "Done"
		};
		function shimmerDelay() {
		  return `-${Date.now() % 1900}ms`;
		}
		function formatFrameTime(frame) {
		  if (Number.isFinite(frame.ts) && frame.ts > 0) {
		    try {
		      return new Date(frame.ts).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
		    } catch {
		    }
		  }
		  return frame.time || `#${frame.seq}`;
		}
		function RingProgress({ done, running, blocked, queued }) {
		  const sum = done + running + blocked + queued;
		  if (sum > 0 && done === sum) {
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-ring-full", "aria-hidden": "true", children: "\u2713" });
		  }
		  const total = sum || 1;
		  const C = 43.98;
		  let off = 0;
		  const segs = [];
		  for (const [cls, val] of [["done", done], ["running", running], ["blocked", blocked]]) {
		    if (!val) continue;
		    const len = val / total * C;
		    segs.push({ cls, len, offset: -off });
		    off += len;
		  }
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { className: "ag-o2-ring", width: "18", height: "18", viewBox: "0 0 18 18", "aria-hidden": "true", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "9", cy: "9", r: "7", fill: "none", className: "trk", strokeWidth: "2.2" }),
		    segs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		      "circle",
		      {
		        cx: "9",
		        cy: "9",
		        r: "7",
		        fill: "none",
		        className: `seg ${s.cls}`,
		        strokeWidth: "2.2",
		        strokeDasharray: `${s.len.toFixed(2)} ${C.toFixed(2)}`,
		        strokeDashoffset: s.offset.toFixed(2)
		      },
		      s.cls
		    ))
		  ] });
		}
		function ReelLightbox({
		  frames,
		  swarmId,
		  initialIndex,
		  totalTasks,
		  onClose,
		  onIndexChange
		}) {
		  const [idx, setIdx] = (0, import_react4.useState)(initialIndex);
		  const [zoomed, setZoomed] = (0, import_react4.useState)(false);
		  const go = (next) => {
		    const clamped = Math.max(0, Math.min(frames.length - 1, next));
		    setIdx(clamped);
		    setZoomed(false);
		    onIndexChange(clamped);
		  };
		  (0, import_react4.useEffect)(() => {
		    const onKey = (e) => {
		      if (e.key === "Escape") {
		        e.preventDefault();
		        onClose();
		      } else if (e.key === "ArrowLeft") {
		        e.preventDefault();
		        go(idx - 1);
		      } else if (e.key === "ArrowRight") {
		        e.preventDefault();
		        go(idx + 1);
		      } else if (e.key === "Home") {
		        e.preventDefault();
		        go(0);
		      } else if (e.key === "End") {
		        e.preventDefault();
		        go(frames.length - 1);
		      }
		    };
		    window.addEventListener("keydown", onKey);
		    return () => window.removeEventListener("keydown", onKey);
		  });
		  const locale = useUiLocale();
		  const zh = locale === "zh-CN";
		  const frame = frames[idx];
		  if (!frame) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {});
		  const src = swarmClientStore.frameUrl(swarmId, frame.path);
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		    "div",
		    {
		      className: "ag-tv",
		      role: "dialog",
		      "aria-modal": "true",
		      "aria-label": t("overview.reel"),
		      onClick: (e) => {
		        if (e.target === e.currentTarget) onClose();
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-tvh", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t("overview.reel") }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-tvpos", children: idx === frames.length - 1 ? `${zh ? "\u5F53\u524D" : "Now"} \xB7 ${idx + 1} / ${frames.length}` : `${idx + 1} / ${frames.length}` }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-tvwhen", children: formatFrameTime(frame) }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ag-tvx", "aria-label": t("common.close"), onClick: onClose, children: "\u2715" })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-tvstage", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		            "div",
		            {
		              className: `ag-tvscroll ${zoomed ? "zoom" : ""}`,
		              onClick: (e) => {
		                if (e.target === e.currentTarget) onClose();
		              },
		              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                "img",
		                {
		                  className: "ag-tvimg",
		                  src,
		                  alt: frame.caption,
		                  onClick: () => setZoomed((z) => !z)
		                }
		              )
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ag-tvnav prev", "aria-label": zh ? "\u4E0A\u4E00\u5E27" : "Previous", disabled: idx <= 0, onClick: () => go(idx - 1), children: "\u2039" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "ag-tvnav next", "aria-label": zh ? "\u4E0B\u4E00\u5E27" : "Next", disabled: idx >= frames.length - 1, onClick: () => go(idx + 1), children: "\u203A" })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { margin: 0, fontSize: 13, fontWeight: 500 }, children: frame.caption || (zh ? `\u7B2C #${frame.seq} \u6761\u52A8\u6001\u622A\u56FE` : `Frame at #${frame.seq}`) }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: "2px 0 0", fontSize: 12, color: "rgba(241,243,244,0.66)" }, children: [
		            "@",
		            frame.agent,
		            " \xB7 #",
		            frame.seq,
		            totalTasks > 0 ? zh ? ` \xB7 \u5171\u8DDF\u8E2A ${totalTasks} \u9879\u4EFB\u52A1` : ` \xB7 ${totalTasks} tasks tracked` : ""
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ag-tvstrip", role: "listbox", "aria-label": "Frames", children: frames.map((f, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		          "button",
		          {
		            type: "button",
		            role: "option",
		            "aria-selected": k === idx,
		            className: `ag-tvth ${k === idx ? "on" : ""}`,
		            onClick: () => go(k),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: swarmClientStore.frameUrl(swarmId, f.path), alt: f.caption, loading: "lazy" }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: k + 1 })
		            ]
		          },
		          `${f.seq}-${k}`
		        )) })
		      ]
		    }
		  );
		}
		function OnboardingView({ snapshot }) {
		  const locale = useUiLocale();
		  const zh = locale === "zh-CN";
		  const realWorkers = Object.values(snapshot.members).filter((m) => m.role !== "coordinator" && !m.killed).map((m) => m.name).slice(0, 3);
		  const ws = [...realWorkers, "worker-a", "worker-b", "worker-c"].slice(0, 3);
		  const Y = [30, 78, 126];
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ag-onb", "data-testid": "swarm-onboarding", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-onb-stage", "aria-hidden": "true", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { className: "ag-onb-paths", viewBox: "0 0 320 156", width: "320", height: "156", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { className: "ag-onb-lines", children: Y.map((y, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { id: `ag-onb-p${i}`, d: `M84 78 C150 78 160 ${y} 226 ${y}` }, i)) }),
		        ws.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("circle", { r: "3", fill: getBeeColor("coordinator", "coordinator"), opacity: "0", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("animateMotion", { dur: "2.4s", begin: `${i * 0.8}s`, repeatCount: "indefinite", keyPoints: "0;1", keyTimes: "0;1", calcMode: "linear", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mpath", { href: `#ag-onb-p${i}` }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("animate", { attributeName: "opacity", values: "0;1;1;0", keyTimes: "0;0.15;0.85;1", dur: "2.4s", begin: `${i * 0.8}s`, repeatCount: "indefinite" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("circle", { r: "3", fill: getBeeColor(n), opacity: "0", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("animateMotion", { dur: "2.4s", begin: `${i * 0.8 + 1.2}s`, repeatCount: "indefinite", keyPoints: "1;0", keyTimes: "0;1", calcMode: "linear", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mpath", { href: `#ag-onb-p${i}` }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("animate", { attributeName: "opacity", values: "0;1;1;0", keyTimes: "0;0.15;0.85;1", dur: "2.4s", begin: `${i * 0.8 + 1.2}s`, repeatCount: "indefinite" })
		          ] })
		        ] }, n))
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-onb-bee", style: { left: 24, top: 56, background: getBeeTileBg("coordinator", "coordinator") }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PixelBee, { name: "coordinator", role: "coordinator", state: "working", size: 2 }) }),
		      ws.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		        "span",
		        {
		          className: `ag-onb-bee ag-onb-w s${i}`,
		          style: { left: 236, top: Y[i] - 22, background: getBeeTileBg(n) },
		          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PixelBee, { name: n, state: "working", size: 2 })
		        },
		        n
		      ))
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "ag-onb-h", children: t("overview.onboardingTitle") }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", { className: "ag-onb-steps", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-onb-i", style: { background: getBeeTileBg("coordinator", "coordinator") }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: getBeeDataUrl("coordinator", "coordinator", "landed"), alt: "", width: 22, height: 18 }) }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: zh ? "\u4E00\u4E2A\u76EE\u6807" : "One goal" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: zh ? "\u534F\u8C03\u8005\u5C06\u76EE\u6807\u62C6\u89E3\u4E3A\u591A\u4E2A\u72EC\u7ACB\u5E76\u884C\u8F68\u9053\u3002" : "The coordinator splits it into parallel tracks." })
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-onb-i", style: { background: getBeeTileBg(ws[0]) }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: getBeeDataUrl(ws[0], "worker", "landed"), alt: "", width: 22, height: 18 }) }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: zh ? "\u591A\u5B50\u4EE3\u7406\u5E76\u53D1" : "Many workers" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: zh ? "\u6BCF\u4F4D\u6210\u5458\u8BA4\u9886\u4E13\u5C5E\u8303\u56F4\u5E76\u771F\u6B63\u5E76\u884C\u6267\u884C\u3002" : "Each owns a slice and runs concurrently." })
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-onb-i", style: { background: getBeeTileBg(ws[1]) }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: getBeeDataUrl(ws[1], "worker", "landed"), alt: "", width: 22, height: 18 }) }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: zh ? "\u7EDF\u4E00\u5171\u4EAB\u9ED1\u677F" : "One board" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("overview.onboardingDesc") })
		        ] })
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ag-onb-wait", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-shimmer", style: { animationDelay: shimmerDelay() }, children: zh ? "\u6B63\u5728\u7B49\u5F85\u9996\u6761\u9ED1\u677F\u52A8\u6001\u2026" : "Waiting for the first update" }) })
		  ] });
		}
		function ProgressReelCard({
		  frames,
		  swarmId,
		  totalTasks,
		  doneTasks
		}) {
		  const [index, setIndex] = (0, import_react4.useState)(() => Math.max(0, frames.length - 1));
		  const [compare, setCompare] = (0, import_react4.useState)(false);
		  const [swipe, setSwipe] = (0, import_react4.useState)(50);
		  const [lightboxOpen, setLightboxOpen] = (0, import_react4.useState)(false);
		  (0, import_react4.useEffect)(() => {
		    setIndex((prev) => Math.min(Math.max(0, prev), Math.max(0, frames.length - 1)));
		  }, [frames.length]);
		  const locale = useUiLocale();
		  const zh = locale === "zh-CN";
		  if (frames.length === 0) return null;
		  const clampedIdx = Math.min(index, frames.length - 1);
		  const cur = frames[clampedIdx];
		  const latest = frames[frames.length - 1];
		  const curSrc = swarmClientStore.frameUrl(swarmId, cur.path);
		  const latestSrc = swarmClientStore.frameUrl(swarmId, latest.path);
		  const canCompare = frames.length >= 2;
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ag-o2-reel", "data-testid": "swarm-progress-reel", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-rh", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-glbl", children: t("overview.reel") }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-rwhen", children: formatFrameTime(cur) }),
		        canCompare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-btn sm",
		            "aria-pressed": compare,
		            onClick: () => setCompare((c) => !c),
		            children: compare ? t("overview.exitCompare") : t("overview.compare")
		          }
		        )
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-rstage", children: [
		        compare && canCompare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: latestSrc, alt: zh ? "\u6700\u65B0\u622A\u56FE" : "Latest frame" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "img",
		          {
		            src: curSrc,
		            alt: cur.caption || `#${cur.seq}`,
		            style: {
		              clipPath: compare && canCompare ? `inset(0 ${100 - swipe}% 0 0)` : "none",
		              cursor: compare ? "ew-resize" : "zoom-in"
		            },
		            onClick: () => {
		              if (!compare) setLightboxOpen(true);
		            }
		          }
		        ),
		        compare && canCompare && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "ag-o2-rline", style: { left: `${swipe}%` }, "aria-hidden": "true" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		            "input",
		            {
		              className: "ag-o2-rswipe",
		              type: "range",
		              min: 0,
		              max: 100,
		              value: swipe,
		              "aria-label": zh ? "\u62D6\u52A8\u5BF9\u6BD4\u5386\u53F2\u4E0E\u5F53\u524D" : "Compare then and now",
		              onChange: (e) => setSwipe(Number(e.target.value))
		            }
		          )
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-rtag", children: clampedIdx === frames.length - 1 ? zh ? "\u5F53\u524D" : "Now" : `${clampedIdx + 1} / ${frames.length}` }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-o2-rexp",
		            "aria-label": zh ? "\u5168\u5C4F\u67E5\u770B\u65F6\u95F4\u8F74" : "Open full timeline",
		            title: zh ? "\u5168\u5C4F\u67E5\u770B\u65F6\u95F4\u8F74" : "Open full timeline",
		            onClick: () => setLightboxOpen(true),
		            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })
		          }
		        )
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ag-o2-rcap", children: cur.caption || (zh ? `@${cur.agent} \u6C47\u62A5 (#${cur.seq})` : `Update by @${cur.agent} (#${cur.seq})`) }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "ag-o2-rmeta", children: [
		        "@",
		        cur.agent,
		        " \xB7 #",
		        cur.seq,
		        totalTasks > 0 ? ` \xB7 ${t("overview.tasksDone", { done: doneTasks, total: totalTasks })}` : ""
		      ] }),
		      frames.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-rtrack", children: [
		        frames.map((f, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "i",
		          {
		            style: { left: `${k / (frames.length - 1) * 100}%` },
		            "aria-hidden": "true"
		          },
		          `${f.seq}-${k}`
		        )),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "input",
		          {
		            className: "ag-o2-rscrub",
		            type: "range",
		            min: 0,
		            max: frames.length - 1,
		            step: 1,
		            value: clampedIdx,
		            "aria-label": "Scrub through progress",
		            onChange: (e) => setIndex(Number(e.target.value))
		          }
		        )
		      ] })
		    ] }),
		    lightboxOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		      ReelLightbox,
		      {
		        frames,
		        swarmId,
		        initialIndex: clampedIdx,
		        totalTasks,
		        onClose: () => setLightboxOpen(false),
		        onIndexChange: (next) => setIndex(next)
		      }
		    )
		  ] });
		}
		function threadStatusLabel(th, zh) {
		  if (th.state === "waiting") {
		    const waiters = /* @__PURE__ */ new Set();
		    for (const task of th.tasks) {
		      for (const w of task.waiting_on ?? []) waiters.add(w);
		    }
		    if (waiters.size === 1) return t("members.waitingOn", { target: [...waiters][0] });
		    if (waiters.size > 1) return zh ? `\u7B49\u5F85 ${waiters.size} \u4F4D\u6210\u5458` : `Waiting on ${waiters.size}`;
		    return t("members.state.waiting");
		  }
		  if (zh) {
		    const map = {
		      needs: "\u9700\u8981\u5173\u6CE8",
		      waiting: "\u7B49\u5F85\u4E2D",
		      stuck: "\u7591\u4F3C\u5361\u4F4F",
		      running: "\u63A8\u8FDB\u4E2D",
		      queued: "\u5F85\u542F\u52A8",
		      done: "\u5DF2\u5B8C\u6210"
		    };
		    return map[th.state];
		  }
		  return THREAD_LABEL[th.state];
		}
		function OverviewTab({ snapshot, onJumpToSeq, onSwitchTab }) {
		  const locale = useUiLocale();
		  const zh = locale === "zh-CN";
		  const [selectedWorker, setSelectedWorker] = (0, import_react4.useState)(null);
		  const [doneOpen, setDoneOpen] = (0, import_react4.useState)(false);
		  const [showAllRun, setShowAllRun] = (0, import_react4.useState)(false);
		  const [showAllDone, setShowAllDone] = (0, import_react4.useState)(false);
		  const [openThreads, setOpenThreads] = (0, import_react4.useState)({});
		  const membersList = (0, import_react4.useMemo)(() => Object.values(snapshot.members), [snapshot.members]);
		  const coordinator = (0, import_react4.useMemo)(
		    () => snapshot.members.coordinator ?? membersList.find((m) => m.role === "coordinator"),
		    [snapshot.members, membersList]
		  );
		  const crew = (0, import_react4.useMemo)(() => {
		    const rank = (m) => m.failure ? 0 : m.state === "working" ? 1 : m.waiting_on?.length ? 2 : 3;
		    return membersList.filter((m) => m.name !== (coordinator?.name ?? "coordinator") && !m.killed).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
		  }, [membersList, coordinator]);
		  const activeFilter = selectedWorker && snapshot.members[selectedWorker] && !snapshot.members[selectedWorker].killed ? selectedWorker : null;
		  const hasWorkerPosted = (0, import_react4.useMemo)(
		    () => snapshot.messages.some((m) => m.agent !== (coordinator?.name ?? "coordinator") && m.kind !== "control"),
		    [snapshot.messages, coordinator]
		  );
		  const isOnboarding = !hasWorkerPosted && snapshot.threads.length === 0 && !snapshot.plan && snapshot.messages.length <= 1;
		  const filteredThreads = (0, import_react4.useMemo)(() => {
		    const base = snapshot.threads.map((t2) => {
		      if (!activeFilter) return t2;
		      const tasks = t2.tasks.filter((task) => task.name === activeFilter);
		      if (tasks.length === 0) return null;
		      const done = tasks.filter((x) => x.done).length;
		      return { ...t2, tasks, progress: { done, total: tasks.length } };
		    }).filter((t2) => t2 !== null);
		    return base.sort((a, b) => THREAD_ORDER[a.state] - THREAD_ORDER[b.state]);
		  }, [snapshot.threads, activeFilter]);
		  const taskSummary = (0, import_react4.useMemo)(() => {
		    const running = [];
		    const done = [];
		    const queued = [];
		    const seen = /* @__PURE__ */ new Set();
		    let waitingCount = 0;
		    let errorsCount = 0;
		    for (const t2 of filteredThreads) {
		      for (const task of t2.tasks) {
		        const key = `${t2.id}:${task.name}:${task.label}`;
		        if (seen.has(key)) continue;
		        seen.add(key);
		        if (task.done) {
		          done.push({ id: key, label: task.label, owner: task.name });
		        } else if (task.state === "working" || task.waiting_on && task.waiting_on.length > 0 || task.failure) {
		          const m = snapshot.members[task.name];
		          const hasFailure = Boolean(task.failure);
		          const isWaitingOn = !hasFailure && Boolean(task.waiting_on?.length);
		          if (hasFailure) errorsCount++;
		          else if (isWaitingOn) waitingCount++;
		          running.push({
		            id: key,
		            label: task.label,
		            owner: task.name,
		            blocked: hasFailure || isWaitingOn,
		            waitingOn: task.waiting_on,
		            activity: task.activity ?? m?.activity,
		            failure: task.failure ?? (hasFailure ? m?.failure?.message : void 0)
		          });
		        } else {
		          queued.push({ id: key, label: task.label, owner: task.name });
		        }
		      }
		    }
		    if (seen.size === 0) {
		      for (const m of crew) {
		        if (activeFilter && m.name !== activeFilter) continue;
		        if (m.state === "working" || m.waiting_on?.length || m.failure) {
		          const hasFailure = Boolean(m.failure);
		          const isWaitingOn = !hasFailure && Boolean(m.waiting_on?.length);
		          if (hasFailure) errorsCount++;
		          else if (isWaitingOn) waitingCount++;
		          running.push({
		            id: m.name,
		            label: m.task_hint || `@${m.name}`,
		            owner: m.name,
		            blocked: hasFailure || isWaitingOn,
		            waitingOn: m.waiting_on,
		            activity: m.activity,
		            failure: m.failure?.message
		          });
		        }
		      }
		    }
		    running.sort((a, b) => (a.blocked ? 0 : 1) - (b.blocked ? 0 : 1));
		    const tot = {
		      done: done.length,
		      running: running.filter((r) => !r.blocked).length,
		      waiting: waitingCount,
		      errors: errorsCount,
		      blocked: waitingCount + errorsCount,
		      queued: queued.length
		    };
		    return { running, done, queued, tot };
		  }, [filteredThreads, snapshot.members, crew, activeFilter]);
		  const teamSection = (0, import_react4.useMemo)(() => {
		    const MAXT = 5;
		    let shown = crew.length > MAXT + 1 ? crew.slice(0, MAXT) : crew;
		    if (activeFilter && !shown.some((m) => m.name === activeFilter)) {
		      const sel = crew.find((m) => m.name === activeFilter);
		      if (sel) shown = [...shown.slice(0, MAXT - 1), sel];
		    }
		    const extra = crew.length - shown.length;
		    const trio = crew.slice(0, 3);
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ag-o2-team", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "ag-o2-h", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("overview.team") }),
		        activeFilter && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "ag-ghost-btn", onClick: () => setSelectedWorker(null), children: [
		          t("overview.filterBy", { name: activeFilter }),
		          " \xB7 ",
		          t("overview.clearFilter")
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-lead", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-tile lg", style: { background: getBeeTileBg("coordinator", "coordinator") }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          PixelBee,
		          {
		            name: "coordinator",
		            role: "coordinator",
		            state: coordinator?.state ?? "waiting",
		            size: 3
		          }
		        ) }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-lb", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t("members.coordinator") }),
		          coordinator?.activity && coordinator.state === "working" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ag-shimmer", style: { animationDelay: shimmerDelay() }, children: coordinator.activity }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: coordinator?.task_hint || snapshot.plan?.goal.line || (zh ? `${crew.length} \u4F4D\u6D3B\u8DC3\u6210\u5458` : `${crew.length} active team member${crew.length === 1 ? "" : "s"}`) })
		        ] })
		      ] }),
		      crew.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-crew", role: "group", "aria-label": zh ? "\u6309\u6210\u5458\u7B5B\u9009" : "Filter by worker", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		          "button",
		          {
		            type: "button",
		            className: `ag-o2-m ${!activeFilter ? "on" : ""}`,
		            "aria-pressed": !activeFilter,
		            title: t("overview.clearFilter"),
		            onClick: () => setSelectedWorker(null),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-tile sm all", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-swarm", "aria-hidden": "true", children: trio.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `ag-o2-sb s${i}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PixelBee, { name: m.name, role: m.role, state: m.state === "working" ? "working" : "landed", size: 1 }) }, m.name)) }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("common.all") })
		            ]
		          }
		        ),
		        shown.map((m) => {
		          const dotCls = m.failure ? "error" : m.state === "working" ? "working" : m.waiting_on?.length ? "waiting" : "";
		          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		            "button",
		            {
		              type: "button",
		              className: `ag-o2-m ${activeFilter === m.name ? "on" : ""}`,
		              "aria-pressed": activeFilter === m.name,
		              title: `@${m.name}${m.task_hint ? `: ${m.task_hint}` : ""}`,
		              onClick: () => setSelectedWorker((prev) => prev === m.name ? null : m.name),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-tile sm", style: { background: getBeeTileBg(m.name, m.role) }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PixelBee, { name: m.name, role: m.role, state: m.state, size: 2 }) }),
		                dotCls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `ag-o2-st ${dotCls}`, "aria-hidden": "true" }),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
		                  "@",
		                  m.name
		                ] })
		              ]
		            },
		            m.name
		          );
		        }),
		        extra > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		          "button",
		          {
		            type: "button",
		            className: "ag-o2-m",
		            title: zh ? `\u67E5\u770B\u5168\u90E8 ${crew.length} \u4F4D\u6210\u5458` : `View all ${crew.length} members`,
		            onClick: () => onSwitchTab("members"),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-tile sm plus", children: [
		                "+",
		                extra
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: zh ? "\u66F4\u591A" : "More" })
		            ]
		          }
		        )
		      ] })
		    ] });
		  }, [crew, activeFilter, coordinator, snapshot.plan, onSwitchTab, zh]);
		  if (isOnboarding) {
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingView, { snapshot }),
		      teamSection
		    ] });
		  }
		  const goalTitle = snapshot.plan?.goal.title || snapshot.title || "Swarm Goal";
		  const goalLine = snapshot.plan?.goal.line || "";
		  const visibleRunning = showAllRun ? taskSummary.running : taskSummary.running.slice(0, 8);
		  const visibleDone = showAllDone ? taskSummary.done : taskSummary.done.slice(0, 8);
		  const totalTasks = taskSummary.tot.done + taskSummary.tot.running + taskSummary.tot.blocked + taskSummary.tot.queued;
		  const openThreadsCount = filteredThreads.filter((t2) => t2.state !== "done").length;
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2", children: [
		    snapshot.systemAttention.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ag-ov-system", "data-testid": "swarm-attention-list", children: snapshot.systemAttention.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		      "div",
		      {
		        className: `ag-ov-sys ${item.kind === "error" || item.kind === "quota" ? "error" : ""}`,
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-ov-sys-dot", "aria-hidden": "true" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-ov-sys-body", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ag-ov-sys-title", children: item.title }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ag-ov-sys-detail", children: item.detail })
		          ] }),
		          item.seq ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "ag-o2-sttag", onClick: () => onJumpToSeq(item.seq), children: [
		            "#",
		            item.seq
		          ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "ag-ghost-btn", onClick: () => onSwitchTab("members"), children: [
		            "@",
		            item.member
		          ] })
		        ]
		      },
		      item.id
		    )) }),
		    snapshot.stallBanner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: "ag-o2-stall", "data-testid": "swarm-stall-banner", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-sttop", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-stdot", "aria-hidden": "true" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t("overview.stallTitle") }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		          "button",
		          {
		            type: "button",
		            className: "ag-o2-sttag",
		            title: zh ? `\u8DF3\u8F6C\u5230\u9ED1\u677F #${snapshot.stallBanner.seq}` : `Go to #${snapshot.stallBanner.seq} on the Board`,
		            onClick: () => onJumpToSeq(snapshot.stallBanner.seq),
		            children: [
		              "@",
		              snapshot.stallBanner.agent,
		              " #",
		              snapshot.stallBanner.seq
		            ]
		          }
		        )
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ag-o2-sttxt", children: snapshot.stallBanner.text })
		    ] }) }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ag-o2-card", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ag-o2-glbl", children: t("overview.goal") }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { className: "ag-o2-goal-title", children: goalTitle }),
		      goalLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ag-o2-goal-line", children: goalLine })
		    ] }),
		    taskSummary.running.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ag-o2-card", "data-testid": "swarm-running-card", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-runh", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-rundot", "aria-hidden": "true" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t("overview.running") }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: taskSummary.running.length })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "ag-o2-runlist", children: visibleRunning.map((item) => {
		        const owner = snapshot.members[item.owner];
		        const stCls = item.blocked ? "blocked" : "running";
		        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "ag-o2-runrow", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `ag-o2-ti ${stCls}`, "aria-label": stCls }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-runmain", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-runtop", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { className: "ag-o2-runt", children: item.label }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-wchips", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-wchip", title: `@${item.owner}`, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                  PixelBee,
		                  {
		                    name: item.owner,
		                    role: owner?.role,
		                    state: owner?.state === "working" ? "working" : "landed",
		                    size: 1
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.owner })
		              ] }) })
		            ] }),
		            item.activity && !item.blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ag-o2-runnote", "data-testid": "swarm-running-activity", title: item.activity, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-shimmer", style: { animationDelay: shimmerDelay() }, children: item.activity }) }) : item.failure ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ag-o2-runnote", style: { color: "var(--ag-error)" }, children: item.failure }) : item.waitingOn && item.waitingOn.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ag-o2-runnote", style: { color: "var(--ag-warning)" }, children: t("members.waitingOn", { target: item.waitingOn.join(", @") }) }) : null
		          ] })
		        ] }, item.id);
		      }) }),
		      taskSummary.running.length > visibleRunning.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "ag-o2-more", onClick: () => setShowAllRun((v) => !v), children: [
		        t("common.showMore"),
		        " (+",
		        taskSummary.running.length - visibleRunning.length,
		        ")"
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `ag-o2-prog ${doneOpen ? "open" : ""}`, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		        "button",
		        {
		          type: "button",
		          className: "ag-o2-progh",
		          "aria-expanded": doneOpen,
		          onClick: () => setDoneOpen((v) => !v),
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		              RingProgress,
		              {
		                done: taskSummary.tot.done,
		                running: taskSummary.tot.running,
		                blocked: taskSummary.tot.blocked,
		                queued: taskSummary.tot.queued
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-progt", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t("overview.tasksDone", { done: taskSummary.tot.done, total: totalTasks || snapshot.stats.totalTasks }) }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-progr", children: [
		              taskSummary.tot.running > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-pchip info", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true" }),
		                t("header.working", { count: taskSummary.tot.running })
		              ] }),
		              taskSummary.tot.waiting > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-pchip warn", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true" }),
		                t("overview.waitingCount", { count: taskSummary.tot.waiting })
		              ] }),
		              taskSummary.tot.errors > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-pchip bad", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true" }),
		                zh ? `${taskSummary.tot.errors} \u5F02\u5E38` : `${taskSummary.tot.errors} error`
		              ] }),
		              snapshot.stats.stuckCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-pchip bad", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true" }),
		                t("overview.stuckCount", { count: snapshot.stats.stuckCount })
		              ] }),
		              openThreadsCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-pchip", children: t("overview.threadsOpen", { count: openThreadsCount }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-chev", "aria-hidden": "true" })
		            ] })
		          ]
		        }
		      ),
		      doneOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-progb", children: [
		        visibleDone.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-qhdr", children: [
		            t("overview.doneList"),
		            " \xB7 ",
		            taskSummary.done.length
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "ag-o2-donelist", children: visibleDone.map((item) => {
		            const m = snapshot.members[item.owner];
		            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-ti done", "aria-label": t("overview.doneList"), children: "\u2713" }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ag-o2-donem", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.label }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-wchip", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PixelBee, { name: item.owner, role: m?.role, state: "landed", size: 1 }),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.owner })
		              ] })
		            ] }, item.id);
		          }) }),
		          taskSummary.done.length > visibleDone.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "ag-o2-more", onClick: () => setShowAllDone((v) => !v), children: [
		            t("common.showMore"),
		            " (+",
		            taskSummary.done.length - visibleDone.length,
		            ")"
		          ] })
		        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { margin: "6px 0 2px", fontSize: 12.5, color: "var(--ag-fg-muted)" }, children: zh ? "\u6682\u65E0\u5DF2\u5B8C\u6210\u7684\u4EFB\u52A1\u3002" : "No tasks completed yet." }),
		        taskSummary.queued.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ag-o2-qhdr", children: [
		            t("overview.upNext"),
		            " \xB7 ",
		            taskSummary.queued.length
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "ag-o2-donelist", children: taskSummary.queued.slice(0, 6).map((item) => {
		            const m = snapshot.members[item.owner];
		            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-ti queued", "aria-label": t("overview.upNext") }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ag-o2-donem", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.label }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-wchip", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PixelBee, { name: item.owner, role: m?.role, state: "landed", size: 1 }),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.owner })
		              ] })
		            ] }, item.id);
		          }) })
		        ] })
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		      ProgressReelCard,
		      {
		        frames: snapshot.frames,
		        swarmId: snapshot.swarm_id,
		        totalTasks: totalTasks || snapshot.stats.totalTasks,
		        doneTasks: taskSummary.tot.done || snapshot.stats.doneTasks
		      }
		    ),
		    filteredThreads.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "ag-o2-threads", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "ag-o2-h", children: [
		        t("overview.threads"),
		        " ",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: filteredThreads.length })
		      ] }),
		      filteredThreads.map((th) => {
		        const defaultOpen = th.state === "needs" || th.state === "waiting" || th.state === "stuck";
		        const isOpen = th.tasks.length > 0 && (openThreads[th.id] ?? defaultOpen);
		        const doneN = th.tasks.filter((x) => x.done).length;
		        const runN = th.tasks.filter((x) => !x.done && x.state === "working" && !x.waiting_on?.length && !x.failure).length;
		        const blkN = th.tasks.filter((x) => !x.done && (Boolean(x.waiting_on?.length) || Boolean(x.failure))).length;
		        const queN = Math.max(0, th.tasks.length - doneN - runN - blkN);
		        const statusLbl = threadStatusLabel(th, zh);
		        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `ag-o2-th ${th.state} ${isOpen ? "open" : ""}`, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		            "button",
		            {
		              type: "button",
		              className: "ag-o2-thh",
		              "aria-expanded": isOpen,
		              disabled: th.tasks.length === 0,
		              onClick: () => setOpenThreads((prev) => ({ ...prev, [th.id]: !isOpen })),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `ag-o2-thd ${th.state}`, "aria-hidden": "true" }),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-tht", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: th.title }),
		                  statusLbl !== th.title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: statusLbl })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-thc", children: th.tasks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-mbar", "aria-hidden": "true", children: [
		                    doneN > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "done", style: { flex: doneN } }),
		                    runN > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "running", style: { flex: runN } }),
		                    blkN > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "blocked", style: { flex: blkN } }),
		                    queN > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "queued", style: { flex: queN } })
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
		                    doneN,
		                    "/",
		                    th.tasks.length
		                  ] })
		                ] }) }),
		                th.tasks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-chev", "aria-hidden": "true" })
		              ]
		            }
		          ),
		          th.goal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "ag-o2-thg", children: th.goal }),
		          th.now && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "ag-o2-thn", children: [
		            th.state !== "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: zh ? "\u5F53\u524D" : "Now" }),
		            th.now
		          ] }),
		          isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "ag-o2-tasks", children: th.tasks.map((task, idx) => {
		            const st = task.done ? "done" : task.failure || task.waiting_on?.length ? "blocked" : task.state === "working" ? "running" : "queued";
		            const m = snapshot.members[task.name];
		            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: st, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `ag-o2-ti ${st}`, "aria-label": st, children: st === "done" ? "\u2713" : "" }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-tt", children: [
		                task.label,
		                task.waiting_on && task.waiting_on.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ag-o2-tw", children: t("members.waitingOn", { target: task.waiting_on.join(", @") }) })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ag-o2-wchip", children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PixelBee, { name: task.name, role: m?.role, state: m?.state === "working" ? "working" : "landed", size: 1 }),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: task.name })
		              ] })
		            ] }, `${task.name}-${idx}`);
		          }) })
		        ] }, th.id);
		      })
		    ] }),
		    teamSection
		  ] });
		}
		
		// client/components/BoardTab.tsx
		var import_react5 = require("react");
		var import_jsx_runtime2 = require("react/jsx-runtime");
		var clockFmt = new Intl.DateTimeFormat(void 0, { hour: "numeric", minute: "2-digit" });
		var dayClockFmt = new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
		var fullFmt = new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "medium" });
		function msgMs(m) {
		  if (Number.isFinite(m.ts) && m.ts > 0) return m.ts;
		  const parsed = Date.parse(String(m.time || "").replace(" ", "T"));
		  return Number.isFinite(parsed) ? parsed : 0;
		}
		function fmtClock(ms) {
		  if (!ms) return "";
		  const d = new Date(ms);
		  const now = /* @__PURE__ */ new Date();
		  const same = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
		  return (same ? clockFmt : dayClockFmt).format(d);
		}
		function chanOf(m) {
		  return m.channel && m.channel.length > 0 ? m.channel : "main";
		}
		function isControl(m) {
		  return m.kind === "control" || Boolean(m.control);
		}
		function stripLeadingMentions(text) {
		  const rest = text.replace(/^(\s*@[A-Za-z0-9_#.-]+[,:]?)+\s*/, "");
		  return rest.length > 0 ? rest : text;
		}
		function collapseRecipientGroups(names, roster) {
		  if (names.length === 0) return names;
		  const set = new Set(names);
		  const groups = /* @__PURE__ */ new Map();
		  for (const mem of roster) {
		    const match = mem.name.match(/^(.+)-\d+$/);
		    if (!match) continue;
		    const prefix = match[1];
		    const list = groups.get(prefix) ?? [];
		    list.push(mem.name);
		    groups.set(prefix, list);
		  }
		  const collapsed = /* @__PURE__ */ new Set();
		  const out = [];
		  for (const n of names) {
		    const match = n.match(/^(.+)-\d+$/);
		    const prefix = match?.[1];
		    const group = prefix ? groups.get(prefix) : void 0;
		    if (group && group.length >= 2 && group.every((g) => set.has(g))) {
		      if (!collapsed.has(prefix)) {
		        collapsed.add(prefix);
		        out.push(prefix);
		      }
		    } else {
		      out.push(n);
		    }
		  }
		  return out;
		}
		var TOKEN_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|@#[a-z][a-z0-9-]{0,23}|@[A-Za-z0-9_-]+|#[1-9]\d{0,8})/g;
		function InlineMarkdown({
		  text,
		  members,
		  channelNames,
		  msgBySeq,
		  onJumpToSeq
		}) {
		  const parts = [];
		  let lastIndex = 0;
		  let key = 0;
		  for (const match of text.matchAll(TOKEN_RE)) {
		    const idx = match.index ?? 0;
		    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
		    const tok = match[0];
		    if (tok.startsWith("`") && tok.endsWith("`") && tok.length > 2) {
		      parts.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { children: tok.slice(1, -1) }, key++));
		    } else if (tok.startsWith("**") && tok.endsWith("**") && tok.length > 4) {
		      parts.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: tok.slice(2, -2) }, key++));
		    } else if (tok.startsWith("*") && tok.endsWith("*") && tok.length > 2) {
		      parts.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("em", { children: tok.slice(1, -1) }, key++));
		    } else if (tok.startsWith("@#")) {
		      const ch = tok.slice(2).toLowerCase();
		      if (channelNames.has(ch)) {
		        parts.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-mention channel", children: tok }, key++));
		      } else {
		        parts.push(tok);
		      }
		    } else if (tok.startsWith("@")) {
		      const name2 = tok.slice(1);
		      const lower = name2.toLowerCase();
		      if (lower === "all" || members[name2] || Object.keys(members).some((k) => k.toLowerCase() === lower)) {
		        parts.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: `ag-mention ${lower === "all" ? "all" : ""}`, children: tok }, key++));
		      } else {
		        parts.push(tok);
		      }
		    } else if (tok.startsWith("#")) {
		      const seq = Number(tok.slice(1));
		      const prevChar = idx > 0 ? text[idx - 1] : "";
		      if (Number.isInteger(seq) && seq > 0 && !/[A-Za-z0-9_&#/-]/.test(prevChar)) {
		        const target = msgBySeq.get(seq);
		        parts.push(
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		            "button",
		            {
		              type: "button",
		              className: "ag-seq-ref",
		              "data-testid": "swarm-seq-ref",
		              title: target ? `Go to #${seq} (@${target.agent})` : `Go to #${seq}`,
		              onClick: (e) => {
		                e.stopPropagation();
		                onJumpToSeq(seq);
		              },
		              children: [
		                "#",
		                seq
		              ]
		            },
		            key++
		          )
		        );
		      } else {
		        parts.push(tok);
		      }
		    } else {
		      parts.push(tok);
		    }
		    lastIndex = idx + tok.length;
		  }
		  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react5.Fragment, { children: parts });
		}
		function MarkdownBody(props) {
		  const lines = String(props.text || "").split("\n");
		  const blocks = [];
		  let inCode = false;
		  let codeLines = [];
		  let listItems = [];
		  let k = 0;
		  const flushList = () => {
		    if (listItems.length === 0) return;
		    const items = listItems;
		    listItems = [];
		    blocks.push(
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ul", { children: items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(InlineMarkdown, { ...props, text: item }) }, i)) }, k++)
		    );
		  };
		  for (const line of lines) {
		    if (line.trim().startsWith("```")) {
		      if (inCode) {
		        blocks.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { children: codeLines.join("\n") }) }, k++));
		        codeLines = [];
		        inCode = false;
		      } else {
		        flushList();
		        inCode = true;
		      }
		      continue;
		    }
		    if (inCode) {
		      codeLines.push(line);
		      continue;
		    }
		    const h = line.match(/^(#{1,4})\s+(.*)$/);
		    if (h) {
		      flushList();
		      blocks.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(InlineMarkdown, { ...props, text: h[2] }) }) }, k++));
		      continue;
		    }
		    const li = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
		    if (li) {
		      listItems.push(li[1]);
		      continue;
		    }
		    flushList();
		    if (line.trim().length > 0) {
		      blocks.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(InlineMarkdown, { ...props, text: line }) }, k++));
		    }
		  }
		  if (inCode && codeLines.length > 0) {
		    blocks.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { children: codeLines.join("\n") }) }, k++));
		  }
		  flushList();
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ag-md", children: blocks });
		}
		function FeedMessageRow({
		  msg,
		  roster,
		  members,
		  channelNames,
		  msgBySeq,
		  highlighted,
		  onSelectChannel,
		  onJumpToSeq
		}) {
		  const bodyRef = (0, import_react5.useRef)(null);
		  const [overflows, setOverflows] = (0, import_react5.useState)(false);
		  const [expanded, setExpanded] = (0, import_react5.useState)(false);
		  const ts = msgMs(msg);
		  const ch = chanOf(msg);
		  const control = isControl(msg);
		  const directNames = control ? [] : collapseRecipientGroups((msg.mentions || []).filter((n) => n !== msg.agent), roster);
		  const hasRecipients = !control && (directNames.length > 0 || (msg.channel_mentions?.length ?? 0) > 0 || msg.is_all);
		  const displayBody = control ? "" : hasRecipients ? stripLeadingMentions(msg.text) : msg.text;
		  (0, import_react5.useEffect)(() => {
		    if (control) return;
		    const el = bodyRef.current;
		    if (!el) return;
		    const lineH = parseFloat(getComputedStyle(el).lineHeight) || 21.7;
		    const limit = lineH * 5 + 4;
		    setOverflows(el.scrollHeight > limit);
		  }, [control, displayBody]);
		  if (control) {
		    const cleanText = String(msg.text || "").replace(/^\[channel\]\s*/, "");
		    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		      "div",
		      {
		        className: `ag-msg-system ${highlighted ? "ag-msg-target" : ""}`,
		        "data-seq": msg.seq,
		        "data-testid": "swarm-control-message",
		        role: "note",
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-sys-text", title: `#${msg.seq} \xB7 @${msg.agent} \xB7 ${ts ? fullFmt.format(new Date(ts)) : msg.time}`, children: cleanText }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("time", { className: "ag-ts", children: [
		            "#",
		            msg.seq,
		            " \xB7 ",
		            fmtClock(ts) || msg.time
		          ] })
		        ]
		      }
		    );
		  }
		  const member = members[msg.agent];
		  const avatarSrc = getBeeDataUrl(msg.agent, member?.role, "landed");
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		    "article",
		    {
		      className: `ag-msg ${highlighted ? "ag-msg-target" : ""}`,
		      "data-seq": msg.seq,
		      "data-testid": "swarm-message",
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "span",
		          {
		            className: "ag-msg-av",
		            style: { background: getBeeTileBg(msg.agent, member?.role) },
		            "aria-hidden": "true",
		            children: avatarSrc ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { src: avatarSrc, alt: "", width: 22, height: 18 }) : msg.agent.slice(0, 1).toUpperCase()
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("header", { className: "ag-msg-head", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "ag-msg-who", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "ag-msg-author", children: [
		              "@",
		              msg.agent
		            ] }),
		            ch !== "main" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		              "button",
		              {
		                type: "button",
		                className: "ag-msg-channel",
		                "data-testid": "swarm-message-channel",
		                title: `Filter to #${ch}`,
		                onClick: () => onSelectChannel(ch),
		                children: [
		                  "#",
		                  ch
		                ]
		              }
		            ),
		            hasRecipients && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "ag-msg-to", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { "aria-hidden": "true", children: "\u2192" }),
		              directNames.map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
		                "@",
		                n
		              ] }, `u-${n}`)),
		              (msg.channel_mentions || []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
		                "@#",
		                c
		              ] }, `c-${c}`)),
		              msg.is_all && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "@all" })
		            ] })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("time", { className: "ag-ts", title: `#${msg.seq} \xB7 ${ts ? fullFmt.format(new Date(ts)) : msg.time}`, children: [
		            "#",
		            msg.seq,
		            " \xB7 ",
		            fmtClock(ts) || msg.time
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "div",
		          {
		            ref: bodyRef,
		            className: `ag-msg-body ${overflows ? "clamped" : ""} ${expanded ? "open" : ""}`,
		            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		              MarkdownBody,
		              {
		                text: displayBody,
		                members,
		                channelNames,
		                msgBySeq,
		                onJumpToSeq
		              }
		            )
		          }
		        ),
		        overflows && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-msg-more",
		            "data-testid": "swarm-message-more",
		            "aria-expanded": expanded,
		            onClick: () => setExpanded((v) => !v),
		            children: expanded ? t("common.showLess") : t("common.showMore")
		          }
		        )
		      ]
		    }
		  );
		}
		function BoardTab({
		  snapshot,
		  jumpTarget,
		  onJumpToSeq,
		  onAction,
		  onLoadEarlier,
		  loadingEarlier,
		  onOpenMembers,
		  onSelectSubagent
		}) {
		  const locale = useUiLocale();
		  const zh = locale === "zh-CN";
		  const [search, setSearch] = (0, import_react5.useState)("");
		  const [filtersOpen, setFiltersOpen] = (0, import_react5.useState)(false);
		  const [fromAgent, setFromAgent] = (0, import_react5.useState)("");
		  const [toAgent, setToAgent] = (0, import_react5.useState)("");
		  const [channel, setChannel] = (0, import_react5.useState)("");
		  const [hiddenAgents, setHiddenAgents] = (0, import_react5.useState)(() => /* @__PURE__ */ new Set());
		  const [follow, setFollow] = (0, import_react5.useState)(true);
		  const [showLatestBtn, setShowLatestBtn] = (0, import_react5.useState)(false);
		  const [highlightedSeq, setHighlightedSeq] = (0, import_react5.useState)(null);
		  const [composerOpen, setComposerOpen] = (0, import_react5.useState)(false);
		  const [draftChannel, setDraftChannel] = (0, import_react5.useState)("main");
		  const [draftText, setDraftText] = (0, import_react5.useState)("");
		  const [sending, setSending] = (0, import_react5.useState)(false);
		  const feedRef = (0, import_react5.useRef)(null);
		  const bottomRef = (0, import_react5.useRef)(null);
		  const roster = (0, import_react5.useMemo)(() => Object.values(snapshot.members), [snapshot.members]);
		  const msgBySeq = (0, import_react5.useMemo)(() => {
		    const m = /* @__PURE__ */ new Map();
		    for (const msg of snapshot.messages) m.set(msg.seq, msg);
		    return m;
		  }, [snapshot.messages]);
		  const channelsList = (0, import_react5.useMemo)(() => {
		    const map = new Map(Object.entries(snapshot.channels));
		    for (const msg of snapshot.messages) {
		      const ch = chanOf(msg);
		      if (ch !== "main" && !map.has(ch)) {
		        map.set(ch, { name: ch, creator: msg.agent, created_at: msg.time, subscribers: [] });
		      }
		    }
		    return [...map.values()].filter((c) => c.name !== "main");
		  }, [snapshot.channels, snapshot.messages]);
		  const channelNames = (0, import_react5.useMemo)(() => /* @__PURE__ */ new Set(["main", ...channelsList.map((c) => c.name)]), [channelsList]);
		  const hasChannels = channelsList.length > 0;
		  const channelCounts = (0, import_react5.useMemo)(() => {
		    const counts = /* @__PURE__ */ new Map();
		    for (const m of snapshot.messages) {
		      if (isControl(m)) continue;
		      const ch = chanOf(m);
		      counts.set(ch, (counts.get(ch) ?? 0) + 1);
		    }
		    return counts;
		  }, [snapshot.messages]);
		  const postCountsByAgent = (0, import_react5.useMemo)(() => {
		    const counts = /* @__PURE__ */ new Map();
		    for (const m of snapshot.messages) {
		      if (isControl(m)) continue;
		      counts.set(m.agent, (counts.get(m.agent) ?? 0) + 1);
		    }
		    return counts;
		  }, [snapshot.messages]);
		  const posters = (0, import_react5.useMemo)(() => {
		    const set = new Set(roster.map((m) => m.name));
		    for (const m of snapshot.messages) set.add(m.agent);
		    return [...set];
		  }, [roster, snapshot.messages]);
		  const visibleMessages = (0, import_react5.useMemo)(() => {
		    const q = search.trim().toLowerCase();
		    return snapshot.messages.filter((m) => {
		      if (channel && chanOf(m) !== channel) return false;
		      if (hiddenAgents.has(m.agent)) return false;
		      if (fromAgent && m.agent !== fromAgent) return false;
		      if (toAgent === "@none" && ((m.mentions?.length ?? 0) > 0 || m.is_all || (m.channel_mentions?.length ?? 0) > 0)) return false;
		      if (toAgent === "@all" && !m.is_all) return false;
		      if (toAgent && !toAgent.startsWith("@") && !(m.is_all || (m.mentions || []).includes(toAgent))) return false;
		      if (q && !`${m.agent}
		${m.text}`.toLowerCase().includes(q)) return false;
		      return true;
		    });
		  }, [snapshot.messages, channel, hiddenAgents, fromAgent, toAgent, search]);
		  const scrollToBottom = (0, import_react5.useCallback)((behavior = "auto") => {
		    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
		    setShowLatestBtn(false);
		  }, []);
		  (0, import_react5.useEffect)(() => {
		    if (follow && !jumpTarget) {
		      scrollToBottom("auto");
		    }
		  }, [visibleMessages.length, follow, jumpTarget, scrollToBottom]);
		  (0, import_react5.useEffect)(() => {
		    const scrollHost = feedRef.current?.closest(".ag-scroll");
		    if (!scrollHost) return;
		    const onScroll = () => {
		      const dist = scrollHost.scrollHeight - scrollHost.scrollTop - scrollHost.clientHeight;
		      const nearBottom = dist < 80;
		      setShowLatestBtn(!nearBottom);
		      if (!nearBottom && follow) setFollow(false);
		      if (nearBottom && !follow) setFollow(true);
		    };
		    scrollHost.addEventListener("scroll", onScroll, { passive: true });
		    return () => scrollHost.removeEventListener("scroll", onScroll);
		  }, [follow]);
		  (0, import_react5.useEffect)(() => {
		    if (!jumpTarget) return;
		    const targetSeq = jumpTarget.seq;
		    const exists = snapshot.messages.some((m) => m.seq === targetSeq);
		    if (!exists && snapshot.messagesOffset > 0 && !loadingEarlier) {
		      void onLoadEarlier();
		      return;
		    }
		    if (!visibleMessages.some((m) => m.seq === targetSeq)) {
		      setSearch("");
		      setFromAgent("");
		      setToAgent("");
		      setChannel("");
		      setHiddenAgents(/* @__PURE__ */ new Set());
		    }
		    setFollow(false);
		    setHighlightedSeq(targetSeq);
		    const raf = requestAnimationFrame(() => {
		      const el = feedRef.current?.querySelector(`[data-seq="${targetSeq}"]`);
		      el?.scrollIntoView({ behavior: "smooth", block: "center" });
		    });
		    const timer = setTimeout(() => {
		      setHighlightedSeq((prev) => prev === targetSeq ? null : prev);
		    }, 2e3);
		    return () => {
		      cancelAnimationFrame(raf);
		      clearTimeout(timer);
		    };
		  }, [jumpTarget, snapshot.messages, snapshot.messagesOffset, loadingEarlier, onLoadEarlier]);
		  const activeFilters = Boolean(fromAgent || toAgent || hiddenAgents.size > 0);
		  const anyFilter = activeFilters || Boolean(search.trim() || channel);
		  const toggleHiddenAgent = (name2) => {
		    setHiddenAgents((prev) => {
		      const next = new Set(prev);
		      if (next.has(name2)) next.delete(name2);
		      else next.add(name2);
		      return next;
		    });
		  };
		  const handleSend = async () => {
		    const text = draftText.trim();
		    if (!text || sending) return;
		    setSending(true);
		    try {
		      await onAction({
		        action: "post_message",
		        swarmId: snapshot.swarm_id,
		        text,
		        channel: draftChannel || "main"
		      });
		      setDraftText("");
		      setFollow(true);
		    } finally {
		      setSending(false);
		    }
		  };
		  const insertToken = (tok) => {
		    setDraftText((prev) => prev.length === 0 || prev.endsWith(" ") ? `${prev}${tok} ` : `${prev} ${tok} `);
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ref: feedRef, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-toolbar", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-searchbar", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "ag-search", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { className: "ag-icon", width: "14", height: "14", viewBox: "0 0 16 16", "aria-hidden": "true", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "7", cy: "7", r: "4.25" }),
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "m10.25 10.25 3.25 3.25" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		            "input",
		            {
		              type: "search",
		              placeholder: t("board.search"),
		              "aria-label": t("board.search"),
		              value: search,
		              onChange: (e) => setSearch(e.target.value)
		            }
		          )
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		          "button",
		          {
		            type: "button",
		            className: `ag-icon-btn ag-filter-toggle ${filtersOpen ? "open" : ""}`,
		            "aria-expanded": filtersOpen,
		            title: activeFilters ? `${t("board.filter")} (${zh ? "\u5DF2\u542F\u7528" : "active"})` : t("board.filter"),
		            onClick: () => setFiltersOpen((v) => !v),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { className: "ag-icon", viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M2.5 4h11M4.5 8h7M6.5 12h3" }) }),
		              activeFilters && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-filter-dot", "aria-hidden": "true" })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "ag-switch", title: zh ? "\u6709\u65B0\u52A8\u6001\u65F6\u81EA\u52A8\u6EDA\u5230\u5E95\u90E8" : "Auto-scroll to latest posts", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("input", { type: "checkbox", checked: follow, onChange: (e) => {
		            setFollow(e.target.checked);
		            if (e.target.checked) scrollToBottom("smooth");
		          } }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-switch-track", "aria-hidden": "true" }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("board.follow") })
		        ] })
		      ] }),
		      filtersOpen && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-filters", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-toolbar-row", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-select", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		            "select",
		            {
		              "aria-label": t("board.from"),
		              className: fromAgent ? "set" : "",
		              value: fromAgent,
		              onChange: (e) => setFromAgent(e.target.value),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: "", children: [
		                  t("board.from"),
		                  "\uFF1A",
		                  t("common.all")
		                ] }),
		                posters.map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: n, children: [
		                  t("board.from"),
		                  " @",
		                  n
		                ] }, n))
		              ]
		            }
		          ) }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-select", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		            "select",
		            {
		              "aria-label": t("board.to"),
		              className: toAgent ? "set" : "",
		              value: toAgent,
		              onChange: (e) => setToAgent(e.target.value),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: "", children: [
		                  t("board.to"),
		                  "\uFF1A",
		                  t("common.all")
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "@none", children: zh ? "\u65E0 @\u63D0\u53CA" : "To no one" }),
		                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "@all", children: zh ? "\u63D0\u53CA @all" : "To @all" }),
		                roster.map((m) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: m.name, children: [
		                  t("board.to"),
		                  " @",
		                  m.name
		                ] }, m.name))
		              ]
		            }
		          ) }),
		          hasChannels && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-select", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		            "select",
		            {
		              "aria-label": t("board.channel"),
		              className: channel ? "set" : "",
		              value: channel,
		              onChange: (e) => setChannel(e.target.value),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: "", children: [
		                  t("board.channel"),
		                  "\uFF1A",
		                  t("common.all")
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "main", children: "#main" }),
		                channelsList.map((c) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: c.name, children: [
		                  "#",
		                  c.name,
		                  c.archived ? zh ? "\uFF08\u5DF2\u5F52\u6863\uFF09" : " (archived)" : ""
		                ] }, c.name))
		              ]
		            }
		          ) }),
		          anyFilter && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		            "button",
		            {
		              type: "button",
		              className: "ag-ghost-btn",
		              onClick: () => {
		                setSearch("");
		                setFromAgent("");
		                setToAgent("");
		                setChannel("");
		                setHiddenAgents(/* @__PURE__ */ new Set());
		              },
		              children: zh ? "\u6E05\u9664\u7B5B\u9009" : "Clear filters"
		            }
		          )
		        ] }),
		        roster.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ag-agents", role: "group", "aria-label": zh ? "\u6309\u6210\u5458\u663E\u793A\u6216\u9690\u85CF" : "Toggle members in feed", children: roster.map((m) => {
		          const hidden = hiddenAgents.has(m.name);
		          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		            "button",
		            {
		              type: "button",
		              className: `ag-chip ${hidden ? "dim" : ""} ${m.killed ? "killed" : ""}`,
		              "data-testid": "swarm-member-chip",
		              "aria-pressed": !hidden,
		              onClick: () => toggleHiddenAgent(m.name),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-chip-name", children: m.name }),
		                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-chip-count", children: postCountsByAgent.get(m.name) ?? 0 })
		              ]
		            },
		            m.name
		          );
		        }) })
		      ] }),
		      hasChannels && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-channel-tabs", role: "tablist", "aria-label": t("board.channel"), children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "button",
		          {
		            type: "button",
		            role: "tab",
		            className: `ag-channel-tab ${channel === "" ? "on" : ""}`,
		            "aria-selected": channel === "",
		            "data-testid": "swarm-channel-tab",
		            onClick: () => setChannel(""),
		            children: t("common.all")
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		          "button",
		          {
		            type: "button",
		            role: "tab",
		            className: `ag-channel-tab ${channel === "main" ? "on" : ""}`,
		            "aria-selected": channel === "main",
		            "data-testid": "swarm-channel-tab",
		            onClick: () => setChannel("main"),
		            children: [
		              "#main ",
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-chip-count", children: channelCounts.get("main") ?? 0 })
		            ]
		          }
		        ),
		        channelsList.map((c) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		          "button",
		          {
		            type: "button",
		            role: "tab",
		            className: `ag-channel-tab ${channel === c.name ? "on" : ""} ${c.archived ? "archived" : ""}`,
		            "aria-selected": channel === c.name,
		            title: c.topic ? `#${c.name} \xB7 ${c.topic}` : `#${c.name}`,
		            "data-testid": "swarm-channel-tab",
		            onClick: () => setChannel(c.name),
		            children: [
		              "#",
		              c.name,
		              " ",
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-chip-count", children: channelCounts.get(c.name) ?? 0 })
		            ]
		          },
		          c.name
		        ))
		      ] })
		    ] }),
		    (() => {
		      const workingMembers = roster.filter((m) => !m.killed && m.state === "working");
		      if (workingMembers.length === 0) return null;
		      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		        "div",
		        {
		          "data-testid": "swarm-board-live-strip",
		          style: {
		            display: "flex",
		            alignItems: "center",
		            flexWrap: "wrap",
		            gap: 6,
		            padding: "6px 10px",
		            marginBottom: 8,
		            borderRadius: 8,
		            background: "var(--ag-fill, rgba(128,128,128,0.06))",
		            border: "1px solid var(--ag-line, rgba(128,128,128,0.14))",
		            fontSize: 12
		          },
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		              "span",
		              {
		                style: {
		                  display: "inline-flex",
		                  alignItems: "center",
		                  gap: 5,
		                  fontWeight: 600,
		                  color: "var(--ag-success, #63984f)",
		                  whiteSpace: "nowrap"
		                },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		                    "span",
		                    {
		                      style: {
		                        width: 6,
		                        height: 6,
		                        borderRadius: "50%",
		                        background: "var(--ag-success, #63984f)"
		                      }
		                    }
		                  ),
		                  zh ? `${workingMembers.length} \u5DE5\u4F5C\u4E2D` : `${workingMembers.length} working`
		                ]
		              }
		            ),
		            workingMembers.map((m) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		              "button",
		              {
		                type: "button",
		                className: "ag-chip",
		                onClick: () => onSelectSubagent ? onSelectSubagent(m.name) : onOpenMembers?.(),
		                title: m.activity || (zh ? "\u70B9\u51FB\u67E5\u770B\u6210\u5458\u8BE6\u60C5" : "Open Members tab"),
		                style: { height: 22, padding: "0 8px", fontSize: 11, maxWidth: 260 },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { fontWeight: 600 }, children: [
		                    "@",
		                    m.name
		                  ] }),
		                  m.activity && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { color: "var(--ag-fg-muted, #5d676f)", overflow: "hidden", textOverflow: "ellipsis" }, children: [
		                    "\xB7 ",
		                    m.activity
		                  ] })
		                ]
		              },
		              m.name
		            ))
		          ]
		        }
		      );
		    })(),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-feed", children: [
		      snapshot.messagesOffset > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "ag-feed-earlier", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		        "button",
		        {
		          type: "button",
		          className: "ag-btn sm",
		          "data-testid": "swarm-load-earlier",
		          disabled: loadingEarlier,
		          onClick: () => {
		            void onLoadEarlier();
		          },
		          children: loadingEarlier ? zh ? `\u6B63\u5728\u52A0\u8F7D\u66F4\u65E9\u53D1\u8A00\u2026\uFF08\u8FD8\u6709 ${snapshot.messagesOffset} \u6761\uFF09` : `Loading earlier posts\u2026 (${snapshot.messagesOffset} older)` : `${t("board.showEarlier")} (${snapshot.messagesOffset})`
		        }
		      ) }),
		      visibleMessages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-feed-empty", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: anyFilter ? zh ? "\u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u4E0B\u6682\u65E0\u5339\u914D\u53D1\u8A00\u3002" : "No posts match the current filters." : zh ? "\u9ED1\u677F\u4E0A\u6682\u65E0\u53D1\u8A00\u3002" : "No messages posted to the board yet." }),
		        anyFilter && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-btn sm",
		            onClick: () => {
		              setSearch("");
		              setFromAgent("");
		              setToAgent("");
		              setChannel("");
		              setHiddenAgents(/* @__PURE__ */ new Set());
		            },
		            children: zh ? "\u91CD\u7F6E\u7B5B\u9009" : "Reset filters"
		          }
		        )
		      ] }) : visibleMessages.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		        FeedMessageRow,
		        {
		          msg,
		          roster,
		          members: snapshot.members,
		          channelNames,
		          msgBySeq,
		          highlighted: highlightedSeq === msg.seq,
		          onSelectChannel: (ch) => setChannel(ch),
		          onJumpToSeq
		        },
		        msg.seq
		      )),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: bottomRef })
		    ] }),
		    showLatestBtn && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { display: "flex", justifyContent: "flex-end", pointerEvents: "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		      "button",
		      {
		        type: "button",
		        className: "ag-jump",
		        style: { pointerEvents: "auto" },
		        onClick: () => {
		          setFollow(true);
		          scrollToBottom("smooth");
		        },
		        children: [
		          "\u2193 ",
		          t("board.latest")
		        ]
		      }
		    ) }),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-composer", "data-testid": "swarm-composer", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		        "button",
		        {
		          type: "button",
		          className: "ag-composer-bar",
		          "aria-expanded": composerOpen,
		          onClick: () => setComposerOpen((v) => !v),
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("board.composePlaceholder", { channel: draftChannel || "main" }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: composerOpen ? `\u25BE ${t("common.showLess")}` : `\u25B4 ${t("board.composeBtn")}` })
		          ]
		        }
		      ),
		      composerOpen && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-composer-form", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-composer-top", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ag-select", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		            "select",
		            {
		              "aria-label": t("board.channel"),
		              value: draftChannel,
		              onChange: (e) => setDraftChannel(e.target.value),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "main", children: "#main" }),
		                channelsList.filter((c) => !c.archived).map((c) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("option", { value: c.name, children: [
		                  "#",
		                  c.name
		                ] }, c.name))
		              ]
		            }
		          ) }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-composer-chips", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "ag-pill-btn", onClick: () => insertToken("@all"), children: "@all" }),
		            roster.filter((m) => !m.killed).slice(0, 6).map((m) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		              "button",
		              {
		                type: "button",
		                className: "ag-pill-btn",
		                onClick: () => insertToken(`@${m.name}`),
		                children: [
		                  "@",
		                  m.name
		                ]
		              },
		              m.name
		            ))
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "textarea",
		          {
		            placeholder: zh ? "\u8F93\u5165\u9ED1\u677F\u53D1\u8A00\u5185\u5BB9\u2026\uFF08Ctrl+Enter \u5FEB\u6377\u53D1\u9001\uFF09" : "Write a board message\u2026 (Ctrl+Enter to send)",
		            value: draftText,
		            onChange: (e) => setDraftText(e.target.value),
		            onKeyDown: (e) => {
		              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
		                e.preventDefault();
		                void handleSend();
		              }
		            }
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "ag-composer-foot", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: zh ? "\u53D1\u5E16\u4F1A\u7ACB\u5373\u5524\u9192\u88AB @\u63D0\u53CA \u7684\u5F85\u547D\u6210\u5458\u3002" : "Posting wakes mentioned waiting agents immediately." }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		            "button",
		            {
		              type: "button",
		              className: "ag-btn primary sm",
		              disabled: sending || !draftText.trim(),
		              onClick: () => {
		                void handleSend();
		              },
		              children: sending ? zh ? "\u53D1\u9001\u4E2D\u2026" : "Sending\u2026" : t("board.send")
		            }
		          )
		        ] })
		      ] })
		    ] })
		  ] });
		}
		
		// client/components/MembersTab.tsx
		var import_react7 = require("react");
		
		// client/components/MemberDrawer.tsx
		var import_react6 = require("react");
		var import_jsx_runtime3 = require("react/jsx-runtime");
		function stepBadgeColor(kind, status) {
		  if (status === "error" || kind === "error") return "var(--ag-error, #cb3d3d)";
		  if (status === "running") return "var(--ag-primary, #007acc)";
		  if (kind === "tool") return "var(--ag-primary, #007acc)";
		  if (kind === "thinking") return "var(--ag-warning, #bca136)";
		  if (kind === "model") return "var(--ag-success, #63984f)";
		  return "var(--ag-fg-muted, #5d676f)";
		}
		function MemberDrawer(props) {
		  const { swarmId, member, models, onClose, onJumpToSeq, onAction } = props;
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const [transcript, setTranscript] = (0, import_react6.useState)(null);
		  const [loading, setLoading] = (0, import_react6.useState)(false);
		  const [transcriptError, setTranscriptError] = (0, import_react6.useState)(null);
		  const [selectedModelKey, setSelectedModelKey] = (0, import_react6.useState)("");
		  const [selectedEffort, setSelectedEffort] = (0, import_react6.useState)("");
		  const [nudgeText, setNudgeText] = (0, import_react6.useState)("");
		  const [confirmKill, setConfirmKill] = (0, import_react6.useState)(false);
		  const [busyAction, setBusyAction] = (0, import_react6.useState)(null);
		  const [actionFeedback, setActionFeedback] = (0, import_react6.useState)(null);
		  const modelOptions = (0, import_react6.useMemo)(() => {
		    const map = /* @__PURE__ */ new Map();
		    for (const m of models) {
		      map.set(`${m.provider}::${m.model}`, m);
		    }
		    if (member?.model) {
		      const key = `${member.provider ?? ""}::${member.model}`;
		      if (!map.has(key)) {
		        map.set(key, {
		          provider: member.provider ?? "",
		          model: member.model,
		          label: member.model_display_name || member.model
		        });
		      }
		    }
		    return [...map.entries()];
		  }, [models, member?.model, member?.provider, member?.model_display_name]);
		  const loadTranscript = (0, import_react6.useCallback)(async () => {
		    if (!member) return;
		    setLoading(true);
		    setTranscriptError(null);
		    try {
		      const data = await swarmClientStore.fetchMemberTranscript(swarmId, member.name);
		      setTranscript(data);
		    } catch (err) {
		      setTranscriptError(err instanceof Error ? err.message : String(err));
		    } finally {
		      setLoading(false);
		    }
		  }, [swarmId, member]);
		  (0, import_react6.useEffect)(() => {
		    if (!member) return;
		    setSelectedModelKey(`${member.provider ?? ""}::${member.model}`);
		    setSelectedEffort(member.reasoning_effort ?? "");
		    setConfirmKill(false);
		    setActionFeedback(null);
		    setNudgeText("");
		    void loadTranscript();
		  }, [member?.name, swarmId, loadTranscript]);
		  (0, import_react6.useEffect)(() => {
		    if (!member) return;
		    const onKeyDown = (e) => {
		      if (e.key === "Escape") onClose();
		    };
		    window.addEventListener("keydown", onKeyDown);
		    return () => window.removeEventListener("keydown", onKeyDown);
		  }, [member, onClose]);
		  if (!member) return null;
		  const isCoordinator = member.role === "coordinator" || member.name === "coordinator";
		  const canSwitchModel = !member.killed && (member.state === "waiting" || member.state === "stopped");
		  const selectedOpt = modelOptions.find(([k]) => k === selectedModelKey)?.[1];
		  const efforts = selectedOpt?.efforts ?? [];
		  const runAction = async (label, req) => {
		    setBusyAction(label);
		    setActionFeedback(null);
		    try {
		      await onAction(req);
		      setActionFeedback({ kind: "ok", text: isZh ? `${label}\u5DF2\u5B8C\u6210\u3002` : `${label} succeeded.` });
		      if (req.action === "kill_worker") setConfirmKill(false);
		      if (req.action === "nudge_worker") setNudgeText("");
		      void loadTranscript();
		    } catch (err) {
		      setActionFeedback({ kind: "err", text: err instanceof Error ? err.message : String(err) });
		    } finally {
		      setBusyAction(null);
		    }
		  };
		  const handleSwitchModel = () => {
		    if (!selectedOpt) return;
		    void runAction(isZh ? "\u6A21\u578B\u5207\u6362" : "Model switch", {
		      action: "switch_model",
		      swarmId,
		      member: member.name,
		      model: selectedOpt.model,
		      ...selectedOpt.provider ? { provider: selectedOpt.provider } : {},
		      ...selectedEffort ? { reasoningEffort: selectedEffort } : {}
		    });
		  };
		  const handleNudge = () => {
		    const trimmed = nudgeText.trim();
		    void runAction(isZh ? "\u5524\u9192\u6307\u4EE4" : "Nudge", {
		      action: "nudge_worker",
		      swarmId,
		      member: member.name,
		      ...trimmed ? { text: trimmed } : {}
		    });
		  };
		  const handleKill = () => {
		    void runAction(isZh ? "\u7EC8\u6B62\u6210\u5458" : "Kill worker", {
		      action: "kill_worker",
		      swarmId,
		      member: member.name
		    });
		  };
		  const steps = transcript?.steps ?? [];
		  const beeState = member.killed ? "killed" : member.waiting_on?.length ? "waiting_on" : member.state;
		  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		    "div",
		    {
		      className: "ag-drawer-backdrop",
		      "data-testid": "swarm-member-drawer",
		      onClick: (e) => {
		        if (e.target === e.currentTarget) onClose();
		      },
		      style: {
		        position: "fixed",
		        inset: 0,
		        zIndex: 60,
		        background: "rgba(0, 0, 0, 0.36)",
		        display: "flex",
		        justifyContent: "flex-end"
		      },
		      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		        "aside",
		        {
		          className: "ag-drawer",
		          role: "dialog",
		          "aria-label": `Member @${member.name}`,
		          style: {
		            width: "min(480px, 94vw)",
		            height: "100%",
		            background: "var(--ag-bg, #f7f7f8)",
		            color: "var(--ag-fg, #1d1f21)",
		            borderLeft: "1px solid var(--ag-card-border, rgba(128,128,128,0.2))",
		            boxShadow: "-8px 0 28px rgba(0, 0, 0, 0.22)",
		            display: "flex",
		            flexDirection: "column",
		            overflow: "hidden"
		          },
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		              "div",
		              {
		                className: "ag-drawer-head",
		                style: {
		                  display: "flex",
		                  alignItems: "center",
		                  gap: 12,
		                  padding: "14px 16px",
		                  borderBottom: "1px solid var(--ag-line, rgba(128,128,128,0.14))",
		                  background: "var(--ag-card, #ffffff)",
		                  flex: "none"
		                },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                    "span",
		                    {
		                      style: {
		                        width: 50,
		                        height: 44,
		                        borderRadius: 10,
		                        display: "grid",
		                        placeItems: "center",
		                        background: getBeeTileBg(member.name, member.role),
		                        boxShadow: "inset 0 0 0 1px var(--ag-border, rgba(128,128,128,0.2))",
		                        flex: "none"
		                      },
		                      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PixelBee, { name: member.name, role: member.role, state: beeState, size: 2 })
		                    }
		                  ),
		                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("strong", { style: { fontSize: 15 }, children: [
		                        "@",
		                        member.name
		                      ] }),
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                        "span",
		                        {
		                          style: {
		                            fontSize: 11,
		                            padding: "1px 7px",
		                            borderRadius: 999,
		                            background: "var(--ag-fill, rgba(128,128,128,0.1))",
		                            color: "var(--ag-fg-muted, #5d676f)"
		                          },
		                          children: member.killed ? t("members.state.killed") : t(`members.state.${member.state}`)
		                        }
		                      ),
		                      member.last_post_seq ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		                        "button",
		                        {
		                          type: "button",
		                          className: "ag-ghost-btn",
		                          onClick: () => {
		                            onJumpToSeq(member.last_post_seq);
		                            onClose();
		                          },
		                          style: { height: 22, padding: "0 6px", fontFamily: "var(--ag-mono, monospace)", fontSize: 11 },
		                          title: isZh ? `\u8DF3\u8F6C\u5230\u9ED1\u677F #${member.last_post_seq}` : `Jump to #${member.last_post_seq} on Board`,
		                          children: [
		                            "#",
		                            member.last_post_seq
		                          ]
		                        }
		                      ) : null
		                    ] }),
		                    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
		                      member.model_display_name || member.model,
		                      member.workspace_mode !== "inherit" ? ` \xB7 ${member.workspace_mode}` : "",
		                      member.branch ? ` \xB7 ${member.branch}` : ""
		                    ] })
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                    "button",
		                    {
		                      type: "button",
		                      className: "ag-icon-btn",
		                      onClick: onClose,
		                      "aria-label": t("common.close"),
		                      title: `${t("common.close")} (Esc)`,
		                      children: "\u2715"
		                    }
		                  )
		                ]
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }, children: [
		              member.failure && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		                "div",
		                {
		                  role: "alert",
		                  style: {
		                    padding: "8px 10px",
		                    borderRadius: 8,
		                    background: "color-mix(in srgb, var(--ag-error, #cb3d3d) 12%, transparent)",
		                    border: "1px solid color-mix(in srgb, var(--ag-error, #cb3d3d) 35%, transparent)",
		                    fontSize: 12
		                  },
		                  children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { style: { color: "var(--ag-error, #cb3d3d)", textTransform: "uppercase", fontSize: 11 }, children: member.failure.kind }),
		                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { marginTop: 2 }, children: member.failure.message })
		                  ]
		                }
		              ),
		              actionFeedback && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                "div",
		                {
		                  role: "status",
		                  style: {
		                    padding: "7px 10px",
		                    borderRadius: 8,
		                    fontSize: 12,
		                    background: actionFeedback.kind === "err" ? "color-mix(in srgb, var(--ag-error, #cb3d3d) 12%, transparent)" : "color-mix(in srgb, var(--ag-success, #63984f) 14%, transparent)",
		                    color: actionFeedback.kind === "err" ? "var(--ag-error, #cb3d3d)" : "var(--ag-success, #63984f)"
		                  },
		                  children: actionFeedback.text
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		                "section",
		                {
		                  style: {
		                    padding: "10px 12px",
		                    borderRadius: 10,
		                    background: "var(--ag-card, #ffffff)",
		                    border: "1px solid var(--ag-card-border, rgba(128,128,128,0.2))",
		                    display: "flex",
		                    flexDirection: "column",
		                    gap: 10
		                  },
		                  children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ag-fg-muted, #5d676f)" }, children: t("drawer.controls") }),
		                    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)" }, children: t("drawer.switchModel") }),
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
		                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                          "select",
		                          {
		                            "aria-label": t("drawer.switchBtn"),
		                            value: selectedModelKey,
		                            disabled: !canSwitchModel || busyAction !== null,
		                            onChange: (e) => {
		                              setSelectedModelKey(e.target.value);
		                              setSelectedEffort("");
		                            },
		                            style: {
		                              flex: "1 1 180px",
		                              height: 30,
		                              padding: "0 8px",
		                              borderRadius: 6,
		                              border: "1px solid var(--ag-border, rgba(128,128,128,0.2))",
		                              background: "var(--ag-bg, #f7f7f8)",
		                              fontSize: 12
		                            },
		                            children: modelOptions.map(([key, opt]) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: key, children: opt.label }, key))
		                          }
		                        ),
		                        efforts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		                          "select",
		                          {
		                            "aria-label": t("settings.effortDefault"),
		                            value: selectedEffort,
		                            disabled: !canSwitchModel || busyAction !== null,
		                            onChange: (e) => setSelectedEffort(e.target.value),
		                            style: {
		                              height: 30,
		                              padding: "0 8px",
		                              borderRadius: 6,
		                              border: "1px solid var(--ag-border, rgba(128,128,128,0.2))",
		                              background: "var(--ag-bg, #f7f7f8)",
		                              fontSize: 12
		                            },
		                            children: [
		                              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "", children: selectedOpt?.defaultEffort ? `${t("settings.effortDefault")} (${selectedOpt.defaultEffort})` : t("settings.effortDefault") }),
		                              efforts.map((ef) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: ef.id, children: ef.name }, ef.id))
		                            ]
		                          }
		                        ),
		                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                          "button",
		                          {
		                            type: "button",
		                            className: "ag-btn primary sm",
		                            disabled: !canSwitchModel || !selectedOpt || busyAction !== null,
		                            onClick: handleSwitchModel,
		                            style: { height: 30 },
		                            children: busyAction === (isZh ? "\u6A21\u578B\u5207\u6362" : "Model switch") ? isZh ? "\u5207\u6362\u4E2D\u2026" : "Switching\u2026" : t("drawer.switchBtn")
		                          }
		                        )
		                      ] })
		                    ] }),
		                    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)" }, children: t("drawer.nudge") }),
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", gap: 6 }, children: [
		                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                          "input",
		                          {
		                            type: "text",
		                            value: nudgeText,
		                            disabled: member.killed || busyAction !== null,
		                            onChange: (e) => setNudgeText(e.target.value),
		                            onKeyDown: (e) => {
		                              if (e.key === "Enter" && !member.killed && busyAction === null) handleNudge();
		                            },
		                            placeholder: t("drawer.nudgePlaceholder", { name: member.name }),
		                            style: {
		                              flex: 1,
		                              minWidth: 0,
		                              height: 30,
		                              padding: "0 8px",
		                              borderRadius: 6,
		                              border: "1px solid var(--ag-border, rgba(128,128,128,0.2))",
		                              background: "var(--ag-bg, #f7f7f8)",
		                              fontSize: 12
		                            }
		                          }
		                        ),
		                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                          "button",
		                          {
		                            type: "button",
		                            className: "ag-btn sm",
		                            disabled: member.killed || busyAction !== null,
		                            onClick: handleNudge,
		                            style: { height: 30 },
		                            children: busyAction === (isZh ? "\u5524\u9192\u6307\u4EE4" : "Nudge") ? isZh ? "\u53D1\u9001\u4E2D\u2026" : "Sending\u2026" : t("drawer.nudgeBtn")
		                          }
		                        )
		                      ] })
		                    ] }),
		                    !isCoordinator && !member.killed && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { paddingTop: 6, borderTop: "1px solid var(--ag-line, rgba(128,128,128,0.14))" }, children: !confirmKill ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                      "button",
		                      {
		                        type: "button",
		                        className: "ag-btn danger sm",
		                        disabled: busyAction !== null,
		                        onClick: () => setConfirmKill(true),
		                        children: t("drawer.kill")
		                      }
		                    ) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { fontSize: 12, color: "var(--ag-error, #cb3d3d)", fontWeight: 500 }, children: t("drawer.killConfirm", { name: member.name }) }),
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                        "button",
		                        {
		                          type: "button",
		                          className: "ag-btn danger sm",
		                          disabled: busyAction !== null,
		                          onClick: handleKill,
		                          children: busyAction === (isZh ? "\u7EC8\u6B62\u6210\u5458" : "Kill worker") ? isZh ? "\u7EC8\u6B62\u4E2D\u2026" : "Killing\u2026" : t("drawer.confirmKillBtn")
		                        }
		                      ),
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                        "button",
		                        {
		                          type: "button",
		                          className: "ag-ghost-btn",
		                          disabled: busyAction !== null,
		                          onClick: () => setConfirmKill(false),
		                          children: t("common.cancel")
		                        }
		                      )
		                    ] }) })
		                  ]
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { style: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ag-fg-muted, #5d676f)" }, children: [
		                    t("drawer.transcript"),
		                    " (",
		                    steps.length,
		                    ")"
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "ag-ghost-btn", onClick: () => void loadTranscript(), disabled: loading, children: loading ? t("common.refreshing") : t("common.refresh") })
		                ] }),
		                transcriptError && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontSize: 12, color: "var(--ag-error, #cb3d3d)" }, children: isZh ? `\u52A0\u8F7D\u8F68\u8FF9\u5931\u8D25\uFF1A${transcriptError}` : `Failed to load transcript: ${transcriptError}` }),
		                !loading && !transcriptError && steps.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)" }, children: t("drawer.noSteps") }),
		                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
		                  "div",
		                  {
		                    style: {
		                      padding: "8px 10px",
		                      borderRadius: 8,
		                      background: "var(--ag-card, #ffffff)",
		                      border: "1px solid var(--ag-border, rgba(128,128,128,0.16))",
		                      fontSize: 12
		                    },
		                    children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
		                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                          "span",
		                          {
		                            style: {
		                              fontSize: 10,
		                              fontWeight: 600,
		                              textTransform: "uppercase",
		                              padding: "1px 5px",
		                              borderRadius: 4,
		                              background: "var(--ag-fill, rgba(128,128,128,0.1))",
		                              color: stepBadgeColor(step.kind, step.status)
		                            },
		                            children: step.kind
		                          }
		                        ),
		                        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: step.title }),
		                        step.time && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { fontSize: 11, color: "var(--ag-fg-faint, #9da5ab)", fontFamily: "var(--ag-mono, monospace)" }, children: step.time })
		                      ] }),
		                      step.detail && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
		                        "pre",
		                        {
		                          style: {
		                            margin: "6px 0 0",
		                            padding: "6px 8px",
		                            borderRadius: 6,
		                            background: "var(--ag-fill, rgba(128,128,128,0.06))",
		                            fontSize: 11,
		                            maxHeight: 160,
		                            overflow: "auto",
		                            whiteSpace: "pre-wrap",
		                            wordBreak: "break-word"
		                          },
		                          children: step.detail
		                        }
		                      )
		                    ]
		                  },
		                  `${step.index}-${step.kind}`
		                )) })
		              ] })
		            ] })
		          ]
		        }
		      )
		    }
		  );
		}
		
		// client/components/MembersTab.tsx
		var import_jsx_runtime4 = require("react/jsx-runtime");
		function shortWorkspace(ws) {
		  const norm = ws.replace(/\\/g, "/").replace(/\/+$/, "");
		  const segs = norm.split("/").filter(Boolean);
		  if (segs.length === 0) return norm;
		  const out = segs.length > 2 ? `\u2026/${segs.slice(-2).join("/")}` : segs.join("/");
		  return out.length > 44 ? `\u2026${out.slice(-43)}` : out;
		}
		function getStatusBadge(m, isZh) {
		  if (m.killed || m.state === "killed") return { label: t("members.state.killed"), tone: "muted" };
		  if (m.failure) {
		    if (m.failure.kind === "quota") return { label: isZh ? "\u914D\u989D\u8017\u5C3D" : "Quota", tone: "bad" };
		    if (m.failure.kind === "stuck") return { label: isZh ? "\u7591\u4F3C\u5361\u4F4F" : "Stuck", tone: "bad" };
		    return { label: isZh ? "\u51FA\u9519" : "Error", tone: "bad" };
		  }
		  if (m.state === "working") {
		    return {
		      label: m.role === "coordinator" ? `${t("members.coordinator")} \xB7 ${t("members.state.working")}` : t("members.state.working"),
		      tone: "info"
		    };
		  }
		  if (m.waiting_on && m.waiting_on.length > 0) {
		    return { label: t("members.waitingOn", { target: m.waiting_on[0] }), tone: "warn" };
		  }
		  if (m.state === "stopped") return { label: t("members.state.stopped"), tone: "muted" };
		  if (m.role === "coordinator") return { label: t("members.coordinator"), tone: "muted" };
		  return { label: t("members.state.waiting"), tone: "muted" };
		}
		function getDotVariant(m) {
		  if (m.killed || m.state === "killed") return void 0;
		  if (m.failure) return m.failure.kind === "stuck" ? "stuck" : "error";
		  if (m.state === "working") return "working";
		  if (m.waiting_on && m.waiting_on.length > 0) return "waiting";
		  return void 0;
		}
		function matchesQuery(m, query) {
		  if (!query) return true;
		  const hay = [
		    m.name,
		    m.role,
		    m.state,
		    m.model,
		    m.model_display_name,
		    m.task_hint ?? "",
		    m.activity ?? "",
		    m.workspace_mode,
		    m.workspace,
		    m.branch ?? "",
		    ...m.channels ?? [],
		    ...m.waiting_on ?? [],
		    m.failure?.kind ?? "",
		    m.failure?.message ?? ""
		  ].join(" ").toLowerCase();
		  return hay.includes(query);
		}
		function MembersTab(props) {
		  const { snapshot, onJumpToSeq, onAction, models, onInspectSubagent } = props;
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const [query, setQuery] = (0, import_react7.useState)("");
		  const [retiredOpen, setRetiredOpen] = (0, import_react7.useState)(false);
		  const [selectedMemberName, setSelectedMemberName] = (0, import_react7.useState)(null);
		  const normalizedQuery = query.trim().toLowerCase();
		  const { coordinator, activeWorkers, standbyWorkers, retiredWorkers } = (0, import_react7.useMemo)(() => {
		    const all = Object.values(snapshot.members || {});
		    const coord = all.find((m) => m.role === "coordinator" || m.name === "coordinator") ?? null;
		    const workers = all.filter((m) => m !== coord && m.role !== "monitor");
		    const live = workers.filter((m) => !m.killed && m.state !== "killed");
		    const retired = workers.filter((m) => m.killed || m.state === "killed").sort((a, b) => (b.last_post_seq ?? 0) - (a.last_post_seq ?? 0) || a.name.localeCompare(b.name));
		    const active = live.filter((m) => m.state === "working").sort((a, b) => (b.last_post_seq ?? 0) - (a.last_post_seq ?? 0) || a.name.localeCompare(b.name));
		    const standby = live.filter((m) => m.state !== "working").sort((a, b) => {
		      const scoreA = a.failure ? 0 : a.waiting_on?.length ? 1 : 2;
		      const scoreB = b.failure ? 0 : b.waiting_on?.length ? 1 : 2;
		      if (scoreA !== scoreB) return scoreA - scoreB;
		      return (b.last_post_seq ?? 0) - (a.last_post_seq ?? 0) || a.name.localeCompare(b.name);
		    });
		    return {
		      coordinator: coord && matchesQuery(coord, normalizedQuery) ? coord : null,
		      activeWorkers: active.filter((m) => matchesQuery(m, normalizedQuery)),
		      standbyWorkers: standby.filter((m) => matchesQuery(m, normalizedQuery)),
		      retiredWorkers: retired.filter((m) => matchesQuery(m, normalizedQuery))
		    };
		  }, [snapshot.members, normalizedQuery]);
		  const selectedMember = selectedMemberName ? snapshot.members[selectedMemberName] ?? null : null;
		  const shimmerDelay2 = `-${Date.now() % 1900}ms`;
		  const renderCard = (m) => {
		    const badge = getStatusBadge(m, isZh);
		    const dotVariant = getDotVariant(m);
		    const beeState = m.killed || m.state === "killed" ? "killed" : m.waiting_on?.length ? "waiting_on" : m.state;
		    const modelShort = (m.model_display_name || m.model || "").replace(/-(?:dropdown|high|medium)$/i, "");
		    const nonMainChannels = (m.channels ?? []).filter((c) => c && c !== "main");
		    const wsShort = m.workspace ? shortWorkspace(m.workspace) : "";
		    const wsLabel = m.workspace_mode && m.workspace_mode !== "inherit" ? wsShort ? `${m.workspace_mode} \xB7 ${wsShort}` : m.workspace_mode : wsShort;
		    const hasLiveShimmer = !m.killed && m.state === "working" && !m.failure && Boolean(m.activity);
		    const badgeColor = badge.tone === "info" ? "var(--ag-primary, #007acc)" : badge.tone === "warn" ? "var(--ag-warning, #bca136)" : badge.tone === "bad" ? "var(--ag-error, #cb3d3d)" : "var(--ag-fg-muted, #5d676f)";
		    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		      "article",
		      {
		        className: `ag-mrow${m.killed ? " retired" : ""}`,
		        "data-testid": `swarm-member-${m.name}`,
		        onClick: () => setSelectedMemberName(m.name),
		        style: {
		          display: "grid",
		          gridTemplateColumns: "50px minmax(0, 1fr)",
		          columnGap: 12,
		          padding: 10,
		          margin: "2px -10px 0",
		          borderRadius: 10,
		          cursor: "pointer",
		          opacity: m.killed ? 0.68 : 1,
		          transition: "background-color 0.12s ease"
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		            "span",
		            {
		              className: "ag-mav",
		              style: {
		                position: "relative",
		                width: 50,
		                height: 44,
		                borderRadius: 10,
		                display: "grid",
		                placeItems: "center",
		                background: getBeeTileBg(m.name, m.role),
		                boxShadow: "inset 0 0 0 1px var(--ag-border, rgba(128,128,128,0.2))",
		                flex: "none"
		              },
		              children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                PixelBee,
		                {
		                  name: m.name,
		                  role: m.role,
		                  state: beeState,
		                  size: 2,
		                  showDot: Boolean(dotVariant),
		                  dotVariant
		                }
		              )
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "ag-mcol", style: { minWidth: 0 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		              "header",
		              {
		                className: "ag-mhead",
		                style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 22 },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { style: { fontSize: 13, fontWeight: 600, lineHeight: "20px", whiteSpace: "nowrap" }, children: [
		                      "@",
		                      m.name
		                    ] }),
		                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                      "span",
		                      {
		                        className: `ag-mstat ag-mstat-${badge.tone}`,
		                        style: {
		                          fontSize: 12,
		                          lineHeight: "20px",
		                          padding: "1px 0",
		                          fontWeight: badge.tone === "muted" ? 400 : 500,
		                          color: badgeColor,
		                          overflow: "hidden",
		                          textOverflow: "ellipsis",
		                          whiteSpace: "nowrap"
		                        },
		                        children: badge.label
		                      }
		                    )
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		                    "span",
		                    {
		                      style: {
		                        display: "inline-flex",
		                        alignItems: "center",
		                        gap: 6,
		                        flex: "none",
		                        fontFamily: "var(--ag-mono, monospace)",
		                        fontSize: 11,
		                        color: "var(--ag-fg-faint, #9da5ab)",
		                        fontVariantNumeric: "tabular-nums"
		                      },
		                      children: [
		                        modelShort && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: modelShort }),
		                        onInspectSubagent && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                          "button",
		                          {
		                            type: "button",
		                            className: "ag-ghost-btn",
		                            onClick: (e) => {
		                              e.stopPropagation();
		                              onInspectSubagent(m.name);
		                            },
		                            title: isZh ? "\u6253\u5F00\u5B50\u4EE3\u7406\u5B9E\u65F6\u5BF9\u8BDD\u89C6\u56FE" : "Inspect subagent conversation",
		                            style: { height: 20, padding: "0 6px", fontSize: 11 },
		                            children: isZh ? "\u5BF9\u8BDD" : "Trace"
		                          }
		                        ),
		                        m.last_post_seq ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		                          "button",
		                          {
		                            type: "button",
		                            className: "ag-ghost-btn",
		                            onClick: (e) => {
		                              e.stopPropagation();
		                              onJumpToSeq(m.last_post_seq);
		                            },
		                            title: `Go to #${m.last_post_seq} on Board`,
		                            style: { height: 20, padding: "0 4px", fontFamily: "var(--ag-mono, monospace)", fontSize: 11 },
		                            children: [
		                              modelShort ? "\xB7 " : "",
		                              "#",
		                              m.last_post_seq
		                            ]
		                          }
		                        ) : null
		                      ]
		                    }
		                  )
		                ]
		              }
		            ),
		            m.task_hint && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		              "div",
		              {
		                className: "ag-mrole",
		                style: {
		                  fontSize: 12,
		                  color: "var(--ag-fg-muted, #5d676f)",
		                  overflow: "hidden",
		                  textOverflow: "ellipsis",
		                  whiteSpace: "nowrap",
		                  marginTop: 1
		                },
		                children: m.task_hint
		              }
		            ),
		            (wsLabel || m.branch || nonMainChannels.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "ag-mtags", style: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }, children: [
		              wsLabel && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                "span",
		                {
		                  className: "ag-mtag",
		                  title: m.workspace || wsLabel,
		                  style: {
		                    fontSize: 11,
		                    lineHeight: "18px",
		                    padding: "0 6px",
		                    borderRadius: 999,
		                    color: "var(--ag-fg-muted, #5d676f)",
		                    background: "var(--ag-fill, rgba(128,128,128,0.1))",
		                    maxWidth: "100%",
		                    overflow: "hidden",
		                    textOverflow: "ellipsis",
		                    whiteSpace: "nowrap"
		                  },
		                  children: wsLabel
		                }
		              ),
		              m.branch && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                "span",
		                {
		                  className: "ag-mtag",
		                  title: `Branch: ${m.branch}`,
		                  style: {
		                    fontSize: 11,
		                    lineHeight: "18px",
		                    padding: "0 6px",
		                    borderRadius: 999,
		                    fontFamily: "var(--ag-mono, monospace)",
		                    color: "var(--ag-fg-muted, #5d676f)",
		                    background: "var(--ag-fill, rgba(128,128,128,0.1))"
		                  },
		                  children: m.branch
		                }
		              ),
		              nonMainChannels.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		                "span",
		                {
		                  className: "ag-mtag",
		                  style: {
		                    fontSize: 11,
		                    lineHeight: "18px",
		                    padding: "0 6px",
		                    borderRadius: 999,
		                    color: "var(--ag-fg-muted, #5d676f)",
		                    background: "var(--ag-fill, rgba(128,128,128,0.1))"
		                  },
		                  children: nonMainChannels.includes("*") ? "all channels" : nonMainChannels.map((c) => `#${c}`).join(" ")
		                }
		              )
		            ] }),
		            hasLiveShimmer ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		              "div",
		              {
		                className: "ag-mnow ag-mact",
		                "data-testid": "swarm-member-activity",
		                title: m.activity,
		                style: {
		                  marginTop: 3,
		                  fontSize: 13,
		                  overflow: "hidden",
		                  textOverflow: "ellipsis",
		                  whiteSpace: "nowrap",
		                  fontStyle: m.activity_kind === "thinking" ? "italic" : "normal"
		                },
		                children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "ag-shimmer animate-shimmer-text", style: { animationDelay: shimmerDelay2 }, children: m.activity })
		              }
		            ) : m.failure ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { marginTop: 3, fontSize: 12, color: "var(--ag-error, #cb3d3d)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.failure.message }) : m.activity ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { marginTop: 3, fontSize: 12, color: "var(--ag-fg-muted, #5d676f)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.activity }) : null
		          ] })
		        ]
		      },
		      m.name
		    );
		  };
		  const renderGroup = (title, list) => {
		    if (list.length === 0) return null;
		    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "ag-mgroup", style: { marginBottom: 14 }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		        "h3",
		        {
		          className: "ag-msec",
		          style: {
		            display: "flex",
		            alignItems: "center",
		            gap: 6,
		            margin: "0 0 4px",
		            fontSize: 11,
		            fontWeight: 600,
		            letterSpacing: "0.04em",
		            textTransform: "uppercase",
		            color: "var(--ag-fg-muted, #5d676f)"
		          },
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: title }),
		            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("em", { style: { fontStyle: "normal", fontWeight: 500, color: "var(--ag-fg-faint, #9da5ab)", fontVariantNumeric: "tabular-nums" }, children: list.length })
		          ]
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "ag-mlist", style: { display: "flex", flexDirection: "column" }, children: list.map(renderCard) })
		    ] });
		  };
		  const hasAnyVisible = Boolean(coordinator) || activeWorkers.length > 0 || standbyWorkers.length > 0 || retiredWorkers.length > 0;
		  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "ag-members", "data-testid": "swarm-members-tab", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "ag-mtop", style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "ag-search", style: { flex: 1 }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", { className: "ag-icon", width: "14", height: "14", viewBox: "0 0 16 16", "aria-hidden": "true", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("circle", { cx: "7", cy: "7", r: "4.25" }),
		        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("path", { d: "m10.25 10.25 3.25 3.25" })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		        "input",
		        {
		          type: "search",
		          value: query,
		          onChange: (e) => setQuery(e.target.value),
		          placeholder: t("members.search"),
		          "aria-label": t("members.search")
		        }
		      )
		    ] }) }),
		    coordinator && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		      "section",
		      {
		        className: "ag-mgroup ag-mcoord",
		        style: {
		          paddingBottom: 8,
		          marginBottom: 12,
		          borderBottom: "1px solid var(--ag-border, rgba(128,128,128,0.16))"
		        },
		        children: renderCard(coordinator)
		      }
		    ),
		    renderGroup(t("members.active"), activeWorkers),
		    renderGroup(t("members.standingBy"), standbyWorkers),
		    retiredWorkers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		      "section",
		      {
		        className: `ag-mgroup ag-mretgrp${retiredOpen ? " open" : ""}`,
		        style: {
		          marginTop: 10,
		          paddingTop: 8,
		          borderTop: "1px solid var(--ag-border, rgba(128,128,128,0.16))"
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
		            "button",
		            {
		              type: "button",
		              className: "ag-mret",
		              "aria-expanded": retiredOpen,
		              onClick: () => setRetiredOpen((v) => !v),
		              style: {
		                width: "100%",
		                display: "flex",
		                alignItems: "center",
		                gap: 6,
		                minHeight: 28,
		                border: 0,
		                background: "transparent",
		                padding: 0,
		                fontSize: 11,
		                fontWeight: 600,
		                letterSpacing: "0.04em",
		                textTransform: "uppercase",
		                color: "var(--ag-fg-muted, #5d676f)",
		                cursor: "pointer"
		              },
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("members.retired") }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("em", { style: { fontStyle: "normal", fontWeight: 500, color: "var(--ag-fg-faint, #9da5ab)" }, children: retiredWorkers.length }),
		                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { marginLeft: "auto", fontSize: 10 }, children: retiredOpen ? "\u25BE" : "\u25B8" })
		              ]
		            }
		          ),
		          retiredOpen && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "ag-mlist", style: { display: "flex", flexDirection: "column", marginTop: 4 }, children: retiredWorkers.map(renderCard) })
		        ]
		      }
		    ),
		    !hasAnyVisible && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { textAlign: "center", padding: "36px 16px", color: "var(--ag-fg-muted, #5d676f)", fontSize: 13 }, children: normalizedQuery ? isZh ? `\u672A\u627E\u5230\u5339\u914D "${query}" \u7684\u6210\u5458\u3002` : `No members match "${query}".` : isZh ? "\u5F53\u524D\u8702\u7FA4\u6682\u65E0\u6210\u5458\u3002" : "No members in this swarm yet." }),
		    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
		      MemberDrawer,
		      {
		        swarmId: snapshot.swarm_id,
		        member: selectedMember,
		        models,
		        onClose: () => setSelectedMemberName(null),
		        onJumpToSeq,
		        onAction
		      }
		    )
		  ] });
		}
		
		// client/components/SubagentsTab.tsx
		var import_react8 = require("react");
		var import_jsx_runtime5 = require("react/jsx-runtime");
		function formatDurationMs(ms, isZh) {
		  const sec = Math.max(1, Math.round(ms / 1e3));
		  if (sec < 60) return isZh ? `${sec}\u79D2` : `${sec}s`;
		  const min = Math.floor(sec / 60);
		  const rem = sec % 60;
		  return isZh ? rem > 0 ? `${min}\u5206${rem}\u79D2` : `${min}\u5206` : rem > 0 ? `${min}m ${rem}s` : `${min}m`;
		}
		function groupTranscriptBlocks(steps, isZh) {
		  const blocks = [];
		  let workBuf = [];
		  const flushWork = () => {
		    if (workBuf.length === 0) return;
		    const items = workBuf;
		    workBuf = [];
		    let ms = items.reduce((acc, s) => acc + (s.durationMs ?? 0), 0);
		    const times = items.map((s) => s.ts ?? (s.time ? Date.parse(s.time) : NaN)).filter((n) => Number.isFinite(n));
		    if (ms <= 0 && times.length >= 2) {
		      ms = Math.max(0, times[times.length - 1] - times[0]);
		    }
		    const label = ms > 0 ? t("subagents.workedFor", { duration: formatDurationMs(ms, isZh) }) : t("subagents.stepsCount", { count: items.length });
		    blocks.push({ kind: "worked", id: `w-${items[0].index}-${items.length}`, durationLabel: label, steps: items });
		  };
		  for (const step of steps) {
		    if (step.kind === "assistant") {
		      flushWork();
		      blocks.push({ kind: "assistant", id: `a-${step.index}`, step });
		    } else if (step.kind === "user") {
		      flushWork();
		      blocks.push({ kind: "user", id: `u-${step.index}`, step });
		    } else {
		      workBuf.push(step);
		    }
		  }
		  flushWork();
		  return blocks;
		}
		function SubagentText({ text }) {
		  const lines = String(text || "").split(/\r?\n/);
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, lineHeight: 1.62, color: "var(--ag-fg)" }, children: lines.map((line, i) => {
		    if (!line.trim()) return null;
		    const parts = line.split(/(`[^`]+`)/g);
		    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { style: { margin: 0, overflowWrap: "anywhere" }, children: parts.map(
		      (part, j) => part.startsWith("`") && part.endsWith("`") && part.length > 2 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: part.slice(1, -1) }, j) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_react8.Fragment, { children: part }, j)
		    ) }, i);
		  }) });
		}
		function SubagentsTab({ snapshot, initialMember, onAction, onJumpToSeq }) {
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const { workers, coordinator, workingWorkers, completedWorkers } = (0, import_react8.useMemo)(() => {
		    const all = Object.values(snapshot.members || {}).filter((m) => m.role !== "monitor");
		    const coord = all.find((m) => m.role === "coordinator" || m.name === "coordinator") ?? null;
		    const wList = all.filter((m) => m !== coord);
		    const working = wList.filter((m) => !m.killed && m.state === "working");
		    const completed = wList.filter((m) => m.killed || m.state !== "working");
		    return { workers: wList, coordinator: coord, workingWorkers: working, completedWorkers: completed };
		  }, [snapshot.members]);
		  const defaultSelected = (0, import_react8.useMemo)(() => {
		    if (initialMember && snapshot.members[initialMember]) return initialMember;
		    return workingWorkers[0]?.name ?? completedWorkers[0]?.name ?? coordinator?.name ?? "";
		  }, [initialMember, snapshot.members, workingWorkers, completedWorkers, coordinator]);
		  const [selectedName, setSelectedName] = (0, import_react8.useState)(() => defaultSelected);
		  const [fullView, setFullView] = (0, import_react8.useState)(false);
		  const [sideOpen, setSideOpen] = (0, import_react8.useState)(true);
		  const [showAllCompleted, setShowAllCompleted] = (0, import_react8.useState)(false);
		  const [expandedGroups, setExpandedGroups] = (0, import_react8.useState)({});
		  const [transcript, setTranscript] = (0, import_react8.useState)(null);
		  const [loading, setLoading] = (0, import_react8.useState)(false);
		  const [error, setError] = (0, import_react8.useState)(null);
		  const [nudgeText, setNudgeText] = (0, import_react8.useState)("");
		  const [sendingNudge, setSendingNudge] = (0, import_react8.useState)(false);
		  (0, import_react8.useEffect)(() => {
		    if (initialMember && snapshot.members[initialMember]) setSelectedName(initialMember);
		  }, [initialMember, snapshot.members]);
		  (0, import_react8.useEffect)(() => {
		    if (!selectedName || !snapshot.members[selectedName]) {
		      if (defaultSelected) setSelectedName(defaultSelected);
		    }
		  }, [selectedName, snapshot.members, defaultSelected]);
		  (0, import_react8.useEffect)(() => {
		    if (!fullView) return;
		    const onKey = (e) => {
		      if (e.key === "Escape") setFullView(false);
		    };
		    window.addEventListener("keydown", onKey);
		    return () => window.removeEventListener("keydown", onKey);
		  }, [fullView]);
		  const selectedMember = selectedName ? snapshot.members[selectedName] ?? null : null;
		  const fetchTrace = (0, import_react8.useCallback)(async (quiet = false) => {
		    if (!selectedName || !snapshot.members[selectedName]) return;
		    if (!quiet) setLoading(true);
		    setError(null);
		    try {
		      const data = await swarmClientStore.fetchMemberTranscript(snapshot.swarm_id, selectedName);
		      setTranscript(data);
		    } catch (err) {
		      setError(err instanceof Error ? err.message : String(err));
		    } finally {
		      if (!quiet) setLoading(false);
		    }
		  }, [snapshot.swarm_id, selectedName, snapshot.members]);
		  (0, import_react8.useEffect)(() => {
		    void fetchTrace(false);
		  }, [selectedName, selectedMember?.steps_count, selectedMember?.activity, fetchTrace]);
		  (0, import_react8.useEffect)(() => {
		    if (!selectedMember || selectedMember.state !== "working") return;
		    const timer = setInterval(() => {
		      void fetchTrace(true);
		    }, 2e3);
		    return () => clearInterval(timer);
		  }, [selectedMember?.name, selectedMember?.state, fetchTrace]);
		  const blocks = (0, import_react8.useMemo)(() => groupTranscriptBlocks(transcript?.steps ?? [], isZh), [transcript?.steps, isZh]);
		  const visibleCompleted = showAllCompleted ? completedWorkers : completedWorkers.slice(0, 6);
		  const hiddenCompletedCount = Math.max(0, completedWorkers.length - 6);
		  const sendNudge = async () => {
		    const text = nudgeText.trim();
		    if (!text || !selectedMember || selectedMember.killed || sendingNudge) return;
		    setSendingNudge(true);
		    try {
		      await onAction({ action: "nudge_worker", swarmId: snapshot.swarm_id, member: selectedMember.name, text });
		      setNudgeText("");
		      void fetchTrace(true);
		    } finally {
		      setSendingNudge(false);
		    }
		  };
		  if (workers.length === 0 && !coordinator) {
		    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "ag-empty", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "ag-empty-card", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "ag-empty-body", children: t("subagents.empty") }) }) });
		  }
		  const displayTitle = selectedMember ? selectedMember.role === "coordinator" ? `@coordinator` : `Swarm Worker (${selectedMember.name})` : t("tab.subagents");
		  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: `ag-sub-wrap${fullView ? " full" : ""}`, "data-testid": "swarm-subagents-view", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "ag-sub-topbar", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { style: { fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: displayTitle }),
		      selectedMember && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		        "span",
		        {
		          style: {
		            fontSize: 11,
		            padding: "1px 7px",
		            borderRadius: 999,
		            background: "var(--ag-fill)",
		            color: selectedMember.state === "working" ? "var(--ag-primary)" : "var(--ag-fg-muted)"
		          },
		          children: selectedMember.killed ? t("members.state.killed") : t(`members.state.${selectedMember.state}`)
		        }
		      ),
		      selectedMember?.model && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { fontSize: 11, fontFamily: "var(--ag-mono)", color: "var(--ag-fg-faint)" }, children: selectedMember.model_display_name || selectedMember.model }),
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "ag-spacer" }),
		      selectedMember?.last_post_seq ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		        "button",
		        {
		          type: "button",
		          className: "ag-ghost-btn",
		          onClick: () => onJumpToSeq(selectedMember.last_post_seq),
		          style: { fontSize: 11, fontFamily: "var(--ag-mono)" },
		          children: [
		            "#",
		            selectedMember.last_post_seq
		          ]
		        }
		      ) : null,
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", className: "ag-ghost-btn", onClick: () => void fetchTrace(false), disabled: loading, children: loading ? t("common.refreshing") : t("common.refresh") }),
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", className: "ag-ghost-btn", onClick: () => setFullView((v) => !v), "data-testid": "swarm-subagent-fullview", children: fullView ? t("subagents.exitFullView") : t("subagents.fullView") }),
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		        "button",
		        {
		          type: "button",
		          className: "ag-icon-btn",
		          "aria-label": "Toggle subagents list",
		          onClick: () => setSideOpen((v) => !v),
		          style: { width: 26, height: 26, fontSize: 13 },
		          children: "\u2630"
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: `ag-sub-layout${sideOpen ? "" : " noside"}`, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "ag-sub-main", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "ag-sub-stream", children: [
		          error && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 12, color: "var(--ag-error)" }, children: error }),
		          selectedMember?.failure && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		            "div",
		            {
		              role: "alert",
		              style: {
		                padding: "8px 10px",
		                borderRadius: 8,
		                fontSize: 12,
		                background: "color-mix(in srgb, var(--ag-error) 10%, transparent)",
		                border: "1px solid color-mix(in srgb, var(--ag-error) 30%, transparent)"
		              },
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("strong", { style: { color: "var(--ag-error)" }, children: [
		                  selectedMember.failure.kind,
		                  ": "
		                ] }),
		                selectedMember.failure.message
		              ]
		            }
		          ),
		          !loading && blocks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { fontSize: 12.5, color: "var(--ag-fg-muted)" }, children: t("drawer.noSteps") }),
		          blocks.map((block) => {
		            if (block.kind === "worked") {
		              const isOpen = Boolean(expandedGroups[block.id]);
		              return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		                  "button",
		                  {
		                    type: "button",
		                    className: "ag-sub-worked",
		                    onClick: () => setExpandedGroups((p) => ({ ...p, [block.id]: !isOpen })),
		                    children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: block.durationLabel }),
		                      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: isOpen ? "\u25BE" : "\u203A" })
		                    ]
		                  }
		                ),
		                isOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginTop: 4, paddingLeft: 10, borderLeft: "2px solid var(--ag-line)" }, children: block.steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { fontSize: 12, background: "var(--ag-fill)", borderRadius: 6, padding: "6px 8px" }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { style: { fontSize: 10.5, textTransform: "uppercase", color: step.status === "error" ? "var(--ag-error)" : "var(--ag-fg-muted)" }, children: step.toolName || step.kind }),
		                    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: step.title }),
		                    step.time && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "ag-ts", children: step.time })
		                  ] }),
		                  step.detail && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { style: { margin: "4px 0 0", fontSize: 11, maxHeight: 140, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }, children: step.detail })
		                ] }, step.index)) })
		              ] }, block.id);
		            }
		            if (block.kind === "user") {
		              const detail = block.step.detail || "";
		              const isOpen = detail.length <= 160 || Boolean(expandedGroups[block.id]);
		              return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { padding: "7px 10px", borderRadius: 8, background: "var(--ag-fill)", fontSize: 12 }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		                  "button",
		                  {
		                    type: "button",
		                    className: "ag-sub-worked",
		                    style: { width: "100%", justifyContent: "space-between", padding: 0 },
		                    onClick: () => setExpandedGroups((p) => ({ ...p, [block.id]: !isOpen })),
		                    children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { fontWeight: 600 }, children: block.step.title }),
		                      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { children: isOpen ? "\u25BE" : "\u203A" })
		                    ]
		                  }
		                ),
		                isOpen && detail && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { marginTop: 4, whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: "var(--ag-fg-2)" }, children: detail })
		              ] }, block.id);
		            }
		            return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { padding: "2px 0" }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(SubagentText, { text: block.step.detail || block.step.title }) }, block.id);
		          }),
		          selectedMember?.state === "working" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ag-fg-muted)", paddingTop: 4 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--ag-success)" } }),
		            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "ag-shimmer", children: selectedMember.activity || (isZh ? "\u6B63\u5728\u6267\u884C\u2026" : "Working\u2026") })
		          ] })
		        ] }),
		        selectedMember && !selectedMember.killed && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--ag-line)", background: "var(--ag-card)" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		            "input",
		            {
		              type: "text",
		              value: nudgeText,
		              disabled: sendingNudge,
		              onChange: (e) => setNudgeText(e.target.value),
		              onKeyDown: (e) => {
		                if (e.key === "Enter" && !sendingNudge) void sendNudge();
		              },
		              placeholder: t("drawer.nudgePlaceholder", { name: selectedMember.name }),
		              style: {
		                flex: 1,
		                minWidth: 0,
		                height: 30,
		                padding: "0 10px",
		                borderRadius: 6,
		                border: "1px solid var(--ag-border)",
		                background: "var(--ag-field)",
		                fontSize: 12
		              }
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", className: "ag-btn sm", disabled: !nudgeText.trim() || sendingNudge, onClick: () => void sendNudge(), style: { height: 30 }, children: sendingNudge ? isZh ? "\u53D1\u9001\u4E2D\u2026" : "Sending\u2026" : t("drawer.nudgeBtn") })
		        ] })
		      ] }),
		      sideOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("aside", { className: "ag-sub-side", "aria-label": t("tab.subagents"), children: [
		        workingWorkers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "ag-sub-sgroup", children: t("subagents.working") }),
		          workingWorkers.map((m) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		            "button",
		            {
		              type: "button",
		              className: `ag-sub-sitem${selectedName === m.name ? " on" : ""}`,
		              onClick: () => setSelectedName(m.name),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "ag-sub-dotgrid", "aria-hidden": "true", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("i", {}),
		                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("i", {}),
		                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("i", {}),
		                  /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("i", {})
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { style: { flex: 1, minWidth: 0 }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { style: { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
		                    "Swarm Worker (",
		                    m.name,
		                    ")"
		                  ] }),
		                  m.activity && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { display: "block", fontSize: 11, color: "var(--ag-fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.activity })
		                ] })
		              ]
		            },
		            m.name
		          ))
		        ] }),
		        completedWorkers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "ag-sub-sgroup", children: t("subagents.completed") }),
		          visibleCompleted.map((m) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		            "button",
		            {
		              type: "button",
		              className: `ag-sub-sitem${selectedName === m.name ? " on" : ""}`,
		              onClick: () => setSelectedName(m.name),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { width: 12, textAlign: "center", color: m.failure ? "var(--ag-error)" : "var(--ag-fg-muted)", flex: "none" }, children: m.failure ? "!" : "\u2713" }),
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: [
		                  "Swarm Worker (",
		                  m.name,
		                  ")"
		                ] })
		              ]
		            },
		            m.name
		          )),
		          hiddenCompletedCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
		            "button",
		            {
		              type: "button",
		              className: "ag-ghost-btn",
		              onClick: () => setShowAllCompleted((v) => !v),
		              style: { width: "100%", textAlign: "left", padding: "4px 8px", fontSize: 11.5 },
		              children: showAllCompleted ? t("subagents.showLess") : t("subagents.showMore", { count: hiddenCompletedCount })
		            }
		          )
		        ] }),
		        coordinator && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--ag-line)" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "ag-sub-sgroup", children: t("members.coordinator") }),
		          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
		            "button",
		            {
		              type: "button",
		              className: `ag-sub-sitem${selectedName === coordinator.name ? " on" : ""}`,
		              onClick: () => setSelectedName(coordinator.name),
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { width: 12, textAlign: "center", color: coordinator.state === "working" ? "var(--ag-success)" : "var(--ag-fg-muted)" }, children: "\u25CF" }),
		                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: "@coordinator" })
		              ]
		            }
		          )
		        ] })
		      ] })
		    ] })
		  ] });
		}
		
		// client/components/GraphTab.tsx
		var import_react11 = require("react");
		
		// client/gif-encoder.ts
		var HASH_SIZE = 5003;
		var ByteWriter = class {
		  constructor(cap = 65536) {
		    __publicField(this, "buf");
		    __publicField(this, "len", 0);
		    this.buf = new Uint8Array(cap);
		  }
		  ensure(n) {
		    if (this.len + n <= this.buf.length) return;
		    let next = this.buf.length;
		    while (next < this.len + n) next *= 2;
		    const grown = new Uint8Array(next);
		    grown.set(this.buf.subarray(0, this.len));
		    this.buf = grown;
		  }
		  u8(v) {
		    this.ensure(1);
		    this.buf[this.len++] = v & 255;
		  }
		  u16(v) {
		    this.ensure(2);
		    this.buf[this.len++] = v & 255;
		    this.buf[this.len++] = v >> 8 & 255;
		  }
		  ascii(s) {
		    this.ensure(s.length);
		    for (let i = 0; i < s.length; i++) {
		      this.buf[this.len++] = s.charCodeAt(i) & 255;
		    }
		  }
		  bytes(arr) {
		    this.ensure(arr.length);
		    this.buf.set(arr, this.len);
		    this.len += arr.length;
		  }
		  finish() {
		    return this.buf.slice(0, this.len);
		  }
		};
		function quantizeFrames(rgbaFrames, options = {}) {
		  const maxColors = options.maxColors ?? 255;
		  const reserveTransparent = options.reserveTransparent ?? true;
		  const limit = Math.max(2, Math.min(reserveTransparent ? 255 : 256, maxColors | 0));
		  const exact = /* @__PURE__ */ new Map();
		  let overflow = false;
		  for (let f = 0; f < rgbaFrames.length && !overflow; f++) {
		    const data = rgbaFrames[f];
		    let lastRgb = -1;
		    for (let i = 0; i < data.length; i += 4) {
		      const rgb = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
		      if (rgb === lastRgb) continue;
		      lastRgb = rgb;
		      if (!exact.has(rgb)) {
		        if (exact.size >= limit) {
		          overflow = true;
		          break;
		        }
		        exact.set(rgb, exact.size);
		      }
		    }
		  }
		  if (!overflow) {
		    const count2 = Math.max(1, exact.size);
		    const needed2 = count2 + (reserveTransparent ? 1 : 0);
		    const colorBits2 = Math.max(1, Math.min(8, Math.ceil(Math.log2(Math.max(2, needed2)))));
		    const tableSize2 = 1 << colorBits2;
		    const palette2 = new Uint8Array(tableSize2 * 3);
		    for (const [rgb, idx] of exact) {
		      palette2[idx * 3] = rgb >> 16 & 255;
		      palette2[idx * 3 + 1] = rgb >> 8 & 255;
		      palette2[idx * 3 + 2] = rgb & 255;
		    }
		    const transparentIndex2 = reserveTransparent ? count2 : -1;
		    const nearestExact = (r, g, b) => {
		      let best = 0;
		      let bestDist = Infinity;
		      for (let i = 0; i < count2; i++) {
		        const dr = r - palette2[i * 3];
		        const dg = g - palette2[i * 3 + 1];
		        const db = b - palette2[i * 3 + 2];
		        const d = dr * dr + dg * dg + db * db;
		        if (d < bestDist) {
		          bestDist = d;
		          best = i;
		          if (d === 0) break;
		        }
		      }
		      return best;
		    };
		    const mapFrame2 = (rgba, out) => {
		      let lastRgb = -1;
		      let lastIdx = 0;
		      for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
		        const r = rgba[i];
		        const g = rgba[i + 1];
		        const b = rgba[i + 2];
		        const rgb = r << 16 | g << 8 | b;
		        if (rgb !== lastRgb) {
		          lastRgb = rgb;
		          let idx = exact.get(rgb);
		          if (idx === void 0) {
		            idx = nearestExact(r, g, b);
		            exact.set(rgb, idx);
		          }
		          lastIdx = idx;
		        }
		        out[p] = lastIdx;
		      }
		    };
		    return { palette: palette2, colorBits: colorBits2, tableSize: tableSize2, transparentIndex: transparentIndex2, mapFrame: mapFrame2 };
		  }
		  const counts = new Uint32Array(32768);
		  const sumR = new Float64Array(32768);
		  const sumG = new Float64Array(32768);
		  const sumB = new Float64Array(32768);
		  let totalPixels = 0;
		  for (let f = 0; f < rgbaFrames.length; f++) totalPixels += rgbaFrames[f].length >>> 2;
		  const stride = Math.max(1, Math.floor(totalPixels / 4e6));
		  const byteStep = stride * 4;
		  for (let f = 0; f < rgbaFrames.length; f++) {
		    const data = rgbaFrames[f];
		    const offset = f % stride * 4;
		    for (let i = offset; i < data.length; i += byteStep) {
		      const r = data[i];
		      const g = data[i + 1];
		      const b = data[i + 2];
		      const q = r >> 3 << 10 | g >> 3 << 5 | b >> 3;
		      counts[q]++;
		      sumR[q] += r;
		      sumG[q] += g;
		      sumB[q] += b;
		    }
		  }
		  const buckets = [];
		  for (let q = 0; q < 32768; q++) {
		    const c = counts[q];
		    if (!c) continue;
		    buckets.push({
		      r: q >> 10 & 31,
		      g: q >> 5 & 31,
		      b: q & 31,
		      c,
		      sr: sumR[q],
		      sg: sumG[q],
		      sb: sumB[q]
		    });
		  }
		  const makeBox = (items) => {
		    let rMin = 31, rMax = 0, gMin = 31, gMax = 0, bMin = 31, bMax = 0, total = 0;
		    for (let i = 0; i < items.length; i++) {
		      const it = items[i];
		      if (it.r < rMin) rMin = it.r;
		      if (it.r > rMax) rMax = it.r;
		      if (it.g < gMin) gMin = it.g;
		      if (it.g > gMax) gMax = it.g;
		      if (it.b < bMin) bMin = it.b;
		      if (it.b > bMax) bMax = it.b;
		      total += it.c;
		    }
		    const rRange = rMax - rMin;
		    const gRange = gMax - gMin;
		    const bRange = bMax - bMin;
		    const span = Math.max(rRange, gRange, bRange);
		    const axis = span === rRange ? "r" : span === gRange ? "g" : "b";
		    return { items, total, axis, score: items.length > 1 ? span * Math.sqrt(total) : -1 };
		  };
		  const boxes = buckets.length ? [makeBox(buckets)] : [];
		  while (boxes.length < limit) {
		    let bestIdx = -1;
		    let bestScore = 0;
		    for (let i = 0; i < boxes.length; i++) {
		      if (boxes[i].score > bestScore) {
		        bestScore = boxes[i].score;
		        bestIdx = i;
		      }
		    }
		    if (bestIdx < 0) break;
		    const box = boxes[bestIdx];
		    const axis = box.axis;
		    box.items.sort((a, b) => a[axis] - b[axis]);
		    const half = box.total / 2;
		    let acc = 0;
		    let split = 1;
		    for (let i = 0; i < box.items.length - 1; i++) {
		      acc += box.items[i].c;
		      if (acc >= half) {
		        split = i + 1;
		        break;
		      }
		    }
		    boxes[bestIdx] = makeBox(box.items.slice(0, split));
		    boxes.push(makeBox(box.items.slice(split)));
		  }
		  const count = Math.max(1, boxes.length);
		  const needed = count + (reserveTransparent ? 1 : 0);
		  const colorBits = Math.max(1, Math.min(8, Math.ceil(Math.log2(Math.max(2, needed)))));
		  const tableSize = 1 << colorBits;
		  const palette = new Uint8Array(tableSize * 3);
		  for (let i = 0; i < boxes.length; i++) {
		    const items = boxes[i].items;
		    let sr = 0, sg = 0, sb = 0, sc = 0;
		    for (let j = 0; j < items.length; j++) {
		      sr += items[j].sr;
		      sg += items[j].sg;
		      sb += items[j].sb;
		      sc += items[j].c;
		    }
		    palette[i * 3] = Math.round(sr / sc);
		    palette[i * 3 + 1] = Math.round(sg / sc);
		    palette[i * 3 + 2] = Math.round(sb / sc);
		  }
		  const transparentIndex = reserveTransparent ? count : -1;
		  const lut = new Int16Array(32768).fill(-1);
		  const nearest = (r, g, b) => {
		    let best = 0;
		    let bestDist = Infinity;
		    for (let i = 0; i < count; i++) {
		      const dr = r - palette[i * 3];
		      const dg = g - palette[i * 3 + 1];
		      const db = b - palette[i * 3 + 2];
		      const d = dr * dr + dg * dg + db * db;
		      if (d < bestDist) {
		        bestDist = d;
		        best = i;
		        if (d === 0) break;
		      }
		    }
		    return best;
		  };
		  const mapFrame = (rgba, out) => {
		    let lastQ = -1;
		    let lastIdx = 0;
		    for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
		      const r = rgba[i];
		      const g = rgba[i + 1];
		      const b = rgba[i + 2];
		      const q = r >> 3 << 10 | g >> 3 << 5 | b >> 3;
		      if (q !== lastQ) {
		        lastQ = q;
		        let idx = lut[q];
		        if (idx < 0) {
		          const c = counts[q];
		          idx = c > 0 ? nearest(sumR[q] / c, sumG[q] / c, sumB[q] / c) : nearest((q >> 10) * 8 + 4, (q >> 5 & 31) * 8 + 4, (q & 31) * 8 + 4);
		          lut[q] = idx;
		        }
		        lastIdx = idx;
		      }
		      out[p] = lastIdx;
		    }
		  };
		  return { palette, colorBits, tableSize, transparentIndex, mapFrame };
		}
		function writeLzw(writer, indices, minCodeSize, hashKeys, hashVals) {
		  const lzwMin = Math.max(2, minCodeSize);
		  writer.u8(lzwMin);
		  const clearCode = 1 << lzwMin;
		  const eoiCode = clearCode + 1;
		  let nextCode = eoiCode + 1;
		  let codeSize = lzwMin + 1;
		  let maxForSize = 1 << codeSize;
		  hashKeys.fill(-1);
		  const sub = new Uint8Array(255);
		  let subLen = 0;
		  let bitBuf = 0;
		  let bitCount = 0;
		  const flushSub = () => {
		    if (subLen === 0) return;
		    writer.u8(subLen);
		    writer.bytes(sub.subarray(0, subLen));
		    subLen = 0;
		  };
		  const emit = (code, bits) => {
		    bitBuf |= code << bitCount;
		    bitCount += bits;
		    while (bitCount >= 8) {
		      sub[subLen++] = bitBuf & 255;
		      if (subLen === 255) flushSub();
		      bitBuf >>>= 8;
		      bitCount -= 8;
		    }
		  };
		  emit(clearCode, codeSize);
		  if (indices.length > 0) {
		    let prefix = indices[0];
		    for (let i = 1; i < indices.length; i++) {
		      const k = indices[i];
		      const key = prefix << 8 | k;
		      let h = (Math.imul(key, 2654435761) >>> 0) % HASH_SIZE;
		      let found = -1;
		      while (hashKeys[h] !== -1) {
		        if (hashKeys[h] === key) {
		          found = hashVals[h];
		          break;
		        }
		        h = h + 1 === HASH_SIZE ? 0 : h + 1;
		      }
		      if (found >= 0) {
		        prefix = found;
		      } else {
		        emit(prefix, codeSize);
		        if (nextCode < 4096) {
		          if (nextCode === maxForSize && codeSize < 12) {
		            codeSize++;
		            maxForSize = 1 << codeSize;
		          }
		          hashKeys[h] = key;
		          hashVals[h] = nextCode++;
		        } else {
		          emit(clearCode, codeSize);
		          hashKeys.fill(-1);
		          nextCode = eoiCode + 1;
		          codeSize = lzwMin + 1;
		          maxForSize = 1 << codeSize;
		        }
		        prefix = k;
		      }
		    }
		    emit(prefix, codeSize);
		    if (nextCode === maxForSize && codeSize < 12) {
		      codeSize++;
		    }
		  }
		  emit(eoiCode, codeSize);
		  if (bitCount > 0) {
		    sub[subLen++] = bitBuf & 255;
		  }
		  flushSub();
		  writer.u8(0);
		}
		function createGifEncoder({
		  width,
		  height,
		  sampleFrames,
		  repeat = 0,
		  maxColors = 255,
		  useDelta = true
		}) {
		  if (!Number.isInteger(width) || width <= 0 || width > 65535) {
		    throw new RangeError(`invalid GIF width: ${width}`);
		  }
		  if (!Number.isInteger(height) || height <= 0 || height > 65535) {
		    throw new RangeError(`invalid GIF height: ${height}`);
		  }
		  if (!Array.isArray(sampleFrames) || sampleFrames.length === 0) {
		    throw new RangeError("GIF requires at least one sample frame");
		  }
		  const pixelCount = width * height;
		  const expectedBytes = pixelCount * 4;
		  for (let i = 0; i < sampleFrames.length; i++) {
		    if (!sampleFrames[i] || sampleFrames[i].length !== expectedBytes) {
		      throw new RangeError(`sample frame ${i} RGBA length mismatch`);
		    }
		  }
		  const { palette, colorBits, transparentIndex, mapFrame } = quantizeFrames(sampleFrames, {
		    maxColors,
		    reserveTransparent: useDelta
		  });
		  const out = new ByteWriter(Math.max(16384, pixelCount));
		  out.ascii("GIF89a");
		  out.u16(width);
		  out.u16(height);
		  out.u8(128 | colorBits - 1 << 4 | colorBits - 1);
		  out.u8(0);
		  out.u8(0);
		  out.bytes(palette);
		  if (repeat >= 0) {
		    out.u8(33);
		    out.u8(255);
		    out.u8(11);
		    out.ascii("NETSCAPE2.0");
		    out.u8(3);
		    out.u8(1);
		    out.u16(repeat & 65535);
		    out.u8(0);
		  }
		  const cur = new Uint8Array(pixelCount);
		  const prev = new Uint8Array(pixelCount);
		  const hashKeys = new Int32Array(HASH_SIZE);
		  const hashVals = new Uint16Array(HASH_SIZE);
		  let subBuf = null;
		  let frameIndex = 0;
		  let finished = false;
		  const addFrame = (rgba, delayMs = 100) => {
		    if (finished) throw new Error("GIF encoder already finished");
		    if (!rgba || rgba.length !== expectedBytes) {
		      throw new RangeError(`frame ${frameIndex} RGBA length mismatch`);
		    }
		    mapFrame(rgba, cur);
		    const delayCs = Math.max(2, Math.min(65535, Math.round((delayMs || 100) / 10)));
		    let left = 0;
		    let top = 0;
		    let fw = width;
		    let fh = height;
		    let pixels = cur;
		    let hasTrans = false;
		    if (frameIndex === 0 || transparentIndex < 0) {
		      prev.set(cur);
		    } else {
		      let minX = width;
		      let minY = height;
		      let maxX = -1;
		      let maxY = -1;
		      for (let y = 0, p = 0; y < height; y++) {
		        for (let x = 0; x < width; x++, p++) {
		          if (cur[p] !== prev[p]) {
		            if (x < minX) minX = x;
		            if (x > maxX) maxX = x;
		            if (y < minY) minY = y;
		            if (y > maxY) maxY = y;
		          }
		        }
		      }
		      hasTrans = true;
		      if (maxX < minX) {
		        left = 0;
		        top = 0;
		        fw = 1;
		        fh = 1;
		        pixels = new Uint8Array([transparentIndex]);
		      } else {
		        left = minX;
		        top = minY;
		        fw = maxX - minX + 1;
		        fh = maxY - minY + 1;
		        const need = fw * fh;
		        if (!subBuf || subBuf.length < need) subBuf = new Uint8Array(need);
		        let q = 0;
		        for (let y = minY; y <= maxY; y++) {
		          let p = y * width + minX;
		          for (let x = minX; x <= maxX; x++, p++, q++) {
		            if (cur[p] === prev[p]) {
		              subBuf[q] = transparentIndex;
		            } else {
		              subBuf[q] = cur[p];
		              prev[p] = cur[p];
		            }
		          }
		        }
		        pixels = subBuf.subarray(0, need);
		      }
		    }
		    out.u8(33);
		    out.u8(249);
		    out.u8(4);
		    out.u8(1 << 2 | (hasTrans ? 1 : 0));
		    out.u16(delayCs);
		    out.u8(hasTrans ? transparentIndex : 0);
		    out.u8(0);
		    out.u8(44);
		    out.u16(left);
		    out.u16(top);
		    out.u16(fw);
		    out.u16(fh);
		    out.u8(0);
		    writeLzw(out, pixels, colorBits, hashKeys, hashVals);
		    frameIndex++;
		  };
		  const finish = () => {
		    if (finished) throw new Error("GIF encoder already finished");
		    if (frameIndex === 0) throw new RangeError("GIF requires at least one frame");
		    finished = true;
		    out.u8(59);
		    return out.finish();
		  };
		  return { addFrame, finish };
		}
		
		// client/components/HiveCanvas.tsx
		var import_react9 = require("react");
		var import_jsx_runtime6 = require("react/jsx-runtime");
		var HV_RING = [
		  [0, -1],
		  [1, -1],
		  [1, 0],
		  [0, 1],
		  [-1, 1],
		  [-1, 0]
		];
		var HV_FEW = {
		  1: [0],
		  2: [5, 1],
		  3: [0, 2, 4],
		  4: [5, 1, 4, 2],
		  5: [5, 0, 1, 4, 2]
		};
		var HV_ASK = /\?|could you|can you|please|ping me|waiting on/i;
		var HV_BUSY_MS = 45 * 60 * 1e3;
		var HV_ASK_MS = 6 * 3600 * 1e3;
		function hiveSlots(n) {
		  if (n < 1) return [];
		  if (n < 6) return HV_FEW[n].map((k) => HV_RING[k]);
		  const out = [];
		  const dirs = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
		  for (let k = 1; out.length < n; k++) {
		    let q = 0;
		    let r = -k;
		    for (const [dq, dr] of dirs) {
		      for (let j = 0; j < k; j++) {
		        out.push([q, r]);
		        q += dq;
		        r += dr;
		      }
		    }
		  }
		  return out.slice(0, n);
		}
		function hexPath(x, y, r, a0) {
		  let d = "";
		  for (let k = 0; k < 6; k++) {
		    const a = (a0 + 60 * k) * Math.PI / 180;
		    d += (k ? "L" : "M") + (x + r * Math.cos(a)).toFixed(1) + " " + (y + r * Math.sin(a)).toFixed(1);
		  }
		  return `${d}Z`;
		}
		function wrapTitle(text, max) {
		  const out = [];
		  let cur = "";
		  for (const w of String(text).split(" ")) {
		    if (cur && (cur + " " + w).length > max) {
		      out.push(cur);
		      cur = w;
		    } else {
		      cur = (cur + " " + w).trim();
		    }
		  }
		  if (cur) out.push(cur);
		  if (out.length > 2) {
		    out.length = 2;
		    out[1] = out[1].replace(/.$/, "\u2026");
		  }
		  return out;
		}
		function clipText(text, max) {
		  const s = String(text);
		  return s.length > max ? s.slice(0, Math.max(1, max - 1)).trimEnd() + "\u2026" : s;
		}
		function computeHiveStates(snapshot, messages, replaySeq) {
		  const members = snapshot.members || {};
		  const names = Object.keys(members).filter((n) => members[n]?.role !== "monitor");
		  const out = {};
		  if (replaySeq === null) {
		    const doneTaskOwners = /* @__PURE__ */ new Set();
		    const openTaskOwners = /* @__PURE__ */ new Set();
		    for (const th of snapshot.threads || []) {
		      for (const t2 of th.tasks || []) {
		        if (t2.done) doneTaskOwners.add(t2.name);
		        else openTaskOwners.add(t2.name);
		      }
		    }
		    for (const n of names) {
		      const m = members[n];
		      let st = "idle";
		      let who = null;
		      if (m.killed || m.state === "killed") st = "retired";
		      else if (m.failure) st = "issue";
		      else if (m.state === "working") st = "working";
		      else if (m.waiting_on && m.waiting_on.length > 0) {
		        st = "wait";
		        who = m.waiting_on[0];
		      } else if (n !== "coordinator" && doneTaskOwners.has(n) && !openTaskOwners.has(n)) {
		        st = "done";
		      }
		      out[n] = { st, who };
		    }
		    const coordAttention = (snapshot.systemAttention || []).some(
		      (a) => a.member === "coordinator" || a.kind === "stall"
		    );
		    if (coordAttention && out.coordinator && out.coordinator.st !== "retired") {
		      out.coordinator = { st: "needs", who: null };
		    }
		    const lp = messages.length > 0 ? messages[messages.length - 1] : null;
		    const freshBeam = lp && Date.now() - (lp.ts || Date.parse(lp.time) || 0) < 9e4 ? lp : null;
		    return { st: out, doneCheck: null, beam: freshBeam };
		  }
		  let idx = -1;
		  while (idx + 1 < messages.length && messages[idx + 1].seq <= replaySeq) idx++;
		  const fin = {};
		  const lastPost = {};
		  const lastIn = {};
		  const born = { coordinator: true };
		  const tms = (k) => messages[k]?.ts || Date.parse(messages[k]?.time || "") || 0;
		  messages.forEach((p, k) => {
		    fin[p.agent] = k;
		  });
		  const targetsOfMsg = (p) => p.is_all ? [] : (p.mentions || []).filter((n) => n !== p.agent && members[n]?.role !== "monitor");
		  for (let k = 0; k <= idx; k++) {
		    const p = messages[k];
		    born[p.agent] = true;
		    lastPost[p.agent] = k;
		    for (const target of targetsOfMsg(p)) {
		      born[target] = true;
		      lastIn[target] = k;
		    }
		  }
		  const now = idx >= 0 ? tms(idx) : 0;
		  for (const n of names) {
		    const m = members[n];
		    const lp = lastPost[n] ?? -1;
		    const li = lastIn[n] ?? -1;
		    let st = "idle";
		    let who = null;
		    if (!born[n]) {
		      st = "unborn";
		    } else if (m.killed && (fin[n] != null ? idx >= fin[n] && (idx > fin[n] + 8 || now - tms(fin[n]) > HV_BUSY_MS) : idx > li + 8)) {
		      st = "retired";
		    } else if (li > lp && now - tms(li) < HV_BUSY_MS) {
		      st = "working";
		      who = messages[li].agent;
		    } else if (lp >= 0 && HV_ASK.test(messages[lp].text) && targetsOfMsg(messages[lp]).length > 0 && now - tms(lp) < HV_ASK_MS && (lastPost[targetsOfMsg(messages[lp])[0]] ?? -1) <= lp) {
		      st = "wait";
		      who = targetsOfMsg(messages[lp])[0];
		    } else if (lp >= 0 && fin[n] <= idx && n !== "coordinator") {
		      st = "done";
		    } else if (lp >= 0 && idx - lp < 3 && now - tms(lp) < 4 * 60 * 1e3) {
		      st = "working";
		    }
		    out[n] = { st, who: who === n ? null : who };
		  }
		  return {
		    st: out,
		    doneCheck: (n) => Boolean(out[n] && (out[n].st === "retired" || fin[n] != null && fin[n] <= idx)),
		    beam: idx >= 0 ? messages[idx] : null
		  };
		}
		function buildHiveCells(snapshot, st, doneCheck, isZh) {
		  const members = snapshot.members || {};
		  const workers = Object.keys(members).filter(
		    (n) => members[n]?.role !== "monitor" && n !== "coordinator" && Boolean(st[n])
		  );
		  const settled = (n) => st[n]?.st === "done" || st[n]?.st === "retired";
		  const cells = [];
		  const threads = snapshot.threads || [];
		  if (threads.length > 0) {
		    const homed = /* @__PURE__ */ new Set();
		    for (const th of threads) {
		      const taskNames = (th.tasks || []).map((t2) => t2.name).filter((n) => n !== "coordinator" && Boolean(st[n]));
		      const uniqueBees = [...new Set(taskNames)];
		      const total = th.tasks.length;
		      const done = doneCheck ? th.tasks.filter((t2) => t2.name === "coordinator" || doneCheck(t2.name)).length : th.progress.done;
		      cells.push({
		        id: th.id,
		        title: th.title,
		        goal: th.goal || "",
		        bees: [],
		        total,
		        done
		      });
		      for (const b of uniqueBees) {
		        if (!homed.has(b)) {
		          cells[cells.length - 1].bees.push(b);
		          homed.add(b);
		        }
		      }
		    }
		    const rest = workers.filter((n) => !homed.has(n));
		    if (rest.length > 0) {
		      cells.push({
		        id: "_other",
		        title: isZh ? "\u5176\u4ED6\u6210\u5458" : "Other",
		        goal: "",
		        bees: rest,
		        total: rest.length,
		        done: rest.filter(settled).length
		      });
		    }
		  } else {
		    const buckets = [
		      ["_working", t("members.state.working"), (n) => st[n]?.st === "working", false],
		      ["_waiting", t("members.state.waiting"), (n) => st[n]?.st === "wait" || st[n]?.st === "issue", false],
		      ["_resting", isZh ? "\u4F11\u7720\u4E2D" : "Resting", (n) => st[n]?.st === "idle", false],
		      ["_done", isZh ? "\u5DF2\u5B8C\u6210" : "Done", settled, true]
		    ];
		    for (const [id, title, pick, isDone] of buckets) {
		      const bees = workers.filter(pick);
		      if (bees.length > 0) {
		        cells.push({
		          id,
		          title,
		          goal: "",
		          bees,
		          total: bees.length,
		          done: isDone ? bees.length : 0,
		          count: bees.length
		        });
		      }
		    }
		  }
		  return cells.slice(0, 400);
		}
		function statusText(s, isZh) {
		  if (!s) return "";
		  switch (s.st) {
		    case "working":
		      return s.who ? isZh ? `\u534F\u52A9 @${s.who} \u5DE5\u4F5C\u4E2D` : `Working for @${s.who}` : t("members.state.working");
		    case "wait":
		      return s.who ? t("members.waitingOn", { target: s.who }) : t("members.state.waiting");
		    case "needs":
		      return isZh ? "\u9700\u8981\u5173\u6CE8" : "Needs attention";
		    case "issue":
		      return isZh ? "\u5F02\u5E38 / \u5361\u4F4F" : "Issue / Stuck";
		    case "done":
		      return isZh ? "\u5DF2\u5B8C\u6210" : "Done";
		    case "idle":
		      return isZh ? "\u4F11\u7720\u4E2D" : "Resting";
		    case "retired":
		      return t("members.state.killed");
		    case "unborn":
		      return isZh ? "\u672A\u542F\u52A8" : "Not started";
		  }
		}
		function HiveCanvas(props) {
		  const { snapshot, messages, replaySeq, onJumpToSeq } = props;
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const rootRef = (0, import_react9.useRef)(null);
		  const viewRef = (0, import_react9.useRef)(null);
		  const svgRef = (0, import_react9.useRef)(null);
		  const [paneW, setPaneW] = (0, import_react9.useState)(640);
		  const [zoom, setZoom] = (0, import_react9.useState)(1);
		  const [selectedCellId, setSelectedCellId] = (0, import_react9.useState)(null);
		  const [panning, setPanning] = (0, import_react9.useState)(false);
		  const draggedRef = (0, import_react9.useRef)(false);
		  const lastBeamSeqRef = (0, import_react9.useRef)(null);
		  (0, import_react9.useEffect)(() => {
		    const el = rootRef.current;
		    if (!el || typeof ResizeObserver === "undefined") return;
		    const measure = () => {
		      const w = Math.floor(el.clientWidth);
		      if (w >= 40) setPaneW(w);
		    };
		    measure();
		    const ro = new ResizeObserver(measure);
		    ro.observe(el);
		    return () => ro.disconnect();
		  }, []);
		  (0, import_react9.useEffect)(() => {
		    const onKeyDown = (e) => {
		      if (e.key === "Escape" && selectedCellId) setSelectedCellId(null);
		    };
		    window.addEventListener("keydown", onKeyDown);
		    return () => window.removeEventListener("keydown", onKeyDown);
		  }, [selectedCellId]);
		  const hs = (0, import_react9.useMemo)(() => computeHiveStates(snapshot, messages, replaySeq), [snapshot, messages, replaySeq]);
		  const cells = (0, import_react9.useMemo)(() => buildHiveCells(snapshot, hs.st, hs.doneCheck, isZh), [snapshot, hs, isZh]);
		  const slots = (0, import_react9.useMemo)(() => hiveSlots(cells.length), [cells.length]);
		  const selCell = (0, import_react9.useMemo)(() => cells.find((c) => c.id === selectedCellId) ?? null, [cells, selectedCellId]);
		  const K = Math.sqrt(3) / 2;
		  const ux = (q) => 1.5 * q;
		  const uy = (q, r) => 2 * K * (r + q / 2);
		  const geometry = (0, import_react9.useMemo)(() => {
		    const xs = [0, ...slots.map(([q]) => ux(q))];
		    const ys = [0, ...slots.map(([q, r]) => uy(q, r))];
		    const spanX = Math.max(...xs) - Math.min(...xs) + 2;
		    const spanY = Math.max(...ys) - Math.min(...ys) + 2 * K;
		    const fit = (paneW - 8) / spanX;
		    const gap = fit < 44 ? 3 : 7;
		    const Rfit = Math.max(12, Math.min(108, fit - gap / 2));
		    const zmax2 = Math.max(1, 108 / Rfit);
		    const clampedZoom2 = Math.max(1, Math.min(zmax2, zoom));
		    const R2 = Math.min(108, Rfit * clampedZoom2);
		    const G2 = R2 + gap / 2;
		    const mode2 = R2 >= 76 ? "full" : R2 >= 40 ? "mid" : "tiny";
		    const CW2 = Math.max(paneW, Math.ceil(spanX * G2 + 8));
		    const ox2 = CW2 / 2 - (Math.max(...xs) + Math.min(...xs)) / 2 * G2;
		    const oy2 = 4 + K * R2 - Math.min(...ys) * G2;
		    const H2 = Math.ceil(spanY * G2 + 8);
		    const fitH2 = Math.ceil(spanY * (Rfit + gap / 2) + 8);
		    return { R: R2, Rfit, G: G2, mode: mode2, CW: CW2, H: H2, ox: ox2, oy: oy2, zmax: zmax2, clampedZoom: clampedZoom2, fitH: fitH2, names: R2 >= 92 };
		  }, [slots, paneW, zoom]);
		  const { R, G, mode, CW, H, ox, oy, zmax, clampedZoom, fitH, names } = geometry;
		  const zoomed = clampedZoom > 1.001;
		  (0, import_react9.useEffect)(() => {
		    const view = viewRef.current;
		    if (!view) return;
		    const onWheel = (e) => {
		      if (!e.ctrlKey && !e.metaKey) return;
		      e.preventDefault();
		      setZoom((prev) => Math.max(1, Math.min(zmax, prev * Math.exp(-e.deltaY * 0.01))));
		    };
		    view.addEventListener("wheel", onWheel, { passive: false });
		    return () => view.removeEventListener("wheel", onWheel);
		  }, [zmax]);
		  const onPointerDown = (e) => {
		    const view = viewRef.current;
		    if (e.button !== 0 || !zoomed || !view) return;
		    const x0 = e.clientX;
		    const y0 = e.clientY;
		    const sl = view.scrollLeft;
		    const st = view.scrollTop;
		    let moved = false;
		    const onMove = (ev) => {
		      const dx = ev.clientX - x0;
		      const dy = ev.clientY - y0;
		      if (!moved && Math.hypot(dx, dy) < 5) return;
		      moved = true;
		      setPanning(true);
		      view.scrollLeft = sl - dx;
		      view.scrollTop = st - dy;
		    };
		    const onUp = () => {
		      window.removeEventListener("pointermove", onMove);
		      window.removeEventListener("pointerup", onUp);
		      window.removeEventListener("pointercancel", onUp);
		      setPanning(false);
		      if (moved) {
		        draggedRef.current = true;
		        setTimeout(() => {
		          draggedRef.current = false;
		        }, 0);
		      }
		    };
		    window.addEventListener("pointermove", onMove);
		    window.addEventListener("pointerup", onUp);
		    window.addEventListener("pointercancel", onUp);
		  };
		  const layoutData = (0, import_react9.useMemo)(() => {
		    const pos = {};
		    const tucked = /* @__PURE__ */ new Set();
		    const cellDraw = [];
		    const aggOf = (c) => {
		      const sts = c.bees.map((n) => hs.st[n]?.st);
		      if (sts.includes("issue")) return "bad";
		      if (sts.includes("wait")) return "warn";
		      if (sts.includes("working")) return "busy";
		      return "";
		    };
		    if (mode === "full") pos.coordinator = { x: ox, y: oy - R * 0.12, size: "q" };
		    else if (mode === "mid") pos.coordinator = { x: ox, y: oy - 6, size: "m" };
		    else pos.coordinator = { x: ox, y: oy, size: R >= 26 ? "m" : "xs" };
		    cells.forEach((c, k) => {
		      const [q, r] = slots[k];
		      const x = ox + ux(q) * G;
		      const y = oy + uy(q, r) * G;
		      const ratio = c.total > 0 ? Math.min(1, c.done / c.total) : 0;
		      const agg = aggOf(c);
		      const rankMap = { issue: 0, wait: 1, working: 2 };
		      const rank = (n) => rankMap[hs.st[n]?.st ?? "idle"] ?? 3;
		      const born = c.bees.filter((n) => hs.st[n]?.st !== "unborn").sort((a, b) => rank(a) - rank(b));
		      for (const n of c.bees) {
		        if (!born.includes(n)) pos[n] = { x, y, size: "xs" };
		      }
		      let lines = [];
		      let extraCount = 0;
		      let extraPos;
		      if (mode === "tiny") {
		        const pick = R >= 18 ? c.bees.find((n) => hs.st[n]?.st === "issue") || c.bees.find((n) => hs.st[n]?.st === "wait") || c.bees.find((n) => hs.st[n]?.st === "working") : void 0;
		        for (const n of c.bees) {
		          if (n === pick) pos[n] = { x, y, size: "xs" };
		          else {
		            pos[n] = { x, y, size: "xs", cell: true };
		            tucked.add(n);
		          }
		        }
		      } else if (mode === "mid") {
		        lines = [clipText(c.title, Math.floor((R + 8) / 6.2))];
		        const show = born.length > 3 ? born.slice(0, 2) : born;
		        const by = y + R * 0.34;
		        show.forEach((n, j) => {
		          const span = show.length - 1 + (show.length < born.length ? 1 : 0);
		          pos[n] = { x: x + (j - span / 2) * 24, y: by, size: "xs" };
		        });
		        if (show.length < born.length) {
		          extraCount = born.length - show.length;
		          extraPos = { x: x + 24, y: by + 4 };
		          for (const n of born.slice(show.length)) {
		            pos[n] = { x: x + 24, y: by, size: "xs" };
		            tucked.add(n);
		          }
		        }
		      } else {
		        lines = wrapTitle(c.title, names ? 15 : 12);
		        const ty = y - K * R + (lines.length > 1 ? 20 : 26);
		        const per = Math.max(2, Math.min(3, Math.floor(1.6 * R / 50)));
		        const cap = per * 2;
		        const show = born.length > cap ? born.slice(0, cap - 1) : born;
		        const sw = Math.min(58, 1.66 * R / per);
		        const rows = show.length > per ? [show.slice(0, per), show.slice(per)] : [show];
		        const rg = names ? 54 : 40;
		        const top = ty + lines.length * 14 + 8;
		        const bot = y + K * R - (names ? 16 : 6);
		        const y0 = (top + bot) / 2 - (rows.length - 1) * rg / 2 - (names ? 6 : 0);
		        rows.forEach((rw, ri) => {
		          rw.forEach((n, j) => {
		            pos[n] = { x: x + (j - (rw.length - 1) / 2) * sw, y: y0 + ri * rg, size: "m" };
		          });
		        });
		        if (show.length < born.length) {
		          const lr = rows[rows.length - 1];
		          const px = x + (lr.length + 1) / 2 * sw - sw / 2 + 4;
		          const py = y0 + (rows.length - 1) * rg;
		          extraCount = born.length - show.length;
		          extraPos = { x: px, y: py + 4 };
		          for (const n of born.slice(show.length)) {
		            pos[n] = { x: px, y: py, size: "xs" };
		            tucked.add(n);
		          }
		        }
		      }
		      cellDraw.push({ cell: c, x, y, ratio, agg, lines, extraCount, extraPos });
		    });
		    return { pos, tucked, cellDraw };
		  }, [cells, slots, hs.st, mode, ox, oy, R, G, K, names]);
		  const beam = hs.beam;
		  const freshBeam = Boolean(beam && lastBeamSeqRef.current !== beam.seq);
		  (0, import_react9.useEffect)(() => {
		    lastBeamSeqRef.current = beam ? beam.seq : null;
		    if (!svgRef.current) return;
		    svgRef.current.querySelectorAll(".ag-hv-fly").forEach((a) => {
		      try {
		        a.beginElement?.();
		      } catch {
		      }
		    });
		  }, [beam?.seq]);
		  const links = (0, import_react9.useMemo)(() => {
		    const { pos } = layoutData;
		    const PAD = { q: 36, m: 24, xs: 13 };
		    const padOf = (p) => p.cell ? R * 0.5 : PAD[p.size];
		    const seen = (n) => Boolean(pos[n] && hs.st[n] && hs.st[n].st !== "unborn");
		    const drawn = /* @__PURE__ */ new Set();
		    const out = [];
		    const addLink = (fromName, toName, cls) => {
		      const a = pos[fromName];
		      const b = pos[toName];
		      if (!a || !b) return;
		      const dx = b.x - a.x;
		      const dy = b.y - a.y;
		      const len = Math.hypot(dx, dy) || 1;
		      const pa = padOf(a);
		      const pb = padOf(b);
		      if (len < pa + pb + 6) return;
		      const id = `${cls}|${a.x.toFixed(0)},${a.y.toFixed(0)}|${b.x.toFixed(0)},${b.y.toFixed(0)}`;
		      if (drawn.has(id)) return;
		      drawn.add(id);
		      const vx = dx / len;
		      const vy = dy / len;
		      const x1 = a.x + vx * pa;
		      const y1 = a.y + vy * pa;
		      const x2 = b.x - vx * pb;
		      const y2 = b.y - vy * pb;
		      const bend = Math.min(26, (len - pa - pb) * 0.2);
		      const mx = (x1 + x2) / 2 - vy * bend;
		      const my = (y1 + y2) / 2 + vx * bend;
		      const short = len - pa - pb < 30;
		      const cut = cls === "wait" && !short ? 9 : 0;
		      const hl = Math.hypot(x2 - mx, y2 - my) || 1;
		      const ex = x2 - (x2 - mx) / hl * cut;
		      const ey = y2 - (y2 - my) / hl * cut;
		      const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
		      let arrowPath = "";
		      if (cls === "wait") {
		        const fx = short ? a.x : mx;
		        const fy = short ? a.y : my;
		        const al = Math.hypot(x2 - fx, y2 - fy) || 1;
		        const tx = (x2 - fx) / al;
		        const ty = (y2 - fy) / al;
		        const bx = x2 - tx * 10;
		        const by = y2 - ty * 10;
		        arrowPath = `M${x2.toFixed(1)} ${y2.toFixed(1)}L${(bx - ty * 3.8).toFixed(1)} ${(by + tx * 3.8).toFixed(1)}L${(bx + ty * 3.8).toFixed(1)} ${(by - tx * 3.8).toFixed(1)}Z`;
		      }
		      out.push({ key: id, cls, d, short, x2, y2, arrowPath });
		    };
		    for (const [n, s] of Object.entries(hs.st)) {
		      if (s.st === "wait" && s.who && seen(n) && seen(s.who) && (selCell ? selCell.bees.includes(n) || selCell.bees.includes(s.who) : cells.length <= 18)) {
		        addLink(n, s.who, "wait");
		      }
		    }
		    if (beam && seen(beam.agent)) {
		      const targets = (beam.mentions || []).filter((t2) => t2 !== beam.agent);
		      for (const t2 of targets) {
		        if (seen(t2)) addLink(beam.agent, t2, "beam");
		      }
		    }
		    return out;
		  }, [layoutData, hs.st, R, selCell, cells.length, beam]);
		  const allDone = hs.doneCheck ? cells.reduce((a, c) => a + c.done, 0) : snapshot.stats.doneTasks;
		  const allTot = hs.doneCheck ? cells.reduce((a, c) => a + c.total, 0) : Math.max(snapshot.stats.totalTasks, cells.reduce((a, c) => a + c.total, 0));
		  const coordNeeds = hs.st.coordinator?.st === "needs";
		  const cellFill = (agg, full, sel) => {
		    if (sel) return "color-mix(in srgb, var(--ag-primary, #007acc) 10%, var(--ag-card, #ffffff))";
		    if (mode === "tiny") {
		      if (agg === "bad") return "color-mix(in srgb, var(--ag-error, #cb3d3d) 30%, var(--ag-card, #ffffff))";
		      if (agg === "warn") return "color-mix(in srgb, var(--ag-warning, #bca136) 34%, var(--ag-card, #ffffff))";
		      if (agg === "busy") return "color-mix(in srgb, var(--ag-primary, #007acc) 22%, var(--ag-card, #ffffff))";
		      if (full) return "color-mix(in srgb, var(--ag-success, #63984f) 26%, var(--ag-card, #ffffff))";
		    } else if (full && !agg) {
		      return "color-mix(in srgb, var(--ag-success, #63984f) 9%, var(--ag-card, #ffffff))";
		    }
		    return "var(--ag-card, #ffffff)";
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { ref: rootRef, className: "ag-hv", "data-testid": "swarm-hive", "data-size": mode, style: { position: "relative" }, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "ag-hv-bar", style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)", fontVariantNumeric: "tabular-nums" }, children: t("graph.cellsDone", { cells: cells.length, done: allDone, total: allTot }) }),
		      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		        "div",
		        {
		          className: "ag-hv-zoom",
		          role: "group",
		          "aria-label": isZh ? "\u8702\u5DE2\u7F29\u653E\u63A7\u5236" : "Hive zoom controls",
		          style: { marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 2 },
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              "button",
		              {
		                type: "button",
		                className: "ag-icon-btn",
		                disabled: !zoomed,
		                title: isZh ? "\u7F29\u5C0F" : "Zoom out",
		                "aria-label": isZh ? "\u7F29\u5C0F" : "Zoom out",
		                onClick: () => setZoom((z) => Math.max(1, z / 1.6)),
		                children: "\u2212"
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              "button",
		              {
		                type: "button",
		                className: "ag-icon-btn",
		                disabled: clampedZoom > zmax - 0.01,
		                title: isZh ? "\u653E\u5927\uFF08\u6216\u6309\u4F4F Ctrl+\u6EDA\u8F6E\uFF09" : "Zoom in (or Ctrl+wheel)",
		                "aria-label": isZh ? "\u653E\u5927" : "Zoom in",
		                onClick: () => setZoom((z) => Math.min(zmax, z * 1.6)),
		                children: "+"
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              "button",
		              {
		                type: "button",
		                className: "ag-ghost-btn",
		                disabled: !zoomed,
		                title: isZh ? "\u9002\u914D\u6574\u4E2A\u8702\u5DE2" : "Fit the whole hive",
		                onClick: () => setZoom(1),
		                style: { height: 26, padding: "0 7px" },
		                children: isZh ? "\u9002\u914D" : "Fit"
		              }
		            )
		          ]
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		      "div",
		      {
		        ref: viewRef,
		        className: `ag-hv-view${zoomed ? " zoomed" : ""}${panning ? " panning" : ""}`,
		        onPointerDown,
		        style: {
		          overflow: zoomed ? "auto" : "visible",
		          maxHeight: zoomed ? Math.max(320, Math.min(fitH, 540)) : void 0,
		          cursor: zoomed ? panning ? "grabbing" : "grab" : "default",
		          borderRadius: 12,
		          userSelect: panning ? "none" : void 0
		        },
		        children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "ag-hv-stage", style: { position: "relative", width: `${CW}px`, height: `${H}px`, margin: "0 auto" }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		            "svg",
		            {
		              ref: svgRef,
		              className: "ag-hv-svg",
		              viewBox: `0 0 ${CW} ${H}`,
		              style: { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" },
		              role: "img",
		              "aria-label": "Swarm honeycomb topology",
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("g", { children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                    "path",
		                    {
		                      d: hexPath(ox, oy, R, 0),
		                      fill: "var(--ag-card, #ffffff)",
		                      stroke: mode === "tiny" ? "var(--ag-fg-muted, #5d676f)" : "var(--ag-border, rgba(128,128,128,0.25))",
		                      strokeWidth: 1.2,
		                      onClick: () => setSelectedCellId(null),
		                      children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("title", { children: `Coordinator \xB7 ${allDone} of ${allTot} done` })
		                    }
		                  ),
		                  allTot > 0 && allDone > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                    "path",
		                    {
		                      d: hexPath(ox, oy, R - 2, -120),
		                      pathLength: 1,
		                      fill: "none",
		                      stroke: "var(--ag-success, #63984f)",
		                      strokeWidth: 2.5,
		                      strokeLinecap: "round",
		                      strokeDasharray: `${Math.min(1, allDone / allTot).toFixed(3)} 1`,
		                      style: { pointerEvents: "none" }
		                    }
		                  ),
		                  mode === "full" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", { x: ox, y: oy + R * 0.44, textAnchor: "middle", fontSize: 12, fontWeight: 600, fill: "var(--ag-fg, #1d1f21)", style: { pointerEvents: "none" }, children: t("members.coordinator") }),
		                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                      "text",
		                      {
		                        x: ox,
		                        y: oy + R * 0.44 + 15,
		                        textAnchor: "middle",
		                        fontSize: 11,
		                        fill: coordNeeds ? "var(--ag-warning, #bca136)" : "var(--ag-fg-muted, #5d676f)",
		                        style: { pointerEvents: "none" },
		                        children: coordNeeds ? isZh ? "\u9700\u8981\u5173\u6CE8" : "Needs attention" : isZh ? `\u5B8C\u6210 ${allDone}/${allTot}` : `${allDone} of ${allTot} done`
		                      }
		                    )
		                  ] }),
		                  mode === "mid" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                    "text",
		                    {
		                      x: ox,
		                      y: oy + R * 0.62,
		                      textAnchor: "middle",
		                      fontSize: 10,
		                      fill: coordNeeds ? "var(--ag-warning, #bca136)" : "var(--ag-fg-muted, #5d676f)",
		                      style: { pointerEvents: "none" },
		                      children: coordNeeds ? isZh ? "\u9700\u5173\u6CE8" : "Needs attention" : `${allDone}/${allTot}`
		                    }
		                  )
		                ] }),
		                layoutData.cellDraw.map((item) => {
		                  const isSel = selCell?.id === item.cell.id;
		                  const isFull = item.ratio >= 1;
		                  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("g", { children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                      "path",
		                      {
		                        d: hexPath(item.x, item.y, R, 0),
		                        fill: cellFill(item.agg, isFull, isSel),
		                        stroke: "var(--ag-border, rgba(128,128,128,0.22))",
		                        strokeWidth: 1,
		                        style: { cursor: "pointer" },
		                        onClick: () => {
		                          if (draggedRef.current) return;
		                          if (mode === "tiny" && zmax >= 1.15) {
		                            setZoom((z) => Math.min(zmax, Math.max(z * 1.6, 2.2)));
		                            return;
		                          }
		                          setSelectedCellId((prev) => prev === item.cell.id ? null : item.cell.id);
		                        },
		                        children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("title", { children: `${item.cell.title} \xB7 ${item.cell.count ?? `${item.cell.done}/${item.cell.total} done`}` })
		                      }
		                    ),
		                    (item.ratio > 0 && item.ratio < 1 || isFull && mode !== "tiny") && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                      "path",
		                      {
		                        d: hexPath(item.x, item.y, R - 2, -120),
		                        pathLength: 1,
		                        fill: "none",
		                        stroke: "var(--ag-success, #63984f)",
		                        strokeWidth: 2.5,
		                        strokeLinecap: "round",
		                        strokeDasharray: `${Math.min(1, item.ratio).toFixed(3)} 1`,
		                        style: { pointerEvents: "none" }
		                      }
		                    ),
		                    isSel && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                      "path",
		                      {
		                        d: hexPath(item.x, item.y, R + 1.5, 0),
		                        fill: "none",
		                        stroke: "var(--ag-primary, #007acc)",
		                        strokeWidth: 2.5,
		                        strokeLinejoin: "round",
		                        style: { pointerEvents: "none" }
		                      }
		                    ),
		                    mode === "mid" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", { x: item.x, y: item.y - K * R + 15, textAnchor: "middle", fontSize: 10, fontWeight: 600, fill: "var(--ag-fg, #1d1f21)", style: { pointerEvents: "none" }, children: item.lines[0] }),
		                      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("text", { x: item.x, y: item.y - K * R + 27, textAnchor: "middle", fontSize: 10, fill: "var(--ag-fg-muted, #5d676f)", style: { pointerEvents: "none" }, children: item.cell.count ?? `${item.cell.done}/${item.cell.total}` })
		                    ] }),
		                    mode === "full" && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(import_jsx_runtime6.Fragment, { children: [
		                      item.lines.map((line, idx) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                        "text",
		                        {
		                          x: item.x,
		                          y: item.y - K * R + (item.lines.length > 1 ? 20 : 26) + idx * 14,
		                          textAnchor: "middle",
		                          fontSize: 12,
		                          fontWeight: 600,
		                          fill: "var(--ag-fg, #1d1f21)",
		                          style: { pointerEvents: "none" },
		                          children: line
		                        },
		                        idx
		                      )),
		                      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                        "text",
		                        {
		                          x: item.x,
		                          y: item.y - K * R + (item.lines.length > 1 ? 20 : 26) + item.lines.length * 14,
		                          textAnchor: "middle",
		                          fontSize: 11,
		                          fill: "var(--ag-fg-muted, #5d676f)",
		                          style: { pointerEvents: "none" },
		                          children: item.cell.count ?? `${item.cell.done}/${item.cell.total}`
		                        }
		                      )
		                    ] }),
		                    item.extraCount > 0 && item.extraPos && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		                      "text",
		                      {
		                        x: item.extraPos.x,
		                        y: item.extraPos.y,
		                        textAnchor: "middle",
		                        fontSize: mode === "mid" ? 10 : 11,
		                        fill: "var(--ag-fg-muted, #5d676f)",
		                        style: { pointerEvents: "none" },
		                        children: [
		                          "+",
		                          item.extraCount
		                        ]
		                      }
		                    )
		                  ] }, item.cell.id);
		                }),
		                links.map((ln) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("g", { style: { pointerEvents: "none" }, children: [
		                  !(ln.cls === "wait" && ln.short) && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                    "path",
		                    {
		                      d: ln.d,
		                      fill: "none",
		                      stroke: ln.cls === "wait" ? "var(--ag-warning, #bca136)" : "var(--ag-primary, #007acc)",
		                      strokeWidth: 1.6,
		                      strokeLinecap: "round",
		                      strokeDasharray: ln.cls === "wait" ? "4 4" : void 0,
		                      strokeOpacity: 0.62
		                    }
		                  ),
		                  ln.cls === "wait" && ln.arrowPath && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: ln.arrowPath, fill: "var(--ag-warning, #bca136)", fillOpacity: 0.62 }),
		                  ln.cls === "beam" && (freshBeam ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("circle", { r: 3, fill: "var(--ag-primary, #007acc)", fillOpacity: 0.92, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                    "animateMotion",
		                    {
		                      className: "ag-hv-fly",
		                      dur: "0.7s",
		                      begin: "indefinite",
		                      fill: "freeze",
		                      path: ln.d
		                    }
		                  ) }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("circle", { r: 3, cx: ln.x2, cy: ln.y2, fill: "var(--ag-primary, #007acc)", fillOpacity: 0.92 }))
		                ] }, ln.key))
		              ]
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "ag-hv-bees", style: { position: "absolute", inset: 0, pointerEvents: "none" }, children: Object.entries(layoutData.pos).map(([n, p]) => {
		            const m = snapshot.members[n];
		            const st = hs.st[n];
		            if (!m || !st || layoutData.tucked.has(n)) return null;
		            const [w, h] = p.size === "q" ? [66, 54] : p.size === "m" ? [44, 36] : [22, 18];
		            const beeSz = p.size === "q" ? 3 : p.size === "m" ? 2 : 1;
		            const beeVisual = st.st === "working" ? "working" : st.st === "wait" ? "waiting_on" : st.st === "retired" ? "killed" : "landed";
		            const dotVar = st.st === "issue" ? "stuck" : st.st === "wait" || st.st === "needs" ? "waiting" : st.st === "done" ? "done" : void 0;
		            const tip = `@${n}${m.task_hint && n !== "coordinator" ? ` \xB7 ${m.task_hint}` : ""} \xB7 ${statusText(st, isZh)}`;
		            return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		              "button",
		              {
		                type: "button",
		                title: tip,
		                "aria-label": tip,
		                tabIndex: st.st === "unborn" ? -1 : 0,
		                onClick: () => {
		                  if (draggedRef.current) return;
		                  if (m.last_post_seq) onJumpToSeq(m.last_post_seq);
		                },
		                style: {
		                  position: "absolute",
		                  left: 0,
		                  top: 0,
		                  border: 0,
		                  padding: 0,
		                  background: "transparent",
		                  pointerEvents: st.st === "unborn" || panning ? "none" : "auto",
		                  cursor: m.last_post_seq ? "pointer" : "default",
		                  opacity: st.st === "unborn" ? 0 : st.st === "retired" ? 0.36 : 1,
		                  filter: st.st === "retired" ? "grayscale(1)" : void 0,
		                  transform: `translate(${Math.round(p.x - w / 2)}px, ${Math.round(p.y - h / 2)}px)`,
		                  transition: "transform 0.5s cubic-bezier(.3,.7,.2,1), opacity 0.25s ease"
		                },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                    PixelBee,
		                    {
		                      name: n,
		                      role: m.role,
		                      state: beeVisual,
		                      size: beeSz,
		                      showDot: Boolean(dotVar),
		                      dotVariant: dotVar
		                    }
		                  ),
		                  names && n !== "coordinator" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		                    "span",
		                    {
		                      style: {
		                        position: "absolute",
		                        top: "100%",
		                        left: "50%",
		                        transform: "translateX(-50%)",
		                        marginTop: 1,
		                        maxWidth: 58,
		                        overflow: "hidden",
		                        textOverflow: "ellipsis",
		                        whiteSpace: "nowrap",
		                        fontSize: 10,
		                        color: "var(--ag-fg-muted, #5d676f)"
		                      },
		                      children: n
		                    }
		                  )
		                ]
		              },
		              n
		            );
		          }) })
		        ] })
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		      "div",
		      {
		        className: "ag-hv-key",
		        style: { display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 10, fontSize: 11, color: "var(--ag-fg-muted, #5d676f)" },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("i", { style: { display: "inline-block", width: 16, borderTop: "2px solid var(--ag-success, #63984f)" } }),
		            t("graph.legendDone")
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("i", { style: { display: "inline-block", width: 16, borderTop: "2px solid var(--ag-primary, #007acc)" } }),
		            t("graph.legendMsg")
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("i", { style: { display: "inline-block", width: 16, borderTop: "2px dashed var(--ag-warning, #bca136)" } }),
		            t("graph.legendWait")
		          ] })
		        ]
		      }
		    ),
		    selCell && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		      "section",
		      {
		        className: "ag-hv-card",
		        "data-testid": "swarm-hive-card",
		        "aria-live": "polite",
		        style: {
		          marginTop: 12,
		          padding: "12px 14px",
		          borderRadius: 12,
		          border: "1px solid var(--ag-card-border, rgba(128,128,128,0.2))",
		          background: "var(--ag-card, #ffffff)"
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: 10 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 15, fontWeight: 600 }, children: selCell.title }),
		              selCell.goal && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)", marginTop: 2 }, children: selCell.goal })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }, children: selCell.count == null && selCell.total ? isZh ? `\u5DF2\u5B8C\u6210 ${selCell.done}/${selCell.total}` : `${selCell.done} of ${selCell.total} done` : isZh ? `${selCell.bees.length} \u4F4D\u6210\u5458` : `${selCell.bees.length} bees` }),
		            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
		              "button",
		              {
		                type: "button",
		                className: "ag-icon-btn",
		                onClick: () => setSelectedCellId(null),
		                "aria-label": t("common.close"),
		                children: "\u2715"
		              }
		            )
		          ] }),
		          selCell.bees.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { style: { margin: "10px 0 0", fontSize: 12, color: "var(--ag-fg-muted, #5d676f)" }, children: isZh ? "\u8BE5\u5DE5\u4F5C\u533A\u6682\u672A\u5206\u914D\u6210\u5458\u3002" : "No members assigned to this cell yet." }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("ul", { style: { listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 4 }, children: selCell.bees.map((n) => {
		            const m = snapshot.members[n];
		            const st = hs.st[n];
		            if (!m) return null;
		            const imgSrc = getBeeDataUrl(n, m.role, "landed");
		            return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
		              "button",
		              {
		                type: "button",
		                onClick: () => {
		                  if (m.last_post_seq) onJumpToSeq(m.last_post_seq);
		                },
		                style: {
		                  display: "flex",
		                  alignItems: "center",
		                  gap: 10,
		                  width: "100%",
		                  padding: "6px 8px",
		                  border: 0,
		                  borderRadius: 8,
		                  background: "transparent",
		                  textAlign: "left",
		                  cursor: m.last_post_seq ? "pointer" : "default"
		                },
		                children: [
		                  imgSrc && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("img", { src: imgSrc, alt: "", width: 33, height: 27, style: { imageRendering: "pixelated", flex: "none" } }),
		                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { flex: 1, minWidth: 0 }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { display: "flex", alignItems: "baseline", gap: 6 }, children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("strong", { style: { fontSize: 13 }, children: [
		                        "@",
		                        n
		                      ] }),
		                      m.task_hint && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.task_hint })
		                    ] }),
		                    m.activity && st?.st !== "unborn" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { display: "block", fontSize: 11, color: "var(--ag-fg-muted, #5d676f)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.activity })
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 11, fontWeight: 500, color: "var(--ag-fg-muted, #5d676f)", whiteSpace: "nowrap" }, children: statusText(st, isZh) })
		                ]
		              }
		            ) }, n);
		          }) })
		        ]
		      }
		    )
		  ] });
		}
		
		// client/components/MentionsGraph.tsx
		var import_react10 = require("react");
		var import_jsx_runtime7 = require("react/jsx-runtime");
		function isRoleWorker(name2, members) {
		  const m = members[name2];
		  if (m && m.role === "monitor") return true;
		  return /^(?:narrator|monitor)(?:-\d+)?$/i.test(name2);
		}
		function pillWidth(id, maxW) {
		  const full = Math.max(76, 54 + Math.ceil(String(id).length * 6.8));
		  return id === "coordinator" ? full : Math.min(maxW, full);
		}
		function layoutNodes(nodes, width) {
		  const nodeH = 28;
		  if (nodes.length <= 16) {
		    const pos2 = /* @__PURE__ */ new Map();
		    const n = Math.max(1, nodes.length);
		    const w = Math.min(162, Math.max(116, width / Math.max(4, Math.ceil(n / 2) + 1) - 10));
		    const rx = Math.max(60, width / 2 - w / 2 - 14);
		    const ry = n <= 2 ? 60 : Math.min(220, Math.max(110, n * 20));
		    const cx = width / 2;
		    const cy = ry + nodeH / 2 + 20;
		    nodes.forEach((node, i) => {
		      const a = -Math.PI / 2 + 2 * Math.PI * i / n;
		      pos2.set(node.id, {
		        x: cx + rx * Math.cos(a),
		        y: cy + ry * Math.sin(a),
		        w: pillWidth(node.id, w),
		        h: nodeH
		      });
		    });
		    return { pos: pos2, height: cy + ry + nodeH / 2 + 20 };
		  }
		  const rows = /* @__PURE__ */ new Map();
		  for (const n of nodes) {
		    const list = rows.get(n.row) ?? [];
		    list.push(n);
		    rows.set(n.row, list);
		  }
		  const pos = /* @__PURE__ */ new Map();
		  const minNodeW = 114;
		  const lineH = 64;
		  const rowGap = 40;
		  const perLine = Math.max(1, Math.floor(width / (minNodeW + 12)));
		  let y = 32;
		  for (const [, list] of [...rows.entries()].sort((a, b) => a[0] - b[0])) {
		    for (let i = 0; i < list.length; i += perLine) {
		      const line = list.slice(i, i + perLine);
		      const gap = width / (line.length + 1);
		      const w = Math.min(158, Math.max(minNodeW, gap - 12));
		      line.forEach((n, j) => {
		        pos.set(n.id, {
		          x: gap * (j + 1),
		          y: y + (line.length > 3 && j % 2 ? 14 : 0),
		          w: pillWidth(n.id, Math.min(w, gap - 8)),
		          h: nodeH
		        });
		      });
		      y += lineH;
		    }
		    y += rowGap;
		  }
		  return { pos, height: Math.max(160, y - rowGap + 14) };
		}
		function computeEdgeGeom(a, b) {
		  const dx = b.x - a.x;
		  const dy = b.y - a.y;
		  const len = Math.hypot(dx, dy) || 1;
		  const nx = -dy / len;
		  const ny = dx / len;
		  const bend = 24;
		  const mx = (a.x + b.x) / 2 + nx * bend;
		  const my = (a.y + b.y) / 2 + ny * bend;
		  const trim = (p, q) => {
		    const tx = q.x - p.x;
		    const ty = q.y - p.y;
		    const l = Math.hypot(tx, ty) || 1;
		    const ux = tx / l;
		    const uy = ty / l;
		    const toBorder = Math.min(
		      ux ? p.w / 2 / Math.abs(ux) : Infinity,
		      uy ? p.h / 2 / Math.abs(uy) : Infinity
		    );
		    const t2 = Math.min(0.45 * l, toBorder + 4);
		    return { x: p.x + ux * t2, y: p.y + uy * t2 };
		  };
		  const start = trim(a, { x: mx, y: my });
		  const end = trim(b, { x: mx, y: my });
		  return {
		    d: `M${start.x.toFixed(1)},${start.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${end.x.toFixed(1)},${end.y.toFixed(1)}`,
		    start,
		    mx,
		    my,
		    end
		  };
		}
		function messageTargets(m, expandAll, members, channels) {
		  if (isRoleWorker(m.agent, members)) return { direct: /* @__PURE__ */ new Set(), viaAll: /* @__PURE__ */ new Set() };
		  const direct = /* @__PURE__ */ new Set();
		  for (const target of m.mentions || []) {
		    if (target !== m.agent && !isRoleWorker(target, members)) direct.add(target);
		  }
		  for (const chName of m.channel_mentions || []) {
		    const ch = channels?.[chName];
		    if (ch && !ch.archived) {
		      for (const sub of ch.subscribers || []) {
		        if (sub !== m.agent && !isRoleWorker(sub, members)) direct.add(sub);
		      }
		    }
		  }
		  const viaAll = /* @__PURE__ */ new Set();
		  if (m.is_all && expandAll) {
		    for (const mem of Object.values(members)) {
		      if (mem.name !== m.agent && !direct.has(mem.name) && !isRoleWorker(mem.name, members)) {
		        viaAll.add(mem.name);
		      }
		    }
		  }
		  return { direct, viaAll };
		}
		function computeGraphState(snapshot, messages, opts) {
		  const members = snapshot.members || {};
		  const channels = snapshot.channels || {};
		  const memberList = Object.values(members).filter((m) => !isRoleWorker(m.name, members));
		  const memberNames = new Set(memberList.map((m) => m.name));
		  const outsiders = [...new Set(messages.map((m) => m.agent))].filter(
		    (n) => !memberNames.has(n) && !isRoleWorker(n, members)
		  );
		  const allNodes = [
		    ...memberList.sort((a, b) => a.role === "coordinator" ? -1 : b.role === "coordinator" ? 1 : a.name.localeCompare(b.name)).map((m) => ({ id: m.name, row: m.role === "coordinator" ? 0 : 1, member: m })),
		    ...outsiders.map((n) => ({ id: n, row: 2, member: null }))
		  ];
		  const active = /* @__PURE__ */ new Set(["coordinator"]);
		  const edges = /* @__PURE__ */ new Map();
		  const unaddressed = /* @__PURE__ */ new Map();
		  const broadcasts = /* @__PURE__ */ new Map();
		  const bump = (k, field) => {
		    const e = edges.get(k) ?? { direct: 0, viaAll: 0 };
		    e[field]++;
		    edges.set(k, e);
		  };
		  const limit = Math.max(0, Math.min(opts.upto, messages.length));
		  for (let i = 0; i < limit; i++) {
		    const m = messages[i];
		    if (isRoleWorker(m.agent, members)) continue;
		    active.add(m.agent);
		    const { direct, viaAll } = messageTargets(m, opts.expandAll, members, channels);
		    if (m.is_all) broadcasts.set(m.agent, (broadcasts.get(m.agent) ?? 0) + 1);
		    if (!direct.size && !viaAll.size && !m.is_all) {
		      unaddressed.set(m.agent, (unaddressed.get(m.agent) ?? 0) + 1);
		    }
		    for (const t2 of direct) {
		      active.add(t2);
		      bump(`${m.agent}>${t2}`, "direct");
		    }
		    for (const t2 of viaAll) {
		      if (!opts.hideInactive) active.add(t2);
		      bump(`${m.agent}>${t2}`, "viaAll");
		    }
		  }
		  const current = opts.replaying && limit > 0 ? messages[limit - 1] : null;
		  const currentDirect = current ? /* @__PURE__ */ new Set([current.agent, ...messageTargets(current, false, members, channels).direct]) : /* @__PURE__ */ new Set();
		  const nodes = opts.hideInactive ? allNodes.filter((n) => currentDirect.has(n.id) || active.has(n.id) && !(n.member?.killed || n.member?.state === "killed")) : allNodes;
		  const { pos, height } = layoutNodes(nodes, Math.max(320, opts.width));
		  const isActive = (id) => !opts.replaying || active.has(id);
		  let curTargets = /* @__PURE__ */ new Set();
		  if (current) {
		    const { direct, viaAll } = messageTargets(current, opts.expandAll, members, channels);
		    curTargets = /* @__PURE__ */ new Set([...direct, ...viaAll]);
		  }
		  const isCur = (from, to) => Boolean(current && from === current.agent && curTargets.has(to));
		  let max = 1;
		  for (const [k, e] of edges) {
		    const [from, to] = k.split(">");
		    if (pos.has(from) && pos.has(to)) {
		      const total = e.direct + e.viaAll;
		      if (total > max) max = total;
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
		    upto: limit
		  };
		}
		function MentionsGraph(props) {
		  const { snapshot, messages, replaying, upto, expandAll, hideInactive, onJumpToSeq } = props;
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const wrapRef = (0, import_react10.useRef)(null);
		  const svgRef = (0, import_react10.useRef)(null);
		  const [width, setWidth] = (0, import_react10.useState)(640);
		  const lastAnimatedSeqRef = (0, import_react10.useRef)(null);
		  (0, import_react10.useEffect)(() => {
		    const el = wrapRef.current;
		    if (!el || typeof ResizeObserver === "undefined") return;
		    const measure = () => {
		      const w = Math.floor(el.clientWidth);
		      if (w >= 200) setWidth(w);
		    };
		    measure();
		    const ro = new ResizeObserver(measure);
		    ro.observe(el);
		    return () => ro.disconnect();
		  }, []);
		  const g = (0, import_react10.useMemo)(
		    () => computeGraphState(snapshot, messages, { replaying, upto, expandAll, hideInactive, width }),
		    [snapshot, messages, replaying, upto, expandAll, hideInactive, width]
		  );
		  const animateCur = Boolean(g.current && g.current.seq !== lastAnimatedSeqRef.current);
		  (0, import_react10.useEffect)(() => {
		    lastAnimatedSeqRef.current = g.current ? g.current.seq : null;
		    if (!svgRef.current) return;
		    const anims = svgRef.current.querySelectorAll(".ag-dot-anim");
		    anims.forEach((a) => {
		      try {
		        a.beginElement?.();
		      } catch {
		      }
		    });
		  }, [g.current?.seq]);
		  const edgeEntries = (0, import_react10.useMemo)(() => {
		    const items = [];
		    let curIdx = 0;
		    for (const [key, e] of g.edges) {
		      const [from, to] = key.split(">");
		      const a = g.pos.get(from);
		      const b = g.pos.get(to);
		      if (!a || !b) continue;
		      const total = e.direct + e.viaAll;
		      const cur = g.isCur(from, to);
		      items.push({
		        key,
		        id: cur ? `ag-cur-edge-${curIdx++}` : "",
		        from,
		        to,
		        direct: e.direct,
		        viaAll: e.viaAll,
		        total,
		        geom: computeEdgeGeom(a, b),
		        strokeW: 1 + 3 * total / g.max,
		        cur
		      });
		    }
		    return items;
		  }, [g]);
		  const lastSeqByAgent = (0, import_react10.useMemo)(() => {
		    const map = /* @__PURE__ */ new Map();
		    for (const m of messages) {
		      map.set(m.agent, m.seq);
		    }
		    return map;
		  }, [messages]);
		  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { ref: wrapRef, className: "ag-graph-wrap", style: { width: "100%" }, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
		      "svg",
		      {
		        ref: svgRef,
		        className: "ag-graph",
		        "data-testid": "swarm-graph",
		        viewBox: `0 0 ${width} ${g.height}`,
		        style: { width: "100%", height: `${g.height}px`, display: "block", fontFamily: "var(--ag-font, sans-serif)" },
		        role: "img",
		        "aria-label": "Member @mention directed graph",
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		            "marker",
		            {
		              id: "ag-arrow",
		              viewBox: "0 0 10 10",
		              refX: "8.5",
		              refY: "5",
		              markerUnits: "userSpaceOnUse",
		              markerWidth: "8",
		              markerHeight: "8",
		              orient: "auto-start-reverse",
		              children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("path", { d: "M1,1.2 L9,5 L1,8.8 Q2.6,5 1,1.2 z", fill: "color-mix(in srgb, var(--ag-fg, #1d1f21) 45%, transparent)" })
		            }
		          ) }),
		          edgeEntries.map((item) => {
		            const isViaAll = item.direct === 0;
		            const opacity = item.cur ? 0.85 : g.replaying ? 0.12 : isViaAll ? 0.18 : 0.28;
		            return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		              "path",
		              {
		                id: item.id || void 0,
		                className: `ag-edge${isViaAll ? " via-all" : ""}${item.cur ? " cur" : ""}`,
		                d: item.geom.d,
		                fill: "none",
		                stroke: "var(--ag-fg, #1d1f21)",
		                strokeWidth: item.strokeW.toFixed(2),
		                strokeLinecap: "round",
		                strokeDasharray: isViaAll ? "4 4" : void 0,
		                strokeOpacity: opacity,
		                markerEnd: "url(#ag-arrow)",
		                children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("title", { children: `${item.from} \u2192 ${item.to}: ${item.direct} direct${item.viaAll ? `, ${item.viaAll} via @all` : ""}` })
		              },
		              item.key
		            );
		          }),
		          g.nodes.map((node) => {
		            const p = g.pos.get(node.id);
		            if (!p) return null;
		            const mem = node.member;
		            const state = mem?.killed ? "killed" : mem?.state ?? "";
		            const beeSrc = getBeeDataUrl(node.id, mem?.role, state === "killed" ? "landed" : "landed");
		            const beeX = p.x - p.w / 2 + 8;
		            const dotX = beeSrc ? beeX + 22 : p.x - p.w / 2 + 14;
		            const dotY = beeSrc ? p.y - 7 : p.y;
		            const labelX = beeSrc ? beeX + 28 : state ? dotX + 9 : p.x - p.w / 2 + 12;
		            const maxChars = Math.max(4, Math.floor((p.x + p.w / 2 - 10 - labelX) / 6.8));
		            const label = node.id.length > maxChars ? `${node.id.slice(0, maxChars - 1)}\u2026` : node.id;
		            const hot = Boolean(g.current && (node.id === g.current.agent || g.curTargets.has(node.id)));
		            const ring = g.unaddressed.get(node.id) ?? 0;
		            const bcast = expandAll ? 0 : g.broadcasts.get(node.id) ?? 0;
		            const bw = 30 + 6 * String(bcast).length;
		            const killed = state === "killed";
		            const inactive = !g.isActive(node.id);
		            const jumpSeq = mem?.last_post_seq ?? lastSeqByAgent.get(node.id);
		            return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
		              "g",
		              {
		                className: `ag-node${inactive ? " inactive" : ""}${hot ? " hot" : ""}${killed ? " killed" : ""}`,
		                style: { cursor: jumpSeq ? "pointer" : "default", opacity: inactive ? 0.2 : 1, transition: "opacity 0.25s ease" },
		                onClick: () => {
		                  if (jumpSeq) onJumpToSeq(jumpSeq);
		                },
		                children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("title", { children: mem ? `@${node.id} \xB7 ${mem.role}${mem.model_display_name ? ` \xB7 ${mem.model_display_name}` : ""} \xB7 ${state}${ring ? ` \xB7 ${ring} unaddressed` : ""}${bcast ? ` \xB7 ${bcast} @all` : ""}` : `@${node.id} (off-roster)` }),
		                  ring > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		                    "rect",
		                    {
		                      x: p.x - p.w / 2 - 4,
		                      y: p.y - p.h / 2 - 4,
		                      width: p.w + 8,
		                      height: p.h + 8,
		                      rx: p.h / 2 + 4,
		                      fill: "none",
		                      stroke: "color-mix(in srgb, var(--ag-fg, #1d1f21) 30%, transparent)",
		                      strokeDasharray: "2 2.5",
		                      strokeWidth: 1
		                    }
		                  ),
		                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		                    "rect",
		                    {
		                      x: p.x - p.w / 2,
		                      y: p.y - p.h / 2,
		                      width: p.w,
		                      height: p.h,
		                      rx: p.h / 2,
		                      fill: hot ? "var(--ag-fill, rgba(128,128,128,0.1))" : "var(--ag-bg, #f7f7f8)",
		                      stroke: hot ? "var(--ag-fg, #1d1f21)" : "color-mix(in srgb, var(--ag-fg, #1d1f21) 22%, transparent)",
		                      strokeWidth: hot ? 1.5 : 1,
		                      strokeDasharray: !mem ? "3 2" : killed ? "2 2" : void 0
		                    }
		                  ),
		                  beeSrc && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		                    "image",
		                    {
		                      href: beeSrc,
		                      x: beeX,
		                      y: p.y - 9,
		                      width: 22,
		                      height: 18,
		                      style: {
		                        imageRendering: "pixelated",
		                        filter: killed ? "grayscale(1)" : void 0,
		                        opacity: killed ? 0.5 : 1
		                      }
		                    }
		                  ),
		                  state && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		                    "circle",
		                    {
		                      cx: dotX,
		                      cy: dotY,
		                      r: beeSrc ? 3 : 3.25,
		                      fill: state === "working" ? "var(--ag-success, #63984f)" : state === "killed" ? "var(--ag-fg-faint, #9da5ab)" : "none",
		                      stroke: state === "waiting" || state === "stopped" ? "var(--ag-fg-faint, #9da5ab)" : "none",
		                      strokeWidth: 1.5
		                    }
		                  ),
		                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		                    "text",
		                    {
		                      x: labelX,
		                      y: p.y + 4,
		                      fill: killed ? "var(--ag-fg-muted, #5d676f)" : "var(--ag-fg, #1d1f21)",
		                      fontSize: 12,
		                      fontWeight: 500,
		                      textDecoration: killed ? "line-through" : void 0,
		                      children: label
		                    }
		                  ),
		                  bcast > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("g", { children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		                      "rect",
		                      {
		                        x: p.x + p.w / 2 - bw + 6,
		                        y: p.y - p.h / 2 - 7,
		                        width: bw,
		                        height: 14,
		                        rx: 7,
		                        fill: "var(--ag-bg, #f7f7f8)",
		                        stroke: "color-mix(in srgb, var(--ag-fg, #1d1f21) 18%, transparent)",
		                        strokeWidth: 1
		                      }
		                    ),
		                    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
		                      "text",
		                      {
		                        x: p.x + p.w / 2 - bw / 2 + 6,
		                        y: p.y - p.h / 2 + 3,
		                        textAnchor: "middle",
		                        fill: "var(--ag-fg-muted, #5d676f)",
		                        fontSize: 9,
		                        fontWeight: 600,
		                        children: [
		                          "@all ",
		                          bcast
		                        ]
		                      }
		                    )
		                  ] })
		                ]
		              },
		              node.id
		            );
		          }),
		          edgeEntries.filter((item) => item.total > 1).map((item) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		            "text",
		            {
		              x: item.geom.mx,
		              y: item.geom.my + 3,
		              textAnchor: "middle",
		              fontSize: 10,
		              fontWeight: 500,
		              fill: "var(--ag-fg-muted, #5d676f)",
		              stroke: "var(--ag-bg, #f7f7f8)",
		              strokeWidth: 4,
		              strokeLinejoin: "round",
		              style: { paintOrder: "stroke" },
		              children: item.total
		            },
		            `cnt-${item.key}`
		          )),
		          edgeEntries.filter((item) => Boolean(item.id)).map(
		            (item) => animateCur ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		              "circle",
		              {
		                r: 4.5,
		                fill: "var(--ag-fg, #1d1f21)",
		                stroke: "var(--ag-bg, #f7f7f8)",
		                strokeWidth: 2,
		                children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("animateMotion", { className: "ag-dot-anim", dur: "0.9s", begin: "indefinite", fill: "freeze", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("mpath", { href: `#${item.id}` }) })
		              },
		              `dot-${item.id}-${g.current?.seq}`
		            ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
		              "circle",
		              {
		                r: 4.5,
		                cx: item.geom.end.x,
		                cy: item.geom.end.y,
		                fill: "var(--ag-fg, #1d1f21)",
		                stroke: "var(--ag-bg, #f7f7f8)",
		                strokeWidth: 2
		              },
		              `dot-static-${item.id}`
		            )
		          )
		        ]
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
		      "div",
		      {
		        className: "ag-graph-legend",
		        style: {
		          display: "flex",
		          flexWrap: "wrap",
		          gap: "4px 16px",
		          marginTop: 8,
		          fontSize: 11,
		          color: "var(--ag-fg-muted, #5d676f)"
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("svg", { width: "22", height: "8", viewBox: "0 0 22 8", "aria-hidden": "true", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("line", { x1: "0", y1: "4", x2: "17", y2: "4", stroke: "currentColor", strokeWidth: "1.5" }),
		              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("polygon", { points: "15,1 22,4 15,7", fill: "currentColor" })
		            ] }),
		            t("graph.legendDirect")
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("svg", { width: "22", height: "8", viewBox: "0 0 22 8", "aria-hidden": "true", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("line", { x1: "0", y1: "4", x2: "17", y2: "4", stroke: "currentColor", strokeWidth: "1.5", strokeDasharray: "4 3" }),
		              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("polygon", { points: "15,1 22,4 15,7", fill: "currentColor" })
		            ] }),
		            t("graph.legendAll")
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("svg", { width: "16", height: "10", viewBox: "0 0 16 10", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("rect", { x: "1", y: "1", width: "14", height: "8", rx: "4", fill: "none", stroke: "currentColor", strokeDasharray: "2 2" }) }),
		            t("graph.legendUnaddressed")
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { style: { padding: "0 5px", borderRadius: 999, fontSize: 9, fontWeight: 600, background: "var(--ag-fill, rgba(128,128,128,0.1))" }, children: "@all N" }),
		            isZh ? "@all \u5E7F\u64AD\u6B21\u6570" : "Broadcast count"
		          ] })
		        ]
		      }
		    )
		  ] });
		}
		
		// client/components/GraphTab.tsx
		var import_jsx_runtime8 = require("react/jsx-runtime");
		var SPEEDS = [0.5, 1, 2, 4, 8];
		function msgMs2(m) {
		  if (!m) return 0;
		  if (Number.isFinite(m.ts) && m.ts > 0) return m.ts;
		  const parsed = Date.parse(m.time.replace(" ", "T"));
		  return Number.isFinite(parsed) ? parsed : 0;
		}
		function fmtDur(ms) {
		  const s = Math.max(0, Math.round((ms || 0) / 1e3));
		  if (s < 60) return `${s}s`;
		  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
		  return `${Math.floor(s / 3600)}h ${String(Math.floor(s % 3600 / 60)).padStart(2, "0")}m`;
		}
		function fmtClock2(ms) {
		  if (!Number.isFinite(ms) || ms <= 0) return "";
		  return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
		}
		function fmtBytes(n) {
		  if (n < 1024) return `${n} B`;
		  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
		  return `${(n / 1024 / 1024).toFixed(1)} MB`;
		}
		function computeStepDelay(all, idx, pacing, speed) {
		  if (pacing === "even" || idx <= 0 || idx >= all.length) {
		    return 1400 / speed;
		  }
		  const gap = Math.max(0, msgMs2(all[idx]) - msgMs2(all[idx - 1]));
		  return Math.min(4e3, Math.max(250, gap / 60 / speed));
		}
		function roundRectPath(ctx, x, y, w, h, r) {
		  const rad = Math.min(r, w / 2, h / 2);
		  ctx.beginPath();
		  ctx.moveTo(x + rad, y);
		  ctx.arcTo(x + w, y, x + w, y + h, rad);
		  ctx.arcTo(x + w, y + h, x, y + h, rad);
		  ctx.arcTo(x, y + h, x, y, rad);
		  ctx.arcTo(x, y, x + w, y, rad);
		  ctx.closePath();
		}
		function fitCanvasText(ctx, text, maxW) {
		  const s = String(text || "");
		  if (maxW <= 0) return "";
		  if (ctx.measureText(s).width <= maxW) return s;
		  const ell = "\u2026";
		  const ellW = ctx.measureText(ell).width;
		  let lo = 0;
		  let hi = s.length;
		  while (lo < hi) {
		    const mid = lo + hi + 1 >>> 1;
		    if (ctx.measureText(s.slice(0, mid)).width + ellW <= maxW) lo = mid;
		    else hi = mid - 1;
		  }
		  return lo > 0 ? s.slice(0, lo) + ell : "";
		}
		function resolveCanvasTheme() {
		  const probe = document.createElement("span");
		  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
		  document.documentElement.appendChild(probe);
		  const read = (expr, fallback) => {
		    probe.style.color = "";
		    probe.style.color = expr;
		    return getComputedStyle(probe).color || fallback;
		  };
		  const fallbackFont = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		  probe.style.fontFamily = `var(--ag-font, ${fallbackFont})`;
		  const computedFont = getComputedStyle(probe).fontFamily;
		  const font = computedFont && !computedFont.includes("var(") ? computedFont : fallbackFont;
		  const theme = {
		    bg: read("var(--ag-bg, #f7f7f8)", "#f7f7f8"),
		    fg: read("var(--ag-fg, #1d1f21)", "#1d1f21"),
		    fg2: read("var(--ag-fg-2, #3d4348)", "#3d4348"),
		    muted: read("var(--ag-fg-muted, #5d676f)", "#5d676f"),
		    faint: read("var(--ag-fg-faint, #9da5ab)", "#9da5ab"),
		    fill: read("var(--ag-fill, rgba(29,31,33,0.06))", "rgba(29,31,33,0.06)"),
		    line: read("var(--ag-line, rgba(29,31,33,0.08))", "rgba(29,31,33,0.08)"),
		    track: read("color-mix(in srgb, var(--ag-fg, #1d1f21) 12%, transparent)", "rgba(29,31,33,0.12)"),
		    success: read("var(--ag-success, #63984f)", "#63984f"),
		    nodeBorder: read("color-mix(in srgb, var(--ag-fg, #1d1f21) 22%, transparent)", "rgba(29,31,33,0.22)"),
		    ringStroke: read("color-mix(in srgb, var(--ag-fg, #1d1f21) 30%, transparent)", "rgba(29,31,33,0.30)"),
		    bcastBorder: read("color-mix(in srgb, var(--ag-fg, #1d1f21) 18%, transparent)", "rgba(29,31,33,0.18)"),
		    arrow: read("color-mix(in srgb, var(--ag-fg, #1d1f21) 45%, transparent)", "rgba(29,31,33,0.45)"),
		    font
		  };
		  probe.remove();
		  return theme;
		}
		function drawGraphGifFrame(ctx, opts) {
		  const {
		    width,
		    height,
		    headerH,
		    footerH,
		    graphOffsetY,
		    scale,
		    theme,
		    title,
		    g,
		    expandAll,
		    totalPosts,
		    memberCount,
		    totalDurMs,
		    dotT,
		    stepLabel,
		    isOverview
		  } = opts;
		  ctx.save();
		  ctx.scale(scale, scale);
		  ctx.fillStyle = theme.bg;
		  ctx.fillRect(0, 0, width, height);
		  const padX = 16;
		  ctx.font = `500 11px ${theme.font}`;
		  ctx.textBaseline = "middle";
		  ctx.textAlign = "right";
		  ctx.fillStyle = theme.muted;
		  const stepW = ctx.measureText(stepLabel).width;
		  ctx.fillText(stepLabel, width - padX, headerH / 2);
		  ctx.font = `600 13px ${theme.font}`;
		  ctx.textAlign = "left";
		  ctx.fillStyle = theme.fg;
		  ctx.fillText(fitCanvasText(ctx, title, Math.max(40, width - padX * 2 - stepW - 14)), padX, headerH / 2);
		  ctx.strokeStyle = theme.line;
		  ctx.lineWidth = 1;
		  ctx.beginPath();
		  ctx.moveTo(0, headerH - 0.5);
		  ctx.lineTo(width, headerH - 0.5);
		  ctx.stroke();
		  ctx.save();
		  ctx.translate(0, graphOffsetY);
		  const countLabels = [];
		  const movingDots = [];
		  for (const [k, e] of g.edges) {
		    const [from, to] = k.split(">");
		    const a = g.pos.get(from);
		    const b = g.pos.get(to);
		    if (!a || !b) continue;
		    const n = e.direct + e.viaAll;
		    const geom = computeEdgeGeom(a, b);
		    const w = 1 + 3 * n / g.max;
		    const cur = g.isCur(from, to);
		    ctx.save();
		    ctx.beginPath();
		    ctx.moveTo(geom.start.x, geom.start.y);
		    ctx.quadraticCurveTo(geom.mx, geom.my, geom.end.x, geom.end.y);
		    ctx.strokeStyle = theme.fg;
		    ctx.lineWidth = w;
		    ctx.lineCap = "round";
		    if (!e.direct) ctx.setLineDash([4, 4]);
		    ctx.globalAlpha = cur ? 0.85 : g.replaying ? 0.12 : e.direct ? 0.28 : 0.18;
		    ctx.stroke();
		    ctx.restore();
		    const ang = Math.atan2(geom.end.y - geom.my, geom.end.x - geom.mx);
		    ctx.save();
		    ctx.translate(geom.end.x, geom.end.y);
		    ctx.rotate(ang);
		    ctx.beginPath();
		    ctx.moveTo(-6, -3);
		    ctx.lineTo(0.4, 0);
		    ctx.lineTo(-6, 3);
		    ctx.quadraticCurveTo(-4.7, 0, -6, -3);
		    ctx.closePath();
		    ctx.fillStyle = cur ? theme.fg : theme.arrow;
		    ctx.globalAlpha = cur ? 0.85 : g.replaying ? 0.4 : 1;
		    ctx.fill();
		    ctx.restore();
		    if (n > 1) countLabels.push({ x: geom.mx, y: geom.my, text: String(n) });
		    if (cur && dotT !== null) movingDots.push(geom);
		  }
		  for (const n of g.nodes) {
		    const p = g.pos.get(n.id);
		    if (!p) continue;
		    const status = n.member?.killed ? "killed" : n.member?.state ?? "";
		    const dotX = p.x - p.w / 2 + 14;
		    const labelX = status ? dotX + 9 : p.x - p.w / 2 + 12;
		    const maxChars = Math.max(4, Math.floor((p.x + p.w / 2 - 10 - labelX) / 6.8));
		    const label = n.id.length > maxChars ? `${n.id.slice(0, maxChars - 1)}\u2026` : n.id;
		    const hot = Boolean(g.current && (n.id === g.current.agent || g.curTargets.has(n.id)));
		    const ring = g.unaddressed.get(n.id) ?? 0;
		    const bcast = expandAll ? 0 : g.broadcasts.get(n.id) ?? 0;
		    const killed = status === "killed";
		    const outsider = !n.member;
		    ctx.save();
		    if (!g.isActive(n.id)) ctx.globalAlpha = 0.2;
		    if (ring > 0) {
		      ctx.save();
		      roundRectPath(ctx, p.x - p.w / 2 - 4, p.y - p.h / 2 - 4, p.w + 8, p.h + 8, p.h / 2 + 4);
		      ctx.strokeStyle = theme.ringStroke;
		      ctx.lineWidth = 1;
		      ctx.setLineDash([2, 2.5]);
		      ctx.stroke();
		      ctx.restore();
		    }
		    roundRectPath(ctx, p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, p.h / 2);
		    ctx.fillStyle = theme.bg;
		    ctx.fill();
		    if (hot) {
		      ctx.fillStyle = theme.fill;
		      ctx.fill();
		    }
		    ctx.save();
		    ctx.strokeStyle = hot ? theme.fg : theme.nodeBorder;
		    ctx.lineWidth = hot ? 1.5 : 1;
		    if (outsider) ctx.setLineDash([3, 2]);
		    else if (killed) ctx.setLineDash([2, 2]);
		    ctx.stroke();
		    ctx.restore();
		    if (status) {
		      ctx.beginPath();
		      ctx.arc(dotX, p.y, 3.25, 0, Math.PI * 2);
		      if (status === "working") {
		        ctx.fillStyle = theme.success;
		        ctx.fill();
		      } else if (status === "waiting" || status === "stopped") {
		        ctx.strokeStyle = theme.faint;
		        ctx.lineWidth = 1.5;
		        ctx.stroke();
		      } else if (status === "killed") {
		        ctx.fillStyle = theme.faint;
		        ctx.fill();
		      }
		    }
		    ctx.font = `500 12px ${theme.font}`;
		    ctx.textAlign = "left";
		    ctx.textBaseline = "middle";
		    ctx.fillStyle = killed ? theme.muted : theme.fg;
		    ctx.fillText(label, labelX, p.y + 0.5);
		    if (killed) {
		      const tw = ctx.measureText(label).width;
		      ctx.strokeStyle = theme.muted;
		      ctx.lineWidth = 1;
		      ctx.beginPath();
		      ctx.moveTo(labelX, p.y + 0.5);
		      ctx.lineTo(labelX + tw, p.y + 0.5);
		      ctx.stroke();
		    }
		    if (bcast > 0) {
		      const bw = 30 + 6 * String(bcast).length;
		      const bx = p.x + p.w / 2 - bw + 6;
		      const by = p.y - p.h / 2 - 7;
		      roundRectPath(ctx, bx, by, bw, 14, 7);
		      ctx.fillStyle = theme.bg;
		      ctx.fill();
		      ctx.strokeStyle = theme.bcastBorder;
		      ctx.lineWidth = 1;
		      ctx.stroke();
		      ctx.font = `600 9px ${theme.font}`;
		      ctx.textAlign = "center";
		      ctx.textBaseline = "middle";
		      ctx.fillStyle = theme.muted;
		      ctx.fillText(`@all ${bcast}`, bx + bw / 2, by + 7.5);
		    }
		    ctx.restore();
		  }
		  if (countLabels.length > 0) {
		    ctx.font = `500 10px ${theme.font}`;
		    ctx.textAlign = "center";
		    ctx.textBaseline = "middle";
		    ctx.lineWidth = 4;
		    ctx.lineJoin = "round";
		    ctx.strokeStyle = theme.bg;
		    ctx.fillStyle = theme.muted;
		    for (const c of countLabels) {
		      ctx.strokeText(c.text, c.x, c.y + 0.5);
		      ctx.fillText(c.text, c.x, c.y + 0.5);
		    }
		  }
		  if (dotT !== null) {
		    for (const geom of movingDots) {
		      const t2 = dotT;
		      const u = 1 - t2;
		      const dx = u * u * geom.start.x + 2 * u * t2 * geom.mx + t2 * t2 * geom.end.x;
		      const dy = u * u * geom.start.y + 2 * u * t2 * geom.my + t2 * t2 * geom.end.y;
		      if (t2 < 1) {
		        ctx.save();
		        ctx.beginPath();
		        ctx.arc(dx, dy, 7.5, 0, Math.PI * 2);
		        ctx.fillStyle = theme.fg;
		        ctx.globalAlpha = 0.16;
		        ctx.fill();
		        ctx.restore();
		      }
		      ctx.beginPath();
		      ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
		      ctx.fillStyle = theme.fg;
		      ctx.fill();
		      ctx.strokeStyle = theme.bg;
		      ctx.lineWidth = 2;
		      ctx.stroke();
		    }
		  }
		  ctx.restore();
		  const footY = height - footerH;
		  const pct = totalPosts > 0 ? Math.min(1, g.upto / totalPosts) : isOverview ? 1 : 0;
		  ctx.fillStyle = theme.track;
		  ctx.fillRect(0, footY, width, 2);
		  if (pct > 0) {
		    ctx.fillStyle = theme.fg2;
		    ctx.fillRect(0, footY, Math.round(width * pct), 2);
		  }
		  const capY = footY + 2 + (footerH - 2) / 2;
		  ctx.textBaseline = "middle";
		  ctx.textAlign = "left";
		  let x = padX;
		  const maxRight = width - padX;
		  if (g.current) {
		    const sender = `@${g.current.agent}`;
		    ctx.font = `600 11.5px ${theme.font}`;
		    ctx.fillStyle = theme.fg;
		    ctx.fillText(sender, x, capY);
		    x += ctx.measureText(sender).width;
		    const recips = [
		      ...(g.current.mentions || []).filter((n) => n !== g.current.agent).map((n) => `@${n}`),
		      ...(g.current.channel_mentions || []).map((c) => `@#${c}`),
		      ...g.current.is_all ? ["@all"] : []
		    ].join(" ");
		    const snippet = g.current.text.replace(/\s+/g, " ").trim();
		    const rest = `${recips ? ` \u2192 ${recips}` : ""}${snippet ? ` \xB7 ${snippet}` : ""}`;
		    if (rest && x < maxRight - 10) {
		      ctx.font = `400 11.5px ${theme.font}`;
		      ctx.fillStyle = theme.muted;
		      ctx.fillText(fitCanvasText(ctx, rest, maxRight - x), x, capY);
		    }
		  } else {
		    ctx.font = `400 11.5px ${theme.font}`;
		    ctx.fillStyle = theme.muted;
		    const summary = isOverview ? `${totalPosts} posts \xB7 ${memberCount} members${totalDurMs > 0 ? ` \xB7 ${fmtDur(totalDurMs)}` : ""}` : `Swarm start \xB7 ${memberCount} members`;
		    ctx.fillText(fitCanvasText(ctx, summary, maxRight - x), x, capY);
		  }
		  ctx.restore();
		}
		function gifFilename(title) {
		  const slug = String(title || "swarm").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
		  return `${slug || "swarm"}-graph.gif`;
		}
		function GraphTab(props) {
		  const { snapshot, onJumpToSeq } = props;
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const [view, setView] = (0, import_react11.useState)("hive");
		  const [replayIdx, setReplayIdx] = (0, import_react11.useState)(null);
		  const [playing, setPlaying] = (0, import_react11.useState)(false);
		  const [pacing, setPacing] = (0, import_react11.useState)("even");
		  const [speed, setSpeed] = (0, import_react11.useState)(1);
		  const [expandAll, setExpandAll] = (0, import_react11.useState)(false);
		  const [hideInactive, setHideInactive] = (0, import_react11.useState)(false);
		  const [exportProgress, setExportProgress] = (0, import_react11.useState)(null);
		  const [gifPreview, setGifPreview] = (0, import_react11.useState)(null);
		  const timerRef = (0, import_react11.useRef)(null);
		  const graphMsgs = (0, import_react11.useMemo)(
		    () => (snapshot.messages || []).filter(
		      (m) => m.kind !== "control" && !m.control && snapshot.members[m.agent]?.role !== "monitor"
		    ),
		    [snapshot.messages, snapshot.members]
		  );
		  const total = graphMsgs.length;
		  const replaying = replayIdx !== null;
		  const upto = replaying ? Math.min(replayIdx, total) : total;
		  const current = replaying && upto > 0 ? graphMsgs[upto - 1] : null;
		  const replaySeq = replaying ? current ? current.seq : 0 : null;
		  const stopPlayback = (0, import_react11.useCallback)(() => {
		    setPlaying(false);
		    if (timerRef.current) {
		      clearTimeout(timerRef.current);
		      timerRef.current = null;
		    }
		  }, []);
		  (0, import_react11.useEffect)(() => {
		    return () => {
		      if (timerRef.current) clearTimeout(timerRef.current);
		    };
		  }, []);
		  (0, import_react11.useEffect)(() => {
		    return () => {
		      if (gifPreview?.url) URL.revokeObjectURL(gifPreview.url);
		    };
		  }, [gifPreview?.url]);
		  (0, import_react11.useEffect)(() => {
		    if (!playing) return;
		    if (replayIdx === null || replayIdx >= total) {
		      stopPlayback();
		      return;
		    }
		    const delay = computeStepDelay(graphMsgs, replayIdx, pacing, speed);
		    timerRef.current = setTimeout(() => {
		      setReplayIdx((prev) => {
		        const next = (prev ?? 0) + 1;
		        if (next >= total) {
		          setPlaying(false);
		          return total;
		        }
		        return next;
		      });
		    }, delay);
		    return () => {
		      if (timerRef.current) {
		        clearTimeout(timerRef.current);
		        timerRef.current = null;
		      }
		    };
		  }, [playing, replayIdx, total, graphMsgs, pacing, speed, stopPlayback]);
		  const handleTogglePlay = (0, import_react11.useCallback)(() => {
		    if (playing) {
		      stopPlayback();
		      return;
		    }
		    if (total === 0) return;
		    if (replayIdx === null || replayIdx >= total) {
		      setReplayIdx(0);
		    }
		    setPlaying(true);
		  }, [playing, total, replayIdx, stopPlayback]);
		  const handleSeek = (0, import_react11.useCallback)(
		    (idx) => {
		      stopPlayback();
		      setReplayIdx(Math.max(0, Math.min(total, idx)));
		    },
		    [stopPlayback, total]
		  );
		  const handleLive = (0, import_react11.useCallback)(() => {
		    stopPlayback();
		    setReplayIdx(null);
		  }, [stopPlayback]);
		  (0, import_react11.useEffect)(() => {
		    const onKeyDown = (e) => {
		      const target = e.target;
		      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
		      if (e.code === "Space") {
		        e.preventDefault();
		        handleTogglePlay();
		      } else if (e.key === "ArrowLeft") {
		        e.preventDefault();
		        handleSeek((replayIdx ?? total) - 1);
		      } else if (e.key === "ArrowRight") {
		        e.preventDefault();
		        if (replayIdx !== null) handleSeek(replayIdx + 1);
		      }
		    };
		    window.addEventListener("keydown", onKeyDown);
		    return () => window.removeEventListener("keydown", onKeyDown);
		  }, [handleTogglePlay, handleSeek, replayIdx, total]);
		  const handleExportGif = (0, import_react11.useCallback)(async () => {
		    if (exportProgress !== null) return;
		    setExportProgress(t("graph.exporting"));
		    try {
		      const logicalW = 640;
		      const title = snapshot.title || "Untitled swarm";
		      const filename = gifFilename(title);
		      const theme = resolveCanvasTheme();
		      const memberCount = Object.values(snapshot.members || {}).filter(
		        (m) => m.role !== "monitor"
		      ).length;
		      const MAX_STEPS = 120;
		      const stepKs = [];
		      if (graphMsgs.length <= MAX_STEPS) {
		        for (let k = 1; k <= graphMsgs.length; k++) stepKs.push(k);
		      } else {
		        for (let i = 0; i < MAX_STEPS; i++) {
		          const k = Math.max(1, Math.min(graphMsgs.length, Math.round(1 + i * (graphMsgs.length - 1) / (MAX_STEPS - 1))));
		          if (stepKs[stepKs.length - 1] !== k) stepKs.push(k);
		        }
		      }
		      const dotTs = graphMsgs.length <= 25 ? [0.15, 0.55, 1] : graphMsgs.length <= 60 ? [0.45, 1] : [1];
		      const plan = [];
		      let maxGraphH = 220;
		      if (graphMsgs.length === 0) {
		        const overview = computeGraphState(snapshot, graphMsgs, {
		          replaying: false,
		          upto: 0,
		          expandAll,
		          hideInactive,
		          width: logicalW
		        });
		        maxGraphH = Math.max(maxGraphH, overview.height);
		        plan.push({ k: 0, isOverview: true, dotT: null, stepLabel: "Overview", delayMs: 1200 });
		      } else {
		        const startG = computeGraphState(snapshot, graphMsgs, {
		          replaying: true,
		          upto: 0,
		          expandAll,
		          hideInactive,
		          width: logicalW
		        });
		        maxGraphH = Math.max(maxGraphH, startG.height);
		        plan.push({ k: 0, isOverview: false, dotT: null, stepLabel: `0 / ${graphMsgs.length}`, delayMs: 450 });
		        for (const k of stepKs) {
		          const g = computeGraphState(snapshot, graphMsgs, {
		            replaying: true,
		            upto: k,
		            expandAll,
		            hideInactive,
		            width: logicalW
		          });
		          if (g.height > maxGraphH) maxGraphH = g.height;
		          const postMs = Math.round(Math.min(2e3, Math.max(240, computeStepDelay(graphMsgs, k, pacing, speed))));
		          const seq = g.current?.seq ?? k;
		          const stepLabel = `${k} / ${graphMsgs.length} \xB7 #${seq}`;
		          const hasCurEdge = dotTs.length > 1 && [...g.edges.keys()].some((ek) => {
		            const [from, to] = ek.split(">");
		            return g.isCur(from, to) && g.pos.has(from) && g.pos.has(to);
		          });
		          if (hasCurEdge) {
		            const travelTotal = Math.min(Math.round(postMs * 0.55), 480);
		            const subDelay = Math.max(70, Math.round(travelTotal / (dotTs.length - 1)));
		            for (let i = 0; i < dotTs.length - 1; i++) {
		              plan.push({ k, isOverview: false, dotT: dotTs[i], stepLabel, delayMs: subDelay });
		            }
		            plan.push({ k, isOverview: false, dotT: 1, stepLabel, delayMs: Math.max(140, postMs - subDelay * (dotTs.length - 1)) });
		          } else {
		            plan.push({ k, isOverview: false, dotT: 1, stepLabel, delayMs: postMs });
		          }
		        }
		        const endG = computeGraphState(snapshot, graphMsgs, {
		          replaying: false,
		          upto: graphMsgs.length,
		          expandAll,
		          hideInactive,
		          width: logicalW
		        });
		        if (endG.height > maxGraphH) maxGraphH = endG.height;
		        plan.push({ k: graphMsgs.length, isOverview: true, dotT: null, stepLabel: "Overview", delayMs: 1400 });
		      }
		      const headerH = 36;
		      const footerH = 34;
		      const padY = 8;
		      const logicalH = Math.ceil(headerH + padY * 2 + maxGraphH + footerH);
		      const scale = logicalH > 820 ? 820 / logicalH : 1;
		      const canvasW = Math.max(1, Math.round(logicalW * scale));
		      const canvasH = Math.max(1, Math.round(logicalH * scale));
		      const canvas = document.createElement("canvas");
		      canvas.width = canvasW;
		      canvas.height = canvasH;
		      const ctx = canvas.getContext("2d", { willReadFrequently: true });
		      if (!ctx) throw new Error("Canvas 2D context unavailable");
		      const totalDurMs = graphMsgs.length > 1 ? Math.max(0, msgMs2(graphMsgs[graphMsgs.length - 1]) - msgMs2(graphMsgs[0])) : 0;
		      const renderFrame = (f) => {
		        const g = computeGraphState(snapshot, graphMsgs, {
		          replaying: !f.isOverview,
		          upto: f.k,
		          expandAll,
		          hideInactive,
		          width: logicalW
		        });
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
		          isOverview: f.isOverview
		        });
		        return ctx.getImageData(0, 0, canvasW, canvasH).data;
		      };
		      const sampleIdxSet = /* @__PURE__ */ new Set([0, plan.length - 1]);
		      const sampleCap = Math.min(plan.length, 8);
		      for (let i = 1; i < sampleCap - 1; i++) {
		        sampleIdxSet.add(Math.round(i * (plan.length - 1) / (sampleCap - 1)));
		      }
		      const sampleFrames = [...sampleIdxSet].sort((a, b) => a - b).map((idx) => new Uint8Array(renderFrame(plan[idx])));
		      const enc = createGifEncoder({
		        width: canvasW,
		        height: canvasH,
		        sampleFrames,
		        repeat: 0,
		        useDelta: plan.length > 1
		      });
		      let lastYield = performance.now();
		      for (let i = 0; i < plan.length; i++) {
		        const rgba = renderFrame(plan[i]);
		        enc.addFrame(rgba, plan[i].delayMs);
		        if (i + 1 < plan.length && performance.now() - lastYield >= 16) {
		          setExportProgress(
		            isZh ? `\u5BFC\u51FA\u4E2D ${Math.round((i + 1) / plan.length * 100)}%` : `Exporting ${Math.round((i + 1) / plan.length * 100)}%`
		          );
		          await new Promise((r) => setTimeout(r, 0));
		          lastYield = performance.now();
		        }
		      }
		      const bytes = enc.finish();
		      const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], { type: "image/gif" });
		      const url = URL.createObjectURL(blob);
		      const meta = isZh ? `${plan.length} \u5E27 \xB7 ${fmtBytes(bytes.length)}` : `${plan.length} ${plan.length === 1 ? "frame" : "frames"} \xB7 ${fmtBytes(bytes.length)}`;
		      setGifPreview((prev) => {
		        if (prev?.url) URL.revokeObjectURL(prev.url);
		        return { url, filename, meta };
		      });
		      try {
		        const a = document.createElement("a");
		        a.href = url;
		        a.download = filename;
		        document.body.appendChild(a);
		        a.click();
		        a.remove();
		      } catch {
		      }
		    } catch (err) {
		      console.warn("[dsh-ag-swarm] GIF export failed:", err);
		    } finally {
		      setExportProgress(null);
		    }
		  }, [exportProgress, snapshot, graphMsgs, expandAll, hideInactive, pacing, speed]);
		  const t0 = graphMsgs.length > 0 ? msgMs2(graphMsgs[0]) : 0;
		  const lastMs = graphMsgs.length > 0 ? msgMs2(graphMsgs[graphMsgs.length - 1]) : 0;
		  const pct = total > 0 ? 100 * upto / total : 100;
		  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "ag-graph-tab", "data-testid": "swarm-graph-tab", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "ag-player", style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "ag-player-row", style: { display: "flex", alignItems: "center", gap: 4, minWidth: 0 }, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-icon-btn",
		            disabled: replayIdx === 0 || total === 0,
		            title: isZh ? "\u91CD\u7F6E\u5230\u8D77\u70B9" : "Reset to start",
		            "aria-label": isZh ? "\u91CD\u7F6E\u56DE\u653E" : "Reset replay",
		            onClick: () => handleSeek(0),
		            children: "\u23EE"
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-icon-btn",
		            disabled: upto <= 0 || total === 0,
		            title: isZh ? "\u4E0A\u4E00\u6761 (\u2190)" : "Previous post (\u2190)",
		            "aria-label": isZh ? "\u4E0A\u4E00\u6761" : "Previous post",
		            onClick: () => handleSeek(upto - 1),
		            children: "\u25C0"
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-icon-btn",
		            disabled: total === 0,
		            title: playing ? isZh ? "\u6682\u505C (Space)" : "Pause (Space)" : isZh ? "\u64AD\u653E (Space)" : "Play (Space)",
		            "aria-label": playing ? isZh ? "\u6682\u505C\u56DE\u653E" : "Pause replay" : isZh ? "\u64AD\u653E\u56DE\u653E" : "Play replay",
		            onClick: handleTogglePlay,
		            style: { background: "var(--ag-fill, rgba(128,128,128,0.1))", color: "var(--ag-fg, inherit)" },
		            children: playing ? "\u275A\u275A" : "\u25B6"
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-icon-btn",
		            disabled: !replaying || upto >= total,
		            title: isZh ? "\u4E0B\u4E00\u6761 (\u2192)" : "Next post (\u2192)",
		            "aria-label": isZh ? "\u4E0B\u4E00\u6761" : "Next post",
		            onClick: () => handleSeek(upto + 1),
		            children: "\u25B6"
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		          "input",
		          {
		            type: "range",
		            className: "ag-slider",
		            min: 0,
		            max: total,
		            value: upto,
		            disabled: total === 0,
		            "aria-label": isZh ? "\u56DE\u653E\u65F6\u95F4\u8F74" : "Replay timeline",
		            onChange: (e) => handleSeek(Number(e.target.value)),
		            style: {
		              flex: "1 1 auto",
		              minWidth: 60,
		              cursor: "pointer",
		              accentColor: "var(--ag-fg, #1d1f21)",
		              background: `linear-gradient(to right, var(--ag-fg-2, #3d4348) ${pct}%, color-mix(in srgb, var(--ag-fg, #1d1f21) 14%, transparent) ${pct}%)`,
		              height: 4,
		              borderRadius: 999
		            }
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
		          "button",
		          {
		            type: "button",
		            className: `ag-pill-btn${!replaying ? " on" : ""}`,
		            "aria-pressed": !replaying,
		            onClick: handleLive,
		            title: isZh ? "\u5207\u56DE\u5B9E\u65F6\u89C6\u56FE" : "Return to live view",
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		                "span",
		                {
		                  className: "ag-live-dot",
		                  style: {
		                    background: !replaying ? "var(--ag-success, #63984f)" : "var(--ag-fg-faint, #9da5ab)"
		                  }
		                }
		              ),
		              t("common.live")
		            ]
		          }
		        )
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
		        "div",
		        {
		          className: "ag-player-row ag-player-sub",
		          style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 10px" },
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		              "div",
		              {
		                className: "ag-segmented",
		                role: "group",
		                "aria-label": isZh ? "\u56FE\u8C31\u89C6\u56FE\u6A21\u5F0F" : "Graph view mode",
		                style: {
		                  display: "inline-flex",
		                  gap: 2,
		                  padding: 2,
		                  borderRadius: 8,
		                  background: "var(--ag-fill, rgba(128,128,128,0.08))"
		                },
		                children: ["hive", "mentions"].map((mode) => {
		                  const on = view === mode;
		                  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		                    "button",
		                    {
		                      type: "button",
		                      "aria-pressed": on,
		                      onClick: () => setView(mode),
		                      style: {
		                        height: 24,
		                        padding: "0 10px",
		                        border: 0,
		                        borderRadius: 6,
		                        fontSize: 12,
		                        background: on ? "var(--ag-bg, #ffffff)" : "transparent",
		                        color: on ? "var(--ag-fg, inherit)" : "var(--ag-fg-muted, #5d676f)",
		                        boxShadow: on ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
		                        cursor: "pointer"
		                      },
		                      children: mode === "hive" ? t("graph.hive") : t("graph.mentions")
		                    },
		                    mode
		                  );
		                })
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		              "span",
		              {
		                className: "ag-replay-label",
		                style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)", fontVariantNumeric: "tabular-nums" },
		                children: !replaying ? total > 1 && lastMs > t0 ? t("graph.postsOver", { count: total, span: fmtDur(lastMs - t0) }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("strong", { style: { color: "var(--ag-fg, inherit)" }, children: isZh ? `${total} \u6761\u52A8\u6001` : `${total} ${total === 1 ? "post" : "posts"}` }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("strong", { style: { color: "var(--ag-fg, inherit)" }, children: upto }),
		                  " / ",
		                  total,
		                  current ? ` \xB7 #${current.seq} \xB7 ${fmtClock2(msgMs2(current))} (+${fmtDur(msgMs2(current) - t0)})` : ""
		                ] })
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { marginLeft: "auto", display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: 8 }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { className: "ag-select", title: isZh ? "\u56DE\u653E\u8282\u594F" : "Replay pacing", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
		                "select",
		                {
		                  "aria-label": isZh ? "\u56DE\u653E\u8282\u594F" : "Replay pacing",
		                  value: pacing,
		                  onChange: (e) => setPacing(e.target.value),
		                  style: { fontSize: 12, height: 26 },
		                  children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: "even", children: t("graph.evenPacing") }),
		                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: "realtime", children: t("graph.realTime") })
		                  ]
		                }
		              ) }),
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { className: "ag-select", title: isZh ? "\u64AD\u653E\u500D\u901F" : "Playback speed", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		                "select",
		                {
		                  "aria-label": isZh ? "\u64AD\u653E\u500D\u901F" : "Playback speed",
		                  value: String(speed),
		                  onChange: (e) => setSpeed(Number(e.target.value) || 1),
		                  style: { fontSize: 12, height: 26 },
		                  children: SPEEDS.map((sp) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("option", { value: String(sp), children: [
		                    sp,
		                    "\xD7"
		                  ] }, sp))
		                }
		              ) }),
		              view === "mentions" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "ag-switch", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { type: "checkbox", checked: hideInactive, onChange: (e) => setHideInactive(e.target.checked) }),
		                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "ag-switch-track" }),
		                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: t("graph.hideInactive") })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "ag-switch", children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { type: "checkbox", checked: expandAll, onChange: (e) => setExpandAll(e.target.checked) }),
		                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "ag-switch-track" }),
		                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: t("graph.expandAll") })
		                ] })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		                "button",
		                {
		                  type: "button",
		                  className: "ag-btn sm",
		                  disabled: exportProgress !== null,
		                  onClick: () => void handleExportGif(),
		                  "data-testid": "swarm-export-gif",
		                  children: exportProgress ?? t("graph.exportGif")
		                }
		              )
		            ] })
		          ]
		        }
		      )
		    ] }),
		    view === "hive" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		      HiveCanvas,
		      {
		        snapshot,
		        messages: graphMsgs,
		        replaySeq,
		        onJumpToSeq
		      }
		    ) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		      MentionsGraph,
		      {
		        snapshot,
		        messages: graphMsgs,
		        replaying,
		        upto,
		        expandAll,
		        hideInactive,
		        onJumpToSeq
		      }
		    ),
		    current && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
		      "div",
		      {
		        className: "ag-replay-caption",
		        "data-testid": "swarm-replay-caption",
		        style: {
		          marginTop: 12,
		          padding: "10px 12px",
		          borderRadius: 8,
		          background: "var(--ag-fill, rgba(128,128,128,0.08))",
		          fontSize: 13
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("strong", { children: [
		              "@",
		              current.agent
		            ] }),
		            (current.mentions.length > 0 || current.channel_mentions.length > 0 || current.is_all) && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)" }, children: [
		              "\u2192",
		              " ",
		              [
		                ...current.mentions.filter((n) => n !== current.agent).map((n) => `@${n}`),
		                ...current.channel_mentions.map((c) => `@#${c}`),
		                ...current.is_all ? ["@all"] : []
		              ].join(" ")
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
		              "button",
		              {
		                type: "button",
		                className: "ag-ghost-btn",
		                onClick: () => onJumpToSeq(current.seq),
		                style: { marginLeft: "auto", height: 22, padding: "0 6px", fontFamily: "var(--ag-mono, monospace)", fontSize: 11 },
		                children: [
		                  "#",
		                  current.seq,
		                  " \xB7 ",
		                  fmtClock2(msgMs2(current))
		                ]
		              }
		            )
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 160, overflow: "auto", color: "var(--ag-fg-2, inherit)" }, children: current.text })
		        ]
		      }
		    ),
		    gifPreview && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		      "div",
		      {
		        className: "ag-gif-modal",
		        "data-testid": "swarm-gif-modal",
		        onClick: (e) => {
		          if (e.target === e.currentTarget) setGifPreview(null);
		        },
		        style: {
		          position: "fixed",
		          inset: 0,
		          zIndex: 70,
		          display: "grid",
		          placeItems: "center",
		          padding: 16,
		          background: "rgba(0, 0, 0, 0.48)"
		        },
		        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
		          "div",
		          {
		            style: {
		              width: "min(92vw, 720px)",
		              maxHeight: "90vh",
		              display: "flex",
		              flexDirection: "column",
		              overflow: "hidden",
		              borderRadius: 10,
		              background: "var(--ag-card, #ffffff)",
		              color: "var(--ag-fg, inherit)",
		              border: "1px solid var(--ag-card-border, rgba(128,128,128,0.2))",
		              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.28)"
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--ag-line, rgba(128,128,128,0.14))" }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: gifPreview.filename }),
		                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { fontSize: 11, color: "var(--ag-fg-muted, #5d676f)" }, children: gifPreview.meta })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		                  "a",
		                  {
		                    href: gifPreview.url,
		                    download: gifPreview.filename,
		                    className: "ag-btn primary sm",
		                    style: { textDecoration: "none" },
		                    children: isZh ? "\u4E0B\u8F7D GIF" : "Download GIF"
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", className: "ag-icon-btn", onClick: () => setGifPreview(null), "aria-label": t("common.close"), children: "\u2715" })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { padding: 12, overflow: "auto", display: "flex", justifyContent: "center", background: "var(--ag-bg, #f7f7f8)" }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
		                "img",
		                {
		                  src: gifPreview.url,
		                  alt: `${snapshot.title || "Swarm"} graph replay`,
		                  style: { maxWidth: "100%", maxHeight: "66vh", borderRadius: 6, border: "1px solid var(--ag-line, rgba(128,128,128,0.14))" }
		                }
		              ) })
		            ]
		          }
		        )
		      }
		    )
		  ] });
		}
		
		// client/components/RawTab.tsx
		var import_react12 = require("react");
		var import_jsx_runtime9 = require("react/jsx-runtime");
		var FILE_ORDER = ["swarm.json", "members.json", "board.jsonl", "plan.json"];
		function fmtBytes2(n) {
		  if (n < 1024) return `${n} B`;
		  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
		  return `${(n / 1024 / 1024).toFixed(1)} MB`;
		}
		async function copyToClipboard(text) {
		  try {
		    await navigator.clipboard.writeText(text);
		    return true;
		  } catch {
		  }
		  try {
		    const ta = document.createElement("textarea");
		    ta.value = text;
		    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
		    document.body.appendChild(ta);
		    ta.select();
		    const ok = document.execCommand("copy");
		    ta.remove();
		    return ok;
		  } catch {
		    return false;
		  }
		}
		function RawTab(props) {
		  const { swarmId } = props;
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const [selected, setSelected] = (0, import_react12.useState)("members.json");
		  const [payload, setPayload] = (0, import_react12.useState)(null);
		  const [loading, setLoading] = (0, import_react12.useState)(false);
		  const [error, setError] = (0, import_react12.useState)(null);
		  const [copied, setCopied] = (0, import_react12.useState)(false);
		  const load = (0, import_react12.useCallback)(async () => {
		    if (!swarmId) return;
		    setLoading(true);
		    setError(null);
		    try {
		      const data = await swarmClientStore.fetchRawFiles(swarmId);
		      setPayload(data);
		    } catch (err) {
		      setError(err instanceof Error ? err.message : String(err));
		    } finally {
		      setLoading(false);
		    }
		  }, [swarmId]);
		  (0, import_react12.useEffect)(() => {
		    void load();
		  }, [load]);
		  const fileEntry = payload?.files.find((f) => f.name === selected) ?? null;
		  const content = fileEntry?.content ?? "";
		  const bytes = fileEntry?.bytes ?? content.length;
		  const lines = fileEntry?.lines ?? (content ? content.split("\n").filter(Boolean).length : 0);
		  const filePath = fileEntry?.path || (payload?.storage_path ? `${payload.storage_path}/${selected}` : selected);
		  const handleCopy = (0, import_react12.useCallback)(async () => {
		    if (!content) return;
		    const ok = await copyToClipboard(content);
		    if (ok) {
		      setCopied(true);
		      setTimeout(() => setCopied(false), 1800);
		    }
		  }, [content]);
		  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "ag-raw-tab", "data-testid": "swarm-raw-tab", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
		      "div",
		      {
		        className: "ag-raw-toolbar",
		        style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		            "div",
		            {
		              className: "ag-segmented",
		              role: "tablist",
		              "aria-label": "Raw swarm files",
		              style: {
		                display: "inline-flex",
		                gap: 2,
		                padding: 2,
		                borderRadius: "var(--ag-r-lg, 8px)",
		                background: "var(--ag-fill, rgba(128,128,128,0.08))"
		              },
		              children: FILE_ORDER.map((name2) => {
		                const on = selected === name2;
		                return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		                  "button",
		                  {
		                    type: "button",
		                    role: "tab",
		                    "aria-selected": on,
		                    className: `ag-raw-btn${on ? " on" : ""}`,
		                    onClick: () => setSelected(name2),
		                    style: {
		                      height: 24,
		                      padding: "0 10px",
		                      border: 0,
		                      borderRadius: "var(--ag-r-md, 6px)",
		                      background: on ? "var(--ag-bg, #ffffff)" : "transparent",
		                      color: on ? "var(--ag-fg, inherit)" : "var(--ag-fg-muted, #5d676f)",
		                      fontFamily: "var(--ag-mono, monospace)",
		                      fontSize: "var(--ag-text-2xs, 11px)",
		                      boxShadow: on ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
		                      cursor: "pointer"
		                    },
		                    children: name2
		                  },
		                  name2
		                );
		              })
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { style: { marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4 }, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		              "button",
		              {
		                type: "button",
		                className: "ag-ghost-btn",
		                onClick: () => void load(),
		                disabled: loading,
		                children: loading ? t("common.refreshing") : t("raw.refresh")
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		              "button",
		              {
		                type: "button",
		                className: "ag-btn sm",
		                onClick: () => void handleCopy(),
		                disabled: !content,
		                children: copied ? t("common.copied") : t("common.copy")
		              }
		            )
		          ] })
		        ]
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
		      "div",
		      {
		        className: "ag-raw-meta",
		        style: {
		          display: "flex",
		          alignItems: "baseline",
		          gap: 6,
		          marginBottom: 8,
		          fontSize: "var(--ag-text-xs, 12px)",
		          color: "var(--ag-fg-muted, #5d676f)"
		        },
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		            "span",
		            {
		              className: "ag-raw-path",
		              title: filePath,
		              style: {
		                flex: "0 1 auto",
		                minWidth: 0,
		                fontFamily: "var(--ag-mono, monospace)",
		                fontSize: "var(--ag-text-2xs, 11px)",
		                whiteSpace: "nowrap",
		                overflow: "hidden",
		                textOverflow: "ellipsis",
		                direction: "rtl",
		                textAlign: "left"
		              },
		              children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { dir: "ltr", children: filePath })
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "ag-raw-size", style: { flex: "none", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }, children: [
		            "\xB7 ",
		            fmtBytes2(bytes),
		            " \xB7 ",
		            isZh ? `${lines} \u884C` : `${lines} ${lines === 1 ? "line" : "lines"}`
		          ] })
		        ]
		      }
		    ),
		    error && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		      "div",
		      {
		        role: "alert",
		        style: {
		          marginBottom: 8,
		          padding: "8px 10px",
		          borderRadius: "var(--ag-r-md, 6px)",
		          background: "color-mix(in srgb, var(--ag-error, #cb3d3d) 12%, transparent)",
		          color: "var(--ag-error, #cb3d3d)",
		          fontSize: "var(--ag-text-xs, 12px)"
		        },
		        children: isZh ? `\u52A0\u8F7D\u539F\u59CB\u6587\u4EF6\u5931\u8D25\uFF1A${error}` : `Failed to load raw files: ${error}`
		      }
		    ),
		    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
		      "pre",
		      {
		        className: "ag-raw",
		        "data-testid": "swarm-raw-content",
		        style: {
		          margin: 0,
		          padding: 12,
		          background: "var(--ag-fill, rgba(128,128,128,0.08))",
		          borderRadius: "var(--ag-r-lg, 8px)",
		          fontFamily: "var(--ag-mono, monospace)",
		          fontSize: "var(--ag-text-xs, 12px)",
		          lineHeight: 1.6,
		          whiteSpace: "pre-wrap",
		          wordBreak: "break-word",
		          color: "var(--ag-fg-2, inherit)",
		          maxHeight: "65vh",
		          overflow: "auto",
		          tabSize: 2
		        },
		        children: content || (loading ? isZh ? "\u52A0\u8F7D\u4E2D\u2026" : "Loading\u2026" : isZh ? "\uFF08\u7A7A\uFF09" : "(empty)")
		      }
		    )
		  ] });
		}
		
		// client/components/SettingsSection.tsx
		var import_react13 = require("react");
		
		// src/shared/protocol.ts
		var BUILTIN_MODEL_ROLES = ["default", "explorer", "author", "verifier", "monitor"];
		
		// client/components/SettingsSection.tsx
		var import_jsx_runtime10 = require("react/jsx-runtime");
		var DEFAULT_CONFIG = {
		  storageDir: "~/.dsh/storages/ag-swarm",
		  maxWorkers: 12,
		  maxDepth: 2,
		  stallCheckIntervalMs: 18e4,
		  enableStallMonitor: true,
		  enableWorktrees: true,
		  registerSwarmCommandAlias: true,
		  waitToolName: "swarm_wait",
		  primaryCommand: "swarm",
		  modelPresets: {}
		};
		var ROLE_NAME_RE = /^[a-z0-9][a-z0-9_-]{0,23}$/;
		var BUILTIN_SET = new Set(BUILTIN_MODEL_ROLES);
		function formatUpdated(iso, isZh) {
		  const ts = Date.parse(iso);
		  if (!Number.isFinite(ts)) return iso || "";
		  const diffSec = Math.max(0, Math.round((Date.now() - ts) / 1e3));
		  if (diffSec < 60) return isZh ? `${diffSec}\u79D2\u524D` : `${diffSec}s ago`;
		  if (diffSec < 3600) return isZh ? `${Math.floor(diffSec / 60)}\u5206\u949F\u524D` : `${Math.floor(diffSec / 60)}m ago`;
		  if (diffSec < 86400) return isZh ? `${Math.floor(diffSec / 3600)}\u5C0F\u65F6\u524D` : `${Math.floor(diffSec / 3600)}h ago`;
		  return new Date(ts).toLocaleDateString();
		}
		function roleDisplayLabel(role) {
		  if (BUILTIN_SET.has(role)) {
		    return t(`role.${role}`);
		  }
		  return role;
		}
		function catalogKey(provider, model) {
		  return `${provider ?? ""}::${model}`;
		}
		function RoleModelPresetsCard() {
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const [storeState, setStoreState] = (0, import_react13.useState)(() => swarmClientStore.getState());
		  const [draftPresets, setDraftPresets] = (0, import_react13.useState)({});
		  const [customRoles, setCustomRoles] = (0, import_react13.useState)([]);
		  const [manualRoles, setManualRoles] = (0, import_react13.useState)({});
		  const [newRoleInput, setNewRoleInput] = (0, import_react13.useState)("");
		  const [roleInputErr, setRoleInputErr] = (0, import_react13.useState)(null);
		  const [savingPresets, setSavingPresets] = (0, import_react13.useState)(false);
		  const [saveFeedback, setSaveFeedback] = (0, import_react13.useState)(null);
		  (0, import_react13.useEffect)(() => {
		    const release = swarmClientStore.retain();
		    const unsub = swarmClientStore.subscribe((next) => setStoreState(next));
		    void swarmClientStore.listModels().catch(() => {
		    });
		    void fetch("/ag-swarm/api/config", { cache: "no-store" }).then((res) => res.ok ? res.json() : null).then((raw) => {
		      if (!raw || typeof raw !== "object") return;
		      const obj = raw.config ?? raw;
		      if (obj.modelPresets && typeof obj.modelPresets === "object") {
		        const presets = obj.modelPresets;
		        setDraftPresets(presets);
		        setCustomRoles(Object.keys(presets).filter((k) => !BUILTIN_SET.has(k)));
		      }
		    }).catch(() => {
		    });
		    return () => {
		      unsub();
		      release();
		    };
		  }, []);
		  const catalogByKey = (0, import_react13.useMemo)(() => {
		    const map = /* @__PURE__ */ new Map();
		    for (const m of storeState.models) {
		      map.set(catalogKey(m.provider, m.model), m);
		    }
		    return map;
		  }, [storeState.models]);
		  const allRoleKeys = (0, import_react13.useMemo)(() => {
		    const seen = new Set(BUILTIN_MODEL_ROLES);
		    const extras = customRoles.filter((r) => !seen.has(r));
		    return [...BUILTIN_MODEL_ROLES, ...extras];
		  }, [customRoles]);
		  const updateRolePreset = (0, import_react13.useCallback)((role, updater) => {
		    setSaveFeedback(null);
		    setDraftPresets((prev) => {
		      const next = { ...prev };
		      const updated = updater(prev[role]);
		      if (!updated || !updated.model.trim()) {
		        delete next[role];
		      } else {
		        next[role] = updated;
		      }
		      return next;
		    });
		  }, []);
		  const handleAddRole = (0, import_react13.useCallback)(() => {
		    const normalized = newRoleInput.trim().toLowerCase();
		    if (!normalized) return;
		    if (!ROLE_NAME_RE.test(normalized)) {
		      setRoleInputErr(
		        isZh ? "\u89D2\u8272\u540D\u9700\u4E3A\u5C0F\u5199\u5B57\u6BCD/\u6570\u5B57\u5F00\u5934\uFF0C\u4EC5\u542B a-z\u30010-9\u3001-\u3001_\uFF08\u6700\u591A 24 \u5B57\u7B26\uFF09" : "Role name must match ^[a-z0-9][a-z0-9_-]{0,23}$"
		      );
		      return;
		    }
		    if (BUILTIN_SET.has(normalized) || customRoles.includes(normalized)) {
		      setRoleInputErr(isZh ? `\u89D2\u8272 "${normalized}" \u5DF2\u5B58\u5728` : `Role "${normalized}" already exists`);
		      return;
		    }
		    setRoleInputErr(null);
		    setCustomRoles((prev) => [...prev, normalized]);
		    setNewRoleInput("");
		  }, [newRoleInput, customRoles, isZh]);
		  const handleRemoveRole = (0, import_react13.useCallback)((role) => {
		    if (BUILTIN_SET.has(role)) return;
		    setCustomRoles((prev) => prev.filter((r) => r !== role));
		    setManualRoles((prev) => {
		      const next = { ...prev };
		      delete next[role];
		      return next;
		    });
		    setDraftPresets((prev) => {
		      const next = { ...prev };
		      delete next[role];
		      return next;
		    });
		    setSaveFeedback(null);
		  }, []);
		  const handleSavePresets = (0, import_react13.useCallback)(async () => {
		    setSavingPresets(true);
		    setSaveFeedback(null);
		    try {
		      const cleaned = {};
		      for (const role of allRoleKeys) {
		        const p = draftPresets[role];
		        if (p && p.model.trim()) {
		          const cat = catalogByKey.get(catalogKey(p.provider, p.model));
		          const rawEff = p.reasoningEffort?.trim();
		          const validEff = rawEff && (!cat?.reasoningKnown || cat.efforts?.some((e) => e.id === rawEff)) ? rawEff : void 0;
		          cleaned[role] = {
		            ...p.provider?.trim() ? { provider: p.provider.trim() } : {},
		            model: p.model.trim(),
		            ...validEff ? { reasoningEffort: validEff } : {},
		            ...p.label?.trim() ? { label: p.label.trim() } : {}
		          };
		        }
		      }
		      const res = await fetch("/ag-swarm/api/model-presets", {
		        method: "POST",
		        headers: { "content-type": "application/json" },
		        body: JSON.stringify({ modelPresets: cleaned })
		      });
		      const json = await res.json().catch(() => ({}));
		      if (!res.ok || json.ok === false) {
		        throw new Error(json.error || `HTTP ${res.status}`);
		      }
		      const saved = json.modelPresets ?? cleaned;
		      setDraftPresets(saved);
		      setSaveFeedback({ kind: "ok", text: t("settings.presetsSaved") });
		    } catch (err) {
		      setSaveFeedback({
		        kind: "err",
		        text: err instanceof Error ? err.message : String(err)
		      });
		    } finally {
		      setSavingPresets(false);
		    }
		  }, [allRoleKeys, draftPresets]);
		  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		    "div",
		    {
		      className: "ag-settings-card",
		      "data-testid": "swarm-role-models-card",
		      style: {
		        padding: "12px 14px",
		        borderRadius: 10,
		        border: "1px solid var(--ag-card-border, rgba(128,128,128,0.2))",
		        background: "var(--ag-card, #ffffff)",
		        display: "flex",
		        flexDirection: "column",
		        gap: 10
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ag-fg-muted, #5d676f)" }, children: t("settings.roleModelsTitle") }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)", marginTop: 3 }, children: t("settings.roleModelsDesc") })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: allRoleKeys.map((role) => {
		          const preset = draftPresets[role];
		          const isBuiltin = BUILTIN_SET.has(role);
		          const curKey = preset?.model ? catalogKey(preset.provider, preset.model) : "";
		          const matchedCatalog = curKey ? catalogByKey.get(curKey) : void 0;
		          const hasUnknownSaved = Boolean(preset?.model && !matchedCatalog);
		          const isManual = Boolean(manualRoles[role]) || storeState.models.length === 0 && Boolean(preset?.model);
		          const supportedEfforts = matchedCatalog?.efforts ?? [];
		          const savedEffort = preset?.reasoningEffort?.trim() || "";
		          const savedUnsupported = Boolean(
		            savedEffort && matchedCatalog?.reasoningKnown && !supportedEfforts.some((e) => e.id === savedEffort)
		          );
		          const defaultEffortLabel = matchedCatalog?.defaultEffort ? `${t("settings.effortDefault")} (${matchedCatalog.defaultEffort})` : t("settings.effortDefault");
		          return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		            "div",
		            {
		              "data-testid": `swarm-role-row-${role}`,
		              style: {
		                display: "flex",
		                flexWrap: "wrap",
		                alignItems: "center",
		                gap: 8,
		                padding: "8px 10px",
		                borderRadius: 8,
		                background: "var(--ag-fill, rgba(128,128,128,0.06))"
		              },
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { minWidth: 160, flex: "0 1 185px", display: "flex", alignItems: "center", gap: 6 }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { style: { fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: roleDisplayLabel(role) }),
		                  !isBuiltin && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		                    "button",
		                    {
		                      type: "button",
		                      className: "ag-icon-btn",
		                      onClick: () => handleRemoveRole(role),
		                      "aria-label": isZh ? `\u5220\u9664\u89D2\u8272 ${role}` : `Remove role ${role}`,
		                      title: isZh ? "\u5220\u9664\u81EA\u5B9A\u4E49\u89D2\u8272" : "Remove custom role",
		                      style: { width: 20, height: 20, fontSize: 11 },
		                      children: "\xD7"
		                    }
		                  )
		                ] }),
		                !isManual ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		                  "select",
		                  {
		                    "aria-label": `${role} model`,
		                    value: curKey,
		                    onChange: (e) => {
		                      const val = e.target.value;
		                      if (!val) {
		                        updateRolePreset(role, () => void 0);
		                        return;
		                      }
		                      const opt = catalogByKey.get(val);
		                      if (opt) {
		                        updateRolePreset(role, (prev) => {
		                          const prevEffort = prev?.reasoningEffort?.trim();
		                          const keepEffort = Boolean(prevEffort && opt.efforts?.some((ef) => ef.id === prevEffort));
		                          return {
		                            provider: opt.provider,
		                            model: opt.model,
		                            label: opt.label,
		                            ...keepEffort && prevEffort ? { reasoningEffort: prevEffort } : {}
		                          };
		                        });
		                      } else {
		                        const sep = val.indexOf("::");
		                        const provider = sep >= 0 ? val.slice(0, sep) : "";
		                        const model = sep >= 0 ? val.slice(sep + 2) : val;
		                        updateRolePreset(role, () => ({
		                          ...provider ? { provider } : {},
		                          model
		                        }));
		                      }
		                    },
		                    style: {
		                      flex: "1 1 200px",
		                      minWidth: 160,
		                      height: 30,
		                      padding: "0 8px",
		                      borderRadius: 6,
		                      border: "1px solid var(--ag-border, rgba(128,128,128,0.2))",
		                      background: "var(--ag-bg, #f7f7f8)",
		                      fontSize: 12
		                    },
		                    children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("option", { value: "", children: t("settings.inheritMain") }),
		                      hasUnknownSaved && preset && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("option", { value: curKey, children: preset.provider ? `${preset.provider} / ${preset.model}` : preset.model }),
		                      storeState.models.map((opt) => {
		                        const k = catalogKey(opt.provider, opt.model);
		                        return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("option", { value: k, children: opt.provider ? `${opt.provider} / ${opt.label}` : opt.label }, k);
		                      })
		                    ]
		                  }
		                ) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		                  "input",
		                  {
		                    type: "text",
		                    "aria-label": `${role} custom model`,
		                    value: preset?.model ?? "",
		                    placeholder: t("settings.customModelPlaceholder"),
		                    onChange: (e) => {
		                      const val = e.target.value;
		                      updateRolePreset(
		                        role,
		                        (prev) => val.trim() ? {
		                          ...prev?.provider ? { provider: prev.provider } : {},
		                          model: val,
		                          ...prev?.reasoningEffort ? { reasoningEffort: prev.reasoningEffort } : {}
		                        } : void 0
		                      );
		                    },
		                    style: {
		                      flex: "1 1 200px",
		                      minWidth: 160,
		                      height: 30,
		                      padding: "0 8px",
		                      borderRadius: 6,
		                      border: "1px solid var(--ag-border, rgba(128,128,128,0.2))",
		                      background: "var(--ag-bg, #f7f7f8)",
		                      fontSize: 12
		                    }
		                  }
		                ),
		                !isManual && matchedCatalog ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		                  "select",
		                  {
		                    "aria-label": `${role} reasoning effort`,
		                    value: savedEffort,
		                    disabled: !preset?.model?.trim() || supportedEfforts.length === 0 && !savedUnsupported,
		                    onChange: (e) => {
		                      const eff = e.target.value;
		                      updateRolePreset(role, (prev) => {
		                        if (!prev?.model) return prev;
		                        return {
		                          ...prev.provider ? { provider: prev.provider } : {},
		                          model: prev.model,
		                          ...prev.label ? { label: prev.label } : {},
		                          ...eff ? { reasoningEffort: eff } : {}
		                        };
		                      });
		                    },
		                    style: {
		                      flex: "0 0 132px",
		                      height: 30,
		                      padding: "0 8px",
		                      borderRadius: 6,
		                      border: `1px solid ${savedUnsupported ? "var(--ag-warning, #bca136)" : "var(--ag-border, rgba(128,128,128,0.2))"}`,
		                      background: "var(--ag-bg, #f7f7f8)",
		                      fontSize: 12
		                    },
		                    children: supportedEfforts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("option", { value: "", children: savedUnsupported ? isZh ? "\u6E05\u9664\u4E0D\u652F\u6301\u7684\u601D\u7EF4\u5EA6" : "Clear unsupported" : isZh ? "\u8BE5\u6A21\u578B\u4E0D\u652F\u6301\u601D\u7EF4\u5EA6" : "Not supported" }),
		                      savedUnsupported && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("option", { value: savedEffort, children: [
		                        savedEffort,
		                        " (",
		                        isZh ? "\u4E0D\u652F\u6301" : "unsupported",
		                        ")"
		                      ] })
		                    ] }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("option", { value: "", children: defaultEffortLabel }),
		                      supportedEfforts.map((ef) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("option", { value: ef.id, children: ef.name }, ef.id)),
		                      savedUnsupported && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("option", { value: savedEffort, children: [
		                        savedEffort,
		                        " (",
		                        isZh ? "\u4E0D\u652F\u6301" : "unsupported",
		                        ")"
		                      ] })
		                    ] })
		                  }
		                ) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		                  "input",
		                  {
		                    type: "text",
		                    "aria-label": `${role} reasoning effort`,
		                    value: preset?.reasoningEffort ?? "",
		                    disabled: !preset?.model?.trim(),
		                    placeholder: isZh ? "\u9ED8\u8BA4\u601D\u7EF4\u5EA6\uFF08\u53EF\u9009\uFF09" : "Default effort (optional)",
		                    onChange: (e) => {
		                      const eff = e.target.value;
		                      updateRolePreset(role, (prev) => {
		                        if (!prev?.model) return prev;
		                        return {
		                          ...prev.provider ? { provider: prev.provider } : {},
		                          model: prev.model,
		                          ...prev.label ? { label: prev.label } : {},
		                          ...eff.trim() ? { reasoningEffort: eff } : {}
		                        };
		                      });
		                    },
		                    style: {
		                      flex: "0 0 132px",
		                      height: 30,
		                      padding: "0 8px",
		                      borderRadius: 6,
		                      border: "1px solid var(--ag-border, rgba(128,128,128,0.2))",
		                      background: "var(--ag-bg, #f7f7f8)",
		                      fontSize: 12
		                    }
		                  }
		                ),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		                  "button",
		                  {
		                    type: "button",
		                    className: "ag-ghost-btn",
		                    onClick: () => setManualRoles((prev) => ({ ...prev, [role]: !isManual })),
		                    style: { height: 28, padding: "0 7px", fontSize: 11 },
		                    title: isManual ? isZh ? "\u5207\u6362\u56DE\u6A21\u578B\u76EE\u5F55\u9009\u62E9" : "Switch to catalog dropdown" : isZh ? "\u624B\u52A8\u8F93\u5165\u6A21\u578B ID" : "Type model ID manually",
		                    children: isManual ? isZh ? "\u9009\u76EE\u5F55" : "Catalog" : isZh ? "\u624B\u52A8" : "Manual"
		                  }
		                )
		              ]
		            },
		            role
		          );
		        }) }),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, paddingTop: 4 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		            "input",
		            {
		              type: "text",
		              value: newRoleInput,
		              onChange: (e) => {
		                setNewRoleInput(e.target.value);
		                if (roleInputErr) setRoleInputErr(null);
		              },
		              onKeyDown: (e) => {
		                if (e.key === "Enter") {
		                  e.preventDefault();
		                  handleAddRole();
		                }
		              },
		              placeholder: t("settings.addRolePlaceholder"),
		              "aria-label": t("settings.addRolePlaceholder"),
		              style: {
		                flex: "1 1 200px",
		                minWidth: 160,
		                height: 30,
		                padding: "0 8px",
		                borderRadius: 6,
		                border: "1px solid var(--ag-border, rgba(128,128,128,0.2))",
		                background: "var(--ag-bg, #f7f7f8)",
		                fontSize: 12
		              }
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("button", { type: "button", className: "ag-btn sm", onClick: handleAddRole, style: { height: 30 }, children: [
		            "+ ",
		            t("settings.addRoleBtn")
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		            "button",
		            {
		              type: "button",
		              className: "ag-btn primary sm",
		              disabled: savingPresets,
		              onClick: () => void handleSavePresets(),
		              "data-testid": "swarm-save-role-presets",
		              style: { height: 30, marginLeft: "auto" },
		              children: savingPresets ? t("common.saving") : t("settings.savePresets")
		            }
		          )
		        ] }),
		        roleInputErr && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { role: "alert", style: { fontSize: 12, color: "var(--ag-error, #cb3d3d)" }, children: roleInputErr }),
		        saveFeedback && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		          "div",
		          {
		            role: "status",
		            style: {
		              padding: "7px 10px",
		              borderRadius: 8,
		              fontSize: 12,
		              background: saveFeedback.kind === "err" ? "color-mix(in srgb, var(--ag-error, #cb3d3d) 12%, transparent)" : "color-mix(in srgb, var(--ag-success, #63984f) 14%, transparent)",
		              color: saveFeedback.kind === "err" ? "var(--ag-error, #cb3d3d)" : "var(--ag-success, #63984f)"
		            },
		            children: saveFeedback.text
		          }
		        )
		      ]
		    }
		  );
		}
		function SettingsSection() {
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const [storeState, setStoreState] = (0, import_react13.useState)(() => swarmClientStore.getState());
		  const [config, setConfig] = (0, import_react13.useState)(DEFAULT_CONFIG);
		  const [jumpNotice, setJumpNotice] = (0, import_react13.useState)(null);
		  const [refreshing, setRefreshing] = (0, import_react13.useState)(false);
		  (0, import_react13.useEffect)(() => {
		    const release = swarmClientStore.retain();
		    const unsub = swarmClientStore.subscribe((next) => setStoreState(next));
		    void swarmClientStore.listSwarms().catch(() => {
		    });
		    void swarmClientStore.listModels().catch(() => {
		    });
		    void fetch("/ag-swarm/api/config", { cache: "no-store" }).then((res) => res.ok ? res.json() : null).then((raw) => {
		      if (!raw || typeof raw !== "object") return;
		      const obj = raw.config ?? raw;
		      setConfig((prev) => ({
		        ...prev,
		        ...obj,
		        modelPresets: obj.modelPresets && typeof obj.modelPresets === "object" ? obj.modelPresets : prev.modelPresets
		      }));
		    }).catch(() => {
		    });
		    return () => {
		      unsub();
		      release();
		    };
		  }, []);
		  const handleRefresh = (0, import_react13.useCallback)(async () => {
		    setRefreshing(true);
		    try {
		      await Promise.all([
		        swarmClientStore.listSwarms(),
		        swarmClientStore.listModels(true)
		      ]);
		    } catch {
		    } finally {
		      setRefreshing(false);
		    }
		  }, []);
		  const handleSelectSwarm = (0, import_react13.useCallback)(
		    (swarm) => {
		      void swarmClientStore.selectSwarm(swarm.swarm_id);
		      const label = swarm.title || swarm.swarm_id;
		      setJumpNotice(
		        isZh ? `\u5DF2\u9009\u4E2D\u300C${label}\u300D\uFF0C\u8BF7\u5207\u6362\u5230\u5BF9\u8BDD\u9875\u9876\u90E8\u300C\u8702\u7FA4\u300D\u6807\u7B7E\u67E5\u770B\u3002` : `Selected "${label}". Open the Swarm tab in your conversation view to inspect it.`
		      );
		    },
		    [isZh]
		  );
		  const swarms = storeState.swarms;
		  const totalWorking = swarms.reduce((acc, s) => acc + (s.workingCount || 0), 0);
		  const syncColor = storeState.sync === "live" ? "var(--ag-success, #63984f)" : storeState.sync === "reconnecting" ? "var(--ag-warning, #bca136)" : "var(--ag-fg-faint, #9da5ab)";
		  const syncText = storeState.sync === "live" ? t("common.live") : storeState.sync === "reconnecting" ? t("common.reconnecting") : t("common.offline");
		  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		    "div",
		    {
		      className: "ag-settings",
		      "data-testid": "swarm-settings-section",
		      style: { display: "flex", flexDirection: "column", gap: 14, color: "var(--ag-fg, inherit)" },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		          "div",
		          {
		            className: "ag-settings-card",
		            style: {
		              padding: "12px 14px",
		              borderRadius: 10,
		              border: "1px solid var(--ag-card-border, rgba(128,128,128,0.2))",
		              background: "var(--ag-card, #ffffff)"
		            },
		            children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PixelBee, { name: "coordinator", role: "coordinator", state: totalWorking > 0 ? "working" : "landed", size: 2, framed: true }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { style: { fontWeight: 600, fontSize: 14 }, children: t("settings.title") }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		                    "button",
		                    {
		                      type: "button",
		                      className: "ag-ghost-btn",
		                      onClick: () => toggleUiLocale(),
		                      "data-testid": "swarm-settings-locale-toggle",
		                      title: isZh ? "Switch to English" : "\u5207\u6362\u4E3A\u7B80\u4F53\u4E2D\u6587",
		                      style: {
		                        height: 22,
		                        padding: "0 7px",
		                        fontSize: 11,
		                        border: "1px solid var(--ag-border, rgba(128,128,128,0.2))",
		                        borderRadius: 999
		                      },
		                      children: isZh ? "EN" : "\u4E2D\u6587"
		                    }
		                  )
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 2, fontSize: 12, color: "var(--ag-fg-muted, #5d676f)" }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 5 }, children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { style: { width: 7, height: 7, borderRadius: "50%", background: syncColor, display: "inline-block" } }),
		                    syncText
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
		                    "\xB7 ",
		                    isZh ? `${swarms.length} \u4E2A\u8702\u7FA4` : `${swarms.length} ${swarms.length === 1 ? "swarm" : "swarms"}`
		                  ] }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
		                    "\xB7 ",
		                    t("header.working", { count: totalWorking })
		                  ] })
		                ] })
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { type: "button", className: "ag-btn sm", onClick: () => void handleRefresh(), disabled: refreshing, children: refreshing ? t("common.refreshing") : t("common.refresh") })
		            ] })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		          "div",
		          {
		            className: "ag-settings-card",
		            style: {
		              padding: "12px 14px",
		              borderRadius: 10,
		              border: "1px solid var(--ag-card-border, rgba(128,128,128,0.2))",
		              background: "var(--ag-card, #ffffff)"
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ag-fg-muted, #5d676f)", marginBottom: 8 }, children: [
		                t("settings.activeSwarms"),
		                " (",
		                swarms.length,
		                ")"
		              ] }),
		              jumpNotice && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
		                "div",
		                {
		                  role: "status",
		                  style: {
		                    marginBottom: 8,
		                    padding: "6px 10px",
		                    borderRadius: 6,
		                    fontSize: 12,
		                    background: "color-mix(in srgb, var(--ag-primary, #007acc) 12%, transparent)",
		                    color: "var(--ag-fg, inherit)"
		                  },
		                  children: jumpNotice
		                }
		              ),
		              swarms.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontSize: 12, color: "var(--ag-fg-muted, #5d676f)" }, children: t("settings.noSwarms") }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: swarms.map((s) => {
		                const selected = storeState.activeSwarmId === s.swarm_id;
		                return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		                  "button",
		                  {
		                    type: "button",
		                    onClick: () => handleSelectSwarm(s),
		                    style: {
		                      display: "flex",
		                      alignItems: "center",
		                      gap: 10,
		                      width: "100%",
		                      textAlign: "left",
		                      padding: "8px 10px",
		                      borderRadius: 8,
		                      border: selected ? "1px solid var(--ag-primary, #007acc)" : "1px solid var(--ag-border, rgba(128,128,128,0.16))",
		                      background: selected ? "color-mix(in srgb, var(--ag-primary, #007acc) 8%, transparent)" : "transparent",
		                      cursor: "pointer"
		                    },
		                    children: [
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PixelBee, { name: s.swarm_id, role: "worker", state: s.workingCount > 0 ? "working" : "landed", size: 1 }),
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { flex: 1, minWidth: 0 }, children: [
		                        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: s.title || s.swarm_id }),
		                        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontSize: 11, color: "var(--ag-fg-muted, #5d676f)", fontFamily: "var(--ag-mono, monospace)" }, children: isZh ? `${s.memberCount} \u6210\u5458 \xB7 ${s.workingCount} \u5DE5\u4F5C\u4E2D \xB7 ${s.doneCount} \u5B8C\u6210 \xB7 #${s.head}` : `${s.memberCount} members \xB7 ${s.workingCount} working \xB7 ${s.doneCount} done \xB7 #${s.head}` })
		                      ] }),
		                      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { style: { fontSize: 11, color: "var(--ag-fg-faint, #9da5ab)", whiteSpace: "nowrap" }, children: formatUpdated(s.updated_at, isZh) })
		                    ]
		                  },
		                  s.swarm_id
		                );
		              }) })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(RoleModelPresetsCard, {}),
		        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
		          "div",
		          {
		            className: "ag-settings-card",
		            style: {
		              padding: "12px 14px",
		              borderRadius: 10,
		              border: "1px solid var(--ag-card-border, rgba(128,128,128,0.2))",
		              background: "var(--ag-card, #ffffff)"
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ag-fg-muted, #5d676f)", marginBottom: 8 }, children: t("settings.pluginConfig") }),
		              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8, fontSize: 12 }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { padding: "6px 8px", borderRadius: 6, background: "var(--ag-fill, rgba(128,128,128,0.06))" }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { color: "var(--ag-fg-muted, #5d676f)", fontSize: 11 }, children: t("settings.primaryCmd") }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { fontWeight: 600, fontFamily: "var(--ag-mono, monospace)" }, children: [
		                    "/",
		                    config.primaryCommand || "swarm"
		                  ] })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { padding: "6px 8px", borderRadius: 6, background: "var(--ag-fill, rgba(128,128,128,0.06))" }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { color: "var(--ag-fg-muted, #5d676f)", fontSize: 11 }, children: t("settings.waitTool") }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontWeight: 600, fontFamily: "var(--ag-mono, monospace)" }, children: config.waitToolName || "swarm_wait" })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { padding: "6px 8px", borderRadius: 6, background: "var(--ag-fill, rgba(128,128,128,0.06))" }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { color: "var(--ag-fg-muted, #5d676f)", fontSize: 11 }, children: "maxWorkers" }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontWeight: 600, fontFamily: "var(--ag-mono, monospace)" }, children: config.maxWorkers })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { padding: "6px 8px", borderRadius: 6, background: "var(--ag-fill, rgba(128,128,128,0.06))" }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { color: "var(--ag-fg-muted, #5d676f)", fontSize: 11 }, children: "enableWorktrees" }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontWeight: 600, fontFamily: "var(--ag-mono, monospace)" }, children: config.enableWorktrees ? isZh ? "\u5DF2\u542F\u7528" : "Enabled" : isZh ? "\u672A\u542F\u7528" : "Disabled" })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { padding: "6px 8px", borderRadius: 6, background: "var(--ag-fill, rgba(128,128,128,0.06))" }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { color: "var(--ag-fg-muted, #5d676f)", fontSize: 11 }, children: "enableStallMonitor" }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontWeight: 600, fontFamily: "var(--ag-mono, monospace)" }, children: config.enableStallMonitor ? `${isZh ? "\u5DF2\u542F\u7528" : "Enabled"} (${Math.round(config.stallCheckIntervalMs / 1e3)}s)` : isZh ? "\u672A\u542F\u7528" : "Disabled" })
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { padding: "6px 8px", borderRadius: 6, background: "var(--ag-fill, rgba(128,128,128,0.06))" }, children: [
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { color: "var(--ag-fg-muted, #5d676f)", fontSize: 11 }, children: "maxDepth" }),
		                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { fontWeight: 600, fontFamily: "var(--ag-mono, monospace)" }, children: config.maxDepth })
		                ] })
		              ] })
		            ]
		          }
		        )
		      ]
		    }
		  );
		}
		
		// client/components/SwarmWorkspace.tsx
		var import_jsx_runtime11 = require("react/jsx-runtime");
		function detectHostTheme() {
		  if (typeof window === "undefined" || typeof document === "undefined") return "light";
		  try {
		    const probe = document.createElement("span");
		    probe.style.cssText = "position:absolute;visibility:hidden;color:var(--dsw-alias-bg-primary, var(--dsw-alias-bg-base, var(--background, #f7f7f8)))";
		    document.documentElement.appendChild(probe);
		    const c = getComputedStyle(probe).color;
		    probe.remove();
		    const nums = (c.match(/[\d.]+/g) || []).map(Number);
		    if (nums.length >= 3) {
		      const scale = c.startsWith("color(") ? 1 : 255;
		      const lum = (0.2126 * nums[0] + 0.7152 * nums[1] + 0.0722 * nums[2]) / scale;
		      return lum < 0.5 ? "dark" : "light";
		    }
		  } catch {
		  }
		  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}
		function SwarmWorkspace(props = {}) {
		  const locale = useUiLocale();
		  const zh = locale === "zh-CN";
		  const {
		    snapshot,
		    swarms,
		    loading,
		    error,
		    sync,
		    models,
		    refresh,
		    selectSwarm,
		    postAction,
		    fetchMessagesBefore
		  } = useSwarmStore(props.sessionId);
		  const [tab, setTab] = (0, import_react14.useState)(props.initialTab ?? "overview");
		  const [theme, setTheme] = (0, import_react14.useState)(() => detectHostTheme());
		  const [jumpTarget, setJumpTarget] = (0, import_react14.useState)(null);
		  const [actionError, setActionError] = (0, import_react14.useState)(null);
		  const [toast, setToast] = (0, import_react14.useState)(null);
		  const [loadingEarlier, setLoadingEarlier] = (0, import_react14.useState)(false);
		  const [showRoleModels, setShowRoleModels] = (0, import_react14.useState)(false);
		  const [selectedSubagent, setSelectedSubagent] = (0, import_react14.useState)(null);
		  const openSubagent = (0, import_react14.useCallback)((memberName) => {
		    setSelectedSubagent(memberName);
		    setTab("subagents");
		  }, []);
		  (0, import_react14.useEffect)(() => {
		    if (!showRoleModels) return;
		    const onKey = (e) => {
		      if (e.key === "Escape") setShowRoleModels(false);
		    };
		    window.addEventListener("keydown", onKey);
		    return () => window.removeEventListener("keydown", onKey);
		  }, [showRoleModels]);
		  (0, import_react14.useEffect)(() => {
		    if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;
		    const update = () => setTheme(detectHostTheme());
		    update();
		    const obs = new MutationObserver(update);
		    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class", "data-theme"] });
		    return () => obs.disconnect();
		  }, []);
		  const showToast = (0, import_react14.useCallback)((msg) => {
		    setToast(msg);
		    setTimeout(() => {
		      setToast((prev) => prev === msg ? null : prev);
		    }, 2800);
		  }, []);
		  const handleJumpToSeq = (0, import_react14.useCallback)((seq) => {
		    setTab("feed");
		    setJumpTarget({ seq, nonce: Date.now() + Math.random() });
		  }, []);
		  const handleAction = (0, import_react14.useCallback)(async (req) => {
		    setActionError(null);
		    try {
		      await postAction(req);
		      if (req.action === "post_message") showToast(zh ? "\u5DF2\u53D1\u5E03\u5230\u9ED1\u677F" : "Posted to board");
		      else if (req.action === "switch_model") showToast(zh ? `\u5DF2\u5207\u6362 @${req.member} \u6A21\u578B` : `Switched @${req.member} model`);
		      else if (req.action === "kill_worker") showToast(zh ? `\u5DF2\u7EC8\u6B62 @${req.member}` : `Killed @${req.member}`);
		      else if (req.action === "nudge_worker") showToast(zh ? `\u5DF2\u5524\u9192 @${req.member}` : `Nudged @${req.member}`);
		      else if (req.action === "stop_workers") showToast(zh ? "\u5DF2\u6682\u505C\u5168\u90E8\u8FD0\u884C\u4E2D\u7684\u5B50\u4EE3\u7406" : "Stopped all working subagents");
		    } catch (err) {
		      const msg = err instanceof Error ? err.message : String(err);
		      setActionError(msg);
		      throw err;
		    }
		  }, [postAction, showToast, zh]);
		  const handleLoadEarlier = (0, import_react14.useCallback)(async () => {
		    if (!snapshot || loadingEarlier) return;
		    const firstSeq = snapshot.messages[0]?.seq ?? snapshot.head + 1;
		    setLoadingEarlier(true);
		    try {
		      await fetchMessagesBefore(snapshot.swarm_id, firstSeq, 200);
		    } catch (err) {
		      setActionError(err instanceof Error ? err.message : String(err));
		    } finally {
		      setLoadingEarlier(false);
		    }
		  }, [snapshot, loadingEarlier, fetchMessagesBefore]);
		  const counts = (0, import_react14.useMemo)(() => {
		    if (!snapshot) return { members: 0, workers: 0, workingWorkers: 0, attention: 0 };
		    const all = Object.values(snapshot.members);
		    const liveMembers = all.filter((m) => !m.killed).length;
		    const workers = all.filter((m) => m.role !== "coordinator" && m.role !== "monitor" && !m.killed).length;
		    const workingWorkers = all.filter((m) => m.role !== "coordinator" && m.role !== "monitor" && !m.killed && m.state === "working").length;
		    const attention = snapshot.systemAttention.length + (snapshot.stallBanner ? 1 : 0);
		    return { members: liveMembers, workers, workingWorkers, attention };
		  }, [snapshot]);
		  const liveClass = sync === "live" ? "" : error ? "error" : "stale";
		  const liveLabel = sync === "live" ? t("common.live") : sync === "reconnecting" ? t("common.reconnecting") : sync === "connecting" ? zh ? "\u8FDE\u63A5\u4E2D" : "Connecting" : t("common.offline");
		  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "ag-root", "data-testid": "swarm-board", "data-theme": theme, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("header", { className: "ag-header", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "ag-header-row", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h1", { className: "ag-swarm-title", title: snapshot ? `${snapshot.title}
		${snapshot.swarm_id}` : t("slot.swarm"), children: snapshot?.title || t("slot.swarm") }),
		        swarms.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          "select",
		          {
		            className: "ag-swarm-select",
		            "aria-label": zh ? "\u5207\u6362\u8702\u7FA4" : "Select swarm",
		            value: snapshot?.swarm_id ?? "",
		            onChange: (e) => {
		              void selectSwarm(e.target.value || null);
		            },
		            children: swarms.map((s) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("option", { value: s.swarm_id, children: [
		              s.title || s.swarm_id.slice(0, 8),
		              " \xB7 #",
		              s.head
		            ] }, s.swarm_id))
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-icon-btn",
		            title: t("common.refresh"),
		            "aria-label": t("common.refresh"),
		            onClick: () => {
		              void refresh(true);
		            },
		            children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("svg", { className: "ag-icon", viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("path", { d: "M13 8a5 5 0 1 1-1.3-3.35M13 3v2.5h-2.5" }) })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-ghost-btn",
		            "data-testid": "swarm-open-role-models",
		            title: zh ? "\u6309\u89D2\u8272\u5B9A\u5236\u5B50\u4EE3\u7406\u6A21\u578B" : "Configure per-role worker models",
		            onClick: () => setShowRoleModels(true),
		            children: zh ? "\u89D2\u8272\u6A21\u578B" : "Role Models"
		          }
		        ),
		        snapshot && counts.workingWorkers > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-ghost-btn",
		            "data-testid": "swarm-stop-all-workers",
		            title: zh ? "\u7ACB\u5373\u505C\u6B62\u5168\u90E8\u8FD0\u884C\u4E2D\u7684\u5B50\u4EE3\u7406" : "Stop all working subagents",
		            onClick: () => {
		              void handleAction({ action: "stop_workers", swarmId: snapshot.swarm_id });
		            },
		            style: { color: "var(--ag-error, #cb3d3d)" },
		            children: zh ? "\u505C\u6B62\u5168\u90E8" : "Stop all"
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-ghost-btn",
		            "data-testid": "swarm-locale-toggle",
		            title: zh ? "Switch UI to English" : "\u5207\u6362\u754C\u9762\u4E3A\u7B80\u4F53\u4E2D\u6587",
		            "aria-label": zh ? "Switch UI to English" : "\u5207\u6362\u754C\u9762\u4E3A\u7B80\u4F53\u4E2D\u6587",
		            onClick: () => {
		              toggleUiLocale();
		            },
		            children: zh ? "EN" : "\u4E2D\u6587"
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: `ag-live ${liveClass}`, title: error ?? (zh ? "SSE \u5B9E\u65F6\u63A8\u9001\u4E2D" : "Live SSE updates"), children: [
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "ag-live-dot", "aria-hidden": "true" }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: liveLabel })
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("nav", { className: "ag-tabs", role: "tablist", "aria-label": zh ? "\u8702\u7FA4\u89C6\u56FE\u5207\u6362" : "Swarm views", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
		          "button",
		          {
		            type: "button",
		            role: "tab",
		            className: `ag-tab ${tab === "overview" ? "active" : ""}`,
		            "aria-selected": tab === "overview",
		            "data-testid": "swarm-tab-overview",
		            onClick: () => setTab("overview"),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: t("tab.overview") }),
		              counts.attention > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "ag-tab-badge", children: counts.attention })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
		          "button",
		          {
		            type: "button",
		            role: "tab",
		            className: `ag-tab ${tab === "feed" ? "active" : ""}`,
		            "aria-selected": tab === "feed",
		            "data-testid": "swarm-tab-feed",
		            onClick: () => setTab("feed"),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: t("tab.board") }),
		              snapshot && snapshot.head > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "ag-tab-count", children: snapshot.head })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
		          "button",
		          {
		            type: "button",
		            role: "tab",
		            className: `ag-tab ${tab === "subagents" ? "active" : ""}`,
		            "aria-selected": tab === "subagents",
		            "data-testid": "swarm-tab-subagents",
		            onClick: () => setTab("subagents"),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: t("tab.subagents") }),
		              counts.workers > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "ag-tab-count", children: counts.workers })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
		          "button",
		          {
		            type: "button",
		            role: "tab",
		            className: `ag-tab ${tab === "members" ? "active" : ""}`,
		            "aria-selected": tab === "members",
		            "data-testid": "swarm-tab-members",
		            onClick: () => setTab("members"),
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: t("tab.members") }),
		              counts.members > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "ag-tab-count", children: counts.members })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          "button",
		          {
		            type: "button",
		            role: "tab",
		            className: `ag-tab ${tab === "graph" ? "active" : ""}`,
		            "aria-selected": tab === "graph",
		            "data-testid": "swarm-tab-graph",
		            onClick: () => setTab("graph"),
		            children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: t("tab.graph") })
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          "button",
		          {
		            type: "button",
		            role: "tab",
		            className: `ag-tab ${tab === "raw" ? "active" : ""}`,
		            "aria-selected": tab === "raw",
		            "data-testid": "swarm-tab-raw",
		            onClick: () => setTab("raw"),
		            children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: t("tab.raw") })
		          }
		        )
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "ag-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "ag-main", style: tab === "subagents" ? { maxWidth: 1120 } : void 0, children: [
		      actionError && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "ag-ov-sys error", role: "alert", style: { marginBottom: 10 }, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "ag-ov-sys-dot", "aria-hidden": "true" }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "ag-ov-sys-body", children: actionError }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { type: "button", className: "ag-ghost-btn", onClick: () => setActionError(null), children: t("common.close") })
		      ] }),
		      loading && !snapshot ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "ag-loading", "aria-busy": "true", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "ag-skel", style: { width: "58%", height: 14 } }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "ag-skel", style: { width: "88%", height: 10, marginTop: 10 } }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "ag-skel", style: { width: "74%", height: 10, marginTop: 8 } }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "ag-loading-caption", children: t("common.loading") })
		      ] }) : !snapshot ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "ag-empty", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "ag-empty-card", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", { className: "ag-empty-icon", viewBox: "0 0 56 56", "aria-hidden": "true", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("g", { className: "ag-empty-links", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("line", { x1: "28", y1: "12", x2: "12", y2: "40" }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("line", { x1: "28", y1: "12", x2: "44", y2: "40" }),
		            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("line", { x1: "12", y1: "40", x2: "44", y2: "40" })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", { className: "ag-empty-node", cx: "28", cy: "12", r: "5" }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", { className: "ag-empty-node", cx: "12", cy: "40", r: "5" }),
		          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", { className: "ag-empty-node", cx: "44", cy: "40", r: "5" })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h2", { className: "ag-empty-title", children: t("common.emptyTitle") }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "ag-empty-body", children: t("common.emptyDesc") }),
		        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { style: { marginTop: 12, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          "button",
		          {
		            type: "button",
		            className: "ag-btn sm",
		            onClick: () => setShowRoleModels(true),
		            children: zh ? "\u6309\u89D2\u8272\u5B9A\u5236\u6A21\u578B" : "Configure Role Models"
		          }
		        ) }),
		        swarms.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "ag-empty-swarms", children: swarms.slice(0, 5).map((s) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
		          "button",
		          {
		            type: "button",
		            className: "ag-btn sm",
		            onClick: () => {
		              void selectSwarm(s.swarm_id);
		            },
		            children: [
		              zh ? "\u67E5\u770B " : "Open ",
		              s.title || s.swarm_id.slice(0, 8),
		              " (#",
		              s.head,
		              ")"
		            ]
		          },
		          s.swarm_id
		        )) })
		      ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
		        tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          OverviewTab,
		          {
		            snapshot,
		            onJumpToSeq: handleJumpToSeq,
		            onSwitchTab: setTab
		          }
		        ),
		        tab === "feed" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          BoardTab,
		          {
		            snapshot,
		            jumpTarget,
		            onJumpToSeq: handleJumpToSeq,
		            onAction: handleAction,
		            onLoadEarlier: handleLoadEarlier,
		            loadingEarlier,
		            onOpenMembers: () => setTab("members"),
		            onSelectSubagent: openSubagent
		          }
		        ),
		        tab === "subagents" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          SubagentsTab,
		          {
		            snapshot,
		            initialMember: selectedSubagent,
		            onAction: handleAction,
		            onJumpToSeq: handleJumpToSeq
		          }
		        ),
		        tab === "members" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          MembersTab,
		          {
		            snapshot,
		            onJumpToSeq: handleJumpToSeq,
		            onAction: handleAction,
		            models,
		            onInspectSubagent: openSubagent
		          }
		        ),
		        tab === "graph" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		          GraphTab,
		          {
		            snapshot,
		            onJumpToSeq: handleJumpToSeq
		          }
		        ),
		        tab === "raw" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(RawTab, { swarmId: snapshot.swarm_id })
		      ] })
		    ] }) }),
		    showRoleModels && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		      "div",
		      {
		        role: "dialog",
		        "aria-modal": "true",
		        "aria-label": zh ? "\u6309\u89D2\u8272\u5B9A\u5236\u6A21\u578B" : "Role Model Presets",
		        onClick: (e) => {
		          if (e.target === e.currentTarget) setShowRoleModels(false);
		        },
		        style: {
		          position: "fixed",
		          inset: 0,
		          zIndex: 80,
		          background: "rgba(0, 0, 0, 0.45)",
		          display: "flex",
		          alignItems: "center",
		          justifyContent: "center",
		          padding: 16
		        },
		        children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
		          "div",
		          {
		            style: {
		              width: "min(720px, 100%)",
		              maxHeight: "88vh",
		              overflowY: "auto",
		              borderRadius: 12,
		              background: "var(--ag-bg, #f7f7f8)",
		              padding: 14,
		              boxShadow: "0 18px 48px rgba(0, 0, 0, 0.28)",
		              display: "flex",
		              flexDirection: "column",
		              gap: 10
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
		                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("strong", { style: { fontSize: 13 }, children: zh ? "\u6309\u89D2\u8272\u5B9A\u5236\u5B50\u4EE3\u7406\u6A21\u578B" : "Role Model Presets" }),
		                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
		                  "button",
		                  {
		                    type: "button",
		                    className: "ag-ghost-btn",
		                    onClick: () => setShowRoleModels(false),
		                    children: t("common.close")
		                  }
		                )
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(RoleModelPresetsCard, {})
		            ]
		          }
		        )
		      }
		    ),
		    toast && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "ag-toast", role: "status", children: toast })
		  ] });
		}
		
		// client/components/HeaderWidget.tsx
		var import_react15 = require("react");
		var import_jsx_runtime12 = require("react/jsx-runtime");
		function detectTheme() {
		  if (typeof window === "undefined" || typeof document === "undefined") return "light";
		  try {
		    const bg = getComputedStyle(document.documentElement).getPropertyValue("--dsw-alias-bg-primary").trim() || getComputedStyle(document.body).backgroundColor;
		    const nums = bg.match(/[\d.]+/g)?.map(Number);
		    if (nums && nums.length >= 3) {
		      const lum = (0.2126 * nums[0] + 0.7152 * nums[1] + 0.0722 * nums[2]) / 255;
		      return lum < 0.5 ? "dark" : "light";
		    }
		  } catch {
		  }
		  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}
		function HeaderWidget(props = {}) {
		  const locale = useUiLocale();
		  const { snapshot, swarms, sync, error, selectSwarm } = useSwarmStore(props.sessionId);
		  const [open, setOpen] = (0, import_react15.useState)(false);
		  const wrapRef = (0, import_react15.useRef)(null);
		  const theme = detectTheme();
		  const zh = locale === "zh-CN";
		  (0, import_react15.useEffect)(() => {
		    if (!open) return;
		    const onDocClick = (e) => {
		      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
		        setOpen(false);
		      }
		    };
		    const onKey = (e) => {
		      if (e.key === "Escape") setOpen(false);
		    };
		    document.addEventListener("mousedown", onDocClick);
		    document.addEventListener("keydown", onKey);
		    return () => {
		      document.removeEventListener("mousedown", onDocClick);
		      document.removeEventListener("keydown", onKey);
		    };
		  }, [open]);
		  const members = snapshot ? Object.values(snapshot.members) : [];
		  const liveMembers = members.filter((m) => !m.killed);
		  const workingCount = snapshot?.stats.workingCount ?? 0;
		  const attentionCount = (snapshot?.systemAttention.length ?? 0) + (snapshot?.stallBanner ? 1 : 0);
		  const statusKind = attentionCount > 0 || error ? "warn" : workingCount > 0 ? "working" : "idle";
		  const recentPosts = snapshot ? snapshot.messages.filter((m) => m.kind !== "control" && !m.control).slice(-3).reverse() : [];
		  const pillLabel = !snapshot ? t("header.noSwarm") : workingCount > 0 ? t("header.working", { count: workingCount }) : t("header.waiting");
		  const syncLabel = sync === "live" ? t("common.live") : sync === "reconnecting" ? t("common.reconnecting") : t("common.offline");
		  const stateLabel = (s) => {
		    if (s === "working" || s === "waiting" || s === "stopped" || s === "killed") {
		      return t(`members.state.${s}`);
		    }
		    return s;
		  };
		  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hbtn-wrap", ref: wrapRef, "data-testid": "ag-swarm-header-widget", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
		      "button",
		      {
		        type: "button",
		        className: `ag-hbtn ${statusKind}`,
		        "aria-expanded": open,
		        "aria-haspopup": "dialog",
		        title: snapshot ? `${snapshot.title} \xB7 ${pillLabel}` : t("slot.swarm"),
		        onClick: () => setOpen((v) => !v),
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		            PixelBee,
		            {
		              name: "coordinator",
		              role: "coordinator",
		              state: workingCount > 0 ? "working" : "landed",
		              size: 1
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "ag-hbtn-label", children: pillLabel }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: `ag-hbtn-dot ${statusKind}`, "aria-hidden": "true" })
		        ]
		      }
		    ),
		    open && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hpop", role: "dialog", "aria-label": t("header.title"), "data-theme": theme, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hpop-head", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("b", { children: snapshot?.title || t("header.title") }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: `ag-live ${sync === "live" ? "" : "stale"}`, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "ag-live-dot", "aria-hidden": "true" }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: syncLabel })
		        ] })
		      ] }),
		      error && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "ag-hpop-err", children: error }),
		      swarms.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
		        "select",
		        {
		          className: "ag-swarm-select",
		          "aria-label": zh ? "\u5207\u6362\u8702\u7FA4" : "Switch swarm",
		          value: snapshot?.swarm_id ?? "",
		          onChange: (e) => {
		            void selectSwarm(e.target.value || null);
		          },
		          children: swarms.map((s) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("option", { value: s.swarm_id, children: [
		            s.title || s.swarm_id.slice(0, 8),
		            " (",
		            t("header.working", { count: s.workingCount }),
		            ")"
		          ] }, s.swarm_id))
		        }
		      ),
		      !snapshot ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "ag-hpop-empty", children: zh ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
		        "\u5F53\u524D\u4F1A\u8BDD\u6682\u65E0\u6D3B\u8DC3\u8702\u7FA4\uFF0C\u53EF\u5728\u804A\u5929\u6846\u8F93\u5165 ",
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("code", { children: "/swarm" }),
		        " \u542F\u52A8\u3002"
		      ] }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
		        "No active swarm in this session. Start one with ",
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("code", { children: "/swarm" }),
		        "."
		      ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hpop-stats", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("b", { children: snapshot.stats.workingCount }),
		            " ",
		            t("members.state.working")
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("b", { children: snapshot.stats.waitingCount }),
		            " ",
		            t("members.state.waiting")
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("b", { children: [
		              snapshot.stats.doneTasks,
		              "/",
		              snapshot.stats.totalTasks
		            ] }),
		            " ",
		            zh ? "\u4EFB\u52A1" : "tasks"
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("b", { children: [
		              "#",
		              snapshot.head
		            ] }),
		            " ",
		            zh ? "\u53D1\u8A00" : "posts"
		          ] })
		        ] }),
		        snapshot.stallBanner && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hpop-warn", children: [
		          zh ? "\u505C\u6EDE\u9884\u8B66\uFF1A" : "Stalled: ",
		          snapshot.stallBanner.text.slice(0, 90)
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "ag-hpop-list", children: liveMembers.slice(0, 6).map((m) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hpop-row", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(PixelBee, { name: m.name, role: m.role, state: m.state, size: 1, showDot: true }),
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hpop-row-main", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hpop-row-top", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("b", { children: [
		                "@",
		                m.name
		              ] }),
		              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: `ag-hpop-st ${m.state}`, children: stateLabel(m.state) })
		            ] }),
		            m.activity && m.state === "working" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "ag-hpop-act ag-shimmer", children: m.activity }) : m.task_hint ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "ag-hpop-act", children: m.task_hint }) : null
		          ] })
		        ] }, m.name)) }),
		        recentPosts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hpop-posts", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "ag-hpop-sub", children: t("header.recent") }),
		          recentPosts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "ag-hpop-post", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "ag-hpop-pseq", children: [
		              "#",
		              p.seq
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("b", { children: [
		              "@",
		              p.agent
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "ag-hpop-ptxt", children: p.text.replace(/\s+/g, " ").slice(0, 72) })
		          ] }, p.seq))
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "ag-hpop-foot", children: zh ? "\u5207\u6362\u5230\u300C\u8702\u7FA4\u300D\u6807\u7B7E\u9875\u53EF\u67E5\u770B\u603B\u89C8\u3001\u9ED1\u677F\u4E0E\u8702\u5DE2\u56FE\u8C31\u3002" : "Open the Swarm tab for Overview, Board & Hive graph." })
		    ] })
		  ] });
		}
		
		// client/components/ToolCard.tsx
		var import_react16 = require("react");
		var import_jsx_runtime13 = require("react/jsx-runtime");
		function asRecord(value) {
		  if (!value) return null;
		  if (typeof value === "string") {
		    try {
		      const parsed = JSON.parse(value);
		      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
		    } catch {
		      return null;
		    }
		  }
		  if (typeof value === "object" && !Array.isArray(value)) {
		    return value;
		  }
		  return null;
		}
		function extractInput(props) {
		  if (props.toolCall?.input !== void 0) {
		    return asRecord(props.toolCall.input) ?? {};
		  }
		  const block = props.block;
		  if (block) {
		    const raw = block.call?.argsRaw ?? block.argsRaw;
		    return asRecord(raw) ?? {};
		  }
		  return {};
		}
		function extractOutputText(props) {
		  const out = props.toolCall?.output;
		  if (out !== void 0 && out !== null) {
		    if (typeof out === "string") return out;
		    try {
		      return JSON.stringify(out, null, 2);
		    } catch {
		      return String(out);
		    }
		  }
		  const content = props.block?.content;
		  if (Array.isArray(content) && content.length > 0) {
		    return content.map((item) => item.type === "text" && typeof item.text === "string" ? item.text : JSON.stringify(item)).join("\n");
		  }
		  return "";
		}
		function resolveStatus(props) {
		  const st = props.toolCall?.status?.toLowerCase();
		  if (st === "error" || st === "failed" || props.block?.isError) return "error";
		  if (st === "running" || st === "pending" || st === "in_progress") return "running";
		  if (props.block && !("kind" in props.block) && !props.toolCall?.output) return "running";
		  return "ok";
		}
		function actionLabel(action, isZh) {
		  switch (action) {
		    case "add":
		      return isZh ? "\u6D3E\u53D1\u5B50\u4EE3\u7406" : "Spawn worker";
		    case "status":
		      return isZh ? "\u67E5\u770B\u8702\u7FA4\u72B6\u6001" : "Swarm status";
		    case "models":
		      return isZh ? "\u67E5\u8BE2\u6A21\u578B\u76EE\u5F55" : "List models";
		    case "model":
		      return isZh ? "\u5207\u6362\u6A21\u578B" : "Switch model";
		    case "kill":
		      return isZh ? "\u7EC8\u6B62\u6210\u5458" : "Retire worker";
		    case "title":
		      return isZh ? "\u8BBE\u7F6E\u8702\u7FA4\u6807\u9898" : "Set swarm title";
		    case "channel":
		      return isZh ? "\u9891\u9053\u64CD\u4F5C" : "Channel ops";
		    default:
		      return action ? t("tool.title", { action }) : isZh ? "\u8702\u7FA4\u8C03\u5EA6" : "Swarm action";
		  }
		}
		function ToolCard(props) {
		  const locale = useUiLocale();
		  const isZh = locale === "zh-CN";
		  const [expanded, setExpanded] = (0, import_react16.useState)(false);
		  const input = extractInput(props);
		  const outputText = extractOutputText(props);
		  const status = resolveStatus(props);
		  const action = input.action;
		  const workerName = typeof input.name === "string" && input.name.trim() ? input.name.trim() : "";
		  const tasksCount = Array.isArray(input.tasks) ? input.tasks.length : 0;
		  const copies = typeof input.n === "number" && input.n > 1 ? input.n : 0;
		  const beeName = workerName || "coordinator";
		  const beeRole = workerName ? "worker" : "coordinator";
		  const tags = [];
		  if (workerName) {
		    if (tasksCount > 0) tags.push(`@${workerName}-1..${tasksCount}`);
		    else if (copies > 1) tags.push(`@${workerName}-1..${copies}`);
		    else tags.push(`@${workerName}`);
		  }
		  if (input.role_preset) tags.push(`role:${input.role_preset}`);
		  if (input.model) tags.push(input.provider ? `${input.provider}/${input.model}` : input.model);
		  if (input.reasoning_effort) tags.push(`effort:${input.reasoning_effort}`);
		  if (input.workspace) tags.push(`workspace:${input.workspace}`);
		  if (input.fork) tags.push(`fork:${input.fork}`);
		  if (input.channel) tags.push(`#${input.channel}`);
		  if (tasksCount > 0) tags.push(isZh ? `${tasksCount} \u5206\u7247` : `${tasksCount} shards`);
		  if (input.all) tags.push(isZh ? "\u5168\u90E8\u6A21\u578B" : "all models");
		  const preview = input.title || input.brief || input.topic || input.text || "";
		  const statusColor = status === "error" ? "var(--ag-error, #cb3d3d)" : status === "running" ? "var(--ag-primary, #007acc)" : "var(--ag-success, #63984f)";
		  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
		    "div",
		    {
		      className: "ag-toolcard",
		      "data-testid": "swarm-tool-card",
		      style: {
		        border: "1px solid var(--ag-card-border, rgba(128,128,128,0.2))",
		        borderRadius: "var(--ag-r-lg, 8px)",
		        background: "var(--ag-card, #ffffff)",
		        padding: "8px 10px",
		        fontSize: "var(--ag-text-xs, 12px)",
		        color: "var(--ag-fg, inherit)"
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(PixelBee, { name: beeName, role: beeRole, state: status === "running" ? "working" : "landed", size: 1 }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { style: { fontWeight: 600, fontSize: "var(--ag-text-sm, 13px)" }, children: actionLabel(action, isZh) }),
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
		            "span",
		            {
		              className: `ag-tc-status ag-tc-${status}`,
		              style: {
		                marginLeft: "auto",
		                display: "inline-flex",
		                alignItems: "center",
		                gap: 5,
		                fontSize: "11px",
		                fontWeight: 500,
		                color: statusColor
		              },
		              children: [
		                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { style: { width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" } }),
		                status === "running" ? isZh ? "\u6267\u884C\u4E2D" : "Running" : status === "error" ? isZh ? "\u51FA\u9519" : "Error" : isZh ? "\u5DF2\u5B8C\u6210" : "Done"
		              ]
		            }
		          )
		        ] }),
		        tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }, children: tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		          "span",
		          {
		            className: "ag-mtag",
		            style: {
		              fontSize: 11,
		              lineHeight: "18px",
		              padding: "0 6px",
		              borderRadius: 999,
		              background: "var(--ag-fill, rgba(128,128,128,0.08))",
		              color: "var(--ag-fg-2, inherit)",
		              fontFamily: "var(--ag-mono, monospace)"
		            },
		            children: tag
		          },
		          tag
		        )) }),
		        preview && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		          "div",
		          {
		            style: {
		              marginTop: 6,
		              color: "var(--ag-fg-muted, #5d676f)",
		              display: "-webkit-box",
		              WebkitLineClamp: 2,
		              WebkitBoxOrient: "vertical",
		              overflow: "hidden"
		            },
		            children: preview
		          }
		        ),
		        (outputText || Object.keys(input).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { marginTop: 6 }, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		            "button",
		            {
		              type: "button",
		              className: "ag-ghost-btn",
		              onClick: () => setExpanded((v) => !v),
		              style: {
		                border: 0,
		                background: "transparent",
		                padding: "2px 4px",
		                fontSize: 11,
		                color: "var(--ag-fg-muted, #5d676f)",
		                cursor: "pointer"
		              },
		              children: expanded ? t("tool.hideDetails") : t("tool.showDetails")
		            }
		          ),
		          expanded && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
		            "pre",
		            {
		              style: {
		                marginTop: 4,
		                maxHeight: 220,
		                overflow: "auto",
		                padding: "6px 8px",
		                borderRadius: 6,
		                background: "var(--ag-fill, rgba(128,128,128,0.08))",
		                fontSize: 11,
		                whiteSpace: "pre-wrap",
		                wordBreak: "break-word"
		              },
		              children: outputText || JSON.stringify(input, null, 2)
		            }
		          )
		        ] })
		      ]
		    }
		  );
		}
		
		// client/index.ts
		function readHostLocale(loc) {
		  if (!loc) return void 0;
		  try {
		    return loc.current ?? loc.locale ?? loc.language ?? loc.get?.();
		  } catch {
		    return void 0;
		  }
		}
		var name = "dsh-ag-swarm-client";
		var inject = ["slots"];
		var STYLE_ATTR = "data-dsh-ag-swarm";
		function apply(ctx) {
		  let styleEl = null;
		  if (typeof document !== "undefined") {
		    styleEl = document.head.querySelector(`style[${STYLE_ATTR}]`);
		    if (!styleEl) {
		      styleEl = document.createElement("style");
		      styleEl.setAttribute(STYLE_ATTR, "");
		      styleEl.textContent = typeof styles_default === "string" ? styles_default : "";
		      document.head.appendChild(styleEl);
		    }
		  }
		  swarmClientStore.setFacesGetter(() => {
		    let api;
		    try {
		      api = ctx.get("connection")?.api;
		    } catch {
		      api = void 0;
		    }
		    let remote;
		    try {
		      remote = ctx.remote;
		    } catch {
		      remote = void 0;
		    }
		    return { api, remote };
		  });
		  let offHostLocale;
		  try {
		    const initialLoc = ctx.locale;
		    syncHostLocale(readHostLocale(initialLoc));
		  } catch {
		  }
		  try {
		    ctx.inject?.(
		      ["connection", "remote", "remote.llm", "remote.session", "locale"],
		      (scope) => {
		        const services = scope;
		        swarmClientStore.setFacesGetter(() => ({
		          api: services.connection?.api,
		          remote: services.remote
		        }));
		        syncHostLocale(readHostLocale(services.locale));
		        const unsub = services.locale?.subscribe?.(() => {
		          syncHostLocale(readHostLocale(services.locale));
		        });
		        if (typeof unsub === "function") offHostLocale = unsub;
		        void swarmClientStore.listModels(true).catch(() => {
		        });
		      }
		    );
		  } catch {
		  }
		  ctx.slots.inject(
		    "conversation.view",
		    () => ctx.slots.register(
		      { name: "conversation.view", id: "ag-swarm", order: 21, label: t("slot.swarm") },
		      SwarmWorkspace
		    )
		  );
		  ctx.slots.inject(
		    "conversation.session.header.actions",
		    () => ctx.slots.register(
		      { name: "conversation.session.header.actions", id: "ag-swarm-status" },
		      HeaderWidget
		    )
		  );
		  ctx.slots.inject(
		    "tool.call.toolview",
		    () => ctx.slots.register(
		      { name: "tool.call.toolview", key: "swarm" },
		      ToolCard
		    )
		  );
		  ctx.slots.inject(
		    "settings.section",
		    () => ctx.slots.register(
		      { name: "settings.section", id: "ag-swarm", order: 31, label: t("slot.settings") },
		      SettingsSection
		    )
		  );
		  return () => {
		    try {
		      offHostLocale?.();
		    } catch {
		    }
		    if (styleEl && styleEl.parentNode) {
		      styleEl.parentNode.removeChild(styleEl);
		    }
		  };
		}
		
		return module.exports;
	}
});
