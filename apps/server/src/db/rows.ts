import type { DatabaseSync, SQLInputValue } from 'node:sqlite'

// Small helpers the record files share. Only the repository's files run SQL (ADR-0004 point 3).

export type Row = Record<string, SQLInputValue>

/** Parses a JSON text column. */
export const json = (value: unknown): unknown => (typeof value === 'string' ? JSON.parse(value) : value)

/** Runs `work` in one transaction: all of it lands, or none of it. */
export function transaction<T>(db: DatabaseSync, work: () => T): T {
  if (db.isTransaction) return work()
  db.exec('BEGIN IMMEDIATE')
  try {
    const result = work()
    db.exec('COMMIT')
    return result
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

/** The number of rows in one of the app's tables. */
export function countRows(db: DatabaseSync, table: 'sources' | 'sweeps' | 'listings' | 'dogs' | 'matches'): number {
  return (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n
}
