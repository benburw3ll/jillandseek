// Finds personal values in the repo's text. This repo is public and the data is strangers'
// (AGENTS.md hard rule 2): no file may name a Windows user folder, an email address, a phone
// number or the owner. Examples and tests use values that are plainly made up, and the allowlist
// below covers only those: the reserved example domains and the 555-0100 to 555-0199 numbers.

/** Files never scanned: the lockfile is generated and holds only package names and hashes. */
const SKIP = /(^|\/)(pnpm-lock\.yaml)$/

/** C:\Users\<name>, C:/Users/<name> or Git Bash's /c/Users/<name>, except the shared Public folder. */
const USER_PATH = /(?:\b[A-Za-z]:[\\/]{1,2}|(?<![\w.-])\/[A-Za-z]\/)Users[\\/]{1,2}(?!Public\b)[\w.-]+/i

const EMAIL = /[A-Za-z0-9._%+-]+@((?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})\b/g
/** The domains RFC 2606 and RFC 6761 keep for examples and tests. */
const MADE_UP_DOMAIN = /(^|\.)(example\.(com|org|net)|example|test|invalid|localhost)$/i

/** A North American number: optional +1, then 3-3-4 digits split by spaces, dots or dashes. */
const PHONE = /(?<![\w.+-])(?:\+?1[-. ]?)?(?:\(\d{3}\)|\d{3})[-. ]?\d{3}[-. ]\d{4}(?![\w-])/g
/** 555-0100 to 555-0199 are set aside for fiction. */
const MADE_UP_PHONE = /555[-. ]?01\d\d$/

/** The words of a name long enough to search for. */
export function nameWords(name) {
  if (typeof name !== 'string') return []
  return name.split(/\s+/).filter((w) => /^[\p{L}'-]{3,}$/u.test(w))
}

/** The owner's name from profile.local.json's "name" (git-ignored), or [] without one. */
export function ownerNameWords(profileJson) {
  if (profileJson === null) return []
  const text = profileJson.charCodeAt(0) === 0xfeff ? profileJson.slice(1) : profileJson
  try {
    return nameWords(JSON.parse(text).name)
  } catch {
    return []
  }
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** True when the text looks binary (a NUL byte near the start), so it is not scanned. */
export const isBinary = (text) => text.slice(0, 8000).includes('\0')

/**
 * Findings for one file: { file, line, kind }, with kind user-path, email, phone or owner-name.
 * A finding never carries the matched text, so reporting it never repeats the value.
 */
export function scanFile(file, text, ownerNames = []) {
  if (SKIP.test(file) || isBinary(text)) return []
  const names = ownerNames.map((n) => new RegExp(`(?<![\\p{L}])${escapeRegExp(n)}(?![\\p{L}])`, 'iu'))
  const findings = []
  text.split('\n').forEach((content, i) => {
    const found = (kind) => findings.push({ file, line: i + 1, kind })
    if (USER_PATH.test(content)) found('user-path')
    if ([...content.matchAll(EMAIL)].some((m) => !MADE_UP_DOMAIN.test(m[1] ?? ''))) found('email')
    if ([...content.matchAll(PHONE)].some((m) => !MADE_UP_PHONE.test(m[0]))) found('phone')
    if (names.some((re) => re.test(content))) found('owner-name')
  })
  return findings
}

export const KIND_WORDS = {
  'user-path': 'a Windows user folder',
  email: 'an email address',
  phone: 'a phone number',
  'owner-name': "the owner's name",
}
