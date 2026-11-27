import { readFileSync, statSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import type { Handler } from 'hono'
import { jsonError } from './errors.ts'

// Serves the built site (apps/web/dist) under `pnpm start`. A path never climbs out of the site's
// folder: one with a `..` segment, a backslash or a NUL is refused before the disk is touched, and
// the resolved file must still sit inside the folder. A path with no file extension gets
// index.html, so the site's own routes load.

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
}

const isFile = (path: string) => {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}

export function siteHandler(siteDir: string): Handler {
  const root = resolve(siteDir)
  return (c) => {
    let path: string
    try {
      path = decodeURIComponent(new URL(c.req.url).pathname)
    } catch {
      return jsonError(c, 400, 'bad-path')
    }
    const segments = path.split('/')
    if (segments.includes('..') || path.includes('\\') || path.includes('\0')) return jsonError(c, 400, 'bad-path')
    const wanted = resolve(join(root, ...segments))
    if (wanted !== root && !wanted.startsWith(root + sep)) return jsonError(c, 400, 'bad-path')
    const file = isFile(wanted) ? wanted : extname(path) === '' ? join(root, 'index.html') : null
    if (file === null || !isFile(file)) return jsonError(c, 404, 'not-found')
    const type = TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream'
    const body = readFileSync(file)
    c.header('content-type', type)
    if (file.startsWith(join(root, 'assets') + sep)) c.header('cache-control', 'public, max-age=31536000, immutable')
    else c.header('cache-control', 'no-cache')
    return c.req.method === 'HEAD' ? c.body(null) : c.body(body)
  }
}
