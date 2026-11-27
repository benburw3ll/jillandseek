import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { fakeApi, renderAt, source } from '../test/render.tsx'

describe('Sources', () => {
  it('shows its empty state when the API returns nothing', async () => {
    const urls = fakeApi({ '/api/sources': { items: [] } })
    renderAt('/sources')
    expect(await screen.findByText('No sources yet.')).toBeTruthy()
    expect(urls).toEqual(['/api/sources'])
  })

  it('lists each source with what it covers and how it is read', async () => {
    fakeApi({ '/api/sources': { items: [source] } })
    renderAt('/sources')
    expect(await screen.findByRole('link', { name: /Zorbulon County Shelter/ })).toBeTruthy()
    expect(screen.getByText('Link only')).toBeTruthy()
    expect(screen.getByText('Zorbulon County')).toBeTruthy()
  })

  it('says so when the API answers a shape it does not know', async () => {
    fakeApi({ '/api/sources': { items: [{ id: 'zorbulon' }] } })
    renderAt('/sources')
    expect((await screen.findByRole('alert')).textContent).toContain('could not be loaded')
  })
})
