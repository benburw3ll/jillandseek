import type { PhotoType } from '@jillandseek/core'

// Removes a photo's metadata before it is sent anywhere (ADR-0007 point 7). A phone's photo can
// carry where and when it was taken, the device, a thumbnail of the uncropped picture, comments,
// and a second picture or a clip after the image's end. Each function rebuilds the file from an
// allow-list: only the parts that make the picture are kept, and anything unknown is dropped.
// A file whose structure can't be followed gives null, and nothing is sent.

/** The photo with its metadata removed, or null when the file can't be read as that type. */
export function stripMetadata(bytes: Uint8Array, type: PhotoType): Uint8Array | null {
  try {
    if (type === 'image/jpeg') return stripJpeg(bytes)
    if (type === 'image/png') return stripPng(bytes)
    return stripWebp(bytes)
  } catch {
    return null
  }
}

const ascii = (bytes: Uint8Array, at: number, length: number) =>
  String.fromCharCode(...bytes.subarray(at, Math.min(at + length, bytes.length)))

function join(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let at = 0
  for (const p of parts) {
    out.set(p, at)
    at += p.length
  }
  return out
}

// JPEG: a run of segments, each `FF <marker> <length> <data>`. The picture is the tables (DQT,
// DHT, DRI), the frame (SOFn), and the scans (SOS and the coded data after it), up to EOI.
// Kept besides: a bare JFIF header and the Adobe colour-transform flag, which are fixed bytes
// that change how the colours decode. Dropped: EXIF and XMP (APP1), a colour profile (it carries
// free text and a date), every other APPn, comments, and whatever follows EOI.

function stripJpeg(bytes: Uint8Array): Uint8Array | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null
  const parts: Uint8Array[] = [bytes.subarray(0, 2)]
  let at = 2
  let sawScan = false
  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 0xff) return null
    const marker = bytes[at + 1] ?? 0
    // Fill bytes before a marker are allowed and skipped.
    if (marker === 0xff) {
      at += 1
      continue
    }
    if (marker === 0xd9) break
    if (marker === 0xd8 || marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) return null
    const length = ((bytes[at + 2] ?? 0) << 8) | (bytes[at + 3] ?? 0)
    const end = at + 2 + length
    if (length < 2 || end > bytes.length) return null
    const segment = bytes.subarray(at, end)
    if (keepJpegSegment(marker, bytes, at + 4, length - 2)) parts.push(segment)
    at = end
    if (marker === 0xda) {
      // The coded data runs to the next real marker: FF followed by anything but 00 (a stuffed
      // byte) or D0 to D7 (a restart).
      sawScan = true
      const start = at
      while (at < bytes.length) {
        if (bytes[at] === 0xff) {
          const next = bytes[at + 1]
          if (next !== undefined && next !== 0x00 && next !== 0xff && !(next >= 0xd0 && next <= 0xd7)) break
        }
        at += 1
      }
      parts.push(bytes.subarray(start, at))
    }
  }
  if (!sawScan || bytes[at] !== 0xff || bytes[at + 1] !== 0xd9) return null
  parts.push(Uint8Array.of(0xff, 0xd9))
  return join(parts)
}

function keepJpegSegment(marker: number, bytes: Uint8Array, dataAt: number, dataLength: number): boolean {
  // Tables, frames and scans.
  // DQT, DHT, DRI and SOS, and DNL (the height, when the frame leaves it for later).
  if (marker === 0xdb || marker === 0xc4 || marker === 0xdd || marker === 0xda || marker === 0xdc) return true
  if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc8) return true
  // A JFIF header with no thumbnail inside it.
  if (marker === 0xe0) {
    return (
      dataLength === 14 && ascii(bytes, dataAt, 5) === 'JFIF\0' && bytes[dataAt + 12] === 0 && bytes[dataAt + 13] === 0
    )
  }
  if (marker === 0xee) return dataLength === 12 && ascii(bytes, dataAt, 5) === 'Adobe'
  return false
}

