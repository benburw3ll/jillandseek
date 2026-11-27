import { createServer } from 'node:http'
import { describe, expect, it } from 'vitest'
import { takeNetworkAttempts } from './no-network.ts'

// The test setup itself: an outside connection fails, a loopback one works.

describe('the no-network test setup', () => {
  it('refuses a connection to a host off this computer, and records it so the test fails', async () => {
    await expect(fetch('https://zorbulon.example.com/')).rejects.toThrow()
    // The setup's afterEach would fail this test on the attempt; take it so this one passes.
    expect(takeNetworkAttempts().length).toBeGreaterThan(0)
  })

  it('allows a local fake server on 127.0.0.1', async () => {
    const server = createServer((_req, res) => res.end('ok'))
    await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
    const address = server.address()
    const port = typeof address === 'object' && address ? address.port : 0
    try {
      expect(await (await fetch(`http://127.0.0.1:${port}/`)).text()).toBe('ok')
    } finally {
      server.close()
    }
  })
})
