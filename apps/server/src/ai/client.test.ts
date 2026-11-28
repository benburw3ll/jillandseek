import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { openStore, type Store } from '../db/store.ts'
import { type AiSettings, loadSettings } from '../settings.ts'
import { type AiClientOptions, AiError, type AiFeature, AiTransportError, createAiClient } from './client.ts'
import { createFakeAiClient, createFakeTransport } from './fake.ts'
import type { KeyResult } from './key.ts'

// The capped client is a guard: these tests try to get a call past it. Everything is made up,
// and the transport is a fake, so nothing leaves the computer.

const T0 = '2026-03-10T12:00:00.000Z'
// Built from parts so no key-shaped string sits in the repo.
const DUMMY_KEY = ['sk', 'ant', 'test', 'k'.repeat(24)].join('-')
const IMAGE = { mediaType: 'image/png', bytes: new Uint8Array([1, 2, 3]) } as const

const Colour = z.object({ colour: z.string() })
const feature: AiFeature<z.infer<typeof Colour>> = {
  name: 'test-feature',
  instruction: 'INSTRUCTION-MARKER say the colour',
  schema: Colour,
  maxTokens: 1000,
}

const cleanups: (() => void)[] = []
afterEach(() => {
  for (const c of cleanups.splice(0).reverse()) c()
})

function tempHome(): string {
  const home = mkdtempSync(join(tmpdir(), 'jill-ai-'))
  cleanups.push(() => rmSync(home, { recursive: true, force: true }))
  return home
}

function open(home: string, now: () => Date): Store {
  const store = openStore({ home, retention: { keepGoneDays: 90, keepFoundDays: 30 }, now, log: () => {} })
  cleanups.push(() => {
    if (store.db.isOpen) store.close()
  })
  return store
}

function setup(
  options: {
    ai?: Partial<AiSettings>
    key?: KeyResult
    answer?: Parameters<typeof createFakeTransport>[0]
    home?: string
    clock?: { now: string }
  } = {},
) {
  const clock = options.clock ?? { now: T0 }
  const now = () => new Date(clock.now)
  const store = open(options.home ?? tempHome(), now)
  const fake = createFakeTransport(options.answer ?? { text: '{"colour":"brindle"}' })
  const lines: string[] = []
  const settings: AiSettings = {
    enabled: true,
    model: 'claude-test-1',
    dailyCap: 25,
    monthlyCap: 300,
    keyFile: 'unused',
    ...options.ai,
  }
  const clientOptions: AiClientOptions = {
    settings,
    repo: store.repo,
    readKey: () => options.key ?? { ok: true, key: DUMMY_KEY },
    keySaved: () => true,
    transport: fake.transport,
    now,
    log: (l) => lines.push(l),
    clock: () => 0,
  }
  return { client: createAiClient(clientOptions), store, fake, lines, clock }
}

const code = async (promise: Promise<unknown>) => {
  try {
    await promise
    return 'no-error'
  } catch (error) {
    return error instanceof AiError ? error.code : 'not-an-ai-error'
  }
}

