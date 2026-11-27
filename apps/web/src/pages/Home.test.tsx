import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import memorial from '../content/memorial.md?raw'
import { fakeApi, renderAt } from '../test/render.tsx'
import { readMemorial } from './Home.tsx'

describe('Home', () => {
  it('says what Jill and Seek is, links to Find a dog and shows the memorial block', () => {
    const urls = fakeApi({})
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Jill and Seek' })).toBeTruthy()
    expect(screen.getByText(/lost-dog finder for Minnesota/)).toBeTruthy()
    const links = screen.getAllByRole('link', { name: 'Find a dog' })
    expect(links.some((a) => a.getAttribute('href') === '/find')).toBe(true)
    const block = screen.getByRole('region', { name: /Placeholder/ })
    expect(block.textContent).toContain("Placeholder: the owner's words about Jill go here.")
    expect(urls).toEqual([])
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
    expect(names).toEqual(['Home', 'Find a dog', 'Listings', 'Sources'])
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('Home')
  })
})

describe('Find a dog', () => {
  it('is a placeholder until O4 builds the form', () => {
    fakeApi({})
    renderAt('/find')
    expect(screen.getByRole('heading', { level: 1, name: 'Find a dog' })).toBeTruthy()
    expect(screen.getByText(/Not built yet/)).toBeTruthy()
  })
})
