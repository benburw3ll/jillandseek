import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findTown } from '@jillandseek/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp } from '../app.ts'
import { openStore } from '../db/store.ts'
import { MAX_BODY_BYTES, MAX_PHOTO_BYTES } from '../http/guards.ts'
import { DEFAULT_PORT } from '../settings.ts'

// The dogs routes and the photo upload (#17). The attacker is any website open in the owner's
// browser. Every dog and every photo here is made up; the towns are public Census names.

const T0 = '2026-01-10T12:00:00.000Z'
const OWN = `127.0.0.1:${DEFAULT_PORT}`
const cleanups: (() => void)[] = []
afterEach(() => {
  for (const c of cleanups.splice(0).reverse()) c()
})

function setup() {
  const home = mkdtempSync(join(tmpdir(), 'jill-dogs-'))
  let clock = new Date(T0)
  const store = openStore({
    home,
    retention: { keepGoneDays: 90, keepFoundDays: 30 },
    now: () => clock,
    log: () => {},
  })
  cleanups.push(
    () => rmSync(home, { recursive: true, force: true }),
    () => store.close(),
  )
  const app = createApp({
    repo: store.repo,
    now: () => clock,
    version: '0.1.0',
    schemaVersion: store.schemaVersion,
    dataHomeWritable: () => true,
    ports: [DEFAULT_PORT],
    log: () => {},
  })
  const request = (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    if (!headers.has('host')) headers.set('host', OWN)
    return app.request(`http://${OWN}${path}`, { ...init, headers })
  }
  const photosDir = join(home, 'photos')
  return { request, photosDir, store, tick: (iso: string) => (clock = new Date(iso)) }
}

const json = { 'content-type': 'application/json', 'x-jill-and-seek': '1' }
const send = (method: string, body: unknown) => ({ method, headers: json, body: JSON.stringify(body) })
const photoHeaders = (type = 'image/png') => ({ 'content-type': type, 'x-jill-and-seek': '1' })
/** A made-up PNG: the signature and a few bytes, enough for the server's check. */
const png = (size = 64) => {
  const b = new Uint8Array(size)
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return b
}
const jpeg = () => new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4])
const upload = (body: Uint8Array, type = 'image/png') => ({ method: 'POST', headers: photoHeaders(type), body })

async function newDog(request: ReturnType<typeof setup>['request']) {
  const res = await request('/api/dogs', send('POST', { label: 'Zorbulon', lastSeenAt: T0, lastSeenTown: 'Afton' }))
  expect(res.status).toBe(201)
  return (await res.json()) as { id: number; photos: string[] }
}

describe('a missing dog', () => {
  it('can be created at a town from the towns table, edited, and marked found', async () => {
    const { request, tick } = setup()
    const afton = findTown('Afton')
    const created = await newDog(request)
    expect(created).toMatchObject({ lastSeenTown: 'Afton', lat: afton?.lat, lon: afton?.lon, placePrecision: 'town' })

    tick('2026-01-11T12:00:00.000Z')
    const edited = await request(
      `/api/dogs/${created.id}`,
      send('PATCH', { marks: 'a made-up notch in the left ear', lastSeenTown: 'Ada' }),
    )
    expect(edited.status).toBe(200)
    expect(await edited.json()).toMatchObject({
      marks: 'a made-up notch in the left ear',
      lastSeenTown: 'Ada',
      lat: findTown('Ada')?.lat,
      status: 'missing',
    })

    tick('2026-01-12T12:00:00.000Z')
    const found = await request(`/api/dogs/${created.id}`, send('PATCH', { status: 'found' }))
    expect(await found.json()).toMatchObject({ status: 'found', foundAt: '2026-01-12T12:00:00.000Z' })
    const list = (await (await request('/api/dogs?status=found')).json()) as { items: { id: number }[] }
    expect(list.items.map((d) => d.id)).toEqual([created.id])
  })

  it('refuses a town not in the table, a lat of its own, and a patch to a dog that is not there', async () => {
    const { request } = setup()
    const dog = await newDog(request)
    const bad = await request('/api/dogs', send('POST', { lastSeenAt: T0, lastSeenTown: 'Quuxville' }))
    expect(bad.status).toBe(400)
    expect((await request(`/api/dogs/${dog.id}`, send('PATCH', { lat: 0 }))).status).toBe(400)
    expect((await request('/api/dogs/9999', send('PATCH', { notes: 'x' }))).status).toBe(404)
  })
})

