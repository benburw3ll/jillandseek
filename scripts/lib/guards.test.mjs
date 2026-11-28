import { describe, expect, it } from 'vitest'
import { checkCommitMessage, checkPushRefs, forbiddenPaths, scanAddedLines } from './guards.mjs'

describe('forbiddenPaths', () => {
  it('refuses files under data/, secrets/ and .env files', () => {
    const refused = forbiddenPaths(['data/zorbulon.db', 'secrets/x.txt', '.env', 'apps/server/.env.local'])
    expect(refused).toHaveLength(4)
  })

  it('refuses a saved API key file, wherever it is', () => {
    expect(forbiddenPaths(['claude-api-key.dpapi', 'apps/server/key.DPAPI'])).toHaveLength(2)
  })

  it('lets ordinary files and .env.example through', () => {
    expect(forbiddenPaths(['apps/server/src/app.ts', '.env.example', 'docs/data/notes.md'])).toEqual([])
  })
})

describe('scanAddedLines', () => {
  // Built from parts at run time, so no secret-shaped value sits in this file's text.
  const shaped = ['gh', 'p_', 'Z'.repeat(36)].join('')

  it('finds a secret-shaped string on an added line, without repeating it', () => {
    const diff = ['+++ b/apps/x.ts', '@@ -0,0 +1,2 @@', '+const a = 1', `+const b = '${shaped}'`].join('\n')
    const findings = scanAddedLines(diff)
    expect(findings.map((f) => [f.file, f.line])).toEqual([['apps/x.ts', 2]])
    expect(JSON.stringify(findings)).not.toContain(shaped)
  })

  it('ignores removed lines', () => {
    const diff = ['+++ b/apps/x.ts', '@@ -1,1 +0,0 @@', `-const b = '${shaped}'`].join('\n')
    expect(scanAddedLines(diff)).toEqual([])
  })
})

describe('checkCommitMessage', () => {
  it('accepts a Conventional Commits header', () => {
    expect(checkCommitMessage('feat(server): the health route\n\nRefs #10\n')).toBeNull()
  })

  it('refuses a header that is not one, or is too long', () => {
    expect(checkCommitMessage('added stuff')).toContain('not a Conventional Commits header')
    expect(checkCommitMessage(`fix: ${'z'.repeat(100)}`)).toContain('keep it to 100')
  })
})

describe('checkPushRefs', () => {
  it('refuses a push to main and allows a branch', () => {
    const sha = 'a'.repeat(40)
    expect(checkPushRefs(`refs/heads/main ${sha} refs/heads/main ${sha}\n`)).toContain('blocked')
    expect(checkPushRefs(`refs/heads/feat/x ${sha} refs/heads/feat/x ${sha}\n`)).toBeNull()
  })
})
