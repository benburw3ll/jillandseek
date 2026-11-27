import { z } from 'zod'
import { ListingKind, SourceId, Species } from './kinds.ts'
import { Instant } from './time.ts'
import { checkPlace, Latitude, Longitude, PlacePrecision, Traits, unknownTraits } from './traits.ts'

// A listing is one post or record that might be the dog (ADR-0005 point 2). It is unique by
// (sourceId, sourceKey): a repeat read updates it and never makes a second one.

const candidateFields = {
  sourceId: SourceId,
  /** The source's own id for the post. */
  sourceKey: z.string().min(1).max(200),
  /** The original post, so the owner can always open it. */
  url: z.httpUrl(),
  kind: ListingKind.default('unknown'),
  species: Species.default('unknown'),
  /** When the source says it was posted or taken in. */
  postedAt: Instant.nullable().default(null),
  /** The place as the post gave it. */
  placeText: z.string().max(500).nullable().default(null),
  /** The Minnesota town and county, when known. */
  town: z.string().trim().min(1).max(100).nullable().default(null),
  county: z.string().trim().min(1).max(100).nullable().default(null),
  lat: Latitude.nullable().default(null),
  lon: Longitude.nullable().default(null),
  placePrecision: PlacePrecision.default('unknown'),
  traits: Traits.default(unknownTraits),
  /** The post's own words. */
  text: z.string().max(20_000).nullable().default(null),
  /** The photos' source URLs. A photo is never kept as a picture of its own (ADR-0003). */
  photoUrls: z.array(z.httpUrl()).max(20).default([]),
  /** The contact lines the public post showed, as posted. Local screens only; never logged. */
  contact: z.string().max(2000).nullable().default(null),
}

/**
 * What a collector gives for one post: a listing without the fields Jill and Seek sets itself
 * (`id`, `firstSeenAt`, `lastSeenAt`, `goneAt`). The repository's `upsertListing` takes it.
 */
export const ListingCandidate = z.object(candidateFields).superRefine(checkPlace)
export type ListingCandidate = z.infer<typeof ListingCandidate>
export type ListingCandidateInput = z.input<typeof ListingCandidate>

/** A listing as stored. */
export const Listing = z
  .object({
    id: z.number().int().positive(),
    ...candidateFields,
    /** When a sweep first and last read it. */
    firstSeenAt: Instant,
    lastSeenAt: Instant,
    /** When a full read first missed it. */
    goneAt: Instant.nullable(),
  })
  .superRefine(checkPlace)
export type Listing = z.infer<typeof Listing>

/** The filters of `GET /api/listings` and the repository's `listListings`. */
export const ListingQuery = z.object({
  kind: ListingKind.optional(),
  /** First seen at or after this moment. */
  since: Instant.optional(),
  /** First seen before this moment. */
  until: Instant.optional(),
  town: z.string().trim().min(1).max(100).optional(),
  county: z.string().trim().min(1).max(100).optional(),
  /** Gone listings are left out unless this is true. */
  includeGone: z.boolean().default(false),
  limit: z.number().int().min(1).max(200).default(50),
  /** The `nextCursor` of the page before. */
  cursor: z.string().min(1).max(200).optional(),
})
export type ListingQuery = z.infer<typeof ListingQuery>
export type ListingQueryInput = z.input<typeof ListingQuery>

/** One page of a cursor-paged list, newest first. */
export type Page<T> = { items: T[]; nextCursor: string | null }
