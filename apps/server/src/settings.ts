import { isAbsolute, join, resolve } from 'node:path'
import { z } from 'zod'

// Settings read from the environment, checked with zod (ADR-0004 point 4).

/** The repo's root folder, so a relative JILL_HOME means the same wherever pnpm runs a script. */
export const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..')

/** The port in .claude/launch.json (`jillandseek-dev`): the one the owner's browser opens. */
export const DEFAULT_PORT = 5200

/** The only address the server binds. Never 0.0.0.0. */
export const HOSTNAME = '127.0.0.1'

const Days = z.coerce.number().int().min(1).max(3650)
const Port = z.coerce.number().int().min(1024).max(65535)

const Env = z.object({
  /** The data home. Relative paths are read from the repo's root. */
  JILL_HOME: z.string().trim().min(1).optional(),
  /** The port the owner's browser opens: the server's own under `pnpm start`, Vite's under `pnpm dev`. */
  JILL_PORT: Port.default(DEFAULT_PORT),
  /** Under `pnpm dev` only: the port the API listens on behind Vite's proxy (default: JILL_PORT + 1). */
  JILL_API_PORT: Port.optional(),
  /** Days a gone listing is kept after it was last seen (ADR-0003 point 3). */
  JILL_KEEP_GONE_DAYS: Days.default(90),
  /** Days a found dog is kept after it was marked found. */
  JILL_KEEP_FOUND_DAYS: Days.default(30),
  /** `off` turns the sweep off. It is on under `pnpm start` and off under `pnpm dev` and in tests. */
  JILL_SWEEP: z.enum(['on', 'off']).optional(),
  /** Set by Vitest: the sweep defaults to off in tests. */
  VITEST: z.string().optional(),
})

/** `start` keeps real data in data/ and serves the built site; `dev` keeps it in .dev-home/. */
export type Mode = 'start' | 'dev'

export type Settings = {
  mode: Mode
  home: string
  /** The port the server binds on 127.0.0.1. */
  port: number
  /** The port the browser uses. Host and Origin must name it (or `port`). */
  sitePort: number
  retention: { keepGoneDays: number; keepFoundDays: number }
  /** Whether the sweep runs (ADR-0002). */
  sweep: boolean
}

export function loadSettings(env: Record<string, string | undefined>, mode: Mode): Settings {
  const e = Env.parse(env)
  const given = e.JILL_HOME
  const home =
    given === undefined
      ? join(REPO_ROOT, mode === 'dev' ? '.dev-home' : 'data')
      : isAbsolute(given)
        ? given
        : resolve(REPO_ROOT, given)
  const port = mode === 'dev' ? (e.JILL_API_PORT ?? e.JILL_PORT + 1) : e.JILL_PORT
  return {
    mode,
    home,
    port,
    sitePort: e.JILL_PORT,
    retention: { keepGoneDays: e.JILL_KEEP_GONE_DAYS, keepFoundDays: e.JILL_KEEP_FOUND_DAYS },
    sweep: (e.JILL_SWEEP ?? (mode === 'dev' || e.VITEST !== undefined ? 'off' : 'on')) === 'on',
  }
}
