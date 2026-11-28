import { describe, expect, it } from 'vitest'
import { stripMetadata } from './stripMetadata.ts'
import {
  chunk,
  holds,
  JPEG_SCAN,
  join,
  jpegClean,
  PNG_PIXELS,
  pngClean,
  riffChunk,
  segment,
  text,
  u32le,
  WEBP_PIXELS,
  webpClean,
} from './testPhotos.ts'

// The parts a photo's file may hold besides the picture, one by one: the ones that can carry
// words or a second picture never come out, and the ones kept are fixed bytes. Every file is
// made up (testPhotos.ts); PERSONAL-MARKER stands in for a name or a place.

const MARKER = 'PERSONAL-MARKER'

/** A made-up JPEG with the given segments between its start and its tables. */
const jpeg = (...extra: Uint8Array[]) =>
  join(
    [0xff, 0xd8],
    ...extra,
    segment(0xdb, [0, ...new Array(64).fill(1)]),
    segment(0xc0, [8, 0, 1, 0, 1, 1, 1, 0x11, 0]),
    segment(0xc4, [0, ...new Array(16).fill(0)]),
    segment(0xda, [1, 1, 0, 0, 0x3f, 0]),
    JPEG_SCAN,
    [0xff, 0xd9],
  )
const JFIF = segment(0xe0, join(text('JFIF\0'), [1, 1, 0, 0, 1, 0, 1, 0, 0]))

const png = (...extra: Uint8Array[]) =>
  join(
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    chunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 0, 0, 0, 0]),
    ...extra,
    chunk('gAMA', [0, 0, 0xb1, 0x8f]),
    chunk('IDAT', PNG_PIXELS),
    chunk('IEND', []),
  )

const webp = (...chunks: Uint8Array[]) => {
  const body = join(text('WEBP'), ...chunks)
  return join(text('RIFF'), u32le(body.length), body)
}
const VP8X = (flags: number) => riffChunk('VP8X', [flags, 0, 0, 0, 0, 0, 0, 0, 0, 0])
const IMAGE = riffChunk('VP8L', WEBP_PIXELS)

describe('a JPEG’s other parts', () => {
  it('drops a colour profile, which carries free text and a date', () => {
    const before = jpeg(JFIF, segment(0xe2, join(text('ICC_PROFILE\0'), [1, 1], text(`desc ${MARKER} cprt ${MARKER}`))))
    expect(holds(before, MARKER)).toBe(true)
    expect(stripMetadata(before, 'image/jpeg')).toEqual(jpegClean())
  })

  it('drops a JFIF header that holds a thumbnail, and a JFXX thumbnail', () => {
    const thumbnail = segment(0xe0, join(text('JFIF\0'), [1, 1, 0, 0, 1, 0, 1, 1, 1], text(MARKER)))
    const jfxx = segment(0xe0, join(text('JFXX\0'), [0x13], text(MARKER)))
    const after = stripMetadata(jpeg(thumbnail, jfxx), 'image/jpeg') as Uint8Array
    expect(after).toEqual(jpeg())
    expect(holds(after, MARKER)).toBe(false)
  })

  it('keeps the Adobe colour flag only as its twelve fixed bytes', () => {
    const adobe = segment(0xee, join(text('Adobe'), [0, 100, 0, 0, 0, 0, 1]))
    expect(stripMetadata(jpeg(adobe), 'image/jpeg')).toEqual(jpeg(adobe))
    // The same marker with room for words in it is not that flag, and is dropped.
    const stuffed = segment(0xee, join(text('Adobe'), [0, 100, 0, 0, 0, 0, 1], text(MARKER)))
    const after = stripMetadata(jpeg(stuffed), 'image/jpeg') as Uint8Array
    expect(after).toEqual(jpeg())
    expect(holds(after, MARKER)).toBe(false)
  })

  it('keeps a height given after the scan (DNL), so such a photo still decodes', () => {
    const withDnl = join(
      [0xff, 0xd8],
      segment(0xdb, [0, ...new Array(64).fill(1)]),
      segment(0xc0, [8, 0, 0, 0, 1, 1, 1, 0x11, 0]),
      segment(0xc4, [0, ...new Array(16).fill(0)]),
      segment(0xda, [1, 1, 0, 0, 0x3f, 0]),
      JPEG_SCAN,
      segment(0xdc, [0, 1]),
      [0xff, 0xd9],
    )
    expect(stripMetadata(withDnl, 'image/jpeg')).toEqual(withDnl)
  })

  it('drops every application segment it does not know, whatever its number', () => {
    const others = [0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xeb, 0xec, 0xed, 0xef, 0xfe].map((m) =>
      segment(m, text(MARKER)),
    )
    const after = stripMetadata(jpeg(...others), 'image/jpeg') as Uint8Array
    expect(after).toEqual(jpeg())
    expect(holds(after, MARKER)).toBe(false)
  })
})

describe('a PNG’s other parts', () => {
  it('drops a colour profile, a palette suggestion, every text chunk and animation frames', () => {
    const extras = [
      chunk('iCCP', text(`${MARKER}\0\0profile`)),
      chunk('sPLT', text(`${MARKER}\0`)),
      chunk('zTXt', text(`Comment\0\0${MARKER}`)),
      chunk('acTL', [0, 0, 0, 2, 0, 0, 0, 0]),
      chunk('fdAT', text(MARKER)),
      chunk('caBX', text(MARKER)),
    ]
    const after = stripMetadata(png(...extras), 'image/png') as Uint8Array
    expect(after).toEqual(pngClean())
    expect(holds(after, MARKER)).toBe(false)
  })
})

describe('a WebP’s other parts', () => {
  it('drops a colour profile and clears its flag', () => {
    const before = webp(VP8X(0x20 | 0x10), riffChunk('ICCP', text(`desc ${MARKER}`)), IMAGE)
    const after = stripMetadata(before, 'image/webp') as Uint8Array
    expect(after).toEqual(webpClean())
    expect(holds(after, MARKER)).toBe(false)
  })

  it('sends one picture: a second image in the file is dropped', () => {
    const second = riffChunk('VP8L', text(MARKER))
    const after = stripMetadata(webp(VP8X(0x10), IMAGE, second, riffChunk('ALPH', text(MARKER))), 'image/webp')
    expect(after).toEqual(webpClean())
    expect(holds(after as Uint8Array, MARKER)).toBe(false)
  })

  it('refuses an animation, which holds many pictures and chunks of its own inside each frame', () => {
    const frame = riffChunk('ANMF', join(new Array(16).fill(0), IMAGE, riffChunk('ZZZZ', text(MARKER))))
    const animated = [
      webp(VP8X(0x02), riffChunk('ANIM', [0, 0, 0, 0, 0, 0]), frame),
      webp(VP8X(0x10), frame),
      webp(VP8X(0x02 | 0x10), IMAGE),
      webp(IMAGE, frame),
    ]
    for (const file of animated) expect(stripMetadata(file, 'image/webp')).toBeNull()
  })
})
