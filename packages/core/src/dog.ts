import { z } from 'zod'
import { Instant } from './time.ts'
import { checkPlace, Latitude, Longitude, PlacePrecision, Traits, unknownTraits } from './traits.ts'

// A dog is a missing dog being searched for (ADR-0005 point 2). On a dog, `lastSeenAt` is the
// last time anyone saw the dog; on a listing it is the last time a sweep read the post.

export const DogStatus = z.enum(['missing', 'found'])
export type DogStatus = z.infer<typeof DogStatus>

/** A photo's file name inside the data home's `photos/`: a bare name, never a path. */
export const PhotoName = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/)

const fields = {
  label: z.string().trim().min(1).max(100).nullable(),
  lastSeenAt: Instant,
  /** A Minnesota town. */
  lastSeenTown: z.string().trim().min(1).max(100),
  /** An optional street or landmark. */
  lastSeenPlace: z.string().trim().min(1).max(200).nullable(),
  lat: Latitude.nullable(),
  lon: Longitude.nullable(),
  placePrecision: PlacePrecision,
  traits: Traits,
  /** Distinguishing marks. */
  marks: z.string().max(2000).nullable(),
  notes: z.string().max(5000).nullable(),
}

/** What the owner enters for a new dog. O4 (#17) shapes the form around it. */
export const DogInput = z
  .strictObject({
    ...fields,
    label: fields.label.default(null),
    lastSeenPlace: fields.lastSeenPlace.default(null),
    lat: fields.lat.default(null),
    lon: fields.lon.default(null),
    placePrecision: fields.placePrecision.default('unknown'),
    traits: fields.traits.default(unknownTraits),
    marks: fields.marks.default(null),
    notes: fields.notes.default(null),
  })
  .superRefine(checkPlace)
export type DogInput = z.infer<typeof DogInput>
export type DogInputBody = z.input<typeof DogInput>

/** A change to a dog: only the fields given change. `status: 'found'` starts the deletion clock. */
export const DogPatch = z.strictObject({
  label: fields.label.optional(),
  lastSeenAt: fields.lastSeenAt.optional(),
  lastSeenTown: fields.lastSeenTown.optional(),
  lastSeenPlace: fields.lastSeenPlace.optional(),
  lat: fields.lat.optional(),
  lon: fields.lon.optional(),
  placePrecision: fields.placePrecision.optional(),
  traits: fields.traits.optional(),
  marks: fields.marks.optional(),
  notes: fields.notes.optional(),
  status: DogStatus.optional(),
})
export type DogPatch = z.infer<typeof DogPatch>

/** A dog as stored. */
export const Dog = z
  .object({
    id: z.number().int().positive(),
    ...fields,
    /** File names inside the data home's `photos/`, deleted with the dog. */
    photos: z.array(PhotoName).max(5),
    status: DogStatus,
    /** When the owner marked the dog found; the dog is deleted a set number of days later. */
    foundAt: Instant.nullable(),
    createdAt: Instant,
    updatedAt: Instant,
  })
  .superRefine(checkPlace)
export type Dog = z.infer<typeof Dog>
