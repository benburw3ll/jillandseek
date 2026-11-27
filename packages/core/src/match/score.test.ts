import { describe, expect, it } from 'vitest'
import type { Dog } from '../dog.ts'
import type { Listing } from '../listing.ts'
import { type Age, type Sex, type Size, unknownTraits } from '../traits.ts'
import { rankScored, scoreListing } from './score.ts'
import { readBreeds, readColors } from './words.ts'

// A made-up dog and made-up listings at lat 0, lon 0. Nothing here is a real dog, post or place.

const NOW = '2026-03-01T12:00:00.000Z'
const LAST_SEEN = '2026-02-20T12:00:00.000Z'

const dog: Dog = {
  id: 1,
  label: 'Zorbulon',
  lastSeenAt: LAST_SEEN,
  lastSeenTown: 'Example Town',
  lastSeenPlace: null,
  lat: 0,
  lon: 0,
  placePrecision: 'town',
  traits: { breeds: ['labrador'], colors: ['yellow'], size: 'large', sex: 'female', age: 'adult' },
  marks: null,
  notes: null,
  photos: [],
  status: 'missing',
  foundAt: null,
  createdAt: LAST_SEEN,
  updatedAt: LAST_SEEN,
}

function listing(over: Partial<Listing> = {}): Listing {
  return {
    id: 10,
    sourceId: 'example-portal',
    sourceKey: 'ex-1',
    url: 'https://listings.example/ex-1',
    kind: 'found',
    species: 'dog',
    postedAt: '2026-02-22T12:00:00.000Z',
    placeText: null,
    town: null,
    county: null,
    // About 3 km north of the dog's last-seen place.
    lat: 0.027,
    lon: 0,
    placePrecision: 'point',
    traits: { breeds: ['lab mix'], colors: ['tan'], size: 'large', sex: 'female', age: 'adult' },
    text: null,
    photoUrls: [],
    contact: null,
    firstSeenAt: '2026-02-22T13:00:00.000Z',
    lastSeenAt: '2026-02-28T13:00:00.000Z',
    goneAt: null,
    ...over,
  }
}

const withTraits = (t: Partial<Listing['traits']>) => listing({ traits: { ...listing().traits, ...t } })

