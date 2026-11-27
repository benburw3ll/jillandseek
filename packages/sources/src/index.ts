// The source registry, the collectors and their one fetcher.
export const packageName = '@jillandseek/sources'

export { checkRegistry, type RegistryProblem } from './registry/check.ts'
export { registryEntries } from './registry/entries.ts'

/** The ids of the collectors that exist. */
export const collectorIds: readonly string[] = []
