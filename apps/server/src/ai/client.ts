import type { z } from 'zod'
import type { Repository } from '../db/repository.ts'
import type { AiSettings } from '../settings.ts'
import type { KeyResult } from './key.ts'

// The one capped client (ADR-0006 point 2, ADR-0007). Every model call the app makes goes through
// `read` here, and nothing else in the app can reach the Claude API: only sdk.ts imports the SDK,
// and only this file is handed a transport. Before a call is sent it must pass, in this order:
//   1. AI is turned on (JILL_AI=on);
//   2. a usable key is saved;
//   3. the month and the day have room, and the call is counted.
// It is counted before it is sent, so a crash never undercounts, and it is sent once: no retry.
// Logs hold ids, counts and timings only: never the key, the request, the answer or an API
// error's message.

/** Why a read gave no answer. The first five are the client refusing or failing to call. */
export type AiErrorCode =
  | 'ai_off'
  | 'no_key'
  | 'daily_cap'
  | 'monthly_cap'
  | 'api_error'
  /** The model declined the request. */
  | 'refused'
  /** The answer was cut off before it finished. */
  | 'cut_off'
  /** The answer did not fit the feature's schema. */
  | 'invalid_answer'

export class AiError extends Error {
  readonly code: AiErrorCode
  constructor(code: AiErrorCode) {
    super(`ai: ${code}`)
    this.name = 'AiError'
    this.code = code
  }
}

export type AiImage = { mediaType: 'image/jpeg' | 'image/png' | 'image/webp'; bytes: Uint8Array }

/**
 * One AI job. A feature is defined once, in this folder, with its instruction as fixed text: a
 * caller picks a feature and hands over the named input, and can't add words of its own
 * (ADR-0006: the client's input is built from named fields, never from a whole record).
 */
export type AiFeature<T> = {
  /** The name counted in ai_calls: letters, digits and dashes. */
  name: string
  instruction: string
  schema: z.ZodType<T>
  /** The most tokens the answer may use, thinking included. */
  maxTokens: number
}

export type AiStatus = {
  enabled: boolean
  /** Whether a key file is there. It is not decrypted to answer this. */
  keySaved: boolean
  model: string
  today: number
  dailyCap: number
  month: number
  monthlyCap: number
}

export type AiClient = {
  /** Whether AI is on and how much of the caps is used. Makes no call. */
  status(): AiStatus
  /** Reads one image for one feature and returns the checked answer, or throws an AiError. */
  read<T>(feature: AiFeature<T>, input: { image: AiImage }): Promise<T>
}

// The transport is the edge to the API: sdk.ts in real use, a fake in tests.

export type AiTransportRequest = {
  model: string
  instruction: string
  image: AiImage
  schema: z.ZodType
  maxTokens: number
}

/** One run of a model inside a request. More than one means the API ran a fallback model. */
export type AiAttempt = { model: string; inputTokens: number; outputTokens: number }

export type AiTransportAnswer = {
  stop: 'end' | 'refusal' | 'max_tokens' | 'other'
  /** The answer's text, read only when `stop` is `end`. */
  text: string
  attempts: AiAttempt[]
}

/** A failed request, as a kind and a status only: never the API's message. */
export class AiTransportError extends Error {
  readonly kind: 'status' | 'connection' | 'timeout' | 'guard'
  readonly status: number | null
  constructor(kind: AiTransportError['kind'], status: number | null = null) {
    super(`ai transport: ${kind}${status === null ? '' : ` ${status}`}`)
    this.name = 'AiTransportError'
    this.kind = kind
    this.status = status
  }
}

export type AiTransport = {
  send(request: AiTransportRequest): Promise<AiTransportAnswer>
  /** The ids of the models the key can use. Costs nothing. */
  listModels(): Promise<string[]>
}

