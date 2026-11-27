import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { fakeApi, listing, renderAt, source } from '../test/render.tsx'

// All listings and sources are made up.

const sources = { items: [source], listingCounts: {} }

describe('Listings', () => {
  it('shows its empty state when the API returns nothing', async () => {
    const urls = fakeApi({ '/api/listings': { items: [], nextCursor: null }, '/api/sources': sources })
    renderAt('/listings')
    expect(await screen.findByText(/Listings appear after the first sweep/)).toBeTruthy()
    expect(urls).toContain('/api/listings')
  })

  it('shows a card per listing with its facts, photo and a link to the original post', async () => {
    fakeApi({
      '/api/listings': {
        items: [
          listing(2, { photoUrls: ['https://shelter.example.com/photos/Z-2.jpg'], county: 'Zorbulon' }),
          listing(1, { kind: 'found' }),
        ],
        nextCursor: null,
      },
      '/api/sources': sources,
    })
    renderAt('/listings')
    const links = await screen.findAllByRole('link', { name: /Open the original post/ })
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://shelter.example.com/animals/Z-2',
      'https://shelter.example.com/animals/Z-1',
    ])
    expect(screen.getByText('Found', { selector: 'strong' })).toBeTruthy()
    expect(screen.getAllByText('zorbulon hound')).toHaveLength(2)
    expect(screen.getAllByText('teal')).toHaveLength(2)
    expect(screen.getByText(/Quuxville · Zorbulon County/)).toBeTruthy()
    expect(await screen.findAllByText(/Zorbulon County Shelter/)).toHaveLength(2)
    const img = document.querySelector('img')
    expect(img?.getAttribute('src')).toBe('https://shelter.example.com/photos/Z-2.jpg')
    expect(img?.getAttribute('loading')).toBe('lazy')
    expect(img?.getAttribute('referrerpolicy')).toBe('no-referrer')
  })

  it('filters by kind and place through the URL, and asks the API with those filters', async () => {
    const urls = fakeApi({ '/api/listings': { items: [listing(1)], nextCursor: null }, '/api/sources': sources })
    renderAt('/listings?kind=found&town=Quuxville')
    await screen.findAllByRole('link', { name: /Open the original post/ })
    expect(urls).toContain('/api/listings?kind=found&town=Quuxville')
    expect((screen.getByLabelText('Kind') as HTMLSelectElement).value).toBe('found')

    fireEvent.change(screen.getByLabelText('Kind'), { target: { value: 'shelter-stray' } })
    await waitFor(() => expect(urls).toContain('/api/listings?kind=shelter-stray&town=Quuxville'))

    fireEvent.change(screen.getByLabelText('County'), { target: { value: 'Zorbulon' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(urls).toContain('/api/listings?kind=shelter-stray&town=Quuxville&county=Zorbulon'))

    fireEvent.click(screen.getByLabelText('Show gone listings'))
    await waitFor(() => expect(urls.at(-1)).toContain('includeGone=true'))
  })

  it('pages with the cursor, newest first', async () => {
    const urls = fakeApi({ '/api/listings': { items: [listing(3)], nextCursor: 'abc' }, '/api/sources': sources })
    renderAt('/listings')
    fireEvent.click(await screen.findByRole('button', { name: 'Show more listings' }))
    await waitFor(() => expect(urls).toContain('/api/listings?cursor=abc'))
  })

  it('says so when the API fails', async () => {
    fakeApi({})
    renderAt('/listings')
    expect((await screen.findByRole('alert')).textContent).toContain('could not be loaded')
  })
})
