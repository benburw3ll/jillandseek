import type { DatabaseSync } from 'node:sqlite'
import { aiCallsRepository } from './aiCalls.ts'
import { dogsRepository } from './dogs.ts'
import { listingsRepository } from './listings.ts'
import { matchesRepository } from './matches.ts'
import { pruneRepository, type Retention } from './prune.ts'
import { countRows } from './rows.ts'
import { sourcesRepository } from './sources.ts'
import { sweepsRepository } from './sweeps.ts'

// The one repository module (ADR-0004 point 3): the only code that runs SQL. It is one entry
// point over one file per record, so work on one record never edits another record's file.

export function createRepository(db: DatabaseSync, options: { photosDir: string; retention: Retention }) {
  return {
    ...sourcesRepository(db),
    ...sweepsRepository(db),
    ...listingsRepository(db),
    ...dogsRepository(db, options.photosDir),
    ...matchesRepository(db),
    ...pruneRepository(db, options.photosDir, options.retention),
    ...aiCallsRepository(db),

    /** How many rows each table holds. */
    counts() {
      return {
        sources: countRows(db, 'sources'),
        listings: countRows(db, 'listings'),
        dogs: countRows(db, 'dogs'),
        matches: countRows(db, 'matches'),
        sweeps: countRows(db, 'sweeps'),
      }
    },
  }
}

export type Repository = ReturnType<typeof createRepository>
