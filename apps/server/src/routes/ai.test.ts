import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { type AiClient, createAiClient } from '../ai/client.ts'
import { createFakeAiClient, createFakeTransport } from '../ai/fake.ts'
import { photoTraits } from '../ai/photoTraits.ts'
import {
  GPS_MARKER,
  holds,
  jpegClean,
  jpegWithMetadata,
  pngClean,
  pngWithMetadata,
  TEXT_MARKER,
  TRAILER_MARKER,
  webpClean,
  webpWithMetadata,
} from '../ai/testPhotos.ts'
import { createApp } from '../app.ts'
import { openStore } from '../db/store.ts'
import { MAX_BODY_BYTES, MAX_PHOTO_BYTES } from '../http/guards.ts'
import { DEFAULT_PORT } from '../settings.ts'

// Reading a missing dog's photo into the form's traits (#61), on the fake client: no test here
// reaches the Claude API. The photos are made up byte by byte, and so is every answer.

const T0 = '2026-03-10T12:00:00.000Z'
const OWN = `127.0.0.1:${DEFAULT_PORT}`
const cleanups: (() => void)[] = []
afterEach(() => {
  for (const c of cleanups.splice(0).reverse()) c()
})

function setup(ai: AiClient | ((repo: ReturnType<typeof openStore>['repo']) => AiClient)) {
  const home = mkdtempSync(join(tmpdir(), 'jill-ai-route-'))
  const store = openStore({
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
    ai: typeof ai === 'function' ? ai(store.repo) : ai,
    now: () => new Date(T0),
    version: '0.1.0',
    schemaVersion: store.schemaVersion,
    dataHomeWritable: () => true,
    ports: [DEFAULT_PORT],
    log: (l) => lines.push(l),
  })
  const request = (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    if (!headers.has('host')) headers.set('host', OWN)
    return app.request(`http://${OWN}${path}`, { ...init, headers })
  }
  return { request, store, lines }
}

const READ = '/api/ai/photo-traits'
const photo = (body: Uint8Array, type = 'image/jpeg') => ({
  method: 'POST',
  headers: { 'content-type': type, 'x-jill-and-seek': '1' },
  body,
})

/** A made-up answer in the shape asked of the model. */
const answer = (over: Record<string, unknown> = {}) => ({
  dog_visible: true,
  breeds: ['Zorbulon Hound', ' zorbulon hound ', 'mix'],
  colors: ['Teal', 'white'],
  size: 'medium',
  sex: 'unknown',
  age: 'adult',
  marks: '  A white chest patch.  ',
  ...over,
})

describe('GET /api/ai', () => {
  it('says whether AI is on and how much of the caps is used, and nothing about the key but whether one is saved', async () => {
    const off = setup(createFakeAiClient({ status: { enabled: false, keySaved: false } }))
    expect(await (await off.request('/api/ai')).json()).toEqual({
      enabled: false,
      keySaved: false,
      today: 0,
      dailyCap: 25,
      month: 0,
      monthlyCap: 300,
    })
    const on = setup(createFakeAiClient({ status: { today: 3, month: 40 } }))
    expect(await (await on.request('/api/ai')).json()).toMatchObject({ enabled: true, keySaved: true, today: 3, month: 40 })
  })
})

