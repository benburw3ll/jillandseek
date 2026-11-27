import type { Dog } from '@jillandseek/core'
import { useState } from 'react'
import { Link } from 'wouter'
import { deleteDog, fetchDogs, updateDog } from '../api/dogs.ts'
import { useLoad } from '../useLoad.ts'

// The dogs list (#17): missing and found dogs, with edit and "mark found". Marking a dog found
// starts its deletion clock: it and its photos are deleted 30 days later (ADR-0003).

const day = (moment: string) => moment.slice(0, 10)

/** Focuses an element after React has drawn it, so a button that swaps never drops focus to the page. */
const focusLater = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus())

export function DogList() {
  const load = useLoad((signal) => fetchDogs(signal))
  const [dogs, setDogs] = useState<Dog[] | null>(null)
  const [message, setMessage] = useState('')
  const [confirming, setConfirming] = useState<number | null>(null)
  const list = dogs ?? (load.state === 'ready' ? load.data : null)

  const replace = (next: Dog) => setDogs((list ?? []).map((d) => (d.id === next.id ? next : d)))

  const mark = async (dog: Dog, status: Dog['status']) => {
    try {
      replace(await updateDog(dog.id, { status }))
      focusLater(`dog-${dog.id}-status`)
      setMessage(
        status === 'found'
          ? 'Marked found. It and its photos are deleted after the set number of days (30 unless changed).'
          : 'Marked missing again.',
      )
    } catch {
      setMessage('That could not be saved. Check that Jill and Seek is running.')
    }
  }

  const remove = async (dog: Dog) => {
    try {
      await deleteDog(dog.id)
      setDogs((list ?? []).filter((d) => d.id !== dog.id))
      setConfirming(null)
      setMessage('The dog and its photos were deleted.')
      focusLater('dogs-status')
    } catch {
      setMessage('The dog could not be deleted. Check that Jill and Seek is running.')
    }
  }

  return (
    <>
      <p className="status" role="status" id="dogs-status" tabIndex={-1}>
        {message}
      </p>
      {load.state === 'loading' && <p aria-busy="true">Loading your dogs…</p>}
      {load.state === 'error' && (
        <p role="alert">Your dogs could not be loaded. Check that Jill and Seek's server is running.</p>
      )}
      {list !== null && list.length === 0 && (
        <div className="empty">
          <p>No dogs yet. A dog you save above shows here.</p>
        </div>
      )}
      {list !== null && list.length > 0 && (
        <ul className="list">
          {list.map((dog) => {
            const name = dog.label ?? `Dog ${dog.id}`
            return (
              <li key={dog.id} className="list__item dog-item">
                <strong>{name}</strong>
                <span>{dog.status === 'found' ? `Found ${day(dog.foundAt ?? dog.updatedAt)}` : 'Missing'}</span>
                <span>
                  Last seen in {dog.lastSeenTown}, {day(dog.lastSeenAt)}
                </span>
                <span className="dog-item__actions">
                  <Link href={`/dogs/${dog.id}`}>
                    Listings<span className="visually-hidden"> for {name}</span>
                  </Link>
                  <Link href={`/find/${dog.id}`}>
                    Edit<span className="visually-hidden"> {name}</span>
                  </Link>
                  {dog.status === 'missing' ? (
                    <button
                      type="button"
                      id={`dog-${dog.id}-status`}
                      className="button button--quiet"
                      onClick={() => mark(dog, 'found')}
                    >
                      Mark found<span className="visually-hidden"> {name}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id={`dog-${dog.id}-status`}
                      className="button button--quiet"
                      onClick={() => mark(dog, 'missing')}
                    >
                      Mark missing again<span className="visually-hidden"> {name}</span>
                    </button>
                  )}
                  {confirming === dog.id ? (
                    <>
                      <button
                        type="button"
                        id={`dog-${dog.id}-confirm`}
                        className="button button--danger"
                        onClick={() => remove(dog)}
                      >
                        Yes, delete {name} and its photos
                      </button>
                      <button
                        type="button"
                        className="button button--quiet"
                        onClick={() => {
                          setConfirming(null)
                          focusLater(`dog-${dog.id}-delete`)
                        }}
                      >
                        Keep it
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      id={`dog-${dog.id}-delete`}
                      className="button button--quiet"
                      onClick={() => {
                        setConfirming(dog.id)
                        focusLater(`dog-${dog.id}-confirm`)
                      }}
                    >
                      Delete<span className="visually-hidden"> {name}</span>
                    </button>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
