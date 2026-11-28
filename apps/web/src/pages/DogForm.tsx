import {
  Age,
  type AiState,
  type Dog,
  DogForm,
  type DogFormBody,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  PHOTO_TYPES,
  type PhotoRead,
  type PhotoReadError,
  Sex,
  Size,
} from '@jillandseek/core'
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { Link } from 'wouter'
import { fetchAiState, photoReadError, readPhotoTraits } from '../api/ai.ts'
import { createDog, photoUrl, removePhoto, updateDog, uploadPhoto } from '../api/dogs.ts'
import { Choice } from '../components/Choice.tsx'
import { PhotoDrop } from '../components/PhotoDrop.tsx'
import { TownPicker } from '../components/TownPicker.tsx'
import { smallerCopy } from '../photo.ts'
import './search.css'

// The missing dog's form (#17), in two places: the search on the home screen (#59), which starts
// with one photo and can fill the traits from it (#60, #61), and a saved dog's edit page. The
// town comes from the local towns table, so nothing is looked up anywhere else. There is no
// contact field: the owner keeps that in the original post.

type Fields = {
  label: string
  town: string
  place: string
  seen: string
  breeds: string
  colors: string
  size: Size
  sex: Sex
  age: Age
  marks: string
  notes: string
}

const EMPTY: Fields = {
  label: '',
  town: '',
  place: '',
  seen: '',
  breeds: '',
  colors: '',
  size: 'unknown',
  sex: 'unknown',
  age: 'unknown',
  marks: '',
  notes: '',
}

/** The fields a photo can fill: what the dog looks like, and never where or when it was seen. */
const LOOKS = ['breeds', 'colors', 'size', 'sex', 'age', 'marks'] as const
type Look = (typeof LOOKS)[number]
const LOOK_WORDS: Record<Look, string> = {
  breeds: 'breed words',
  colors: 'colours',
  size: 'size',
  sex: 'sex',
  age: 'age',
  marks: 'marks',
}

