import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ListingCandidate } from '@jillandseek/core'
import { describe, expect, it } from 'vitest'
import { checkRegistry, collectorIds, registryEntries } from '../index.ts'
import { isFullMaccRead, MACC_STRAYS_URL, maccStrays, parseMaccStrays } from './macc-strays.ts'

// The fixture is a made-up page in the list page's markup shape: invented animals, ids and photos.

const maccFixture = readFileSync(join(import.meta.dirname, 'fixtures', 'macc-strays.html.txt'), 'utf8')
const page = (body: string) => ({ url: MACC_STRAYS_URL, status: 200, contentType: 'text/html', body })

describe('the macc-strays collector', () => {
  it('turns the synthetic fixture into the expected listings', () => {
    const listings = parseMaccStrays(page(maccFixture)).map((l) => ListingCandidate.parse(l))
    expect(listings).toHaveLength(3)
    expect(listings[0]).toMatchObject({
      sourceId: 'macc-strays',
      sourceKey: 'Z900001',
      url: 'https://24petconnect.com/MACCStrayPets/Details/ZZPL/Z900001',
      kind: 'shelter-stray',
      species: 'dog',
      postedAt: '2026-01-08T12:00:00.000Z',
      placeText: '100 Block Quux St, Minneapolis Mn 55400',
      town: 'Minneapolis',
      county: 'Hennepin',
      traits: { breeds: ['quux hound', 'mix'], colors: [], size: 'medium', sex: 'female', age: 'young' },
      photoUrls: ['https://24petconnect.com/image/100000001'],
      contact: null,
    })
    expect(listings[1]).toMatchObject({
      sourceKey: 'Z900002',
      placeText: 'Quux Park',
      town: null,
      county: null,
      traits: { breeds: ['zorbulon terrier'], size: 'unknown', sex: 'male', age: 'puppy' },
    })
    expect(listings[2]).toMatchObject({
      sourceKey: 'Z900003',
      postedAt: null,
      placeText: null,
      traits: { breeds: [], size: 'small', sex: 'unknown', age: 'senior' },
    })
  })

  it('counts a page as a full read only when it shows the whole list', () => {
    expect(isFullMaccRead([page(maccFixture)])).toBe(true)
    expect(isFullMaccRead([page(maccFixture.replace('1 - 3 of 3', '1 - 3 of 9'))])).toBe(false)
    expect(isFullMaccRead([page('<html>changed</html>')])).toBe(false)
    expect(isFullMaccRead([page(maccFixture.replace('id="Result_Z900002"', 'id="changed"'))])).toBe(false)
    expect(parseMaccStrays(page('<html>changed</html>'))).toEqual([])
  })

  it('is registered with a checked, automatic registry entry, at most every 30 minutes', () => {
    expect(collectorIds).toContain('macc-strays')
    expect(maccStrays.minIntervalMinutes).toBeGreaterThanOrEqual(30)
    const entry = registryEntries.find((e) => e.id === 'macc-strays')
    expect(entry).toMatchObject({ access: 'automatic', collector: 'macc-strays', checkedOn: '2026-11-26' })
    expect(entry?.checkNote).toMatch(/robots/)
    expect(entry?.checkNote).toMatch(/terms/)
    expect(checkRegistry(registryEntries, collectorIds)).toEqual([])
  })
})
