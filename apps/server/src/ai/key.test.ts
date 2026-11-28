import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { REPO_ROOT } from '../settings.ts'
import { checkKey } from './check.ts'
import { AiTransportError } from './client.ts'
import { createFakeTransport } from './fake.ts'
import { createKeyReader, type Decrypt, keyShape } from './key.ts'

// Dummy keys only, built from parts so no key-shaped string sits in the repo. The dummy file's
// "encryption" is the text reversed: real decryption is Windows' own and is tried in one test
// that runs on Windows alone.

const dummy = (kind: string) => ['sk', 'ant', kind, 'x'.repeat(24)].join('-')
const reverse = (s: string) => [...s].reverse().join('')
const readText = (file: string) => readFileSync(file, 'utf8')
const fakeDecrypt: Decrypt = (file) => {
  const text = readText(file)
  if (!text.startsWith('rev:')) throw new Error('not decryptable')
  return reverse(text.slice(4))
}
const cleanups: (() => void)[] = []
afterEach(() => {
  for (const c of cleanups.splice(0).reverse()) c()
})

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'jill-key-'))
  cleanups.push(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

function keyFile(content: string | null): string {
  const file = join(tempDir(), 'key.dummy')
  if (content !== null) writeFileSync(file, content)
  return file
}

describe('the key’s shape', () => {
  it('takes a key that starts sk-ant-, whatever kind the Console issued', () => {
    expect(keyShape(dummy('api03'))).toBe('ok')
    expect(keyShape(dummy('usr'))).toBe('ok')
  })

  it('refuses an Admin key and a login token', () => {
    expect(keyShape(dummy('admin01'))).toBe('admin_key')
    expect(keyShape(dummy('oat01'))).toBe('login_token')
  })

  it('refuses anything else', () => {
    for (const not of [
      '',
      'sk-ant-',
      'sk-ant-short',
      `sk-${'x'.repeat(40)}`,
      `${dummy('api03')} extra`,
      `x${dummy('api03')}`,
    ]) {
      expect(keyShape(not)).toBe('not_a_key')
    }
  })
})

describe('the key reader', () => {
  it('says no_key when no file is saved', () => {
    expect(createKeyReader({ file: keyFile(null), decrypt: fakeDecrypt })()).toEqual({ ok: false, reason: 'no_key' })
  })

  it('says cant_decrypt when the file can’t be decrypted', () => {
    expect(createKeyReader({ file: keyFile('garbage'), decrypt: fakeDecrypt })()).toEqual({
      ok: false,
      reason: 'cant_decrypt',
    })
  })

  it('refuses a saved Admin key or login token, and takes a sk-ant-usr- key', () => {
    const read = (key: string) => createKeyReader({ file: keyFile(`rev:${reverse(key)}`), decrypt: fakeDecrypt })()
    expect(read(dummy('admin01'))).toEqual({ ok: false, reason: 'bad_shape' })
    expect(read(dummy('oat01'))).toEqual({ ok: false, reason: 'bad_shape' })
    expect(read(dummy('usr'))).toEqual({ ok: true, key: dummy('usr') })
  })

  it('decrypts once, and again only when the file changes', () => {
    const file = keyFile(`rev:${reverse(dummy('api03'))}`)
    let decrypts = 0
    const read = createKeyReader({
      file,
      decrypt: (f) => {
        decrypts++
        return fakeDecrypt(f)
      },
    })
    expect(read()).toEqual({ ok: true, key: dummy('api03') })
    expect(read()).toEqual({ ok: true, key: dummy('api03') })
    expect(decrypts).toBe(1)
    writeFileSync(file, `rev:${reverse(dummy('usr'))}`)
    utimesSync(file, new Date(), new Date(Date.now() + 5000))
    expect(read()).toEqual({ ok: true, key: dummy('usr') })
    expect(decrypts).toBe(2)
  })
})

describe('pnpm ai:check', () => {
  const works = (models = ['claude-opus-5-5', 'claude-haiku-5-5']) => createFakeTransport({}, models).transport
  const failing = (error: Error) => () => ({
    send: async () => {
      throw error
    },
    listModels: async () => {
      throw error
    },
  })
  const saved = () => ({ ok: true, key: dummy('api03') }) as const

  it('says works, no key saved, can’t be decrypted, or refused by Anthropic', async () => {
    const model = 'claude-opus-5-5'
    expect((await checkKey({ readKey: saved, transport: works(), model })).code).toBe('works')
    expect((await checkKey({ readKey: saved, transport: works(), model })).line).toContain('ai:check: works.')
    const none = await checkKey({ readKey: () => ({ ok: false, reason: 'no_key' }), transport: works(), model })
    expect(none).toMatchObject({ code: 'no_key' })
    expect(none.line).toContain('no key saved')
    const locked = await checkKey({ readKey: () => ({ ok: false, reason: 'cant_decrypt' }), transport: works(), model })
    expect(locked.line).toContain("can't be decrypted")
    const refused = await checkKey({ readKey: saved, transport: failing(new AiTransportError('status', 401)), model })
    expect(refused).toMatchObject({ code: 'refused' })
    expect(refused.line).toContain('refused by Anthropic')
    expect(
      (await checkKey({ readKey: saved, transport: failing(new AiTransportError('connection')), model })).code,
    ).toBe('unreachable')
    expect(
      (await checkKey({ readKey: saved, transport: failing(new AiTransportError('status', 529)), model })).code,
    ).toBe('api_error')
  })

  it('says when the model the app is set to use is not in the list', async () => {
    const result = await checkKey({ readKey: saved, transport: works(['claude-haiku-5-5']), model: 'claude-opus-5-5' })
    expect(result.code).toBe('works')
    expect(result.line).toContain('JILL_AI_MODEL')
  })

  it('prints no part of the key, whatever the outcome', async () => {
    const key = dummy('api03')
    const model = 'claude-opus-5-5'
    const lines = [
      await checkKey({ readKey: saved, transport: works(), model }),
      await checkKey({ readKey: saved, transport: failing(new AiTransportError('status', 401)), model }),
      await checkKey({ readKey: saved, transport: failing(new Error(`boom ${key}`)), model }),
      await checkKey({ readKey: () => ({ ok: false, reason: 'bad_shape' }), transport: works(), model }),
    ].map((r) => r.line)
    for (const line of lines) {
      expect(line).not.toContain(key)
      expect(line).not.toContain('sk-ant')
      // Not even a few characters from either end.
      expect(line).not.toContain(key.slice(0, 10))
      expect(line).not.toContain(key.slice(-6))
    }
  })
})

// Windows' own encryption, end to end: the save script stores a dummy key, the reader decrypts
// it, and the decrypt script refuses to print to a console. Skipped where there is no DPAPI (CI).
describe.skipIf(process.platform !== 'win32')('on Windows', () => {
  const powershell = (args: string[], options: { input?: string; env?: Record<string, string> } = {}) =>
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', ...args], {
      encoding: 'utf8',
      input: options.input ?? '',
      env: { ...process.env, ...options.env },
      timeout: 60_000,
    })
  const saveScript = join(REPO_ROOT, 'scripts', 'save-api-key.ps1')

  it('saves a key encrypted, prints no part of it, and the reader gets it back', () => {
    const file = join(tempDir(), 'nested', 'key.dpapi')
    const key = dummy('api03')
    const out = powershell(['-File', saveScript, '-Prompt', '-NoCheck'], {
      input: `${key}\n`,
      env: { JILL_AI_KEY_FILE: file },
    })
    expect(out).toContain('saved')
    expect(out).not.toContain('sk-ant')
    expect(out).not.toContain(key.slice(-6))
    expect(readText(file)).not.toContain(key)
    expect(readText(file)).not.toContain('sk-ant')
    expect(createKeyReader({ file })()).toEqual({ ok: true, key })
  }, 90_000)

  it('refuses to save an Admin key, a login token or something that is not a key', () => {
    for (const bad of [dummy('admin01'), dummy('oat01'), 'not a key']) {
      const file = join(tempDir(), 'key.dpapi')
      let status = 0
      try {
        powershell(['-File', saveScript, '-Prompt', '-NoCheck'], { input: `${bad}\n`, env: { JILL_AI_KEY_FILE: file } })
      } catch (error) {
        status = (error as { status?: number }).status ?? -1
      }
      expect(status).toBe(1)
      expect(createKeyReader({ file })()).toEqual({ ok: false, reason: 'no_key' })
    }
  }, 90_000)

  it('says cant_decrypt for a file this account did not encrypt', () => {
    expect(createKeyReader({ file: keyFile('0100000000000000') })()).toEqual({ ok: false, reason: 'cant_decrypt' })
  }, 60_000)
})
