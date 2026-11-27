import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { type Migration, readMigrations, schemaVersion } from './migrate.ts'
import { openStore, type Store } from './store.ts'

// Every test gets its own temp data home and a fixed clock. All values are made up.

const homes: string[] = []
const stores: Store[] = []
afterEach(() => {
  for (const s of stores.splice(0)) s.close()
  for (const h of homes.splice(0)) rmSync(h, { recursive: true, force: true })
})

function tempHome(): string {
  const home = mkdtempSync(join(tmpdir(), 'jill-db-'))
  homes.push(home)
  return home
}

const T0 = '2026-01-10T12:00:00.000Z'
const retention = { keepGoneDays: 90, keepFoundDays: 30 }

function open(home = tempHome(), migrations?: Migration[], now = T0): Store {
  const lines: string[] = []
  const store = openStore({ home, retention, now: () => new Date(now), log: (l) => lines.push(l), migrations })
  stores.push(store)
  return store
}

const source = {
  id: 'zorbulon-shelter',
  name: 'Zorbulon County Shelter',
  url: 'https://shelter.example.com/',
  region: 'Zorbulon County',
  listingKinds: ['shelter-stray' as const],
  access: 'automatic' as const,
  collector: 'zorbulon-strays',
  checkedOn: '2026-01-01',
  checkNote: 'Made-up entry for tests.',
}

const candidate = (key: string, extra: Record<string, unknown> = {}) => ({
  sourceId: source.id,
  sourceKey: key,
  url: `https://shelter.example.com/animals/${key}`,
  kind: 'shelter-stray' as const,
  species: 'dog' as const,
  traits: { breeds: ['zorbulon hound'], colors: ['teal'] },
  ...extra,
})

const at = (day: number) => new Date(Date.UTC(2026, 0, day, 12)).toISOString()

describe('the data home and migrations', () => {
  it('migrates a fresh data home to the latest schema and reports its version', () => {
    const home = tempHome()
    writeFileSync(join(home, 'notes-zorbulon.md'), 'not the app’s file')
    const store = open(home)
    expect(store.schemaVersion).toBe(readMigrations().at(-1)?.version)
    expect(schemaVersion(store.db)).toBe(store.schemaVersion)
    expect(store.repo.counts()).toEqual({ sources: 0, listings: 0, dogs: 0, matches: 0, sweeps: 0 })
    // Only what the app creates by name, and the other file left as it was.
    expect(readdirSync(home).sort()).toEqual(['cache', 'jillandseek.db', 'notes-zorbulon.md', 'photos'])
    expect(readFileSync(join(home, 'notes-zorbulon.md'), 'utf8')).toBe('not the app’s file')
  })

  it('starts on a data home folder that does not exist yet', () => {
    const home = join(tempHome(), 'new-home')
    expect(open(home).schemaVersion).toBeGreaterThan(0)
  })

  it('rolls a migration that fails halfway back, leaving the database as it was', () => {
    const home = tempHome()
    const good = readMigrations()
    const broken: Migration = {
      version: good.length + 1,
      name: 'broken',
      sql: 'CREATE TABLE zz_half (a INTEGER); INSERT INTO zz_half VALUES (1); INSERT INTO zz_missing VALUES (1);',
    }
    open(home).close()
    stores.pop()
    expect(() => open(home, [...good, broken])).toThrow(/rolled back/)
    stores.pop()
    const store = open(home)
    expect(store.schemaVersion).toBe(good.length)
    expect(store.db.prepare("SELECT name FROM sqlite_master WHERE name = 'zz_half'").get()).toBeUndefined()
  })
})

describe('listings', () => {
  it('keeps one row for the same listing upserted twice, and moves last_seen_at', () => {
    const { repo } = open()
    repo.syncSources([source])
    const first = repo.upsertListing(candidate('Z-1'), at(1))
    const second = repo.upsertListing(candidate('Z-1'), at(2))
    expect(first.change).toBe('new')
    expect(second).toEqual({ id: first.id, change: 'seen' })
    expect(repo.counts().listings).toBe(1)
    const listing = repo.getListing(first.id)
    expect(listing?.firstSeenAt).toBe(at(1))
    expect(listing?.lastSeenAt).toBe(at(2))
    expect(repo.upsertListing(candidate('Z-1', { traits: { colors: ['plum'] } }), at(3)).change).toBe('updated')
    expect(repo.getListing(first.id)?.traits.colors).toEqual(['plum'])
  })

  it('marks listings a full read missed as gone, and brings one back when it is seen again', () => {
    const { repo } = open()
    repo.syncSources([source])
    for (const key of ['Z-1', 'Z-2', 'Z-3']) repo.upsertListing(candidate(key), at(1))
    expect(repo.markGone(source.id, ['Z-1', 'Z-3'], at(2))).toBe(1)
    expect(repo.listListings().items.map((l) => l.sourceKey)).toEqual(['Z-3', 'Z-1'])
    const gone = repo.listListings({ includeGone: true }).items.find((l) => l.sourceKey === 'Z-2')
    expect(gone?.goneAt).toBe(at(2))
    repo.upsertListing(candidate('Z-2'), at(3))
    expect(repo.listListings().items).toHaveLength(3)
  })

  it('pages newest first with a cursor and filters by kind, town and time', () => {
    const { repo } = open()
    repo.syncSources([source])
    for (let day = 1; day <= 5; day++) {
      repo.upsertListing(
        candidate(`Z-${day}`, { kind: day % 2 ? 'shelter-stray' : 'found', town: 'Quuxville' }),
        at(day),
      )
    }
    const page1 = repo.listListings({ limit: 2 })
    expect(page1.items.map((l) => l.sourceKey)).toEqual(['Z-5', 'Z-4'])
    const page2 = repo.listListings({ limit: 2, cursor: page1.nextCursor ?? '' })
    expect(page2.items.map((l) => l.sourceKey)).toEqual(['Z-3', 'Z-2'])
    const page3 = repo.listListings({ limit: 2, cursor: page2.nextCursor ?? '' })
    expect(page3).toEqual({ items: [expect.objectContaining({ sourceKey: 'Z-1' })], nextCursor: null })
    expect(repo.listListings({ kind: 'found' }).items.map((l) => l.sourceKey)).toEqual(['Z-4', 'Z-2'])
    expect(repo.listListings({ since: at(2), until: at(4) }).items.map((l) => l.sourceKey)).toEqual(['Z-3', 'Z-2'])
    expect(repo.listListings({ town: 'quuxville' }).items).toHaveLength(5)
    expect(() => repo.listListings({ cursor: 'not-a-cursor' })).toThrow('invalid cursor')
  })
})

