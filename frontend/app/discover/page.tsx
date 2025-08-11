'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Heart, Users, Star, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { formatCurrency, formatNumber, getInitials } from '@/lib/utils'
import { ARTIST_CATEGORIES } from '@/lib/constants'
import { artistsApi, Artist, PaginatedResponse } from '@/lib/api'

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [currentPage, setCurrentPage] = useState(1)
  
  const [artists, setArtists] = useState<Artist[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar artistas
  const fetchArtists = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await artistsApi.getArtists({
        search: searchTerm || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        sortBy,
        page: currentPage,
        limit: 12
      })
      
      setArtists(response.data)
      setPagination(response.pagination)
    } catch (err) {
      setError('Error al cargar artistas')
      console.error('Error fetching artists:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar artistas cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1) // Resetear a la primera página
    fetchArtists()
  }, [searchTerm, selectedCategory, sortBy])

  // Cargar artistas cuando cambie la página
  useEffect(() => {
    if (currentPage > 1) {
      fetchArtists()
    }
  }, [currentPage])

  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Función para aplicar filtros
  const handleFilterChange = () => {
    setCurrentPage(1)
    fetchArtists()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Descubrí artistas</h1>
            <p className="text-gray-600">Encontrá creadores increíbles y apoyá su trabajo</p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar artistas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Categoría */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {ARTIST_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Ordenar por */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Más populares</SelectItem>
                  <SelectItem value="earnings">Mayor recaudación</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                  <SelectItem value="recent">Más recientes</SelectItem>
                </SelectContent>
              </Select>

              {/* Botón de filtros */}
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleFilterChange}
              >
                <Filter className="h-4 w-4" />
                Aplicar filtros
              </Button>
            </div>
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Cargando artistas...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar artistas</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchArtists} variant="outline">
                Intentar de nuevo
              </Button>
            </div>
          )}

          {/* Resultados */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100">
                      {/* Placeholder para imagen de artista */}
                      <div className="w-full h-full flex items-center justify-center">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={artist.avatar} alt={artist.name} />
                          <AvatarFallback>{getInitials(artist.name)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    {artist.isVerified && (
                      <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800">
                        <Star className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={artist.avatar} alt={artist.name} />
                        <AvatarFallback>{getInitials(artist.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-900 mb-1">{artist.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {artist.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {artist.bio || 'Sin descripción disponible'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(artist.totalSupporters)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-green-600">
                          {formatCurrency(artist.totalEarnings)}
                        </span>
                      </div>
                    </div>
                    
                    <Link href={`/artist/${artist.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Ver perfil
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Paginación */}
          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Anterior
                </Button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {!loading && !error && artists.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron artistas</h3>
              <p className="text-gray-600">Intentá ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 