describe('photos', () => {
  it('saves a photo in the data home under a name of its own, and reads it back only by that name', async () => {
    const { request, photosDir } = setup()
    const dog = await newDog(request)
    const res = await request(`/api/dogs/${dog.id}/photos`, upload(png()))
    expect(res.status).toBe(201)
    const { photos } = (await res.json()) as { photos: string[] }
    expect(photos).toHaveLength(1)
    expect(photos[0]).toMatch(/^[0-9a-f]{32}\.png$/)
    expect(readdirSync(photosDir)).toEqual(photos)

    const back = await request(`/api/dogs/${dog.id}/photos/${photos[0]}`)
    expect(back.status).toBe(200)
    expect(back.headers.get('content-type')).toBe('image/png')
    expect(back.headers.get('x-content-type-options')).toBe('nosniff')
    expect(new Uint8Array(await back.arrayBuffer())).toEqual(png())

    // Another dog can't read it, and a name that climbs out of photos/ is never looked up.
    const other = await newDog(request)
    expect((await request(`/api/dogs/${other.id}/photos/${photos[0]}`)).status).toBe(404)
    for (const name of ['..%2Fjillandseek.db', '..%5Cjillandseek.db', 'notes.txt']) {
      expect((await request(`/api/dogs/${dog.id}/photos/${name}`)).status).toBe(404)
    }
  })

  it('names the type from the bytes, whatever the header says, and refuses a file that is not an image', async () => {
    const { request, photosDir } = setup()
    const dog = await newDog(request)
    const res = await request(`/api/dogs/${dog.id}/photos`, upload(jpeg(), 'image/png'))
    expect(((await res.json()) as { photos: string[] }).photos[0]).toMatch(/\.jpg$/)
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>')
    const refused = await request(`/api/dogs/${dog.id}/photos`, upload(svg, 'image/png'))
    expect(refused.status).toBe(415)
    expect((await request(`/api/dogs/${dog.id}/photos`, upload(new Uint8Array(0)))).status).toBe(415)
    expect(readdirSync(photosDir)).toHaveLength(1)
  })

  it('refuses a sixth photo and a photo for a dog that is not there', async () => {
    const { request, photosDir } = setup()
    const dog = await newDog(request)
    for (let i = 0; i < 5; i++) expect((await request(`/api/dogs/${dog.id}/photos`, upload(png()))).status).toBe(201)
    const sixth = await request(`/api/dogs/${dog.id}/photos`, upload(png()))
    expect(sixth.status).toBe(409)
    expect(await sixth.json()).toEqual({ error: { code: 'too-many-photos' } })
    expect(readdirSync(photosDir)).toHaveLength(5)
    expect((await request('/api/dogs/9999/photos', upload(png()))).status).toBe(404)
  })

  it('takes up to 5 MB on the photo route and refuses one byte more', async () => {
    const { request } = setup()
    const dog = await newDog(request)
    expect((await request(`/api/dogs/${dog.id}/photos`, upload(png(MAX_PHOTO_BYTES)))).status).toBe(201)
    const over = await request(`/api/dogs/${dog.id}/photos`, upload(png(MAX_PHOTO_BYTES + 1)))
    expect(over.status).toBe(413)
  })

  it('keeps every other route JSON-only at 1 MB: an image body is refused there', async () => {
    const { request } = setup()
    const dog = await newDog(request)
    for (const path of ['/api/dogs', `/api/dogs/${dog.id}`, `/api/dogs/${dog.id}/photos/`, '/api/sources']) {
      const res = await request(path, upload(png()))
      expect(res.status).toBe(415)
      expect(await res.json()).toEqual({ error: { code: 'json-only' } })
    }
    const patch = await request(`/api/dogs/${dog.id}`, { ...upload(png()), method: 'PATCH' })
    expect(patch.status).toBe(415)
    const big = JSON.stringify({ notes: 'z'.repeat(MAX_BODY_BYTES) })
    expect((await request(`/api/dogs/${dog.id}`, { method: 'PATCH', headers: json, body: big })).status).toBe(413)
    // The photo route takes no JSON, no form and no multipart.
    for (const type of ['application/json', 'multipart/form-data; boundary=z', 'application/x-www-form-urlencoded']) {
      expect((await request(`/api/dogs/${dog.id}/photos`, upload(png(), type))).status).toBe(415)
    }
  })

  it('refuses an upload without the custom header, or from a foreign Host or Origin', async () => {
    const { request, photosDir } = setup()
    const dog = await newDog(request)
    const path = `/api/dogs/${dog.id}/photos`
    expect(
      (await request(path, { method: 'POST', headers: { 'content-type': 'image/png' }, body: png() })).status,
    ).toBe(403)
    const host = await request(path, { ...upload(png()), headers: { ...photoHeaders(), host: 'rebind.example' } })
    expect(host.status).toBe(403)
    const origin = await request(path, {
      ...upload(png()),
      headers: { ...photoHeaders(), origin: 'https://attacker.example' },
    })
    expect(origin.status).toBe(403)
    const crossSite = await request(path, {
      ...upload(png()),
      headers: { ...photoHeaders(), 'sec-fetch-site': 'cross-site' },
    })
    expect(crossSite.status).toBe(403)
    expect(existsSync(photosDir) ? readdirSync(photosDir) : []).toEqual([])
  })

  it('removes a photo from its dog and its file', async () => {
    const { request, photosDir } = setup()
    const dog = await newDog(request)
    const { photos } = (await (await request(`/api/dogs/${dog.id}/photos`, upload(png()))).json()) as {
      photos: string[]
    }
    const res = await request(`/api/dogs/${dog.id}/photos/${photos[0]}`, send('DELETE', {}))
    expect(((await res.json()) as { photos: string[] }).photos).toEqual([])
    expect(readdirSync(photosDir)).toEqual([])
  })

  it('deletes a dog with its photo files, and leaves another dog and a stray file alone', async () => {
    const { request, photosDir, store } = setup()
    const dog = await newDog(request)
    const other = await newDog(request)
    await request(`/api/dogs/${dog.id}/photos`, upload(png()))
    await request(`/api/dogs/${dog.id}/photos`, upload(jpeg(), 'image/jpeg'))
    const kept = (await (await request(`/api/dogs/${other.id}/photos`, upload(png()))).json()) as { photos: string[] }
    expect(readdirSync(photosDir)).toHaveLength(3)

    expect((await request(`/api/dogs/${dog.id}`, send('DELETE', {}))).status).toBe(204)
    expect((await request(`/api/dogs/${dog.id}`)).status).toBe(404)
    expect(readdirSync(photosDir)).toEqual(kept.photos)
    expect((await request(`/api/dogs/${dog.id}`, send('DELETE', {}))).status).toBe(404)
    expect(store.repo.getDog(other.id)?.photos).toEqual(kept.photos)
  })
})