const pad = (n: number) => String(n).padStart(2, '0')
/** An instant as the value of a datetime-local input, in the browser's own time zone. */
function localInput(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fieldsOf(dog: Dog): Fields {
  return {
    label: dog.label ?? '',
    town: dog.lastSeenTown,
    place: dog.lastSeenPlace ?? '',
    seen: localInput(dog.lastSeenAt),
    breeds: dog.traits.breeds.join(', '),
    colors: dog.traits.colors.join(', '),
    size: dog.traits.size,
    sex: dog.traits.sex,
    age: dog.traits.age,
    marks: dog.marks ?? '',
    notes: dog.notes ?? '',
  }
}

const words = (text: string) =>
  text
    .split(',')
    .map((w) => w.trim())
    .filter((w) => w !== '')
const orNull = (text: string) => (text.trim() === '' ? null : text.trim())

function bodyOf(f: Fields): DogFormBody {
  const seen = f.seen === '' ? null : new Date(f.seen)
  return {
    label: orNull(f.label),
    lastSeenAt: seen === null || Number.isNaN(seen.getTime()) ? '' : seen.toISOString(),
    lastSeenTown: f.town,
    lastSeenPlace: orNull(f.place),
    traits: { breeds: words(f.breeds), colors: words(f.colors), size: f.size, sex: f.sex, age: f.age },
    marks: orNull(f.marks),
    notes: orNull(f.notes),
  }
}

/** The field each schema path belongs to, and what to say when it is wrong. */
const PROBLEMS: Record<string, { field: keyof Fields; text: string }> = {
  lastSeenTown: { field: 'town', text: 'Pick the town from the list of Minnesota towns.' },
  lastSeenAt: { field: 'seen', text: 'Give the date and time the dog was last seen.' },
  label: { field: 'label', text: 'Keep the label under 100 characters.' },
  lastSeenPlace: { field: 'place', text: 'Keep the street or landmark under 200 characters.' },
  traits: { field: 'breeds', text: 'Use at most 20 breed and 20 colour words, each under 60 characters.' },
  marks: { field: 'marks', text: 'Keep the marks under 2,000 characters.' },
  notes: { field: 'notes', text: 'Keep the notes under 5,000 characters.' },
}

const TYPES = Object.keys(PHOTO_TYPES)
const SIZE_WORDS: Record<Size, string> = { small: 'Small', medium: 'Medium', large: 'Large', unknown: 'Not known' }
const SEX_WORDS: Record<Sex, string> = { male: 'Male', female: 'Female', unknown: 'Not known' }
const AGE_WORDS: Record<Age, string> = {
  puppy: 'Puppy',
  young: 'Young',
  adult: 'Adult',
  senior: 'Senior',
  unknown: 'Not known',
}

/** What a read that gave nothing says, in plain words. Filling the form by hand always works. */
const READ_PROBLEMS: Record<PhotoReadError, string> = {
  'ai-off': 'AI is off, so the photo was not read. Fill in what the dog looks like below.',
  'ai-no-key': 'No API key is saved, so the photo was not read. Fill in what the dog looks like below.',
  'ai-daily-cap': "Today's photo reads are used up, so this one was not read. Fill in what the dog looks like below.",
  'ai-monthly-cap':
    "This month's photo reads are used up, so this one was not read. Fill in what the dog looks like below.",
  'ai-refused': 'The Claude API declined to read this photo. Fill in what the dog looks like below.',
  'ai-invalid-answer': "The photo's reading came back unusable. Fill in what the dog looks like below.",
  'ai-error': 'The photo could not be read just now. Fill in what the dog looks like below.',
  'not-an-image': 'That file could not be read as a photo. Fill in what the dog looks like below.',
}

const list = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`

/** What a read puts in the form: only into fields that are still empty or "Not known". */
function fillFrom(read: PhotoRead, f: Fields): { next: Fields; filled: Look[] } {
  const next = { ...f }
  const filled: Look[] = []
  const put = <K extends Look>(name: K, value: Fields[K], empty: boolean, known: boolean) => {
    if (empty && known) {
      next[name] = value
      filled.push(name)
    }
  }
  put('breeds', read.traits.breeds.join(', '), f.breeds.trim() === '', read.traits.breeds.length > 0)
  put('colors', read.traits.colors.join(', '), f.colors.trim() === '', read.traits.colors.length > 0)
  put('size', read.traits.size, f.size === 'unknown', read.traits.size !== 'unknown')
  put('sex', read.traits.sex, f.sex === 'unknown', read.traits.sex !== 'unknown')
  put('age', read.traits.age, f.age === 'unknown', read.traits.age !== 'unknown')
  put('marks', read.marks ?? '', f.marks.trim() === '', read.marks !== null)
  return { next, filled }
}

type Problem = { field: keyof Fields | 'photos'; text: string }

export function DogFormView({
  dog: given,
  variant,
  onSaved,
  actions,
}: {
  dog?: Dog
  /** `search` is the home screen's form, with the photo drop; `edit` is a saved dog's page. */
  variant: 'search' | 'edit'
  onSaved: (dog: Dog) => void
  /** More buttons beside the form's own. */
  actions?: ReactNode
}) {
  // The dog as last saved. A new dog becomes an edit once it is created, so a retry after a
  // failed photo changes that dog instead of creating a second one.
  const [dog, setDog] = useState<Dog | undefined>(given)
  const [fields, setFields] = useState<Fields>(given ? fieldsOf(given) : EMPTY)
  const [photos, setPhotos] = useState<string[]>(given?.photos ?? [])
  const [files, setFiles] = useState<File[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const [status, setStatus] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const summary = useRef<HTMLDivElement>(null)
  const room = MAX_PHOTOS - photos.length
  const search = variant === 'search'

  // Reading the photo (#61). `filled` names the fields the last read filled and the owner has
  // not touched since; `reads` numbers the reads, so an answer for a replaced photo is dropped.
  const [ai, setAi] = useState<AiState | null>(null)
  const [reading, setReading] = useState(false)
  const [readNote, setReadNote] = useState('')
  const [filled, setFilled] = useState<Look[]>([])
  const latest = useRef({ fields, filled })
  latest.current = { fields, filled }
  const reads = useRef(0)

  useEffect(() => {
    if (!search) return
    const controller = new AbortController()
    // A server that can't say is treated as AI off: the form works the same by hand.
    fetchAiState(controller.signal).then(setAi, () => {})
    return () => controller.abort()
  }, [search])

  const set =
    <K extends keyof Fields>(name: K) =>
    (value: Fields[K]) => {
      setFields((f) => ({ ...f, [name]: value }))
      // A field the owner changes is the owner's from then on.
      setFilled((names) => names.filter((n) => n !== name))
    }
  const typed = (name: keyof Fields) => (e: { target: { value: string } }) => set(name)(e.target.value as never)

  const show = (items: Problem[]) => {
    setProblems(items)
    // The summary is focused, so a keyboard or screen-reader user lands on what to fix.
    requestAnimationFrame(() => summary.current?.focus())
  }

  const readPhoto = async (photo: File) => {
    const mine = ++reads.current
    // What the last photo filled, and the owner left alone, goes with that photo.
    const cleared = { ...latest.current.fields }
    for (const name of latest.current.filled) Object.assign(cleared, { [name]: EMPTY[name] })
    setFields(cleared)
    setFilled([])
    latest.current = { fields: cleared, filled: [] }
    setReading(true)
    setReadNote('Reading the photo…')
    try {
      const read = await readPhotoTraits(await smallerCopy(photo))
      if (mine !== reads.current) return
      const { next, filled: names } = fillFrom(read, latest.current.fields)
      setFields(next)
      setFilled(names)
      setReadNote(
        !read.dogVisible
          ? 'No dog could be made out in that photo, so nothing was filled in.'
          : names.length === 0
            ? 'The photo was read, but nothing in it was clear enough to fill in.'
            : `Filled in from the photo: ${list(names.map((n) => LOOK_WORDS[n]))}. Check them, then say where and when the dog was last seen.`,
      )
      setAi((s) => (s === null ? s : { ...s, today: s.today + 1, month: s.month + 1 }))
    } catch (error) {
      if (mine !== reads.current) return
      setReadNote(READ_PROBLEMS[photoReadError(error)])
    } finally {
      if (mine === reads.current) setReading(false)
    }
  }

  /** The search form's one photo: picked, replaced or removed. */
  const onPhoto = (photo: File | null) => {
    setFiles(photo === null ? [] : [photo])
    setProblems((items) => items.filter((p) => p.field !== 'photos'))
    if (photo === null) {
      reads.current++
      setReading(false)
      setReadNote('')
      return
    }
    if (ai?.enabled && ai.keySaved) void readPhoto(photo)
    else setReadNote('')
  }

  /** The edit page's file field: up to five photos in all. */
  const pickFiles = (picked: File[]) => {
    const wrong = picked.filter((f) => !TYPES.includes(f.type) || f.size > MAX_PHOTO_BYTES)
    if (picked.length > room) show([{ field: 'photos', text: `Add at most ${room} more photos (5 in all).` }])
    else if (wrong.length > 0) show([{ field: 'photos', text: 'Photos must be JPEG, PNG or WebP, up to 5 MB each.' }])
    else {
      setProblems([])
      setFiles(picked)
      return
    }
    setFiles([])
  }

  const onRemovePhoto = async (name: string) => {
    if (!dog) return
    try {
      setPhotos((await removePhoto(dog.id, name)).photos)
      setStatus('The photo was removed.')
    } catch {
      setStatus('The photo could not be removed. Check that Jill and Seek is running.')
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const body = bodyOf(fields)
    const parsed = DogForm.safeParse(body)
    if (!parsed.success) {
      const found = new Map<keyof Fields, Problem>()
      for (const issue of parsed.error.issues) {
        const p = PROBLEMS[String(issue.path[0])]
        if (p !== undefined && !found.has(p.field)) found.set(p.field, p)
      }
      return show([...found.values()])
    }
    setBusy(true)
    setProblems([])
    setStatus('')
    try {
      let saved: Dog
      if (dog) {
        // A minutes-only time field would rewrite the saved seconds, so the time goes only when changed.
        const { lastSeenAt: _time, ...rest } = body
        saved = await updateDog(dog.id, fields.seen === fieldsOf(dog).seen ? rest : body)
      } else saved = await createDog(body)
      const failed: File[] = []
      for (const file of files) {
        try {
          saved = await uploadPhoto(saved.id, file)
        } catch {
          failed.push(file)
        }
      }
      setDog(saved)
      setPhotos(saved.photos)
      // Only the photos that failed stay picked, so saving again retries just those.
      setFiles(failed)
      setBusy(false)
      if (failed.length > 0) {
        setStatus(
          search
            ? 'The dog was saved, but its photo could not be. Search again to retry the photo.'
            : `The dog was saved, but ${failed.length} photo(s) could not be. Save again to retry them.`,
        )
        // The search still shows its listings; the edit page stays put for the retry.
        if (!search) return
      }
      onSaved(saved)
    } catch {
      setStatus('The dog could not be saved. Check that Jill and Seek is running, then try again.')
      setBusy(false)
    }
  }

  const has = (field: Problem['field']) => problems.some((p) => p.field === field)
  const describedBy = (field: Problem['field'], ...more: (string | false | undefined)[]) =>
    [...more, has(field) && `${field}-problem`].filter(Boolean).join(' ') || undefined
  const problemFor = (field: Problem['field']) => {
    const p = problems.find((x) => x.field === field)
    return p ? (
      <p id={`${field}-problem`} className="field__problem">
        {p.text}
      </p>
    ) : null
  }
  /** Marks a field the photo filled, until the owner changes it. */
  const fromPhoto = (name: Look) =>
    filled.includes(name) ? (
      <span className="from-photo" id={`dog-${name}-from-photo`}>
        From the photo
      </span>
    ) : null
  const fromPhotoId = (name: Look) => filled.includes(name) && `dog-${name}-from-photo`

  const savedPhoto = dog && photos.length > 0 ? photoUrl(dog.id, photos.at(-1) as string) : null
  const submitWords = busy
    ? search
      ? 'Searching…'
      : 'Saving…'
    : search
      ? dog
        ? 'Search again'
        : 'Search'
      : 'Save changes'

  const lastSeen = (
    <fieldset className="card">
      <legend>Last seen</legend>
      <div className="field">
        <label htmlFor="dog-town">Minnesota town</label>
        <TownPicker
          id="dog-town"
          value={fields.town}
          onChange={set('town')}
          invalid={has('town')}
          describedBy={describedBy('town', 'dog-town-hint')}
        />
        <p id="dog-town-hint" className="field__hint">
          Start typing and pick from the list. The town places the dog; no address is looked up.
        </p>
        {problemFor('town')}
      </div>
      <div className="field">
        <label htmlFor="dog-seen">Date and time</label>
        <input
          id="dog-seen"
          type="datetime-local"
          value={fields.seen}
          onChange={typed('seen')}
          required
          aria-invalid={has('seen') || undefined}
          aria-describedby={describedBy('seen')}
        />
        {problemFor('seen')}
      </div>
      <div className="field">
        <label htmlFor="dog-place">Street or landmark (optional)</label>
        <input id="dog-place" value={fields.place} onChange={typed('place')} maxLength={200} autoComplete="off" />
      </div>
    </fieldset>
  )

  const looks = (
    <fieldset className="card">
      <legend>What the dog looks like</legend>
      <div className="field-row field-row--wide">
        <div className="field">
          <div className="field__head">
            <label htmlFor="dog-breeds">Breed words</label>
            {fromPhoto('breeds')}
          </div>
          <input
            id="dog-breeds"
            value={fields.breeds}
            onChange={typed('breeds')}
            autoComplete="off"
            placeholder="lab mix, shepherd"
            aria-describedby={describedBy('breeds', 'dog-breeds-hint', fromPhotoId('breeds'))}
          />
          <p id="dog-breeds-hint" className="field__hint">
            As a post would say them, split by commas.
          </p>
          {problemFor('breeds')}
        </div>
        <div className="field">
          <div className="field__head">
            <label htmlFor="dog-colors">Colours</label>
            {fromPhoto('colors')}
          </div>
          <input
            id="dog-colors"
            value={fields.colors}
            onChange={typed('colors')}
            autoComplete="off"
            placeholder="tan, white"
            aria-describedby={['dog-colors-hint', fromPhotoId('colors')].filter(Boolean).join(' ')}
          />
          <p id="dog-colors-hint" className="field__hint">
            Split by commas.
          </p>
        </div>
      </div>
      <div className="choices">
        <Choice
          id="dog-size"
          label="Size"
          value={fields.size}
          options={Size.options}
          words={SIZE_WORDS}
          onChange={set('size')}
          describedBy={fromPhotoId('size') || undefined}
          tag={fromPhoto('size')}
        />
        <Choice
          id="dog-sex"
          label="Sex"
          value={fields.sex}
          options={Sex.options}
          words={SEX_WORDS}
          onChange={set('sex')}
          describedBy={fromPhotoId('sex') || undefined}
          tag={fromPhoto('sex')}
        />
        <Choice
          id="dog-age"
          label="Age"
          value={fields.age}
          options={Age.options}
          words={AGE_WORDS}
          onChange={set('age')}
          describedBy={fromPhotoId('age') || undefined}
          tag={fromPhoto('age')}
        />
      </div>
      <div className="field">
        <div className="field__head">
          <label htmlFor="dog-marks">Distinguishing marks</label>
          {fromPhoto('marks')}
        </div>
        <textarea
          id="dog-marks"
          value={fields.marks}
          onChange={typed('marks')}
          rows={2}
          maxLength={2000}
          aria-describedby={describedBy('marks', fromPhotoId('marks'))}
        />
        {problemFor('marks')}
      </div>
    </fieldset>
  )

  const own = (
    <fieldset className="card">
      <legend>For you</legend>
      <div className="field-row field-row--wide">
        <div className="field">
          <label htmlFor="dog-label">Label (optional)</label>
          <input
            id="dog-label"
            value={fields.label}
            onChange={typed('label')}
            maxLength={100}
            autoComplete="off"
            placeholder="The dog's name"
          />
          {problemFor('label')}
        </div>
        <div className="field">
          <label htmlFor="dog-notes">Notes</label>
          <textarea id="dog-notes" value={fields.notes} onChange={typed('notes')} rows={2} maxLength={5000} />
          {problemFor('notes')}
        </div>
      </div>
    </fieldset>
  )

  return (
    <form
      className={`dog-form dog-form--${variant}`}
      onSubmit={onSubmit}
      noValidate
      aria-label={dog ? (search ? 'The dog you are searching for' : 'Edit the dog') : 'A new missing dog'}
    >
      {problems.length > 0 && (
        <div className="problems" ref={summary} tabIndex={-1} role="alert">
          <h2>Check {problems.length === 1 ? 'this' : 'these'} first</h2>
          <ul>
            {problems.map((p) => (
              <li key={p.field}>
                <a
                  href={`#dog-${p.field}`}
                  onClick={(e) => {
                    // Move focus to the field itself, not only scroll to it.
                    e.preventDefault()
                    document.getElementById(`dog-${p.field}`)?.focus()
                  }}
                >
                  {p.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="status" role="status">
        {status}
      </p>

      {search ? (
        <div className="search__top">
          <PhotoDrop
            id="dog-photos"
            file={files[0] ?? null}
            savedUrl={files.length === 0 ? savedPhoto : null}
            onChange={onPhoto}
            reading={reading}
          >
            <p className="field__hint photo-note">
              {ai?.enabled && ai.keySaved
                ? `AI is on: a photo you add is sent to the Claude API, with its location and other details removed, to fill in what the dog looks like. Nothing else is sent. ${ai.today} of ${ai.dailyCap} reads used today.`
                : ai?.enabled
                  ? 'AI is on, but no API key is saved, so a photo is not read. It stays on this computer.'
                  : 'The photo stays on this computer.'}
            </p>
            <p className={`read-note${reading ? ' read-note--busy' : ''}`} role="status" aria-busy={reading}>
              {readNote}
            </p>
            {dog && savedPhoto !== null && files.length === 0 && (
              <p className="field__hint">
                <Link href={`/find/${dog.id}`}>Change this dog's photos</Link>
              </p>
            )}
          </PhotoDrop>
          {lastSeen}
        </div>
      ) : (
        lastSeen
      )}
      {looks}
      {own}

      {!search && (
        <fieldset className="card">
          <legend>Photos</legend>
          {dog && photos.length > 0 && (
            <ul className="photos">
              {photos.map((name, i) => (
                <li key={name}>
                  <img src={photoUrl(dog.id, name)} alt={`${dog.label ?? 'The dog'}, ${i + 1} of ${photos.length}`} />
                  <button type="button" className="button button--quiet" onClick={() => onRemovePhoto(name)}>
                    Remove<span className="visually-hidden"> photo {i + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="field">
            <label htmlFor="dog-photos">Add photos</label>
            <input
              id="dog-photos"
              type="file"
              accept={TYPES.join(',')}
              multiple
              disabled={room === 0}
              onChange={(e) => pickFiles([...(e.target.files ?? [])])}
              aria-describedby={describedBy('photos', 'dog-photos-hint')}
            />
            <p id="dog-photos-hint" className="field__hint">
              Up to 5 in all, JPEG, PNG or WebP. They are kept only on this computer.
              {room < MAX_PHOTOS && ` Room for ${room} more.`}
            </p>
            {problemFor('photos')}
          </div>
        </fieldset>
      )}

      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={busy}>
          {submitWords}
        </button>
        {actions}
      </div>
    </form>
  )
}
