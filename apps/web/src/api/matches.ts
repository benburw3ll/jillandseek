import { Instant, Listing, Match } from '@jillandseek/core'
import { z } from 'zod'
import { getJson, postJson } from './client.ts'

const DogMatches = z.object({
  /** Best first, set-aside ones after the rest. */
  items: z.array(z.object({ match: Match, listing: Listing })),
  /** When matching last ran for the dog, or null when it has no matches yet. */
  ranAt: Instant.nullable(),
})
export type DogMatches = z.infer<typeof DogMatches>

/** GET /api/dogs/:id/matches: the dog's ranked listings, with each one's band and reasons. */
export function fetchMatches(dogId: number, signal?: AbortSignal): Promise<DogMatches> {
  return getJson(`/dogs/${dogId}/matches`, DogMatches, signal)
}

/** POST /api/dogs/:id/matches: re-runs matching for the dog now. */
export function rerunMatches(dogId: number): Promise<DogMatches> {
  return postJson(`/dogs/${dogId}/matches`, {}, DogMatches)
}
