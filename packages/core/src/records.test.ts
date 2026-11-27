import { describe, expect, it } from 'vitest'
import { DogPatch, daysBefore, Instant, ListingCandidate } from './index.ts'

// Made-up values only: an invented source, an invented town and coordinates at 0, 0.
const candidate = { sourceId: 'zorbulon-shelter', sourceKey: 'Z-1', url: 'https://shelter.example.com/z-1' }

describe('ListingCandidate', () => {
  it('fills unknowns for what a source did not give', () => {
    const c = ListingCandidate.parse(candidate)
    expect(c.kind).toBe('unknown')
    expect(c.traits).toEqual({ breeds: [], colors: [], size: 'unknown', sex: 'unknown', age: 'unknown' })
    expect(c.placePrecision).toBe('unknown')
    expect(c.photoUrls).toEqual([])
  })

  it('keeps breed and colour words as posted, in lower case', () => {
    const c = ListingCandidate.parse({ ...candidate, traits: { breeds: [' Zorbulon Hound '], colors: ['Teal'] } })
    expect(c.traits.breeds).toEqual(['zorbulon hound'])
    expect(c.traits.colors).toEqual(['teal'])
  })

  it('refuses a half-placed place and a non-web url', () => {
    expect(ListingCandidate.safeParse({ ...candidate, lat: 0 }).success).toBe(false)
    expect(ListingCandidate.safeParse({ ...candidate, lat: 0, lon: 0 }).success).toBe(false)
    expect(ListingCandidate.safeParse({ ...candidate, lat: 0, lon: 0, placePrecision: 'town' }).success).toBe(true)
    expect(ListingCandidate.safeParse({ ...candidate, url: 'javascript:void(0)' }).success).toBe(false)
  })
})

describe('DogPatch', () => {
  it('holds only the fields given, with no defaults filled in', () => {
    expect(DogPatch.parse({ status: 'found' })).toEqual({ status: 'found' })
    expect(DogPatch.safeParse({ photos: ['x.jpg'] }).success).toBe(false)
  })
})

describe('time', () => {
  it('takes UTC moments with milliseconds only', () => {
    expect(Instant.safeParse('2026-01-02T03:04:05.000Z').success).toBe(true)
    expect(Instant.safeParse('2026-01-02T03:04:05Z').success).toBe(false)
    expect(Instant.safeParse('2026-01-02T03:04:05.000+01:00').success).toBe(false)
  })

  it('counts days back from the moment passed in', () => {
    expect(daysBefore('2026-03-31T12:00:00.000Z', 30)).toBe('2026-03-01T12:00:00.000Z')
  })
})
