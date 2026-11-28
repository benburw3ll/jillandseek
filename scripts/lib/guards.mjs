// The checks behind the git hooks in lefthook.yml. They are pure functions over git's output so
// they can be unit-tested; the scripts in scripts/ only collect that output and report.

const FORBIDDEN_PATHS = [
  { pattern: /^data\//, why: 'the data home and the private notes never leave this computer' },
  { pattern: /^secrets\//, why: 'secrets never leave this computer' },
  { pattern: /(^|\/)\.dev-home\//, why: 'dev data homes stay local' },
  { pattern: /(^|\/)profile\.local\.json$/, why: 'the owner profile holds personal content' },
  { pattern: /\.(key|pem)$/i, why: 'key files belong in secrets/' },
  { pattern: /\.dpapi$/i, why: 'a saved API key lives under the user profile, never in the repo' },
  { pattern: /(^|\/)\.env(\.(?!example$)[^/]+)?$/, why: 'env files hold secrets' },
]

/** One message per staged path that must never be committed. Paths use git's forward slashes. */
export function forbiddenPaths(paths) {
  return paths.flatMap((path) => {
    const rule = FORBIDDEN_PATHS.find((r) => r.pattern.test(path))
    return rule ? [`${path}: never commit this (${rule.why})`] : []
  })
}

const SECRET_PATTERNS = [
  { kind: 'Anthropic API key', pattern: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { kind: 'OpenAI-style API key', pattern: /\bsk-(proj-)?[A-Za-z0-9]{32,}/ },
  { kind: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}/ },
  { kind: 'GitHub fine-grained token', pattern: /\bgithub_pat_[A-Za-z0-9_]{40,}/ },
  { kind: 'AWS access key id', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { kind: 'Slack token', pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { kind: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { kind: 'JSON web token', pattern: /\beyJ[\w-]{10,}\.eyJ[\w-]{10,}\.[\w-]{10,}/ },
]

/**
 * Scans the added lines of a unified diff (`git diff --cached -U0`) for secret-shaped strings.
 * Findings carry the file, line and kind only, never the matched text.
 */
export function scanAddedLines(diff) {
  const findings = []
  let file = ''
  let line = 0
  for (const text of diff.split('\n')) {
    if (text.startsWith('+++ ')) {
      file = text.slice(4).replace(/^b\//, '')
    } else if (text.startsWith('@@')) {
      line = Number(/\+(\d+)/.exec(text)?.[1] ?? 0)
    } else if (text.startsWith('+')) {
      const hit = SECRET_PATTERNS.find((p) => p.pattern.test(text))
      if (hit) findings.push({ file, line, kind: hit.kind })
      line++
    }
  }
  return findings
}

const COMMIT_TYPES = 'build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test'
const HEADER = new RegExp(`^(${COMMIT_TYPES})(\\([\\w./-]+\\))?!?: \\S`)
const MAX_HEADER = 100

/** Null when the message's first line is a Conventional Commits header, otherwise why it isn't. */
export function checkCommitMessage(message) {
  const header = message.split(/\r?\n/).find((l) => l.trim() !== '' && !l.startsWith('#'))
  if (header === undefined) return 'The commit message is empty.'
  if (/^(Merge |Revert "|(fixup|squash|amend)! )/.test(header)) return null
  if (!HEADER.test(header)) {
    return `"${header}" is not a Conventional Commits header. Use "type(scope): summary", where type is one of ${COMMIT_TYPES.replaceAll('|', ', ')}.`
  }
  if (header.length > MAX_HEADER) return `The first line is ${header.length} characters; keep it to ${MAX_HEADER}.`
  return null
}

/** Null unless the push (git's pre-push stdin: "<local ref> <sha> <remote ref> <sha>" lines) targets main. */
export function checkPushRefs(stdin) {
  const toMain = stdin
    .split(/\r?\n/)
    .map((l) => l.trim().split(/\s+/)[2])
    .some((remoteRef) => remoteRef === 'refs/heads/main')
  return toMain ? 'Pushing to main is blocked. Push a branch and open a pull request (AGENTS.md, Workflow).' : null
}
