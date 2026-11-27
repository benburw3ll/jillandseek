import { type Listing, ListingKind, type ListingQueryInput } from '@jillandseek/core'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useLocation, useSearch } from 'wouter'
import { fetchListings } from '../api/listings.ts'
import { fetchSources } from '../api/sources.ts'
import { KIND_WORDS, ListingCard } from './ListingCard.tsx'
import './sources-pages.css'

// Every collected listing, newest first, with filters kept in the URL (so a filtered view can be
// bookmarked or reloaded) and cursor paging.

type Filters = { kind: string; town: string; county: string; from: string; to: string; gone: boolean }

const DATE = /^\d{4}-\d{2}-\d{2}$/

function readFilters(search: string): Filters {
  const p = new URLSearchParams(search)
  return {
    kind: ListingKind.safeParse(p.get('kind')).success ? (p.get('kind') ?? '') : '',
    town: p.get('town') ?? '',
    county: p.get('county') ?? '',
    from: DATE.test(p.get('from') ?? '') ? (p.get('from') ?? '') : '',
    to: DATE.test(p.get('to') ?? '') ? (p.get('to') ?? '') : '',
    gone: p.get('gone') === 'shown',
  }
}

function writeFilters(f: Filters): string {
  const p = new URLSearchParams()
  if (f.kind) p.set('kind', f.kind)
  if (f.town.trim()) p.set('town', f.town.trim())
  if (f.county.trim()) p.set('county', f.county.trim())
  if (f.from) p.set('from', f.from)
  if (f.to) p.set('to', f.to)
  if (f.gone) p.set('gone', 'shown')
  const s = p.toString()
  return s ? `?${s}` : ''
}

function toQuery(f: Filters, cursor?: string): ListingQueryInput {
  const nextDay = (d: string) => new Date(Date.parse(`${d}T00:00:00.000Z`) + 86_400_000).toISOString()
  return {
    ...(f.kind && { kind: f.kind as Listing['kind'] }),
    ...(f.town && { town: f.town }),
    ...(f.county && { county: f.county }),
    ...(f.from && { since: `${f.from}T00:00:00.000Z` }),
    ...(f.to && { until: nextDay(f.to) }),
    ...(f.gone && { includeGone: true }),
    ...(cursor && { cursor }),
  }
}

type State =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; items: Listing[]; nextCursor: string | null; more: 'idle' | 'loading' | 'error' }

export function Listings() {
  const search = useSearch()
  const [, navigate] = useLocation()
  const filters = readFilters(search)
  const [draft, setDraft] = useState(filters)
  const [load, setLoad] = useState<State>({ state: 'loading' })
  const [names, setNames] = useState<Record<string, string>>({})
  // A 'show more' still loading when the filters change is dropped, so its page never lands on them.
  const more = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setDraft(readFilters(search))
    setLoad({ state: 'loading' })
    fetchListings(toQuery(readFilters(search)), controller.signal).then(
      (page) => setLoad({ state: 'ready', items: page.items, nextCursor: page.nextCursor, more: 'idle' }),
      () => {
        if (!controller.signal.aborted) setLoad({ state: 'error' })
      },
    )
    return () => {
      controller.abort()
      more.current?.abort()
    }
  }, [search])

  useEffect(() => {
    const controller = new AbortController()
    fetchSources(controller.signal).then(
      (list) => setNames(Object.fromEntries(list.items.map((s) => [s.id, s.name]))),
      () => {}, // the cards fall back to the source id
    )
    return () => controller.abort()
  }, [])

  const apply = (next: Filters) => navigate(`/listings${writeFilters(next)}`)
  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    apply(draft)
  }

  const loadMore = () => {
    if (load.state !== 'ready' || load.nextCursor === null) return
    const controller = new AbortController()
    more.current = controller
    setLoad({ ...load, more: 'loading' })
    fetchListings(toQuery(filters, load.nextCursor), controller.signal).then(
      (page) => {
        if (controller.signal.aborted) return
        setLoad({ state: 'ready', items: [...load.items, ...page.items], nextCursor: page.nextCursor, more: 'idle' })
      },
      () => {
        if (!controller.signal.aborted) setLoad({ ...load, more: 'error' })
      },
    )
  }

  const filtered = search !== ''
  return (
    <>
      <h1>Listings</h1>
      <form className="filters" onSubmit={onSubmit} aria-label="Filter the listings">
        <label>
          Kind
          <select value={draft.kind} onChange={(e) => apply({ ...draft, kind: e.currentTarget.value })}>
            <option value="">Every kind</option>
            {ListingKind.options.map((k) => (
              <option key={k} value={k}>
                {KIND_WORDS[k]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Town
          <input value={draft.town} onChange={(e) => setDraft({ ...draft, town: e.currentTarget.value })} />
        </label>
        <label>
          County
          <input value={draft.county} onChange={(e) => setDraft({ ...draft, county: e.currentTarget.value })} />
        </label>
        <label>
          First seen from
          <input type="date" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.currentTarget.value })} />
        </label>
        <label>
          to
          <input type="date" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.currentTarget.value })} />
        </label>
        <label className="filters__check">
          <input
            type="checkbox"
            checked={draft.gone}
            onChange={(e) => apply({ ...draft, gone: e.currentTarget.checked })}
          />
          Show gone listings
        </label>
        <div className="filters__actions">
          <button type="submit" className="button">
            Apply
          </button>
          {filtered && (
            <button type="button" className="link-button" onClick={() => navigate('/listings')}>
              Clear filters
            </button>
          )}
        </div>
      </form>

      {load.state === 'loading' && <p aria-busy="true">Loading listings…</p>}
      {load.state === 'error' && (
        <p role="alert">The listings could not be loaded. Check that Jill and Seek's server is running.</p>
      )}
      {load.state === 'ready' && load.items.length === 0 && (
        <div className="empty">
          {filtered ? (
            <p>No listings match these filters.</p>
          ) : (
            <>
              <p>No listings yet.</p>
              <p>
                Listings appear after the first sweep, when Jill and Seek reads the sources it is allowed to read:
                shelter stray lists, found dogs, lost dogs and sightings.
              </p>
            </>
          )}
        </div>
      )}
      {load.state === 'ready' && load.items.length > 0 && (
        <>
          <ul className="listing-cards">
            {load.items.map((l) => (
              <ListingCard key={l.id} listing={l} sourceName={names[l.sourceId] ?? l.sourceId} />
            ))}
          </ul>
          {load.nextCursor !== null && (
            <p>
              <button type="button" className="button" onClick={loadMore} disabled={load.more === 'loading'}>
                {load.more === 'loading' ? 'Loading…' : 'Show more listings'}
              </button>
            </p>
          )}
          {load.more === 'error' && <p role="alert">More listings could not be loaded. Try again.</p>}
        </>
      )}
    </>
  )
}
