'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut } from 'lucide-react'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

interface HeaderProps {
  user?: {
    id: string
    name: string
    avatar?: string
    role: 'artist' | 'supporter' | 'admin'
  } | null
  onLogout?: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  
  // Solo usar useAuth cuando estemos en el cliente
  const authHook = useAuth()
  const { user: authUser, profile, signOut } = isClient ? authHook : { user: null, profile: null, signOut: () => Promise.resolve({ error: null }) }

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Usar el usuario del contexto de autenticación si no se proporciona uno
  const currentUser = user || (isClient && authUser && profile ? {
    id: authUser.id,
    name: profile.name,
    role: profile.role
  } : null)

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else if (isClient) {
      await signOut()
    }
  }

  const isActive = (path: string) => pathname === path

  const navigationItems = [
    { href: ROUTES.DISCOVER, label: 'Explorar' },
    { href: '/#como-funciona', label: 'Cómo funciona' },
    { href: '/#proyectos', label: 'Proyectos' },
  ]

  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-xl font-bold text-blue-900">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-gray-600 hover:text-blue-900 transition-colors',
                  isActive(item.href) && 'text-blue-900 font-medium'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link href={ROUTES.DASHBOARD}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Crear proyecto
                  </Button>
                </Link>
                <Link href={ROUTES.DASHBOARD}>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {currentUser.name}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="outline" className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4 mt-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-gray-600 hover:text-blue-900 transition-colors py-2',
                    isActive(item.href) && 'text-blue-900 font-medium'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {currentUser ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Link href={ROUTES.DASHBOARD}>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      {currentUser.name}
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Link href={ROUTES.LOGIN}>
                    <Button variant="outline" className="w-full">
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link href={ROUTES.REGISTER}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 