describe('POST /api/ai/photo-traits', () => {
  it('fills the traits from a made-up answer, and leaves what the model could not tell unknown', async () => {
    const ai = createFakeAiClient({ answer: answer() })
    const { request } = setup(ai)
    const res = await request(READ, photo(jpegWithMetadata()))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      dogVisible: true,
      // Lower case, trimmed, no repeats.
      traits: { breeds: ['zorbulon hound', 'mix'], colors: ['teal', 'white'], size: 'medium', sex: 'unknown', age: 'adult' },
      marks: 'A white chest patch.',
    })

    const unknown = setup(createFakeAiClient({ answer: answer({ breeds: [], colors: [], size: 'unknown', age: 'unknown', marks: null }) }))
    expect(await (await unknown.request(READ, photo(pngWithMetadata(), 'image/png'))).json()).toEqual({
      dogVisible: true,
      traits: { breeds: [], colors: [], size: 'unknown', sex: 'unknown', age: 'unknown' },
      marks: null,
    })
  })

  it('fills nothing when no dog can be made out, whatever else the answer says', async () => {
    const { request } = setup(createFakeAiClient({ answer: answer({ dog_visible: false }) }))
    expect(await (await request(READ, photo(jpegWithMetadata()))).json()).toEqual({
      dogVisible: false,
      traits: { breeds: [], colors: [], size: 'unknown', sex: 'unknown', age: 'unknown' },
      marks: null,
    })
  })

  it('never gives town, time, a name or a match: the answer holds what the dog looks like and nothing else', async () => {
    const { request } = setup(createFakeAiClient({ answer: answer() }))
    const body = (await (await request(READ, photo(jpegWithMetadata()))).json()) as Record<string, unknown>
    expect(Object.keys(body).sort()).toEqual(['dogVisible', 'marks', 'traits'])
    expect(Object.keys(body.traits as object).sort()).toEqual(['age', 'breeds', 'colors', 'sex', 'size'])
  })

  it.each([
    ['image/jpeg', jpegWithMetadata, jpegClean],
    ['image/png', pngWithMetadata, pngClean],
    ['image/webp', webpWithMetadata, webpClean],
  ] as const)('passes the client a %s with no metadata, and nothing but the photo', async (type, withMetadata, clean) => {
    const ai = createFakeAiClient({ answer: answer() })
    const { request } = setup(ai)
    expect((await request(READ, photo(withMetadata(), type))).status).toBe(200)
    expect(ai.reads).toHaveLength(1)
    const [read] = ai.reads
    expect(read?.feature).toBe('photo-traits')
    // The route's whole input to the client: the image, and only the image.
    expect(Object.keys(read ?? {}).sort()).toEqual(['feature', 'image'])
    expect(Object.keys(read?.image ?? {}).sort()).toEqual(['bytes', 'mediaType'])
    expect(read?.image.mediaType).toBe(type)
    expect(read?.image.bytes).toEqual(clean())
    for (const marker of [GPS_MARKER, TEXT_MARKER, TRAILER_MARKER, 'Exif']) {
      expect(holds(read?.image.bytes as Uint8Array, marker)).toBe(false)
    }
  })

  it('sends the API the stripped photo and the fixed instruction only, through the capped client', async () => {
    const fake = createFakeTransport({ text: JSON.stringify(answer()) })
    const { request, store, lines } = setup((repo) =>
      createAiClient({
        settings: { enabled: true, model: 'claude-test-1', dailyCap: 25, monthlyCap: 300, keyFile: 'unused' },
        repo,
        readKey: () => ({ ok: true, key: ['sk', 'ant', 'test', 'k'.repeat(24)].join('-') }),
        keySaved: () => true,
        transport: fake.transport,
        now: () => new Date(T0),
        log: (l) => lines.push(l),
        clock: () => 0,
      }),
    )
    // Query values and extra headers go nowhere: the route reads the body and nothing else.
    const res = await request(`${READ}?note=QUERY-MARKER`, {
      ...photo(jpegWithMetadata()),
      headers: { 'content-type': 'image/jpeg', 'x-jill-and-seek': '1', 'x-note': 'HEADER-MARKER' },
    })
    expect(res.status).toBe(200)
    expect(fake.sent).toHaveLength(1)
    const [sent] = fake.sent
    expect(Object.keys(sent ?? {}).sort()).toEqual(['image', 'instruction', 'maxTokens', 'model', 'schema'])
    expect(sent?.instruction).toBe(photoTraits.instruction)
    expect(sent?.image).toEqual({ mediaType: 'image/jpeg', bytes: jpegClean() })
    expect(JSON.stringify(sent)).not.toContain('MARKER')
    // The instruction is fixed text about the dog's looks: it asks for no place, time or match.
    expect(sent?.instruction).not.toMatch(/listing|match|town|address|owner's name|phone/i)
    expect(store.repo.aiUsage(T0)).toEqual({ today: 1, month: 1 })
    // The log holds counts only: no part of the answer, the photo or the request.
    const log = lines.join('\n')
    for (const word of ['zorbulon', 'teal', 'chest', 'MARKER', 'sk-ant']) expect(log.toLowerCase()).not.toContain(word.toLowerCase())
    expect(lines.some((l) => l.startsWith('ai: call id=1 feature=photo-traits model=claude-test-1 outcome=ok'))).toBe(true)
  })

  it.each([
    ['ai_off', 409, 'ai-off'],
    ['no_key', 409, 'ai-no-key'],
    ['daily_cap', 429, 'ai-daily-cap'],
    ['monthly_cap', 429, 'ai-monthly-cap'],
    ['refused', 422, 'ai-refused'],
    ['cut_off', 502, 'ai-invalid-answer'],
    ['invalid_answer', 502, 'ai-invalid-answer'],
    ['api_error', 502, 'ai-error'],
  ] as const)('answers %s with a plain code and no detail', async (fail, status, code) => {
    const { request } = setup(createFakeAiClient({ fail }))
    const res = await request(READ, photo(jpegWithMetadata()))
    expect(res.status).toBe(status)
    expect(await res.json()).toEqual({ error: { code } })
  })

  it('answers an answer that does not fit the schema as invalid, and fills nothing', async () => {
    for (const bad of [answer({ size: 'enormous' }), answer({ breeds: 'hound' }), { dog_visible: true }, 'a hound', null]) {
      const { request } = setup(createFakeAiClient({ answer: bad }))
      const res = await request(READ, photo(jpegWithMetadata()))
      expect(res.status).toBe(502)
      expect(await res.json()).toEqual({ error: { code: 'ai-invalid-answer' } })
    }
  })

  it('with AI off, does nothing with the photo: no read is asked for', async () => {
    const ai = createFakeAiClient({ status: { enabled: false }, answer: answer() })
    const { request } = setup(ai)
    const res = await request(READ, photo(jpegWithMetadata()))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: { code: 'ai-off' } })
    expect(ai.reads).toEqual([])
  })

  it('refuses a body that is not a photo it can follow, and asks for no read', async () => {
    const ai = createFakeAiClient({ answer: answer() })
    const { request } = setup(ai)
    const notImages = [
      new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'),
      new TextEncoder().encode('{"label":"Zorbulon"}'),
      // A JPEG's first bytes and nothing behind them.
      Uint8Array.of(0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4),
      new Uint8Array(0),
    ]
    for (const body of notImages) {
      const res = await request(READ, photo(body))
      expect(res.status).toBe(415)
      expect(await res.json()).toEqual({ error: { code: 'not-an-image' } })
    }
    expect(ai.reads).toEqual([])
  })
})

