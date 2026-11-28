import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import {
  type AiAttempt,
  type AiTransport,
  type AiTransportAnswer,
  AiTransportError,
  type AiTransportRequest,
} from './client.ts'

// The edge to the Claude API: the only file in the repo that imports the SDK (a test checks it).
// Only the capped client in client.ts is handed what this makes.
//
// The key and the address are given here explicitly (ADR-0007 point 5). The SDK reads the
// environment only for what it was not given, so no ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN,
// ANTHROPIC_BASE_URL or signed-in profile on the computer can supply a credential or send a photo
// somewhere else. `guardedFetch` checks that again on every request.

/** The one address a request may go to. */
export const API_URL = 'https://api.anthropic.com'

/** Lets the API run a declined read again on the model Anthropic recommends, in the same request. */
const FALLBACK_BETA = 'server-side-fallback-2026-07-01'

/** One request may take this long before it is given up. It is not sent again. */
const TIMEOUT_MS = 90_000

type Fetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

/**
 * The last word on where a request goes and whose it is. A request for any other address is
 * refused and never leaves the computer. The credential is set here to exactly this key, so
 * nothing else can swap in another one.
 */
function guardedFetch(inner: Fetch, apiKey: string): Fetch {
  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input))
    if (url.origin !== API_URL) throw new AiTransportError('guard')
    const headers = new Headers(input instanceof Request ? input.headers : undefined)
    new Headers(init?.headers).forEach((value, name) => {
      headers.set(name, value)
    })
    headers.set('authorization', `Bearer ${apiKey}`)
    headers.delete('x-api-key')
    return inner(input, { ...init, headers })
  }
}

/**
 * ANTHROPIC_CUSTOM_HEADERS is the one variable the SDK reads whatever it is given: its
 * constructor adds those headers to every request. Another tool's headers (a gateway's token,
 * say) must not go out with a photo, so the variable is out of the environment for the moment
 * the client is built, and back unchanged after. The constructor is synchronous, so nothing else
 * runs in between.
 */
function withoutCustomHeaders<T>(build: () => T): T {
  const NAME = 'ANTHROPIC_CUSTOM_HEADERS'
  const saved = process.env[NAME]
  delete process.env[NAME]
  try {
    return build()
  } finally {
    if (saved !== undefined) process.env[NAME] = saved
  }
}

export function createSdkTransport(options: { apiKey: string; fetch?: Fetch }): AiTransport {
  const client = withoutCustomHeaders(
    () =>
      new Anthropic({
        apiKey: options.apiKey,
        baseURL: API_URL,
        // One counted call is one request: the SDK's own retries are off.
        maxRetries: 0,
        timeout: TIMEOUT_MS,
        // The SDK can log request bodies and export traces when the environment asks. Neither, ever.
        logLevel: 'off',
        openTelemetry: false,
        fetch: guardedFetch(options.fetch ?? ((input, init) => fetch(input, init)), options.apiKey),
      }),
  )

  return {
    async send(request: AiTransportRequest): Promise<AiTransportAnswer> {
      try {
        // No `thinking`, no sampling parameter and no forced tool choice: the current models
        // refuse them. Effort is set explicitly, and the answer is asked for as structured output.
        const message = await client.beta.messages.create({
          model: request.model,
          max_tokens: request.maxTokens,
          betas: [FALLBACK_BETA],
          fallbacks: 'default',
          output_config: { effort: 'low', format: betaZodOutputFormat(request.schema) },
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: request.image.mediaType,
                    data: Buffer.from(request.image.bytes).toString('base64'),
                  },
                },
                { type: 'text', text: request.instruction },
              ],
            },
          ],
        })
        const stop: AiTransportAnswer['stop'] =
          message.stop_reason === 'end_turn'
            ? 'end'
            : message.stop_reason === 'refusal'
              ? 'refusal'
              : message.stop_reason === 'max_tokens' || message.stop_reason === 'model_context_window_exceeded'
                ? 'max_tokens'
                : 'other'
        const text =
          stop === 'end' ? message.content.flatMap((block) => (block.type === 'text' ? [block.text] : [])).join('') : ''
        return { stop, text, attempts: attempts(message) }
      } catch (error) {
        throw transportError(error)
      }
    },

    async listModels(): Promise<string[]> {
      try {
        const page = await client.models.list({ limit: 100 })
        return page.data.map((model) => model.id)
      } catch (error) {
        throw transportError(error)
      }
    },
  }
}

/**
 * Each run of a model inside the request. Without a fallback there is one. When the API ran a
 * declined read again on another model, `usage.iterations` lists every run, and the top-level
 * usage covers the last one only.
 */
function attempts(message: Anthropic.Beta.BetaMessage): AiAttempt[] {
  const runs = (message.usage.iterations ?? []).flatMap((entry): AiAttempt[] =>
    entry.type === 'message' || entry.type === 'fallback_message'
      ? [{ model: entry.model ?? message.model, inputTokens: inputTokens(entry), outputTokens: entry.output_tokens }]
      : [],
  )
  if (runs.length > 0) return runs
  return [{ model: message.model, inputTokens: inputTokens(message.usage), outputTokens: message.usage.output_tokens }]
}

const inputTokens = (usage: {
  input_tokens: number
  cache_creation_input_tokens: number | null
  cache_read_input_tokens: number | null
}) => usage.input_tokens + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0)

/** An SDK error as a kind and a status. Its message, which can repeat the request, is dropped. */
function transportError(error: unknown): AiTransportError {
  if (error instanceof AiTransportError) return error
  if (error instanceof Anthropic.APIConnectionTimeoutError) return new AiTransportError('timeout')
  if (error instanceof Anthropic.APIConnectionError) {
    // The guard's refusal reaches here wrapped as a failed connection.
    return error.cause instanceof AiTransportError ? error.cause : new AiTransportError('connection')
  }
  if (error instanceof Anthropic.APIError && typeof error.status === 'number') {
    return new AiTransportError('status', error.status)
  }
  return new AiTransportError('connection')
}
