import type { Source, Sweep } from '@jillandseek/core'
import { useEffect, useState } from 'react'
import { clearBlock, fetchSources, type SourceList } from '../api/sources.ts'
import { fetchSweeps } from '../api/sweeps.ts'
import { useLoad } from '../useLoad.ts'
import './sources-pages.css'

const ACCESS_WORDS: Record<Source['access'], string> = {
  automatic: 'Read automatically',
  capture: 'Captured from your browser',
  link: 'Link only',
}

const REASON_WORDS: Record<NonNullable<Source['blockedReason']>, string> = {
  'http-403': 'the site refused (403)',
  'http-429': 'the site asked us to slow down (429)',
  challenge: 'the site answered with a bot check',
  robots: 'its robots rules say no',
}

const when = (moment: string) => `${moment.slice(0, 10)} ${moment.slice(11, 16)} UTC`

function statusText(s: Source): string {
  if (s.status === 'blocked')
    return `Blocked: ${s.blockedReason ? REASON_WORDS[s.blockedReason] : 'no reason recorded'}`
  if (s.status === 'retired') return 'Retired'
  return 'Active'
}

/** Every source in the registry, with coverage at the top. */
export function Sources() {
  const load = useLoad<SourceList>((signal) => fetchSources(signal))
  const [lastSweep, setLastSweep] = useState<Sweep | null>(null)
  /** Sources the owner cleared on this visit. */
  const [cleared, setCleared] = useState<Set<string>>(new Set())
  useEffect(() => {
    const controller = new AbortController()
    fetchSweeps(controller.signal).then(
      (sweeps) => setLastSweep(sweeps[0] ?? null),
      () => {}, // the page works without it
    )
    return () => controller.abort()
  }, [])

  return (
    <>
      <h1>Sources</h1>
      {load.state === 'loading' && <p aria-busy="true">Loading sources…</p>}
      {load.state === 'error' && (
        <p role="alert">The sources could not be loaded. Check that Jill and Seek's server is running.</p>
      )}
      {load.state === 'ready' && load.data.items.length === 0 && (
        <div className="empty">
          <p>No sources yet.</p>
          <p>
            Sources appear here once the registry of every place Jill and Seek knows about is added: what each one
            covers, and whether it is read automatically, captured from your browser or only linked to.
          </p>
        </div>
      )}
      {load.state === 'ready' && load.data.items.length > 0 && (
        <>
          <Coverage sources={load.data.items} />
          <p className="note">
            {lastSweep === null
              ? 'No sweep has run yet.'
              : `Last sweep ${when(lastSweep.startedAt)}: ${lastSweep.counts.sourcesRead} of ${lastSweep.counts.sourcesDue} due sources read, ${lastSweep.counts.listingsNew} new listings, ${lastSweep.errors.length} errors.`}
          </p>
          <div className="table-wrap">
            <table className="sources-table">
              <caption className="visually-hidden">Sources in the registry</caption>
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col">Covers</th>
                  <th scope="col">Access</th>
                  <th scope="col">Last read</th>
                  <th scope="col">Status</th>
                  <th scope="col">Listings</th>
                </tr>
              </thead>
              <tbody>
                {load.data.items.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <a href={s.url} rel="noreferrer noopener" target="_blank" referrerPolicy="no-referrer">
                        {s.name}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    </td>
                    <td>{s.region}</td>
                    <td>{ACCESS_WORDS[s.access]}</td>
                    <td>{s.lastReadAt === null ? 'Never' : when(s.lastReadAt)}</td>
                    <td>
                      {statusText(cleared.has(s.id) ? { ...s, status: 'active' } : s)}
                      {s.status === 'blocked' && !cleared.has(s.id) && (
                        <ClearBlock source={s} onCleared={() => setCleared(new Set([...cleared, s.id]))} />
                      )}
                    </td>
                    <td>{load.data.listingCounts[s.id] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}

/**
 * The owner's control for a blocked source (#35, ADR-0002 point 3): when and why it was blocked,
 * a line to check the site's rules first, and a button that asks once before clearing. Clearing
 * starts no read: the sweep reads the source when it is next due.
 */
function ClearBlock({ source: s, onCleared }: { source: Source; onCleared: () => void }) {
  const [asking, setAsking] = useState(false)
  const [problem, setProblem] = useState('')
  const clear = async () => {
    try {
      await clearBlock(s.id)
      onCleared()
    } catch {
      setProblem('The block could not be cleared. Check that Jill and Seek is running.')
    }
  }
  return (
    <div className="clear-block">
      {s.blockedAt !== null && <p>Blocked since {when(s.blockedAt)}.</p>}
      <p>Check the site's robots rules and terms first: a site's "no" is final.</p>
      {asking ? (
        <p className="clear-block__actions">
          <button type="button" className="button" onClick={clear}>
            Yes, clear the block for {s.name}
          </button>
          <button type="button" className="button button--quiet" onClick={() => setAsking(false)}>
            Keep it blocked
          </button>
        </p>
      ) : (
        <button type="button" className="button button--quiet" onClick={() => setAsking(true)}>
          Clear the block<span className="visually-hidden"> for {s.name}</span>
        </button>
      )}
      {problem && <p role="alert">{problem}</p>}
    </div>
  )
}

function Coverage({ sources: all }: { sources: Source[] }) {
  const sources = all.filter((s) => s.status !== 'retired')
  const automatic = sources.filter((s) => s.access === 'automatic').length
  const blocked = sources.filter((s) => s.status === 'blocked').length
  return (
    <dl className="coverage" aria-label="Coverage">
      <div>
        <dt>Sources</dt>
        <dd>{sources.length}</dd>
      </div>
      <div>
        <dt>Read automatically</dt>
        <dd>{automatic}</dd>
      </div>
      <div>
        <dt>Blocked</dt>
        <dd>{blocked}</dd>
      </div>
    </dl>
  )
}
