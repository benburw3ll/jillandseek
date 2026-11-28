import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { join } from 'node:path'

// The key reader (ADR-0007 point 5). The key is saved by scripts/save-api-key.ps1, encrypted to
// the owner's Windows account, in a file under the user's profile. It is decrypted into memory
// for the client only: it is never logged, printed, written anywhere or put in the environment.

export type KeyProblem = 'no_key' | 'cant_decrypt' | 'bad_shape'
export type KeyResult = { ok: true; key: string } | { ok: false; reason: KeyProblem }

/**
 * Whether a string is shaped like a key this app may use. A Console key starts `sk-ant-` (the
 * Console issues more than one kind, so the kind is not checked). An Admin key manages the whole
 * organization and a login token belongs to a signed-in person: neither is ever used here.
 */
export function keyShape(key: string): 'ok' | 'not_a_key' | 'admin_key' | 'login_token' {
  if (!/^sk-ant-[A-Za-z0-9_-]{16,400}$/.test(key)) return 'not_a_key'
  if (key.startsWith('sk-ant-admin')) return 'admin_key'
  if (key.startsWith('sk-ant-oat')) return 'login_token'
  return 'ok'
}

/** Turns the saved file into the key, or throws. Injected in tests. */
export type Decrypt = (file: string) => string

const READ_SCRIPT = join(import.meta.dirname, 'read-key.ps1')

/**
 * Windows only: asks PowerShell to decrypt the file with the signed-in account (DPAPI). The key
 * comes back over a pipe to this process alone. The script refuses to write to a console.
 */
export const decryptWithWindows: Decrypt = (file) => {
  if (process.platform !== 'win32') throw new Error('the key file can only be decrypted on Windows')
  return execFileSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', READ_SCRIPT, '-Path', file],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20_000, windowsHide: true },
  )
}

/**
 * A reader for one key file. It decrypts once and keeps the key in memory until the file changes,
 * so replacing the key takes effect on the next call without a restart.
 */
export function createKeyReader(options: { file: string; decrypt?: Decrypt }): () => KeyResult {
  const decrypt = options.decrypt ?? decryptWithWindows
  let cached: { stamp: string; result: KeyResult } | null = null
  return () => {
    let stamp: string
    try {
      const stat = statSync(options.file)
      if (!stat.isFile()) return { ok: false, reason: 'no_key' }
      stamp = `${stat.mtimeMs}:${stat.size}`
    } catch {
      cached = null
      return { ok: false, reason: 'no_key' }
    }
    if (cached?.stamp === stamp) return cached.result
    let result: KeyResult
    try {
      const key = decrypt(options.file).trim()
      result = keyShape(key) === 'ok' ? { ok: true, key } : { ok: false, reason: 'bad_shape' }
    } catch {
      result = { ok: false, reason: 'cant_decrypt' }
    }
    // A failed decrypt is not remembered: it may be PowerShell starting slowly, and the next read
    // tries again. A decrypted key, usable or not, stays the same until the file changes.
    cached = result.ok || result.reason === 'bad_shape' ? { stamp, result } : null
    return result
  }
}
