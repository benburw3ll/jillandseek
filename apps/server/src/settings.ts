import { isAbsolute, join, resolve } from 'node:path'
import { z } from 'zod'

// Settings read from the environment, checked with zod (ADR-0004 point 4).

/** The repo's root folder, so a relative JILL_HOME means the same wherever pnpm runs a script. */
export const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..')

const Days = z.coerce.number().int().min(1).max(3650)

const Env = z.object({
  /** The data home. Relative paths are read from the repo's root. */
  JILL_HOME: z.string().trim().min(1).optional(),
  /** Days a gone listing is kept after it was last seen (ADR-0003 point 3). */
  JILL_KEEP_GONE_DAYS: Days.default(90),
  /** Days a found dog is kept after it was marked found. */
  JILL_KEEP_FOUND_DAYS: Days.default(30),
})

/** `start` keeps real data in data/; `dev` keeps it in .dev-home/. */
export type Mode = 'start' | 'dev'

export type Settings = {
  mode: Mode
  home: string
  retention: { keepGoneDays: number; keepFoundDays: number }
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
  return { mode, home, retention: { keepGoneDays: e.JILL_KEEP_GONE_DAYS, keepFoundDays: e.JILL_KEEP_FOUND_DAYS } }
}
