// pre-commit hook: refuses staged files that must never be committed (data/, secrets/, .env
// files), secret-shaped strings and personal values in the staged text. It also runs gitleaks
// when it is installed; CI always runs it over every commit.
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { forbiddenPaths, scanAddedLines } from './lib/guards.mjs'
import { KIND_WORDS, nameWords, ownerNameWords, scanFile } from './lib/personal.mjs'

const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  } catch {
    return null
  }
}
const read = (file) => {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return null
  }
}

const staged = (git('diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR') ?? '').split('\0').filter(Boolean)
const diff = git('diff', '--cached', '-U0', '--no-color', '--no-ext-diff') ?? ''

let names = ownerNameWords(read('profile.local.json'))
if (names.length === 0) names = nameWords((git('config', 'user.name') ?? '').trim())

const personal = staged.flatMap((f) => {
  const text = git('show', `:${f}`)
  return text === null ? [] : scanFile(f, text, names)
})

const problems = [
  ...forbiddenPaths(staged),
  ...scanAddedLines(diff).map((f) => `${f.file}:${f.line}: possible ${f.kind}`),
  ...personal.map((f) => `${f.file}:${f.line}: ${KIND_WORDS[f.kind]}`),
]

const gitleaks = spawnSync('gitleaks', ['git', '--pre-commit', '--staged', '--redact', '--no-banner'], {
  stdio: 'inherit',
})
if (gitleaks.error) {
  console.warn(
    'guard-staged: gitleaks is not installed here, so only the built-in checks ran (CI runs it on every commit).',
  )
} else if (gitleaks.status !== 0) {
  problems.push('gitleaks reported a likely secret (see above)')
}

if (problems.length > 0) {
  console.error(['Commit blocked:', ...problems.map((p) => `  - ${p}`)].join('\n'))
  console.error('Unstage these (git restore --staged <path>) or fix them. Never bypass this hook.')
  process.exit(1)
}
