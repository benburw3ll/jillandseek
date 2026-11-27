import { ListingQuery } from '@jillandseek/core'
import { Hono } from 'hono'
import { z } from 'zod'
import { InvalidCursorError } from '../db/listings.ts'
import { invalid, jsonError } from '../http/errors.ts'
import type { RouteDeps } from './deps.ts'

/** The query string's text, turned into ListingQuery's values. Unknown names are ignored. */
const QueryText = z.object({
  kind: z.string().optional(),
  since: z.string().optional(),
  until: z.string().optional(),
  town: z.string().optional(),
  county: z.string().optional(),
  includeGone: z.enum(['true', 'false']).optional(),
  limit: z
    .string()
    .regex(/^\d{1,4}$/)
    .optional(),
  cursor: z.string().optional(),
})

export function listingsRoutes(deps: RouteDeps) {
  return new Hono().get('/listings', (c) => {
    const text = QueryText.safeParse(c.req.query())
    if (!text.success) return invalid(c, text.error)
    const { includeGone, limit, ...rest } = text.data
    const query = ListingQuery.safeParse({
      ...rest,
      ...(includeGone !== undefined && { includeGone: includeGone === 'true' }),
      ...(limit !== undefined && { limit: Number(limit) }),
    })
    if (!query.success) return invalid(c, query.error)
    try {
      return c.json(deps.repo.listListings(query.data))
    } catch (error) {
      if (error instanceof InvalidCursorError) return jsonError(c, 400, 'invalid-cursor')
      throw error
    }
  })
}
