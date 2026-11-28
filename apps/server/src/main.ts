// The server's entry point. `node src/main.ts` is `pnpm start` (real data in data/, serving the
// built site); `node --watch src/main.ts --dev` is `pnpm dev` (data in .dev-home/, behind Vite).
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { serve } from '@hono/node-server'
import { collectors, createFetcher } from '@jillandseek/sources'
import { createAiClient } from './ai/client.ts'
import { createKeyReader } from './ai/key.ts'
import { createSdkTransport } from './ai/sdk.ts'
import { createApp } from './app.ts'
import { isWritable } from './db/home.ts'
import { openStore, schedulePrune } from './db/store.ts'
import { HOSTNAME, loadSettings, REPO_ROOT } from './settings.ts'
import { syncRegistry } from './sweep/registry.ts'
import { scheduleSweeps } from './sweep/sweep.ts'

const mode = process.argv.includes('--dev') ? 'dev' : 'start'
const settings = loadSettings(process.env, mode)
const log = (line: string) => console.log(line)
const now = () => new Date()

const version = (
  JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf8')) as { version: string }
).version
const store = openStore({ home: settings.home, retention: settings.retention, now, log })
schedulePrune(store, { now, log })
syncRegistry(store.repo, log)
const sweeps = settings.sweep
  ? scheduleSweeps({ repo: store.repo, collectors, fetcher: createFetcher({ version, now }), now, log })
  : null
if (sweeps === null) log('sweep: off')

// The one capped client (ADR-0007). With JILL_AI off, which is the default, it refuses every call.
const ai = createAiClient({
  settings: settings.ai,
  repo: store.repo,
  readKey: createKeyReader({ file: settings.ai.keyFile }),
  keySaved: () => existsSync(settings.ai.keyFile),
  transport: (apiKey) => createSdkTransport({ apiKey }),
  now,
  log,
})
const aiStatus = ai.status()
log(
  aiStatus.enabled
    ? `ai: on model=${aiStatus.model} today=${aiStatus.today}/${aiStatus.dailyCap} month=${aiStatus.month}/${aiStatus.monthlyCap} keySaved=${aiStatus.keySaved}`
    : 'ai: off',
)

const app = createApp({
  repo: store.repo,
  ai,
  now,
  version,
  schemaVersion: store.schemaVersion,
  dataHomeWritable: () => isWritable(store.home),
  ports: [...new Set([settings.port, settings.sitePort])],
  log,
  ...(mode === 'start' && { siteDir: join(REPO_ROOT, 'apps', 'web', 'dist') }),
})

const server = serve({ fetch: app.fetch, port: settings.port, hostname: HOSTNAME }, (info) => {
  log(`server: listening on http://${HOSTNAME}:${info.port} mode=${mode} schema=${store.schemaVersion}`)
  if (mode === 'start') log(`server: open http://${HOSTNAME}:${settings.sitePort}/`)
})

const stop = () => {
  sweeps?.stop()
  server.close()
  store.close()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
