import { DogForm, DogFormPatch, DogStatus, PhotoName } from '@jillandseek/core'
import { Hono } from 'hono'
import { invalid, jsonError, readJson } from '../http/errors.ts'
import type { RouteDeps } from './deps.ts'

// The dogs routes (#17). A dog's body is the shared form schema, so the town always comes from
// the local towns table. A photo is uploaded as its raw bytes (the guards let only this one route
// take an image body, up to 5 MB) and read back only by a name in that dog's own list.

const dogId = (text: string) => (/^[1-9]\d{0,15}$/.test(text) ? Number(text) : null)

export function dogsRoutes(deps: RouteDeps) {
  const now = () => deps.now().toISOString()
  return new Hono()
    .get('/dogs', (c) => {
      const status = c.req.query('status')
      if (status === undefined) return c.json({ items: deps.repo.listDogs() })
      const parsed = DogStatus.safeParse(status)
      if (!parsed.success) return invalid(c, parsed.error)
      return c.json({ items: deps.repo.listDogs({ status: parsed.data }) })
    })
    .get('/dogs/:id', (c) => {
      const id = dogId(c.req.param('id'))
      const dog = id === null ? null : deps.repo.getDog(id)
      return dog === null ? jsonError(c, 404, 'not-found') : c.json(dog)
    })
    .post('/dogs', async (c) => {
      const read = await readJson(c)
      if (!read.ok) return read.response
      const input = DogForm.safeParse(read.body)
      if (!input.success) return invalid(c, input.error)
      return c.json(deps.repo.createDog(input.data, now()), 201)
    })
    .patch('/dogs/:id', async (c) => {
      const id = dogId(c.req.param('id'))
      if (id === null) return jsonError(c, 404, 'not-found')
      const read = await readJson(c)
      if (!read.ok) return read.response
      const patch = DogFormPatch.safeParse(read.body)
      if (!patch.success) return invalid(c, patch.error)
      const dog = deps.repo.updateDog(id, patch.data, now())
      return dog === null ? jsonError(c, 404, 'not-found') : c.json(dog)
    })
    .delete('/dogs/:id', (c) => {
      const id = dogId(c.req.param('id'))
      if (id === null || !deps.repo.deleteDog(id)) return jsonError(c, 404, 'not-found')
      return c.body(null, 204)
    })
    .post('/dogs/:id/photos', async (c) => {
      const id = dogId(c.req.param('id'))
      if (id === null) return jsonError(c, 404, 'not-found')
      const bytes = new Uint8Array(await c.req.arrayBuffer())
      const result = deps.repo.addPhoto(id, bytes, now())
      if (result.ok) return c.json(result.dog, 201)
      if (result.error === 'not-found') return jsonError(c, 404, 'not-found')
      if (result.error === 'not-an-image') return jsonError(c, 415, 'not-an-image')
      return jsonError(c, 409, 'too-many-photos')
    })
    .get('/dogs/:id/photos/:name', (c) => {
      const id = dogId(c.req.param('id'))
      const name = c.req.param('name')
      const photo = id === null || !PhotoName.safeParse(name).success ? null : deps.repo.readPhoto(id, name)
      if (photo === null) return jsonError(c, 404, 'not-found')
      return c.body(photo.bytes, 200, { 'content-type': photo.type })
    })
    .delete('/dogs/:id/photos/:name', (c) => {
      const id = dogId(c.req.param('id'))
      const name = c.req.param('name')
      const dog = id === null || !PhotoName.safeParse(name).success ? null : deps.repo.removePhoto(id, name, now())
      return dog === null ? jsonError(c, 404, 'not-found') : c.json(dog)
    })
}
