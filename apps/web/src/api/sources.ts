import { Source } from '@jillandseek/core'
import { z } from 'zod'
import { getJson, postJson } from './client.ts'

const SourceList = z.object({
  items: z.array(Source),
  /** Listings that aren't gone, by source id. */
  listingCounts: z.record(z.string(), z.number().int().nonnegative()).default({}),
})
export type SourceList = z.infer<typeof SourceList>

/** GET /api/sources: every source in the registry, with each one's listing count. */
export function fetchSources(signal?: AbortSignal): Promise<SourceList> {
  return getJson('/sources', SourceList, signal)
}

/** POST /api/sources/:id/clear-block: the owner clears a block; the sweep reads the source when next due. */
export function clearBlock(id: string): Promise<Source> {
  return postJson(`/sources/${encodeURIComponent(id)}/clear-block`, {}, Source)
}
