import { z } from 'zod'

// The same traits shape on a dog and on a listing (ADR-0005). Unknown is a value, never a guess,
// and an unknown trait never lowers a score.

export const Size = z.enum(['small', 'medium', 'large', 'unknown'])
export type Size = z.infer<typeof Size>

export const Sex = z.enum(['male', 'female', 'unknown'])
export type Sex = z.infer<typeof Sex>

export const Age = z.enum(['puppy', 'young', 'adult', 'senior', 'unknown'])
export type Age = z.infer<typeof Age>

/** A breed or colour word as the post gave it, in lower case. Synonyms are the matcher's job. */
const Word = z.string().trim().toLowerCase().min(1).max(60)

export const Traits = z.object({
  breeds: z.array(Word).max(20).default([]),
  colors: z.array(Word).max(20).default([]),
  size: Size.default('unknown'),
  sex: Sex.default('unknown'),
  age: Age.default('unknown'),
})
export type Traits = z.infer<typeof Traits>

/** Traits with nothing known. */
export const unknownTraits = (): Traits => ({ breeds: [], colors: [], size: 'unknown', sex: 'unknown', age: 'unknown' })

/** How exactly a place is known. */
export const PlacePrecision = z.enum(['point', 'town', 'county', 'unknown'])
export type PlacePrecision = z.infer<typeof PlacePrecision>

export const Latitude = z.number().min(-90).max(90)
export const Longitude = z.number().min(-180).max(180)

/**
 * A place that can't be placed has null lat and lon and precision `unknown`; a placed one has
 * both coordinates and a precision other than `unknown`.
 */
export function checkPlace(
  place: { lat: number | null; lon: number | null; placePrecision: PlacePrecision },
  ctx: z.RefinementCtx,
): void {
  const placed = place.lat !== null && place.lon !== null
  const unplaced = place.lat === null && place.lon === null
  if (!placed && !unplaced) {
    ctx.addIssue({ code: 'custom', path: ['lat'], message: 'lat and lon are both set or both null' })
  } else if (unplaced && place.placePrecision !== 'unknown') {
    ctx.addIssue({ code: 'custom', path: ['placePrecision'], message: 'a place with no coordinates is unknown' })
  } else if (placed && place.placePrecision === 'unknown') {
    ctx.addIssue({ code: 'custom', path: ['placePrecision'], message: 'a place with coordinates has a precision' })
  }
}