describe('scoreListing', () => {
  it('ranks a close, recent listing of the same breed and colour strong, with plain reasons', () => {
    const s = scoreListing(dog, listing(), NOW)
    expect(s.setAside).toBeNull()
    expect(s.band).toBe('strong')
    expect(s.reasons).toContain('Found 3 km from where she was last seen')
    expect(s.reasons).toContain('Breed: lab mix, close to Labrador')
    expect(s.reasons).toContain('Colour: tan, close to yellow')
  })

  it('scores lower as the listing is farther away and later', () => {
    const near = scoreListing(dog, listing(), NOW).score
    const far = scoreListing(dog, listing({ lat: 0.9 }), NOW).score
    const late = scoreListing(dog, listing({ postedAt: '2026-04-20T12:00:00.000Z' }), NOW).score
    expect(far).toBeLessThan(near)
    expect(late).toBeLessThan(near)
  })

  it('sets aside a listing dated before the dog went missing, with its reason', () => {
    const s = scoreListing(dog, listing({ postedAt: '2026-02-10T12:00:00.000Z' }), NOW)
    expect(s.setAside).toBe('before-missing')
    expect(s.band).toBe('weak')
    expect(s.reasons[0]).toBe('Set aside: dated 10 days before she was last seen')
  })

  it('does not set aside a post dated hours before the last-seen time (dates are often day-only)', () => {
    expect(scoreListing(dog, listing({ postedAt: '2026-02-20T00:00:00.000Z' }), NOW).setAside).toBeNull()
  })

  it('sets aside a listing that is not a dog, a lost post and one long gone from its source, each with a reason', () => {
    const notDog = scoreListing(dog, listing({ species: 'other' }), NOW)
    expect(notDog.setAside).toBe('not-a-dog')
    const lost = scoreListing(dog, listing({ kind: 'lost' }), NOW)
    expect(lost.setAside).toBe('lost-post')
    const gone = scoreListing(dog, listing({ goneAt: '2026-02-21T12:00:00.000Z' }), NOW)
    expect(gone.setAside).toBe('long-gone')
    const goneLately = scoreListing(dog, listing({ goneAt: '2026-02-28T12:00:00.000Z' }), NOW)
    expect(goneLately.setAside).toBeNull()
    for (const s of [notDog, lost, gone]) expect(s.reasons[0]).toMatch(/^Set aside: /)
  })

  it.each(['size', 'sex', 'age'] as const)('never lowers a score when the %s is unknown', (trait) => {
    const values: Record<typeof trait, readonly string[]> = {
      size: ['small', 'medium', 'large'] satisfies Size[],
      sex: ['male', 'female'] satisfies Sex[],
      age: ['puppy', 'young', 'adult', 'senior'] satisfies Age[],
    }
    const unknown = scoreListing(dog, withTraits({ [trait]: 'unknown' }), NOW).score
    for (const v of values[trait]) {
      // The same as a wrong value or better, never worse.
      const known = scoreListing(dog, withTraits({ [trait]: v }), NOW).score
      if (v === dog.traits[trait]) expect(known).toBeGreaterThan(unknown)
      else expect(unknown).toBeGreaterThanOrEqual(known)
    }
    // Unknown on the dog's side too: the same as not comparing it at all.
    const dogUnknown = { ...dog, traits: { ...dog.traits, [trait]: 'unknown' } }
    for (const v of values[trait]) {
      expect(scoreListing(dogUnknown, withTraits({ [trait]: v }), NOW).score).toBe(unknown)
    }
  })

  it('never lowers a score when the breed, colour or place is unknown', () => {
    const wrongBreed = scoreListing(dog, withTraits({ breeds: ['beagle'] }), NOW).score
    const wrongColor = scoreListing(dog, withTraits({ colors: ['black'] }), NOW).score
    expect(scoreListing(dog, withTraits({ breeds: [] }), NOW).score).toBeGreaterThan(wrongBreed)
    expect(scoreListing(dog, withTraits({ breeds: ['zorbulon hound'] }), NOW).score).toBeGreaterThan(wrongBreed)
    expect(scoreListing(dog, withTraits({ colors: [] }), NOW).score).toBeGreaterThan(wrongColor)
    const farAway = scoreListing(dog, listing({ lat: 3 }), NOW).score
    const unplaced = scoreListing(dog, listing({ lat: null, lon: null, placePrecision: 'unknown' }), NOW).score
    expect(unplaced).toBeGreaterThanOrEqual(farAway)
  })

  it('gives every match at least one reason, also one with nothing known', () => {
    const bare = listing({
      kind: 'unknown',
      species: 'unknown',
      postedAt: null,
      lat: null,
      lon: null,
      placePrecision: 'unknown',
      traits: unknownTraits(),
    })
    const unknownDog = { ...dog, lat: null, lon: null, placePrecision: 'unknown' as const, traits: unknownTraits() }
    for (const [d, l] of [
      [dog, listing()],
      [dog, bare],
      [unknownDog, bare],
      [unknownDog, listing({ kind: 'lost' })],
    ] as const) {
      const s = scoreListing(d, l, NOW)
      expect(s.reasons.length).toBeGreaterThan(0)
      for (const r of s.reasons) expect(r.length).toBeGreaterThan(0)
    }
  })

  it('never words a reason as an identification, a percent or a score', () => {
    const cases = [listing(), listing({ kind: 'lost' }), withTraits({ sex: 'male', breeds: ['beagle'] })]
    for (const l of cases) {
      for (const r of scoreListing(dog, l, NOW).reasons) {
        expect(r).not.toMatch(/%|identif|your dog|is (?:she|he|the dog)\b|score|match found/i)
      }
    }
  })

  it('is pure: the same inputs give the same result', () => {
    expect(scoreListing(dog, listing(), NOW)).toEqual(scoreListing(dog, listing(), NOW))
  })
})

describe('rankScored', () => {
  it('puts set-aside matches after the rest, and keeps them', () => {
    const ranked = rankScored([
      { listingId: 1, score: 0.9, setAside: 'lost-post' as const },
      { listingId: 2, score: 0.2, setAside: null },
      { listingId: 3, score: 0.5, setAside: null },
    ])
    expect(ranked.map((r) => r.listingId)).toEqual([3, 2, 1])
  })
})

describe('the word tables', () => {
  it('reads breed synonyms and mixes into families', () => {
    expect([...readBreeds(['lab mix']).families]).toEqual(['Labrador'])
    expect(readBreeds(['lab mix']).mix).toBe(true)
    expect(readBreeds(['GSD']).families.has('German Shepherd')).toBe(true)
    expect(readBreeds(['husky/shepherd']).families).toEqual(new Set(['Husky', 'German Shepherd']))
    expect(readBreeds(['zorbulon hound']).families.size).toBe(0)
  })

  it('reads colour words into families', () => {
    expect(readColors(['fawn']).has('yellow')).toBe(true)
    expect(readColors(['black and white'])).toEqual(new Set(['black', 'white']))
    expect(readColors(['black & tan']).has('black and tan')).toBe(true)
    expect(readColors(['teal']).size).toBe(0)
  })
})
