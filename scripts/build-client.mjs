import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outfile = join(root, 'lib', 'client.js')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const result = await build({
  entryPoints: [join(root, 'client', 'index.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    'react-dom/client',
    '@deepseek-ai/cordis',
    '@deepseek-ai/dsh-client-runtime/client',
    '@deepseek-ai/dsh-client-connection/client',
    '@deepseek-ai/dsh-client-ui-slots',
    '@deepseek-ai/dsh-client-ui-conversation/client',
  ],
  jsx: 'automatic',
  loader: { '.css': 'text' },
  write: false,
  logLevel: 'info',
  target: 'es2020',
})

const factoryBody = result.outputFiles[0].text
const wrapped = `window.__ModuleLoader__.load({
\tid: "dsh-ag-swarm",
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${factoryBody.split('\n').map((l) => '\t\t' + l).join('\n')}
\t\treturn module.exports;
\t}
});
`

mkdirSync(dirname(outfile), { recursive: true })
writeFileSync(outfile, wrapped, 'utf8')
console.log(`build:client -> ${outfile} (${wrapped.length} bytes, v${pkg.version})`)
