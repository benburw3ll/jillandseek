import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderAt } from '../test/render.tsx'

// Find a dog (#17). The dog is made up; the town is a public Census name.

const T0 = '2026-01-10T12:00:00.000Z'
const dog = (extra: Record<string, unknown> = {}) => ({
  id: 7,
  label: 'Zorbulon',
  lastSeenAt: T0,
  lastSeenTown: 'Ada',
  lastSeenPlace: null,
  lat: 47.299,
  lon: -96.516,
  placePrecision: 'town',
  traits: { breeds: ['zorbulon hound'], colors: ['teal'], size: 'small', sex: 'unknown', age: 'unknown' },
  marks: null,
  notes: null,
  photos: [],
  status: 'missing',
  foundAt: null,
  createdAt: T0,
  updatedAt: T0,
  ...extra,
})

/** A fake API that records every request, answering from `answer`. */
function api(answer: (method: string, path: string, body: unknown) => unknown) {
  const calls: { method: string; path: string; body: unknown; headers: Record<string, string> }[] = []
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const method = init.method ?? 'GET'
    const path = String(input)
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body
    calls.push({ method, path, body, headers: (init.headers ?? {}) as Record<string, string> })
    const out = answer(method, path, body)
    if (out === undefined) return new Response('{"error":{"code":"not-found"}}', { status: 404 })
    return new Response(JSON.stringify(out), { status: method === 'POST' ? 201 : 200 })
  })
  return calls
}

describe('Find a dog', () => {
  it('names what to fix, in a focused summary, before anything is sent', async () => {
    const calls = api((m, p) => (m === 'GET' && p === '/api/dogs' ? { items: [] } : undefined))
    renderAt('/find')
    fireEvent.change(screen.getByLabelText('Minnesota town'), { target: { value: 'Quuxville' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save the dog' }))
    const summary = await screen.findByRole('alert')
    expect(summary.textContent).toContain('Pick the town from the list')
    expect(summary.textContent).toContain('Give the date and time')
    await waitFor(() => expect(document.activeElement).toBe(summary))
    expect(calls.filter((c) => c.method !== 'GET')).toEqual([])
  })

  it('sends a new dog to its own server only, with the town and traits from the form', async () => {
    const calls = api((m, p) => {
      if (m === 'GET' && p === '/api/dogs') return { items: [] }
      if (m === 'POST' && p === '/api/dogs') return dog()
      return undefined
    })
    renderAt('/find')
    fireEvent.change(screen.getByLabelText('Label (optional)'), { target: { value: 'Zorbulon' } })
    fireEvent.change(screen.getByLabelText('Minnesota town'), { target: { value: 'ada' } })
    fireEvent.change(screen.getByLabelText('Date and time'), { target: { value: '2026-01-10T06:00' } })
    fireEvent.change(screen.getByLabelText('Breed words'), { target: { value: 'Zorbulon Hound, mix' } })
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'small' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save the dog' }))
    expect(await screen.findByText('The dog was saved.')).toBeTruthy()
    const post = calls.find((c) => c.method === 'POST')
    expect(post?.path).toBe('/api/dogs')
    expect(post?.headers['x-jill-and-seek']).toBe('1')
    expect(post?.body).toMatchObject({
      label: 'Zorbulon',
      lastSeenTown: 'ada',
      traits: { breeds: ['Zorbulon Hound', 'mix'], size: 'small', sex: 'unknown' },
    })
    expect(post?.body).not.toHaveProperty('lat')
    expect(calls.every((c) => c.path.startsWith('/api/'))).toBe(true)
  })

  it('lists missing and found dogs, and marks one found', async () => {
    const calls = api((m, p) => {
      if (m === 'GET' && p === '/api/dogs') return { items: [dog()] }
      if (m === 'PATCH' && p === '/api/dogs/7') return dog({ status: 'found', foundAt: T0 })
      return undefined
    })
    renderAt('/find')
    // Queries run inside the list item: the page also holds the 900-odd town options.
    const item = within((await screen.findByText('Zorbulon', { selector: 'strong' })).closest('li') as HTMLElement)
    // jsdom drops the space before a visually hidden span; a browser keeps it.
    expect(item.getByRole('link', { name: /^Edit\s*Zorbulon$/ }).getAttribute('href')).toBe('/find/7')
    fireEvent.click(item.getByRole('button', { name: /^Mark found\s*Zorbulon$/ }))
    expect(await screen.findByText(/Marked found/)).toBeTruthy()
    expect(calls.find((c) => c.method === 'PATCH')?.body).toEqual({ status: 'found' })
    expect(screen.getByText('Found 2026-01-10')).toBeTruthy()
  })

  it('edits a dog from its saved values', async () => {
    const calls = api((m, p) => {
      if (p === '/api/dogs/7') return m === 'GET' ? dog() : dog({ notes: 'made-up note' })
      if (m === 'GET' && p === '/api/dogs') return { items: [] }
      return undefined
    })
    renderAt('/find/7')
    const town = (await screen.findByLabelText('Minnesota town')) as HTMLInputElement
    expect(town.value).toBe('Ada')
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'made-up note' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(calls.some((c) => c.method === 'PATCH')).toBe(true))
    const patch = calls.find((c) => c.method === 'PATCH')
    expect(patch?.body).toMatchObject({ notes: 'made-up note', lastSeenTown: 'Ada' })
    // The time field was not touched, so the saved time is not rewritten to whole minutes.
    expect(patch?.body).not.toHaveProperty('lastSeenAt')
  })

  it('after a failed photo, saving again retries the photo on the same dog and never makes a second', async () => {
    let photoTries = 0
    const calls = api((m, p) => {
      if (m === 'GET' && p === '/api/dogs') return { items: [] }
      if (m === 'POST' && p === '/api/dogs') return dog()
      if (m === 'PATCH' && p === '/api/dogs/7') return dog()
      if (m === 'POST' && p === '/api/dogs/7/photos') return ++photoTries === 1 ? undefined : dog()
      return undefined
    })
    renderAt('/find')
    fireEvent.change(screen.getByLabelText('Minnesota town'), { target: { value: 'Ada' } })
    fireEvent.change(screen.getByLabelText('Date and time'), { target: { value: '2026-01-10T06:00' } })
    const photo = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'zorbulon.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('Add photos'), { target: { files: [photo] } })
    fireEvent.click(screen.getByRole('button', { name: 'Save the dog' }))
    expect(await screen.findByText(/1 photo\(s\) could not be/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(photoTries).toBe(2))
    expect(calls.filter((c) => c.method === 'POST' && c.path === '/api/dogs')).toHaveLength(1)
    expect(calls.some((c) => c.method === 'PATCH' && c.path === '/api/dogs/7')).toBe(true)
    // The photo goes as its own bytes with its image type, never as a form.
    expect(calls.find((c) => c.path === '/api/dogs/7/photos')?.headers['content-type']).toBe('image/png')
  })
})
