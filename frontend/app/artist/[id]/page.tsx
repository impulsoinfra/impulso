'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Share2, 
  Instagram, 
  Twitter, 
  Youtube, 
  MessageCircle,
  Calendar,
  DollarSign,
  Users,
  Star,
  UserPlus,
  UserMinus
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { formatCurrency, formatNumber, getInitials, calculatePercentage } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

// Datos de ejemplo - en una app real vendrían de una API
const mockArtist = {
  id: '1',
  name: 'Valeria López',
  bio: '¡Hola! Soy una ilustradora freelance apasionada por crear arte que conecte con las emociones. Me especializo en ilustración digital y tradicional, creando piezas únicas que cuentan historias. Si te gusta mi trabajo, tu apoyo me ayuda a seguir creando y explorando nuevas técnicas.',
  category: 'Ilustración',
  avatar: '/images/artist-women.jpg',
  isVerified: true,
  totalSupporters: 1247,
  totalEarnings: 45000,
  goal: 80000, // Objetivo de recaudación
  socialLinks: {
    instagram: 'https://instagram.com/valerialopez',
    twitter: 'https://twitter.com/valerialopez',
    youtube: 'https://youtube.com/valerialopez'
  },
  artworks: [
    { id: '1', image: '/images/art1.jpg', title: 'Serenidad', likes: 234 },
    { id: '2', image: '/images/art2.jpg', title: 'Libertad', likes: 189 },
    { id: '3', image: '/images/art3.jpg', title: 'Esperanza', likes: 156 },
  ],
  supportOptions: [
    {
      id: '1',
      name: 'Apoyo Básico',
      amount: 500,
      description: 'Un pequeño gesto que hace una gran diferencia',
      benefits: ['Agradecimiento personal en redes sociales', 'Acceso a contenido exclusivo por 1 mes', 'Nombre en la lista de colaboradores'],
      supporters: 847
    },
    {
      id: '2',
      name: 'Apoyo Especial',
      amount: 1500,
      description: 'Apoyo significativo para proyectos especiales',
      benefits: ['Agradecimiento especial en redes sociales', 'Acceso a contenido exclusivo por 3 meses', 'Menciones en videos/livestreams', 'Acceso a comunidad privada'],
      supporters: 324
    },
    {
      id: '3',
      name: 'Apoyo Premium',
      amount: 3000,
      description: 'Apoyo máximo para proyectos ambiciosos',
      benefits: ['Agradecimiento destacado en redes sociales', 'Acceso a contenido exclusivo por 6 meses', 'Comisión personalizada (arte a pedido)', 'Menciones especiales en todos los proyectos', 'Acceso prioritario a eventos y workshops'],
      supporters: 76
    },
    {
      id: '4',
      name: 'Apoyo Personalizado',
      amount: 0,
      description: 'Elegí tu propio monto de apoyo',
      benefits: ['Agradecimiento personal', 'Acceso a contenido exclusivo según el monto'],
      supporters: 0,
      isCustom: true
    }
  ],
  posts: [
    {
      id: '1',
      title: 'Nuevo proyecto en proceso',
      content: 'Estoy trabajando en una nueva serie de ilustraciones inspiradas en la naturaleza urbana. ¡Pronto compartiré más detalles!',
      createdAt: new Date('2024-01-15'),
      likes: 45,
      isExclusive: false
    },
    {
      id: '2',
      title: 'Proceso de creación - Detrás de escena',
      content: 'Comparto con ustedes el proceso completo de mi última ilustración, desde el boceto inicial hasta el resultado final.',
      createdAt: new Date('2024-01-10'),
      likes: 89,
      isExclusive: true
    }
  ]
}

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isSupporting, setIsSupporting] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const handleSupport = async () => {
    if (!selectedOption) return
    
    const selectedSupportOption = mockArtist.supportOptions.find(option => option.id === selectedOption)
    if (!selectedSupportOption) return
    
    const amount = selectedSupportOption.isCustom ? parseFloat(customAmount) : selectedSupportOption.amount
    
    if (selectedSupportOption.isCustom && (!amount || amount <= 0)) {
      alert('Por favor, ingresá un monto válido')
      return
    }
    
    setIsSupporting(true)
    try {
      // Aquí iría la integración con MercadoPago
      console.log(`Procesando pago de $${amount} para ${mockArtist.name}`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Simular éxito
      alert(`¡Gracias por tu apoyo de $${amount}!`)
    } catch (error) {
      alert('Error al procesar el pago')
    } finally {
      setIsSupporting(false)
    }
  }

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${mockArtist.name} en Impulso`,
        text: `Conocé el trabajo de ${mockArtist.name}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado al portapapeles')
    }
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    // Aquí iría la lógica para seguir/dejar de seguir en la API
    if (!isFollowing) {
      alert(`¡Ahora estás siguiendo a ${mockArtist.name}!`)
    } else {
      alert(`Dejaste de seguir a ${mockArtist.name}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Header del artista */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar y info básica */}
              <div className="flex-shrink-0">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={mockArtist.avatar} alt={mockArtist.name} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(mockArtist.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{mockArtist.name}</h1>
                  {mockArtist.isVerified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Star className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  <Badge variant="outline">{mockArtist.category}</Badge>
                </div>
                
                <p className="text-gray-600 mb-4 max-w-2xl">{mockArtist.bio}</p>
                
                {/* Estadísticas */}
                <div className="space-y-4 mb-4">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatNumber(mockArtist.totalSupporters)} seguidores
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatCurrency(mockArtist.totalEarnings)} recaudados
                      </span>
                    </div>
                  </div>
                  
                  {/* Barra de progreso del objetivo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Objetivo de recaudación</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(mockArtist.totalEarnings)} / {formatCurrency(mockArtist.goal)}
                      </span>
                    </div>
                    <Progress 
                      value={calculatePercentage(mockArtist.totalEarnings, mockArtist.goal)} 
                      className="h-3"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {calculatePercentage(mockArtist.totalEarnings, mockArtist.goal)}% completado
                      </span>
                      <span className={calculatePercentage(mockArtist.totalEarnings, mockArtist.goal) >= 100 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        {calculatePercentage(mockArtist.totalEarnings, mockArtist.goal) >= 100 
                          ? '¡Objetivo alcanzado!' 
                          : `${formatCurrency(mockArtist.goal - mockArtist.totalEarnings)} restantes`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Redes sociales */}
                <div className="flex gap-3">
                  {mockArtist.socialLinks.instagram && (
                    <a
                      href={mockArtist.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-pink-600 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {mockArtist.socialLinks.twitter && (
                    <a
                      href={mockArtist.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {mockArtist.socialLinks.youtube && (
                    <a
                      href={mockArtist.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
              
              {/* Acciones */}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className={isFollowing ? "border-red-500 text-red-600 hover:bg-red-50" : "bg-blue-600 hover:bg-blue-700 text-white"}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Dejar de seguir
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Seguir
                    </>
                  )}
                </Button>
                <Button onClick={shareProfile} variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </div>
          </div>
          
          {/* Contenido principal */}
          <Tabs defaultValue="artwork" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="artwork">Obras</TabsTrigger>
              <TabsTrigger value="support">Apoyar</TabsTrigger>
              <TabsTrigger value="posts">Publicaciones</TabsTrigger>
            </TabsList>
            
            <TabsContent value="artwork" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockArtist.artworks.map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{artwork.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Heart className="w-4 h-4" />
                        {artwork.likes}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="support" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Apoyá a {mockArtist.name}</h2>
                <p className="text-gray-600">Elegí un monto de apoyo y recibí beneficios exclusivos</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockArtist.supportOptions.map((option) => (
                  <Card 
                    key={option.id} 
                    className={`cursor-pointer transition-all ${
                      selectedOption === option.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedOption(option.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-xl">{option.name}</CardTitle>
                      {option.isCustom ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            placeholder="Monto personalizado"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="text-center text-lg font-bold"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <p className="text-sm text-gray-600">Elegí tu monto</p>
                        </div>
                      ) : (
                        <div className="text-3xl font-bold text-blue-600">
                          {formatCurrency(option.amount)}
                        </div>
                      )}
                      <p className="text-gray-600 text-sm">{option.description}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {option.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      {!option.isCustom && (
                        <div className="text-sm text-gray-600">
                          {option.supporters} personas ya apoyaron
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {selectedOption && (
                <div className="text-center">
                  <Button 
                    onClick={handleSupport}
                    disabled={isSupporting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    {isSupporting ? 'Procesando...' : 'Apoyar ahora'}
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Serás redirigido a MercadoPago para completar el pago
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="posts" className="space-y-6">
              <div className="space-y-4">
                {mockArtist.posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{post.title}</h3>
                          {post.isExclusive && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Exclusivo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {post.createdAt.toLocaleDateString('es-AR')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{post.content}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 