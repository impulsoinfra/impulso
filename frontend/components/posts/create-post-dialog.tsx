'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Image, Video, FileText, X, Loader2, Upload, Youtube } from 'lucide-react'
import { postsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface CreatePostDialogProps {
  onPostCreated: () => void
}

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('text')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    images: [] as string[],
    videos: [] as string[],
    isExclusive: false,
    tierRequired: ''
  })
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || (!formData.content.trim() && mediaItems.length === 0)) {
      toast({
        title: "Error",
        description: "Por favor completa el título y al menos un tipo de contenido",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      // Preparar datos para la API
      const postData = {
        ...formData,
        images: mediaItems.filter(item => item.type === 'image').map(item => item.url),
        videos: mediaItems.filter(item => item.type === 'video').map(item => item.url)
      }
      
      await postsApi.createPost(postData)
      
      toast({
        title: "¡Éxito!",
        description: "Publicación creada exitosamente"
      })
      
      // Resetear formulario
      setFormData({
        title: '',
        content: '',
        images: [],
        videos: [],
        isExclusive: false,
        tierRequired: ''
      })
      setMediaItems([])
      setImageUrl('')
      setVideoUrl('')
      setImageFile(null)
      setActiveTab('text')
      
      setOpen(false)
      onPostCreated()
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la publicación",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addImageUrl = () => {
    if (imageUrl.trim() && isValidImageUrl(imageUrl)) {
      const newImage: MediaItem = {
        id: Date.now().toString(),
        type: 'image',
        url: imageUrl.trim()
      }
      setMediaItems(prev => [...prev, newImage])
      setImageUrl('')
    }
  }

  const addVideoUrl = () => {
    if (videoUrl.trim() && isValidYouTubeUrl(videoUrl)) {
      const videoId = extractYouTubeVideoId(videoUrl)
      if (videoId) {
        const newVideo: MediaItem = {
          id: Date.now().toString(),
          type: 'video',
          url: videoUrl.trim(),
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
        setMediaItems(prev => [...prev, newVideo])
        setVideoUrl('')
      }
    }
  }

  const removeMediaItem = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      // Aquí podrías implementar la subida real a Supabase Storage
      // Por ahora, creamos una URL temporal
      const tempUrl = URL.createObjectURL(file)
      const newImage: MediaItem = {
        id: Date.now().toString(),
        type: 'image',
        url: tempUrl
      }
      setMediaItems(prev => [...prev, newImage])
    }
  }

  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url)
      return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) !== null
    } catch {
      return false
    }
  }

  const isValidYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  const extractYouTubeVideoId = (url: string): string | null => {
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

  const getContentPreview = () => {
    if (formData.content.trim()) return formData.content
    if (mediaItems.length > 0) return `${mediaItems.length} archivo(s) adjunto(s)`
    return 'Sin contenido'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Publicación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Publicación</DialogTitle>
          <DialogDescription>
            Compartí tu arte con tu comunidad. Podés combinar texto, imágenes y videos de YouTube.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Título de tu publicación"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 caracteres
            </p>
          </div>

          {/* Tabs para diferentes tipos de contenido */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Texto
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Imágenes
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            {/* Contenido de texto */}
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  placeholder="Compartí tu arte, proceso creativo, o lo que quieras con tu comunidad..."
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={6}
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500">
                  {formData.content.length}/2000 caracteres
                </p>
              </div>
            </TabsContent>

            {/* Subida de imágenes */}
            <TabsContent value="images" className="space-y-4">
              <div className="space-y-4">
                {/* Subida de archivo */}
                <div className="space-y-2">
                  <Label>Subir imagen</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Seleccionar archivo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="text-sm text-gray-500">
                      JPG, PNG, GIF hasta 5MB
                    </span>
                  </div>
                </div>

                {/* URL de imagen */}
                <div className="space-y-2">
                  <Label>URL de imagen</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button type="button" onClick={addImageUrl} variant="outline">
                      Agregar
                    </Button>
                  </div>
                </div>

                {/* Vista previa de imágenes */}
                {mediaItems.filter(item => item.type === 'image').length > 0 && (
                  <div className="space-y-2">
                    <Label>Imágenes agregadas</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {mediaItems
                        .filter(item => item.type === 'image')
                        .map((item) => (
                          <div key={item.id} className="relative group">
                            <img
                              src={item.url}
                              alt="Preview"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeMediaItem(item.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Videos de YouTube */}
            <TabsContent value="videos" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>URL de video de YouTube</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <Button type="button" onClick={addVideoUrl} variant="outline">
                      <Youtube className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Solo se aceptan URLs de YouTube válidas
                  </p>
                </div>

                {/* Vista previa de videos */}
                {mediaItems.filter(item => item.type === 'video').length > 0 && (
                  <div className="space-y-2">
                    <Label>Videos agregados</Label>
                    <div className="space-y-2">
                      {mediaItems
                        .filter(item => item.type === 'video')
                        .map((item) => (
                          <div key={item.id} className="relative group border rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <Youtube className="h-5 w-5 text-red-600" />
                              <span className="text-sm truncate">{item.url}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeMediaItem(item.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {item.thumbnail && (
                              <img
                                src={item.thumbnail}
                                alt="Video thumbnail"
                                className="w-full h-20 object-cover rounded mt-2"
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Vista previa del contenido */}
          <Card>
            <CardContent className="pt-4">
              <Label className="text-sm font-medium">Vista previa del contenido</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {getContentPreview()}
                </p>
                {mediaItems.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {mediaItems.map((item) => (
                      <Badge key={item.id} variant="secondary" className="text-xs">
                        {item.type === 'image' ? '🖼️' : '🎥'} {item.type}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Opciones de exclusividad */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isExclusive"
                checked={formData.isExclusive}
                onCheckedChange={(checked) => handleInputChange('isExclusive', checked)}
              />
              <Label htmlFor="isExclusive">Contenido Exclusivo</Label>
            </div>

            {formData.isExclusive && (
              <div className="space-y-2">
                <Label htmlFor="tierRequired">Nivel de Apoyo Requerido</Label>
                <Input
                  id="tierRequired"
                  placeholder="ID del nivel de apoyo (opcional)"
                  value={formData.tierRequired}
                  onChange={(e) => handleInputChange('tierRequired', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Dejá vacío para hacer el contenido exclusivo para todos los que te apoyen
                </p>
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creando...
              </>
            ) : (
              'Crear Publicación'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
