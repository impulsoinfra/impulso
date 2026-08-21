import { ImageResponse } from 'next/og'
import { loadOgFonts } from '@/lib/og/fonts'

// Default social preview for the homepage (and any route without its own
// opengraph-image). Branded 1200×630 card so shared links don't fall back to a
// random scraped image.
export const runtime = 'edge'
export const alt = 'Impulso — Apoyá a quienes te inspiran'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TINTA = '#1B1A2E'
const CREMA = '#FBF7F2'
const ROSA = '#F0355C'

function AscendingBars({ scale = 1 }: { scale?: number }) {
  const bars = [
    { h: 22 * scale, c: 'rgba(251,247,242,0.35)' },
    { h: 32 * scale, c: 'rgba(251,247,242,0.55)' },
    { h: 44 * scale, c: 'rgba(251,247,242,0.8)' },
    { h: 56 * scale, c: ROSA },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 * scale }}>
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'flex', width: 18 * scale, height: b.h, background: b.c, borderRadius: 9 * scale }} />
      ))}
    </div>
  )
}

export default async function Image() {
  const fonts = await loadOgFonts()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: TINTA,
          fontFamily: 'Inter',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Signature brand circles */}
        <div style={{ display: 'flex', position: 'absolute', top: -150, right: -120, width: 440, height: 440, borderRadius: 999, background: 'rgba(255,157,61,0.18)' }} />
        <div style={{ display: 'flex', position: 'absolute', bottom: -170, left: -110, width: 400, height: 400, borderRadius: 999, background: 'rgba(240,53,92,0.22)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <AscendingBars scale={1.5} />
          <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 96, letterSpacing: 3, color: CREMA }}>
            IMPULSO
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 42, fontWeight: 600, color: CREMA, marginTop: 34 }}>
          Apoyá a quienes te inspiran
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(251,247,242,0.6)', marginTop: 18 }}>
          Creadores independientes de Argentina · tuimpulso.ar
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
