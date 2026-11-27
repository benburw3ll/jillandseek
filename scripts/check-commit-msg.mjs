// commit-msg hook: the first line must be a Conventional Commits header of at most 100 characters.
import { readFileSync } from 'node:fs'
import { checkCommitMessage } from './lib/guards.mjs'

const file = process.argv[2]
if (file === undefined) {
  console.error('usage: node scripts/check-commit-msg.mjs <commit message file>')
  process.exit(2)
}
const problem = checkCommitMessage(readFileSync(file, 'utf8'))
if (problem !== null) {
  console.error(`Commit blocked: ${problem}`)
  process.exit(1)
}
