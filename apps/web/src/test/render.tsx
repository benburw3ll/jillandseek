import { cleanup, render } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { Router } from 'wouter'
import { memoryLocation } from 'wouter/memory-location'
import { App } from '../App.tsx'

// Test helpers: the site at a path, with a fake API behind `fetch`. All data is made up.

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

/** Answers each /api path from the table, and 404 for any other; records every URL asked for. */
export function fakeApi(answers: Record<string, unknown>) {
  const urls: string[] = []
  vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
    const url = String(input)
    urls.push(url)
    const path = url.split('?')[0] ?? url
    if (!(path in answers)) return new Response('{"error":{"code":"not-found"}}', { status: 404 })
    return new Response(JSON.stringify(answers[path]), { headers: { 'content-type': 'application/json' } })
  })
  return urls
}

export function renderAt(path: string) {
  const { hook, searchHook } = memoryLocation({ path })
  return render(
    <Router hook={hook} searchHook={searchHook}>
      <App />
    </Router>,
  )
}

export const listing = (id: number, extra: Record<string, unknown> = {}) => ({
  id,
  sourceId: 'zorbulon-shelter',
  sourceKey: `Z-${id}`,
  url: `https://shelter.example.com/animals/Z-${id}`,
  kind: 'shelter-stray',
  species: 'dog',
  postedAt: null,
  firstSeenAt: '2026-01-10T12:00:00.000Z',
  lastSeenAt: '2026-01-10T12:00:00.000Z',
  goneAt: null,
  placeText: null,
  town: 'Quuxville',
  county: null,
  lat: null,
  lon: null,
  placePrecision: 'unknown',
  traits: { breeds: ['zorbulon hound'], colors: ['teal'], size: 'small', sex: 'unknown', age: 'unknown' },
  text: null,
  photoUrls: [],
  contact: null,
  ...extra,
})

export const source = {
  id: 'zorbulon-shelter',
  name: 'Zorbulon County Shelter',
  url: 'https://shelter.example.com/',
  region: 'Zorbulon County',
  listingKinds: ['shelter-stray'],
  access: 'link',
  collector: null,
  checkedOn: null,
  checkNote: null,
  notes: null,
  status: 'active',
  blockedAt: null,
  blockedReason: null,
  lastReadAt: null,
}
