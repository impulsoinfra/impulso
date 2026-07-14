'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface ProfileBannerProps {
  profileId: string
  bannerUrl: string | null
}

export function ProfileBanner({ profileId, bannerUrl: initialBannerUrl }: ProfileBannerProps) {
  const { user, getClient } = useAuth()
  const isOwner = !!user && user.id === profileId

  const inputRef = useRef<HTMLInputElement>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialBannerUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return

    const client = getClient()
    if (!client) return
    if (!file.type.startsWith('image/')) { setError('Elegí una imagen.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('La imagen supera los 5MB.'); return }

    setUploading(true)
    setError('')
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${profileId}/banner-${Date.now()}.${ext}`
      const { error: upErr } = await client.storage
        .from('banners')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (upErr) throw upErr

      const { data } = client.storage.from('banners').getPublicUrl(path)
      const url = data.publicUrl

      const { error: dbErr } = await client
        .from('profiles')
        .update({ banner_url: url })
        .eq('id', profileId)
      if (dbErr) throw dbErr

      setBannerUrl(url)
    } catch (err) {
      console.error('[banner upload]', err)
      setError('No se pudo subir el banner. Intentá de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative bg-tinta">
      {/* Banner image, or brand-pattern fallback (never empty gray) */}
      <div className="h-36 md:h-44 lg:h-72 overflow-hidden relative">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <>
            <span className="absolute -top-[70px] -right-[30px] w-[200px] h-[200px] rounded-full" style={{ background: 'rgba(255,157,61,0.18)' }} />
            <span className="absolute -bottom-[70px] left-[70px] w-[150px] h-[150px] rounded-full" style={{ background: 'rgba(240,53,92,0.22)' }} />
            <span className="absolute top-4 left-[220px] w-[70px] h-[70px] rounded-full" style={{ background: 'rgba(255,157,61,0.10)' }} />
          </>
        )}
      </div>

      {/* Camera edit control — owner only, aligned to content width */}
      {isOwner && (
        <div className="wrap absolute inset-x-0 top-3 pointer-events-none">
          <div className="max-w-[960px] mx-auto flex justify-end items-center gap-2">
            {error && (
              <span className="pointer-events-auto text-[11px] text-white bg-red-600/85 rounded px-2 py-1">
                {error}
              </span>
            )}
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              aria-label="Cambiar banner"
              className="pointer-events-auto w-8 h-8 rounded-full bg-[rgba(27,26,46,0.55)] hover:bg-[rgba(27,26,46,0.8)] text-crema flex items-center justify-center transition-colors disabled:opacity-70"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        </div>
      )}
    </div>
  )
}
