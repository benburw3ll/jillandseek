// Every test file loads this first (the root vitest.config.ts): no test reaches the internet
// (ADR-0002, AGENTS.md hard rule 6). A connection to anything but this computer's loopback address
// is refused, and the test that tried it fails even if its code swallowed the error. A test
// against a local fake server (127.0.0.1) is still allowed.
import dns from 'node:dns'
import net from 'node:net'
import { afterEach, expect } from 'vitest'

type Attempts = { list: string[] }
const KEY = Symbol.for('jillandseek.networkAttempts')
const store = globalThis as unknown as Record<symbol, Attempts | undefined>
const attempts: Attempts = store[KEY] ?? { list: [] }
store[KEY] = attempts

const LOOPBACK = new Set(['127.0.0.1', '::1', 'localhost'])
const isLoopback = (host: unknown) => typeof host === 'string' && (LOOPBACK.has(host) || host.startsWith('127.'))

/** The outside connections tried since the last call, cleared. For the test of this file only. */
export function takeNetworkAttempts(): string[] {
  return attempts.list.splice(0)
}

function refuse(target: string): Error {
  attempts.list.push(target)
  return new Error(`no-network: a test tried to reach ${target}`)
}

const patched = Symbol.for('jillandseek.networkPatched')
const marks = net.Socket.prototype as unknown as Record<symbol, boolean>
if (!marks[patched]) {
  marks[patched] = true
  const connect = net.Socket.prototype.connect
  // biome-ignore lint/suspicious/noExplicitAny: connect has many overloads; only the target is read.
  net.Socket.prototype.connect = function (this: net.Socket, ...args: any[]) {
    const first = args[0]
    const options = Array.isArray(first) ? first[0] : first
    let host: unknown
    if (typeof options === 'object' && options !== null) {
      host = 'path' in options && options.path !== undefined ? 'localhost' : (options.host ?? 'localhost')
    } else if (typeof options === 'number' || /^\d+$/.test(String(options))) {
      host = typeof args[1] === 'string' ? args[1] : 'localhost'
    } else {
      host = 'localhost' // a pipe or socket path
    }
    if (!isLoopback(host)) throw refuse(String(host))
    return connect.apply(this, args as Parameters<typeof connect>)
  } as typeof connect

  const lookup = dns.lookup
  // biome-ignore lint/suspicious/noExplicitAny: lookup's overloads.
  dns.lookup = ((hostname: string, ...rest: any[]) => {
    if (!isLoopback(hostname)) {
      const callback = rest.at(-1)
      const error = refuse(hostname)
      if (typeof callback === 'function') {
        process.nextTick(() => callback(error))
        return
      }
      throw error
    }
    return (lookup as (...a: unknown[]) => unknown)(hostname, ...rest)
  }) as typeof dns.lookup
  const lookupPromise = dns.promises.lookup
  dns.promises.lookup = (async (hostname: string, ...rest: unknown[]) => {
    if (!isLoopback(hostname)) throw refuse(hostname)
    return (lookupPromise as (...a: unknown[]) => unknown)(hostname, ...rest)
  }) as typeof dns.promises.lookup
}

afterEach(() => {
  const tried = takeNetworkAttempts()
  expect(tried, 'a test tried to open a network connection off this computer').toEqual([])
})
