import { z } from 'zod'

// The small value sets more than one record uses, kept apart so the record files never import
// each other in a circle.

/** What a listing says it is. An unclear post is `unknown`, never `lost`. */
export const ListingKind = z.enum(['shelter-stray', 'found', 'lost', 'sighting', 'unknown'])
export type ListingKind = z.infer<typeof ListingKind>

export const Species = z.enum(['dog', 'other', 'unknown'])
export type Species = z.infer<typeof Species>

/** The registry's stable slug for a source: lower-case words joined by dashes. */
export const SourceId = z
  .string()
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
export type SourceId = z.infer<typeof SourceId>
