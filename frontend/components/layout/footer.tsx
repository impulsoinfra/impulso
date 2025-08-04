import Link from 'next/link'
import { APP_NAME, ROUTES } from '@/lib/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Plataforma',
      links: [
        { href: ROUTES.HOME, label: 'Inicio' },
        { href: ROUTES.DISCOVER, label: 'Descubrir' },
        { href: '/#como-funciona', label: '¿Cómo funciona?' },
        { href: ROUTES.SUPPORT, label: 'Soporte' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { href: '/terminos', label: 'Términos de uso' },
        { href: '/privacidad', label: 'Política de privacidad' },
        { href: '/cookies', label: 'Política de cookies' },
      ],
    },
    {
      title: 'Comunidad',
      links: [
        { href: '/blog', label: 'Blog' },
        { href: '/eventos', label: 'Eventos' },
        { href: '/contacto', label: 'Contacto' },
      ],
    },
  ]

  const socialLinks = [
    { href: 'https://instagram.com', label: 'Instagram', icon: '📷' },
    { href: 'https://twitter.com', label: 'Twitter', icon: '🐦' },
    { href: 'https://youtube.com', label: 'YouTube', icon: '📺' },
  ]

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-bold text-blue-900">{APP_NAME}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Apoyá a quienes te inspiran. Conectamos artistas independientes con su comunidad.
            </p>
          </div>

          {/* Enlaces de navegación */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-900 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © {currentYear} {APP_NAME}. Todos los derechos reservados.
            </div>

            {/* Redes sociales */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-900 transition-colors text-sm"
                  aria-label={social.label}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 