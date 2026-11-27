import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it } from 'vitest'
import { createFetcher, FetchFailed, SourceBlocked } from './fetcher.ts'

// A local fake server stands in for a made-up source at pound.example.com. The transport sends
// each https request for that host to the fake server on 127.0.0.1; nothing leaves this computer.

type Handler = (req: IncomingMessage, res: ServerResponse) => void
const servers: { close(): void }[] = []
afterEach(() => {
  for (const s of servers.splice(0)) s.close()
})

const SOURCE = 'https://pound.example.com/strays'
const T0 = Date.parse('2026-01-10T12:00:00.000Z')

async function fake(routes: Record<string, Handler>) {
  const seen: { path: string; ua: string | undefined; cookie: string | undefined }[] = []
  const server = createServer((req, res) => {
    seen.push({ path: req.url ?? '', ua: req.headers['user-agent'], cookie: req.headers.cookie })
    const handler = routes[req.url ?? ''] ?? routes['*']
    if (handler) handler(req, res)
    else {
      res.statusCode = 404
      res.end('not found')
    }
  })
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
  servers.push(server)
  const port = (server.address() as AddressInfo).port
  let clock = T0
  const waits: number[] = []
  let failNext = 0
  const fetcher = createFetcher({
    version: '9.9.9',
    now: () => new Date(clock),
    sleep: async (ms) => {
      waits.push(ms)
      clock += ms
    },
    transport: async (url, init) => {
      if (failNext > 0) {
        failNext--
        throw new TypeError('fetch failed')
      }
      const u = new URL(url)
      expect(u.protocol).toBe('https:')
      return fetch(`http://127.0.0.1:${port}${u.pathname}${u.search}`, init)
    },
  })
  return {
    seen,
    waits,
    fetcher,
    advance: (ms: number) => {
      clock += ms
    },
    failNextRequests: (n: number) => {
      failNext = n
    },
  }
}

const text =
  (body: string, status = 200, headers: Record<string, string> = {}): Handler =>
  (_req, res) => {
    res.writeHead(status, { 'content-type': 'text/html', ...headers })
    res.end(body)
  }
const robots = (body: string) => text(body, 200, { 'content-type': 'text/plain' })

