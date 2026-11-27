// The source registry, the collectors and their one fetcher.
import type { Collector } from './collector.ts'

export const packageName = '@jillandseek/sources'

export { type Collector, MIN_INTERVAL_MINUTES } from './collector.ts'
export {
  createFetcher,
  type FetchedPage,
  type Fetcher,
  type FetcherOptions,
  FetchFailed,
  isChallenge,
  REPO_URL,
  type SharedFetcher,
  SourceBlocked,
  userAgent,
} from './fetcher/fetcher.ts'
export { checkRegistry, type RegistryProblem } from './registry/check.ts'
export { registryEntries } from './registry/entries.ts'

/** Every collector Jill and Seek has. */
export const collectors: readonly Collector[] = []

/** The ids of the collectors that exist. */
export const collectorIds: readonly string[] = collectors.map((c) => c.id)
