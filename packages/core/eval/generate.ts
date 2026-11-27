import type { Dog } from '../src/dog.ts'
import type { ListingKind } from '../src/kinds.ts'
import type { Listing } from '../src/listing.ts'
import { distanceKm, TOWNS, type Town } from '../src/towns.ts'
import type { Age, Sex, Size, Traits } from '../src/traits.ts'

// A synthetic test set that measures matching (#18). A seed gives N missing dogs, each with 0 to
// 3 true listings carrying the noise real posts carry, hidden among distractors, some of them
// hard. Everything is made up and generated at run time: no real dog, no person's name, and no
// place finer than a town (the public towns table). Pure: the seed and the time are arguments.

const DAY_MS = 24 * 60 * 60 * 1000

/** A small, fast seeded generator (mulberry32): the same seed always gives the same numbers. */
export function rng(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))
  const pick = <T>(list: readonly T[]): T => list[Math.floor(next() * list.length)] as T
  const chance = (p: number) => next() < p
  return { next, int, pick, chance }
}
type Rng = ReturnType<typeof rng>

/** Breeds, each with the words posts use for it: the first is the plain name. */
export const BREEDS: Record<string, readonly string[]> = {
  labrador: ['labrador retriever', 'lab', 'labrador', 'lab mix', 'lab cross'],
  'german shepherd': ['german shepherd', 'shepherd', 'gsd', 'shepherd mix', 'german shepard'],
  'golden retriever': ['golden retriever', 'golden', 'retriever', 'golden mix'],
  husky: ['siberian husky', 'husky', 'husky mix', 'sibe'],
  beagle: ['beagle', 'beagle mix', 'hound'],
  chihuahua: ['chihuahua', 'chi', 'chihuahua mix', 'chi mix'],
  'pit bull': ['pit bull', 'pitbull', 'pittie', 'pit mix', 'american pit bull terrier'],
  poodle: ['poodle', 'poodle mix', 'doodle', 'goldendoodle'],
  'border collie': ['border collie', 'collie', 'collie mix'],
  dachshund: ['dachshund', 'doxie', 'wiener dog', 'dachshund mix'],
}

/** Coats, each with the colour words posts use for the same coat. */
export const COATS: Record<string, readonly string[]> = {
  yellow: ['yellow', 'tan', 'fawn', 'red', 'gold', 'blonde'],
  black: ['black', 'dark', 'black and white'],
  brown: ['brown', 'chocolate', 'liver', 'dark brown'],
  'black and tan': ['black and tan', 'tricolor', 'tri', 'black tan'],
  white: ['white', 'cream', 'off white'],
  grey: ['grey', 'gray', 'silver', 'blue'],
  brindle: ['brindle', 'striped', 'tiger'],
}

const SIZES: readonly Size[] = ['small', 'medium', 'large']
const SEXES: readonly Sex[] = ['male', 'female']
const AGES: readonly Age[] = ['puppy', 'young', 'adult', 'senior']
const WRONG_SEX: Record<Sex, Sex> = { male: 'female', female: 'male', unknown: 'unknown' }
const WRONG_AGE: Record<Age, Age> = {
  puppy: 'young',
  young: 'adult',
  adult: 'senior',
  senior: 'adult',
  unknown: 'unknown',
}

/** What noise a true listing carries, so tests can see each kind is there. */
export type Noise = {
  /** The breed word differs from the dog's but names the same breed. */
  breedSynonym: boolean
  /** The colour word differs from the dog's but names the same coat. */
  colorWord: boolean
  sex: 'same' | 'unknown' | 'wrong'
  age: 'same' | 'unknown' | 'wrong'
  /** From the dog's town to the listing's, in kilometres. */
  km: number
  /** From the dog's last-seen time to the post, in days. */
  days: number
}

export type TrueListing = { dogId: number; listingId: number; noise: Noise }
export type Distractor = { listingId: number; hard: 'far-away' | 'before-last-seen' | null; forDogId: number | null }

export type EvalSet = {
  seed: number
  dogs: Dog[]
  listings: Listing[]
  truth: TrueListing[]
  distractors: Distractor[]
}

