'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/lib/constants'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = ROUTES.LOGIN 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        // Si el usuario ya está autenticado y no debería estar en esta página
        router.push(ROUTES.DASHBOARD)
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no requiere autenticación y el usuario no está autenticado, mostrar contenido
  if (!requireAuth && !user) {
    return <>{children}</>
  }

  // Si requiere autenticación y el usuario está autenticado, mostrar contenido
  if (requireAuth && user) {
    return <>{children}</>
  }

  // En cualquier otro caso, no mostrar nada (se está redirigiendo)
  return null
}
