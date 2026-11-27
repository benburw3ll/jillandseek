import { registryEntries } from '@jillandseek/sources'
import { describe, expect, it } from 'vitest'
import { syncRegistry } from './registry.ts'
import { tempStore } from './testStore.ts'

describe('syncRegistry', () => {
  it('writes every registry entry into the sources table, and a second run adds nothing', () => {
    const store = tempStore()
    const lines: string[] = []
    expect(syncRegistry(store.repo, (l) => lines.push(l))).toEqual({
      added: registryEntries.length,
      updated: 0,
      retired: 0,
    })
    expect(
      store.repo
        .listSources()
        .map((s) => s.id)
        .sort(),
    ).toEqual(registryEntries.map((e) => e.id).sort())
    expect(syncRegistry(store.repo, () => {}).added).toBe(0)
    expect(lines).toEqual([`registry: synced added=${registryEntries.length} updated=0 retired=0`])
  })
})
