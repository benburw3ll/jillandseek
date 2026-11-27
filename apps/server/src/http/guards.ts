import { MAX_PHOTO_BYTES, PHOTO_TYPES } from '@jillandseek/core'
import type { Context, MiddlewareHandler } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { jsonError } from './errors.ts'

// The guards in front of every route. The server listens on 127.0.0.1, but any website open in
// the owner's browser can still send it requests, so that website is the attacker here:
// - a foreign Host is DNS rebinding (an attacker's name pointed at 127.0.0.1): refused;
// - a foreign Origin is another site's script or form: refused;
// - a cross-site fetch of the API, even a plain GET, is refused by Sec-Fetch-Site;
// - a state-changing request must be JSON with the X-Jill-And-Seek header, which a form can't
//   send and a cross-site script can't send without a CORS preflight this server never allows;
// - bodies are capped at 1 MB.
// The one exception is a photo upload (POST /api/dogs/:id/photos): its body is the raw image,
// typed image/jpeg, image/png or image/webp, capped at 5 MB, and it still needs the header.
// No multipart and no form: every other route stays JSON-only at 1 MB.

export const CUSTOM_HEADER = 'x-jill-and-seek'
export const MAX_BODY_BYTES = 1024 * 1024
export { MAX_PHOTO_BYTES }

const SAFE_METHODS = new Set(['GET', 'HEAD'])

/** The one route that takes an image body: exactly POST /api/dogs/<id>/photos. */
const PHOTO_UPLOAD = /^\/api\/dogs\/[1-9]\d{0,15}\/photos$/
export const isPhotoUpload = (c: Context) => c.req.method === 'POST' && PHOTO_UPLOAD.test(c.req.path)

/** The app's own hosts: 127.0.0.1 and localhost on each of its ports. */
export function ownHosts(ports: number[]): Set<string> {
  return new Set(ports.flatMap((p) => [`127.0.0.1:${p}`, `localhost:${p}`]))
}

/** Refuses a request whose Host or Origin is not the app's own. */
export function hostAndOrigin(hosts: Set<string>): MiddlewareHandler {
  const origins = new Set([...hosts].map((h) => `http://${h}`))
  return async (c, next) => {
    const host = c.req.header('host')?.toLowerCase()
    if (host === undefined || !hosts.has(host)) return jsonError(c, 403, 'foreign-host')
    // A request line in absolute form (GET http://other.example/...) names a host of its own.
    if (!hosts.has(new URL(c.req.url).host.toLowerCase())) return jsonError(c, 403, 'foreign-host')
    const origin = c.req.header('origin')
    if (origin !== undefined && !origins.has(origin.toLowerCase())) return jsonError(c, 403, 'foreign-origin')
    await next()
  }
}

/** Refuses an API request a browser marks as coming from another site, even a GET. */
export const sameOriginApi: MiddlewareHandler = async (c, next) => {
  const site = c.req.header('sec-fetch-site')
  if (site !== undefined && site !== 'same-origin' && site !== 'none') return jsonError(c, 403, 'cross-site')
  await next()
}

/** A state-changing request needs the custom header and a JSON body (an image on the photo route). */
export const stateChange: MiddlewareHandler = async (c, next) => {
  if (SAFE_METHODS.has(c.req.method)) return next()
  if (c.req.header(CUSTOM_HEADER) !== '1') return jsonError(c, 403, 'missing-header')
  const type = c.req.header('content-type')?.split(';')[0]?.trim().toLowerCase()
  if (isPhotoUpload(c)) {
    if (type === undefined || !Object.hasOwn(PHOTO_TYPES, type)) return jsonError(c, 415, 'image-only')
  } else if (type !== 'application/json') return jsonError(c, 415, 'json-only')
  await next()
}

const tooLarge = (c: Context) => jsonError(c, 413, 'too-large')
const capJson = bodyLimit({ maxSize: MAX_BODY_BYTES, onError: tooLarge })
const capPhoto = bodyLimit({ maxSize: MAX_PHOTO_BYTES, onError: tooLarge })

/** Caps a request body at 1 MB (5 MB on the photo route), whether or not it says its length. */
export const capBody: MiddlewareHandler = (c, next) => (isPhotoUpload(c) ? capPhoto(c, next) : capJson(c, next))
