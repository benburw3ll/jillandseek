import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach } from 'vitest'
import { openStore, type Store } from '../db/store.ts'

// Tests only: a store in its own temp data home, removed after each test.

const cleanups: (() => void)[] = []
afterEach(() => {
  for (const c of cleanups.splice(0).reverse()) c()
})

export function tempStore(now = '2026-01-10T12:00:00.000Z'): Store {
  const home = mkdtempSync(join(tmpdir(), 'jill-sweep-'))
  const store = openStore({
    home,
    retention: { keepGoneDays: 90, keepFoundDays: 30 },
    now: () => new Date(now),
    log: () => {},
  })
  cleanups.push(
    () => rmSync(home, { recursive: true, force: true }),
    () => store.close(),
  )
  return store
}
