import { Hono } from 'hono'
import type { RouteDeps } from './deps.ts'

export function sourcesRoutes(deps: RouteDeps) {
  return new Hono().get('/sources', (c) => c.json({ items: deps.repo.listSources() }))
}
