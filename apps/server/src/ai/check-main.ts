// `pnpm ai:check`: the entry point. It prints one line and exits 0 when the key works, 1 when not.
import { loadSettings } from '../settings.ts'
import { checkKey } from './check.ts'
import { createKeyReader } from './key.ts'
import { createSdkTransport } from './sdk.ts'

const settings = loadSettings(process.env, 'start').ai
const result = await checkKey({
  readKey: createKeyReader({ file: settings.keyFile }),
  transport: (apiKey) => createSdkTransport({ apiKey }),
  model: settings.model,
})
console.log(result.line)
process.exitCode = result.code === 'works' ? 0 : 1
