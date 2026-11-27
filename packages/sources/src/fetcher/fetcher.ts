import type { BlockedReason } from '@jillandseek/core'
import { allowAll, isAllowed, parseRobots, type Robots } from './robots.ts'

// The one fetcher (ADR-0002 point 3). Every request Jill and Seek makes to a source goes through
// it: an honest User-Agent, https only, the source's own host only, robots.txt read and cached for
// a day, requests to one host spaced out, a timeout, and retries with backoff on network errors
// only. A 403, a 429 or a challenge page stops the read and marks the source blocked; nothing here
// ever retries one, sends a cookie or pretends to be a browser.

export const REPO_URL = 'https://github.com/benburw3ll/jillandseek'

export const userAgent = (version: string) => `JillAndSeek/${version} (+${REPO_URL})`

/** One page as the fetcher read it. */
export type FetchedPage = { url: string; status: number; contentType: string; body: string }

/** What a collector is given: reads pages of its own source, and nothing else. */
export type Fetcher = { get(url: string): Promise<FetchedPage> }

/** The source said no: 403, 429, a challenge page, or robots. The sweep marks it blocked. */
export class SourceBlocked extends Error {
  readonly reason: BlockedReason
  constructor(reason: BlockedReason) {
    super(`source blocked: ${reason}`)
    this.reason = reason
  }
}

/** A read that failed without a "no": its code goes into the sweep's errors. */
export class FetchFailed extends Error {
  readonly code: string
  constructor(code: string) {
    super(`fetch failed: ${code}`)
    this.code = code
  }
}

