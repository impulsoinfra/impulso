import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env['SUPABASE_URL']
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export interface YouTubeVideoInfo {
  videoId: string
  thumbnail: string
  title: string
  duration: string
  isValid: boolean
}

// Función para subir imagen a Supabase Storage
export async function uploadImage(
  file: Buffer,
  fileName: string,
  artistId: string
): Promise<UploadResult> {
  try {
    const filePath = `posts/${artistId}/${Date.now()}_${fileName}`
    
    const { error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        contentType: 'image/jpeg',
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

// Función para validar y extraer información de URL de YouTube
export function validateYouTubeUrl(url: string): YouTubeVideoInfo {
  const defaultResult: YouTubeVideoInfo = {
    videoId: '',
    thumbnail: '',
    title: '',
    duration: '',
    isValid: false
  }

  try {
    // Patrones de URL de YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ]

    let videoId = ''
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        videoId = match[1] || ''
        break
      }
    }

    if (!videoId) {
      return defaultResult
    }

    // Generar thumbnail y URL de embed
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    // const embedUrl = `https://www.youtube.com/embed/${videoId}`

    return {
      videoId,
      thumbnail,
      title: `Video de YouTube`,
      duration: '',
      isValid: true
    }
  } catch (error) {
    return defaultResult
  }
}

// Función para determinar el tipo de contenido basado en los medios
export function determineMediaType(
  _hasText: boolean,
  hasImages: boolean,
  hasVideos: boolean
): 'TEXT_ONLY' | 'IMAGE' | 'VIDEO' | 'MIXED' {
  if (hasImages && hasVideos) return 'MIXED'
  if (hasImages) return 'IMAGE'
  if (hasVideos) return 'VIDEO'
  return 'TEXT_ONLY'
}

// Función para limpiar URLs de imágenes (eliminar duplicados y URLs inválidas)
export function cleanImageUrls(urls: string[]): string[] {
  return urls
    .filter(url => url && url.trim().length > 0)
    .filter(url => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    })
    .filter((url, index, self) => self.indexOf(url) === index) // Eliminar duplicados
}

// Función para limpiar URLs de videos (solo YouTube válidos)
export function cleanVideoUrls(urls: string[]): string[] {
  return urls
    .filter(url => url && url.trim().length > 0)
    .filter(url => validateYouTubeUrl(url).isValid)
    .filter((url, index, self) => self.indexOf(url) === index) // Eliminar duplicados
}
