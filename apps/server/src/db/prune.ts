import { rmSync } from 'node:fs'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'
import { daysBefore, Instant, PhotoName } from '@jillandseek/core'
import { json, type Row, transaction } from './rows.ts'

// Deletion (ADR-0003 point 3). A listing that left its source is deleted a set number of days
// after it was last seen, and a dog marked found a set number of days after it was found, with
// its matches and its photos. Both lines are settings.

export type Retention = { keepGoneDays: number; keepFoundDays: number }
export type PruneResult = { listings: number; dogs: number; photos: number; photoErrors: number }

export function pruneRepository(db: DatabaseSync, photosDir: string, retention: Retention) {
  return {
    /**
     * Deletes what is past its line at `now`. The rows go in one transaction first (matches go
     * with them); the photo files go after, so a failed file removal never brings a dog back.
     */
    pruneExpired(now: string): PruneResult {
      Instant.parse(now)
      const goneLine = daysBefore(now, retention.keepGoneDays)
      const foundLine = daysBefore(now, retention.keepFoundDays)
      const { listings, dogs, photos } = transaction(db, () => {
        const listings = Number(
          db.prepare('DELETE FROM listings WHERE gone_at IS NOT NULL AND last_seen_at < ?').run(goneLine).changes,
        )
        const expired = db
          .prepare("SELECT id, photos FROM dogs WHERE status = 'found' AND found_at < ?")
          .all(foundLine) as Row[]
        const remove = db.prepare('DELETE FROM dogs WHERE id = ?')
        for (const dog of expired) remove.run(dog.id ?? null)
        const photos = expired.flatMap((dog) => json(dog.photos) as unknown[])
        return { listings, dogs: expired.length, photos }
      })
      let removed = 0
      let photoErrors = 0
      for (const name of photos) {
        // Only a bare file name inside photos/ is ever removed.
        if (!PhotoName.safeParse(name).success) {
          photoErrors++
          continue
        }
        try {
          rmSync(join(photosDir, String(name)), { force: true })
          removed++
        } catch {
          photoErrors++
        }
      }
      return { listings, dogs, photos: removed, photoErrors }
    },
  }
}
