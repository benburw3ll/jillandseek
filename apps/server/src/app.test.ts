import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp } from './app.ts'
import { isWritable } from './db/home.ts'
import { openStore, type Store } from './db/store.ts'
import { MAX_BODY_BYTES } from './http/guards.ts'
import type { RouteDeps } from './routes/deps.ts'
import { DEFAULT_PORT, HOSTNAME, loadSettings, REPO_ROOT } from './settings.ts'

// The attacker in these tests is any website open in the owner's browser. All data is made up.

const T0 = '2026-01-10T12:00:00.000Z'
const OWN = `127.0.0.1:${DEFAULT_PORT}`
const cleanups: (() => void)[] = []
afterEach(() => {
  for (const c of cleanups.splice(0).reverse()) c()
})

function setup(options: { siteDir?: string; deps?: Partial<RouteDeps> } = {}) {
  const home = mkdtempSync(join(tmpdir(), 'jill-app-'))
  const store: Store = openStore({
    home,
    retention: { keepGoneDays: 90, keepFoundDays: 30 },
    now: () => new Date(T0),
    log: () => {},
  })
  cleanups.push(
    () => rmSync(home, { recursive: true, force: true }),
    () => store.close(),
  )
  const lines: string[] = []
  const app = createApp({
    repo: store.repo,
    now: () => new Date(T0),
    version: '0.1.0',
    schemaVersion: store.schemaVersion,
    dataHomeWritable: () => isWritable(store.home),
    ports: [DEFAULT_PORT],
    log: (l) => lines.push(l),
    ...options.deps,
    ...(options.siteDir !== undefined && { siteDir: options.siteDir }),
  })
  const request = (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    if (!headers.has('host')) headers.set('host', OWN)
    return app.request(`http://${OWN}${path}`, { ...init, headers })
  }
  return { app, store, lines, request }
}

const json = { 'content-type': 'application/json', 'x-jill-and-seek': '1' }
const dog = { label: 'Zorbulon', lastSeenAt: T0, lastSeenTown: 'Quuxville' }

describe('GET /api/health', () => {
  it('answers with the app and schema versions, the data home and the counts', async () => {
    const { request, store } = setup()
    const res = await request('/api/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      app: 'jillandseek',
      version: '0.1.0',
      apiVersion: 1,
      schemaVersion: store.schemaVersion,
      dataHome: { writable: true },
      counts: { sources: 0, listings: 0, dogs: 0, matches: 0, sweeps: 0 },
    })
  })
})

describe('the guards', () => {
  it('refuses a foreign Host with 403 (DNS rebinding), and a missing one', async () => {
    const { request } = setup()
    for (const host of [`rebind.example:${DEFAULT_PORT}`, '127.0.0.1:9999', '127.0.0.1', `0.0.0.0:${DEFAULT_PORT}`]) {
      const res = await request('/api/health', { headers: { host } })
      expect(res.status).toBe(403)
      expect(await res.json()).toEqual({ error: { code: 'foreign-host' } })
    }
    expect((await request('/api/health', { headers: { host: `localhost:${DEFAULT_PORT}` } })).status).toBe(200)
  })

  it('refuses a foreign Origin with 403, on reads and writes alike', async () => {
    const { request } = setup()
    for (const origin of ['https://attacker.example', 'null', `http://127.0.0.1:9999`, `https://${OWN}`]) {
      expect((await request('/api/listings', { headers: { origin } })).status).toBe(403)
      const post = await request('/api/dogs', {
        method: 'POST',
        headers: { ...json, origin },
        body: JSON.stringify(dog),
      })
      expect(post.status).toBe(403)
    }
    expect((await request('/api/listings', { headers: { origin: `http://${OWN}` } })).status).toBe(200)
  })

  it('refuses a cross-site fetch of the API even without an Origin', async () => {
    const { request } = setup()
    for (const site of ['cross-site', 'same-site']) {
      expect((await request('/api/listings', { headers: { 'sec-fetch-site': site } })).status).toBe(403)
    }
    expect((await request('/api/listings', { headers: { 'sec-fetch-site': 'same-origin' } })).status).toBe(200)
  })

  it('refuses a POST without the custom header, and a form post', async () => {
    const { request, store } = setup()
    const bare = await request('/api/dogs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(dog),
    })
    expect(bare.status).toBe(403)
    expect(await bare.json()).toEqual({ error: { code: 'missing-header' } })
    const form = await request('/api/dogs', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'label=Zorbulon',
    })
    expect(form.status).toBe(403)
    const text = await request('/api/dogs', {
      method: 'POST',
      headers: { 'content-type': 'text/plain', 'x-jill-and-seek': '1' },
      body: JSON.stringify(dog),
    })
    expect(text.status).toBe(415)
    expect(store.repo.counts().dogs).toBe(0)
  })

  it('refuses a body over 1 MB, with or without a length', async () => {
    const { request, store } = setup()
    const big = JSON.stringify({ ...dog, notes: 'z'.repeat(MAX_BODY_BYTES) })
    expect((await request('/api/dogs', { method: 'POST', headers: json, body: big })).status).toBe(413)
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(big))
        controller.close()
      },
    })
    const chunked = await request('/api/dogs', {
      method: 'POST',
      headers: json,
      body: stream,
      duplex: 'half',
    } as RequestInit)
    expect(chunked.status).toBe(413)
    expect(store.repo.counts().dogs).toBe(0)
  })

  it('answers errors as JSON with a code and no stack or message', async () => {
    const failing = 'Zorbulon internal detail'
    const { request, lines } = setup({
      deps: {
        repo: {
          listSources: () => {
            throw new Error(failing)
          },
        } as unknown as RouteDeps['repo'],
      },
    })
    const res = await request('/api/sources')
    expect(res.status).toBe(500)
    const body = await res.text()
    expect(JSON.parse(body)).toEqual({ error: { code: 'internal' } })
    expect(body).not.toContain(failing)
    expect(lines.join('\n')).not.toContain(failing)
  })
})

