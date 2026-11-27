import { registryEntries } from '@jillandseek/sources'
import type { Repository } from '../db/repository.ts'

/** Writes the registry into the sources table at start-up, and logs counts only. */
export function syncRegistry(repo: Repository, log: (line: string) => void, entries = registryEntries) {
  const r = repo.syncSources(entries)
  log(`registry: synced added=${r.added} updated=${r.updated} retired=${r.retired}`)
  return r
}
