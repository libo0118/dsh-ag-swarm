#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)

function usage() {
  console.log(`dsh-ag-swarm local installer

Usage:
  node tools/install-local.mjs --profile <name>   Link plugin into a non-desktop DSH profile (e.g. web or dev-swarm)
  node tools/install-local.mjs --desktop-hint     Show safe instructions for importing into DSH Desktop
`)
}

if (args.includes('--desktop-hint') || args.length === 0) {
  usage()
  console.log(`Safe DSH Desktop installation (recommended):
1. Build & pack a tarball:
   npm run build && npm run pack:tgz
2. In DeepSeek Harness Desktop: open "Plugins" -> "Install from local package / .tgz",
   and select the generated dsh-ag-swarm-0.1.0.tgz (or link path ${root}).
3. Note: Desktop profile ("desktop") is managed exclusively by the Electron host;
   avoid mutating ~/.dsh/profiles/desktop manually while DSH Desktop is running.`)
  process.exit(0)
}

const profIdx = args.indexOf('--profile')
const profile = profIdx !== -1 ? args[profIdx + 1] : undefined
if (!profile) {
  usage()
  process.exit(1)
}
if (profile === 'desktop') {
  console.error('Refused: profile "desktop" is managed exclusively by DSH Desktop. Use --desktop-hint instead.')
  process.exit(1)
}

const dshBin = process.env.DSH_BIN || 'D:/develop/deepseek/resources/app/dsh/node_modules/@deepseek-ai/dsh/lib/bin.js'
if (!existsSync(dshBin)) {
  console.error(`DSH CLI not found at ${dshBin}. Set DSH_BIN env var to @deepseek-ai/dsh/lib/bin.js.`)
  process.exit(1)
}

const linkSpec = `link:${root.replaceAll('\\', '/')}`
console.log(`Linking ${linkSpec} into profile "${profile}"...`)
const addRes = spawnSync(process.execPath, [dshBin, 'plugin', '--profile', profile, 'add', linkSpec], { stdio: 'inherit' })
if (addRes.status !== 0) process.exit(addRes.status ?? 1)

console.log(`Verifying config expansion for profile "${profile}"...`)
const dumpRes = spawnSync(process.execPath, [dshBin, '--profile', profile, '--dump-config'], { stdio: 'pipe', encoding: 'utf8' })
if (dumpRes.status !== 0) {
  console.error(dumpRes.stderr || dumpRes.stdout)
  process.exit(dumpRes.status ?? 1)
}
console.log(`OK: dsh-ag-swarm linked and verified in profile "${profile}".`)
