import { AiState, PHOTO_READ_ERRORS, PhotoRead, type PhotoReadError } from '@jillandseek/core'
import { ApiError, getJson, postBytes } from './client.ts'

/** GET /api/ai: whether a photo can be read, and how much of the caps is used. */
export function fetchAiState(signal?: AbortSignal): Promise<AiState> {
  return getJson('/ai', AiState, signal)
}

/** Why a read gave nothing, as one of the server's codes. Anything else is `ai-error`. */
export function photoReadError(error: unknown): PhotoReadError {
  const code = error instanceof ApiError ? error.code : null
  return (PHOTO_READ_ERRORS as readonly string[]).includes(code ?? '') ? (code as PhotoReadError) : 'ai-error'
}

/**
 * POST /api/ai/photo-traits: the photo's own bytes, and nothing else. The server removes the
 * photo's metadata and sends it to the Claude API, with AI on. The dog need not be saved yet.
 */
export function readPhotoTraits(photo: Blob): Promise<PhotoRead> {
  return postBytes('/ai/photo-traits', photo, PhotoRead)
}