describe('the routes', () => {
  it('creates a dog and reads it back, and answers 404 for one that is not there', async () => {
    const { request } = setup()
    const created = await request('/api/dogs', { method: 'POST', headers: json, body: JSON.stringify(dog) })
    expect(created.status).toBe(201)
    const { id } = (await created.json()) as { id: number }
    expect(await (await request(`/api/dogs/${id}`)).json()).toMatchObject({ id, label: 'Zorbulon', status: 'missing' })
    expect((await (await request('/api/dogs')).json()) as { items: unknown[] }).toMatchObject({ items: [{ id }] })
    expect((await request('/api/dogs/9999')).status).toBe(404)
    expect((await request('/api/dogs/not-an-id')).status).toBe(404)
  })

  it('refuses a dog that does not fit the schema, naming paths and codes only', async () => {
    const { request } = setup()
    const res = await request('/api/dogs', {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ ...dog, lastSeenAt: 'Zorbulon-day' }),
    })
    expect(res.status).toBe(400)
    const body = await res.text()
    expect(JSON.parse(body)).toEqual({
      error: { code: 'invalid', issues: [{ path: 'lastSeenAt', code: 'invalid_format' }] },
    })
    expect(body).not.toContain('Zorbulon-day')
    expect((await request('/api/dogs', { method: 'POST', headers: json, body: '{not json' })).status).toBe(400)
  })

  it('pages listings and checks their filters', async () => {
    const { request, store } = setup()
    store.repo.syncSources([
      {
        id: 'zorbulon-shelter',
        name: 'Zorbulon County Shelter',
        url: 'https://shelter.example.com/',
        region: 'Zorbulon County',
        listingKinds: ['found'],
        access: 'link',
      },
    ])
    for (const key of ['Z-1', 'Z-2', 'Z-3']) {
      store.repo.upsertListing(
        { sourceId: 'zorbulon-shelter', sourceKey: key, url: `https://shelter.example.com/${key}`, kind: 'found' },
        T0,
      )
    }
    const page = (await (await request('/api/listings?limit=2&kind=found')).json()) as {
      items: { sourceKey: string }[]
      nextCursor: string
    }
    expect(page.items.map((l) => l.sourceKey)).toEqual(['Z-3', 'Z-2'])
    const next = (await (await request(`/api/listings?limit=2&cursor=${page.nextCursor}`)).json()) as {
      items: unknown[]
      nextCursor: null
    }
    expect(next).toMatchObject({ items: [{ sourceKey: 'Z-1' }], nextCursor: null })
    expect((await request('/api/listings?kind=zorbulon')).status).toBe(400)
    expect((await request('/api/listings?cursor=zz')).status).toBe(400)
    expect((await request('/api/listings?includeGone=maybe')).status).toBe(400)
    expect(await (await request('/api/sources')).json()).toMatchObject({ items: [{ id: 'zorbulon-shelter' }] })
  })
})

