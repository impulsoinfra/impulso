import type { ReactElement } from 'react'

// Brand palette (matches globals.css tokens)
export const COLORS = {
  primary: '#F0355C', // rosa
  accent: '#FF9D3D', // naranja
  ink: '#1B1A2E', // tinta
  cream: '#FBF7F2', // crema
  success: '#2FAE66',
  violet: '#7B6FD4',
  track: '#e9e4da',
  txt2: '#5F5E5A',
} as const

// Share formats (Instagram)
export const FORMATS = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
} as const
export type ShareFormat = keyof typeof FORMATS

export function parseFormat(value: string | null): ShareFormat {
  return value === 'post' || value === 'square' ? value : 'story'
}

export function truncate(text: string | null | undefined, max: number): string {
  const t = (text ?? '').trim()
  if (t.length <= max) return t
  return t.slice(0, max).trimEnd() + '…'
}

// Amounts are stored in whole pesos (numeric), NOT cents — do not divide.
export function formatMoney(n: number | string): string {
  return '$' + Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

export function initialsOf(name: string | null | undefined, fallback: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return fallback.slice(0, 2).toUpperCase()
}

// Four ascending bars, last one rosa. `unit` scales the whole mark.
export function AscendingBars({ unit = 4 }: { unit?: number }): ReactElement {
  const bars = [
    { h: 8, c: 'rgba(251,247,242,0.3)' },
    { h: 12, c: 'rgba(251,247,242,0.5)' },
    { h: 16, c: 'rgba(251,247,242,0.75)' },
    { h: 21, c: COLORS.primary },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: unit * 0.45 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ width: unit * 1.3, height: b.h * unit * 0.5, background: b.c, borderRadius: unit }} />
      ))}
    </div>
  )
}

// Logo lockup: bars + IMPULSO wordmark
export function Logo({ unit = 5, fontSize = 34 }: { unit?: number; fontSize?: number }): ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: unit * 2.6 }}>
      <AscendingBars unit={unit} />
      <div style={{ fontFamily: 'Anton', fontSize, letterSpacing: 1.5, color: COLORS.cream }}>IMPULSO</div>
    </div>
  )
}

// Decorative overlapping circles behind tinta backgrounds
export function BackgroundTexture(): ReactElement {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
      <div style={{ position: 'absolute', top: -140, right: -90, width: 460, height: 460, borderRadius: 999, background: COLORS.accent, opacity: 0.12 }} />
      <div style={{ position: 'absolute', bottom: -150, left: -80, width: 400, height: 400, borderRadius: 999, background: COLORS.primary, opacity: 0.15 }} />
      <div style={{ position: 'absolute', top: '38%', left: -60, width: 220, height: 220, borderRadius: 999, background: COLORS.violet, opacity: 0.08 }} />
    </div>
  )
}

// Circular avatar (photo) or initials fallback
export function Avatar({
  url,
  name,
  fallback,
  size,
  borderColor = COLORS.cream,
}: {
  url: string | null | undefined
  name: string | null | undefined
  fallback: string
  size: number
  borderColor?: string
}): ReactElement {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name ?? ''}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: 999, objectFit: 'cover', border: `${Math.max(3, size * 0.04)}px solid ${borderColor}` }}
      />
    )
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: 999,
        background: COLORS.primary,
        color: '#fff',
        fontFamily: 'Anton',
        fontSize: size * 0.4,
        border: `${Math.max(3, size * 0.04)}px solid ${borderColor}`,
      }}
    >
      {initialsOf(name, fallback)}
    </div>
  )
}
