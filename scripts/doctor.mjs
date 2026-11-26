#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const results = []

function check(name, ok, detail) {
  results.push({ name, ok, detail })
  const mark = ok ? 'PASS' : 'FAIL'
  console.log(`[${mark}] ${name}: ${detail}`)
}

// 1. Node version
const [major] = process.versions.node.split('.').map(Number)
check('node.version', major >= 22, `v${process.versions.node} (requires >=22.0.0)`)

// 2. package.json manifest
const pkgPath = join(root, 'package.json')
let pkg = null
try {
  pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const hasExports = Boolean(pkg.exports?.['.'] && pkg.exports?.['./client'])
  const hasDsh = pkg.dsh?.manifestVersion === 1 && Boolean(pkg.dsh?.bundle?.patch) && pkg.dsh?.client?.platform === 'web'
  check('package.manifest', hasExports && hasDsh, `name=${pkg.name}, version=${pkg.version}, dsh.minVersion=${pkg.dsh?.minVersion || 'unset'}`)
} catch (err) {
  check('package.manifest', false, String(err))
}

// 3. cordis.patch.yml check (unquoted !!js dshHomePath)
const patchPath = join(root, 'cordis.patch.yml')
try {
  const raw = readFileSync(patchPath, 'utf8')
  const hasUnquotedJs = /storageDir:\s*!!js\s+dshHomePath\(["']storages\/ag-swarm["']\)/.test(raw)
  const hasQuotedJs = /storageDir:\s*["']!!js/.test(raw)
  check('cordis.patch.yml', hasUnquotedJs && !hasQuotedJs, hasUnquotedJs ? 'unquoted !!js dshHomePath verified' : 'missing or quoted !!js dshHomePath')
} catch (err) {
  check('cordis.patch.yml', false, String(err))
}

// 4. Built artifacts
const serverEntry = join(root, 'lib', 'index.js')
const clientEntry = join(root, 'lib', 'client.js')
check('build.server', existsSync(serverEntry), existsSync(serverEntry) ? serverEntry : 'missing lib/index.js (run npm run build)')
if (existsSync(clientEntry)) {
  const clientBody = readFileSync(clientEntry, 'utf8')
  const validWrapper = clientBody.includes('window.__ModuleLoader__.load') && clientBody.includes('id: "dsh-ag-swarm"')
  check('build.client', validWrapper, validWrapper ? `${clientBody.length} bytes, valid __ModuleLoader__ wrapper` : 'missing __ModuleLoader__ wrapper')
} else {
  check('build.client', false, 'missing lib/client.js (run npm run build)')
}

// 5. Local DSH installation detection (optional, informational on CI)
const dshPkgCandidates = [
  process.env.DSH_APP_DIR && join(process.env.DSH_APP_DIR, 'node_modules', '@deepseek-ai', 'dsh', 'package.json'),
  'D:/develop/deepseek/resources/app/dsh/node_modules/@deepseek-ai/dsh/package.json',
].filter(Boolean)

const foundDsh = dshPkgCandidates.find((p) => existsSync(p))
if (foundDsh) {
  const dshPkg = JSON.parse(readFileSync(foundDsh, 'utf8'))
  check('dsh.host', true, `v${dshPkg.version} at ${dirname(foundDsh)}`)
} else {
  check('dsh.host', true, 'local DSH desktop path not detected (non-fatal if running on remote/CI)')
}

// 6. Optional --profile check
const profIdx = process.argv.indexOf('--profile')
if (profIdx !== -1 && process.argv[profIdx + 1]) {
  const profileName = process.argv[profIdx + 1]
  const dshHome = process.env.DSH_HOME?.trim() || join(homedir(), '.dsh')
  const profPkgPath = join(dshHome, 'profiles', profileName, 'package.json')
  if (existsSync(profPkgPath)) {
    const profPkg = JSON.parse(readFileSync(profPkgPath, 'utf8'))
    const linked = Boolean(profPkg.dependencies?.['dsh-ag-swarm'] || profPkg.dsh?.profile?.bundles?.includes?.('dsh-ag-swarm'))
    check(`profile.${profileName}`, linked, linked ? 'dsh-ag-swarm registered in profile' : 'profile exists, dsh-ag-swarm not added yet')
  } else {
    check(`profile.${profileName}`, false, `not found: ${profPkgPath}`)
  }
}

const failed = results.filter((r) => !r.ok)
if (failed.length > 0) {
  console.error(`\nDoctor found ${failed.length} issue(s).`)
  process.exit(1)
}
console.log(`\nDoctor passed (${results.length}/${results.length} checks OK).`)
