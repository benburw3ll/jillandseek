import type { MiddlewareHandler } from 'hono'
import { matchedRoutes, routePath } from 'hono/route'

// One log line per request: the method, the route pattern (never the path itself, which can hold
// an id or a word), the status and the time taken. Never a body, a query value or a header.

export type Log = (line: string) => void

const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])

export function requestLog(log: Log, clock: () => number = () => performance.now()): MiddlewareHandler {
  return async (c, next) => {
    const started = clock()
    try {
      await next()
    } finally {
      const method = METHODS.has(c.req.method) ? c.req.method : 'OTHER'
      const ms = Math.round(clock() - started)
      // The route that answers (a method route), even when a guard refused the request first.
      const route = matchedRoutes(c).find((r) => r.method !== 'ALL')?.path ?? routePath(c, -1)
      log(`request: ${method} ${route} ${c.res.status} ${ms}ms`)
    }
  }
}
