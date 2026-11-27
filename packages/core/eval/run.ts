// pnpm eval:match [--json] [--baseline] [--seed <n>] [--dogs <n>]
//
// Generates the synthetic set from a seed, runs the matcher (#19) over it and prints recall at
// 5, recall at 20 and the median rank of the true listings, beside the newest-first baseline's.
// `--json` prints the figures as JSON; `--json --baseline` prints the baseline's alone
// (baseline.json is that output for the defaults). Nothing is stored and nothing is sent.
import { DEFAULTS } from './defaults.ts'
import { generateSet } from './generate.ts'
import { type Figures, measure, newestFirst, scoredAt } from './measure.ts'

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
const baseline = { matcher: 'newest-first', ...measure(set, newestFirst) }
const matcher = { matcher: 'scoreListing', ...measure(set, scoredAt(DEFAULTS.now)) }

if (args.includes('--json')) {
  const out = args.includes('--baseline') ? baseline : { matcher, baseline }
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`)
} else {
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`
  const lines = (f: Figures & { matcher: string }) => [
    `matcher: ${f.matcher} (seed ${f.seed}: ${f.dogs} dogs, ${f.listings} listings, ${f.trueListings} true)`,
    `recall at 5:  ${pct(f.recallAt5)}`,
    `recall at 20: ${pct(f.recallAt20)}`,
    `median rank:  ${f.medianRank}`,
    '',
  ]
  process.stdout.write([...lines(matcher), ...lines(baseline)].join('\n'))
}
