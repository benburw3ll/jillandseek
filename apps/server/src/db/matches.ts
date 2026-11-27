import type { DatabaseSync } from 'node:sqlite'
import { Instant, type Listing, Match, rankScored, scoreListing } from '@jillandseek/core'
import { dogFromRow } from './dogs.ts'
import { listingFromRow } from './listings.ts'
import { json, type Row, transaction } from './rows.ts'

// The matches table: one listing scored against one dog (#19). Matching a dog scores every
// stored listing against it and upserts the rows in one transaction, so a failed run leaves the
// last good matches in place. Deleting a dog or a listing deletes its matches (ON DELETE
// CASCADE). A low band never hides a listing, and a set-aside match is still stored.

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

/** A match with the listing it scores, as the dog page shows it. */
export type MatchedListing = { match: Match; listing: Listing }

export function matchesRepository(db: DatabaseSync) {
  const self = {
    /** A dog's matches, best first. */
    listMatches(dogId: number): Match[] {
      return (
        db.prepare('SELECT * FROM matches WHERE dog_id = ? ORDER BY score DESC, listing_id').all(dogId) as Row[]
      ).map(matchFromRow)
    },

    /**
     * A dog's matches with their listings, in the page's order: best first, set-aside ones after
     * the rest. `ranAt` is when matching last ran for the dog, or null when it has no matches.
     */
    listMatchedListings(dogId: number): { items: MatchedListing[]; ranAt: string | null } {
      const rows = db
        .prepare(
          `SELECT m.dog_id, m.listing_id, m.score, m.band, m.reasons, m.set_aside_reason, m.computed_at, l.*
           FROM matches m JOIN listings l ON l.id = m.listing_id WHERE m.dog_id = ?`,
        )
        .all(dogId) as Row[]
      const items = rows.map((row) => ({ match: matchFromRow(row), listing: listingFromRow(row) }))
      const ranked = rankScored(
        items.map((i) => ({
          ...i,
          listingId: i.match.listingId,
          score: i.match.score,
          setAside: i.match.setAsideReason,
        })),
      ).map(({ match, listing }) => ({ match, listing }))
      const ranAt = items.reduce<string | null>(
        (latest, i) => (latest === null || i.match.computedAt > latest ? i.match.computedAt : latest),
        null,
      )
      return { items: ranked, ranAt }
    },

    /**
     * Scores every stored listing against one dog at `now` and upserts its matches in one
     * transaction. Returns how many were written, or null when there is no such dog.
     */
    matchDog(dogId: number, now: string): number | null {
      Instant.parse(now)
      return transaction(db, () => {
        const row = db.prepare('SELECT * FROM dogs WHERE id = ?').get(dogId) as Row | undefined
        if (row === undefined) return null
        const dog = dogFromRow(row)
        const listings = (db.prepare('SELECT * FROM listings').all() as Row[]).map(listingFromRow)
        const upsert = db.prepare(
          `INSERT INTO matches (dog_id, listing_id, score, band, reasons, set_aside_reason, computed_at)
           VALUES (:dog_id, :listing_id, :score, :band, :reasons, :set_aside_reason, :computed_at)
           ON CONFLICT (dog_id, listing_id) DO UPDATE SET score = excluded.score, band = excluded.band,
             reasons = excluded.reasons, set_aside_reason = excluded.set_aside_reason,
             computed_at = excluded.computed_at`,
        )
        for (const listing of listings) {
          const s = scoreListing(dog, listing, now)
          const m = Match.parse({
            dogId,
            listingId: listing.id,
            score: s.score,
            band: s.band,
            reasons: s.reasons,
            setAsideReason: s.setAside,
            computedAt: now,
          })
          upsert.run({
            dog_id: m.dogId,
            listing_id: m.listingId,
            score: m.score,
            band: m.band,
            reasons: JSON.stringify(m.reasons),
            set_aside_reason: m.setAsideReason,
            computed_at: m.computedAt,
          })
        }
        return listings.length
      })
    },

    /**
     * Matches every missing dog at `now`, each in its own transaction, so one dog that fails
     * keeps its last good matches and never stops the dogs after it.
     */
    matchMissingDogs(now: string): { dogs: number; failed: number } {
      const ids = (db.prepare("SELECT id FROM dogs WHERE status = 'missing'").all() as Row[]).map((r) => Number(r.id))
      let failed = 0
      for (const id of ids) {
        try {
          self.matchDog(id, now)
        } catch {
          failed++
        }
      }
      return { dogs: ids.length, failed }
    },
  }
  return self
}