describe('the request log', () => {
  it('holds the method, route pattern, status and time, and no body, query value or header', async () => {
    const { request, lines } = setup()
    const canaries = ['Zorbulon-body-canary', 'Quux-query-canary', 'Blarg-header-canary']
    await request('/api/dogs', {
      method: 'POST',
      headers: { ...json, 'x-zorbulon': canaries[2] ?? '' },
      body: JSON.stringify({ ...dog, notes: canaries[0] }),
    })
    await request(`/api/listings?town=${canaries[1]}`)
    await request('/api/dogs/1')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toMatch(/^request: POST \/api\/dogs 201 \d+ms$/)
    expect(lines[1]).toMatch(/^request: GET \/api\/listings 200 \d+ms$/)
    expect(lines[2]).toMatch(/^request: GET \/api\/dogs\/:id 200 \d+ms$/)
    for (const canary of canaries) expect(lines.join('\n')).not.toContain(canary)
  })
})

describe('the built site', () => {
  function site() {
    const root = mkdtempSync(join(tmpdir(), 'jill-site-'))
    cleanups.push(() => rmSync(root, { recursive: true, force: true }))
    const dist = join(root, 'dist')
    mkdirSync(join(dist, 'assets'), { recursive: true })
    writeFileSync(join(dist, 'index.html'), '<!doctype html><title>Jill and Seek</title>')
    writeFileSync(join(dist, 'assets', 'app.js'), 'console.log(1)')
    writeFileSync(join(root, 'outside.txt'), 'Zorbulon outside the site')
    return dist
  }

  it('serves the site, with index.html for its own routes', async () => {
    const { request } = setup({ siteDir: site() })
    const home = await request('/')
    expect(home.status).toBe(200)
    expect(home.headers.get('content-type')).toContain('text/html')
    expect(home.headers.get('content-security-policy')).toContain("default-src 'self'")
    expect(await (await request('/listings')).text()).toContain('Jill and Seek')
    expect((await request('/assets/app.js')).headers.get('content-type')).toContain('javascript')
    expect((await request('/assets/missing.js')).status).toBe(404)
  })

  it('never serves a file outside its folder', async () => {
    const { request } = setup({ siteDir: site() })
    const climbs = [
      '/../outside.txt',
      '/%2e%2e/outside.txt',
      '/..%2foutside.txt',
      '/%5c..%5coutside.txt',
      '/assets/..%2f..%2foutside.txt',
    ]
    for (const path of climbs) {
      const res = await request(path)
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(await res.text()).not.toContain('Zorbulon outside')
    }
  })

  it('still refuses a foreign Host for the site itself', async () => {
    const { request } = setup({ siteDir: site() })
    expect((await request('/', { headers: { host: `rebind.example:${DEFAULT_PORT}` } })).status).toBe(403)
  })
})

describe('settings', () => {
  it('binds 127.0.0.1 on the port in .claude/launch.json', () => {
    const launch = JSON.parse(readFileSync(join(REPO_ROOT, '.claude', 'launch.json'), 'utf8')) as {
      configurations: { name: string; port: number }[]
    }
    expect(launch.configurations.find((c) => c.name === 'jillandseek-dev')?.port).toBe(DEFAULT_PORT)
    expect(HOSTNAME).toBe('127.0.0.1')
  })

  it('keeps data in data/ for start and .dev-home/ for dev, and puts the API behind Vite in dev', () => {
    expect(loadSettings({}, 'start')).toMatchObject({ home: join(REPO_ROOT, 'data'), port: 5200, sitePort: 5200 })
    expect(loadSettings({}, 'dev')).toMatchObject({ home: join(REPO_ROOT, '.dev-home'), port: 5201, sitePort: 5200 })
    expect(loadSettings({ JILL_HOME: 'zz-home', JILL_PORT: '5300' }, 'start')).toMatchObject({
      home: join(REPO_ROOT, 'zz-home'),
      port: 5300,
    })
  })
})
