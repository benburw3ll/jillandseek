import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { REPO_ROOT } from '../settings.ts'
import { AiTransportError } from './client.ts'
import { API_URL, createSdkTransport } from './sdk.ts'

// The SDK edge, with the SDK's own `fetch` replaced: these tests see the exact request the app
// would send and answer it themselves. Nothing leaves the computer, and the key is a dummy.

const DUMMY_KEY = ['sk', 'ant', 'test', 'k'.repeat(24)].join('-')
const OTHER_KEY = ['sk', 'ant', 'other', 'z'.repeat(24)].join('-')
const Colour = z.object({ colour: z.string() })
const REQUEST = {
  model: 'claude-test-1',
  instruction: 'Say the colour.',
  image: { mediaType: 'image/png', bytes: new Uint8Array([1, 2, 3]) },
  schema: Colour,
  maxTokens: 1234,
} as const

type Seen = { url: string; method: string; headers: Headers; body: unknown }

function fakeApi(answer: (seen: Seen) => { status?: number; body: unknown }) {
  const seen: Seen[] = []
  const fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const one: Seen = {
      url: String(input instanceof Request ? input.url : input),
      method: init?.method ?? 'GET',
      headers: new Headers(init?.headers),
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    }
    seen.push(one)
    const { status = 200, body } = answer(one)
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
  }
  return { seen, fetch }
}

const usage = (input: number, output: number) => ({
  input_tokens: input,
  output_tokens: output,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: 0,
})
const message = (over: Record<string, unknown> = {}) => ({
  id: 'msg_made_up',
  type: 'message',
  role: 'assistant',
  model: 'claude-test-1',
  content: [{ type: 'text', text: '{"colour":"brindle"}' }],
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: usage(1500, 40),
  ...over,
})

afterEach(() => vi.unstubAllEnvs())

describe('the request', () => {
  it('goes to the API’s own address with the given key, and is shaped as the current models need', async () => {
    const api = fakeApi(() => ({ body: message() }))
    const answer = await createSdkTransport({ apiKey: DUMMY_KEY, fetch: api.fetch }).send(REQUEST)
    expect(answer).toEqual({
      stop: 'end',
      text: '{"colour":"brindle"}',
      attempts: [{ model: 'claude-test-1', inputTokens: 1500, outputTokens: 40 }],
    })
    expect(api.seen).toHaveLength(1)
    const [sent] = api.seen
    expect(sent?.url.startsWith(`${API_URL}/v1/messages`)).toBe(true)
    expect(sent?.method).toBe('POST')
    expect(sent?.headers.get('authorization')).toBe(`Bearer ${DUMMY_KEY}`)
    expect(sent?.headers.get('x-api-key')).toBeNull()
    expect(sent?.headers.get('anthropic-beta')).toContain('server-side-fallback-2026-07-01')

    const body = sent?.body as Record<string, unknown>
    // Nothing the current models refuse: no thinking, sampling or forced tool choice, and no tools.
    expect(Object.keys(body).sort()).toEqual(['fallbacks', 'max_tokens', 'messages', 'model', 'output_config'])
    expect(body).toMatchObject({ model: 'claude-test-1', max_tokens: 1234, fallbacks: 'default' })
    expect(body.output_config).toMatchObject({ effort: 'low', format: { type: 'json_schema' } })
    // Only the photo and the fixed instruction are in the request.
    expect(body.messages).toEqual([
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AQID' } },
          { type: 'text', text: 'Say the colour.' },
        ],
      },
    ])
  })

  it('uses no credential or address from the environment', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', OTHER_KEY)
    vi.stubEnv('ANTHROPIC_AUTH_TOKEN', 'made-up-login-token')
    vi.stubEnv('ANTHROPIC_BASE_URL', 'http://127.0.0.1:9/elsewhere')
    vi.stubEnv(
      'ANTHROPIC_CUSTOM_HEADERS',
      ['authorization: Bearer made-up-login-token', `x-api-key: ${OTHER_KEY}`].join('\n'),
    )
    vi.stubEnv('ANTHROPIC_LOG', 'debug')
    const logged = vi.spyOn(console, 'log').mockImplementation(() => {})
    const debugged = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const api = fakeApi(() => ({ body: message() }))
    await createSdkTransport({ apiKey: DUMMY_KEY, fetch: api.fetch }).send(REQUEST)
    const [sent] = api.seen
    expect(new URL(sent?.url ?? '').origin).toBe(API_URL)
    expect(sent?.headers.get('authorization')).toBe(`Bearer ${DUMMY_KEY}`)
    expect(sent?.headers.get('x-api-key')).toBeNull()
    const allHeaders = JSON.stringify([...(sent?.headers ?? [])])
    expect(allHeaders).not.toContain('made-up-login-token')
    expect(allHeaders).not.toContain(OTHER_KEY)
    // The SDK's own debug log, which would print the request, stays off whatever the environment says.
    expect(logged).not.toHaveBeenCalled()
    expect(debugged).not.toHaveBeenCalled()
    logged.mockRestore()
    debugged.mockRestore()
  })

  it('is sent once: a failed request is never retried, and its message is dropped', async () => {
    for (const status of [429, 500, 529]) {
      const api = fakeApi(() => ({
        status,
        body: { type: 'error', error: { type: 'api_error', message: 'ERROR-MARKER with the request in it' } },
      }))
      const error = await createSdkTransport({ apiKey: DUMMY_KEY, fetch: api.fetch })
        .send(REQUEST)
        .catch((e: unknown) => e)
      expect(api.seen).toHaveLength(1)
      expect(error).toBeInstanceOf(AiTransportError)
      expect(error).toMatchObject({ kind: 'status', status })
      expect(String((error as Error).message)).not.toContain('ERROR-MARKER')
    }
  })

  it('reports a dropped connection as a kind, not a message', async () => {
    const fetch = async (): Promise<Response> => {
      throw new TypeError('fetch failed: ERROR-MARKER')
    }
    const error = await createSdkTransport({ apiKey: DUMMY_KEY, fetch })
      .send(REQUEST)
      .catch((e: unknown) => e)
    expect(error).toMatchObject({ kind: 'connection', status: null })
    expect(String((error as Error).message)).not.toContain('ERROR-MARKER')
  })
})

