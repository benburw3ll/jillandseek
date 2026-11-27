import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { DatabaseSync } from 'node:sqlite'

// Migrations are plain numbered .sql files (ADR-0004 point 3), run in order at start. Each one
// runs in one transaction with its schema_migrations row, so a failed migration leaves the
// database exactly as it was.

export type Migration = { version: number; name: string; sql: string }

/** The app's own migrations folder. */
export const MIGRATIONS_DIR = join(import.meta.dirname, 'migrations')

const FILE = /^(\d{4})-([a-z0-9-]+)\.sql$/

/** Reads `NNNN-name.sql` files from a folder, in version order. */
export function readMigrations(dir: string = MIGRATIONS_DIR): Migration[] {
  const migrations = readdirSync(dir)
    .flatMap((file) => {
      const m = FILE.exec(file)
      return m ? [{ version: Number(m[1]), name: m[2] ?? '', sql: readFileSync(join(dir, file), 'utf8') }] : []
    })
    .sort((a, b) => a.version - b.version)
  migrations.forEach((m, i) => {
    if (m.version !== i + 1) throw new Error(`migrations must be numbered 0001 up with no gaps (found ${m.version})`)
  })
  return migrations
}

const ensureTable = (db: DatabaseSync) =>
  db.exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL) STRICT',
  )

/** The newest migration applied, or 0 for a new database. */
export function schemaVersion(db: DatabaseSync): number {
  ensureTable(db)
  const row = db.prepare('SELECT MAX(version) AS version FROM schema_migrations').get() as { version: number | null }
  return row.version ?? 0
}

/** Applies every migration newer than the database, each in its own transaction. */
export function migrate(
  db: DatabaseSync,
  migrations: Migration[],
  now: string,
): { from: number; to: number; applied: number[] } {
  const from = schemaVersion(db)
  const latest = migrations.at(-1)?.version ?? 0
  if (from > latest) {
    throw new Error(`the database is at schema ${from}, newer than this app's ${latest}: update the app`)
  }
  const applied: number[] = []
  for (const m of migrations.filter((m) => m.version > from)) {
    db.exec('BEGIN IMMEDIATE')
    try {
      db.exec(m.sql)
      db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(
        m.version,
        m.name,
        now,
      )
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw new Error(`migration ${m.version} failed and was rolled back`, { cause: error })
    }
    applied.push(m.version)
  }
  return { from, to: schemaVersion(db), applied }
}
