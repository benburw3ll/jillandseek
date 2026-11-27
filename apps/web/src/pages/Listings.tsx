import type { Listing, Page } from '@jillandseek/core'
import { fetchListings } from '../api/listings.ts'
import { useLoad } from '../useLoad.ts'

const KIND_WORDS: Record<Listing['kind'], string> = {
  'shelter-stray': 'Shelter stray',
  found: 'Found',
  lost: 'Lost',
  sighting: 'Sighting',
  unknown: 'Unknown kind',
}

const day = (moment: string) => moment.slice(0, 10)

/** Every collected listing, newest first. O3 (#16) adds the cards, filters and paging. */
export function Listings() {
  const load = useLoad<Page<Listing>>((signal) => fetchListings({}, signal))
  return (
    <>
      <h1>Listings</h1>
      {load.state === 'loading' && <p aria-busy="true">Loading listings…</p>}
      {load.state === 'error' && (
        <p role="alert">The listings could not be loaded. Check that Jill and Seek's server is running.</p>
      )}
      {load.state === 'ready' && load.data.items.length === 0 && (
        <div className="empty">
          <p>No listings yet.</p>
          <p>
            Listings appear after the first sweep, when Jill and Seek reads the sources it is allowed to read: shelter
            stray lists, found dogs, lost dogs and sightings.
          </p>
        </div>
      )}
      {load.state === 'ready' && load.data.items.length > 0 && (
        <ul className="list">
          {load.data.items.map((l) => (
            <li key={l.id} className="list__item">
              <strong>{KIND_WORDS[l.kind]}</strong>
              <span>{l.town ?? l.placeText ?? 'Place unknown'}</span>
              <span>First seen {day(l.firstSeenAt)}</span>
              <a href={l.url} rel="noreferrer noopener" target="_blank">
                Open the original post<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
