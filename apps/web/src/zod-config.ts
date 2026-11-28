import { z } from 'zod'

// Loaded first, before any schema is made (main.tsx). When a schema is made, zod tries
// `Function('')` once to see whether it may compile its checks. The page's content policy forbids
// that, rightly, and the browser logs the refusal as an error. Told not to compile, zod never
// tries, and checks every answer the plain way.
z.config({ jitless: true })
