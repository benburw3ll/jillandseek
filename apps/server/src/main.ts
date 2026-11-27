// The server's entry point. `node src/main.ts` is `pnpm start` (real data in data/, serving the
// built site); `node --watch src/main.ts --dev` is `pnpm dev` (data in .dev-home/, behind Vite).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { serve } from '@hono/node-server'
import { createApp } from './app.ts'
import { isWritable } from './db/home.ts'
import { openStore, schedulePrune } from './db/store.ts'
import { HOSTNAME, loadSettings, REPO_ROOT } from './settings.ts'
import { syncRegistry } from './sweep/registry.ts'

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

const app = createApp({
  repo: store.repo,
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
  server.close()
  store.close()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