export type FetcherOptions = {
  /** The app's version, for the User-Agent. */
  version: string
  /** The clock. Every "now" comes from here, so tests can fix it. */
  now: () => Date
  /** Waits; tests pass a fake that records the waits. */
  sleep?: (ms: number) => Promise<void>
  /** The HTTP call itself; tests pass one that reaches a local fake server. */
  transport?: (url: string, init: RequestInit) => Promise<Response>
  /** The least time between two requests to one host. */
  hostSpacingMs?: number
  timeoutMs?: number
  /** Retries after a network error (never after an HTTP answer). */
  retries?: number
  backoffMs?: number
  maxBytes?: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const MAX_REDIRECTS = 3

/** Words a bot-check or challenge page carries, even when it answers 200. */
const CHALLENGE_MARKERS = [
  /<title>\s*just a moment/i,
  /cf-chl|challenge-platform|cf_chl_opt/i,
  /attention required!? \| cloudflare/i,
  /_incapsula_resource|incapsula incident/i,
  /px-captcha|perimeterx/i,
  /g-recaptcha|h-captcha|hcaptcha\.com|recaptcha\/api/i,
  /ddos protection by|checking your browser before accessing/i,
  /<title>[^<]*(captcha|access denied|are you a robot|bot check)[^<]*<\/title>/i,
  /challenges\.cloudflare\.com|cf-turnstile/i,
  /captcha-delivery\.com/i,
  /sucuri_cloudproxy|sucuri website firewall/i,
  /\/akam\/\d+\//i,
]

/** Headers a bot-check answer carries. */
const CHALLENGE_HEADERS = ['cf-mitigated', 'x-datadome', 'x-amzn-waf-action']

export function isChallenge(headers: Headers, body: string): boolean {
  if (CHALLENGE_HEADERS.some((h) => headers.get(h) !== null)) return true
  return CHALLENGE_MARKERS.some((re) => re.test(body))
}

export type SharedFetcher = {
  /** A fetcher that reads only the host of `sourceUrl`. */
  forSource(sourceUrl: string): Fetcher
}

export function createFetcher(options: FetcherOptions): SharedFetcher {
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)))
  const transport = options.transport ?? ((url: string, init: RequestInit) => fetch(url, init))
  const spacing = options.hostSpacingMs ?? 5_000
  const timeoutMs = options.timeoutMs ?? 20_000
  const retries = options.retries ?? 2
  const backoffMs = options.backoffMs ?? 2_000
  const maxBytes = options.maxBytes ?? 5_000_000
  const headers = { 'user-agent': userAgent(options.version), accept: 'text/html,application/json;q=0.9,*/*;q=0.5' }
  const lastRequestAt = new Map<string, number>()
  const robotsCache = new Map<string, { robots: Robots; at: number }>()

  /** One HTTP request, spaced from the last one to its host, with retries on network errors only. */
  async function request(url: URL): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      const last = lastRequestAt.get(url.host)
      if (last !== undefined) {
        const wait = last + spacing - options.now().getTime()
        if (wait > 0) await sleep(wait)
      }
      lastRequestAt.set(url.host, options.now().getTime())
      try {
        return await transport(url.href, {
          headers,
          redirect: 'manual',
          credentials: 'omit',
          signal: AbortSignal.timeout(timeoutMs),
        })
      } catch (error) {
        if (attempt >= retries) {
          throw new FetchFailed(error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'network')
        }
        await sleep(backoffMs * 2 ** attempt)
      }
    }
  }

  /** Checks one URL before it is asked for: https, the source's host, no user or password. */
  function checkUrl(url: URL, host: string): void {
    if (url.protocol !== 'https:') throw new FetchFailed('not-https')
    if (url.username !== '' || url.password !== '') throw new FetchFailed('url-credentials')
    if (url.host !== host) throw new FetchFailed('other-host')
  }

  /** Throws SourceBlocked for a "no" answer. */
  async function refuseNo(res: Response): Promise<string> {
    if (res.status === 403 || res.status === 401) {
      await res.body?.cancel()
      throw new SourceBlocked('http-403')
    }
    if (res.status === 429) {
      await res.body?.cancel()
      throw new SourceBlocked('http-429')
    }
    const length = Number(res.headers.get('content-length') ?? '0')
    if (length > maxBytes) {
      await res.body?.cancel()
      throw new FetchFailed('too-large')
    }
    const body = await readCapped(res)
    if (isChallenge(res.headers, body)) throw new SourceBlocked('challenge')
    return body
  }

  /** Reads a body, stopping as soon as it passes the size cap. */
  async function readCapped(res: Response): Promise<string> {
    if (res.body === null) return ''
    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        total += value.byteLength
        if (total > maxBytes) {
          await reader.cancel()
          throw new FetchFailed('too-large')
        }
        chunks.push(value)
      }
    } catch (error) {
      if (error instanceof FetchFailed) throw error
      throw new FetchFailed(error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'network')
    }
    return new TextDecoder().decode(Buffer.concat(chunks))
  }

  /** GETs `start`, following only same-host https redirects. */
  async function getFollowing(start: URL, host: string, beforeEach: (url: URL) => Promise<void>) {
    let url = start
    for (let hop = 0; ; hop++) {
      checkUrl(url, host)
      await beforeEach(url)
      const res = await request(url)
      if (res.status >= 300 && res.status < 400 && res.headers.has('location')) {
        await res.body?.cancel()
        if (hop >= MAX_REDIRECTS) throw new FetchFailed('too-many-redirects')
        let next: URL
        try {
          next = new URL(res.headers.get('location') ?? '', url)
        } catch {
          throw new FetchFailed('redirect-refused')
        }
        if (next.protocol !== 'https:' || next.host !== host) throw new FetchFailed('redirect-refused')
        url = next
        continue
      }
      return { url, res }
    }
  }

  /** The robots rules for a host, read at most once a day. */
  async function robotsFor(host: string): Promise<Robots> {
    const cached = robotsCache.get(host)
    const now = options.now().getTime()
    if (cached !== undefined && now - cached.at < DAY_MS) return cached.robots
    const { res } = await getFollowing(new URL(`https://${host}/robots.txt`), host, async () => {})
    let robots: Robots
    if (res.status >= 200 && res.status < 300) {
      robots = parseRobots(await refuseNo(res))
    } else if (res.status === 401 || res.status === 403 || res.status === 429) {
      await refuseNo(res)
      throw new FetchFailed('robots-unreachable')
    } else if (res.status >= 400 && res.status < 500) {
      // RFC 9309: an unavailable robots file (404 and the like) means no rules.
      await res.body?.cancel()
      robots = allowAll
    } else {
      // A server error or an unfollowed redirect: assume nothing is allowed, and try again later.
      await res.body?.cancel()
      throw new FetchFailed('robots-unreachable')
    }
    robotsCache.set(host, { robots, at: now })
    return robots
  }

  return {
    forSource(sourceUrl: string): Fetcher {
      const source = new URL(sourceUrl)
      if (source.protocol !== 'https:') throw new FetchFailed('not-https')
      const host = source.host
      let blocked: SourceBlocked | null = null
      return {
        async get(raw: string): Promise<FetchedPage> {
          if (blocked !== null) throw blocked
          try {
            let url: URL
            try {
              url = new URL(raw)
            } catch {
              throw new FetchFailed('bad-url')
            }
            const checkRobots = async (u: URL) => {
              if (!isAllowed(await robotsFor(host), u.pathname + u.search)) throw new SourceBlocked('robots')
            }
            const { url: final, res } = await getFollowing(url, host, checkRobots)
            const body = await refuseNo(res)
            if (res.status < 200 || res.status >= 300) throw new FetchFailed(`http-${res.status}`)
            // An empty answer (a 202 or 204, say) is never a full read of anything.
            if (body.trim() === '') throw new FetchFailed('empty-page')
            return { url: final.href, status: res.status, contentType: res.headers.get('content-type') ?? '', body }
          } catch (error) {
            if (error instanceof SourceBlocked) blocked = error
            throw error
          }
        },
      }
    },
  }
}
