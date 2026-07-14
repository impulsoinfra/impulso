'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Loader2, Check } from 'lucide-react'

interface ShareOptionBase {
  key: string
  label: string
  hint?: string
}
// An image option fetches a generated PNG (share sheet on mobile / download on desktop).
export type ImageShareOption = ShareOptionBase & { kind?: 'image'; url: string; filename: string }
// A link option shares/copies a plain URL (triggers the OG preview in WhatsApp/Telegram/etc.).
export type LinkShareOption = ShareOptionBase & { kind: 'link'; link: string }
export type ShareOption = ImageShareOption | LinkShareOption

// On mobile (Web Share API level 2) opens the native share sheet so the creator
// can post straight to Instagram; on desktop it downloads the PNG to upload manually.
async function shareOrDownload(opt: ImageShareOption) {
  const res = await fetch(opt.url)
  if (!res.ok) throw new Error('No se pudo generar la imagen')
  const blob = await res.blob()
  const file = new File([blob], opt.filename, { type: 'image/png' })

  const nav = typeof navigator !== 'undefined' ? navigator : undefined
  if (nav?.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'Impulso' })
      return
    } catch (err) {
      // User cancelled the native sheet — don't fall through to a download
      if (err instanceof DOMException && err.name === 'AbortError') return
      // Any other failure: fall back to download
    }
  }

  const objUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objUrl
  a.download = opt.filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objUrl)
}

// Shares a plain link: native share sheet on mobile (→ OG preview in WhatsApp/etc.),
// clipboard copy on desktop. Relative links are resolved against the current origin
// so it also works on preview deploys, not only the production domain.
async function shareLink(opt: LinkShareOption) {
  const url =
    opt.link.startsWith('http') || typeof window === 'undefined'
      ? opt.link
      : window.location.origin + opt.link

  const nav = typeof navigator !== 'undefined' ? navigator : undefined
  if (nav?.share) {
    try {
      await nav.share({ url, title: 'Impulso' })
      return
    } catch (err) {
      // User cancelled the native sheet — don't also copy
      if (err instanceof DOMException && err.name === 'AbortError') return
      // Any other failure: fall back to clipboard
    }
  }
  await navigator.clipboard.writeText(url)
}

// Where the menu grows from, relative to the trigger. `end` (default) anchors the
// menu's right edge to the trigger (grows left) — right for triggers near the right
// edge, like the compact per-post icon. `responsive` grows right on mobile and left
// on desktop — for a trigger sitting mid-row (e.g. the profile "Compartir", which has
// "Apoyar" to its right) so its menu doesn't overflow the left edge on narrow screens.
const ALIGN_CLASS = {
  start: 'left-0',
  end: 'right-0',
  responsive: 'left-0 lg:left-auto lg:right-0',
} as const

export function ShareMenu({
  options,
  triggerLabel = 'Compartir',
  triggerClassName,
  compact = false,
  align = 'end',
}: {
  options: ShareOption[]
  triggerLabel?: string
  triggerClassName?: string
  compact?: boolean
  align?: keyof typeof ALIGN_CLASS
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function handle(opt: ShareOption) {
    setBusy(opt.key)
    setError(false)
    try {
      if (opt.kind === 'link') {
        await shareLink(opt)
      } else {
        await shareOrDownload(opt)
      }
      setDone(opt.key)
      setTimeout(() => setDone(null), 2000)
    } catch {
      setError(true)
    } finally {
      setBusy(null)
    }
  }

  const triggerClass = compact
    ? triggerClassName ?? 'text-muted2 hover:text-rosa shrink-0 p-1 transition-colors'
    : triggerClassName ??
      'inline-flex items-center gap-2 border border-borde text-tinta hover:bg-tinta/[0.04] rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors'

  return (
    // Plain absolute-positioned popover (no portal / floating-ui): stays correctly
    // anchored under the desktop `body { zoom: 1.25 }`, which double-scales the
    // measured coordinates Radix relies on and pushes its menu off-screen.
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? 'Compartir' : undefined}
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
      >
        <Share2 className="w-4 h-4" />
        {!compact && triggerLabel}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute ${ALIGN_CLASS[align]} top-full mt-2 z-50 w-60 rounded-lg border border-borde bg-white shadow-lg py-1`}
        >
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted2">
            Compartir en redes
          </p>
          <div className="h-px bg-borde mx-1 mb-1" />
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              role="menuitem"
              onClick={() => handle(opt)}
              className="w-full flex items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-tinta/[0.04] transition-colors"
            >
              <span className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium text-tinta">{opt.label}</span>
                {opt.hint && <span className="text-[11px] text-muted2 truncate">{opt.hint}</span>}
              </span>
              {busy === opt.key ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-muted2" />
              ) : done === opt.key ? (
                <Check className="w-3.5 h-3.5 text-exito shrink-0" />
              ) : null}
            </button>
          ))}
          {error && (
            <p className="text-[11px] text-red-500 px-3 py-1">No se pudo compartir. Probá de nuevo.</p>
          )}
        </div>
      )}
    </div>
  )
}
