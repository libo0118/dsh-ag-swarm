# dsh-ag-swarm

Antigravity-style multi-agent Swarm plugin for **DeepSeek Harness (DSH `0.2.2-rc.3+`)** — reproducing Antigravity's **persistent parallel multi-agent collaboration**, **shared channel blackboard & `@mention` doorbell wakeups**, **Git worktree isolation**, **Stall Monitor**, **DSH sidebar main-session running-state keepalive**, and the full **5-Tab Hive & Board Web UI**.

---

## Why `dsh-ag-swarm`? (Architecture & Comparison)

| Capability | `linkbag/dsh-swarm-orchestrator` | `zhairy/dsh-agent-swarm` | Antigravity Native Swarm | **`dsh-ag-swarm` (This Plugin)** |
|---|---|---|---|---|
| Orchestration model | Static 4-role DAG (`architect/builder/reviewer/integrator`) | Fixed leader + 12 expert presets + Journal/Jev | Autonomous peers + shared blackboard | **Autonomous parallel peers + shared blackboard** |
| Worker lifecycle | One-shot stateless `spawn` | `startActivation` / `sendMessage` | Persistent `working/waiting/stopped/killed` | **Persistent `ctx.agents` pool (`working/waiting/stopped/killed`) + `startActivation` fallback** |
| Peer communication | Unidirectional (`swarm_report` to lead) | Lead-coordinated | Full `@name`, `@all`, `@#channel` doorbells | **Full `@name`, `@prefix` pools, `@all`, `@#channel` doorbells** |
| Context inheritance | Fresh spawn only | Seed/notebook bindings | `fork: "<member>" \| "coordinator"` | **`fork` from persisted session events** |
| Workspace isolation | Shared `cwd` (overlap warning only) | Host worktree + boundary fence | `inherit` / `share` / `branch` | **`inherit` / `share` (`ctx.worktrees` or `git worktree`) / `branch` (`git clone`)** |
| DSH sidebar running state | Drops to idle after dispatch | Managed by leader loop | Always visible in Swarm board | **Coordinator `swarm_wait` holds Promise open (0 LLM tokens) so sidebar stays `running`** |
| Model switching | Per-role static pin | Route table + next-call selection | In-place `model` switch while `waiting` | **In-place `agent.model.select` preserving full history + UI Drawer switch** |
| Web UI | Single Kanban/DAG tab | Task progress + model controls | 5-Tab Hive/Board/Members/Graph/Raw + Pixel Bees | **5-Tab Hive/Board/Members/Graph/Raw + Pixel Bees + Drawer + Composer + GIF89a** |

---

## How DSH Integration Works (`0.2.2-rc.3+`)

1. **Cordis Bundle Manifest (`package.json` + `cordis.patch.yml`)**
   - `package.json` declares `dsh.bundle.patch: "./cordis.patch.yml"` and `dsh.client: { platform: "web", inject: ["@deepseek-ai/dsh-client-ui-conversation"] }`.
   - `cordis.patch.yml` mounts `id: ag-swarm` with `storageDir: !!js dshHomePath("storages/ag-swarm")` (unquoted `!!js` expression).
   - Client bundle (`lib/client.js`) is compiled by `esbuild` into `window.__ModuleLoader__.load({ id: "dsh-ag-swarm", factory })`.
2. **Cross-Version Host Adapter (`src/runtime/dsh-adapter.ts`)**
   - Inspired by `zhairy/dsh-agent-swarm`, probes host capabilities before calling:
     - Prefers `ctx.agents.create` / `ctx.agents.resume` for persistent concurrent workers; falls back to `subagents.startActivation` (detecting `0.2.2-rc.3+` flat spec via `typeof subagents.listDescendants === 'function'`, or legacy `subagents.start`).
     - Registers V4 `MessageSourceMap` (`source: { kind: "plugin:dsh-ag-swarm" }`) compliant with `assertV4MessageSources`.
     - Guards `ctx.connection.admit({ headers: req.headers })` on every `/ag-swarm/*` HTTP & SSE endpoint.
3. **DSH Sidebar Main-Session Running State (`swarm_wait`)**
   - DSH's sidebar displays the active working spinner strictly when `ctx.agents.get(sessionId)?.status === "running"`.
   - **`coordinator`** calling `swarm_wait`: holds the tool Promise open at **0 LLM token burn** while listening to `store.on('update')`, `agent/inbox/inserted` (user steering), and `AbortSignal`, resolving as soon as `@coordinator`, `@all`, user input, or all-workers-idle occurs.
   - **`worker`** calling `swarm_wait`: immediately parks at `waiting` (zero tokens) and wakes via `agent.steer(...)` when `@name` / `@all` / `@#channel` rings its doorbell.
4. **Collision-Safe Registration & Role Model Presets**
   - Registers `/swarm` as the primary slash command (with `/ag-swarm` fallback alias; safely skips if `/swarm` is already claimed), and falls back from `swarm_wait` to `ag_swarm_wait` if another plugin occupies `swarm_wait`.
   - **Settings UI Role Model Presets (`设置 → 蜂群设置 → 按角色定制模型`)**: Customize Provider, Model, and Reasoning Effort per built-in role (`default`, `explorer`, `author`, `verifier`, `monitor`) or any custom role in the UI (persisted to `<storageDir>/model-presets.json`), and automatically applied when spawning workers (`explicitModel > role_preset > custom role > worker-name heuristic > default > inherit`).

---

## Tools, Commands & Web UI (默认简体中文 + `EN / 中文` 切换)

- **Model Tools**: `swarm` (`title`, `add` with `role_preset`, `status`, `models`, `model`, `kill`, `channel`, `plan`), `post_message`, `read_board`, `swarm_wait` (or `ag_swarm_wait`).
- **Slash Command**: `/swarm <goal | status | title <t> | add <name> <brief> | post <msg> | kill <name> | help>` (`/ag-swarm` alias supported)
- **Virtual Skills**: `ag-swarm-coordinator`, `ag-swarm-worker`
- **Web UI Slots (`client/index.ts`, 默认简体中文，右上角支持切换中/英文)**:
  - `conversation.view` (`蜂群` / `Swarm`): **总览 (Overview)**、**黑板 (Board)**、**成员 (Members + 抽屉切模/Nudge/Kill)**、**图谱 (Hive 蜂巢 + Mentions 网络 + GIF89a 导出)**、**原始数据 (Raw)**。
  - `conversation.session.header.actions`: 顶栏像素蜜蜂状态胶囊。
  - `tool.call.toolview` (`swarm`): 紧凑工具调度卡片。
  - `settings.section` (`蜂群设置` / `Hive Swarm`): 实时 SSE 状态、活跃蜂群列表、**按角色定制模型**面板、插件运行参数。

---

## Build, Doctor, Test & Install

```bash
# 1. Install dependencies & build server + client bundle
pnpm install
npm run typecheck
npm run build

# 2. Run unit & integration tests (core channels/store/projection + worker pool/worktree/SSE)
npm test

# 3. Check environment, manifest, YAML & build artifacts
npm run doctor

# 4. Pack distributable tarball for DSH Desktop Plugin Manager
npm run pack:tgz

# 5. Link into an isolated non-desktop DSH profile (e.g. web or dev-swarm)
node tools/install-local.mjs --profile dev-swarm
```
