import { Listing, type ListingQueryInput, type Page } from '@jillandseek/core'
import { z } from 'zod'
import { getJson } from './client.ts'

const ListingPage = z.object({ items: z.array(Listing), nextCursor: z.string().nullable() })

/** GET /api/listings with the given filters, newest first. */
export function fetchListings(query: ListingQueryInput = {}, signal?: AbortSignal): Promise<Page<Listing>> {
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined) params.set(name, String(value))
  }
  const search = params.toString()
  return getJson(`/listings${search ? `?${search}` : ''}`, ListingPage, signal)
}
