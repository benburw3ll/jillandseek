import { Hono } from 'hono'
import type { RouteDeps } from './deps.ts'

/**
 * GET /api/sources: every source with its status and last read, and how many listings each has
 * that aren't gone (`listingCounts`, by source id).
 */
export function sourcesRoutes(deps: RouteDeps) {
  return new Hono().get('/sources', (c) =>
    c.json({ items: deps.repo.listSources(), listingCounts: deps.repo.listingCounts() }),
  )
}
