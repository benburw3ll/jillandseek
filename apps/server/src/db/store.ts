import { DatabaseSync } from 'node:sqlite'
import { type DataHome, dataHome, prepareDataHome } from './home.ts'
import { type Migration, migrate, readMigrations } from './migrate.ts'
import type { Retention } from './prune.ts'
import { createRepository, type Repository } from './repository.ts'

// Opening the store: the data home, its database, the migrations and the first prune.

export type Store = {
  home: DataHome
  db: DatabaseSync
  repo: Repository
  schemaVersion: number
  close(): void
}

export type Log = (line: string) => void

export type StoreOptions = {
  /** The data home folder (JILL_HOME). */
  home: string
  retention: Retention
  /** The clock. Every "now" comes from here, so tests can fix it. */
  now: () => Date
  log: Log
  migrations?: Migration[]
}

/** Opens the data home (creating it if it is empty), migrates its database and prunes it. */
export function openStore(options: StoreOptions): Store {
  const home = dataHome(options.home)
  prepareDataHome(home)
  const db = new DatabaseSync(home.dbPath)
  try {
    db.exec('PRAGMA foreign_keys = ON')
    db.exec('PRAGMA busy_timeout = 5000')
    const { from, to } = migrate(db, options.migrations ?? readMigrations(), options.now().toISOString())
    if (to !== from) options.log(`db: migrated schema=${from}->${to}`)
    const repo = createRepository(db, { photosDir: home.photosDir, retention: options.retention })
    const store: Store = { home, db, repo, schemaVersion: to, close: () => db.close() }
    runPrune(store, options)
    return store
  } catch (error) {
    db.close()
    throw error
  }
}

/** Runs pruneExpired once and logs counts only. */
export function runPrune(store: Store, options: Pick<StoreOptions, 'now' | 'log'>): void {
  const r = store.repo.pruneExpired(options.now().toISOString())
  options.log(`prune: listings=${r.listings} dogs=${r.dogs} photos=${r.photos} photoErrors=${r.photoErrors}`)
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Prunes once a day for as long as the server runs. Returns a function that stops it. */
export function schedulePrune(store: Store, options: Pick<StoreOptions, 'now' | 'log'>): () => void {
  const timer = setInterval(() => {
    try {
      runPrune(store, options)
    } catch {
      options.log('prune: failed code=prune-error')
    }
  }, DAY_MS)
  timer.unref()
  return () => clearInterval(timer)
}
