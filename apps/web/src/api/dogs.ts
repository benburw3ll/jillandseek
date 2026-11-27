import { Dog, type DogFormBody, type DogFormPatchBody } from '@jillandseek/core'
import { z } from 'zod'
import { deleteJson, getJson, patchJson, postBytes, postJson } from './client.ts'

const DogList = z.object({ items: z.array(Dog) })

/** GET /api/dogs: missing and found dogs, newest first. */
export async function fetchDogs(signal?: AbortSignal): Promise<Dog[]> {
  return (await getJson('/dogs', DogList, signal)).items
}

/** GET /api/dogs/:id. */
export function fetchDog(id: number, signal?: AbortSignal): Promise<Dog> {
  return getJson(`/dogs/${id}`, Dog, signal)
}

/** POST /api/dogs. */
export function createDog(input: DogFormBody): Promise<Dog> {
  return postJson('/dogs', input, Dog)
}

/** PATCH /api/dogs/:id. `{ status: 'found' }` marks the dog found and starts its deletion clock. */
export function updateDog(id: number, patch: DogFormPatchBody): Promise<Dog> {
  return patchJson(`/dogs/${id}`, patch, Dog)
}

/** DELETE /api/dogs/:id, with its photos. */
export function deleteDog(id: number): Promise<void> {
  return deleteJson(`/dogs/${id}`, null)
}

/** POST /api/dogs/:id/photos: the file's own bytes, never a form; the server names the file. */
export function uploadPhoto(id: number, file: Blob): Promise<Dog> {
  return postBytes(`/dogs/${id}/photos`, file, Dog)
}

/** DELETE /api/dogs/:id/photos/:name. */
export function removePhoto(id: number, name: string): Promise<Dog> {
  return deleteJson(`/dogs/${id}/photos/${encodeURIComponent(name)}`, Dog)
}

/** Where the site reads a dog's photo from, on its own origin. */
export const photoUrl = (id: number, name: string) => `/api/dogs/${id}/photos/${encodeURIComponent(name)}`
