import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { listing, renderAt, source } from '../test/render.tsx'

// The search on the home screen (#59), its photo drop (#60) and the photo filling the traits
// (#61). The dog, the photo's bytes, the listings and every answer are made up; the town is a
// public Census name. No test here reaches anything but the fake API below.

const T0 = '2026-01-10T12:00:00.000Z'
const PHOTO_NAME = `${'ab'.repeat(16)}.png`
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

const match = (listingId: number, extra: Record<string, unknown> = {}) => ({
  dogId: 7,
  listingId,
  score: 0.8765,
  band: 'strong',
  reasons: [`Reason for listing ${listingId}`],
  setAsideReason: null,
  computedAt: T0,
  ...extra,
})
const matches = {
  items: [
    {
      match: match(2, { reasons: ['Found 3 km from where she was last seen'] }),
      listing: listing(2, { kind: 'found' }),
    },
    { match: match(1, { band: 'weak', score: 0.3 }), listing: listing(1) },
    {
      match: match(3, { band: 'weak', setAsideReason: 'before-missing', reasons: ['Set aside: dated before'] }),
      listing: listing(3),
    },
  ],
  ranAt: T0,
}

const aiOn = { enabled: true, keySaved: true, today: 3, dailyCap: 25, month: 40, monthlyCap: 300 }
const aiOff = { enabled: false, keySaved: false, today: 0, dailyCap: 25, month: 0, monthlyCap: 300 }
const read = (extra: Record<string, unknown> = {}) => ({
  dogVisible: true,
  traits: {
    breeds: ['zorbulon hound', 'mix'],
    colors: ['teal', 'white'],
    size: 'medium',
    sex: 'unknown',
    age: 'adult',
  },
  marks: 'A white chest patch.',
  ...extra,
})

type Call = { method: string; path: string; body: unknown; headers: Record<string, string> }
type Answer = unknown | { status: number; code: string } | undefined

/** A fake API that records every request. An answer of `{ status, code }` is an error. */
function api(answer: (method: string, path: string, body: unknown) => Answer | Promise<Answer>) {
  const calls: Call[] = []
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const method = init.method ?? 'GET'
    const path = String(input)
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : init.body
    calls.push({ method, path, body, headers: (init.headers ?? {}) as Record<string, string> })
    const out = await answer(method, path, body)
    if (out === undefined) return new Response('{"error":{"code":"not-found"}}', { status: 404 })
    if (typeof out === 'object' && out !== null && 'status' in out && 'code' in out) {
      const { status, code } = out as { status: number; code: string }
      return new Response(JSON.stringify({ error: { code } }), { status })
    }
    return new Response(JSON.stringify(out), { status: method === 'POST' ? 201 : 200 })
  })
  return calls
}

/** The usual answers: an AI state, a save, the saved dog's listings, and a photo read. */
function usual(options: { ai?: unknown; photoRead?: Answer | (() => Answer | Promise<Answer>); saved?: unknown } = {}) {
  return api((m, p) => {
    if (m === 'GET' && p === '/api/ai') return options.ai ?? aiOff
    if (m === 'GET' && p === '/api/dogs') return { items: [] }
    if (m === 'POST' && p === '/api/dogs') return options.saved ?? dog()
    if (m === 'PATCH' && p === '/api/dogs/7') return options.saved ?? dog()
    if (m === 'GET' && p === '/api/dogs/7') return options.saved ?? dog()
    if (m === 'GET' && p === '/api/dogs/7/matches') return matches
    if (m === 'GET' && p === '/api/sources') return { items: [source], listingCounts: {} }
    if (m === 'POST' && p === '/api/dogs/7/photos') return dog({ photos: [PHOTO_NAME] })
    if (m === 'POST' && p === '/api/ai/photo-traits') {
      return typeof options.photoRead === 'function' ? options.photoRead() : (options.photoRead ?? read())
    }
    return undefined
  })
}

const png = (name = 'zorbulon.png', bytes = 16) =>
  new File([new Uint8Array(bytes).fill(1)], name, { type: 'image/png' })
const drop = () => screen.getByLabelText('Photo of the dog') as HTMLInputElement
// The area itself: its field's name changes to "Replace the photo" once it holds one.
const zone = () => document.querySelector('.photo-drop') as HTMLElement
const choose = (files: File[]) => fireEvent.change(drop(), { target: { files } })
const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement
const chosen = (group: string) =>
  (within(screen.getByLabelText(group)).getAllByRole('radio') as HTMLInputElement[]).find((r) => r.checked)?.value