describe('off by default', () => {
  it('is off unless JILL_AI is on, with the caps the owner confirmed', () => {
    const settings = loadSettings({}, 'start').ai
    expect(settings).toMatchObject({ enabled: false, model: 'claude-opus-5-5', dailyCap: 25, monthlyCap: 300 })
    expect(loadSettings({}, 'dev').ai.enabled).toBe(false)
    expect(
      loadSettings({ JILL_AI: 'on', JILL_AI_DAILY_CAP: '3', JILL_AI_MODEL: 'claude-haiku-5-5' }, 'start').ai,
    ).toMatchObject({ enabled: true, model: 'claude-haiku-5-5', dailyCap: 3 })
    expect(() => loadSettings({ JILL_AI: 'yes' }, 'start')).toThrow()
    expect(() => loadSettings({ JILL_AI_MODEL: 'gpt-9' }, 'start')).toThrow()
  })

  it('keeps the key file outside the repo and the data home', () => {
    const settings = loadSettings({ LOCALAPPDATA: join(tmpdir(), 'made-up-appdata') }, 'start')
    expect(settings.ai.keyFile).toBe(join(tmpdir(), 'made-up-appdata', 'JillAndSeek', 'claude-api-key.dpapi'))
    expect(settings.ai.keyFile.startsWith(settings.home)).toBe(false)
  })

  it('refuses every call with ai_off, and reads no key, counts nothing and sends nothing', async () => {
    let keyReads = 0
    const { store, fake, lines } = setup()
    const client = createAiClient({
      settings: loadSettings({}, 'start').ai,
      repo: store.repo,
      readKey: () => {
        keyReads++
        return { ok: true, key: DUMMY_KEY }
      },
      keySaved: () => true,
      transport: fake.transport,
      now: () => new Date(T0),
      log: (l) => lines.push(l),
    })
    expect(await code(client.read(feature, { image: IMAGE }))).toBe('ai_off')
    expect(keyReads).toBe(0)
    expect(fake.sent).toEqual([])
    expect(fake.keys).toEqual([])
    expect(store.repo.aiUsage(T0)).toEqual({ today: 0, month: 0 })
    expect(client.status()).toMatchObject({ enabled: false, today: 0, month: 0 })
    expect(lines).toEqual(['ai: refused code=ai_off feature=test-feature'])
  })
})

describe('a call that goes through', () => {
  it('sends the feature’s fixed instruction and the image, and returns the checked answer', async () => {
    const { client, fake, store, lines } = setup()
    expect(await client.read(feature, { image: IMAGE })).toEqual({ colour: 'brindle' })
    expect(fake.keys).toEqual([DUMMY_KEY])
    expect(fake.sent).toEqual([
      { model: 'claude-test-1', instruction: feature.instruction, image: IMAGE, schema: Colour, maxTokens: 1000 },
    ])
    expect(store.repo.aiUsage(T0)).toEqual({ today: 1, month: 1 })
    expect(store.db.prepare('SELECT * FROM ai_calls').all()).toEqual([
      {
        id: 1,
        at: T0,
        feature: 'test-feature',
        model: 'claude-test-1',
        outcome: 'ok',
        input_tokens: 100,
        output_tokens: 10,
      },
    ])
    expect(lines).toEqual([
      'ai: call id=1 feature=test-feature model=claude-test-1 outcome=ok in=100 out=10 fallbacks=0 ms=0',
    ])
  })

  it('refuses with no_key when no usable key is saved, and counts nothing', async () => {
    for (const reason of ['no_key', 'cant_decrypt', 'bad_shape'] as const) {
      const { client, fake, store } = setup({ key: { ok: false, reason } })
      expect(await code(client.read(feature, { image: IMAGE }))).toBe('no_key')
      expect(fake.sent).toEqual([])
      expect(store.repo.aiUsage(T0)).toEqual({ today: 0, month: 0 })
    }
  })
})

