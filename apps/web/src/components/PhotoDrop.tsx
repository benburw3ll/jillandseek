import { MAX_PHOTO_BYTES, PHOTO_TYPES } from '@jillandseek/core'
import { type DragEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'

// The drop area (#60): one photo of the missing dog, dropped onto it or chosen through it. It is
// a real file input inside its label, restyled, so the keyboard, the screen reader and the phone's
// own picker all work as they do for any file field. Nothing here leaves the browser.

const TYPES = Object.keys(PHOTO_TYPES)

const PROBLEMS = {
  many: 'Add one photo at a time. Drop or choose a single picture of the dog.',
  type: 'That file is not a JPEG, PNG or WebP photo. Choose a photo in one of those formats.',
  size: 'That photo is over 5 MB. Choose a smaller one, or send yourself a smaller copy.',
}

/** What is wrong with the files, or null when they are exactly one usable photo. */
export function photoProblem(files: File[]): string | null {
  if (files.length !== 1) return files.length === 0 ? null : PROBLEMS.many
  const [file] = files
  if (file === undefined || !TYPES.includes(file.type)) return PROBLEMS.type
  if (file.size > MAX_PHOTO_BYTES) return PROBLEMS.size
  return null
}

/** A local address for showing the picked file, where the browser has one. */
function usePreview(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (file === null || typeof URL.createObjectURL !== 'function') {
      setUrl(null)
      return
    }
    const made = URL.createObjectURL(file)
    setUrl(made)
    return () => URL.revokeObjectURL(made)
  }, [file])
  return url
}

const hasFiles = (e: { dataTransfer: DataTransfer | null }) => [...(e.dataTransfer?.types ?? [])].includes('Files')

export function PhotoDrop({
  id,
  file,
  savedUrl,
  onChange,
  reading = false,
  children,
}: {
  id: string
  /** The photo picked and not yet saved. */
  file: File | null
  /** The photo as saved with the dog. Once it is there, it is changed on the dog's edit page. */
  savedUrl?: string | null
  onChange: (file: File | null) => void
  /** Whether the photo is being read right now. */
  reading?: boolean
  /** Shown under the area: what happens to the photo, and what a read found. */
  children?: ReactNode
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const preview = usePreview(file)
  const hintId = useId()
  const titleId = useId()
  const problemId = useId()
  const saved = savedUrl ?? null
  const locked = saved !== null && file === null

  // A file dropped beside the area must not make the browser open it and lose the typed form.
  useEffect(() => {
    const stop = (e: globalThis.DragEvent) => {
      if (hasFiles(e)) e.preventDefault()
    }
    window.addEventListener('dragover', stop)
    window.addEventListener('drop', stop)
    return () => {
      window.removeEventListener('dragover', stop)
      window.removeEventListener('drop', stop)
    }
  }, [])

  const take = (files: File[]) => {
    const wrong = photoProblem(files)
    setProblem(wrong)
    if (wrong === null && files[0] !== undefined) onChange(files[0])
    // The same file can be chosen again after it was removed.
    if (input.current) input.current.value = ''
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    if (!locked) take([...e.dataTransfer.files])
  }

  const shown = preview ?? saved
  const has = file !== null || saved !== null
  return (
    <div className="photo-drop-wrap">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: dropping is an extra way in; the file input inside is the control. */}
      <div
        className={`photo-drop${over ? ' photo-drop--over' : ''}${has ? ' photo-drop--has' : ''}${reading ? ' photo-drop--reading' : ''}`}
        onDragEnter={(e) => {
          if (hasFiles(e) && !locked) setOver(true)
        }}
        onDragOver={(e) => {
          if (hasFiles(e)) e.preventDefault()
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false)
        }}
        onDrop={onDrop}
      >
        {has && (
          <div className="photo-drop__preview">
            {shown !== null ? (
              <img src={shown} alt="The dog you added" />
            ) : (
              <span className="photo-drop__no-preview">Photo added</span>
            )}
            {reading && <span className="photo-drop__scan" aria-hidden="true" />}
          </div>
        )}
        {!locked && (
          <label className="photo-drop__target" htmlFor={id}>
            <input
              ref={input}
              id={id}
              className="photo-drop__input"
              type="file"
              accept={TYPES.join(',')}
              onChange={(e) => take([...(e.target.files ?? [])])}
              aria-labelledby={titleId}
              aria-describedby={`${hintId}${problem !== null ? ` ${problemId}` : ''}`}
              aria-invalid={problem !== null || undefined}
            />
            {!has && (
              <svg className="photo-drop__icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                <path
                  d="M17 10l-3 5H8a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h32a4 4 0 0 0 4-4V19a4 4 0 0 0-4-4h-6l-3-5H17z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <circle cx="24" cy="27" r="7.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
              </svg>
            )}
            <span className="photo-drop__title" id={titleId}>
              {has ? 'Replace the photo' : 'Photo of the dog'}
            </span>
            {!has && <span className="photo-drop__sub">Drop a photo here, or choose one</span>}
          </label>
        )}
        {file !== null && (
          <button
            type="button"
            className="button button--quiet photo-drop__remove"
            onClick={() => {
              setProblem(null)
              onChange(null)
              // The field stays in the page, so the focus goes back to it and is not lost.
              input.current?.focus()
            }}
          >
            Remove<span className="visually-hidden"> the photo</span>
          </button>
        )}
      </div>
      <p id={hintId} className="field__hint">
        {locked ? 'Saved with this dog.' : 'One photo: JPEG, PNG or WebP, up to 5 MB.'}
      </p>
      {problem !== null && (
        <p id={problemId} className="field__problem" role="alert">
          {problem}
        </p>
      )}
      {children}
    </div>
  )
}
