import { detectPhotoType } from '@jillandseek/core'
import { describe, expect, it } from 'vitest'
import { stripMetadata } from './stripMetadata.ts'
import {
  GPS_MARKER,
  holds,
  jpegClean,
  jpegWithMetadata,
  pngClean,
  pngWithMetadata,
  TEXT_MARKER,
  TRAILER_MARKER,
  webpClean,
  webpWithMetadata,
} from './testPhotos.ts'

// Every photo here is made up, byte by byte (testPhotos.ts). The markers stand in for what a
// phone writes into a photo: where it was taken, comments, and a second picture after the end.

const MARKERS = [GPS_MARKER, TEXT_MARKER, TRAILER_MARKER, 'Exif', 'xap', 'Photoshop', 'MPF']

describe('removing a photo’s metadata', () => {
  const cases = [
    ['image/jpeg', jpegWithMetadata, jpegClean],
    ['image/png', pngWithMetadata, pngClean],
    ['image/webp', webpWithMetadata, webpClean],
  ] as const

  it.each(cases)('keeps the picture of a %s and drops everything else', (type, withMetadata, clean) => {
    const before = withMetadata()
    expect(holds(before, GPS_MARKER)).toBe(true)
    const after = stripMetadata(before, type)
    expect(after).not.toBeNull()
    // Exactly the picture: the same bytes as the photo built with no metadata at all.
    expect(after).toEqual(clean())
    for (const marker of MARKERS) expect(holds(after as Uint8Array, marker)).toBe(false)
    expect(detectPhotoType(after as Uint8Array)).toBe(type)
  })

  it.each(cases)('leaves a %s with no metadata as it is, and gives the same answer twice', (type, _with, clean) => {
    const once = stripMetadata(clean(), type)
    expect(once).toEqual(clean())
    expect(stripMetadata(once as Uint8Array, type)).toEqual(clean())
  })

  it('clears the EXIF and XMP flags of a WebP and fixes its length', () => {
    const after = stripMetadata(webpWithMetadata(), 'image/webp') as Uint8Array
    // The flags byte follows "RIFF size WEBP VP8X size".
    expect((after[20] ?? 0) & (0x08 | 0x04)).toBe(0)
    expect((after[20] ?? 0) & 0x10).toBe(0x10)
    expect(new DataView(after.buffer).getUint32(4, true)).toBe(after.length - 8)
  })

  it('gives null for a file it can’t follow, so nothing unread is ever sent', () => {
    const jpeg = jpegWithMetadata()
    const png = pngWithMetadata()
    const webp = webpWithMetadata()
    const broken: [Uint8Array, 'image/jpeg' | 'image/png' | 'image/webp'][] = [
      [new Uint8Array(0), 'image/jpeg'],
      [Uint8Array.of(0xff, 0xd8, 0xff), 'image/jpeg'],
      // No scan, a segment longer than the file, and no end marker.
      [Uint8Array.of(0xff, 0xd8, 0xff, 0xd9), 'image/jpeg'],
      [Uint8Array.of(0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff, 1, 2), 'image/jpeg'],
      [jpeg.subarray(0, jpeg.length - TRAILER_MARKER.length - 2), 'image/jpeg'],
      // A PNG cut before its end, one with no picture data, and one whose chunk runs past the file.
      [png.subarray(0, 60), 'image/png'],
      [Uint8Array.of(...png.subarray(0, 8), 0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0, 0, 0, 0), 'image/png'],
      [Uint8Array.of(...png.subarray(0, 8), 0xff, 0xff, 0xff, 0xff, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 0), 'image/png'],
      // A WebP with no image chunk, and one whose chunk runs past the file.
      [webp.subarray(0, 30), 'image/webp'],
      [Uint8Array.of(...webp.subarray(0, 12), 0x56, 0x50, 0x38, 0x4c, 0xff, 0xff, 0xff, 0x7f, 1, 2), 'image/webp'],
      // The wrong type for the bytes.
      [png, 'image/jpeg'],
      [jpeg, 'image/png'],
      [jpeg, 'image/webp'],
    ]
    for (const [bytes, type] of broken) expect(stripMetadata(bytes, type)).toBeNull()
  })
})
