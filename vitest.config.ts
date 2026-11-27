// One Vitest run over every package. apps/web keeps its own config (jsdom and React); the others
// run in Node with the defaults. Every project loads test/no-network.ts first, so no test reaches
// the internet (ADR-0002).
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const setupFiles = [resolve(import.meta.dirname, 'test/no-network.ts')]
const node = (dir: string) => ({ root: resolve(import.meta.dirname, dir), test: { name: dir, setupFiles } })

export default defineConfig({
  test: {
    projects: [
      node('packages/core'),
      node('packages/sources'),
      node('apps/server'),
      {
        extends: resolve(import.meta.dirname, 'apps/web/vite.config.ts'),
        root: resolve(import.meta.dirname, 'apps/web'),
        test: { name: 'apps/web', setupFiles },
      },
      {
        test: {
          name: 'scripts',
          include: ['scripts/**/*.test.mjs', 'test/**/*.test.ts'],
          setupFiles,
        },
      },
    ],
  },
})
