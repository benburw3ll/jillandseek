import { emptySweepCounts, ListingCandidate, type ListingCandidateInput, type SweepError } from '@jillandseek/core'
import {
  type Collector,
  FetchFailed,
  MIN_INTERVAL_MINUTES,
  type SharedFetcher,
  SourceBlocked,
} from '@jillandseek/sources'
import type { Repository } from '../db/repository.ts'

// The sweep (ADR-0002, ADR-0005): one run of the collectors over the automatic sources that are
// due. It records each read's start before it fetches, so a crash still counts the read; it
// stores what a read found in one transaction; and it writes a sweeps row with counts and error
// codes. Logs hold source ids, counts and timings only.

export type SweepDeps = {
  repo: Repository
  collectors: readonly Collector[]
  fetcher: SharedFetcher
  /** The clock. Every "now" comes from here, so tests can fix it. */
  now: () => Date
  log: (line: string) => void
}

const MINUTE_MS = 60_000

/** The collectors whose source is automatic, active, names them, and was last read long enough ago. */
export function dueCollectors(deps: Pick<SweepDeps, 'repo' | 'collectors' | 'now'>): Collector[] {
  const now = deps.now().getTime()
  const sources = new Map(deps.repo.listSources().map((s) => [s.id, s]))
  return deps.collectors.filter((c) => {
    const s = sources.get(c.sourceId)
    if (s === undefined || s.access !== 'automatic' || s.status !== 'active' || s.collector !== c.id) return false
    if (s.lastReadAt === null) return true
    const interval = Math.max(MIN_INTERVAL_MINUTES, c.minIntervalMinutes) * MINUTE_MS
    return now - Date.parse(s.lastReadAt) >= interval
  })
}

/**
 * Runs one sweep and returns its id, or null when no source was due: a tick with nothing due
 * writes no sweeps row and starts no matching. After a sweep that read at least one source,
 * every missing dog is matched again (#19).
 */
export async function runSweep(deps: SweepDeps): Promise<number | null> {
  const started = deps.now()
  const due = dueCollectors(deps)
  if (due.length === 0) return null
  const id = deps.repo.startSweep(started.toISOString())
  const counts = { ...emptySweepCounts(), sourcesDue: due.length }
  const errors: SweepError[] = []
  try {
    for (const collector of due) {
      const sourceId = collector.sourceId
      const source = deps.repo.getSource(sourceId)
      if (source === null) continue
      deps.repo.markRead(sourceId, deps.now().toISOString())
      const t0 = Date.now()
      try {
        const pages = await collector.fetchPages(deps.fetcher.forSource(source.url))
        const candidates: ListingCandidateInput[] = []
        let invalid = 0
        for (const page of pages) {
          for (const raw of collector.parse(page)) {
            const parsed = ListingCandidate.safeParse({ ...raw, sourceId })
            if (parsed.success) candidates.push(parsed.data)
            else invalid++
          }
        }
        // A read with listings that failed the schema isn't trusted as full: nothing is marked gone.
        const full = invalid === 0 && (collector.isFullRead?.(pages) ?? true)
        const r = deps.repo.recordRead(sourceId, candidates, full, deps.now().toISOString())
        counts.sourcesRead++
        counts.listingsSeen += r.seen
        counts.listingsNew += r.new
        counts.listingsUpdated += r.updated
        counts.listingsGone += r.gone
        if (invalid > 0) errors.push({ sourceId, code: 'invalid-listing' })
        deps.log(
          `sweep: source=${sourceId} seen=${r.seen} new=${r.new} updated=${r.updated} gone=${r.gone} invalid=${invalid} full=${full} ms=${Date.now() - t0}`,
        )
      } catch (error) {
        const code = errorCode(error)
        errors.push({ sourceId, code })
        if (error instanceof SourceBlocked) deps.repo.blockSource(sourceId, error.reason, deps.now().toISOString())
        deps.log(`sweep: source=${sourceId} failed code=${code} ms=${Date.now() - t0}`)
      }
    }
  } finally {
    deps.repo.finishSweep(id, deps.now().toISOString(), counts, errors)
    deps.log(
      `sweep: id=${id} due=${counts.sourcesDue} read=${counts.sourcesRead} new=${counts.listingsNew} gone=${counts.listingsGone} errors=${errors.length}`,
    )
  }
  // The listings are stored before matching starts, so a failed matching run loses nothing: the
  // last good matches stay, and the next sweep or a dog's save runs it again.
  if (counts.sourcesRead > 0) {
    const t0 = Date.now()
    try {
      const dogs = deps.repo.matchMissingDogs(deps.now().toISOString())
      deps.log(`sweep: id=${id} matched dogs=${dogs} ms=${Date.now() - t0}`)
    } catch {
      deps.log(`sweep: id=${id} matching failed code=match-error`)
    }
  }
  return id
}

function errorCode(error: unknown): string {
  if (error instanceof SourceBlocked) return `blocked-${error.reason}`
  if (error instanceof FetchFailed) return error.code
  return 'collector-error'
}

export type SweepSchedule = { stop(): void; running(): boolean }

/**
 * Runs a sweep now and every `everyMs`, never two at once. The tick (5 minutes) is shorter than
 * the 30-minute floor on purpose: `dueCollectors` is the only gate, so a read that started a few
 * milliseconds late is not pushed back a whole extra tick.
 */
export function scheduleSweeps(deps: SweepDeps, everyMs = 5 * MINUTE_MS): SweepSchedule {
  let busy = false
  const tick = async () => {
    if (busy) return
    busy = true
    try {
      await runSweep(deps)
    } catch {
      deps.log('sweep: failed code=sweep-error')
    } finally {
      busy = false
    }
  }
  void tick()
  const timer = setInterval(() => void tick(), everyMs)
  timer.unref()
  return { stop: () => clearInterval(timer), running: () => busy }
}
