import type { DatabaseSync } from 'node:sqlite'
import { Instant } from '@jillandseek/core'
import { z } from 'zod'
import { transaction } from './rows.ts'

// The ai_calls table: one row per model call, counts only (ADR-0007 points 6 and 11). The capped
// client in apps/server/src/ai/ is its only caller. A row is written before its call is sent, and
// every row counts against the caps whatever its outcome, so nothing sent is ever uncounted.

/** How a call ended. `started` is a call that was sent and never finished (a crash). */
export const AiOutcome = z.enum(['started', 'ok', 'refused', 'cut_off', 'invalid_answer', 'api_error', 'fallback'])
export type AiOutcome = z.infer<typeof AiOutcome>

const Name = z
  .string()
  .regex(/^[a-z0-9][a-z0-9.-]{0,79}$/)
  .describe('a feature or model name: letters, digits, dots and dashes only')
const Count = z.number().int().min(0)

export type AiUsage = { today: number; month: number }
export type AiReservation = { ok: true; id: number } | { ok: false; reason: 'daily_cap' | 'monthly_cap' }

/** The UTC day and month that hold an instant, as ranges of ISO text. */
function windows(at: string) {
  const d = new Date(Instant.parse(at))
  const iso = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day)).toISOString()
  const [y, m, day] = [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()]
  return {
    day: [iso(y, m, day), iso(y, m, day + 1)] as const,
    month: [iso(y, m, 1), iso(y, m + 1, 1)] as const,
  }
}

export function aiCallsRepository(db: DatabaseSync) {
  const countBetween = (from: string, to: string) =>
    (db.prepare('SELECT COUNT(*) AS n FROM ai_calls WHERE at >= ? AND at < ?').get(from, to) as { n: number }).n

  const usage = (at: string): AiUsage => {
    const w = windows(at)
    return { today: countBetween(...w.day), month: countBetween(...w.month) }
  }

  const insert = (at: string, feature: string, model: string, outcome: AiOutcome, input = 0, output = 0) =>
    Number(
      db
        .prepare(
          'INSERT INTO ai_calls (at, feature, model, outcome, input_tokens, output_tokens) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .run(
          at,
          Name.parse(feature),
          Name.parse(model),
          AiOutcome.parse(outcome),
          Count.parse(input),
          Count.parse(output),
        ).lastInsertRowid,
    )

  return {
    /** How many calls were counted in the UTC day and the UTC month that hold `at`. */
    aiUsage: usage,

    /**
     * Counts a call before it is sent, or refuses it when the day or the month is full. The check
     * and the row land in one transaction, so two calls can't both take the last place.
     */
    reserveAiCall(call: {
      at: string
      feature: string
      model: string
      dailyCap: number
      monthlyCap: number
    }): AiReservation {
      return transaction(db, (): AiReservation => {
        const used = usage(call.at)
        if (used.month >= call.monthlyCap) return { ok: false, reason: 'monthly_cap' }
        if (used.today >= call.dailyCap) return { ok: false, reason: 'daily_cap' }
        return { ok: true, id: insert(call.at, call.feature, call.model, 'started') }
      })
    },

    /** Records how a counted call ended, and the tokens it used. */
    finishAiCall(id: number, result: { outcome: AiOutcome; inputTokens: number; outputTokens: number }): void {
      db.prepare('UPDATE ai_calls SET outcome = ?, input_tokens = ?, output_tokens = ? WHERE id = ?').run(
        AiOutcome.parse(result.outcome),
        Count.parse(result.inputTokens),
        Count.parse(result.outputTokens),
        id,
      )
    },

    /**
     * Counts a run the API made by itself inside a request that was already counted: a declined
     * read run again on another model. It is known only afterwards, so it can't be refused.
     */
    recordAiFallback(call: {
      at: string
      feature: string
      model: string
      inputTokens: number
      outputTokens: number
    }): number {
      Instant.parse(call.at)
      return insert(call.at, call.feature, call.model, 'fallback', call.inputTokens, call.outputTokens)
    },
  }
}
