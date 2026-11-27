import type { Age, ListingCandidateInput, Sex, Size } from '@jillandseek/core'
import { type HTMLElement, parse as parseHtml } from 'node-html-parser'
import type { Collector } from '../collector.ts'
import type { FetchedPage } from '../fetcher/fetcher.ts'

// Minneapolis Animal Care and Control's stray dogs, as listed on 24PetConnect (#14). It reads the
// one list page only. Colour is not on that page; reading a detail page per dog every 30 minutes
// would multiply the requests, so colour stays unknown until a later change reads new dogs only.
// Robots and terms were checked on 2026-11-26 (the registry entry `macc-strays` records them).

const ORIGIN = 'https://24petconnect.com'
export const MACC_STRAYS_URL = `${ORIGIN}/MACCStrayPets?at=DOG`

const text = (card: HTMLElement, field: string): string | null => {
  const value = card.querySelector(`.text_${field}`)?.text.replace(/\s+/g, ' ').trim()
  return value ? value : null
}

/** "Female", "Spayed Female", "Neutered Male" → the sex; anything else is unknown. */
function sexOf(value: string | null): Sex {
  const v = (value ?? '').toLowerCase()
  if (/\bfemale\b/.test(v)) return 'female'
  if (/\bmale\b/.test(v)) return 'male'
  return 'unknown'
}

/** "4 months", "2 years" → an age band; anything else is unknown. */
function ageOf(value: string | null): Age {
  const m = /^(\d+)\s*(day|week|month|year)s?/i.exec(value ?? '')
  if (!m) return 'unknown'
  const n = Number(m[1])
  const unit = (m[2] ?? '').toLowerCase()
  const years = unit === 'year' ? n : unit === 'month' ? n / 12 : 0
  if (years < 1) return 'puppy'
  if (years < 3) return 'young'
  if (years < 8) return 'adult'
  return 'senior'
}

/** "53 pounds" → a size band; anything else is unknown. */
function sizeOf(value: string | null): Size {
  const m = /^(\d+(?:\.\d+)?)\s*(pound|lb)/i.exec(value ?? '')
  if (!m) return 'unknown'
  const lb = Number(m[1])
  if (lb < 25) return 'small'
  if (lb <= 60) return 'medium'
  return 'large'
}

/** "2026.01.08" → that day at noon UTC (the page gives a day, not a time). */
function dayOf(value: string | null): string | null {
  const m = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value ?? '')
  if (!m) return null
  const moment = new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00.000Z`)
  return Number.isNaN(moment.getTime()) ? null : moment.toISOString()
}

/** "Quux Hound/Mix" → ["quux hound", "mix"]: the words as posted, lower-cased. */
const words = (value: string | null): string[] =>
  (value ?? '')
    .split('/')
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20)

/** A place ending in "Minneapolis Mn" (with or without a ZIP code) is in Minneapolis, Hennepin County. */
const IN_MINNEAPOLIS = /,\s*minneapolis,?\s+mn(\s+\d{5})?$/i

export function parseMaccStrays(page: FetchedPage): ListingCandidateInput[] {
  const root = parseHtml(page.body)
  const out: ListingCandidateInput[] = []
  for (const card of root.querySelectorAll('.gridResult')) {
    const details = /Details\('([A-Za-z0-9]+)',\s*'([A-Za-z0-9]+)',\s*'([A-Za-z0-9]+)'\)/.exec(
      card.getAttribute('onclick') ?? '',
    )
    const shelterId = details?.[3] ?? /^Result_([A-Za-z0-9]+)$/.exec(card.id)?.[1]
    if (shelterId === undefined) continue
    const type = text(card, 'Animaltype')
    if (type !== null && type.toLowerCase() !== 'dog') continue
    const url = details ? `${ORIGIN}/${details[1]}/Details/${details[2]}/${details[3]}` : MACC_STRAYS_URL
    const src = card.querySelector('img')?.getAttribute('src')
    const photo = src ? new URL(src, ORIGIN) : null
    const place = text(card, 'LocationFound')
    const inMinneapolis = place !== null && IN_MINNEAPOLIS.test(place)
    out.push({
      sourceId: 'macc-strays',
      sourceKey: shelterId,
      url,
      kind: 'shelter-stray',
      species: type === null ? 'unknown' : 'dog',
      postedAt: dayOf(text(card, 'Broughttotheshelter')),
      placeText: place,
      town: inMinneapolis ? 'Minneapolis' : null,
      county: inMinneapolis ? 'Hennepin' : null,
      traits: {
        breeds: words(text(card, 'Breed')),
        colors: [],
        size: sizeOf(text(card, 'Weight')),
        sex: sexOf(text(card, 'Gender')),
        age: ageOf(text(card, 'Age')),
      },
      photoUrls: photo && photo.protocol === 'https:' ? [photo.href] : [],
    })
  }
  return out
}

/** "Animals: 1 - 24 of 24" with every card present: the page is the whole list. */
export function isFullMaccRead(pages: FetchedPage[]): boolean {
  return (
    pages.length > 0 &&
    pages.every((page) => {
      const m = /Animals:\s*(\d+)\s*-\s*(\d+)\s*of\s*(\d+)/.exec(page.body)
      if (!m) return false
      const cards = parseHtml(page.body).querySelectorAll('.gridResult')
      // Every card must carry an id the parser can read, or a changed card would look like a gone dog.
      const readable = cards.every((c) => /^Result_[A-Za-z0-9]+$/.test(c.id))
      return m[1] === '1' && m[2] === m[3] && Number(m[3]) === cards.length && readable
    })
  )
}

export const maccStrays: Collector = {
  id: 'macc-strays',
  sourceId: 'macc-strays',
  minIntervalMinutes: 30,
  fetchPages: async (fetcher) => [await fetcher.get(MACC_STRAYS_URL)],
  parse: parseMaccStrays,
  isFullRead: isFullMaccRead,
}
