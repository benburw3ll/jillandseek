import { SourceEntry, type SourceEntryInput } from '@jillandseek/core'

// `pnpm sources:check` (ADR-0002 point 2): every entry fits the schema, ids are unique, and an
// automatic entry carries its robots and terms check and names a collector that exists.

export type RegistryProblem = { id: string; problem: string }

/**
 * Checks the registry. `collectorIds` lists the collectors that exist; an automatic entry must
 * name one of them. Returns every problem found, or an empty list.
 */
export function checkRegistry(entries: SourceEntryInput[], collectorIds: readonly string[]): RegistryProblem[] {
  const problems: RegistryProblem[] = []
  const seen = new Set<string>()
  for (const [index, input] of entries.entries()) {
    const id = typeof input.id === 'string' ? input.id : `#${index}`
    if (seen.has(id)) problems.push({ id, problem: 'the id is listed twice' })
    seen.add(id)
    const parsed = SourceEntry.safeParse(input)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        problems.push({ id, problem: `${issue.path.join('.') || 'entry'}: ${issue.message}` })
      }
      continue
    }
    const e = parsed.data
    if (e.access !== 'automatic') continue
    if (e.checkedOn === null) problems.push({ id, problem: 'an automatic source needs checkedOn' })
    if (e.checkNote === null || e.checkNote.trim() === '') {
      problems.push({ id, problem: 'an automatic source needs checkNote' })
    }
    if (e.collector === null) problems.push({ id, problem: 'an automatic source needs a collector' })
    else if (!collectorIds.includes(e.collector)) {
      problems.push({ id, problem: `the collector ${e.collector} does not exist` })
    }
    if (!e.url.startsWith('https://')) problems.push({ id, problem: 'an automatic source is read over https only' })
  }
  return problems
}
