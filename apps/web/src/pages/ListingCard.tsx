import type { Listing } from '@jillandseek/core'
import type { ReactNode } from 'react'

export const KIND_WORDS: Record<Listing['kind'], string> = {
  'shelter-stray': 'Shelter stray',
  found: 'Found',
  lost: 'Lost',
  sighting: 'Sighting',
  unknown: 'Unknown kind',
}

const day = (moment: string) => moment.slice(0, 10)
const known = (value: string) => (value === 'unknown' ? null : value)

/**
 * One listing: its photo from the source, what it says, where and when, and the original post.
 * `children` go above the facts: the dog page puts a match's band and reasons there.
 */
export function ListingCard({
  listing: l,
  sourceName,
  children,
}: {
  listing: Listing
  sourceName: string
  children?: ReactNode
}) {
  const photo = l.photoUrls[0]
  const place = [l.placeText, l.town, l.county && `${l.county} County`].filter(Boolean)
  const traits = [known(l.traits.size), known(l.traits.sex), known(l.traits.age)].filter(Boolean)
  return (
    <li className="listing-card">
      <div className="listing-card__photo">
        {photo ? (
          <img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer" width="160" height="160" />
        ) : (
          <span className="listing-card__no-photo">No photo</span>
        )}
      </div>
      <div className="listing-card__body">
        <p className="listing-card__kind">
          <strong>{KIND_WORDS[l.kind]}</strong>
          {l.goneAt !== null && <span className="listing-card__gone"> · gone since {day(l.goneAt)}</span>}
        </p>
        {children}
        <dl className="listing-card__facts">
          <dt>Breed</dt>
          <dd>{l.traits.breeds.length > 0 ? l.traits.breeds.join(', ') : 'Not given'}</dd>
          <dt>Colour</dt>
          <dd>{l.traits.colors.length > 0 ? l.traits.colors.join(', ') : 'Not given'}</dd>
          <dt>Size, sex, age</dt>
          <dd>{traits.length > 0 ? traits.join(', ') : 'Not given'}</dd>
          <dt>Place</dt>
          <dd>{place.length > 0 ? place.join(' · ') : 'Not given'}</dd>
          <dt>Date</dt>
          <dd>
            {l.postedAt !== null ? `Posted ${day(l.postedAt)}` : 'Posting date not given'} · first seen{' '}
            {day(l.firstSeenAt)}
          </dd>
        </dl>
        <p className="listing-card__source">
          {sourceName} ·{' '}
          <a href={l.url} rel="noreferrer noopener" target="_blank" referrerPolicy="no-referrer">
            Open the original post<span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </li>
  )
}