describe('the fetcher', () => {
  it('reads an allowed page with the honest User-Agent and no cookie', async () => {
    const f = await fake({ '/robots.txt': robots('User-agent: *\nDisallow: /private'), '/strays': text('<p>ok</p>') })
    const page = await f.fetcher.forSource(SOURCE).get(SOURCE)
    expect(page).toMatchObject({ status: 200, body: '<p>ok</p>', url: SOURCE })
    expect(f.seen.map((s) => s.path)).toEqual(['/robots.txt', '/strays'])
    for (const s of f.seen) {
      expect(s.ua).toBe('JillAndSeek/9.9.9 (+https://github.com/benburw3ll/jillandseek)')
      expect(s.cookie).toBeUndefined()
    }
  })

  it('refuses a path robots.txt disallows, also through path tricks, and never asks for it', async () => {
    const f = await fake({
      '/robots.txt': robots('User-agent: *\nDisallow: /private\nDisallow: /*.aspx$\n\nUser-agent: otherbot\nAllow: /'),
      '*': text('should not be read'),
    })
    for (const path of ['/private', '/%70rivate', '//private/x', '/PRIVATE', '/a/b.aspx']) {
      const fetcher = f.fetcher.forSource(SOURCE)
      await expect(fetcher.get(`https://pound.example.com${path}`)).rejects.toMatchObject({ reason: 'robots' })
    }
    expect(f.seen.map((s) => s.path)).toEqual(['/robots.txt'])
  })

  it('follows a group naming Jill and Seek over the generic one', async () => {
    const f = await fake({
      '/robots.txt': robots('User-agent: *\nAllow: /\n\nUser-agent: JillAndSeek\nDisallow: /'),
    })
    await expect(f.fetcher.forSource(SOURCE).get(SOURCE)).rejects.toBeInstanceOf(SourceBlocked)
  })

  it('follows a versioned group naming Jill and Seek, and rules with spaces or non-ASCII', async () => {
    const f = await fake({
      '/robots.txt': robots('User-agent: JillAndSeek/1.0\nDisallow: /café\nDisallow: /a b\n\nUser-agent: *\nAllow: /'),
      '*': text('ok'),
    })
    for (const path of ['/caf%C3%A9', '/a%20b']) {
      await expect(f.fetcher.forSource(SOURCE).get(`https://pound.example.com${path}`)).rejects.toMatchObject({
        reason: 'robots',
      })
    }
    expect((await f.fetcher.forSource(SOURCE).get('https://pound.example.com/other')).body).toBe('ok')
  })

  it('stops reading a body past the size cap, and refuses an empty answer', async () => {
    const f = await fake({
      '/robots.txt': robots(''),
      '/big': (_req, res) => {
        res.writeHead(200, { 'content-type': 'text/html' })
        for (let i = 0; i < 200; i++) res.write('x'.repeat(65_536))
        res.end()
      },
      '/empty': text('', 202),
    })
    const fetcher = f.fetcher.forSource(SOURCE)
    await expect(fetcher.get('https://pound.example.com/big')).rejects.toMatchObject({ code: 'too-large' })
    await expect(fetcher.get('https://pound.example.com/empty')).rejects.toMatchObject({ code: 'empty-page' })
  })

  it('reads robots.txt once a day, and treats a missing one as no rules', async () => {
    const f = await fake({ '/strays': text('ok') })
    const fetcher = f.fetcher.forSource(SOURCE)
    await fetcher.get(SOURCE)
    await fetcher.get(SOURCE)
    f.advance(25 * 60 * 60 * 1000)
    await fetcher.get(SOURCE)
    expect(f.seen.filter((s) => s.path === '/robots.txt').length).toBe(2)
  })

  it.each([
    ['a 429', text('slow down', 429), 'http-429'],
    ['a 403', text('no', 403), 'http-403'],
    ['a challenge page that answers 200', text('<title>Just a moment...</title>'), 'challenge'],
    ['a challenge header', text('ok', 200, { 'cf-mitigated': 'challenge' }), 'challenge'],
    ['a WAF challenge on a 202', text('', 202, { 'x-amzn-waf-action': 'challenge' }), 'challenge'],
    ['a Turnstile page', text('<div class="cf-turnstile"></div>'), 'challenge'],
  ])('stops at %s, marks the source blocked and makes no further request', async (_name, handler, reason) => {
    const f = await fake({ '/robots.txt': robots(''), '/strays': handler, '/other': text('ok') })
    const fetcher = f.fetcher.forSource(SOURCE)
    await expect(fetcher.get(SOURCE)).rejects.toMatchObject({ reason })
    await expect(fetcher.get('https://pound.example.com/other')).rejects.toMatchObject({ reason })
    expect(f.seen.map((s) => s.path)).toEqual(['/robots.txt', '/strays'])
  })

  it('refuses http, another host, and a redirect to either', async () => {
    const f = await fake({
      '/robots.txt': robots(''),
      '/to-http': text('', 302, { location: 'http://pound.example.com/strays' }),
      '/to-other': text('', 301, { location: 'https://elsewhere.example.com/strays' }),
      '/to-same': text('', 302, { location: '/strays' }),
      '/strays': text('ok'),
    })
    const fetcher = f.fetcher.forSource(SOURCE)
    await expect(fetcher.get('http://pound.example.com/strays')).rejects.toMatchObject({ code: 'not-https' })
    await expect(fetcher.get('https://elsewhere.example.com/strays')).rejects.toMatchObject({ code: 'other-host' })
    await expect(fetcher.get('https://pound.example.com/to-http')).rejects.toMatchObject({ code: 'redirect-refused' })
    await expect(fetcher.get('https://pound.example.com/to-other')).rejects.toMatchObject({ code: 'redirect-refused' })
    expect((await fetcher.get('https://pound.example.com/to-same')).url).toBe(SOURCE)
    expect(() => f.fetcher.forSource('http://pound.example.com/')).toThrow(FetchFailed)
  })

  it('retries a network error with backoff, but never an HTTP error', async () => {
    const f = await fake({ '/robots.txt': robots(''), '/strays': text('ok'), '/broken': text('oops', 500) })
    const fetcher = f.fetcher.forSource(SOURCE)
    f.failNextRequests(2)
    expect((await fetcher.get(SOURCE)).body).toBe('ok')
    expect(f.waits).toContain(2000)
    expect(f.waits).toContain(4000)
    await expect(fetcher.get('https://pound.example.com/broken')).rejects.toMatchObject({ code: 'http-500' })
    expect(f.seen.filter((s) => s.path === '/broken').length).toBe(1)
    f.failNextRequests(5)
    await expect(fetcher.get(SOURCE)).rejects.toMatchObject({ code: 'network' })
  })

  it('spaces requests to one host', async () => {
    const f = await fake({ '/robots.txt': robots(''), '/strays': text('ok') })
    await f.fetcher.forSource(SOURCE).get(SOURCE)
    expect(f.waits).toEqual([5000])
  })
})