export type AiClientOptions = {
  settings: AiSettings
  repo: Pick<Repository, 'aiUsage' | 'reserveAiCall' | 'finishAiCall' | 'recordAiFallback'>
  readKey: () => KeyResult
  keySaved: () => boolean
  /** Makes the transport for a key. The key goes nowhere else. */
  transport: (apiKey: string) => AiTransport
  now: () => Date
  log: (line: string) => void
  /** A millisecond clock for timings. */
  clock?: () => number
}

export function createAiClient(options: AiClientOptions): AiClient {
  const { settings, repo, log } = options
  const clock = options.clock ?? (() => performance.now())

  const refuse = (code: AiErrorCode, feature: string, detail = ''): never => {
    log(`ai: refused code=${code} feature=${feature}${detail}`)
    throw new AiError(code)
  }

  return {
    status() {
      const used = repo.aiUsage(options.now().toISOString())
      return {
        enabled: settings.enabled,
        keySaved: options.keySaved(),
        model: settings.model,
        today: used.today,
        dailyCap: settings.dailyCap,
        month: used.month,
        monthlyCap: settings.monthlyCap,
      }
    },

    async read<T>(feature: AiFeature<T>, input: { image: AiImage }): Promise<T> {
      if (!settings.enabled) return refuse('ai_off', feature.name)
      const key = options.readKey()
      if (!key.ok) return refuse('no_key', feature.name, ` reason=${key.reason}`)

      const at = options.now().toISOString()
      const reserved = repo.reserveAiCall({
        at,
        feature: feature.name,
        model: settings.model,
        dailyCap: settings.dailyCap,
        monthlyCap: settings.monthlyCap,
      })
      if (!reserved.ok) return refuse(reserved.reason, feature.name)

      const started = clock()
      const finish = (
        outcome: 'ok' | 'refused' | 'cut_off' | 'invalid_answer' | 'api_error',
        attempts: AiAttempt[],
        detail = '',
      ) => {
        const [first, ...fallbacks] = attempts
        repo.finishAiCall(reserved.id, {
          outcome,
          inputTokens: first?.inputTokens ?? 0,
          outputTokens: first?.outputTokens ?? 0,
        })
        // A run the API made by itself on another model is a call of its own (ADR-0007 point 6).
        for (const f of fallbacks) repo.recordAiFallback({ at, feature: feature.name, ...f, model: safeName(f.model) })
        const sum = (pick: (a: AiAttempt) => number) => attempts.reduce((n, a) => n + pick(a), 0)
        log(
          `ai: call id=${reserved.id} feature=${feature.name} model=${settings.model} outcome=${outcome}` +
            ` in=${sum((a) => a.inputTokens)} out=${sum((a) => a.outputTokens)} fallbacks=${fallbacks.length}` +
            ` ms=${Math.round(clock() - started)}${detail}`,
        )
      }

      let answer: AiTransportAnswer
      try {
        answer = await options.transport(key.key).send({
          model: settings.model,
          instruction: feature.instruction,
          image: input.image,
          schema: feature.schema,
          maxTokens: feature.maxTokens,
        })
      } catch (error) {
        // The kind and the status only: an API error's message can repeat the request.
        const detail =
          error instanceof AiTransportError
            ? ` kind=${error.kind}${error.status === null ? '' : ` status=${error.status}`}`
            : ' kind=unknown'
        finish('api_error', [], detail)
        throw new AiError('api_error')
      }

      // The stop reason comes first: a declined or cut-off answer is never read.
      if (answer.stop === 'refusal') {
        finish('refused', answer.attempts)
        throw new AiError('refused')
      }
      if (answer.stop !== 'end') {
        finish('cut_off', answer.attempts)
        throw new AiError('cut_off')
      }
      const parsed = feature.schema.safeParse(parseJson(answer.text))
      if (!parsed.success) {
        finish('invalid_answer', answer.attempts)
        throw new AiError('invalid_answer')
      }
      finish('ok', answer.attempts)
      return parsed.data
    },
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/** A model name as the API reported it, kept to the characters ai_calls allows. */
const safeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/^[^a-z0-9]+/, '')
    .slice(0, 80) || 'unknown'
