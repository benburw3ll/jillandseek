// `pnpm sources:check`: validates every registry entry and exits 1 on any problem.
import { checkRegistry, collectorIds, registryEntries } from '../src/index.ts'

const problems = checkRegistry(registryEntries, collectorIds)
for (const p of problems) console.error(`sources:check: ${p.id}: ${p.problem}`)
if (problems.length > 0) {
  console.error(`sources:check: ${problems.length} problem(s)`)
  process.exit(1)
}
console.log(`sources:check: ${registryEntries.length} sources ok`)
