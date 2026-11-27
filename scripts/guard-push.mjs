// pre-push hook: main only changes through merged pull requests.
import { readFileSync } from 'node:fs'
import { checkPushRefs } from './lib/guards.mjs'

const problem = checkPushRefs(readFileSync(0, 'utf8'))
if (problem !== null) {
  console.error(problem)
  process.exit(1)
}
