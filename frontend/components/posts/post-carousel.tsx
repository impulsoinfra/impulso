'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Swipeable image carousel for posts with multiple images. Uses native CSS
// scroll-snap + relative scrollBy — robust under the desktop `body { zoom }`
// (no absolute pixel measurement, unlike a JS-positioned slider).
export function PostCarousel({ images, alt }: { images: string[]; alt?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  if (images.length === 0) return null

  // Single image: show at natural aspect ratio (no crop), same as before.
  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0]}
        alt={alt ?? 'Imagen de la publicación'}
        className="w-full h-auto rounded-lg border border-borde mb-2"
      />
    )
  }

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

  return (
    <div className="relative mb-2">
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
            className="w-full shrink-0 snap-start aspect-square object-contain bg-[rgba(27,26,46,0.04)]"
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
    </div>
  )
}
