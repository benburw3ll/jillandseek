import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import memorial from '../content/memorial.md?raw'
import { fakeApi, renderAt } from '../test/render.tsx'
import { readMemorial } from './Home.tsx'

describe('Home', () => {
  it('is the search itself, with no intro and no button to another page, above the memorial block', () => {
    const urls = fakeApi({ '/api/dogs': { items: [] } })
    const { container } = renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Find a dog' })).toBeTruthy()
    expect(screen.getByRole('form', { name: 'A new missing dog' })).toBeTruthy()
    expect(screen.getByLabelText('Minnesota town')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Search' })).toBeTruthy()
    expect(screen.queryByText(/lost-dog finder for Minnesota/)).toBeNull()
    expect(container.querySelector('a[href="/find"]')).toBeNull()
    const block = screen.getByRole('region', { name: /Placeholder/ })
    expect(block.textContent).toContain("Placeholder: the owner's words about Jill go here.")
    // The form comes before the memorial block, and the page asks only its own server.
    const form = screen.getByRole('form', { name: 'A new missing dog' })
    expect(form.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(urls.every((u) => u.startsWith('/api/'))).toBe(true)
  })

  it('reads the memorial from its one content file, which holds placeholder text', () => {
    const { heading, paragraphs } = readMemorial(memorial)
    expect(heading).toMatch(/^Placeholder/)
    expect(paragraphs.every((p) => p.startsWith('Placeholder'))).toBe(true)
    expect(readMemorial('<!-- note -->\n\n# Zorbulon\n\nOne.\n\nTwo.')).toEqual({
      heading: 'Zorbulon',
      paragraphs: ['One.', 'Two.'],
    })
  })

  it('has the header and navigation, marking the current page', () => {
    fakeApi({})
    renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    const names = [...nav.querySelectorAll('a')].map((a) => a.textContent)
    expect(names).toEqual(['Find a dog', 'Listings', 'Sources'])
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('Find a dog')
  })
})

describe('Find a dog', () => {
  it('holds the form for a missing dog, and an old link to /find lands on it', () => {
    fakeApi({ '/api/dogs': { items: [] } })
    renderAt('/find')
    expect(screen.getByRole('heading', { level: 1, name: 'Find a dog' })).toBeTruthy()
    expect(screen.getByLabelText('Minnesota town')).toBeTruthy()
  })
})
