import { z } from 'zod'
import { SourceId } from './kinds.ts'
import { Instant } from './time.ts'

// A sweep is one run of the collectors over the sources that are due (ADR-0005 point 2).

const Count = z.number().int().nonnegative()

export const SweepCounts = z.object({
  sourcesDue: Count,
  sourcesRead: Count,
  listingsSeen: Count,
  listingsNew: Count,
  listingsUpdated: Count,
  listingsGone: Count,
})
export type SweepCounts = z.infer<typeof SweepCounts>

export const emptySweepCounts = (): SweepCounts => ({
  sourcesDue: 0,
  sourcesRead: 0,
  listingsSeen: 0,
  listingsNew: 0,
  listingsUpdated: 0,
  listingsGone: 0,
})

/** A source's error: a code only, never page text. */
export const SweepError = z.object({
  sourceId: SourceId,
  code: z
    .string()
    .max(40)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})
export type SweepError = z.infer<typeof SweepError>

export const Sweep = z.object({
  id: z.number().int().positive(),
  startedAt: Instant,
  finishedAt: Instant.nullable(),
  counts: SweepCounts,
  errors: z.array(SweepError),
})
export type Sweep = z.infer<typeof Sweep>
