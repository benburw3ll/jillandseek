import type { ListingCandidateInput } from '@jillandseek/core'
import type { FetchedPage, Fetcher } from './fetcher/fetcher.ts'

/**
 * The code that reads one automatic source (ADR-0002). `fetchPages` reads through the one shared
 * fetcher only; `parse` is pure, so tests run it on fixtures.
 */
export type Collector = {
  id: string
  sourceId: string
  /** At least 30: the sweep never reads a source more often than every 30 minutes. */
  minIntervalMinutes: number
  fetchPages(fetcher: Fetcher): Promise<FetchedPage[]>
  parse(page: FetchedPage): ListingCandidateInput[]
  /**
   * Whether the pages are the source's whole list, so a listing missing from them is gone.
   * Without it, every read that finishes counts as full.
   */
  isFullRead?(pages: FetchedPage[]): boolean
}

/** The floor on every collector's interval (ADR-0002 point 3). */
export const MIN_INTERVAL_MINUTES = 30
