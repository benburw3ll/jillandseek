import { accessSync, constants, mkdirSync } from 'node:fs'
import { join } from 'node:path'

// The data home is the folder JILL_HOME names (ADR-0003 point 1). The app owns only what it
// creates there by name: the database file, photos/ and cache/. It never lists, reads or removes
// anything else in that folder, so other files there (the owner's private notes) stay untouched.

export type DataHome = {
  root: string
  /** The one database file. SQLite keeps its own journal beside it while writing. */
  dbPath: string
  /** A missing dog's photos, which the owner adds; deleted with the dog. */
  photosDir: string
  /** Reserved for cached copies, which live only as long as their listing. */
  cacheDir: string
}

export const DB_FILE = 'jillandseek.db'

export function dataHome(root: string): DataHome {
  return { root, dbPath: join(root, DB_FILE), photosDir: join(root, 'photos'), cacheDir: join(root, 'cache') }
}

/** Creates the data home and its named folders if they are missing. An empty folder is fine. */
export function prepareDataHome(home: DataHome): void {
  mkdirSync(home.root, { recursive: true })
  mkdirSync(home.photosDir, { recursive: true })
  mkdirSync(home.cacheDir, { recursive: true })
}

/** Whether the app can write to its data home's files. */
export function isWritable(home: DataHome): boolean {
  try {
    accessSync(home.root, constants.W_OK)
    accessSync(home.dbPath, constants.W_OK)
    return true
  } catch {
    return false
  }
}
