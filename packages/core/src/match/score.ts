import type { Dog } from '../dog.ts'
import type { Listing } from '../listing.ts'
import type { Band, SetAsideReason } from '../match.ts'
import { distanceKm } from '../towns.ts'
import type { Age, PlacePrecision, Sex, Size } from '../traits.ts'
import { readBreeds, readColors } from './words.ts'

// The matcher (#19): one listing scored against one dog, as a ranking and never an
// identification (ADR-0001 point 3). Pure: no I/O, no clock reads, no model calls (ADR-0006).
//
// Each part adds evidence. A part that agrees adds points, one that contradicts takes some away,
// and a part that is unknown on either side adds nothing: exactly the same as not comparing it
// at all, so an unknown trait, place or date never lowers a score (ADR-0005 point 4). The score
// is the evidence squashed to 0 to 1, for ordering only, and never shown.

const DAY_MS = 24 * 60 * 60 * 1000

/** How long a source keeps a stray after its listing leaves, in days, unless the caller says. */
export const KEEPS_STRAYS_DAYS = 7
/** A post dated this little before the last-seen time is not set aside: dates are often day-only. */
const BEFORE_GRACE_MS = DAY_MS

/** The most points each part can add. Contradictions take away less than agreement adds. */
const WEIGHT = {
  time: 2,
  lateOff: 0.5,
  distance: 3,
  farOff: 0.5,
  breed: 2,
  breedOff: 1,
  color: 1.5,
  colorOff: 0.75,
  size: 0.75,
  sizeOff: 0.75,
  sex: 0.5,
  sexOff: 0.75,
  age: 0.5,
  ageOff: 0.75,
} as const
const MAX =
  WEIGHT.time -
  WEIGHT.lateOff +
  WEIGHT.distance -
  WEIGHT.farOff +
  WEIGHT.breed +
  WEIGHT.color +
  WEIGHT.size +
  WEIGHT.sex +
  WEIGHT.age
const MIN = -(
  WEIGHT.lateOff +
  WEIGHT.farOff +
  WEIGHT.breedOff +
  WEIGHT.colorOff +
  WEIGHT.sizeOff +
  WEIGHT.sexOff +
  WEIGHT.ageOff
)

/** The evidence a band needs. A set-aside match is always weak; a weak one is still shown. */
const STRONG_AT = 5.5
const POSSIBLE_AT = 3

/** How many kilometres a place given only as a town or county may be off by. */
const SLACK_KM: Record<PlacePrecision, number> = { point: 0, town: 3, county: 25, unknown: 0 }

export type Scored = {
  /** From 0 to 1, for ordering only. Never shown. */
  score: number
  band: Band
  /** Plain-word sentences, at least one. */
  reasons: string[]
  setAside: SetAsideReason | null
}

export type ScoreOptions = {
  /** How long the listing's source keeps a stray, in days. */
  keepsStraysDays?: number
}

type Part = { points: number; reason: string | null }

const SIZE_ORDER: Record<Size, number> = { small: 0, medium: 1, large: 2, unknown: -1 }
const AGE_ORDER: Record<Age, number> = { puppy: 0, young: 1, adult: 2, senior: 3, unknown: -1 }

function pronoun(sex: Sex): string {
  return sex === 'female' ? 'she' : sex === 'male' ? 'he' : 'the dog'
}

