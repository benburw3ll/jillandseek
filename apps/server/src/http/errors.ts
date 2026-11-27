import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { z } from 'zod'

// Errors are JSON with a code, and never a stack trace or the request's own values.

export type ErrorBody = { error: { code: string; issues?: { path: string; code: string }[] } }

export const jsonError = (
  c: Context,
  status: ContentfulStatusCode,
  code: string,
  extra: Partial<ErrorBody['error']> = {},
) => c.json({ error: { code, ...extra } } satisfies ErrorBody, status)

/** A zod failure as paths and codes only: zod's messages can repeat what was sent. */
export const invalid = (c: Context, error: z.ZodError) =>
  jsonError(c, 400, 'invalid', {
    issues: error.issues.map((i) => ({ path: i.path.map(String).join('.'), code: i.code })),
  })

/** Reads a JSON body, or answers 400 when it isn't JSON. */
export async function readJson(c: Context): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  try {
    return { ok: true, body: await c.req.json() }
  } catch {
    return { ok: false, response: jsonError(c, 400, 'bad-json') }
  }
}
