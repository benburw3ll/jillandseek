import { Link, useLocation } from 'wouter'
import { fetchDog } from '../api/dogs.ts'
import { useLoad } from '../useLoad.ts'
import { DogFormView } from './DogForm.tsx'

// A saved dog's edit page (/find/:id): every field, and its photos. A new dog is entered on the
// home screen, where the search is (#59).

export function FindDog({ id }: { id: number }) {
  const load = useLoad((signal) => fetchDog(id, signal))
  const [, navigate] = useLocation()
  return (
    <>
      <h1>Edit a dog</h1>
      <p>
        <Link href="/">Back to the search and your dogs</Link>
      </p>
      {load.state === 'loading' && <p aria-busy="true">Loading the dog…</p>}
      {load.state === 'error' && <p role="alert">This dog could not be loaded. It may have been deleted.</p>}
      {load.state === 'ready' && (
        // A saved dog goes to its ranked listings, which the save has just refreshed.
        <DogFormView dog={load.data} variant="edit" onSaved={(dog) => navigate(`/dogs/${dog.id}`)} />
      )}
    </>
  )
}
