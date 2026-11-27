import { Dog, type DogInputBody } from '@jillandseek/core'
import { z } from 'zod'
import { getJson, postJson } from './client.ts'

const DogList = z.object({ items: z.array(Dog) })

/** GET /api/dogs. O4 (#17) builds the pages that use these. */
export async function fetchDogs(signal?: AbortSignal): Promise<Dog[]> {
  return (await getJson('/dogs', DogList, signal)).items
}

/** GET /api/dogs/:id. */
export function fetchDog(id: number, signal?: AbortSignal): Promise<Dog> {
  return getJson(`/dogs/${id}`, Dog, signal)
}

/** POST /api/dogs. */
export function createDog(input: DogInputBody): Promise<Dog> {
  return postJson('/dogs', input, Dog)
}
