import { describe, expect, it } from 'vitest'
import { packageName } from './index.ts'

describe('@jillandseek/core', () => {
  it('is wired into the workspace', () => {
    expect(packageName).toBe('@jillandseek/core')
  })
})
