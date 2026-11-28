import { type AiTransport, AiTransportError } from './client.ts'
import type { KeyResult } from './key.ts'

// `pnpm ai:check` (ADR-0007 point 10): says whether the saved key works by listing the models,
// which costs nothing. It sends nothing but the key, and its output holds no part of it.

export type CheckCode = 'works' | 'no_key' | 'cant_decrypt' | 'bad_shape' | 'refused' | 'unreachable' | 'api_error'

export type CheckResult = { code: CheckCode; line: string }

const STEPS = 'docs/claude-api.md has the steps.'

export async function checkKey(options: {
  readKey: () => KeyResult
  transport: (apiKey: string) => AiTransport
  /** The model the app is set to use, looked for in the list. */
  model: string
}): Promise<CheckResult> {
  const key = options.readKey()
  if (!key.ok) {
    const line = {
      no_key: `no key saved. ${STEPS}`,
      cant_decrypt: `the saved key can't be decrypted. It was saved by another Windows account or on another computer: save it again. ${STEPS}`,
      bad_shape: `the saved file doesn't hold a usable API key (an Admin key or a login token is refused). Save an API key again. ${STEPS}`,
    }[key.reason]
    return { code: key.reason, line: `ai:check: ${line}` }
  }
  try {
    const models = await options.transport(key.key).listModels()
    const has = models.includes(options.model)
    return {
      code: 'works',
      line:
        `ai:check: works. Anthropic accepted the saved key and listed ${models.length} models. ` +
        (has
          ? `${options.model} is one of them.`
          : `${options.model}, the model the app is set to use, is not one of them: set JILL_AI_MODEL to one that is.`),
    }
  } catch (error) {
    if (error instanceof AiTransportError && error.kind === 'status') {
      return error.status === 401 || error.status === 403
        ? {
            code: 'refused',
            line: `ai:check: refused by Anthropic (status ${error.status}). The key is wrong, was revoked or can't list models: make a new one and save it. ${STEPS}`,
          }
        : { code: 'api_error', line: `ai:check: Anthropic answered with status ${error.status}. Try again later.` }
    }
    return { code: 'unreachable', line: "ai:check: couldn't reach Anthropic. Check the connection and try again." }
  }
}
