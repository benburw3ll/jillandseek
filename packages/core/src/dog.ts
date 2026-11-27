import { z } from 'zod'
import { Instant } from './time.ts'
import { findTown } from './towns.ts'
import { checkPlace, Latitude, Longitude, PlacePrecision, Traits, unknownTraits } from './traits.ts'

// A dog is a missing dog being searched for (ADR-0005 point 2). On a dog, `lastSeenAt` is the
// last time anyone saw the dog; on a listing it is the last time a sweep read the post.

export const DogStatus = z.enum(['missing', 'found'])
export type DogStatus = z.infer<typeof DogStatus>

/** A dog has at most this many photos (ADR-0003 point 4). */
export const MAX_PHOTOS = 5
/** The largest photo the server takes, in bytes. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024

/** The image types a photo may be, with the extension the server names its file with. */
export const PHOTO_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const
export type PhotoType = keyof typeof PHOTO_TYPES

/**
 * A photo's file name inside the data home's `photos/`: exactly the shape the server writes,
 * 32 random hex digits and the extension of the type it found in the bytes. Never a path, and
 * never the uploaded file's own name, so the prune can only ever remove a file the app wrote.
 */
export const PhotoName = z.string().regex(/^[0-9a-f]{32}\.(?:jpg|png|webp)$/)

/** The image type a photo's first bytes show, or null when they are not JPEG, PNG or WebP. */
export function detectPhotoType(bytes: Uint8Array): PhotoType | null {
  const starts = (sig: number[], at = 0) => sig.every((b, i) => bytes[at + i] === b)
  if (starts([0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  // RIFF....WEBP
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp'
  return null
}

/** The type a stored photo was saved as, from its name's extension. */
export function photoTypeOf(name: string): PhotoType | null {
  if (!PhotoName.safeParse(name).success) return null
  const ext = name.slice(name.lastIndexOf('.') + 1)
  const found = Object.entries(PHOTO_TYPES).find(([, e]) => e === ext)
  return found ? (found[0] as PhotoType) : null
}

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

// The form at Find a dog, and the API's POST and PATCH bodies: one schema, shared by the web
// app and the server (#17). The owner picks a town from the local towns table, and the town
// gives the coordinates: the form never takes a lat, a lon or a precision of its own.

/** A Minnesota town from the local towns table, as its canonical name. */
const KnownTown = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .refine((name) => findTown(name) !== null, { message: 'not a Minnesota town in the towns table' })

/** The town's name and coordinates, at town precision. */
function placeTown(name: string) {
  const town = findTown(name)
  if (town === null) throw new Error('the town was checked by the schema')
  return { lastSeenTown: town.name, lat: town.lat, lon: town.lon, placePrecision: 'town' as const }
}

const formFields = {
  label: fields.label,
  lastSeenAt: fields.lastSeenAt,
  lastSeenTown: KnownTown,
  lastSeenPlace: fields.lastSeenPlace,
  traits: fields.traits,
  marks: fields.marks,
  notes: fields.notes,
}

/** A new dog as the form gives it. Its output is a `DogInput`, placed at its town. */
export const DogForm = z
  .strictObject({
    ...formFields,
    label: formFields.label.default(null),
    lastSeenPlace: formFields.lastSeenPlace.default(null),
    traits: formFields.traits.default(unknownTraits),
    marks: formFields.marks.default(null),
    notes: formFields.notes.default(null),
  })
  .transform((f): DogInput => ({ ...f, ...placeTown(f.lastSeenTown) }))
export type DogFormBody = z.input<typeof DogForm>

/** A change from the form: only the fields given change, and a new town moves the dog's place. */
export const DogFormPatch = z
  .strictObject({
    label: formFields.label.optional(),
    lastSeenAt: formFields.lastSeenAt.optional(),
    lastSeenTown: formFields.lastSeenTown.optional(),
    lastSeenPlace: formFields.lastSeenPlace.optional(),
    traits: formFields.traits.optional(),
    marks: formFields.marks.optional(),
    notes: formFields.notes.optional(),
    status: DogStatus.optional(),
  })
  .transform((p): DogPatch => {
    const { lastSeenTown, ...rest } = p
    return lastSeenTown === undefined ? rest : { ...rest, ...placeTown(lastSeenTown) }
  })
export type DogFormPatchBody = z.input<typeof DogFormPatch>
