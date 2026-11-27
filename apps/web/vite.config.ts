// The site, built by Vite. Under `pnpm dev` Vite serves it on the launch.json port (5200,
// JILL_PORT) and proxies /api to the server on JILL_API_PORT (5201), which apps/server's settings
// also default to. Vite binds 127.0.0.1 only. Tests run in jsdom.
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const port = Number(process.env.JILL_PORT ?? 5200)
const apiPort = Number(process.env.JILL_API_PORT ?? port + 1)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port,
    strictPort: true,
    // The Host header is kept as the browser sent it (127.0.0.1 or localhost on this port), so the
    // server's Host and Origin guards see the site's own address.
    proxy: { '/api': { target: `http://127.0.0.1:${apiPort}`, changeOrigin: false } },
  },
  preview: { host: '127.0.0.1', port, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
