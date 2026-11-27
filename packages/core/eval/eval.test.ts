import { describe, expect, it } from 'vitest'
import { Dog } from '../src/dog.ts'
import { Listing } from '../src/listing.ts'
import { distanceKm, TOWNS } from '../src/towns.ts'
import baseline from './baseline.json' with { type: 'json' }
import { DEFAULTS } from './defaults.ts'
import { BREEDS, COATS, generateSet } from './generate.ts'
import { measure, newestFirst } from './measure.ts'

// The synthetic test set (#18). Every dog and listing in it is made up; places are town names
// from the public towns table.

const set = generateSet(DEFAULTS)
const DAY_MS = 24 * 60 * 60 * 1000
type Place = { lat: number | null; lon: number | null }
/** Every record in the set is placed, so a null here would make the distance NaN and fail. */
const km = (a: Place, b: Place) =>
  distanceKm(
    { lat: a.lat ?? Number.NaN, lon: a.lon ?? Number.NaN },
    { lat: b.lat ?? Number.NaN, lon: b.lon ?? Number.NaN },
  )
const dogOf = (id: number) => set.dogs.find((d) => d.id === id) as Dog
const listingOf = (id: number) => set.listings.find((l) => l.id === id) as Listing
const breedOf = (word: string) => Object.keys(BREEDS).find((b) => BREEDS[b]?.includes(word))
const coatOf = (word: string) => Object.keys(COATS).find((c) => COATS[c]?.includes(word))

describe('the generator', () => {
  it('gives the same set for the same seed, and another set for another seed', () => {
    expect(generateSet(DEFAULTS)).toEqual(set)
    expect(generateSet({ ...DEFAULTS, seed: DEFAULTS.seed + 1 }).listings).not.toEqual(set.listings)
  })

  it('makes records that fit the shared schemas, with no place finer than a town', () => {
    const towns = new Set(TOWNS.map((t) => t.name))
    for (const dog of set.dogs) {
      expect(Dog.parse(dog)).toEqual(dog)
      expect(towns.has(dog.lastSeenTown)).toBe(true)
      expect(dog.lastSeenPlace).toBeNull()
    }
    for (const l of set.listings) {
      expect(Listing.parse(l)).toEqual(l)
      expect(l.placePrecision).toBe('town')
      expect(towns.has(l.town as string)).toBe(true)
      expect(l.contact).toBeNull()
    }
  })

  it('gives each dog 0 to 3 true listings, hidden among distractors', () => {
    const counts = set.dogs.map((d) => set.truth.filter((t) => t.dogId === d.id).length)
    expect(Math.min(...counts)).toBe(0)
    expect(Math.max(...counts)).toBe(3)
    expect(set.distractors.length).toBeGreaterThan(set.truth.length * 4)
  })

  it('writes true listings with breed synonyms and mixes that name the same breed', () => {
    const synonyms = set.truth.filter((t) => t.noise.breedSynonym)
    expect(synonyms.length).toBeGreaterThan(set.truth.length / 3)
    for (const t of synonyms) {
      const [dogWord] = dogOf(t.dogId).traits.breeds
      const [postWord] = listingOf(t.listingId).traits.breeds
      expect(postWord).not.toBe(dogWord)
      expect(breedOf(postWord as string)).toBe(breedOf(dogWord as string))
    }
    expect(set.truth.some((t) => listingOf(t.listingId).traits.breeds[0]?.endsWith(' mix'))).toBe(true)
  })

  it('writes true listings with other colour words for the same coat', () => {
    const changed = set.truth.filter((t) => t.noise.colorWord)
    expect(changed.length).toBeGreaterThan(set.truth.length / 4)
    for (const t of changed) {
      const [dogWord] = dogOf(t.dogId).traits.colors
      const [postWord] = listingOf(t.listingId).traits.colors
      expect(postWord).not.toBe(dogWord)
      expect(coatOf(postWord as string)).toBe(coatOf(dogWord as string))
    }
  })

  it('places true listings 0 to 40 km from the last-seen town, and some far ones farther', () => {
    const kms = set.truth.map((t) => km(dogOf(t.dogId), listingOf(t.listingId)))
    expect(Math.max(...kms)).toBeLessThanOrEqual(40)
    expect(kms.some((k) => k === 0)).toBe(true)
    expect(kms.some((k) => k > 20)).toBe(true)
    const far = set.distractors.filter((d) => d.hard === 'far-away')
    expect(far).toHaveLength(set.dogs.length)
    for (const d of far) expect(km(dogOf(d.forDogId as number), listingOf(d.listingId))).toBeGreaterThan(100)
  })

  it('dates true listings 0 to 21 days after the dog was last seen, and hard ones before it', () => {
    const days = set.truth.map(
      (t) => (Date.parse(listingOf(t.listingId).postedAt as string) - Date.parse(dogOf(t.dogId).lastSeenAt)) / DAY_MS,
    )
    expect(Math.min(...days)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...days)).toBeLessThanOrEqual(21)
    expect(days.some((d) => d > 14)).toBe(true)
    for (const d of set.distractors.filter((x) => x.hard === 'before-last-seen')) {
      const dog = dogOf(d.forDogId as number)
      const post = listingOf(d.listingId)
      expect((post.postedAt as string) < dog.lastSeenAt).toBe(true)
      expect(km(dog, post)).toBeLessThanOrEqual(10)
    }
  })

  it('leaves sex and age unknown or wrong on some true listings, and writes found posts and sightings', () => {
    const sexes = new Set(set.truth.map((t) => t.noise.sex))
    const ages = new Set(set.truth.map((t) => t.noise.age))
    expect([...sexes].sort()).toEqual(['same', 'unknown', 'wrong'])
    expect([...ages].sort()).toEqual(['same', 'unknown', 'wrong'])
    const kinds = new Set(set.truth.map((t) => listingOf(t.listingId).kind))
    expect(kinds.has('found') && kinds.has('sighting')).toBe(true)
  })
})

describe('the measure', () => {
  it('scores a perfect matcher at full recall and rank 1, and a reversed one worse', () => {
    const perfect = measure(set, (dog, listings) => {
      const wanted = new Set(set.truth.filter((t) => t.dogId === dog.id).map((t) => t.listingId))
      return [...listings].sort((a, b) => Number(wanted.has(b.id)) - Number(wanted.has(a.id))).map((l) => l.id)
    })
    expect(perfect).toMatchObject({ recallAt5: 1, recallAt20: 1 })
    expect(perfect.medianRank).toBeLessThanOrEqual(2)
    const reversed = measure(set, (dog, listings) => newestFirst(dog, listings).reverse())
    expect(reversed.recallAt20).toBeLessThan(1)
  })

  it('keeps baseline.json equal to the newest-first figures for the default set', () => {
    expect(baseline).toEqual({ matcher: 'newest-first', ...measure(set, newestFirst) })
  })
})
