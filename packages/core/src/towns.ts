import { TOWN_ROWS } from './towns-data.ts'

// The local towns table: Minnesota cities and towns with approximate coordinates, so a place
// is placed without any outside geocoder (#17). `scripts/refresh-towns.mjs` regenerates it.

export type Town = { name: string; lat: number; lon: number }

export const TOWNS: readonly Town[] = TOWN_ROWS.map(([name, lat, lon]) => ({ name, lat, lon }))

/** A name as typed, folded so "saint paul", "St Paul" and "St. Paul" are the same. */
export function townKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/^saint\b/, 'st')
    .replace(/\s+/g, ' ')
}

const BY_KEY = new Map(TOWNS.map((t) => [townKey(t.name), t]))

/** The town with this name, or null when the table has no such town. */
export function findTown(name: string): Town | null {
  return BY_KEY.get(townKey(name)) ?? null
}

const EARTH_KM = 6371

/** The great-circle distance between two points, in kilometres. */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLon = (b.lon - a.lon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}
