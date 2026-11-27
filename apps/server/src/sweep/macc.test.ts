import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type FetchedPage, maccStrays, registryEntries, type SharedFetcher } from '@jillandseek/sources'
import { describe, expect, it } from 'vitest'
import { runSweep } from './sweep.ts'
import { tempStore } from './testStore.ts'

// The real collector over the made-up fixture, through a fake fetcher. Nothing reaches the network.

const fixture = readFileSync(
  join(
    import.meta.dirname,
    '..',
    '..',
    '..',
    '..',
    'packages',
    'sources',
    'src',
    'collectors',
    'fixtures',
    'macc-strays.html.txt',
  ),
  'utf8',
)

/** The fixture with one dog's card taken out, and the count header to match. */
function without(id: string): string {
  const start = fixture.indexOf(`<div class="gridResult" tabindex="0" id="Result_${id}"`)
  const next = fixture.indexOf('<div class="gridResult"', start + 10)
  const end = next === -1 ? fixture.indexOf('</div>\n    </div>\n  </div>\n</body>') : next
  return (fixture.slice(0, start) + fixture.slice(end)).replace('1 - 3 of 3', '1 - 2 of 2')
}

describe('macc-strays in the sweep', () => {
  it('marks a dog missing from the next full read as gone', async () => {
    const store = tempStore()
    store.repo.syncSources(registryEntries)
    const bodies = [fixture, without('Z900002')]
    let clock = Date.parse('2026-01-10T12:00:00.000Z')
    const fetcher: SharedFetcher = {
      forSource: () => ({
        get: async (url): Promise<FetchedPage> => ({
          url,
          status: 200,
          contentType: 'text/html',
          body: bodies.shift() ?? '',
        }),
      }),
    }
    const deps = { repo: store.repo, collectors: [maccStrays], fetcher, now: () => new Date(clock), log: () => {} }
    await runSweep(deps)
    expect(store.repo.listListings().items).toHaveLength(3)
    clock += 30 * 60_000
    await runSweep(deps)
    const all = store.repo.listListings({ includeGone: true }).items
    expect(all.find((l) => l.sourceKey === 'Z900002')?.goneAt).toBe(new Date(clock).toISOString())
    expect(
      store.repo
        .listListings()
        .items.map((l) => l.sourceKey)
        .sort(),
    ).toEqual(['Z900001', 'Z900003'])
  })
})
