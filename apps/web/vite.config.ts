// The site, built by Vite. Under `pnpm dev` Vite serves it on the launch.json port (5200,
// JILL_PORT) and proxies /api to the server on JILL_API_PORT (5201), which apps/server's settings
// also default to. Vite binds 127.0.0.1 only. Tests run in jsdom.
//
// The dev server is guarded like the API, because any website open in the owner's browser can
// send it requests: it sends no CORS headers, serves files from this app and packages/ only (never
// the data home), refuses a request a browser marks as cross-site, and logs no query string.
import react from '@vitejs/plugin-react'
import { createLogger, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const port = Number(process.env.JILL_PORT ?? 5200)
const apiPort = Number(process.env.JILL_API_PORT ?? port + 1)

/** Refuses a request a browser marks as coming from another site (its editor route, its files). */
const sameOriginOnly: Plugin = {
  name: 'jillandseek-same-origin-only',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const site = req.headers['sec-fetch-site']
      if (site !== undefined && site !== 'same-origin' && site !== 'none') {
        res.statusCode = 403
        res.end()
        return
      }
      next()
    })
  },
}

/** Vite's own log, with every query string cut (a proxy error names the request's URL). */
const logger = createLogger()
// A query string ends at a space or at the escape that starts a terminal colour code.
const QUERY = new RegExp(`\\?[^\\s${String.fromCharCode(27)}]*`, 'g')
const withoutQueries = (msg: string) => msg.replace(QUERY, '')
const { error, warn } = logger
logger.error = (msg, options) => error(withoutQueries(msg), options)
logger.warn = (msg, options) => warn(withoutQueries(msg), options)

export default defineConfig({
  plugins: [sameOriginOnly, react()],
  customLogger: logger,
  server: {
    host: '127.0.0.1',
    port,
    strictPort: true,
    cors: false,
    fs: { strict: true, allow: ['.', '../../packages'] },
    // The Host header is kept as the browser sent it (127.0.0.1 or localhost on this port), so the
    // server's Host and Origin guards see the site's own address.
    proxy: { '/api': { target: `http://127.0.0.1:${apiPort}`, changeOrigin: false } },
  },
  preview: { host: '127.0.0.1', port, strictPort: true, cors: false },
  build: { outDir: 'dist', emptyOutDir: true },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
