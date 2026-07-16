// Detects the hosting platform of a media URL and, when possible, builds an
// embeddable player URL. Platforms that don't embed cleanly (Instagram, TikTok,
// X) return embedUrl=null and are shown as a branded link card instead.

export type MediaPlatform =
  | 'youtube'
  | 'vimeo'
  | 'spotify'
  | 'soundcloud'
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'link'

export interface MediaEmbedInfo {
  platform: MediaPlatform
  label: string // human name, e.g. "YouTube"
  color: string // brand color for the icon chip
  kind: 'video' | 'audio' | 'link'
  embedUrl: string | null // iframe src when embeddable
  height?: number // fixed height for audio embeds
}

export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export function detectMediaEmbed(url: string): MediaEmbedInfo {
  const u = (url ?? '').trim()

  const yt = getYouTubeId(u)
  if (yt) {
    return { platform: 'youtube', label: 'YouTube', color: '#FF0000', kind: 'video', embedUrl: `https://www.youtube.com/embed/${yt}` }
  }

  const vimeo = u.match(/vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)/)
  if (vimeo) {
    return { platform: 'vimeo', label: 'Vimeo', color: '#1AB7EA', kind: 'video', embedUrl: `https://player.vimeo.com/video/${vimeo[1]}` }
  }

  const spotify = u.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/)
  if (spotify) {
    const [, type, id] = spotify
    const compact = type === 'track' || type === 'episode'
    return { platform: 'spotify', label: 'Spotify', color: '#1DB954', kind: 'audio', embedUrl: `https://open.spotify.com/embed/${type}/${id}`, height: compact ? 152 : 352 }
  }

  if (/soundcloud\.com\/[^/]+\/.+/.test(u)) {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&color=%23FF5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`
    return { platform: 'soundcloud', label: 'SoundCloud', color: '#FF5500', kind: 'audio', embedUrl: src, height: 166 }
  }

  if (/(?:^|\.)instagram\.com\//.test(u)) {
    return { platform: 'instagram', label: 'Instagram', color: '#E4405F', kind: 'link', embedUrl: null }
  }
  if (/(?:^|\.)tiktok\.com\//.test(u)) {
    return { platform: 'tiktok', label: 'TikTok', color: '#010101', kind: 'link', embedUrl: null }
  }
  if (/(?:^|\.)(?:twitter|x)\.com\//.test(u)) {
    return { platform: 'twitter', label: 'X', color: '#000000', kind: 'link', embedUrl: null }
  }

  return { platform: 'link', label: 'este enlace', color: '#5F5E5A', kind: 'link', embedUrl: null }
}
