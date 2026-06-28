import Link from 'next/link'
import { APP_NAME, ROUTES } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-rose-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{APP_NAME}</span>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              El impulso que necesitás.
            </p>
            <div className="text-gray-500 text-sm">
              <Link href="/contacto" className="hover:text-gray-900">Contacto</Link>
              <span className="mx-2">·</span>
              <Link href={ROUTES.SUPPORT} className="hover:text-gray-900">Soporte</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Plataforma</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#como-funciona" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href={ROUTES.DISCOVER} className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                  Explorar creadores
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Comunidad</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/creadores" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                  Para creadores
                </Link>
              </li>
              <li>
                <Link href="/seguidores" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                  Para seguidores
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {APP_NAME} · Hecho en Argentina 🇦🇷
        </div>
      </div>
    </footer>
  )
}
