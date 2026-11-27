import {
  Age,
  type Dog,
  DogForm,
  type DogFormBody,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  PHOTO_TYPES,
  Sex,
  Size,
  TOWNS,
} from '@jillandseek/core'
import { type FormEvent, useRef, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { createDog, fetchDog, photoUrl, removePhoto, updateDog, uploadPhoto } from '../api/dogs.ts'
import { useLoad } from '../useLoad.ts'
import { DogList } from './DogList.tsx'

// Find a dog (#17): the missing dog's form, and the list of dogs below it. The town comes from
// the local towns table, so nothing is looked up anywhere else, and the photos go to the
// owner's own server. There is no contact field: the owner keeps that in the original post.

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

/** Find a dog: a new dog's form and the dogs list, or one dog's form when `id` is given. */
export function FindDog({ id }: { id?: number }) {
  if (id === undefined) return <NewDog />
  return <EditDog id={id} />
}

function NewDog() {
  const [saved, setSaved] = useState(0)
  return (
    <>
      <h1>Find a dog</h1>
      <p className="lead">
        Describe the missing dog: where and when it was last seen, and what it looks like. Unknown is fine for anything
        the post doesn't say.
      </p>
      {/* A new key after each save gives an empty form and a fresh list. */}
      <DogFormView key={`form-${saved}`} onSaved={() => setSaved((n) => n + 1)} savedCount={saved} />
      <h2 className="section-title">Your dogs</h2>
      <DogList key={`list-${saved}`} />
    </>
  )
}

function EditDog({ id }: { id: number }) {
  const load = useLoad((signal) => fetchDog(id, signal))
  const [, navigate] = useLocation()
  return (
    <>
      <h1>Edit a dog</h1>
      <p>
        <Link href="/find">Back to your dogs</Link>
      </p>
      {load.state === 'loading' && <p aria-busy="true">Loading the dog…</p>}
      {load.state === 'error' && <p role="alert">This dog could not be loaded. It may have been deleted.</p>}
      {load.state === 'ready' && <DogFormView dog={load.data} onSaved={() => navigate('/find')} />}
    </>
  )
}

function DogFormView({ dog, onSaved, savedCount = 0 }: { dog?: Dog; onSaved: () => void; savedCount?: number }) {
  const [fields, setFields] = useState<Fields>(dog ? fieldsOf(dog) : EMPTY)
  const [photos, setPhotos] = useState<string[]>(dog?.photos ?? [])
  const [files, setFiles] = useState<File[]>([])
  const [problems, setProblems] = useState<{ field: keyof Fields | 'photos'; text: string }[]>([])
  const [status, setStatus] = useState<string>(savedCount > 0 ? 'The dog was saved.' : '')
  const [busy, setBusy] = useState(false)
  const summary = useRef<HTMLDivElement>(null)
  const room = MAX_PHOTOS - photos.length

  const set = (name: keyof Fields) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [name]: e.target.value }))

  const show = (list: typeof problems) => {
    setProblems(list)
    // The summary is focused, so a keyboard or screen-reader user lands on what to fix.
    requestAnimationFrame(() => summary.current?.focus())
  }

  const pickFiles = (list: FileList | null) => {
    const picked = [...(list ?? [])]
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
      const list = new Map<keyof Fields, { field: keyof Fields; text: string }>()
      for (const issue of parsed.error.issues) {
        const p = PROBLEMS[String(issue.path[0])]
        if (p !== undefined && !list.has(p.field)) list.set(p.field, p)
      }
      return show([...list.values()])
    }
    setBusy(true)
    setProblems([])
    try {
      const saved = dog ? await updateDog(dog.id, body) : await createDog(body)
      let failed = 0
      for (const file of files) {
        try {
          await uploadPhoto(saved.id, file)
        } catch {
          failed++
        }
      }
      if (failed > 0) {
        setStatus(`The dog was saved, but ${failed} photo(s) could not be. Try adding them again from Edit.`)
        setBusy(false)
        return
      }
      onSaved()
    } catch {
      setStatus('The dog could not be saved. Check that Jill and Seek is running, then try again.')
      setBusy(false)
    }
  }

  const describedBy = (field: keyof Fields | 'photos', hint?: string) =>
    [hint, problems.some((p) => p.field === field) ? `${field}-problem` : undefined].filter(Boolean).join(' ') ||
    undefined
  const problemFor = (field: keyof Fields | 'photos') => {
    const p = problems.find((x) => x.field === field)
    return p ? (
      <p id={`${field}-problem`} className="field__problem">
        {p.text}
      </p>
    ) : null
  }

  return (
    <form className="dog-form" onSubmit={onSubmit} noValidate aria-label={dog ? 'Edit the dog' : 'A new missing dog'}>
      {problems.length > 0 && (
        <div className="problems" ref={summary} tabIndex={-1} role="alert">
          <h2>Check {problems.length === 1 ? 'this' : 'these'} first</h2>
          <ul>
            {problems.map((p) => (
              <li key={p.field}>
                <a href={`#dog-${p.field}`}>{p.text}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="status" role="status">
        {status}
      </p>

      <div className="field">
        <label htmlFor="dog-label">Label (optional)</label>
        <input id="dog-label" value={fields.label} onChange={set('label')} maxLength={100} autoComplete="off" />
      </div>

      <fieldset>
        <legend>Last seen</legend>
        <div className="field">
          <label htmlFor="dog-town">Minnesota town</label>
          <input
            id="dog-town"
            list="mn-towns"
            value={fields.town}
            onChange={set('town')}
            required
            autoComplete="off"
            aria-invalid={problems.some((p) => p.field === 'town') || undefined}
            aria-describedby={describedBy('town', 'dog-town-hint')}
          />
          <p id="dog-town-hint" className="field__hint">
            Start typing and pick from the list. The town places the dog on the map; no address is looked up.
          </p>
          {problemFor('town')}
          <datalist id="mn-towns">
            {TOWNS.map((t) => (
              <option key={t.name} value={t.name} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="dog-place">Street or landmark (optional)</label>
          <input id="dog-place" value={fields.place} onChange={set('place')} maxLength={200} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="dog-seen">Date and time</label>
          <input
            id="dog-seen"
            type="datetime-local"
            value={fields.seen}
            onChange={set('seen')}
            required
            aria-invalid={problems.some((p) => p.field === 'seen') || undefined}
            aria-describedby={describedBy('seen')}
          />
          {problemFor('seen')}
        </div>
      </fieldset>

      <fieldset>
        <legend>What the dog looks like</legend>
        <div className="field">
          <label htmlFor="dog-breeds">Breed words</label>
          <input
            id="dog-breeds"
            value={fields.breeds}
            onChange={set('breeds')}
            autoComplete="off"
            aria-describedby={describedBy('breeds', 'dog-breeds-hint')}
          />
          <p id="dog-breeds-hint" className="field__hint">
            As the post says them, split by commas: for example "lab mix, shepherd".
          </p>
          {problemFor('breeds')}
        </div>
        <div className="field">
          <label htmlFor="dog-colors">Colours</label>
          <input
            id="dog-colors"
            value={fields.colors}
            onChange={set('colors')}
            autoComplete="off"
            aria-describedby="dog-colors-hint"
          />
          <p id="dog-colors-hint" className="field__hint">
            Split by commas: for example "tan, white".
          </p>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="dog-size">Size</label>
            <select id="dog-size" value={fields.size} onChange={set('size')}>
              {Size.options.map((v) => (
                <option key={v} value={v}>
                  {SIZE_WORDS[v]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="dog-sex">Sex</label>
            <select id="dog-sex" value={fields.sex} onChange={set('sex')}>
              {Sex.options.map((v) => (
                <option key={v} value={v}>
                  {SEX_WORDS[v]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="dog-age">Age</label>
            <select id="dog-age" value={fields.age} onChange={set('age')}>
              {Age.options.map((v) => (
                <option key={v} value={v}>
                  {AGE_WORDS[v]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="dog-marks">Distinguishing marks</label>
          <textarea id="dog-marks" value={fields.marks} onChange={set('marks')} rows={3} maxLength={2000} />
          {problemFor('marks')}
        </div>
        <div className="field">
          <label htmlFor="dog-notes">Notes</label>
          <textarea id="dog-notes" value={fields.notes} onChange={set('notes')} rows={3} maxLength={5000} />
          {problemFor('notes')}
        </div>
      </fieldset>

      <fieldset>
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
            onChange={(e) => pickFiles(e.target.files)}
            aria-describedby={describedBy('photos', 'dog-photos-hint')}
          />
          <p id="dog-photos-hint" className="field__hint">
            Up to 5 in all, JPEG, PNG or WebP. They are kept only on this computer.
            {room < MAX_PHOTOS && ` Room for ${room} more.`}
          </p>
          {problemFor('photos')}
        </div>
      </fieldset>

      <button type="submit" className="button" disabled={busy}>
        {busy ? 'Saving…' : dog ? 'Save changes' : 'Save the dog'}
      </button>
    </form>
  )
}
