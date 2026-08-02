'use client'

import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

// Swipeable image carousel for posts with multiple images, plus a fullscreen
// lightbox on click. Uses native CSS scroll-snap + relative scrollBy — robust
// under the desktop `body { zoom }` (no absolute pixel measurement).
export function PostCarousel({ images, alt }: { images: string[]; alt?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  // Index of the image shown fullscreen, or null when the lightbox is closed.
  const [lightbox, setLightbox] = useState<number | null>(null)

  // Keyboard nav + scroll lock while the lightbox is open.
  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowRight') setLightbox((v) => (v === null ? v : Math.min(images.length - 1, v + 1)))
      else if (e.key === 'ArrowLeft') setLightbox((v) => (v === null ? v : Math.max(0, v - 1)))
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightbox, images.length])

  function goTo(i: number) {
    const el = scrollerRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(images.length - 1, i))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }

  function onScroll() {
    const el = scrollerRef.current
    if (!el) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  // Fullscreen overlay, portaled to <body> so no ancestor (overflow/zoom/stacking) can clip it.
  const overlay =
    lightbox !== null && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightbox]}
              alt={`${alt ?? 'Imagen'} ${lightbox + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[95vw] object-contain select-none"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Imagen anterior"
                  disabled={lightbox === 0}
                  onClick={(e) => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)) }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-25"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  aria-label="Imagen siguiente"
                  disabled={lightbox === images.length - 1}
                  onClick={(e) => { e.stopPropagation(); setLightbox(Math.min(images.length - 1, lightbox + 1)) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-25"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm">
                  {lightbox + 1} / {images.length}
                </div>
              </>
            )}
          </div>,
          document.body
        )
      : null

  if (images.length === 0) return null

  // Single image: natural aspect ratio (no crop), click to open fullscreen.
  if (images.length === 1) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt={alt ?? 'Imagen de la publicación'}
          onClick={() => setLightbox(0)}
          className="w-full sm:max-w-[420px] h-auto rounded-lg border border-borde mb-2 cursor-zoom-in"
        />
        {overlay}
      </>
    )
  }

  return (
    <div className="relative mb-2 sm:max-w-[420px]">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-lg border border-borde [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`${alt ?? 'Imagen'} ${i + 1}`}
            onClick={() => setLightbox(i)}
            className="w-full shrink-0 snap-start aspect-square object-contain bg-[rgba(27,26,46,0.04)] cursor-zoom-in"
          />
        ))}
      </div>

      {/* Prev / next (desktop) */}
      <button
        type="button"
        aria-label="Imagen anterior"
        onClick={() => goTo(active - 1)}
        disabled={active === 0}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-tinta/60 hover:bg-tinta text-white transition-colors disabled:opacity-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        aria-label="Imagen siguiente"
        onClick={() => goTo(active + 1)}
        disabled={active === images.length - 1}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-full bg-tinta/60 hover:bg-tinta text-white transition-colors disabled:opacity-0"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Counter */}
      <div className="absolute top-2 right-2 bg-tinta/70 text-white text-[11px] font-medium px-2 py-0.5 rounded-full pointer-events-none">
        {active + 1}/{images.length}
      </div>

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a la imagen ${i + 1}`}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === active ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>

      {overlay}
    </div>
  )
}
