// Gate step (the first in `pnpm check`): refuses personal values in the repo (see
// lib/personal.mjs). With no arguments it scans every tracked file and every untracked file git
// doesn't ignore; with arguments it scans just those files. The owner's name comes from
// profile.local.json in this checkout (git-ignored) or, without one, `git config user.name`; it is
// only searched for, never printed. CI has neither, so the name check runs on the owner's machine.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { KIND_WORDS, nameWords, ownerNameWords, scanFile } from './lib/personal.mjs'

const read = (file) => {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return null
  }
}
const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  } catch {
    return ''
  }
}

let names = ownerNameWords(read('profile.local.json'))
if (names.length === 0) names = nameWords(git('config', 'user.name').trim())
if (names.length === 0) console.log('check-personal: no owner name known here, so the name check is off')

const given = process.argv.slice(2)
const files =
  given.length > 0
    ? given
    : git('ls-files', '-z', '--cached', '--others', '--exclude-standard').split('\0').filter(Boolean)
const findings = files.flatMap((f) => {
  const text = read(f)
  return text === null ? [] : scanFile(f.replaceAll('\\', '/'), text, names)
})

if (findings.length > 0) {
  console.error(
    ['Personal values in the repo:', ...findings.map((f) => `  ${f.file}:${f.line}: ${KIND_WORDS[f.kind]}`)].join('\n'),
  )
  console.error(
    'Use made-up values (example.com addresses, 555-01xx numbers, invented names) and keep real ones in the data home.',
  )
  process.exit(1)
}
console.log(`check-personal: ${files.length} files clean`)
