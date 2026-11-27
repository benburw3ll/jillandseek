import { API_VERSION } from '@jillandseek/core'
import { Hono } from 'hono'
import type { RouteDeps } from './deps.ts'

export type Health = {
  app: 'jillandseek'
  version: string
  apiVersion: number
  schemaVersion: number
  dataHome: { writable: boolean }
  counts: ReturnType<RouteDeps['repo']['counts']>
}

export function healthRoutes(deps: RouteDeps) {
  return new Hono().get('/health', (c) =>
    c.json({
      app: 'jillandseek',
      version: deps.version,
      apiVersion: API_VERSION,
      schemaVersion: deps.schemaVersion,
      dataHome: { writable: deps.dataHomeWritable() },
      counts: deps.repo.counts(),
    } satisfies Health),
  )
}
