import { Hono } from 'hono'
import type { RouteDeps } from './deps.ts'

/** GET /api/sweeps: the 20 most recent sweeps, newest first, with their counts and error codes. */
export function sweepsRoutes(deps: RouteDeps) {
  return new Hono().get('/sweeps', (c) => c.json({ items: deps.repo.listSweeps(20) }))
}