describe('matches', () => {
  const source = {
    id: 'example-portal',
    name: 'Example Portal',
    url: 'https://portal.example.com/',
    region: 'Zorbulon County',
    listingKinds: ['found' as const],
    access: 'link' as const,
  }
  function withListings(store: ReturnType<typeof setup>['store']) {
    store.repo.syncSources([source])
    const afton = findTown('Afton')
    const at = (key: string, postedAt: string) =>
      store.repo.upsertListing(
        {
          sourceId: 'example-portal',
          sourceKey: key,
          url: `https://portal.example.com/${key}`,
          kind: 'found',
          species: 'dog',
          postedAt,
          lat: afton?.lat ?? null,
          lon: afton?.lon ?? null,
          placePrecision: 'town',
          traits: { breeds: ['quux hound'], colors: ['teal'] },
        },
        T0,
      ).id
    return { after: at('ex-1', '2026-01-11T12:00:00.000Z'), before: at('ex-2', '2025-12-01T12:00:00.000Z') }
  }

  it('matches a dog when it is saved and serves its ranked matches with their listings and reasons', async () => {
    const { request, store, tick } = setup()
    const ids = withListings(store)
    const dog = await newDog(request)
    const res = await request(`/api/dogs/${dog.id}/matches`)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      items: {
        match: { listingId: number; band: string; reasons: string[]; setAsideReason: string | null }
        listing: { id: number }
      }[]
      ranAt: string
    }
    expect(body.ranAt).toBe(T0)
    expect(body.items.map((i) => i.listing.id)).toEqual([ids.after, ids.before])
    expect(body.items[1]?.match.setAsideReason).toBe('before-missing')
    for (const i of body.items) expect(i.match.reasons.length).toBeGreaterThan(0)

    tick('2026-01-12T12:00:00.000Z')
    const rerun = await request(`/api/dogs/${dog.id}/matches`, send('POST', {}))
    expect(((await rerun.json()) as { ranAt: string }).ranAt).toBe('2026-01-12T12:00:00.000Z')
  })

  it('answers 404 for the matches of a dog that is not there, and deletes a dog with its matches', async () => {
    const { request, store } = setup()
    withListings(store)
    expect((await request('/api/dogs/999/matches')).status).toBe(404)
    expect((await request('/api/dogs/999/matches', send('POST', {}))).status).toBe(404)
    const dog = await newDog(request)
    expect(store.repo.listMatches(dog.id)).toHaveLength(2)
    await request(`/api/dogs/${dog.id}`, send('DELETE', {}))
    expect(store.repo.counts().matches).toBe(0)
  })
})
