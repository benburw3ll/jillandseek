// One Vitest run over every package. Each project folder may hold its own config (apps/web does,
// for jsdom and React); the others run in Node with the defaults.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/*',
      'apps/*',
      {
        test: {
          name: 'scripts',
          include: ['scripts/**/*.test.mjs'],
        },
      },
    ],
  },
})
