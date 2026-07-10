'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, Eye } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { ImpulsoSymbol } from '@/components/brand/impulso-symbol'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  const authHook = useAuth()
  const { user: authUser, profile, signOut } = isClient
    ? authHook
    : { user: null, profile: null, signOut: () => Promise.resolve({ error: null }) }

  useEffect(() => { setIsClient(true) }, [])

  const currentUser = isClient && authUser && profile
    ? { id: authUser.id, name: profile.name, role: profile.role }
    : null
  const username = (profile as { username?: string } | null)?.username
  const onDashboard = pathname === ROUTES.DASHBOARD

  const isActive = (path: string) => pathname === path

  const navigationItems = [
    { href: ROUTES.DISCOVER, label: 'Explorar' },
    { href: '/#como-funciona', label: 'Cómo funciona' },
    { href: '/#creadores', label: 'Creadores' },
  ]

  return (
    <header className="bg-tinta sticky top-0 z-50">
      <div className="wrap">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <ImpulsoSymbol className="w-[26px] h-[26px] text-crema" />
            <span className="disp text-crema text-[17px] tracking-wide">IMPULSO</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition-colors',
                  isActive(item.href) ? 'text-crema font-medium' : 'text-[rgba(251,247,242,0.65)] hover:text-crema'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="text-sm text-[rgba(251,247,242,0.65)] hover:text-crema transition-colors"
                >
                  Hola, {currentUser.name.split(' ')[0]}
                </Link>
                {onDashboard && username ? (
                  <Link
                    href={`/${username}`}
                    target="_blank"
                    className="border border-[rgba(251,247,242,0.3)] text-crema hover:bg-[rgba(251,247,242,0.08)] rounded-lg px-3.5 py-2 text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver perfil
                  </Link>
                ) : (
                  <Link
                    href={ROUTES.DASHBOARD}
                    className="bg-rosa hover:bg-rosa-hover text-white rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
                  >
                    Mi panel
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  aria-label="Cerrar sesión"
                  className="text-[rgba(251,247,242,0.5)] hover:text-crema transition-colors p-1.5"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  className="text-sm text-[rgba(251,247,242,0.75)] hover:text-crema transition-colors px-2"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  className="bg-rosa hover:bg-rosa-hover text-white rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
                >
                  Crear mi perfil
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-crema p-1.5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menú"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[rgba(251,247,242,0.1)]">
            <nav className="flex flex-col gap-1 mt-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[rgba(251,247,242,0.7)] hover:text-crema transition-colors py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-[rgba(251,247,242,0.1)]">
                {currentUser ? (
                  <>
                    <Link
                      href={ROUTES.DASHBOARD}
                      className="bg-rosa hover:bg-rosa-hover text-white rounded-lg px-4 py-2.5 text-sm font-semibold text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Mi panel
                    </Link>
                    <button
                      onClick={() => { signOut(); setIsMobileMenuOpen(false) }}
                      className="text-[rgba(251,247,242,0.7)] hover:text-crema text-sm py-2 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={ROUTES.LOGIN}
                      className="border border-[rgba(251,247,242,0.35)] text-crema rounded-lg px-4 py-2.5 text-sm font-semibold text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href={ROUTES.REGISTER}
                      className="bg-rosa hover:bg-rosa-hover text-white rounded-lg px-4 py-2.5 text-sm font-semibold text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Crear mi perfil
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
