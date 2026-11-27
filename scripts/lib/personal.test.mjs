import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { scanFile } from './personal.mjs'

// Every value here is made up, and the personal-looking ones are assembled at run time, so this
// file itself passes the scan it tests.
const userFolder = ['C:', 'Users', 'Zorbulon', 'Documents'].join('\\')
const bashFolder = ['', 'c', 'Users', 'Zorbulon'].join('/')
const address = ['zorbulon', 'quux-mail.co'].join('@')
// An area code can't start with 0, so this number can't belong to anyone.
const phone = ['012', '345', '6789'].join('-')

const kinds = (text, names = []) => scanFile('fixture.md', text, names).map((f) => f.kind)

describe('scanFile', () => {
  it('finds a Windows user folder in either slash style', () => {
    expect(kinds(`see ${userFolder}`)).toEqual(['user-path'])
    expect(kinds(`cd ${bashFolder}/repo`)).toEqual(['user-path'])
  })

  it('finds an email address and a phone number', () => {
    expect(kinds(`write to ${address}`)).toEqual(['email'])
    expect(kinds(`call ${phone}`)).toEqual(['phone'])
  })

  it('allows the made-up examples and nothing wider', () => {
    expect(kinds('write to finder@example.com or a@shelter.test')).toEqual([])
    expect(kinds('call 612-555-0142')).toEqual([])
    expect(kinds('C:\\Users\\Public\\x')).toEqual([])
    expect(kinds(`call ${['012', '555', '0242'].join('-')}`)).toEqual(['phone'])
  })

  it('leaves dates, versions and package names alone', () => {
    expect(kinds('2026-11-26T10:00:00.000Z pnpm@12.16.1 @hono/node-server@2.1.11 127.0.0.1:5200')).toEqual([])
  })

  it("finds the owner's name as a whole word only", () => {
    expect(kinds('Zorbulon Quux wrote this', ['Zorbulon'])).toEqual(['owner-name'])
    expect(kinds('zorbulonian', ['Zorbulon'])).toEqual([])
  })

  it('reports line numbers, never the value', () => {
    const findings = scanFile('fixture.md', `one\n${address}\n`)
    expect(findings).toEqual([{ file: 'fixture.md', line: 2, kind: 'email' }])
  })
})

describe('check-personal', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jill-personal-'))
  afterAll(() => rmSync(dir, { recursive: true, force: true }))
  const run = (file) => spawnSync(process.execPath, ['scripts/check-personal.mjs', file], { encoding: 'utf8' })

  it('fails on a fixture holding a made-up user-folder path', () => {
    const fixture = join(dir, 'fixture.md')
    writeFileSync(fixture, `The export went to ${userFolder}\\export.csv\n`)
    const result = run(fixture)
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('a Windows user folder')
    expect(result.stderr).not.toContain('Zorbulon')
  })

  it('passes on a clean fixture', () => {
    const fixture = join(dir, 'clean.md')
    writeFileSync(fixture, 'Listings appear after the first sweep.\n')
    expect(run(fixture).status).toBe(0)
  })
})
