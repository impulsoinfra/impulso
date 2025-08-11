'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { postsApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface CreatePostDialogProps {
  onPostCreated: () => void
}

export function CreatePostDialog({ onPostCreated }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    images: [] as string[],
    isExclusive: false,
    tierRequired: ''
  })
  
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      await postsApi.createPost(formData)
      
      toast({
        title: "¡Éxito!",
        description: "Publicación creada exitosamente"
      })
      
      setFormData({
        title: '',
        content: '',
        images: [],
        isExclusive: false,
        tierRequired: ''
      })
      
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Publicación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Publicación</DialogTitle>
          <DialogDescription>
            Compartí tu arte con tu comunidad. Podés hacerla exclusiva para ciertos niveles de apoyo.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              placeholder="Compartí tu arte, proceso creativo, o lo que quieras con tu comunidad..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500">
              {formData.content.length}/2000 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">URLs de Imágenes (opcional)</Label>
            <Input
              id="images"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.images.join(', ')}
              onChange={(e) => handleInputChange('images', e.target.value.split(',').map(url => url.trim()).filter(Boolean))}
            />
            <p className="text-xs text-gray-500">
              Separá múltiples URLs con comas
            </p>
          </div>

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
