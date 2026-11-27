import type { Dog } from '../src/dog.ts'
import type { Listing } from '../src/listing.ts'
import type { EvalSet } from './generate.ts'

// How well a matcher ranks the true listings of the synthetic set (#18). Recall at 20 is one
// of the purpose ADR's four measures (ADR-0001 point 2).

/** A matcher ranks every listing for one dog, best first, as listing ids. */
export type Matcher = (dog: Dog, listings: readonly Listing[]) => number[]

/** The trivial baseline: newest first, by when the post was made (or first read), ties by id. */
export const newestFirst: Matcher = (_dog, listings) =>
  [...listings]
    .sort((a, b) => {
      const at = (l: Listing) => l.postedAt ?? l.firstSeenAt
      return at(b) < at(a) ? -1 : at(b) > at(a) ? 1 : a.id - b.id
    })
    .map((l) => l.id)

export type Figures = {
  seed: number
  dogs: number
  listings: number
  trueListings: number
  /** The share of true listings ranked in the top 5 for their dog, from 0 to 1. */
  recallAt5: number
  /** The share of true listings ranked in the top 20 for their dog, from 0 to 1. */
  recallAt20: number
  /** The median rank (1 is first) of the true listings for their dogs. */
  medianRank: number
}

const round = (n: number) => Math.round(n * 10_000) / 10_000

function median(values: number[]): number {
  if (values.length === 0) return 0
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 === 1 ? (s[mid] as number) : ((s[mid - 1] as number) + (s[mid] as number)) / 2
}

/** Runs the matcher for every dog and scores where its true listings landed. */
export function measure(set: EvalSet, matcher: Matcher): Figures {
  const ranks: number[] = []
  for (const dog of set.dogs) {
    const wanted = set.truth.filter((t) => t.dogId === dog.id).map((t) => t.listingId)
    if (wanted.length === 0) continue
    const order = matcher(dog, set.listings)
    const place = new Map(order.map((id, i) => [id, i + 1]))
    // A true listing the matcher left out ranks last.
    for (const id of wanted) ranks.push(place.get(id) ?? set.listings.length)
  }
  const share = (k: number) => (ranks.length === 0 ? 0 : ranks.filter((r) => r <= k).length / ranks.length)
  return {
    seed: set.seed,
    dogs: set.dogs.length,
    listings: set.listings.length,
    trueListings: ranks.length,
    recallAt5: round(share(5)),
    recallAt20: round(share(20)),
    medianRank: median(ranks),
  }
}
