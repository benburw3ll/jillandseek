import { DogInput, DogStatus } from '@jillandseek/core'
import { Hono } from 'hono'
import { invalid, jsonError, readJson } from '../http/errors.ts'
import type { RouteDeps } from './deps.ts'

const dogId = (text: string) => (/^[1-9]\d{0,15}$/.test(text) ? Number(text) : null)

export function dogsRoutes(deps: RouteDeps) {
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
      const input = DogInput.safeParse(read.body)
      if (!input.success) return invalid(c, input.error)
      return c.json(deps.repo.createDog(input.data, deps.now().toISOString()), 201)
    })
}
