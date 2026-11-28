import { type AiState, detectPhotoType, type PhotoReadError } from '@jillandseek/core'
import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { AiError, type AiErrorCode } from '../ai/client.ts'
import { photoReadOf, photoTraits } from '../ai/photoTraits.ts'
import { stripMetadata } from '../ai/stripMetadata.ts'
import { jsonError } from '../http/errors.ts'
import type { RouteDeps } from './deps.ts'

// The AI routes (ADR-0007). `GET /api/ai` says whether a photo can be read. `POST
// /api/ai/photo-traits` reads the missing dog's photo into the form's traits: its body is the
// raw image (the guards let it through like a photo upload: the header, an image type, 5 MB).
// The photo can be read before the dog is saved, and it is not stored by this route.
//
// What reaches the capped client is the photo with its metadata removed, and nothing else: this
// route has no other input. The model's instruction is fixed text in ai/photoTraits.ts.

const REFUSALS: Record<AiErrorCode, [ContentfulStatusCode, PhotoReadError]> = {
  ai_off: [409, 'ai-off'],
  no_key: [409, 'ai-no-key'],
  daily_cap: [429, 'ai-daily-cap'],
  monthly_cap: [429, 'ai-monthly-cap'],
  refused: [422, 'ai-refused'],
  cut_off: [502, 'ai-invalid-answer'],
  invalid_answer: [502, 'ai-invalid-answer'],
  api_error: [502, 'ai-error'],
}

export function aiRoutes(deps: RouteDeps) {
  return new Hono()
    .get('/ai', (c) => {
      const s = deps.ai.status()
      return c.json({
        enabled: s.enabled,
        keySaved: s.keySaved,
        today: s.today,
        dailyCap: s.dailyCap,
        month: s.month,
        monthlyCap: s.monthlyCap,
      } satisfies AiState)
    })
    .post('/ai/photo-traits', async (c) => {
      // Off is answered before the body is read, so nothing is done with a photo while AI is off.
      if (!deps.ai.status().enabled) return jsonError(c, ...REFUSALS.ai_off)
      const bytes = new Uint8Array(await c.req.arrayBuffer())
      // The type comes from the bytes themselves, never from the header the browser sent.
      const type = detectPhotoType(bytes)
      const clean = type === null ? null : stripMetadata(bytes, type)
      if (type === null || clean === null) return jsonError(c, 415, 'not-an-image' satisfies PhotoReadError)
      try {
        const answer = await deps.ai.read(photoTraits, { image: { mediaType: type, bytes: clean } })
        return c.json(photoReadOf(answer))
      } catch (error) {
        if (error instanceof AiError) return jsonError(c, ...REFUSALS[error.code])
        throw error
      }
    })
}