function capital(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

/** "3 days", "2 weeks": how a reason says a span. */
function span(ms: number): string {
  const days = Math.floor(ms / DAY_MS)
  if (days < 14) return plural(days, 'day')
  return plural(Math.floor(days / 7), 'week')
}

/** What a listing's kind did, as the verb a reason starts with. */
function verb(listing: Listing): string {
  switch (listing.kind) {
    case 'found':
      return 'Found'
    case 'shelter-stray':
      return 'Taken in'
    case 'sighting':
      return 'Seen'
    default:
      return 'Posted'
  }
}

/** When the listing says it happened: when it was posted, or first read when it gives no date. */
const listingTime = (l: Listing) => Date.parse(l.postedAt ?? l.firstSeenAt)

function timePart(dog: Dog, listing: Listing): Part {
  const gap = listingTime(listing) - Date.parse(dog.lastSeenAt)
  // Dated before the dog went missing: set aside, and its own reason says so.
  if (gap < -BEFORE_GRACE_MS) return { points: 0, reason: null }
  const who = pronoun(dog.traits.sex)
  // A post with no date of its own is not compared on time: when a sweep first read it says
  // nothing about when the dog was found or seen.
  if (listing.postedAt === null) return { points: 0, reason: 'The post gives no date, so time was not compared' }
  const after = Math.max(0, gap)
  // Decays over weeks: a post two weeks after the dog went missing keeps about half its points.
  // A much later one takes a little away (down to -lateOff), so a post with no date never ranks
  // below a late one.
  const points = WEIGHT.time * Math.exp(-after / (20 * DAY_MS)) - WEIGHT.lateOff
  const when =
    after < DAY_MS ? `within a day of when ${who} was last seen` : `${span(after)} after ${who} was last seen`
  return { points, reason: `Posted ${when}` }
}

function distancePart(dog: Dog, listing: Listing): Part {
  if (dog.lat === null || dog.lon === null) {
    return {
      points: 0,
      reason: `Where ${pronoun(dog.traits.sex)} was last seen can't be placed on a map, so distance was not compared`,
    }
  }
  if (listing.lat === null || listing.lon === null) {
    return { points: 0, reason: 'The post gives no place that can be placed on a map, so distance was not compared' }
  }
  const km = distanceKm({ lat: dog.lat, lon: dog.lon }, { lat: listing.lat, lon: listing.lon })
  const slack = SLACK_KM[dog.placePrecision] + SLACK_KM[listing.placePrecision]
  // Decays with kilometres: about half the points at 15 km past the slack. A far place takes a
  // little away (down to -farOff), so a listing with no place never ranks below a far one.
  const points = WEIGHT.distance * Math.exp(-Math.max(0, km - slack) / 22) - WEIGHT.farOff
  const where = km < 1 ? 'less than 1 km' : `${Math.round(km)} km`
  return { points, reason: `${verb(listing)} ${where} from where ${pronoun(dog.traits.sex)} was last seen` }
}

function breedPart(dog: Dog, listing: Listing): Part {
  const mine = readBreeds(dog.traits.breeds)
  const theirs = readBreeds(listing.traits.breeds)
  const said = listing.traits.breeds.join(', ')
  if (mine.families.size === 0 || theirs.families.size === 0) {
    return { points: 0, reason: listing.traits.breeds.length === 0 ? null : `Breed: ${said}, not compared` }
  }
  const shared = [...theirs.families].filter((f) => mine.families.has(f))
  const named = [...mine.families].join(' or ')
  if (shared.length === 0) return { points: -WEIGHT.breedOff, reason: `Breed: ${said}, unlike ${named}` }
  const same = listing.traits.breeds.some((w) => dog.traits.breeds.includes(w))
  // Named by its family ("lab mix, close to Labrador"), or by the dog's own word when the post
  // already used the family's name.
  const close = said !== (shared[0] as string).toLowerCase()
  return {
    points: WEIGHT.breed,
    reason: same
      ? `Breed: ${said}, the same`
      : `Breed: ${said}, close to ${close ? shared[0] : dog.traits.breeds.join(', ')}`,
  }
}

function colorPart(dog: Dog, listing: Listing): Part {
  const mine = readColors(dog.traits.colors)
  const theirs = readColors(listing.traits.colors)
  const said = listing.traits.colors.join(', ')
  if (mine.size === 0 || theirs.size === 0) {
    return { points: 0, reason: listing.traits.colors.length === 0 ? null : `Colour: ${said}, not compared` }
  }
  const shared = [...theirs].filter((f) => mine.has(f))
  if (shared.length === 0) {
    return { points: -WEIGHT.colorOff, reason: `Colour: ${said}, unlike ${dog.traits.colors.join(', ')}` }
  }
  const same = listing.traits.colors.some((w) => dog.traits.colors.includes(w))
  return {
    points: WEIGHT.color,
    reason: same ? `Colour: ${said}, the same` : `Colour: ${said}, close to ${dog.traits.colors.join(', ')}`,
  }
}

/** Size, sex or age: the same adds, one step apart adds nothing, farther takes some away. */
function orderedPart(
  label: string,
  mine: string,
  theirs: string,
  order: Record<string, number>,
  add: number,
  off: number,
  near: boolean,
): Part {
  const a = order[mine] ?? -1
  const b = order[theirs] ?? -1
  if (a < 0 || b < 0) return { points: 0, reason: null }
  if (a === b) return { points: add, reason: `${label}: ${theirs}, the same` }
  if (near && Math.abs(a - b) === 1) return { points: 0, reason: `${label}: ${theirs}, close to ${mine}` }
  return { points: -off, reason: `${label}: ${theirs}, not ${mine}` }
}

const SEX_ORDER: Record<Sex, number> = { male: 0, female: 1, unknown: -1 }

function setAsideOf(
  dog: Dog,
  listing: Listing,
  now: number,
  keepsDays: number,
): { why: SetAsideReason; reason: string } | null {
  const who = pronoun(dog.traits.sex)
  if (listing.species === 'other') {
    return { why: 'not-a-dog', reason: 'Set aside: the post is about an animal that is not a dog' }
  }
  const before = Date.parse(dog.lastSeenAt) - listingTime(listing)
  if (before > BEFORE_GRACE_MS) {
    return { why: 'before-missing', reason: `Set aside: dated ${span(before)} before ${who} was last seen` }
  }
  if (listing.kind === 'lost') {
    return { why: 'lost-post', reason: 'Set aside: a post about a lost dog, not one that was found or seen' }
  }
  if (listing.goneAt !== null) {
    const gone = now - Date.parse(listing.goneAt)
    if (gone > keepsDays * DAY_MS) {
      return {
        why: 'long-gone',
        reason: `Set aside: gone from its source ${span(gone)} ago, longer than strays are usually kept`,
      }
    }
  }
  return null
}

/**
 * Scores one listing against one dog at `now` (the caller's clock). Every listing gets a result:
 * a low band never hides a listing, and a set-aside one keeps its reason and is still shown.
 */
export function scoreListing(dog: Dog, listing: Listing, now: string, options: ScoreOptions = {}): Scored {
  const nowMs = Date.parse(now)
  const keepsDays = options.keepsStraysDays ?? KEEPS_STRAYS_DAYS
  const t = dog.traits
  const l = listing.traits
  const parts: Part[] = [
    distancePart(dog, listing),
    timePart(dog, listing),
    breedPart(dog, listing),
    colorPart(dog, listing),
    orderedPart('Size', t.size, l.size, SIZE_ORDER, WEIGHT.size, WEIGHT.sizeOff, true),
    orderedPart('Sex', t.sex, l.sex, SEX_ORDER, WEIGHT.sex, WEIGHT.sexOff, false),
    orderedPart('Age', t.age, l.age, AGE_ORDER, WEIGHT.age, WEIGHT.ageOff, true),
  ]
  const evidence = parts.reduce((sum, p) => sum + p.points, 0)
  const score = Math.min(1, Math.max(0, (evidence - MIN) / (MAX - MIN)))
  const reasons = parts.flatMap((p) => (p.reason === null ? [] : [p.reason]))

  const unstated = [
    ['size', t.size !== 'unknown' && l.size === 'unknown'],
    ['sex', t.sex !== 'unknown' && l.sex === 'unknown'],
    ['age', t.age !== 'unknown' && l.age === 'unknown'],
  ]
    .filter(([, missing]) => missing)
    .map(([name]) => name as string)
  if (unstated.length > 0) reasons.push(capital(`${unstated.join(', ')} not given in the post, so not compared`))

  const aside = setAsideOf(dog, listing, nowMs, keepsDays)
  if (aside !== null) return { score, band: 'weak', reasons: [aside.reason, ...reasons], setAside: aside.why }
  const band: Band = evidence >= STRONG_AT ? 'strong' : evidence >= POSSIBLE_AT ? 'possible' : 'weak'
  return { score, band, reasons, setAside: null }
}

/** A dog's results in the order the page shows them: best first, set-aside ones after the rest. */
export function rankScored<T extends { score: number; setAside: SetAsideReason | null; listingId: number }>(
  items: readonly T[],
): T[] {
  return [...items].sort(
    (a, b) =>
      Number(a.setAside !== null) - Number(b.setAside !== null) || b.score - a.score || a.listingId - b.listingId,
  )
}
