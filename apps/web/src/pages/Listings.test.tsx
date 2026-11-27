import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { fakeApi, listing, renderAt } from '../test/render.tsx'

describe('Listings', () => {
  it('shows its empty state when the API returns nothing', async () => {
    const urls = fakeApi({ '/api/listings': { items: [], nextCursor: null } })
    renderAt('/listings')
    expect(await screen.findByText(/Listings appear after the first sweep/)).toBeTruthy()
    expect(urls).toEqual(['/api/listings'])
  })

  it('lists what the API returns, with a link to each original post', async () => {
    fakeApi({ '/api/listings': { items: [listing(2), listing(1, { kind: 'found' })], nextCursor: null } })
    renderAt('/listings')
    const links = await screen.findAllByRole('link', { name: /Open the original post/ })
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://shelter.example.com/animals/Z-2',
      'https://shelter.example.com/animals/Z-1',
    ])
    expect(screen.getByText('Found')).toBeTruthy()
  })

  it('says so when the API fails', async () => {
    fakeApi({})
    renderAt('/listings')
    expect((await screen.findByRole('alert')).textContent).toContain('could not be loaded')
  })
})
