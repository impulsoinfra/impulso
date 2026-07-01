import { SupabaseClient } from '@supabase/supabase-js'
import { getBrowserClient } from './supabase-browser'

// Reuse the single browser client — never create a second instance.
function getSupabaseClient(): SupabaseClient {
  const client = getBrowserClient()
  if (!client) {
    throw new Error(
      'Supabase client no disponible. Verificá NEXT_PUBLIC_SUPABASE_URL y ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY (en producción, en Vercel > Settings > Environment Variables).'
    )
  }
  return client
}

export interface UploadResult {
  url: string
  path: string
  error?: string
}

// Función para subir imagen a Supabase Storage
export async function uploadImage(
  file: File,
  artistId: string
): Promise<UploadResult> {
  try {
    const supabase = getSupabaseClient()
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `posts/${artistId}/${fileName}`
    
    const { error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return {
        url: '',
        path: '',
        error: `Error al subir imagen: ${error.message}`
      }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return {
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error) {
    return {
      url: '',
      path: '',
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Función para eliminar imagen de Supabase Storage
export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { error } = await supabase.storage
      .from('post-images')
      .remove([filePath])

    if (error) {
      console.error('Error al eliminar imagen:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error inesperado al eliminar imagen:', error)
    return false
  }
}

// Función para validar URL de YouTube
export function validateYouTubeUrl(url: string): boolean {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ]
  return patterns.some(pattern => pattern.test(url))
}

// Función para extraer ID de video de YouTube
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Función para obtener thumbnail de YouTube
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'mqdefault' | 'hqdefault' | 'maxresdefault' = 'mqdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

// Función para obtener URL de embed de YouTube
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}
