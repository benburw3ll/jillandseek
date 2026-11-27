import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { fakeApi, listing, renderAt, source } from '../test/render.tsx'

// A made-up dog and synthetic listings. Nothing here is a real dog, post or place.

const RAN = '2026-01-10T12:30:00.000Z'

const dog = {
  id: 7,
  label: 'Zorbulon',
  lastSeenAt: '2026-01-08T12:00:00.000Z',
  lastSeenTown: 'Quuxville',
  lastSeenPlace: null,
  lat: null,
  lon: null,
  placePrecision: 'unknown',
  traits: { breeds: ['zorbulon hound'], colors: ['teal'], size: 'small', sex: 'female', age: 'adult' },
  marks: null,
  notes: null,
  photos: [],
  status: 'missing',
  foundAt: null,
  createdAt: '2026-01-08T13:00:00.000Z',
  updatedAt: '2026-01-08T13:00:00.000Z',
}

const match = (listingId: number, extra: Record<string, unknown> = {}) => ({
  dogId: 7,
  listingId,
  score: 0.8765,
  band: 'strong',
  reasons: [`Reason for listing ${listingId}`],
  setAsideReason: null,
  computedAt: RAN,
  ...extra,
})

const items = [
  {
    match: match(2, { reasons: ['Found 3 km from where she was last seen', 'Breed: zorbulon hound, the same'] }),
    listing: listing(2, { kind: 'found', firstSeenAt: '2026-01-10T13:00:00.000Z' }),
  },
  { match: match(1, { band: 'weak', score: 0.3 }), listing: listing(1) },
  {
    match: match(3, {
      band: 'weak',
      score: 0.9,
      setAsideReason: 'before-missing',
      reasons: ['Set aside: dated 3 days before she was last seen'],
    }),
    listing: listing(3),
  },
]

const api = (matches: unknown) => ({
  '/api/dogs/7': dog,
  '/api/dogs/7/matches': matches,
  '/api/sources': { items: [source], listingCounts: {} },
})

afterEach(() => window.localStorage.clear())

describe('the dog page', () => {
  it('shows the dog, then its ranked synthetic listings with their bands and reasons', async () => {
    fakeApi(api({ items, ranAt: RAN }))
    renderAt('/dogs/7')
    expect(await screen.findByRole('heading', { name: 'Zorbulon' })).toBeTruthy()
    expect(screen.getByText(/last seen in Quuxville, 2026-01-08/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Edit/ }).getAttribute('href')).toBe('/find/7')
    expect(screen.getByRole('button', { name: 'Mark found' })).toBeTruthy()

    const ranked = screen.getByRole('heading', { name: 'Ranked listings (2)' }).nextElementSibling as HTMLElement
    const cards = within(ranked)
      .getAllByRole('listitem')
      .filter((li) => li.classList.contains('listing-card'))
    expect(cards).toHaveLength(2)
    expect(within(cards[0] as HTMLElement).getByText('Strong')).toBeTruthy()
    expect(within(cards[0] as HTMLElement).getByText('Found 3 km from where she was last seen')).toBeTruthy()
    expect(within(cards[0] as HTMLElement).getByText('Breed: zorbulon hound, the same')).toBeTruthy()
    expect(within(cards[1] as HTMLElement).getByText('Weak')).toBeTruthy()
    expect(within(cards[1] as HTMLElement).getByText('Reason for listing 1')).toBeTruthy()
    expect(
      screen.getByText('A ranking is not an identification. Go and see any dog that might be yours, in person.'),
    ).toBeTruthy()
  })

  it('keeps set-aside listings on the page, collapsed, each with its reason', async () => {
    fakeApi(api({ items, ranAt: RAN }))
    renderAt('/dogs/7')
    const summary = await screen.findByText(/^Set aside \(1\)/)
    const details = summary.closest('details') as HTMLDetailsElement
    expect(details.open).toBe(false)
    expect(within(details).getByText('Set aside: dated 3 days before she was last seen')).toBeTruthy()
    expect(
      within(details)
        .getByRole('link', { name: /Open the original post/ })
        .getAttribute('href'),
    ).toBe('https://shelter.example.com/animals/Z-3')
  })

  it('never shows a score or a percent, and never claims an identification', async () => {
    fakeApi(api({ items, ranAt: RAN }))
    const { container } = renderAt('/dogs/7')
    await screen.findByRole('heading', { name: 'Zorbulon' })
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/%|0\.8765|0\.9\b|0\.3\b|87\.6|score/i)
    expect(text).not.toMatch(/match found|found your dog|identified/i)
  })

  it('marks listings first seen since the last visit as new, with the visit kept in the browser', async () => {
    window.localStorage.setItem('jillandseek:dog-visit:7', '2026-01-10T12:30:00.000Z')
    fakeApi(api({ items, ranAt: RAN }))
    renderAt('/dogs/7')
    const marker = await screen.findByText('New since your last visit')
    expect(marker.closest('li')?.textContent).toContain('Found 3 km')
    expect(screen.getAllByText('New since your last visit')).toHaveLength(1)
    expect(window.localStorage.getItem('jillandseek:dog-visit:7')).not.toBe('2026-01-10T12:30:00.000Z')
  })

  it('re-runs matching from its button and shows when it last ran', async () => {
    const urls = fakeApi(api({ items, ranAt: RAN }))
    renderAt('/dogs/7')
    expect(await screen.findByText(/^Matching last ran /)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Re-run matching now' }))
    expect(await screen.findByText('Matching ran again.')).toBeTruthy()
    await waitFor(() => expect(urls.filter((u) => u === '/api/dogs/7/matches').length).toBe(2))
  })

  it('says when there are no listings yet', async () => {
    fakeApi(api({ items: [], ranAt: null }))
    renderAt('/dogs/7')
    expect(await screen.findByText('No listings yet. The sweep runs every 30 minutes.')).toBeTruthy()
  })

  it('says so when the API fails', async () => {
    fakeApi({})
    renderAt('/dogs/7')
    expect((await screen.findByRole('alert')).textContent).toContain('could not be loaded')
  })
})
