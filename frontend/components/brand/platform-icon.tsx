import { SiYoutube, SiVimeo, SiSpotify, SiSoundcloud, SiInstagram, SiTiktok, SiX } from 'react-icons/si'
import { Link2 } from 'lucide-react'
import type { MediaPlatform } from '@/lib/media-embed'
import type { ComponentType } from 'react'

const ICONS: Partial<Record<MediaPlatform, ComponentType<{ className?: string }>>> = {
  youtube: SiYoutube,
  vimeo: SiVimeo,
  spotify: SiSpotify,
  soundcloud: SiSoundcloud,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  twitter: SiX,
}

export function PlatformIcon({ platform, className }: { platform: MediaPlatform; className?: string }) {
  const Icon = ICONS[platform] ?? Link2
  return <Icon className={className} />
}