describe('the guards on the photo read', () => {
  it('needs the app’s header, an image type and a body of at most 5 MB', async () => {
    const ai = createFakeAiClient({ answer: answer() })
    const { request } = setup(ai)
    const noHeader = await request(READ, { method: 'POST', headers: { 'content-type': 'image/jpeg' }, body: jpegWithMetadata() })
    expect(noHeader.status).toBe(403)
    expect(await noHeader.json()).toEqual({ error: { code: 'missing-header' } })

    for (const type of ['application/json', 'text/plain', 'image/svg+xml', 'image/gif', 'multipart/form-data']) {
      const res = await request(READ, photo(jpegWithMetadata(), type))
      expect(res.status).toBe(415)
      expect(await res.json()).toEqual({ error: { code: 'image-only' } })
    }

    const big = new Uint8Array(MAX_PHOTO_BYTES + 1)
    big.set(jpegWithMetadata())
    const tooLarge = await request(READ, photo(big))
    expect(tooLarge.status).toBe(413)
    expect(await tooLarge.json()).toEqual({ error: { code: 'too-large' } })

    // A cross-site request is refused before anything else.
    const crossSite = await request(READ, {
      ...photo(jpegWithMetadata()),
      headers: { 'content-type': 'image/jpeg', 'x-jill-and-seek': '1', 'sec-fetch-site': 'cross-site' },
    })
    expect(crossSite.status).toBe(403)
    const foreign = await request(READ, {
      ...photo(jpegWithMetadata()),
      headers: { 'content-type': 'image/jpeg', 'x-jill-and-seek': '1', origin: 'https://attacker.example' },
    })
    expect(foreign.status).toBe(403)
    expect(ai.reads).toEqual([])
  })

  it('takes only POST, and only at its exact path', async () => {
    const ai = createFakeAiClient({ answer: answer() })
    const { request } = setup(ai)
    expect((await request(READ)).status).toBe(404)
    for (const method of ['PUT', 'PATCH', 'DELETE']) {
      const res = await request(READ, { ...photo(jpegWithMetadata()), method })
      expect([404, 415]).toContain(res.status)
    }
    for (const path of [`${READ}/`, `${READ}/x`, '/api/ai/photo-traits2', '/api/ai', '/api/ai/other']) {
      const res = await request(path, photo(jpegWithMetadata()))
      expect(res.status).not.toBe(200)
    }
    expect(ai.reads).toEqual([])
  })

  it('no other route takes an image: each one answers an image body with json-only', async () => {
    const { request } = setup(createFakeAiClient({ answer: answer() }))
    const others = ['/api/dogs', '/api/dogs/1', '/api/dogs/1/matches', '/api/sources/x/clear-block', '/api/ai', '/api/health']
    for (const path of others) {
      for (const method of ['POST', 'PATCH', 'DELETE']) {
        const res = await request(path, { ...photo(jpegWithMetadata()), method })
        expect(res.status).toBe(415)
        expect(await res.json()).toEqual({ error: { code: 'json-only' } })
      }
    }
    // And a JSON body over 1 MB is still refused everywhere else.
    const res = await request('/api/dogs', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-jill-and-seek': '1' },
      body: JSON.stringify({ notes: 'x'.repeat(MAX_BODY_BYTES) }),
    })
    expect(res.status).toBe(413)
  })
})