describe('the caps', () => {
  it('refuses the call after the daily cap, and takes calls again the next UTC day', async () => {
    const { client, fake, clock } = setup({ ai: { dailyCap: 2 } })
    await client.read(feature, { image: IMAGE })
    clock.now = '2026-03-10T23:59:59.999Z'
    await client.read(feature, { image: IMAGE })
    expect(await code(client.read(feature, { image: IMAGE }))).toBe('daily_cap')
    expect(fake.sent).toHaveLength(2)
    expect(client.status()).toMatchObject({ today: 2, dailyCap: 2, month: 2 })
    clock.now = '2026-03-11T00:00:00.000Z'
    await client.read(feature, { image: IMAGE })
    expect(fake.sent).toHaveLength(3)
  })

  it('refuses the call after the monthly cap, and takes calls again the next UTC month', async () => {
    const { client, fake, clock } = setup({ ai: { monthlyCap: 2 } })
    await client.read(feature, { image: IMAGE })
    clock.now = '2026-03-31T23:59:59.999Z'
    await client.read(feature, { image: IMAGE })
    expect(await code(client.read(feature, { image: IMAGE }))).toBe('monthly_cap')
    expect(fake.sent).toHaveLength(2)
    clock.now = '2026-04-01T00:00:00.000Z'
    await client.read(feature, { image: IMAGE })
    expect(fake.sent).toHaveLength(3)
  })

  it('keeps counting across a restart: a new client on the same data home is still capped', async () => {
    const home = tempHome()
    const first = setup({ home, ai: { dailyCap: 2, monthlyCap: 3 } })
    await first.client.read(feature, { image: IMAGE })
    await first.client.read(feature, { image: IMAGE })
    first.store.close()

    const second = setup({ home, ai: { dailyCap: 2, monthlyCap: 3 } })
    expect(second.client.status()).toMatchObject({ today: 2, month: 2 })
    expect(await code(second.client.read(feature, { image: IMAGE }))).toBe('daily_cap')
    expect(second.fake.sent).toEqual([])
    second.store.close()

    const third = setup({ home, ai: { dailyCap: 2, monthlyCap: 3 }, clock: { now: '2026-03-11T08:00:00.000Z' } })
    await third.client.read(feature, { image: IMAGE })
    expect(await code(third.client.read(feature, { image: IMAGE }))).toBe('monthly_cap')
    expect(third.fake.sent).toHaveLength(1)
  })

  it('counts a call before it is sent, so one that never finishes still takes its place', async () => {
    const { client, store, fake } = setup({
      ai: { dailyCap: 1 },
      answer: () => {
        // The count is already there while the request is in flight.
        expect(store.repo.aiUsage(T0)).toEqual({ today: 1, month: 1 })
        expect(store.db.prepare('SELECT outcome FROM ai_calls').all()).toEqual([{ outcome: 'started' }])
        throw new AiTransportError('connection')
      },
    })
    expect(await code(client.read(feature, { image: IMAGE }))).toBe('api_error')
    expect(await code(client.read(feature, { image: IMAGE }))).toBe('daily_cap')
    expect(fake.sent).toHaveLength(1)
  })

  it('a cap of zero lets nothing through', async () => {
    const { client, fake } = setup({ ai: { dailyCap: 0 } })
    expect(await code(client.read(feature, { image: IMAGE }))).toBe('daily_cap')
    expect(fake.sent).toEqual([])
  })

  it('counts a run the API made on a fallback model as a call of its own', async () => {
    const { client, store } = setup({
      ai: { dailyCap: 3 },
      answer: {
        text: '{"colour":"fawn"}',
        attempts: [
          { model: 'claude-test-1', inputTokens: 90, outputTokens: 0 },
          { model: 'claude-test-0', inputTokens: 95, outputTokens: 12 },
        ],
      },
    })
    await client.read(feature, { image: IMAGE })
    expect(store.repo.aiUsage(T0)).toEqual({ today: 2, month: 2 })
    expect(
      store.db.prepare('SELECT model, outcome, input_tokens, output_tokens FROM ai_calls ORDER BY id').all(),
    ).toEqual([
      { model: 'claude-test-1', outcome: 'ok', input_tokens: 90, output_tokens: 0 },
      { model: 'claude-test-0', outcome: 'fallback', input_tokens: 95, output_tokens: 12 },
    ])
    await client.read(feature, { image: IMAGE })
    // The second read's own fallback run lands after the cap: it is counted, and the next is refused.
    expect(store.repo.aiUsage(T0)).toEqual({ today: 4, month: 4 })
    expect(await code(client.read(feature, { image: IMAGE }))).toBe('daily_cap')
  })
})