describe('the answer', () => {
  it('reads no content from a refusal or a cut-off answer', async () => {
    for (const [stop_reason, stop] of [
      ['refusal', 'refusal'],
      ['max_tokens', 'max_tokens'],
      ['pause_turn', 'other'],
    ] as const) {
      const api = fakeApi(() => ({ body: message({ stop_reason }) }))
      const answer = await createSdkTransport({ apiKey: DUMMY_KEY, fetch: api.fetch }).send(REQUEST)
      expect(answer).toMatchObject({ stop, text: '' })
    }
  })

  it('reports every run when the API ran a fallback model, so each can be counted', async () => {
    const api = fakeApi(() => ({
      body: message({
        model: 'claude-test-0',
        content: [
          { type: 'fallback', from: { model: 'claude-test-1' }, to: { model: 'claude-test-0' } },
          { type: 'text', text: '{"colour":"fawn"}' },
        ],
        usage: {
          ...usage(1510, 44),
          iterations: [
            { type: 'message', model: 'claude-test-1', ...usage(1500, 0), cache_creation: null },
            { type: 'fallback_message', model: 'claude-test-0', ...usage(1510, 44), cache_creation: null },
          ],
        },
      }),
    }))
    const answer = await createSdkTransport({ apiKey: DUMMY_KEY, fetch: api.fetch }).send(REQUEST)
    expect(answer).toEqual({
      stop: 'end',
      text: '{"colour":"fawn"}',
      attempts: [
        { model: 'claude-test-1', inputTokens: 1500, outputTokens: 0 },
        { model: 'claude-test-0', inputTokens: 1510, outputTokens: 44 },
      ],
    })
  })
})

describe('listing the models', () => {
  it('asks only for the list, and returns the ids', async () => {
    const api = fakeApi(() => ({
      body: {
        data: [
          { type: 'model', id: 'claude-test-1', display_name: 'Test 1', created_at: '2026-01-01T00:00:00Z' },
          { type: 'model', id: 'claude-test-0', display_name: 'Test 0', created_at: '2026-01-01T00:00:00Z' },
        ],
        has_more: false,
        first_id: 'claude-test-1',
        last_id: 'claude-test-0',
      },
    }))
    expect(await createSdkTransport({ apiKey: DUMMY_KEY, fetch: api.fetch }).listModels()).toEqual([
      'claude-test-1',
      'claude-test-0',
    ])
    expect(api.seen).toHaveLength(1)
    expect(api.seen[0]?.method).toBe('GET')
    expect(api.seen[0]?.url.startsWith(`${API_URL}/v1/models`)).toBe(true)
    expect(api.seen[0]?.body).toBeUndefined()
  })

  it('reports a refused key as status 401', async () => {
    const api = fakeApi(() => ({
      status: 401,
      body: { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } },
    }))
    const error = await createSdkTransport({ apiKey: DUMMY_KEY, fetch: api.fetch })
      .listModels()
      .catch((e: unknown) => e)
    expect(error).toMatchObject({ kind: 'status', status: 401 })
  })
})

describe('where the SDK may be imported', () => {
  const SDK = '@anthropic-ai/sdk'
  const SKIP = new Set(['node_modules', 'dist', '.git', '.claude', 'data', '.dev-home', 'coverage'])
  const sources = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      if (SKIP.has(entry.name)) return []
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return sources(path)
      return /\.(ts|tsx|mts|js|mjs|cjs)$/.test(entry.name) ? [path] : []
    })

  it('is apps/server/src/ai/sdk.ts and nowhere else in the repo', () => {
    const importers = ['apps', 'packages', 'scripts', 'test']
      .flatMap((top) => sources(join(REPO_ROOT, top)))
      .filter((file) => !file.endsWith('.test.ts') && readFileSync(file, 'utf8').includes(SDK))
      .map((file) => relative(REPO_ROOT, file).split(sep).join('/'))
    expect(importers).toEqual(['apps/server/src/ai/sdk.ts'])
  })

  it('is a dependency of apps/server alone', () => {
    const manifests = [
      'package.json',
      'apps/web/package.json',
      'packages/core/package.json',
      'packages/sources/package.json',
    ]
    for (const manifest of manifests) expect(readFileSync(join(REPO_ROOT, manifest), 'utf8')).not.toContain(SDK)
    expect(readFileSync(join(REPO_ROOT, 'apps/server/package.json'), 'utf8')).toContain(SDK)
  })
})
