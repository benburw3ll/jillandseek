import { z } from 'zod'

/** A moment: ISO 8601 UTC text with milliseconds (`2026-01-02T03:04:05.000Z`), so moments sort as text. */
export const Instant = z.iso.datetime({ precision: 3 })
export type Instant = z.infer<typeof Instant>

/** A calendar date: `YYYY-MM-DD`. */
export const CalendarDate = z.iso.date()
export type CalendarDate = z.infer<typeof CalendarDate>

const DAY_MS = 24 * 60 * 60 * 1000

/** The moment `days` days before `now`. Pure: the caller passes the time in. */
export function daysBefore(now: Instant, days: number): Instant {
  return new Date(Date.parse(now) - days * DAY_MS).toISOString()
}
