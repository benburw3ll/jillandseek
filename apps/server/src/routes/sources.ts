import { Hono } from 'hono'
import { jsonError } from '../http/errors.ts'
import type { Log } from '../http/log.ts'
import type { RouteDeps } from './deps.ts'

export function sourcesRoutes(deps: RouteDeps & { log: Log }) {
  return (
    new Hono()
      /**
       * GET /api/sources: every source with its status and last read, and how many listings each
       * has that aren't gone (`listingCounts`, by source id).
       */
      .get('/sources', (c) => c.json({ items: deps.repo.listSources(), listingCounts: deps.repo.listingCounts() }))
      /**
       * POST /api/sources/:id/clear-block: the owner clears a block (ADR-0002 point 3, #35). The
       * source is active again and the sweep reads it when it is next due: this never starts a
       * read and never resets `last_read_at`, so the 30-minute floor still holds.
       */
      .post('/sources/:id/clear-block', (c) => {
        const id = c.req.param('id')
        const source = deps.repo.getSource(id)
        if (source === null) return jsonError(c, 404, 'not-found')
        if (source.status !== 'blocked') return jsonError(c, 409, 'not-blocked')
        deps.repo.clearBlock(id)
        deps.log(`sources: cleared block source=${source.id}`)
        return c.json(deps.repo.getSource(id))
      })
  )
}
