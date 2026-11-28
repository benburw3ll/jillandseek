// Tests only: made-up photos, built byte by byte in each format's real structure, with the kinds
// of metadata a phone writes. No real photo is in the repo. The "location" is a marker string.

export const GPS_MARKER = 'GPS-MARKER-00.0000N-000.0000W'
export const TEXT_MARKER = 'COMMENT-MARKER made-up words'
export const TRAILER_MARKER = 'TRAILER-MARKER a second picture or a clip'

const text = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0))
const join = (...parts: (Uint8Array | number[])[]) => Uint8Array.from(parts.flatMap((p) => [...p]))
const u16 = (n: number) => [(n >> 8) & 0xff, n & 0xff]
const u32 = (n: number) => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]
const u32le = (n: number) => u32(n).reverse()

const segment = (marker: number, data: Uint8Array | number[]) => join([0xff, marker], u16(data.length + 2), data)

/** The scan's coded bytes, with a stuffed FF 00 and a restart marker inside, as real scans have. */
export const JPEG_SCAN = [0x12, 0x34, 0xff, 0x00, 0x56, 0xff, 0xd0, 0x78, 0x9a]

/** A JPEG with a JFIF header, EXIF (the "location"), XMP, a Photoshop block, a comment and a trailer. */
export function jpegWithMetadata(): Uint8Array {
  return join(
    [0xff, 0xd8],
    segment(0xe0, join(text('JFIF\0'), [1, 1, 0, 0, 1, 0, 1, 0, 0])),
    segment(0xe1, join(text('Exif\0\0'), text(GPS_MARKER))),
    segment(0xe1, join(text('http://ns.adobe.com/xap/1.0/\0'), text(`<x>${GPS_MARKER}</x>`))),
    segment(0xe2, join(text('MPF\0'), text(TRAILER_MARKER))),
    segment(0xed, join(text('Photoshop 3.0\0'), text(TEXT_MARKER))),
    segment(0xfe, text(TEXT_MARKER)),
    segment(0xdb, [0, ...new Array(64).fill(1)]),
    segment(0xc0, [8, 0, 1, 0, 1, 1, 1, 0x11, 0]),
    segment(0xc4, [0, ...new Array(16).fill(0)]),
    segment(0xda, [1, 1, 0, 0, 0x3f, 0]),
    JPEG_SCAN,
    [0xff, 0xd9],
    text(TRAILER_MARKER),
  )
}

/** The same picture with nothing but what makes it. */
export function jpegClean(): Uint8Array {
  return join(
    [0xff, 0xd8],
    segment(0xe0, join(text('JFIF\0'), [1, 1, 0, 0, 1, 0, 1, 0, 0])),
    segment(0xdb, [0, ...new Array(64).fill(1)]),
    segment(0xc0, [8, 0, 1, 0, 1, 1, 1, 0x11, 0]),
    segment(0xc4, [0, ...new Array(16).fill(0)]),
    segment(0xda, [1, 1, 0, 0, 0x3f, 0]),
    JPEG_SCAN,
    [0xff, 0xd9],
  )
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
// The CRC is copied through unchanged and never checked here, so a made-up one is enough.
const chunk = (type: string, data: Uint8Array | number[]) => join(u32(data.length), text(type), data, [0xc0, 0xff, 0xee, 0x00])

export const PNG_PIXELS = [0x78, 0x9c, 0x63, 0x60, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01]

/** A PNG with text chunks, EXIF, a time and bytes after its end. */
export function pngWithMetadata(): Uint8Array {
  return join(
    PNG_SIGNATURE,
    chunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 0, 0, 0, 0]),
    chunk('tEXt', text(`Comment\0${TEXT_MARKER}`)),
    chunk('iTXt', text(`XML:com.adobe.xmp\0\0\0\0\0${GPS_MARKER}`)),
    chunk('eXIf', text(GPS_MARKER)),
    chunk('tIME', [7, 0xea, 1, 10, 12, 0, 0]),
    chunk('gAMA', [0, 0, 0xb1, 0x8f]),
    chunk('IDAT', PNG_PIXELS),
    chunk('IEND', []),
    text(TRAILER_MARKER),
  )
}

export function pngClean(): Uint8Array {
  return join(
    PNG_SIGNATURE,
    chunk('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 0, 0, 0, 0]),
    chunk('gAMA', [0, 0, 0xb1, 0x8f]),
    chunk('IDAT', PNG_PIXELS),
    chunk('IEND', []),
  )
}

const riffChunk = (type: string, data: Uint8Array | number[]) =>
  join(text(type), u32le(data.length), data, data.length % 2 === 1 ? [0] : [])

export const WEBP_PIXELS = [0x2f, 0x00, 0x00, 0x00, 0x00, 0x07, 0x10]

/** A WebP with the EXIF and XMP flags set, and both chunks. */
export function webpWithMetadata(): Uint8Array {
  const body = join(
    text('WEBP'),
    riffChunk('VP8X', [0x08 | 0x04 | 0x10, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    riffChunk('VP8L', WEBP_PIXELS),
    riffChunk('EXIF', text(GPS_MARKER)),
    riffChunk('XMP ', text(`<x>${GPS_MARKER}</x>`)),
    riffChunk('JUNK', text(TEXT_MARKER)),
  )
  return join(text('RIFF'), u32le(body.length), body)
}

export function webpClean(): Uint8Array {
  const body = join(text('WEBP'), riffChunk('VP8X', [0x10, 0, 0, 0, 0, 0, 0, 0, 0, 0]), riffChunk('VP8L', WEBP_PIXELS))
  return join(text('RIFF'), u32le(body.length), body)
}

/** Whether the bytes hold the marker, as text. */
export const holds = (bytes: Uint8Array, marker: string) => Buffer.from(bytes).includes(marker, 0, 'latin1')
