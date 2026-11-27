import { Source } from '@jillandseek/core'
import { z } from 'zod'
import { getJson } from './client.ts'

const SourceList = z.object({ items: z.array(Source) })

/** GET /api/sources: every source in the registry. */
export async function fetchSources(signal?: AbortSignal): Promise<Source[]> {
  return (await getJson('/sources', SourceList, signal)).items
}
