import type { DatabaseSync } from 'node:sqlite'
import { Match } from '@jillandseek/core'
import { json, type Row } from './rows.ts'

// The matches table: one listing scored against one dog. O4 computes and writes them; deleting a
// dog or a listing deletes its matches (ON DELETE CASCADE).

export function matchFromRow(row: Row): Match {
  return Match.parse({
    dogId: row.dog_id,
    listingId: row.listing_id,
    score: row.score,
    band: row.band,
    reasons: json(row.reasons),
    setAsideReason: row.set_aside_reason,
    computedAt: row.computed_at,
  })
}

export function matchesRepository(db: DatabaseSync) {
  return {
    /** A dog's matches, best first. */
    listMatches(dogId: number): Match[] {
      return (
        db.prepare('SELECT * FROM matches WHERE dog_id = ? ORDER BY score DESC, listing_id').all(dogId) as Row[]
      ).map(matchFromRow)
    },
  }
}
