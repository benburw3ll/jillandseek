import { describe, expect, it } from 'vitest'
import baseline from '../../eval/baseline.json' with { type: 'json' }
import { DEFAULTS } from '../../eval/defaults.ts'
import { generateSet } from '../../eval/generate.ts'
import { measure, scoredAt } from '../../eval/measure.ts'

// The matcher on the synthetic set (#18): the figures `pnpm eval:match` prints.

describe('the matcher on the synthetic set', () => {
  it('beats the newest-first baseline at recall at 20 and on the median rank', () => {
    const figures = measure(generateSet(DEFAULTS), scoredAt(DEFAULTS.now))
    expect(figures.recallAt20).toBeGreaterThan(baseline.recallAt20)
    expect(figures.recallAt20).toBeGreaterThanOrEqual(0.9)
    expect(figures.medianRank).toBeLessThan(baseline.medianRank)
  })
})
