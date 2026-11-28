import type { Dog } from '@jillandseek/core'
import { useEffect, useRef, useState } from 'react'
import memorial from '../content/memorial.md?raw'
import { DogFormView } from './DogForm.tsx'
import { DogList } from './DogList.tsx'
import { DogResults } from './DogPage.tsx'

/** The memorial file's heading and paragraphs, with its comments left out. */
export function readMemorial(text: string): { heading: string | null; paragraphs: string[] } {
  const blocks = text
    .replace(/<!--[\s\S]*?-->/g, '')
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter((b) => b !== '')
  const first = blocks[0]
  const heading = first?.startsWith('# ') ? first.slice(2).trim() : null
  return { heading, paragraphs: heading === null ? blocks : blocks.slice(1) }
}

// The home screen is the search (#59): the missing dog's form, and once it is saved, that dog's
// ranked listings under it, on the same screen. The saved dogs and Jill's block follow.

export function Home() {
  const { heading, paragraphs } = readMemorial(memorial)
  // The dog the form last saved, and how many searches were started, which gives a fresh form.
  const [searched, setSearched] = useState<Dog | null>(null)
  const [round, setRound] = useState(0)
  const [message, setMessage] = useState('')
  const results = useRef<HTMLElement>(null)
  const top = useRef<HTMLHeadingElement>(null)

  const onSaved = (dog: Dog) => {
    setSearched(dog)
    setMessage('The dog was saved.')
  }

  const startOver = () => {
    setSearched(null)
    setMessage('')
    setRound((n) => n + 1)
  }

  // After a save the focus lands on the results, so a keyboard or screen-reader user is taken
  // to them; after "Start a new search" it lands back on the page's heading. Both wait for the
  // page to be drawn, since a hidden section can't take the focus.
  useEffect(() => {
    if (searched !== null) results.current?.focus()
  }, [searched])
  useEffect(() => {
    if (round > 0) top.current?.focus()
  }, [round])

  return (
    <>
      <h1 ref={top} tabIndex={-1} className="search-title">
        Find a dog
      </h1>
      <DogFormView
        key={`form-${round}`}
        variant="search"
        onSaved={onSaved}
        actions={
          searched !== null && (
            <button type="button" className="button button--quiet" onClick={startOver}>
              Start a new search
            </button>
          )
        }
      />
      {/* Outside the keyed parts, so the live region stays and its message is read out. */}
      <p className="status" role="status">
        {message}
      </p>
      <section className="results" ref={results} tabIndex={-1} aria-label="Search results" hidden={searched === null}>
        {searched !== null && (
          // A new key after each save loads the listings the save has just re-ranked.
          <DogResults key={`${searched.id}-${searched.updatedAt}`} id={searched.id} embedded />
        )}
      </section>

      <h2 className="section-title">Your dogs</h2>
      <DogList key={`list-${round}-${searched?.updatedAt ?? ''}`} />

      <section className="memorial" aria-labelledby="memorial-heading">
        <h2 id="memorial-heading">{heading ?? 'Jill'}</h2>
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>
    </>
  )
}
