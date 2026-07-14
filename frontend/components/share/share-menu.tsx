'use client'

import { useState } from 'react'
import { Share2, Loader2, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

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

export function ShareMenu({
  options,
  triggerLabel = 'Compartir',
  triggerClassName,
  compact = false,
}: {
  options: ShareOption[]
  triggerLabel?: string
  triggerClassName?: string
  compact?: boolean
}) {
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState(false)

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

  const trigger = compact ? (
    <button
      type="button"
      aria-label="Compartir"
      className={triggerClassName ?? 'text-muted2 hover:text-rosa shrink-0 p-1 transition-colors'}
    >
      <Share2 className="w-4 h-4" />
    </button>
  ) : (
    <button
      type="button"
      className={
        triggerClassName ??
        'inline-flex items-center gap-2 border border-borde text-tinta hover:bg-tinta/[0.04] rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors'
      }
    >
      <Share2 className="w-4 h-4" />
      {triggerLabel}
    </button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Compartir en redes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.key}
            onSelect={(e) => {
              e.preventDefault()
              handle(opt)
            }}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-[13px] font-medium">{opt.label}</span>
              {opt.hint && <span className="text-[11px] text-muted2">{opt.hint}</span>}
            </div>
            {busy === opt.key ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : done === opt.key ? (
              <Check className="w-3.5 h-3.5 text-exito shrink-0" />
            ) : null}
          </DropdownMenuItem>
        ))}
        {error && <p className="text-[11px] text-red-500 px-2 py-1">No se pudo generar la imagen. Probá de nuevo.</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
