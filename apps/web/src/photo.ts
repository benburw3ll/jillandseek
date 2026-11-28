// A smaller copy of a photo for the read (#61). A phone's photo is far larger than a model
// needs, so the browser draws it down to 1568 pixels on its long side and sends that. Drawing
// also turns the picture the right way up and leaves its metadata behind; the server removes
// metadata again whatever it is sent. The photo saved with the dog is the owner's own file.

const LONG_SIDE = 1568
const QUALITY = 0.85

/** The photo drawn smaller as a JPEG, or the photo itself where the browser can't draw it. */
export async function smallerCopy(photo: Blob): Promise<Blob> {
  try {
    if (typeof createImageBitmap !== 'function') return photo
    const bitmap = await createImageBitmap(photo, { imageOrientation: 'from-image' })
    try {
      const scale = Math.min(1, LONG_SIDE / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (context === null) return photo
      // A JPEG has no transparency: a see-through photo is drawn on white, not black.
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const drawn = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/jpeg', QUALITY))
      return drawn !== null && drawn.type === 'image/jpeg' && drawn.size > 0 ? drawn : photo
    } finally {
      bitmap.close()
    }
  } catch {
    return photo
  }
}
