'use client'

import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Palette, Heart, Settings, LogOut, Loader2, Plus, DollarSign } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { usersApi, UserStats } from '@/lib/api'
import { useState, useEffect } from 'react'
import { CreatePostDialog } from '@/components/posts/create-post-dialog'
import { MyPostsList } from '@/components/posts/my-posts-list'
import { EarningsCard } from '@/components/dashboard/earnings-card'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar estadísticas del usuario
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const response = await usersApi.getUserStats()
        setStats(response.stats)
      } catch (err) {
        setError('Error al cargar estadísticas')
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const handleLogout = async () => {
    await signOut()
    // El ProtectedRoute redirigirá automáticamente al login
  }

  const handlePostCreated = () => {
    // Recargar estadísticas cuando se crea una nueva publicación
    if (stats) {
      setStats({
        ...stats,
        totalPosts: stats.totalPosts + 1
      })
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header del Dashboard */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido, {profile.name}!
            </h1>
            <p className="text-gray-600">
              Gestioná tu cuenta y contenido desde tu panel personal
            </p>
          </div>

          {/* Información del Usuario */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tipo de Cuenta</CardTitle>
                <Badge variant={profile.role === 'artist' ? 'default' : 'secondary'}>
                  {profile.role === 'artist' ? 'Artista' : 'Seguidor'}
                </Badge>
              </CardHeader>
              <CardContent>
                                  <div className="text-2xl font-bold">
                    {profile.role === 'artist' ? '🎨' : '❤️'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profile.role === 'artist' 
                      ? 'Compartí tu arte y recibí apoyo' 
                      : 'Apoyá a tus artistas favoritos'
                    }
                  </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.email}</div>
                <p className="text-xs text-muted-foreground">
                  Cuenta verificada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Miembro desde</CardTitle>
                <Badge variant="outline">
                  {new Date(profile.created_at).toLocaleDateString('es-AR')}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? stats.daysAsMember : '...'} días
                </div>
                <p className="text-xs text-muted-foreground">
                  En la comunidad
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {profile.role === 'artist' ? (
              <>
                <CreatePostDialog onPostCreated={handlePostCreated} />
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <Heart className="h-6 w-6" />
                  <span>Ver Seguidores</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <DollarSign className="h-6 w-6" />
                  <span>Ver Ganancias</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <Settings className="h-6 w-6" />
                  <span>Configuración</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col space-y-2 text-red-600 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-6 w-6" />
                  <span>Cerrar Sesión</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <Heart className="h-6 w-6" />
                  <span>Artistas Favoritos</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <Palette className="h-6 w-6" />
                  <span>Contenido Exclusivo</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <Settings className="h-6 w-6" />
                  <span>Configuración</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col space-y-2 text-red-600 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-6 w-6" />
                  <span>Cerrar Sesión</span>
                </Button>
              </>
            )}
          </div>

          {/* Contenido específico para artistas */}
          {profile.role === 'artist' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Ganancias */}
              <EarningsCard />
              
              {/* Estadísticas del usuario */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>
                    Tu actividad en la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 text-sm">
                      Error al cargar estadísticas
                    </div>
                  ) : stats ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Último acceso</span>
                        <span className="text-sm font-medium">
                          {new Date(stats.lastLogin).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estado</span>
                        <Badge variant="default">{stats.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total seguidores</span>
                        <span className="text-sm font-medium">{stats.totalSupporters}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ganancias totales</span>
                        <span className="text-sm font-medium text-green-600">
                          ${stats.totalEarnings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mis Publicaciones (solo para artistas) */}
          {profile.role === 'artist' && (
            <div className="mb-8">
              <MyPostsList />
            </div>
          )}

          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Próximos Pasos</CardTitle>
                <CardDescription>
                  Recomendaciones para mejorar tu experiencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.role === 'artist' ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Completá tu perfil de artista</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Subí tu primer contenido</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Conectá con tu comunidad</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Descubrí artistas</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Apoyá a tus favoritos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Accedé a contenido exclusivo</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
                <CardDescription>
                  Detalles de tu membresía
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rol</span>
                      <Badge variant={profile.role === 'artist' ? 'default' : 'secondary'}>
                        {profile.role === 'artist' ? 'Artista' : 'Seguidor'}
                      </Badge>
                    </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Miembro desde</span>
                    <span className="text-sm font-medium">
                      {new Date(profile.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Días en la comunidad</span>
                    <span className="text-sm font-medium">
                      {stats ? stats.daysAsMember : '...'} días
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
