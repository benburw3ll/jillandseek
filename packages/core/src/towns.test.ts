import { describe, expect, it } from 'vitest'
import { DogForm, DogFormPatch, detectPhotoType, PhotoName, photoTypeOf } from './dog.ts'
import { distanceKm, findTown, TOWNS } from './towns.ts'

// The towns table holds public Census place names; every dog here is made up.

describe('the towns table', () => {
  it('holds Minnesota towns with coordinates inside the state', () => {
    expect(TOWNS.length).toBeGreaterThan(500)
    for (const t of TOWNS) {
      expect(t.lat).toBeGreaterThan(43.4)
      expect(t.lat).toBeLessThan(49.4)
      expect(t.lon).toBeGreaterThan(-97.3)
      expect(t.lon).toBeLessThan(-89.4)
    }
  })

  it('finds a town however its name is typed, and nothing for a made-up one', () => {
    expect(findTown('ada')?.name).toBe('Ada')
    expect(findTown('  Saint Paul ')?.name).toBe('St. Paul')
    expect(findTown('St Paul')?.name).toBe('St. Paul')
    expect(findTown('Quuxville')).toBeNull()
  })

  it('measures distance in kilometres', () => {
    expect(distanceKm({ lat: 0, lon: 0 }, { lat: 0, lon: 0 })).toBe(0)
    expect(distanceKm({ lat: 0, lon: 0 }, { lat: 1, lon: 0 })).toBeCloseTo(111.2, 0)
  })
})

describe('DogForm', () => {
  const at = '2026-01-10T12:00:00.000Z'

  it('places a last-seen town at its coordinates from the local table, at town precision', () => {
    const town = findTown('Afton')
    const dog = DogForm.parse({ label: 'Zorbulon', lastSeenAt: at, lastSeenTown: 'afton' })
    expect(dog).toMatchObject({ lastSeenTown: 'Afton', lat: town?.lat, lon: town?.lon, placePrecision: 'town' })
  })

  it('refuses a town the table does not hold, and a lat or lon of its own', () => {
    expect(DogForm.safeParse({ lastSeenAt: at, lastSeenTown: 'Quuxville' }).success).toBe(false)
    expect(DogForm.safeParse({ lastSeenAt: at, lastSeenTown: 'Ada', lat: 0, lon: 0 }).success).toBe(false)
  })

  it('moves the place only when a patch names a new town', () => {
    expect(DogFormPatch.parse({ notes: 'made-up note' })).toEqual({ notes: 'made-up note' })
    expect(DogFormPatch.parse({ lastSeenTown: 'Ada', status: 'found' })).toMatchObject({
      lastSeenTown: 'Ada',
      placePrecision: 'town',
      status: 'found',
    })
  })
})

const ascii = (text: string) => Uint8Array.from(text, (ch) => ch.charCodeAt(0))

describe('photos', () => {
  it('knows an image by its first bytes, never by a name', () => {
    expect(detectPhotoType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
    expect(detectPhotoType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png')
    expect(detectPhotoType(ascii('RIFF\0\0\0\0WEBPVP8 '))).toBe('image/webp')
    expect(detectPhotoType(ascii('<svg onload="x">'))).toBeNull()
    expect(detectPhotoType(new Uint8Array([]))).toBeNull()
  })

  it('takes only the one file-name shape the server writes', () => {
    const name = `${'0a'.repeat(16)}.png`
    expect(PhotoName.safeParse(name).success).toBe(true)
    expect(photoTypeOf(name)).toBe('image/png')
    for (const bad of ['notes.txt', '../x.jpg', `${'0a'.repeat(16)}.svg`, `${'0A'.repeat(16)}.jpg`, `a/${name}`]) {
      expect(PhotoName.safeParse(bad).success).toBe(false)
    }
  })
})