const whereAndWhen = () => {
  fireEvent.change(field('Minnesota town'), { target: { value: 'Ada' } })
  fireEvent.change(field('Date and time'), { target: { value: '2026-01-10T06:00' } })
}

beforeEach(() => {
  // jsdom has no object URLs; the drop area shows its preview through one.
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: () => 'blob:made-up', revokeObjectURL: () => {} }))
})
afterEach(() => window.localStorage.clear())

describe('the search on the home screen', () => {
  it('shows the saved dog’s ranked listings on the same screen, with the go-and-see wording', async () => {
    const calls = usual()
    renderAt('/')
    fireEvent.change(field('Label (optional)'), { target: { value: 'Zorbulon' } })
    whereAndWhen()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    const results = await screen.findByRole('region', { name: 'Search results' })
    expect(await within(results).findByRole('heading', { level: 2, name: 'Listings for Zorbulon' })).toBeTruthy()
    const ranked = within(results).getByRole('heading', { level: 3, name: 'Ranked listings (2)' }).nextElementSibling
    const cards = within(ranked as HTMLElement)
      .getAllByRole('listitem')
      .filter((li) => li.classList.contains('listing-card'))
    expect(cards).toHaveLength(2)
    expect(within(cards[0] as HTMLElement).getByText('Strong')).toBeTruthy()
    expect(within(cards[0] as HTMLElement).getByText('Found 3 km from where she was last seen')).toBeTruthy()
    expect(within(results).getByText(/^Set aside \(1\)/)).toBeTruthy()
    expect(
      within(results).getByText(
        'A ranking is not an identification. Go and see any dog that might be yours, in person.',
      ),
    ).toBeTruthy()
    // Still the home screen: the form is there, now for that dog, and nothing navigated away.
    expect(screen.getByRole('heading', { level: 1, name: 'Find a dog' })).toBeTruthy()
    expect(screen.getByRole('form', { name: 'The dog you are searching for' })).toBeTruthy()
    expect(screen.getByText('The dog was saved.')).toBeTruthy()
    // A ranking, never a score or an identification.
    expect(results.textContent).not.toMatch(/%|0\.8765|score|identified|found your dog/i)
    expect(calls.filter((c) => c.method === 'POST' && c.path === '/api/dogs')).toHaveLength(1)
  })

  it('moves the keyboard focus to the results after a save', async () => {
    usual()
    renderAt('/')
    whereAndWhen()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const results = await screen.findByRole('region', { name: 'Search results' })
    await waitFor(() => expect(document.activeElement).toBe(results))
  })

  it('searches again on the same dog, and a new search starts with an empty form', async () => {
    const calls = usual()
    renderAt('/')
    whereAndWhen()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByRole('heading', { name: 'Listings for Zorbulon' })
    fireEvent.change(field('Colours'), { target: { value: 'teal, white' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search again' }))
    await waitFor(() => expect(calls.some((c) => c.method === 'PATCH' && c.path === '/api/dogs/7')).toBe(true))
    expect(calls.filter((c) => c.method === 'POST' && c.path === '/api/dogs')).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Start a new search' }))
    expect(field('Minnesota town').value).toBe('')
    expect(screen.getByRole('button', { name: 'Search' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Listings for Zorbulon' })).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 })))
  })

  it('keeps the saved dogs and the memorial block on the home screen, and the old pages working', async () => {
    api((m, p) => {
      if (m === 'GET' && p === '/api/dogs') return { items: [dog()] }
      if (m === 'GET' && p === '/api/dogs/7') return dog()
      if (m === 'GET' && p === '/api/dogs/7/matches') return matches
      if (m === 'GET' && p === '/api/ai') return aiOff
      return undefined
    })
    const home = renderAt('/')
    expect(screen.getByRole('heading', { level: 2, name: 'Your dogs' })).toBeTruthy()
    const item = within((await screen.findByText('Zorbulon', { selector: 'strong' })).closest('li') as HTMLElement)
    expect(item.getByRole('link', { name: /^Listings/ }).getAttribute('href')).toBe('/dogs/7')
    expect(screen.getByRole('region', { name: /Placeholder/ })).toBeTruthy()
    home.unmount()

    const edit = renderAt('/find/7')
    expect(await screen.findByRole('heading', { level: 1, name: 'Edit a dog' })).toBeTruthy()
    expect(((await screen.findByLabelText('Minnesota town')) as HTMLInputElement).value).toBe('Ada')
    expect(screen.getByLabelText('Add photos')).toBeTruthy()
    edit.unmount()

    renderAt('/dogs/7')
    expect(await screen.findByRole('heading', { level: 1, name: 'Zorbulon' })).toBeTruthy()
  })
})

describe('the photo drop', () => {
  it('takes one photo that is chosen, shows it, and lets it be replaced or removed', async () => {
    usual()
    renderAt('/')
    // A real file field with a name: the keyboard and a screen reader reach it like any other.
    expect(drop().type).toBe('file')
    expect(drop().multiple).toBe(false)
    expect(drop().tabIndex).not.toBe(-1)
    expect(drop().hidden).toBe(false)

    choose([png()])
    const preview = await screen.findByAltText('The dog you added')
    expect(preview.getAttribute('src')).toBe('blob:made-up')
    // The same field now replaces the photo.
    const replace = screen.getByLabelText('Replace the photo')
    fireEvent.change(replace, { target: { files: [png('second.png')] } })
    expect(screen.getAllByAltText('The dog you added')).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: /^Remove/ }))
    expect(screen.queryByAltText('The dog you added')).toBeNull()
    expect(drop()).toBeTruthy()
  })

  it('takes one photo that is dropped onto it', async () => {
    usual()
    renderAt('/')
    fireEvent.dragEnter(zone(), { dataTransfer: { types: ['Files'], files: [] } })
    expect(zone().className).toContain('photo-drop--over')
    fireEvent.drop(zone(), { dataTransfer: { types: ['Files'], files: [png()] } })
    expect(await screen.findByAltText('The dog you added')).toBeTruthy()
    expect(zone().className).not.toContain('photo-drop--over')
  })

  it('says what to do about a wrong type, a photo that is too large, and two files', async () => {
    usual()
    renderAt('/')
    const cases: [File[], RegExp][] = [
      [[new File(['%PDF'], 'notes.pdf', { type: 'application/pdf' })], /not a JPEG, PNG or WebP photo\. Choose/],
      [[new File(['GIF89a'], 'moving.gif', { type: 'image/gif' })], /not a JPEG, PNG or WebP photo/],
      [[png('huge.png', 5 * 1024 * 1024 + 1)], /over 5 MB\. Choose a smaller one/],
      [[png('one.png'), png('two.png')], /one photo at a time\. Drop or choose a single picture/],
    ]
    for (const [files, message] of cases) {
      fireEvent.drop(zone(), { dataTransfer: { types: ['Files'], files } })
      // Said to a screen reader as it appears, and tied to the field.
      const alert = await screen.findByRole('alert')
      expect(alert.textContent).toMatch(message)
      expect(drop().getAttribute('aria-describedby')).toContain(alert.id)
      expect(screen.queryByAltText('The dog you added')).toBeNull()
    }
    // A good photo clears the message.
    choose([png()])
    expect(await screen.findByAltText('The dog you added')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('does not let the browser open a file dropped beside the area', () => {
    usual()
    renderAt('/')
    const beside = new Event('drop', { bubbles: true, cancelable: true })
    Object.assign(beside, { dataTransfer: { types: ['Files'], files: [png()] } })
    window.dispatchEvent(beside)
    expect(beside.defaultPrevented).toBe(true)
    const over = new Event('dragover', { bubbles: true, cancelable: true })
    Object.assign(over, { dataTransfer: { types: ['Files'], files: [] } })
    window.dispatchEvent(over)
    expect(over.defaultPrevented).toBe(true)
    // Dragged text is left alone.
    const text = new Event('drop', { bubbles: true, cancelable: true })
    Object.assign(text, { dataTransfer: { types: ['text/plain'], files: [] } })
    window.dispatchEvent(text)
    expect(text.defaultPrevented).toBe(false)
  })

  it('saves the picked photo with the dog, as its own bytes on the existing upload route', async () => {
    const calls = usual({ saved: dog() })
    renderAt('/')
    whereAndWhen()
    const photo = png()
    choose([photo])
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    await screen.findByRole('heading', { name: 'Listings for Zorbulon' })
    const upload = calls.find((c) => c.path === '/api/dogs/7/photos')
    expect(upload?.method).toBe('POST')
    expect(upload?.body).toBe(photo)
    expect(upload?.headers['content-type']).toBe('image/png')
    expect(upload?.headers['x-jill-and-seek']).toBe('1')
    // Saved: the area shows the dog's own copy, and its photos change on the edit page.
    expect(screen.getByAltText('The dog you added').getAttribute('src')).toBe(`/api/dogs/7/photos/${PHOTO_NAME}`)
    expect(screen.getByText('Saved with this dog.')).toBeTruthy()
    expect(screen.getByRole('link', { name: "Change this dog's photos" }).getAttribute('href')).toBe('/find/7')
    // With AI off the photo goes nowhere else.
    expect(calls.some((c) => c.path === '/api/ai/photo-traits')).toBe(false)
    expect(screen.getByText('The photo stays on this computer.')).toBeTruthy()
  })
})

describe('a photo that fills in the traits', () => {
  it('fills what the made-up answer shows, leaves unknowns unknown, and keeps what was typed', async () => {
    const calls = usual({ ai: aiOn })
    renderAt('/')
    // The screen says where the photo goes before one is added.
    expect(await screen.findByText(/a photo you add is sent to the Claude API/)).toBeTruthy()
    expect(screen.getByText(/3 of 25 reads used today/)).toBeTruthy()
    // The owner typed the colours first: a read never overwrites them.
    fireEvent.change(field('Colours'), { target: { value: 'grey' } })
    const photo = png()
    choose([photo])
    expect(await screen.findByText(/Filled in from the photo: breed words, size, age and marks\./)).toBeTruthy()

    expect(field('Breed words').value).toBe('zorbulon hound, mix')
    expect(field('Colours').value).toBe('grey')
    expect(chosen('Size')).toBe('medium')
    expect(chosen('Sex')).toBe('unknown')
    expect(chosen('Age')).toBe('adult')
    expect(field('Distinguishing marks').value).toBe('A white chest patch.')
    // Each filled field says so, the typed and the unknown ones don't, and all stay editable.
    expect(screen.getAllByText('From the photo')).toHaveLength(4)
    expect(field('Breed words').getAttribute('aria-describedby')).toContain('dog-breeds-from-photo')
    expect(field('Colours').getAttribute('aria-describedby')).not.toContain('from-photo')
    fireEvent.change(field('Breed words'), { target: { value: 'hound' } })
    expect(field('Breed words').value).toBe('hound')
    expect(screen.getAllByText('From the photo')).toHaveLength(3)
    expect(screen.getByText(/4 of 25 reads used today/)).toBeTruthy()

    // One call, and its body is the photo and nothing else.
    const reads = calls.filter((c) => c.path === '/api/ai/photo-traits')
    expect(reads).toHaveLength(1)
    expect(reads[0]?.method).toBe('POST')
    expect(reads[0]?.body).toBe(photo)
    expect(reads[0]?.headers['content-type']).toBe('image/png')
  })

  it('never fills the town or the time: it asks for them, and the search then runs on the same screen', async () => {
    const calls = usual({ ai: aiOn })
    renderAt('/')
    await screen.findByText(/a photo you add is sent to the Claude API/)
    choose([png()])
    expect(await screen.findByText(/Check them, then say where and when the dog was last seen\./)).toBeTruthy()
    expect(field('Minnesota town').value).toBe('')
    expect(field('Date and time').value).toBe('')
    expect(field('Street or landmark (optional)').value).toBe('')
    expect(field('Label (optional)').value).toBe('')

    // Searching without them names both, and nothing is saved.
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    const summary = await screen.findByRole('alert')
    expect(summary.textContent).toContain('Pick the town from the list')
    expect(summary.textContent).toContain('Give the date and time')
    expect(calls.some((c) => c.method === 'POST' && c.path === '/api/dogs')).toBe(false)

    whereAndWhen()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByRole('heading', { name: 'Listings for Zorbulon' })).toBeTruthy()
    const post = calls.find((c) => c.method === 'POST' && c.path === '/api/dogs')
    expect(post?.body).toMatchObject({
      lastSeenTown: 'Ada',
      traits: {
        breeds: ['zorbulon hound', 'mix'],
        colors: ['teal', 'white'],
        size: 'medium',
        sex: 'unknown',
        age: 'adult',
      },
      marks: 'A white chest patch.',
    })
  })

  it('shows that it is working while the photo is read, and the form stays usable', async () => {
    let finish: (answer: unknown) => void = () => {}
    usual({ ai: aiOn, photoRead: () => new Promise((done) => (finish = done)) })
    renderAt('/')
    await screen.findByText(/a photo you add is sent to the Claude API/)
    choose([png()])
    const note = await screen.findByText('Reading the photo…')
    expect(note.getAttribute('role')).toBe('status')
    expect(note.getAttribute('aria-busy')).toBe('true')
    expect(zone().className).toContain('photo-drop--reading')
    // Typed while the read is out: kept when the answer lands.
    fireEvent.change(field('Breed words'), { target: { value: 'my own words' } })
    expect(field('Minnesota town').disabled).toBe(false)
    finish(read())
    expect(await screen.findByText(/Filled in from the photo: colours, size, age and marks\./)).toBeTruthy()
    expect(field('Breed words').value).toBe('my own words')
    expect(zone().className).not.toContain('photo-drop--reading')
  })

  it('reads a replacement photo afresh: what the first one filled goes, and what was typed stays', async () => {
    let n = 0
    usual({
      ai: aiOn,
      photoRead: () =>
        ++n === 1
          ? read()
          : read({
              traits: { breeds: [], colors: ['black'], size: 'unknown', sex: 'unknown', age: 'unknown' },
              marks: null,
            }),
    })
    renderAt('/')
    await screen.findByText(/a photo you add is sent to the Claude API/)
    choose([png()])
    await screen.findByText(/Filled in from the photo/)
    fireEvent.change(field('Distinguishing marks'), { target: { value: 'my own note' } })
    fireEvent.change(screen.getByLabelText('Replace the photo'), { target: { files: [png('second.png')] } })
    expect(
      await screen.findByText(
        'Filled in from the photo: colours. Check them, then say where and when the dog was last seen.',
      ),
    ).toBeTruthy()
    expect(field('Breed words').value).toBe('')
    expect(field('Colours').value).toBe('black')
    expect(chosen('Size')).toBe('unknown')
    expect(field('Distinguishing marks').value).toBe('my own note')
  })

  it('says so when no dog can be made out, or nothing was clear, and fills nothing', async () => {
    const nothing = { breeds: [], colors: [], size: 'unknown', sex: 'unknown', age: 'unknown' }
    for (const [answer, message] of [
      [read({ dogVisible: false, traits: nothing, marks: null }), /No dog could be made out in that photo/],
      [read({ traits: nothing, marks: null }), /nothing in it was clear enough to fill in/],
    ] as const) {
      usual({ ai: aiOn, photoRead: answer })
      const page = renderAt('/')
      await screen.findByText(/a photo you add is sent to the Claude API/)
      choose([png()])
      expect(await screen.findByText(message)).toBeTruthy()
      expect(field('Breed words').value).toBe('')
      expect(chosen('Size')).toBe('unknown')
      expect(screen.queryByText('From the photo')).toBeNull()
      page.unmount()
    }
  })

  it.each([
    [{ status: 409, code: 'ai-off' }, /AI is off, so the photo was not read/],
    [{ status: 409, code: 'ai-no-key' }, /No API key is saved, so the photo was not read/],
    [{ status: 429, code: 'ai-daily-cap' }, /Today's photo reads are used up/],
    [{ status: 429, code: 'ai-monthly-cap' }, /This month's photo reads are used up/],
    [{ status: 422, code: 'ai-refused' }, /declined to read this photo/],
    [{ status: 502, code: 'ai-invalid-answer' }, /came back unusable/],
    [{ status: 502, code: 'ai-error' }, /could not be read just now/],
    [{ status: 500, code: 'internal' }, /could not be read just now/],
    // An answer in a shape the site doesn't know never reaches a field.
    [{ dogVisible: true, traits: { size: 'enormous' }, marks: 7 }, /could not be read just now/],
  ])('leaves the form usable when the read answers %j', async (answer, message) => {
    const calls = usual({ ai: aiOn, photoRead: answer })
    renderAt('/')
    await screen.findByText(/a photo you add is sent to the Claude API/)
    choose([png()])
    expect(await screen.findByText(message)).toBeTruthy()
    expect(screen.getByText(/Fill in what the dog looks like below\./)).toBeTruthy()
    expect(field('Breed words').value).toBe('')
    expect(screen.queryByText('From the photo')).toBeNull()
    // By hand, as before: the search still saves and ranks.
    fireEvent.change(field('Breed words'), { target: { value: 'zorbulon hound' } })
    whereAndWhen()
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(await screen.findByRole('heading', { name: 'Listings for Zorbulon' })).toBeTruthy()
    expect(calls.find((c) => c.method === 'POST' && c.path === '/api/dogs')?.body).toMatchObject({
      traits: { breeds: ['zorbulon hound'] },
    })
  })

  it('asks for no read with AI off, with no key saved, or when the server can’t say', async () => {
    for (const [ai, note] of [
      [aiOff, 'The photo stays on this computer.'],
      [{ ...aiOn, keySaved: false }, /no API key is saved, so a photo is not read\. It stays on this computer\./],
      [{ status: 500, code: 'internal' }, 'The photo stays on this computer.'],
    ] as const) {
      const calls = usual({ ai })
      const page = renderAt('/')
      expect(await screen.findByText(note)).toBeTruthy()
      choose([png()])
      await screen.findByAltText('The dog you added')
      expect(calls.some((c) => c.path === '/api/ai/photo-traits')).toBe(false)
      expect(screen.queryByText(/sent to the Claude API/)).toBeNull()
      page.unmount()
    }
  })
})