describe('sources', () => {
  it("never clears the sweep's fields or a block, and retires a source the registry dropped", () => {
    const { db, repo } = open()
    repo.syncSources([source, { ...source, id: 'quux-rescue', name: 'Quux Rescue' }])
    db.prepare(
      "UPDATE sources SET status = 'blocked', blocked_at = ?, blocked_reason = 'http-403', last_read_at = ? WHERE id = ?",
    ).run(at(2), at(2), source.id)
    const result = repo.syncSources([{ ...source, name: 'Zorbulon County Shelter (renamed)' }])
    expect(result).toEqual({ added: 0, updated: 1, retired: 1 })
    const synced = repo.getSource(source.id)
    expect(synced).toMatchObject({ name: 'Zorbulon County Shelter (renamed)', status: 'blocked' })
    expect(synced).toMatchObject({ blockedAt: at(2), blockedReason: 'http-403', lastReadAt: at(2) })
    expect(repo.getSource('quux-rescue')?.status).toBe('retired')
  })
})

describe('dogs', () => {
  const dog = { label: 'Zorbulon', lastSeenAt: at(1), lastSeenTown: 'Quuxville', traits: { size: 'small' as const } }

  it('creates, reads, lists and changes a dog, starting the clock when it is found', () => {
    const { repo } = open()
    const created = repo.createDog(dog, at(1))
    expect(repo.getDog(created.id)).toEqual(created)
    expect(created).toMatchObject({ status: 'missing', foundAt: null, photos: [], placePrecision: 'unknown' })
    const found = repo.updateDog(created.id, { status: 'found' }, at(2))
    expect(found).toMatchObject({ status: 'found', foundAt: at(2), label: 'Zorbulon', updatedAt: at(2) })
    expect(repo.updateDog(created.id, { notes: 'made-up note' }, at(3))?.foundAt).toBe(at(2))
    expect(repo.updateDog(created.id, { status: 'missing' }, at(4))?.foundAt).toBeNull()
    expect(repo.listDogs().map((d) => d.id)).toEqual([created.id])
    expect(repo.listDogs({ status: 'found' })).toEqual([])
    expect(repo.updateDog(9999, { notes: 'x' }, at(4))).toBeNull()
  })
})

describe('pruneExpired', () => {
  it('deletes only what is past its line, with the matches and photos that go with it', () => {
    const { db, home, repo } = open()
    repo.syncSources([source])
    const old = repo.upsertListing(candidate('Z-old'), at(1)).id
    const recent = repo.upsertListing(candidate('Z-recent'), at(1)).id
    repo.upsertListing(candidate('Z-live'), at(1))
    repo.markGone(source.id, ['Z-live'], at(1))
    repo.upsertListing(candidate('Z-recent'), at(60))
    repo.markGone(source.id, ['Z-live'], at(60))

    const foundLong = repo.createDog({ lastSeenAt: at(1), lastSeenTown: 'Quuxville' }, at(1))
    const foundLately = repo.createDog({ lastSeenAt: at(1), lastSeenTown: 'Quuxville' }, at(1))
    const missing = repo.createDog({ lastSeenAt: at(1), lastSeenTown: 'Quuxville' }, at(1))
    repo.updateDog(foundLong.id, { status: 'found' }, at(10))
    repo.updateDog(foundLately.id, { status: 'found' }, at(80))
    mkdirSync(home.photosDir, { recursive: true })
    writeFileSync(join(home.photosDir, 'zorbulon-1.jpg'), 'made-up bytes')
    db.prepare('UPDATE dogs SET photos = ? WHERE id = ?').run(JSON.stringify(['zorbulon-1.jpg']), foundLong.id)
    const addMatch = db.prepare(
      "INSERT INTO matches (dog_id, listing_id, score, band, reasons, computed_at) VALUES (?, ?, 0.5, 'possible', '[]', ?)",
    )
    addMatch.run(missing.id, old, at(2))
    addMatch.run(foundLong.id, recent, at(2))

    // 2026-04-02 is 91 days after 2026-01-01 and 82 after the found dog was marked found.
    const result = repo.pruneExpired('2026-04-02T12:00:00.000Z')
    expect(result).toEqual({ listings: 1, dogs: 1, photos: 1, photoErrors: 0 })
    expect(repo.getListing(old)).toBeNull()
    expect(repo.getListing(recent)).not.toBeNull()
    expect(repo.getDog(foundLong.id)).toBeNull()
    expect(repo.getDog(foundLately.id)).not.toBeNull()
    expect(repo.getDog(missing.id)).not.toBeNull()
    expect(repo.counts().matches).toBe(0)
    expect(existsSync(join(home.photosDir, 'zorbulon-1.jpg'))).toBe(false)
  })
})
