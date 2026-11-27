import type { DatabaseSync, SQLInputValue } from 'node:sqlite'
import {
  Instant,
  Listing,
  ListingCandidate,
  type ListingCandidateInput,
  ListingQuery,
  type ListingQueryInput,
  type Page,
} from '@jillandseek/core'
import { json, type Row } from './rows.ts'

// The listings table. One row per (source_id, source_key): a repeat read moves last_seen_at and
// changes what changed, and never makes a second row (ADR-0005 point 3).

export function listingFromRow(row: Row): Listing {
  return Listing.parse({
    id: row.id,
    sourceId: row.source_id,
    sourceKey: row.source_key,
    url: row.url,
    kind: row.kind,
    species: row.species,
    postedAt: row.posted_at,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    goneAt: row.gone_at,
    placeText: row.place_text,
    town: row.town,
    county: row.county,
    lat: row.lat,
    lon: row.lon,
    placePrecision: row.place_precision,
    traits: json(row.traits),
    text: row.text,
    photoUrls: json(row.photo_urls),
    contact: row.contact,
  })
}

/** The source-given columns, the ones a repeat read may change. */
function candidateColumns(c: ListingCandidate): Record<string, SQLInputValue> {
  return {
    url: c.url,
    kind: c.kind,
    species: c.species,
    posted_at: c.postedAt,
    place_text: c.placeText,
    town: c.town,
    county: c.county,
    lat: c.lat,
    lon: c.lon,
    place_precision: c.placePrecision,
    traits: JSON.stringify(c.traits),
    text: c.text,
    photo_urls: JSON.stringify(c.photoUrls),
    contact: c.contact,
  }
}

/** A cursor that can't be read: the API answers 400. */
export class InvalidCursorError extends Error {
  constructor() {
    super('invalid cursor')
  }
}

const encodeCursor = (l: Listing) => Buffer.from(JSON.stringify([l.firstSeenAt, l.id])).toString('base64url')

function decodeCursor(cursor: string): [string, number] {
  try {
    const value = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))
    if (Array.isArray(value) && Instant.safeParse(value[0]).success && Number.isInteger(value[1])) {
      return [value[0], value[1]]
    }
  } catch {
    // falls through
  }
  throw new InvalidCursorError()
}

export type UpsertResult = { id: number; change: 'new' | 'updated' | 'seen' }

export function listingsRepository(db: DatabaseSync) {
  return {
    /**
     * Inserts a listing, or, for one already stored, moves its `last_seen_at` to `now`, clears
     * `gone_at` and writes any field that changed.
     */
    upsertListing(input: ListingCandidateInput, now: string): UpsertResult {
      const c = ListingCandidate.parse(input)
      Instant.parse(now)
      const columns = candidateColumns(c)
      const existing = db
        .prepare('SELECT * FROM listings WHERE source_id = ? AND source_key = ?')
        .get(c.sourceId, c.sourceKey) as Row | undefined
      if (existing === undefined) {
        const names = Object.keys(columns)
        const result = db
          .prepare(
            `INSERT INTO listings (source_id, source_key, first_seen_at, last_seen_at, ${names.join(', ')})
             VALUES (:source_id, :source_key, :now, :now, ${names.map((n) => `:${n}`).join(', ')})`,
          )
          .run({ source_id: c.sourceId, source_key: c.sourceKey, now, ...columns })
        return { id: Number(result.lastInsertRowid), change: 'new' }
      }
      const id = Number(existing.id)
      const changed = Object.entries(columns).some(([name, value]) => existing[name] !== value)
      if (changed) {
        const sets = Object.keys(columns).map((n) => `${n} = :${n}`)
        db.prepare(`UPDATE listings SET ${sets.join(', ')}, last_seen_at = :now, gone_at = NULL WHERE id = :id`).run({
          ...columns,
          now,
          id,
        })
        return { id, change: 'updated' }
      }
      db.prepare('UPDATE listings SET last_seen_at = ?, gone_at = NULL WHERE id = ?').run(now, id)
      return { id, change: 'seen' }
    },

    /**
     * After a full read of a source, marks every listing of that source the read didn't see as
     * gone at `now`. Returns how many were marked. A read that saw nothing marks nothing: a
     * broken or changed page looks the same as an empty one, and pruning would then delete the
     * whole source's listings.
     */
    markGone(sourceId: string, seenKeys: string[], now: string): number {
      Instant.parse(now)
      if (seenKeys.length === 0) return 0
      const result = db
        .prepare(
          `UPDATE listings SET gone_at = :now
           WHERE source_id = :source_id AND gone_at IS NULL
             AND source_key NOT IN (SELECT value FROM json_each(:keys))`,
        )
        .run({ now, source_id: sourceId, keys: JSON.stringify(seenKeys) })
      return Number(result.changes)
    },

    /** Listings newest first (by first seen), cursor-paged, with the Listings page's filters. */
    listListings(input: ListingQueryInput = {}): Page<Listing> {
      const q = ListingQuery.parse(input)
      const where: string[] = []
      const params: Record<string, SQLInputValue> = { limit: q.limit + 1 }
      if (!q.includeGone) where.push('gone_at IS NULL')
      if (q.kind !== undefined) {
        where.push('kind = :kind')
        params.kind = q.kind
      }
      if (q.since !== undefined) {
        where.push('first_seen_at >= :since')
        params.since = q.since
      }
      if (q.until !== undefined) {
        where.push('first_seen_at < :until')
        params.until = q.until
      }
      if (q.town !== undefined) {
        where.push('town = :town COLLATE NOCASE')
        params.town = q.town
      }
      if (q.county !== undefined) {
        where.push('county = :county COLLATE NOCASE')
        params.county = q.county
      }
      if (q.cursor !== undefined) {
        const [firstSeenAt, id] = decodeCursor(q.cursor)
        where.push('(first_seen_at < :c_first OR (first_seen_at = :c_first AND id < :c_id))')
        params.c_first = firstSeenAt
        params.c_id = id
      }
      const sql = `SELECT * FROM listings ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                   ORDER BY first_seen_at DESC, id DESC LIMIT :limit`
      const rows = (db.prepare(sql).all(params) as Row[]).map(listingFromRow)
      const items = rows.slice(0, q.limit)
      const last = items.at(-1)
      return { items, nextCursor: rows.length > q.limit && last ? encodeCursor(last) : null }
    },

    getListing(id: number): Listing | null {
      const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(id) as Row | undefined
      return row ? listingFromRow(row) : null
    },
  }
}
