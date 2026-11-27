import type { DatabaseSync, SQLInputValue } from 'node:sqlite'
import { Dog, DogInput, type DogInputBody, DogPatch, type DogStatus, Instant } from '@jillandseek/core'
import { json, type Row } from './rows.ts'

// The dogs table: the missing dogs the owner is searching for.

export function dogFromRow(row: Row): Dog {
  return Dog.parse({
    id: row.id,
    label: row.label,
    lastSeenAt: row.last_seen_at,
    lastSeenTown: row.last_seen_town,
    lastSeenPlace: row.last_seen_place,
    lat: row.lat,
    lon: row.lon,
    placePrecision: row.place_precision,
    traits: json(row.traits),
    marks: row.marks,
    notes: row.notes,
    photos: json(row.photos),
    status: row.status,
    foundAt: row.found_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

function dogColumns(d: Omit<Dog, 'id' | 'createdAt'>): Record<string, SQLInputValue> {
  return {
    label: d.label,
    last_seen_at: d.lastSeenAt,
    last_seen_town: d.lastSeenTown,
    last_seen_place: d.lastSeenPlace,
    lat: d.lat,
    lon: d.lon,
    place_precision: d.placePrecision,
    traits: JSON.stringify(d.traits),
    marks: d.marks,
    notes: d.notes,
    photos: JSON.stringify(d.photos),
    status: d.status,
    found_at: d.foundAt,
    updated_at: d.updatedAt,
  }
}

export function dogsRepository(db: DatabaseSync) {
  const getDog = (id: number): Dog | null => {
    const row = db.prepare('SELECT * FROM dogs WHERE id = ?').get(id) as Row | undefined
    return row ? dogFromRow(row) : null
  }

  return {
    getDog,

    /** Stores a new missing dog and returns it. */
    createDog(input: DogInputBody, now: string): Dog {
      const d = DogInput.parse(input)
      Instant.parse(now)
      const columns = dogColumns({ ...d, photos: [], status: 'missing', foundAt: null, updatedAt: now })
      const names = Object.keys(columns)
      const result = db
        .prepare(
          `INSERT INTO dogs (${names.join(', ')}, created_at) VALUES (${names.map((n) => `:${n}`).join(', ')}, :created_at)`,
        )
        .run({ ...columns, created_at: now })
      const dog = getDog(Number(result.lastInsertRowid))
      if (dog === null) throw new Error('the new dog was not stored')
      return dog
    },

    /**
     * Changes only the fields given, or returns null when there is no such dog. Marking a dog
     * found sets `foundAt` to `now` and starts its deletion clock; marking it missing again stops it.
     */
    updateDog(id: number, patch: unknown, now: string): Dog | null {
      const p = DogPatch.parse(patch)
      Instant.parse(now)
      const dog = getDog(id)
      if (dog === null) return null
      const status = p.status ?? dog.status
      const foundAt = status === 'missing' ? null : status !== dog.status ? now : dog.foundAt
      const next = Dog.parse({ ...dog, ...p, status, foundAt, updatedAt: now })
      const columns = dogColumns(next)
      const sets = Object.keys(columns).map((n) => `${n} = :${n}`)
      db.prepare(`UPDATE dogs SET ${sets.join(', ')} WHERE id = :id`).run({ ...columns, id })
      return getDog(id)
    },

    /** Every dog, newest first, or only those with one status. */
    listDogs(options: { status?: DogStatus } = {}): Dog[] {
      const rows =
        options.status === undefined
          ? db.prepare('SELECT * FROM dogs ORDER BY id DESC').all()
          : db.prepare('SELECT * FROM dogs WHERE status = ? ORDER BY id DESC').all(options.status)
      return (rows as Row[]).map(dogFromRow)
    },
  }
}
