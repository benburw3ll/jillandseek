import type { DatabaseSync } from 'node:sqlite'
import { emptySweepCounts, Instant, Sweep, SweepCounts, SweepError } from '@jillandseek/core'
import { json, type Row } from './rows.ts'

// The sweeps table: one row per run of the collectors. O3 (#13) runs the sweep itself.

export function sweepFromRow(row: Row): Sweep {
  return Sweep.parse({
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    counts: json(row.counts),
    errors: json(row.errors),
  })
}

export function sweepsRepository(db: DatabaseSync) {
  return {
    /** Records a sweep's start and returns its id. */
    startSweep(now: string): number {
      Instant.parse(now)
      const result = db
        .prepare('INSERT INTO sweeps (started_at, counts) VALUES (?, ?)')
        .run(now, JSON.stringify(emptySweepCounts()))
      return Number(result.lastInsertRowid)
    },

    /** Records a sweep's end with its counts and its errors (codes only, never page text). */
    finishSweep(id: number, now: string, counts: SweepCounts, errors: SweepError[]): void {
      Instant.parse(now)
      const checked = SweepCounts.parse(counts)
      const checkedErrors = errors.map((e) => SweepError.parse(e))
      db.prepare('UPDATE sweeps SET finished_at = ?, counts = ?, errors = ? WHERE id = ?').run(
        now,
        JSON.stringify(checked),
        JSON.stringify(checkedErrors),
        id,
      )
    },

    /** The most recent sweeps, newest first. */
    listSweeps(limit = 20): Sweep[] {
      return (db.prepare('SELECT * FROM sweeps ORDER BY id DESC LIMIT ?').all(limit) as Row[]).map(sweepFromRow)
    },
  }
}
