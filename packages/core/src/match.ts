import { z } from 'zod'
import { Instant } from './time.ts'

// A match is one listing scored against one dog, as a ranking and never an identification
// (ADR-0005 point 2). O4 computes them.

export const Band = z.enum(['strong', 'possible', 'weak'])
export type Band = z.infer<typeof Band>

/** A hard contradiction. A set-aside match is still stored and still shown, with its reason. */
export const SetAsideReason = z.enum(['not-a-dog', 'before-missing', 'lost-post', 'long-gone'])
export type SetAsideReason = z.infer<typeof SetAsideReason>

export const Match = z.object({
  dogId: z.number().int().positive(),
  listingId: z.number().int().positive(),
  /** From 0 to 1, used for ordering and never shown. */
  score: z.number().min(0).max(1),
  band: Band,
  /** Plain-word sentences. */
  reasons: z.array(z.string().min(1).max(500)).max(20),
  setAsideReason: SetAsideReason.nullable(),
  computedAt: Instant,
})
export type Match = z.infer<typeof Match>
