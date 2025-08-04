'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Heart, Users, Star } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { formatCurrency, formatNumber, getInitials } from '@/lib/utils'
import { ARTIST_CATEGORIES } from '@/lib/constants'

// Datos de ejemplo
const mockArtists = [
  {
    id: '1',
    name: 'Valeria López',
    category: 'Ilustración',
    avatar: '/images/artist-women.jpg',
    bio: 'Ilustradora freelance apasionada por crear arte que conecte con las emociones.',
    isVerified: true,
    totalSupporters: 1247,
    totalEarnings: 45000,
    artworks: ['/images/art1.jpg', '/images/art2.jpg']
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    category: 'Música',
    avatar: '/placeholder-user.jpg',
    bio: 'Compositor y guitarrista indie. Creando melodías que cuentan historias.',
    isVerified: false,
    totalSupporters: 856,
    totalEarnings: 32000,
    artworks: ['/images/art1.jpg', '/images/art2.jpg']
  },
  {
    id: '3',
    name: 'Ana Silva',
    category: 'Fotografía',
    avatar: '/placeholder-user.jpg',
    bio: 'Fotógrafa documental especializada en retratos urbanos y naturaleza.',
    isVerified: true,
    totalSupporters: 2341,
    totalEarnings: 78000,
    artworks: ['/images/art1.jpg', '/images/art2.jpg']
  },
  {
    id: '4',
    name: 'Miguel Torres',
    category: 'Video',
    avatar: '/placeholder-user.jpg',
    bio: 'Creador de contenido audiovisual y director de cortometrajes.',
    isVerified: false,
    totalSupporters: 567,
    totalEarnings: 15000,
    artworks: ['/images/art1.jpg', '/images/art2.jpg']
  },
  {
    id: '5',
    name: 'Laura Fernández',
    category: 'Escritura',
    avatar: '/placeholder-user.jpg',
    bio: 'Escritora de poesía y narrativa breve. Palabras que transforman realidades.',
    isVerified: true,
    totalSupporters: 1892,
    totalEarnings: 65000,
    artworks: ['/images/art1.jpg', '/images/art2.jpg']
  },
  {
    id: '6',
    name: 'Roberto Vega',
    category: 'Diseño',
    avatar: '/placeholder-user.jpg',
    bio: 'Diseñador gráfico y UX/UI. Creando experiencias visuales únicas.',
    isVerified: false,
    totalSupporters: 743,
    totalEarnings: 28000,
    artworks: ['/images/art1.jpg', '/images/art2.jpg']
  }
]

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  const filteredArtists = mockArtists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.bio.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || !selectedCategory || artist.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedArtists = [...filteredArtists].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.totalSupporters - a.totalSupporters
      case 'earnings':
        return b.totalEarnings - a.totalEarnings
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

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
                </SelectContent>
              </Select>

              {/* Botón de filtros */}
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Más filtros
              </Button>
            </div>
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedArtists.map((artist) => (
              <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100">
                    {artist.artworks[0] && (
                      <img
                        src={artist.artworks[0]}
                        alt={`Obra de ${artist.name}`}
                        className="w-full h-full object-cover"
                      />
                    )}
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
                    {artist.bio}
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

          {/* Paginación */}
          {sortedArtists.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Anterior</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">Siguiente</Button>
              </div>
            </div>
          )}

          {sortedArtists.length === 0 && (
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