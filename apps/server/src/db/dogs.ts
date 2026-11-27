import type { DatabaseSync, SQLInputValue } from 'node:sqlite'
import {
  Dog,
  DogInput,
  type DogInputBody,
  DogPatch,
  type DogStatus,
  Instant,
  MAX_PHOTOS,
  type PhotoType,
} from '@jillandseek/core'
import { photoStore } from './photos.ts'
import { json, type Row, transaction } from './rows.ts'

// The dogs table: the missing dogs the owner is searching for, and their photo files.

export type AddPhotoResult =
  | { ok: true; dog: Dog; name: string }
  | { ok: false; error: 'not-found' | 'not-an-image' | 'too-many-photos' }

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

export function dogsRepository(db: DatabaseSync, photosDir: string) {
  const photos = photoStore(photosDir)
  const getDog = (id: number): Dog | null => {
    const row = db.prepare('SELECT * FROM dogs WHERE id = ?').get(id) as Row | undefined
    return row ? dogFromRow(row) : null
  }
  const setPhotos = (id: number, names: string[], now: string) =>
    db.prepare('UPDATE dogs SET photos = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(names), now, id)

  return {
    getDog,

    /**
     * Saves a photo's bytes for a dog. The file is written first and the row after; if the row
     * can't be written, the file is removed again, so no saved dog ever names a missing file.
     */
    addPhoto(id: number, bytes: Uint8Array, now: string): AddPhotoResult {
      Instant.parse(now)
      const type: PhotoType | null = photos.detect(bytes)
      if (type === null) return { ok: false, error: 'not-an-image' }
      const dog = getDog(id)
      if (dog === null) return { ok: false, error: 'not-found' }
      if (dog.photos.length >= MAX_PHOTOS) return { ok: false, error: 'too-many-photos' }
      const name = photos.save(bytes, type)
      try {
        setPhotos(id, [...dog.photos, name], now)
      } catch (error) {
        photos.remove(name)
        throw error
      }
      return { ok: true, dog: getDog(id) as Dog, name }
    },

    /** The photo's bytes and type, only when the name is one of this dog's photos. */
    readPhoto(id: number, name: string): { bytes: Uint8Array<ArrayBuffer>; type: PhotoType } | null {
      const dog = getDog(id)
      if (dog === null || !dog.photos.includes(name)) return null
      return photos.read(name)
    },

    /**
     * Takes a photo off a dog, or returns null when the dog has no such photo. The row changes
     * first; a file whose removal fails has no dog naming it, so the prune removes it later.
     */
    removePhoto(id: number, name: string, now: string): Dog | null {
      Instant.parse(now)
      const dog = getDog(id)
      if (dog === null || !dog.photos.includes(name)) return null
      setPhotos(
        id,
        dog.photos.filter((p) => p !== name),
        now,
      )
      photos.remove(name)
      return getDog(id)
    },

    /**
     * Deletes a dog by hand, with its matches and its photo files; false when there is no such
     * dog. The row goes first, as in the prune, so a failed file removal never brings a dog back.
     */
    deleteDog(id: number): boolean {
      const names = transaction(db, () => {
        const dog = getDog(id)
        if (dog === null) return null
        db.prepare('DELETE FROM dogs WHERE id = ?').run(id)
        return dog.photos
      })
      if (names === null) return false
      for (const name of names) photos.remove(name)
      return true
    },

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