describe('answers that are not used', () => {
  it('checks the stop reason before the content: a refusal or a cut-off answer is never read', async () => {
    const refused = setup({ answer: { stop: 'refusal', text: '{"colour":"never read"}' } })
    expect(await code(refused.client.read(feature, { image: IMAGE }))).toBe('refused')
    for (const stop of ['max_tokens', 'other'] as const) {
      const cut = setup({ answer: { stop, text: '{"colour":"never read"}' } })
      expect(await code(cut.client.read(feature, { image: IMAGE }))).toBe('cut_off')
      expect(cut.store.db.prepare('SELECT outcome FROM ai_calls').all()).toEqual([{ outcome: 'cut_off' }])
    }
  })

  it('refuses an answer that does not fit the schema or is not JSON', async () => {
    for (const text of ['{"color":"brindle"}', '{"colour":7}', 'brindle', '']) {
      const { client, store } = setup({ answer: { text } })
      expect(await code(client.read(feature, { image: IMAGE }))).toBe('invalid_answer')
      expect(store.repo.aiUsage(T0)).toEqual({ today: 1, month: 1 })
    }
  })

  it('answers a failed request with api_error, and does not send it again', async () => {
    const { client, fake, lines } = setup({
      answer: () => {
        throw new AiTransportError('status', 529)
      },
    })
    expect(await code(client.read(feature, { image: IMAGE }))).toBe('api_error')
    expect(fake.sent).toHaveLength(1)
    expect(lines).toEqual([
      'ai: call id=1 feature=test-feature model=claude-test-1 outcome=api_error in=0 out=0 fallbacks=0 ms=0 kind=status status=529',
    ])
  })
})

describe('the log', () => {
  it('holds no key, request, answer or error text, whatever happens', async () => {
    const secretAnswer = 'ANSWER-MARKER'
    const outcomes: Parameters<typeof createFakeTransport>[0][] = [
      { text: `{"colour":"${secretAnswer}"}` },
      { text: secretAnswer },
      { stop: 'refusal', text: secretAnswer },
      () => {
        throw new Error(`ERROR-MARKER the request was ${feature.instruction}`)
      },
      () => {
        throw new AiTransportError('status', 400)
      },
    ]
    const all: string[] = []
    for (const answer of outcomes) {
      const { client, lines } = setup({ answer })
      await code(client.read(feature, { image: IMAGE }))
      all.push(...lines)
    }
    for (const key of [{ ok: false, reason: 'cant_decrypt' } as const]) {
      const { client, lines } = setup({ key })
      await code(client.read(feature, { image: IMAGE }))
      all.push(...lines)
    }
    expect(all).toHaveLength(6)
    const text = all.join('\n')
    for (const marker of [
      DUMMY_KEY,
      'sk-ant',
      'INSTRUCTION-MARKER',
      'ANSWER-MARKER',
      'ERROR-MARKER',
      'AQID',
      '1,2,3',
    ]) {
      expect(text).not.toContain(marker)
    }
    // Every line is ids, counts, codes and timings.
    for (const line of all) expect(line).toMatch(/^ai: (call|refused) [a-z0-9=_. -]+$/i)
  })
})

describe('the fake client', () => {
  it('has the capped client’s interface: it checks the answer and can fail with any code', async () => {
    const ok = createFakeAiClient({ answer: { colour: 'merle' } })
    expect(await ok.read(feature, { image: IMAGE })).toEqual({ colour: 'merle' })
    expect(ok.reads).toEqual([{ feature: 'test-feature', image: IMAGE }])
    expect(await code(createFakeAiClient({ answer: { colour: 7 } }).read(feature, { image: IMAGE }))).toBe(
      'invalid_answer',
    )
    expect(await code(createFakeAiClient({ fail: 'daily_cap' }).read(feature, { image: IMAGE }))).toBe('daily_cap')
    expect(createFakeAiClient({ status: { enabled: false } }).status().enabled).toBe(false)
  })
})
