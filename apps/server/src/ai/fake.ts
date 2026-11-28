import {
  type AiClient,
  AiError,
  type AiErrorCode,
  type AiFeature,
  type AiImage,
  type AiStatus,
  type AiTransport,
  type AiTransportAnswer,
  type AiTransportRequest,
} from './client.ts'

// The fakes every test uses in place of the Claude API. Nothing here opens a connection.

export type FakeAiClient = AiClient & {
  /** Every read that was asked for, in order. */
  reads: { feature: string; image: AiImage }[]
}

/**
 * A client with the capped client's interface. `answer` is what the model "said" (checked against
 * the feature's schema, as the real client does); `fail` makes every read throw that error.
 */
export function createFakeAiClient(
  options: { answer?: unknown; fail?: AiErrorCode; status?: Partial<AiStatus> } = {},
): FakeAiClient {
  const reads: FakeAiClient['reads'] = []
  return {
    reads,
    status: () => ({
      enabled: true,
      keySaved: true,
      model: 'claude-fake',
      today: reads.length,
      dailyCap: 25,
      month: reads.length,
      monthlyCap: 300,
      ...options.status,
    }),
    async read<T>(feature: AiFeature<T>, input: { image: AiImage }): Promise<T> {
      if (options.fail !== undefined) throw new AiError(options.fail)
      reads.push({ feature: feature.name, image: input.image })
      const parsed = feature.schema.safeParse(options.answer)
      if (!parsed.success) throw new AiError('invalid_answer')
      return parsed.data
    },
  }
}

export type FakeTransport = AiTransport & {
  /** Every request the capped client sent, in order. */
  sent: AiTransportRequest[]
  /** The keys the transport was made with. */
  keys: string[]
}

/**
 * A transport for testing the capped client itself. `answer` is the next answer, or a function
 * that makes it (and may throw, as a failed request does).
 */
export function createFakeTransport(
  answer: Partial<AiTransportAnswer> | ((request: AiTransportRequest) => Partial<AiTransportAnswer>) = {},
  models: string[] = ['claude-fake'],
): { transport: (apiKey: string) => FakeTransport; sent: AiTransportRequest[]; keys: string[] } {
  const sent: AiTransportRequest[] = []
  const keys: string[] = []
  const transport = (apiKey: string): FakeTransport => {
    keys.push(apiKey)
    return {
      sent,
      keys,
      async send(request) {
        sent.push(request)
        const given = typeof answer === 'function' ? answer(request) : answer
        return {
          stop: 'end',
          text: '{}',
          attempts: [{ model: request.model, inputTokens: 100, outputTokens: 10 }],
          ...given,
        }
      },
      listModels: async () => models,
    }
  }
  return { transport, sent, keys }
}
