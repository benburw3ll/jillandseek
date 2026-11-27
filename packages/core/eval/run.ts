// pnpm eval:match [--json] [--seed <n>] [--dogs <n>]
//
// Generates the synthetic set from a seed, runs the matcher over it and prints recall at 5,
// recall at 20 and the median rank of the true listings. `--json` prints the same figures as
// JSON (baseline.json is that output for the defaults). Nothing is stored and nothing is sent.
import { DEFAULTS } from './defaults.ts'
import { generateSet } from './generate.ts'
import { measure, newestFirst } from './measure.ts'

// packages/core has no Node types (it is pure); this script is the one place that needs these two.
declare const process: { argv: string[]; stdout: { write(text: string): void } }

const args = process.argv.slice(2)
const value = (name: string, fallback: number) => {
  const i = args.indexOf(name)
  if (i < 0) return fallback
  const n = Number(args[i + 1])
  if (!Number.isInteger(n) || n < 1) throw new Error(`${name} takes a whole number`)
  return n
}

const set = generateSet({ ...DEFAULTS, seed: value('--seed', DEFAULTS.seed), dogs: value('--dogs', DEFAULTS.dogs) })
const figures = { matcher: 'newest-first', ...measure(set, newestFirst) }

if (args.includes('--json')) {
  process.stdout.write(`${JSON.stringify(figures, null, 2)}\n`)
} else {
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`
  process.stdout.write(
    [
      `matcher: ${figures.matcher} (seed ${figures.seed}: ${figures.dogs} dogs, ${figures.listings} listings, ${figures.trueListings} true)`,
      `recall at 5:  ${pct(figures.recallAt5)}`,
      `recall at 20: ${pct(figures.recallAt20)}`,
      `median rank:  ${figures.medianRank}`,
      '',
    ].join('\n'),
  )
}
