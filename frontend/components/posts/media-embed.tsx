import { detectMediaEmbed, type MediaEmbedInfo } from '@/lib/media-embed'
import { PlatformIcon } from '@/components/brand/platform-icon'
import { ExternalLink } from 'lucide-react'

// Small "platform detected" label shown above an embedded player.
function PlatformChip({ info }: { info: MediaEmbedInfo }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-txt2 mb-1.5">
      <span className="w-4 h-4 rounded flex items-center justify-center text-white shrink-0" style={{ background: info.color }}>
        <PlatformIcon platform={info.platform} className="w-2.5 h-2.5" />
      </span>
      {info.label}
    </span>
  )
}

// Renders a media URL as an embedded player (YouTube, Vimeo, Spotify, SoundCloud)
// or, for platforms that don't embed cleanly (Instagram, TikTok, X, generic links),
// a branded link card with the platform's icon.
export function MediaEmbed({ url, title }: { url: string; title?: string | null }) {
  const info = detectMediaEmbed(url)

  if (info.embedUrl && info.kind === 'video') {
    return (
      <div className="mb-2">
        <PlatformChip info={info} />
        <div className="rounded-lg overflow-hidden aspect-video border border-borde">
          <iframe
            src={info.embedUrl}
            title={title ?? info.label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="w-full h-full"
          />
        </div>
      </div>
    )
  }

  if (info.embedUrl && info.kind === 'audio') {
    return (
      <div className="mb-2">
        <PlatformChip info={info} />
        <iframe
          src={info.embedUrl}
          title={title ?? info.label}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full rounded-lg border border-borde block"
          style={{ height: info.height ?? 152 }}
        />
      </div>
    )
  }

  // Link card — Instagram, TikTok, X, or any other link.
  const cta = info.platform === 'link' ? 'Abrir enlace' : `Ver en ${info.label}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 mb-2 p-2.5 rounded-lg border border-borde bg-white hover:bg-tinta/[0.02] transition-colors"
    >
      <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ background: info.color }}>
        <PlatformIcon platform={info.platform} className="w-[18px] h-[18px]" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold text-tinta">{cta}</span>
        <span className="block text-[11px] text-muted2 truncate">{url.replace(/^https?:\/\/(www\.)?/, '')}</span>
      </span>
      <ExternalLink className="w-4 h-4 text-muted2 shrink-0" />
    </a>
  )
}
