import { z } from 'zod'
import { Traits } from './traits.ts'

// What reading a missing dog's photo gives the form (ADR-0007 points 1 and 8): the traits the
// photo shows, and nothing else. It is a suggestion for the owner to check, never a fact about a
// listing. Unknown is a value: what the photo doesn't show stays unknown or empty.

/** The answer of `POST /api/ai/photo-traits`. */
export const PhotoRead = z.object({
  /** False when no dog could be made out, and then nothing else is filled. */
  dogVisible: z.boolean(),
  traits: Traits,
  /** Distinguishing marks the photo shows, or null. */
  marks: z.string().max(2000).nullable(),
})
export type PhotoRead = z.infer<typeof PhotoRead>

/** The answer of `GET /api/ai`: whether a photo can be read, and how much of the caps is used. */
export const AiState = z.object({
  /** Whether AI is turned on (`JILL_AI=on`). */
  enabled: z.boolean(),
  /** Whether a key is saved. With AI on and no key, a read is refused. */
  keySaved: z.boolean(),
  today: z.number().int().min(0),
  dailyCap: z.number().int().min(0),
  month: z.number().int().min(0),
  monthlyCap: z.number().int().min(0),
})
export type AiState = z.infer<typeof AiState>

/** Why a photo was not read, as the API's error code says it. */
export const PHOTO_READ_ERRORS = [
  'ai-off',
  'ai-no-key',
  'ai-daily-cap',
  'ai-monthly-cap',
  'ai-refused',
  'ai-invalid-answer',
  'ai-error',
  'not-an-image',
] as const
export type PhotoReadError = (typeof PHOTO_READ_ERRORS)[number]
