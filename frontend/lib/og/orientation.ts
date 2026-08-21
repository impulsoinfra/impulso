// Satori / next-og render raw pixels and ignore EXIF orientation, so phone
// photos that carry a "rotate 90°" tag come out sideways in generated images
// (browsers honor EXIF, so the site itself looks fine). These helpers read the
// EXIF Orientation tag so callers can apply a CSS rotation to correct it.

// CSS rotation (degrees, clockwise) needed to display a given EXIF orientation
// upright. Mirrored orientations (2/4/5/7) are rare and left unrotated.
export function orientationToDeg(orientation: number): number {
  switch (orientation) {
    case 3: return 180
    case 6: return 90
    case 8: return 270
    default: return 0
  }
}

// Parses the EXIF Orientation (tag 0x0112) from a JPEG's APP1 segment.
// Returns 1 (normal) for non-JPEG, missing EXIF, or anything unparseable.
export function readJpegOrientation(bytes: Uint8Array): number {
  const len = bytes.length
  if (len < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return 1 // not a JPEG (no SOI)

  let offset = 2
  while (offset + 4 <= len) {
    if (bytes[offset] !== 0xff) { offset++; continue }
    const marker = bytes[offset + 1]
    if (marker === 0xda || marker === 0xd9) break // start of scan / end — EXIF is before this

    const segLen = (bytes[offset + 2] << 8) | bytes[offset + 3]
    if (segLen < 2) break

    if (marker === 0xe1) {
      const seg = offset + 4
      // "Exif\0\0"
      if (bytes[seg] === 0x45 && bytes[seg + 1] === 0x78 && bytes[seg + 2] === 0x69 && bytes[seg + 3] === 0x66) {
        const tiff = seg + 6
        const little = bytes[tiff] === 0x49 && bytes[tiff + 1] === 0x49
        const u16 = (o: number) => (little ? bytes[o] | (bytes[o + 1] << 8) : (bytes[o] << 8) | bytes[o + 1])
        const u32 = (o: number) =>
          little
            ? (bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16) | (bytes[o + 3] << 24)) >>> 0
            : ((bytes[o] << 24) | (bytes[o + 1] << 16) | (bytes[o + 2] << 8) | bytes[o + 3]) >>> 0

        const ifd0 = tiff + u32(tiff + 4)
        if (ifd0 + 2 > len) return 1
        const count = u16(ifd0)
        for (let i = 0; i < count; i++) {
          const entry = ifd0 + 2 + i * 12
          if (entry + 12 > len) break
          if (u16(entry) === 0x0112) return u16(entry + 8) // Orientation (SHORT)
        }
      }
      return 1
    }

    offset += 2 + segLen
  }
  return 1
}

// Fetches just enough of an image to read its EXIF orientation and returns the
// CSS rotation (deg) needed to show it upright. 0 on any error / no rotation.
export async function imageRotationDeg(url: string | null | undefined): Promise<number> {
  if (!url) return 0
  try {
    // EXIF sits at the start of the file; a small range is enough (servers that
    // ignore Range just send more, which is still fine).
    const res = await fetch(url, { headers: { Range: 'bytes=0-65535' } })
    if (!res.ok) return 0
    const bytes = new Uint8Array(await res.arrayBuffer())
    return orientationToDeg(readJpegOrientation(bytes))
  } catch {
    return 0
  }
}
