import type { ListingCandidateInput } from '@jillandseek/core'
import { type Collector, type FetchedPage, type SharedFetcher, SourceBlocked } from '@jillandseek/sources'
import { describe, expect, it } from 'vitest'
import { createApp } from '../app.ts'
import type { Store } from '../db/store.ts'
import { runSweep } from './sweep.ts'
import { tempStore } from './testStore.ts'

// A fake collector over a made-up source, a fake fetcher and a fixed clock. All data is made up.

const T0 = Date.parse('2026-01-10T12:00:00.000Z')
const MIN = 60_000

const entry = {
  id: 'zorbulon-pound',
  name: 'Zorbulon Pound',
  url: 'https://pound.example.com/strays',
  region: 'Zorbulon County',
  listingKinds: ['shelter-stray' as const],
  access: 'automatic' as const,
  collector: 'zorbulon-strays',
  checkedOn: '2026-01-10',
  checkNote: 'Made up for a test.',
}

const dog = (key: string): ListingCandidateInput => ({
  sourceId: 'zorbulon-pound',
  sourceKey: key,
  url: `https://pound.example.com/strays/${key}`,
  kind: 'shelter-stray',
  species: 'dog',
  traits: { breeds: ['Quux Hound'], colors: ['teal'] },
})

function setup(pageKeys: string[][], fail?: () => Error) {
  const store: Store = tempStore()
  store.repo.syncSources([entry])
  let clock = T0
  let reads = 0
  const lines: string[] = []
  const fetcher: SharedFetcher = {
    forSource: (url) => ({
      async get(): Promise<FetchedPage> {
        expect(url).toBe(entry.url)
        if (fail) throw fail()
        const keys = pageKeys[Math.min(reads, pageKeys.length - 1)] ?? []
        reads++
        return { url, status: 200, contentType: 'text/plain', body: keys.join(',') }
      },
    }),
  }
  const collector: Collector = {
    id: 'zorbulon-strays',
    sourceId: 'zorbulon-pound',
    minIntervalMinutes: 5, // below the floor: the sweep still waits 30 minutes
    fetchPages: async (f) => [await f.get(entry.url)],
    parse: (page) => page.body.split(',').filter(Boolean).map(dog),
  }
  const deps = {
    repo: store.repo,
    collectors: [collector],
    fetcher,
    now: () => new Date(clock),
    log: (l: string) => lines.push(l),
  }
  return {
    store,
    lines,
    reads: () => reads,
    sweep: () => runSweep(deps),
    advance: (ms: number) => {
      clock += ms
    },
  }
}

describe('the sweep', () => {
  it('runs a due collector, upserts its listings and records the sweep; it waits 30 minutes to read again', async () => {
    const s = setup([
      ['Z-1', 'Z-2'],
      ['Z-2', 'Z-3'],
    ])
    const first = await s.sweep()
    expect(
      s.store.repo
        .listListings()
        .items.map((l) => l.sourceKey)
        .sort(),
    ).toEqual(['Z-1', 'Z-2'])
    expect(s.store.repo.listSweeps()[0]).toMatchObject({
      id: first,
      counts: { sourcesDue: 1, sourcesRead: 1, listingsSeen: 2, listingsNew: 2, listingsGone: 0 },
      errors: [],
    })
    expect(s.store.repo.getSource('zorbulon-pound')?.lastReadAt).toBe(new Date(T0).toISOString())

    s.advance(29 * MIN)
    await s.sweep()
    expect(s.reads()).toBe(1)
    expect(s.store.repo.listSweeps()[0]?.counts.sourcesDue).toBe(0)

    s.advance(1 * MIN)
    await s.sweep()
    expect(s.reads()).toBe(2)
    // Z-1 is missing from the full read: it is gone. Z-3 is new.
    expect(s.store.repo.listSweeps()[0]?.counts).toMatchObject({ listingsNew: 1, listingsGone: 1 })
    expect(
      s.store.repo
        .listListings()
        .items.map((l) => l.sourceKey)
        .sort(),
    ).toEqual(['Z-2', 'Z-3'])
  })

  it('logs source ids, counts and timings only', async () => {
    const s = setup([['Z-1']])
    await s.sweep()
    for (const line of s.lines) {
      expect(line).toMatch(/^sweep: /)
      expect(line).not.toMatch(/Z-1|quux|teal|example/i)
    }
  })

  it.each([['http-429' as const], ['challenge' as const]])(
    'marks the source blocked on %s, and never reads it again, even after a registry sync',
    async (reason) => {
      const s = setup([['Z-1']], () => new SourceBlocked(reason))
      await s.sweep()
      const source = s.store.repo.getSource('zorbulon-pound')
      expect(source).toMatchObject({ status: 'blocked', blockedReason: reason })
      expect(s.store.repo.listSweeps()[0]?.errors).toEqual([{ sourceId: 'zorbulon-pound', code: `blocked-${reason}` }])
      s.store.repo.syncSources([entry])
      s.advance(24 * 60 * MIN)
      await s.sweep()
      expect(s.store.repo.listSweeps()[0]?.counts.sourcesDue).toBe(0)
    },
  )

  it('serves the sweeps and each source with its last read, status and listing count', async () => {
    const s = setup([['Z-1', 'Z-2']])
    await s.sweep()
    const app = createApp({
      repo: s.store.repo,
      now: () => new Date(T0),
      version: '0.1.0',
      schemaVersion: s.store.schemaVersion,
      dataHomeWritable: () => true,
      ports: [5200],
      log: () => {},
    })
    const get = (path: string) => app.request(`http://127.0.0.1:5200${path}`, { headers: { host: '127.0.0.1:5200' } })
    const sweeps = (await (await get('/api/sweeps')).json()) as { items: { counts: { listingsNew: number } }[] }
    expect(sweeps.items[0]?.counts.listingsNew).toBe(2)
    const sources = (await (await get('/api/sources')).json()) as {
      items: { id: string; status: string; lastReadAt: string }[]
      listingCounts: Record<string, number>
    }
    expect(sources.items[0]).toMatchObject({
      id: 'zorbulon-pound',
      status: 'active',
      lastReadAt: new Date(T0).toISOString(),
    })
    expect(sources.listingCounts).toEqual({ 'zorbulon-pound': 2 })
  })
})