// PNG: a signature, then chunks of `<length> <type> <data> <crc>`. Kept: the chunks that make the
// picture and say how its colours decode, in numbers only. Dropped: text (tEXt, zTXt, iTXt), EXIF
// (eXIf), the time (tIME), a colour profile (iCCP: it carries a name and free text), animation,
// anything unknown, and whatever follows IEND.

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const PNG_KEEP = new Set([
  'IHDR',
  'PLTE',
  'IDAT',
  'IEND',
  'tRNS',
  'gAMA',
  'cHRM',
  'sRGB',
  'sBIT',
  'bKGD',
  'pHYs',
  'cICP',
])

function stripPng(bytes: Uint8Array): Uint8Array | null {
  if (!PNG_SIGNATURE.every((b, i) => bytes[i] === b)) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const parts: Uint8Array[] = [bytes.subarray(0, 8)]
  let at = 8
  let sawData = false
  while (at + 12 <= bytes.length) {
    const length = view.getUint32(at)
    const type = ascii(bytes, at + 4, 4)
    const end = at + 12 + length
    if (end > bytes.length) return null
    if (at === 8 && type !== 'IHDR') return null
    if (PNG_KEEP.has(type)) parts.push(bytes.subarray(at, end))
    if (type === 'IDAT') sawData = true
    if (type === 'IEND') return sawData ? join(parts) : null
    at = end
  }
  return null
}

// WebP: a RIFF container, `RIFF <size> WEBP`, then chunks of `<type> <size> <data>` padded to an
// even length. Kept: the one image (the first VP8 or VP8L), its alpha, and the VP8X header with
// its EXIF, XMP and colour-profile flags cleared. Dropped: EXIF, XMP, a colour profile, a second
// image and anything unknown. An animation holds many pictures, and chunks of its own inside each
// frame, so it is refused: the one photo is what is sent (ADR-0007 point 7).

const VP8X_ICC = 0x20
const VP8X_EXIF = 0x08
const VP8X_XMP = 0x04
const VP8X_ANIMATION = 0x02

function stripWebp(bytes: Uint8Array): Uint8Array | null {
  if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP') return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const riffEnd = Math.min(8 + view.getUint32(4, true), bytes.length)
  const parts: Uint8Array[] = []
  let at = 12
  let sawImage = false
  let sawAlpha = false
  while (at + 8 <= riffEnd) {
    const type = ascii(bytes, at, 4)
    const size = view.getUint32(at + 4, true)
    const end = at + 8 + size + (size % 2)
    if (at + 8 + size > riffEnd) return null
    if (type === 'ANIM' || type === 'ANMF') return null
    if (type === 'VP8X' && ((bytes[at + 8] ?? 0) & VP8X_ANIMATION) !== 0) return null
    const image = type === 'VP8 ' || type === 'VP8L'
    // One header, one alpha and one image: a second of any of them is dropped.
    const keep =
      (type === 'VP8X' && parts.length === 0) || (type === 'ALPH' && !sawAlpha && !sawImage) || (image && !sawImage)
    if (keep) {
      // A final chunk may lack its pad byte: copy what is there and pad it here.
      const chunk = new Uint8Array(8 + size + (size % 2))
      chunk.set(bytes.subarray(at, at + 8 + size))
      if (type === 'VP8X' && size >= 1) chunk[8] = (chunk[8] ?? 0) & ~(VP8X_ICC | VP8X_EXIF | VP8X_XMP)
      parts.push(chunk)
      if (type === 'ALPH') sawAlpha = true
      if (image) sawImage = true
    }
    at = end
  }
  if (!sawImage) return null
  const body = join(parts)
  const out = new Uint8Array(12 + body.length)
  out.set(bytes.subarray(0, 12))
  new DataView(out.buffer).setUint32(4, 4 + body.length, true)
  out.set(body, 12)
  return out
}
