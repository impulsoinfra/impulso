import Link from 'next/link'
import { APP_NAME, ROUTES } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Brand Information */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">UC</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{APP_NAME} Crowdfund</span>
            </div>
            <p className="text-gray-700 text-sm mb-4">
              Financiá proyectos. Impactá tu región.
            </p>
            <div className="text-gray-700 text-sm">
              <Link href="/direccion" className="hover:text-gray-900">Dirección</Link>
              <span className="mx-2">·</span>
              <Link href="/contacto" className="hover:text-gray-900">Contacto</Link>
              <span className="mx-2">·</span>
              <Link href={ROUTES.SUPPORT} className="hover:text-gray-900">Soporte</Link>
            </div>
          </div>

          {/* Middle Column - Resources */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#como-funciona"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/precios"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Precios
                </Link>
              </li>
              <li>
                <Link
                  href="/seguridad"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Seguridad
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Column - Community */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Comunidad</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/inversores"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Inversores
                </Link>
              </li>
              <li>
                <Link
                  href="/emprendedores"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Emprendedores
                </Link>
              </li>
              <li>
                <Link
                  href="/contactanos"
                  className="text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Contactanos
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
} 