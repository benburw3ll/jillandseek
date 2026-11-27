import { Hono } from 'hono'
import { jsonError } from './http/errors.ts'
import { capBody, hostAndOrigin, ownHosts, sameOriginApi, stateChange } from './http/guards.ts'
import { type Log, requestLog } from './http/log.ts'
import { siteHandler } from './http/site.ts'
import type { RouteDeps } from './routes/deps.ts'
import { dogsRoutes } from './routes/dogs.ts'
import { healthRoutes } from './routes/health.ts'
import { listingsRoutes } from './routes/listings.ts'
import { sourcesRoutes } from './routes/sources.ts'

// The one app file: the guards, the request log, and every route file registered under /api.
// Each resource has its own route file, so work on one never edits another's.

export type AppOptions = RouteDeps & {
  /** The ports whose Host and Origin count as the app's own (the server's and the browser's). */
  ports: number[]
  log: Log
  /** The built site to serve (`pnpm start`), or undefined when Vite serves it (`pnpm dev`). */
  siteDir?: string
}

export function createApp(options: AppOptions) {
  const app = new Hono()

  app.use(requestLog(options.log))
  app.use(async (c, next) => {
    await next()
    c.header('x-content-type-options', 'nosniff')
    c.header('referrer-policy', 'no-referrer')
    c.header('x-frame-options', 'DENY')
    // Another site's page can't embed a response, and the API's answers (which can hold contact
    // lines) are never kept in the browser's cache.
    c.header('cross-origin-resource-policy', 'same-origin')
    if (c.req.path.startsWith('/api/')) c.header('cache-control', 'no-store')
    c.header(
      'content-security-policy',
      "default-src 'self'; img-src 'self' https: data:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
    )
  })
  app.use(hostAndOrigin(ownHosts(options.ports)))
  app.use(stateChange)
  app.use('/api/*', sameOriginApi, capBody)

  const api = new Hono()
  api.route('/', healthRoutes(options))
  api.route('/', sourcesRoutes(options))
  api.route('/', listingsRoutes(options))
  api.route('/', dogsRoutes(options))
  app.route('/api', api)
  app.all('/api/*', (c) => jsonError(c, 404, 'not-found'))

  if (options.siteDir !== undefined) {
    const site = siteHandler(options.siteDir)
    app.get('/*', site)
  }

  app.notFound((c) => jsonError(c, 404, 'not-found'))
  // A stack trace or a message can carry the request's values, so neither leaves the server or
  // reaches the log: the client gets a code, and the log gets the code (the request line adds
  // the route and the status).
  app.onError((_error, c) => {
    options.log('error: code=internal')
    return jsonError(c, 500, 'internal')
  })
  return app
}
