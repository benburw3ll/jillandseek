import type { z } from 'zod'

// The site reaches the server only through its API, on the site's own origin. Every answer is
// checked against the shared schema from packages/core before a page uses it.

/** An answer the site couldn't use: an HTTP error, or a body that doesn't fit the schema. */
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** GETs a path under /api and checks the answer. */
export async function getJson<T>(path: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`/api${path}`, { headers: { accept: 'application/json' }, signal })
  if (!res.ok) throw new ApiError(res.status, `GET /api${path} answered ${res.status}`)
  const parsed = schema.safeParse(await res.json())
  if (!parsed.success) throw new ApiError(res.status, `GET /api${path} answered a shape the site doesn't know`)
  return parsed.data
}

/** POSTs JSON under /api with the header the server's guard asks for, and checks the answer. */
export async function postJson<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', 'x-jill-and-seek': '1' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new ApiError(res.status, `POST /api${path} answered ${res.status}`)
  const parsed = schema.safeParse(await res.json())
  if (!parsed.success) throw new ApiError(res.status, `POST /api${path} answered a shape the site doesn't know`)
  return parsed.data
}
