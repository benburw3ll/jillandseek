// robots.txt (RFC 9309), read for Jill and Seek's own product token, or the generic agent's
// group when no group names it. Matching is strict on purpose: a path is normalised before it is
// compared (percent-escapes of plain characters decoded, repeated slashes collapsed), and a
// Disallow rule matches regardless of case, so a path trick can't step around a rule.

export const PRODUCT_TOKEN = 'jillandseek'

type Rule = { allow: boolean; pattern: string }
export type Robots = { rules: Rule[] }

/** Robots that allow everything: no file (404), or a file with no group for us. */
export const allowAll: Robots = { rules: [] }

export function parseRobots(text: string): Robots {
  type Group = { agents: string[]; rules: Rule[] }
  const groups: Group[] = []
  let current: Group | null = null
  let lastWasAgent = false
  for (const raw of text.split(/\r\n|\r|\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line)
    if (!m) continue
    const key = (m[1] ?? '').toLowerCase()
    const value = (m[2] ?? '').trim()
    if (key === 'user-agent') {
      if (!lastWasAgent || current === null) {
        current = { agents: [], rules: [] }
        groups.push(current)
      }
      current.agents.push(value.toLowerCase())
      lastWasAgent = true
      continue
    }
    lastWasAgent = false
    if (current === null) continue
    if ((key === 'allow' || key === 'disallow') && value !== '') {
      current.rules.push({ allow: key === 'allow', pattern: value })
    }
  }
  const ours = groups.filter((g) => g.agents.some((a) => a === PRODUCT_TOKEN))
  const chosen = ours.length > 0 ? ours : groups.filter((g) => g.agents.includes('*'))
  return { rules: chosen.flatMap((g) => g.rules) }
}

const UNRESERVED = /%([0-9A-Fa-f]{2})/g

/** Decodes the escapes of plain characters, upper-cases the rest, and collapses repeated slashes. */
export function normalisePath(path: string): string {
  const decoded = path.replace(UNRESERVED, (match, hex: string) => {
    const ch = String.fromCharCode(Number.parseInt(hex, 16))
    return /[A-Za-z0-9\-._~]/.test(ch) ? ch : match.toUpperCase()
  })
  const q = decoded.indexOf('?')
  const pathPart = q === -1 ? decoded : decoded.slice(0, q)
  const query = q === -1 ? '' : decoded.slice(q)
  return pathPart.replace(/\/{2,}/g, '/') + query
}

/** How long a pattern's match is on `path`, or -1 when it doesn't match. */
function matchLength(pattern: string, path: string, ignoreCase: boolean): number {
  const anchored = pattern.endsWith('$')
  const body = normalisePath(anchored ? pattern.slice(0, -1) : pattern)
  const escaped = body
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*')
  const re = new RegExp(`^${escaped}${anchored ? '$' : ''}`, ignoreCase ? 'i' : '')
  return re.test(path) ? body.length : -1
}

/**
 * Whether robots let us read `pathAndQuery`. The longest matching rule wins; on a tie, Allow
 * wins (RFC 9309). Disallow rules match regardless of case, Allow rules only exactly.
 */
export function isAllowed(robots: Robots, pathAndQuery: string): boolean {
  const path = normalisePath(pathAndQuery)
  if (path === '/robots.txt') return true
  let allowLen = -1
  let disallowLen = -1
  for (const rule of robots.rules) {
    const len = matchLength(rule.pattern, path, !rule.allow)
    if (rule.allow) allowLen = Math.max(allowLen, len)
    else disallowLen = Math.max(disallowLen, len)
  }
  return disallowLen === -1 || allowLen >= disallowLen
}
