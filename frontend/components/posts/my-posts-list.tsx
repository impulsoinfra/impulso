'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Eye, Lock, Calendar, MessageCircle, Loader2 } from 'lucide-react'
import { postsApi } from '@/lib/api'
import { formatRelativeDate } from '@/lib/utils'

interface Post {
  id: string
  title: string
  content: string
  images: string[]
  videos: string[]
  mediaType: 'TEXT_ONLY' | 'IMAGE' | 'VIDEO' | 'MIXED'
  isExclusive: boolean
  tierRequired: string | null
  likes: number
  createdAt: string
  updatedAt: string
  _count: {
    comments: number
  }
}

// Función helper para extraer ID de video de YouTube
function extractYouTubeVideoId(url: string): string | null {
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

export function MyPostsList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await postsApi.getMyPosts()
      setPosts(data.posts || [])
    } catch (err) {
      setError('Error al cargar publicaciones')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar esta publicación?')) {
      return
    }

    try {
      await postsApi.deletePost(postId)
      setPosts(posts.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error al eliminar la publicación')
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading && posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Publicaciones</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Publicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={fetchPosts} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Publicaciones</CardTitle>
        <CardDescription>
          Gestioná tu contenido y conectá con tu comunidad
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg font-medium mb-2">No tenés publicaciones aún</p>
            <p className="text-sm">Creá tu primera publicación para empezar a conectar con tu comunidad</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      {post.isExclusive && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Exclusivo
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatRelativeDate(post.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post._count.comments} comentarios
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.likes} me gusta
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Imágenes */}
                {post.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">Imágenes:</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {post.videos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">Videos:</p>
                    <div className="space-y-2">
                      {post.videos.map((video, index) => {
                        const videoId = extractYouTubeVideoId(video)
                        return (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="w-16 h-12 bg-red-100 rounded flex items-center justify-center">
                              <span className="text-red-600 text-xs">🎥</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{video}</p>
                              {videoId && (
                                <img
                                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                  alt="Video thumbnail"
                                  className="w-12 h-8 object-cover rounded mt-1"
                                />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