export type EvalOptions = {
  seed: number
  /** How many missing dogs. */
  dogs: number
  /** The set's "now": every dog was last seen before it and every post is at or before it. */
  now: string
  /** Plain distractors per dog, besides the two hard ones. */
  distractorsPerDog?: number
}

const iso = (ms: number) => new Date(ms).toISOString()

/** Towns within `maxKm` of `from` (and at least `minKm`). */
function townsBetween(from: Town, minKm: number, maxKm: number): Town[] {
  return TOWNS.filter((t) => {
    const d = distanceKm(from, t)
    return d >= minKm && d <= maxKm
  })
}

function breedWordFor(r: Rng, breed: string, notWord?: string): string {
  const words = BREEDS[breed] ?? [breed]
  const others = words.filter((w) => w !== notWord)
  return r.pick(others.length > 0 ? others : words)
}

/** Generates the set for a seed. The same options always give the same set. */
export function generateSet(options: EvalOptions): EvalSet {
  const r = rng(options.seed)
  const nowMs = Date.parse(options.now)
  if (Number.isNaN(nowMs)) throw new Error('now is not a moment')
  const breedNames = Object.keys(BREEDS)
  const coatNames = Object.keys(COATS)
  const perDog = options.distractorsPerDog ?? 8

  type Draft = Omit<Listing, 'id'> & { tag: { kind: 'true'; dogIndex: number; noise: Noise } | Distractor }
  const drafts: Draft[] = []
  const dogs: Dog[] = []

  const listing = (
    town: Town,
    atMs: number,
    kind: ListingKind,
    traits: Traits,
    text: string,
    tag: Draft['tag'],
  ): Draft => {
    const n = drafts.length + 1
    const postedAt = iso(Math.min(atMs, nowMs))
    const seenAt = iso(Math.min(atMs + r.int(0, 12) * 60 * 60 * 1000, nowMs))
    return {
      sourceId: 'eval-synthetic',
      sourceKey: `eval-${options.seed}-${n}`,
      url: `https://listings.example/eval/${options.seed}/${n}`,
      kind,
      species: 'dog',
      postedAt,
      placeText: town.name,
      town: town.name,
      county: null,
      lat: town.lat,
      lon: town.lon,
      placePrecision: 'town',
      traits,
      text,
      photoUrls: [],
      contact: null,
      firstSeenAt: seenAt,
      lastSeenAt: seenAt,
      goneAt: null,
      tag,
    }
  }

  for (let i = 0; i < options.dogs; i++) {
    const id = i + 1
    const town = r.pick(TOWNS)
    const breed = r.pick(breedNames)
    const coat = r.pick(coatNames)
    const breedWord = breedWordFor(r, breed)
    const colorWord = r.pick(COATS[coat] ?? [coat])
    const traits: Traits = {
      breeds: [breedWord],
      colors: [colorWord],
      size: r.pick(SIZES),
      sex: r.pick(SEXES),
      age: r.pick(AGES),
    }
    // Last seen 21 to 60 days before now, so every true post (0 to 21 days later) is in the past.
    const seenMs = nowMs - r.int(21 * 24, 60 * 24) * 60 * 60 * 1000
    dogs.push({
      id,
      label: `Eval dog ${id}`,
      lastSeenAt: iso(seenMs),
      lastSeenTown: town.name,
      lastSeenPlace: null,
      lat: town.lat,
      lon: town.lon,
      placePrecision: 'town',
      traits,
      marks: null,
      notes: null,
      photos: [],
      status: 'missing',
      foundAt: null,
      createdAt: iso(seenMs + 60 * 60 * 1000),
      updatedAt: iso(seenMs + 60 * 60 * 1000),
    })

    // 0 to 3 true listings, each with its own noise.
    const trueCount = r.int(0, 3)
    const near = townsBetween(town, 0, 40)
    for (let k = 0; k < trueCount; k++) {
      const there = r.pick(near)
      const days = r.next() * 21
      const breedSynonym = r.chance(0.6)
      const word = breedSynonym ? breedWordFor(r, breed, breedWord) : breedWord
      const colorChanged = r.chance(0.5)
      const coatWords = COATS[coat] ?? [coat]
      const color = colorChanged ? r.pick(coatWords.filter((w) => w !== colorWord)) : colorWord
      const sexRoll = r.next()
      const sex: Noise['sex'] = sexRoll < 0.55 ? 'same' : sexRoll < 0.9 ? 'unknown' : 'wrong'
      const ageRoll = r.next()
      const age: Noise['age'] = ageRoll < 0.4 ? 'same' : ageRoll < 0.85 ? 'unknown' : 'wrong'
      const kind: ListingKind = r.pick(['found', 'sighting', 'shelter-stray'] as const)
      const t: Traits = {
        breeds: [word],
        colors: [color],
        size: r.chance(0.7) ? traits.size : 'unknown',
        sex: sex === 'same' ? traits.sex : sex === 'unknown' ? 'unknown' : WRONG_SEX[traits.sex],
        age: age === 'same' ? traits.age : age === 'unknown' ? 'unknown' : WRONG_AGE[traits.age],
      }
      const noise: Noise = {
        breedSynonym: word !== breedWord,
        colorWord: color !== colorWord,
        sex,
        age,
        km: distanceKm(town, there),
        days,
      }
      const text = kind === 'sighting' ? `Seen running loose: ${color} ${word}.` : `Found: ${color} ${word}.`
      drafts.push(listing(there, seenMs + days * DAY_MS, kind, t, text, { kind: 'true', dogIndex: i, noise }))
    }

    // Two hard distractors: the same breed far away, and the right place before the dog went missing.
    const far = townsBetween(town, 150, 10_000)
    const farTown = r.pick(far.length > 0 ? far : TOWNS)
    const sameBreed: Traits = { ...traits, breeds: [breedWordFor(r, breed)], sex: 'unknown', age: 'unknown' }
    drafts.push(
      listing(farTown, seenMs + r.next() * 21 * DAY_MS, 'found', sameBreed, 'Found: a dog like this one.', {
        listingId: 0,
        hard: 'far-away',
        forDogId: id,
      }),
    )
    drafts.push(
      listing(r.pick(townsBetween(town, 0, 10)), seenMs - (1 + r.next() * 20) * DAY_MS, 'found', sameBreed, 'Found.', {
        listingId: 0,
        hard: 'before-last-seen',
        forDogId: id,
      }),
    )
  }

  // Plain distractors: any breed, any coat, anywhere, at any time in the last 90 days.
  for (let j = 0; j < perDog * options.dogs; j++) {
    const breed = r.pick(breedNames)
    const coat = r.pick(coatNames)
    const t: Traits = {
      breeds: [breedWordFor(r, breed)],
      colors: [r.pick(COATS[coat] ?? [coat])],
      size: r.chance(0.7) ? r.pick(SIZES) : 'unknown',
      sex: r.chance(0.5) ? r.pick(SEXES) : 'unknown',
      age: r.chance(0.4) ? r.pick(AGES) : 'unknown',
    }
    const kind = r.pick(['found', 'sighting', 'shelter-stray', 'lost', 'unknown'] as const)
    drafts.push(
      listing(r.pick(TOWNS), nowMs - r.next() * 90 * DAY_MS, kind, t, 'A made-up post.', {
        listingId: 0,
        hard: null,
        forDogId: null,
      }),
    )
  }

  // Shuffle (Fisher-Yates), then number, so an id never gives a true listing away.
  for (let k = drafts.length - 1; k > 0; k--) {
    const m = r.int(0, k)
    ;[drafts[k], drafts[m]] = [drafts[m] as Draft, drafts[k] as Draft]
  }
  const listings: Listing[] = []
  const truth: TrueListing[] = []
  const distractors: Distractor[] = []
  drafts.forEach(({ tag, ...rest }, index) => {
    const id = index + 1
    listings.push({ id, ...rest })
    if ('kind' in tag) truth.push({ dogId: tag.dogIndex + 1, listingId: id, noise: tag.noise })
    else distractors.push({ ...tag, listingId: id })
  })
  truth.sort((a, b) => a.dogId - b.dogId || a.listingId - b.listingId)
  return { seed: options.seed, dogs, listings, truth, distractors }
}
