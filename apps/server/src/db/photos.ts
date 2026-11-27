import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { detectPhotoType, PHOTO_TYPES, PhotoName, type PhotoType, photoTypeOf } from '@jillandseek/core'

// A missing dog's photo files, in the data home's photos/ (ADR-0003 point 4). The server names
// every file itself: 32 random hex digits and the extension of the type its bytes show. The
// uploaded file's own name never reaches a path, and only a name that fits `PhotoName` is ever
// read or removed, so nothing outside photos/ can be named.

export function photoStore(photosDir: string) {
  const pathOf = (name: string) => {
    if (!PhotoName.safeParse(name).success) throw new Error('not a photo name')
    return join(photosDir, name)
  }

  return {
    /** The type the bytes show, or null when they are not a JPEG, PNG or WebP image. */
    detect(bytes: Uint8Array): PhotoType | null {
      return detectPhotoType(bytes)
    },

    /** Writes the bytes as a new file and returns its name. */
    save(bytes: Uint8Array, type: PhotoType): string {
      const name = `${randomBytes(16).toString('hex')}.${PHOTO_TYPES[type]}`
      mkdirSync(photosDir, { recursive: true })
      // `wx`: never overwrite, even on the one-in-2^128 chance of a repeated name.
      writeFileSync(pathOf(name), bytes, { flag: 'wx' })
      return name
    },

    /** The file's bytes and type, or null when it is not there. */
    read(name: string): { bytes: Uint8Array<ArrayBuffer>; type: PhotoType } | null {
      const type = photoTypeOf(name)
      const path = pathOf(name)
      if (type === null || !existsSync(path)) return null
      return { bytes: new Uint8Array(readFileSync(path)), type }
    },

    /** Removes the file; true when it is gone. A failure leaves it for the prune's orphan pass. */
    remove(name: string): boolean {
      try {
        rmSync(pathOf(name), { force: true })
        return true
      } catch {
        return false
      }
    },
  }
}

export type PhotoStore = ReturnType<typeof photoStore>
