import { useEffect, useState } from 'react'

export type UiLocale = 'zh-CN' | 'en'

const STORAGE_KEY = 'dsh-ag-swarm:locale'
let currentLocale: UiLocale = 'zh-CN'
let hasExplicitUserPref = false
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  try {
    const saved = window.localStorage?.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'zh-CN') {
      currentLocale = saved
      hasExplicitUserPref = true
    }
  } catch {
    // ignore storage errors
  }
}

export function getUiLocale(): UiLocale {
  return currentLocale
}

export function setUiLocale(next: UiLocale): void {
  if (next !== 'zh-CN' && next !== 'en') return
  currentLocale = next
  hasExplicitUserPref = true
  if (typeof window !== 'undefined') {
    try {
      window.localStorage?.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }
  for (const fn of listeners) fn()
}

export function toggleUiLocale(): UiLocale {
  const next: UiLocale = currentLocale === 'zh-CN' ? 'en' : 'zh-CN'
  setUiLocale(next)
  return next
}

export function syncHostLocale(hostLocale?: string): void {
  if (hasExplicitUserPref || !hostLocale) return
  // Default strictly remains zh-CN unless user explicitly switches to English.
  if (hostLocale.toLowerCase().startsWith('zh')) {
    currentLocale = 'zh-CN'
    for (const fn of listeners) fn()
  }
}

export function useUiLocale(): UiLocale {
  const [loc, setLoc] = useState<UiLocale>(() => currentLocale)
  useEffect(() => {
    const fn = (): void => setLoc(currentLocale)
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }, [])
  return loc
}

const MESSAGES = {
  'zh-CN': {
    'slot.swarm': '蜂群',
    'slot.settings': '蜂群设置',
    'common.refresh': '刷新',
    'common.refreshing': '刷新中…',
    'common.copy': '复制',
    'common.copied': '已复制',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.saving': '保存中…',
    'common.close': '关闭',
    'common.all': '全部',
    'common.live': '实时',
    'common.reconnecting': '重连中',
    'common.offline': '离线',
    'common.showMore': '展开更多',
    'common.showLess': '收起',
    'common.loading': '正在加载蜂群面板…',
    'common.emptyTitle': '当前会话尚未启动蜂群',
    'common.emptyDesc': '在聊天框输入 `/swarm <目标>` 即可创建并发多子代理蜂群；若已有其他历史蜂群，也可从右上角下拉切换查看。',
    'tab.overview': '总览',
    'tab.board': '黑板',
    'tab.members': '成员',
    'tab.graph': '图谱',
    'tab.raw': '原始数据',
    'overview.goal': '蜂群目标',
    'overview.running': '进行中',
    'overview.progress': '整体进度',
    'overview.tasksDone': '已完成 {done}/{total} 项任务',
    'overview.waitingCount': '{count} 等待中',
    'overview.stuckCount': '{count} 疑似卡住',
    'overview.threadsOpen': '{count} 个工作流',
    'overview.doneList': '已完成',
    'overview.upNext': '待推进',
    'overview.reel': '进度截图时间轴',
    'overview.compare': '与当前对比',
    'overview.exitCompare': '退出对比',
    'overview.threads': '工作流分组',
    'overview.team': '蜂群团队',
    'overview.filterBy': '筛选成员：{name}',
    'overview.clearFilter': '查看全部',
    'overview.stallTitle': '蜂群暂停推进 — 当前无成员工作中',
    'overview.stuckAlert': '@{name} 疑似卡住',
    'overview.stuckDetail': '持续工作超过 10 分钟未在黑板汇报',
    'overview.onboardingTitle': '正在唤醒多子代理蜂群…',
    'overview.onboardingDesc': '协调者正在拆分任务并派发并发成员，首个黑板播报到达后这里将自动展开。',
    'board.search': '搜索黑板发言（成员名或正文）…',
    'board.filter': '筛选',
    'board.follow': '自动跟随',
    'board.from': '发送方',
    'board.to': '提及对象',
    'board.channel': '频道',
    'board.showEarlier': '加载更早发言',
    'board.latest': '回到底部最新',
    'board.newDivider': '新消息',
    'board.composePlaceholder': '发帖到 #{channel} 或 @某位成员…',
    'board.composeBtn': '发帖',
    'board.send': '发送',
    'members.search': '搜索成员、模型、分支或任务…',
    'members.coordinator': '协调者',
    'members.active': '工作中',
    'members.standingBy': '待命中',
    'members.retired': '已停止',
    'members.state.working': '工作中',
    'members.state.waiting': '等待中',
    'members.state.stopped': '已休眠',
    'members.state.killed': '已终止',
    'members.waitingOn': '等待 @{target}',
    'members.wokenBy': '被 #{seq} 唤醒',
    'drawer.controls': '实时控制',
    'drawer.switchModel': '原地切换模型（等待/休眠态可用，保留完整历史）',
    'drawer.switchBtn': '切换模型',
    'drawer.nudge': '唤醒 / 发送指令（Nudge）',
    'drawer.nudgePlaceholder': '输入要发送给 @{name} 的消息…',
    'drawer.nudgeBtn': '唤醒',
    'drawer.kill': '终止成员（Kill）',
    'drawer.killConfirm': '确认终止 @{name}？（将清理其独立 worktree）',
    'drawer.confirmKillBtn': '确认终止',
    'drawer.transcript': '工作上下文与执行轨迹',
    'drawer.noSteps': '暂无可展示的执行轨迹记录。',
    'graph.hive': '蜂巢视图',
    'graph.mentions': '提及网络',
    'graph.evenPacing': '均匀节奏',
    'graph.realTime': '真实间隔',
    'graph.exportGif': '导出 GIF',
    'graph.exporting': '编码 GIF 中…',
    'graph.hideInactive': '隐藏无交互',
    'graph.expandAll': '展开 @all',
    'graph.postsOver': '{count} 条动态 · 跨度 {span}',
    'graph.cellsDone': '{cells} 个工作区 · 已完成 {done}/{total}',
    'graph.legendDone': '任务完成',
    'graph.legendMsg': '消息流向',
    'graph.legendWait': '等待依赖',
    'graph.legendDirect': '直连 / 频道',
    'graph.legendAll': '@all 广播',
    'graph.legendUnaddressed': '无定向发言',
    'raw.refresh': '刷新原文',
    'header.working': '{count} 工作中',
    'header.waiting': '全部待命',
    'header.noSwarm': '蜂群待命',
    'header.title': '实时蜂群队列',
    'header.recent': '最近黑板动态',
    'settings.title': 'DSH 蜂群（Hive Swarm）',
    'settings.activeSwarms': '活跃蜂群列表',
    'settings.noSwarms': '暂无蜂群记录。可在任意会话输入 `/swarm <目标>` 启动。',
    'settings.roleModelsTitle': '按角色定制模型',
    'settings.roleModelsDesc': '为不同职责的成员预设模型与思考强度；派发 Worker 时若未显式指定模型，将自动按此映射选用。',
    'settings.inheritMain': '继承主对话模型（默认）',
    'settings.customModelPlaceholder': '或手动输入模型 ID（如 deepseek-v4-pro）',
    'settings.effortDefault': '默认强度',
    'settings.addRolePlaceholder': '添加自定义角色（如 frontend、docs）',
    'settings.addRoleBtn': '添加角色',
    'settings.savePresets': '保存角色模型配置',
    'settings.presetsSaved': '角色模型预设已保存，新派发的 Worker 将自动生效。',
    'settings.pluginConfig': '插件运行参数',
    'settings.primaryCmd': '主斜杠命令',
    'settings.waitTool': '阻塞等待工具',
    'role.default': '默认子代理 (default)',
    'role.explorer': '探索 / 调研 (explorer)',
    'role.author': '编码 / 实现 (author)',
    'role.verifier': '审查 / 验证 (verifier)',
    'role.monitor': '巡检监控 (monitor)',
    'tool.title': '蜂群调度：{action}',
    'tool.showDetails': '查看详情',
    'tool.hideDetails': '收起详情',
  },
  en: {
    'slot.swarm': 'Swarm',
    'slot.settings': 'Hive Swarm',
    'common.refresh': 'Refresh',
    'common.refreshing': 'Refreshing…',
    'common.copy': 'Copy',
    'common.copied': 'Copied',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.saving': 'Saving…',
    'common.close': 'Close',
    'common.all': 'All',
    'common.live': 'Live',
    'common.reconnecting': 'Reconnecting',
    'common.offline': 'Offline',
    'common.showMore': 'Show more',
    'common.showLess': 'Show less',
    'common.loading': 'Loading swarm workspace…',
    'common.emptyTitle': 'No active swarm in this conversation',
    'common.emptyDesc': 'Start one with `/swarm <goal>` in chat, or switch to an existing swarm from the header.',
    'tab.overview': 'Overview',
    'tab.board': 'Board',
    'tab.members': 'Members',
    'tab.graph': 'Graph',
    'tab.raw': 'Raw',
    'overview.goal': 'GOAL',
    'overview.running': 'Running',
    'overview.progress': 'Progress',
    'overview.tasksDone': '{done} of {total} tasks done',
    'overview.waitingCount': '{count} waiting',
    'overview.stuckCount': '{count} stuck',
    'overview.threadsOpen': '{count} threads open',
    'overview.doneList': 'Done',
    'overview.upNext': 'Up next',
    'overview.reel': 'PROGRESS',
    'overview.compare': 'Compare with now',
    'overview.exitCompare': 'Exit compare',
    'overview.threads': 'Threads',
    'overview.team': 'The team',
    'overview.filterBy': 'Filtered by @{name}',
    'overview.clearFilter': 'Show all',
    'overview.stallTitle': 'Swarm stalled — no agents working',
    'overview.stuckAlert': '@{name} appears stuck',
    'overview.stuckDetail': 'Working for more than 10 minutes without a board update',
    'overview.onboardingTitle': 'Spinning up parallel swarm…',
    'overview.onboardingDesc': 'Coordinator is splitting work across parallel workers; live updates appear once the first post arrives.',
    'board.search': 'Search board posts…',
    'board.filter': 'Filter',
    'board.follow': 'Follow',
    'board.from': 'From',
    'board.to': 'To',
    'board.channel': 'Channel',
    'board.showEarlier': 'Show earlier posts',
    'board.latest': 'Latest',
    'board.newDivider': 'New',
    'board.composePlaceholder': 'Post to #{channel} or @mention a member…',
    'board.composeBtn': 'Compose',
    'board.send': 'Send',
    'members.search': 'Search members, models, branches, tasks…',
    'members.coordinator': 'Coordinator',
    'members.active': 'ACTIVE',
    'members.standingBy': 'STANDING BY',
    'members.retired': 'RETIRED',
    'members.state.working': 'Working',
    'members.state.waiting': 'Waiting',
    'members.state.stopped': 'Stopped',
    'members.state.killed': 'Retired',
    'members.waitingOn': 'Waiting on @{target}',
    'members.wokenBy': 'Woken by #{seq}',
    'drawer.controls': 'CONTROLS',
    'drawer.switchModel': 'Switch model (available while waiting/stopped)',
    'drawer.switchBtn': 'Switch',
    'drawer.nudge': 'Nudge (send wakeup message)',
    'drawer.nudgePlaceholder': 'Wake @{name} with optional note…',
    'drawer.nudgeBtn': 'Nudge',
    'drawer.kill': 'Terminate worker',
    'drawer.killConfirm': 'Terminate @{name}? (Cleans up isolated worktree)',
    'drawer.confirmKillBtn': 'Confirm Kill',
    'drawer.transcript': 'WORK CONTEXT & TRANSCRIPT',
    'drawer.noSteps': 'No transcript steps recorded yet.',
    'graph.hive': 'Hive',
    'graph.mentions': 'Mentions',
    'graph.evenPacing': 'Even pacing',
    'graph.realTime': 'Real-time gaps',
    'graph.exportGif': 'Export GIF',
    'graph.exporting': 'Encoding GIF…',
    'graph.hideInactive': 'Hide inactive',
    'graph.expandAll': 'Expand @all',
    'graph.postsOver': '{count} posts over {span}',
    'graph.cellsDone': '{cells} cells · {done}/{total} done',
    'graph.legendDone': 'Tasks done',
    'graph.legendMsg': 'Message sent',
    'graph.legendWait': 'Waiting on',
    'graph.legendDirect': 'Direct / channel',
    'graph.legendAll': 'Via @all',
    'graph.legendUnaddressed': 'Unaddressed post',
    'raw.refresh': 'Refresh',
    'header.working': '{count} working',
    'header.waiting': 'All idle',
    'header.noSwarm': 'Swarm idle',
    'header.title': 'Live Swarm Roster',
    'header.recent': 'Recent board activity',
    'settings.title': 'DSH Hive Swarm',
    'settings.activeSwarms': 'ACTIVE SWARMS',
    'settings.noSwarms': 'No swarms recorded yet. Start one with `/swarm <goal>`.',
    'settings.roleModelsTitle': 'ROLE MODEL PRESETS',
    'settings.roleModelsDesc': 'Customize models and reasoning effort per role. Workers without an explicit model inherit from this table.',
    'settings.inheritMain': 'Inherit main chat model (default)',
    'settings.customModelPlaceholder': 'Or type custom model ID (e.g. deepseek-v4-pro)',
    'settings.effortDefault': 'Default effort',
    'settings.addRolePlaceholder': 'Add custom role (e.g. frontend, docs)',
    'settings.addRoleBtn': 'Add role',
    'settings.savePresets': 'Save Role Presets',
    'settings.presetsSaved': 'Role model presets saved. New workers will use them automatically.',
    'settings.pluginConfig': 'PLUGIN CONFIGURATION',
    'settings.primaryCmd': 'Primary command',
    'settings.waitTool': 'Wait tool',
    'role.default': 'Default Worker (default)',
    'role.explorer': 'Explorer / Researcher (explorer)',
    'role.author': 'Author / Builder (author)',
    'role.verifier': 'Verifier / Reviewer (verifier)',
    'role.monitor': 'Stall Monitor (monitor)',
    'tool.title': 'Swarm: {action}',
    'tool.showDetails': 'Show details',
    'tool.hideDetails': 'Hide details',
  },
} as const

export type I18nKey = keyof (typeof MESSAGES)['zh-CN']

export function t(key: I18nKey, params?: Record<string, string | number>): string {
  const table = MESSAGES[currentLocale] ?? MESSAGES['zh-CN']
  let text: string = table[key] ?? MESSAGES['zh-CN'][key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v))
    }
  }
  return text
}
