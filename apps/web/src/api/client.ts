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

/**
 * Sends a state-changing request under /api with the header the server's guard asks for, and
 * checks the answer. The body is JSON, except the raw image bytes of a photo upload.
 */
async function send<T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body: { json: unknown } | { bytes: Blob; type: string },
  schema: z.ZodType<T> | null,
): Promise<T> {
  const isJson = 'json' in body
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      accept: 'application/json',
      'content-type': isJson ? 'application/json' : body.type,
      'x-jill-and-seek': '1',
    },
    body: isJson ? JSON.stringify(body.json) : body.bytes,
  })
  if (!res.ok) throw new ApiError(res.status, `${method} /api${path} answered ${res.status}`)
  if (schema === null) return undefined as T
  const parsed = schema.safeParse(await res.json())
  if (!parsed.success) throw new ApiError(res.status, `${method} /api${path} answered a shape the site doesn't know`)
  return parsed.data
}

/** POSTs JSON under /api and checks the answer. */
export const postJson = <T>(path: string, body: unknown, schema: z.ZodType<T>) =>
  send('POST', path, { json: body }, schema)

/** PATCHes JSON under /api and checks the answer. */
export const patchJson = <T>(path: string, body: unknown, schema: z.ZodType<T>) =>
  send('PATCH', path, { json: body }, schema)

/** DELETEs under /api; the answer is checked when a schema is given. */
export const deleteJson = <T>(path: string, schema: z.ZodType<T> | null) => send('DELETE', path, { json: {} }, schema)

/** POSTs a file's raw bytes under /api (only the photo route takes them) and checks the answer. */
export const postBytes = <T>(path: string, file: Blob, schema: z.ZodType<T>) =>
  send('POST', path, { bytes: file, type: file.type }, schema)
