import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { fakeApi, renderAt, source } from '../test/render.tsx'

// All sources and sweeps are made up.

describe('Sources', () => {
  it('shows its empty state when the API returns nothing', async () => {
    const urls = fakeApi({ '/api/sources': { items: [] } })
    renderAt('/sources')
    expect(await screen.findByText('No sources yet.')).toBeTruthy()
    expect(urls).toContain('/api/sources')
  })

  it('shows the coverage counts and each source with access, last read, status and listing count', async () => {
    fakeApi({
      '/api/sources': {
        items: [
          source,
          {
            ...source,
            id: 'quux-pound',
            name: 'Quux Pound',
            access: 'automatic',
            collector: 'quux-strays',
            checkedOn: '2026-01-01',
            checkNote: 'Made up.',
            lastReadAt: '2026-01-10T12:00:00.000Z',
          },
          {
            ...source,
            id: 'blorp-portal',
            name: 'Blorp Portal',
            access: 'automatic',
            collector: 'blorp',
            checkedOn: '2026-01-01',
            checkNote: 'Made up.',
            status: 'blocked',
            blockedAt: '2026-01-10T12:00:00.000Z',
            blockedReason: 'http-429',
          },
        ],
        listingCounts: { 'quux-pound': 7 },
      },
      '/api/sweeps': { items: [] },
    })
    renderAt('/sources')
    const coverage = await screen.findByLabelText('Coverage')
    const count = (label: string) => within(coverage).getByText(label).nextElementSibling?.textContent
    expect(count('Sources')).toBe('3')
    expect(count('Read automatically')).toBe('2')
    expect(count('Blocked')).toBe('1')
    const quux = screen.getByRole('link', { name: /Quux Pound/ }).closest('tr') as HTMLElement
    expect(within(quux).getByText('2026-01-10 12:00 UTC')).toBeTruthy()
    expect(within(quux).getByText('7')).toBeTruthy()
    expect(screen.getByText(/Blocked: the site asked us to slow down/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Zorbulon County Shelter/ }).getAttribute('href')).toBe(
      'https://shelter.example.com/',
    )
    expect(screen.getByText('Link only')).toBeTruthy()
  })

  it('says so when the API answers a shape it does not know', async () => {
    fakeApi({ '/api/sources': { items: [{ id: 'zorbulon' }] } })
    renderAt('/sources')
    expect((await screen.findByRole('alert')).textContent).toContain('could not be loaded')
  })

  it('shows "Clear the block" only beside a blocked source, and asks once before clearing it (#35)', async () => {
    const blocked = {
      ...source,
      id: 'blorp-portal',
      name: 'Blorp Portal',
      access: 'automatic',
      collector: 'blorp',
      checkedOn: '2026-01-01',
      checkNote: 'Made up.',
      status: 'blocked',
      blockedAt: '2026-01-10T12:00:00.000Z',
      blockedReason: 'challenge',
    }
    const urls = fakeApi({
      '/api/sources': { items: [source, blocked] },
      '/api/sources/blorp-portal/clear-block': { ...blocked, status: 'active', blockedAt: null, blockedReason: null },
    })
    renderAt('/sources')
    const buttons = await screen.findAllByRole('button', { name: /Clear the block/ })
    expect(buttons).toHaveLength(1)
    const row = buttons[0]?.closest('tr') as HTMLElement
    expect(within(row).getByText('Blorp Portal')).toBeTruthy()
    expect(within(row).getByText(/bot check/)).toBeTruthy()
    expect(within(row).getByText('Blocked since 2026-01-10 12:00 UTC.')).toBeTruthy()
    expect(within(row).getByText(/Check the site's robots rules and terms first/)).toBeTruthy()

    fireEvent.click(buttons[0] as HTMLElement)
    expect(urls).not.toContain('/api/sources/blorp-portal/clear-block')
    fireEvent.click(within(row).getByRole('button', { name: 'Yes, clear the block for Blorp Portal' }))
    await waitFor(() => expect(urls).toContain('/api/sources/blorp-portal/clear-block'))
    await waitFor(() => expect(screen.queryByRole('button', { name: /Clear the block/ })).toBeNull())
    expect(within(row).getByText('Active')).toBeTruthy()
  })
})
