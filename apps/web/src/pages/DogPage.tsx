import type { Band, Dog, Listing, Match } from '@jillandseek/core'
import { useEffect, useState } from 'react'
import { Link } from 'wouter'
import { fetchDog, updateDog } from '../api/dogs.ts'
import { type DogMatches, fetchMatches, rerunMatches } from '../api/matches.ts'
import { fetchSources } from '../api/sources.ts'
import { useLoad } from '../useLoad.ts'
import { ListingCard } from './ListingCard.tsx'
import './sources-pages.css'
import './dog-page.css'

// The dog page (#20): one dog, every listing ranked against it, and why each one is there. A
// match is a ranking, never an identification (ADR-0001 point 3): each card shows a band and
// its reasons, never a score or a percent. Set-aside listings stay on the page, collapsed.

const BAND_WORDS: Record<Band, string> = { strong: 'Strong', possible: 'Possible', weak: 'Weak' }

const day = (moment: string) => moment.slice(0, 10)
const when = (moment: string) => new Date(moment).toLocaleString()

/** The browser keeps the owner's last visit to each dog's page, and nothing else. */
const visitKey = (id: number) => `jillandseek:dog-visit:${id}`
function readVisit(id: number): string | null {
  try {
    return window.localStorage.getItem(visitKey(id))
  } catch {
    return null
  }
}
function writeVisit(id: number, at: string): void {
  try {
    window.localStorage.setItem(visitKey(id), at)
  } catch {
    // A browser that keeps nothing shows no "new" markers.
  }
}

type Data = { dog: Dog; matches: DogMatches; names: Record<string, string> }

async function loadAll(id: number, signal: AbortSignal): Promise<Data> {
  const [dog, matches, sources] = await Promise.all([
    fetchDog(id, signal),
    fetchMatches(id, signal),
    fetchSources(signal).catch(() => ({ items: [], listingCounts: {} })),
  ])
  return { dog, matches, names: Object.fromEntries(sources.items.map((s) => [s.id, s.name])) }
}

function MatchCard({
  match,
  listing,
  sourceName,
  isNew,
}: {
  match: Match
  listing: Listing
  sourceName: string
  isNew: boolean
}) {
  return (
    <ListingCard listing={listing} sourceName={sourceName}>
      <p className="match__band">
        <span className={`band band--${match.band}`}>{BAND_WORDS[match.band]}</span>
        {isNew && <span className="match__new">New since your last visit</span>}
      </p>
      <ul className="match__reasons" aria-label="Why it is here">
        {match.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </ListingCard>
  )
}

export function DogPage({ id }: { id: number }) {
  const load = useLoad((signal) => loadAll(id, signal))
  const [dog, setDog] = useState<Dog | null>(null)
  const [matches, setMatches] = useState<DogMatches | null>(null)
  const [message, setMessage] = useState('')
  const [running, setRunning] = useState(false)
  // The visit before this one, read once; this visit is kept for next time.
  const [lastVisit] = useState(() => readVisit(id))
  useEffect(() => writeVisit(id, new Date().toISOString()), [id])

  const data = load.state === 'ready' ? load.data : null
  const shownDog = dog ?? data?.dog ?? null
  const shown = matches ?? data?.matches ?? null
  const names = data?.names ?? {}

  const rerun = async () => {
    setRunning(true)
    try {
      setMatches(await rerunMatches(id))
      setMessage('Matching ran again.')
    } catch {
      setMessage('Matching could not run. Check that Jill and Seek is running.')
    } finally {
      setRunning(false)
    }
  }

  const mark = async (status: Dog['status']) => {
    try {
      setDog(await updateDog(id, { status }))
      setMessage(status === 'found' ? 'Marked found.' : 'Marked missing again.')
      // Saving a missing dog re-runs matching on the server: show what it found.
      if (status === 'missing') setMatches(await fetchMatches(id))
    } catch {
      setMessage('That could not be saved. Check that Jill and Seek is running.')
    }
  }

  if (load.state === 'loading') return <p aria-busy="true">Loading the dog and its listings…</p>
  if (load.state === 'error' || shownDog === null || shown === null) {
    return (
      <>
        <h1>A missing dog</h1>
        <p role="alert">This dog and its listings could not be loaded. Check that Jill and Seek's server is running.</p>
        <p>
          <Link href="/find">Back to your dogs</Link>
        </p>
      </>
    )
  }

  const name = shownDog.label ?? `Dog ${shownDog.id}`
  const t = shownDog.traits
  const traits = [t.breeds.join(', '), t.colors.join(', '), t.size, t.sex, t.age].filter((v) => v && v !== 'unknown')
  const ranked = shown.items.filter((i) => i.match.setAsideReason === null)
  const setAside = shown.items.filter((i) => i.match.setAsideReason !== null)
  const isNew = (l: Listing) => lastVisit !== null && l.firstSeenAt > lastVisit

  return (
    <>
      <h1>{name}</h1>
      <section className="dog-summary" aria-label="The dog">
        <p>
          <strong>{shownDog.status === 'found' ? 'Found' : 'Missing'}</strong> · last seen in {shownDog.lastSeenTown},{' '}
          {day(shownDog.lastSeenAt)}
        </p>
        {traits.length > 0 && <p>{traits.join(' · ')}</p>}
        <p className="dog-summary__actions">
          <Link href={`/find/${shownDog.id}`}>
            Edit<span className="visually-hidden"> {name}</span>
          </Link>
          {shownDog.status === 'missing' ? (
            <button type="button" className="button button--quiet" onClick={() => mark('found')}>
              Mark found
            </button>
          ) : (
            <button type="button" className="button button--quiet" onClick={() => mark('missing')}>
              Mark missing again
            </button>
          )}
        </p>
      </section>

      <p className="note standing-note">
        A ranking is not an identification. Go and see any dog that might be yours, in person.
      </p>

      <div className="rerun">
        <button type="button" className="button" onClick={rerun} disabled={running}>
          {running ? 'Running…' : 'Re-run matching now'}
        </button>
        <span>{shown.ranAt !== null ? `Matching last ran ${when(shown.ranAt)}` : 'Matching has not run yet'}</span>
      </div>
      <p className="status" role="status">
        {message}
      </p>

      {shown.items.length === 0 ? (
        <div className="empty">
          <p>No listings yet. The sweep runs every 30 minutes.</p>
        </div>
      ) : (
        <>
          <h2 className="section-title">Ranked listings ({ranked.length})</h2>
          {ranked.length === 0 ? (
            <p>Every listing so far is set aside below.</p>
          ) : (
            <ol className="listing-cards">
              {ranked.map(({ match, listing }) => (
                <MatchCard
                  key={listing.id}
                  match={match}
                  listing={listing}
                  sourceName={names[listing.sourceId] ?? listing.sourceId}
                  isNew={isNew(listing)}
                />
              ))}
            </ol>
          )}
          {setAside.length > 0 && (
            <details className="set-aside">
              <summary>Set aside ({setAside.length}): each has a hard contradiction, and is still shown here</summary>
              <ol className="listing-cards">
                {setAside.map(({ match, listing }) => (
                  <MatchCard
                    key={listing.id}
                    match={match}
                    listing={listing}
                    sourceName={names[listing.sourceId] ?? listing.sourceId}
                    isNew={isNew(listing)}
                  />
                ))}
              </ol>
            </details>
          )}
        </>
      )}
    </>
  )
}
