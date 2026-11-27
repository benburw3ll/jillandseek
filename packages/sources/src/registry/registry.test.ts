import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import type { SourceEntryInput } from '@jillandseek/core'
import { describe, expect, it } from 'vitest'
import { checkRegistry, collectorIds, registryEntries } from '../index.ts'

// All entries below are made up, except the real registry's own check.

const automatic: SourceEntryInput = {
  id: 'zorbulon-pound',
  name: 'Zorbulon Pound',
  url: 'https://pound.example.com/strays',
  region: 'Zorbulon County',
  listingKinds: ['shelter-stray'],
  access: 'automatic',
  collector: 'zorbulon-strays',
  checkedOn: '2026-01-10',
  checkNote: 'No robots file; terms allow personal use.',
}

describe('the registry', () => {
  it('validates, with at least 15 sources and each one an access kind', () => {
    expect(checkRegistry(registryEntries, collectorIds)).toEqual([])
    expect(registryEntries.length).toBeGreaterThanOrEqual(15)
    for (const e of registryEntries) expect(['automatic', 'capture', 'link']).toContain(e.access)
  })

  it('passes a fully checked automatic entry', () => {
    expect(checkRegistry([automatic], ['zorbulon-strays'])).toEqual([])
  })

  it('fails an automatic entry with no check date, no check note or no collector', () => {
    expect(checkRegistry([{ ...automatic, checkedOn: null }], ['zorbulon-strays'])).toEqual([
      { id: 'zorbulon-pound', problem: 'an automatic source needs checkedOn' },
    ])
    expect(checkRegistry([{ ...automatic, checkNote: null }], ['zorbulon-strays'])).toEqual([
      { id: 'zorbulon-pound', problem: 'an automatic source needs checkNote' },
    ])
    expect(checkRegistry([{ ...automatic, collector: 'quux' }], ['zorbulon-strays'])[0]?.problem).toContain(
      'does not exist',
    )
    expect(checkRegistry([{ ...automatic, collector: null }], ['zorbulon-strays']).length).toBeGreaterThan(0)
  })

  it('fails a repeated id and a malformed entry', () => {
    const link = { ...automatic, access: 'link' as const, collector: null }
    expect(checkRegistry([link, link], [])).toEqual([{ id: 'zorbulon-pound', problem: 'the id is listed twice' }])
    expect(checkRegistry([{ ...link, url: 'not a url' }], []).length).toBeGreaterThan(0)
  })

  it('runs as `pnpm sources:check` and passes on the real registry', () => {
    const script = join(import.meta.dirname, '..', '..', 'scripts', 'sources-check.ts')
    const run = spawnSync(process.execPath, [script], { encoding: 'utf8' })
    expect(run.status).toBe(0)
    expect(run.stdout).toContain('sources ok')
  })
})
