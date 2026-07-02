import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-tinta border-t border-[rgba(251,247,242,0.1)]">
      <div className="wrap py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <p className="disp text-crema text-[15px] mb-1">IMPULSO</p>
            <p className="text-[rgba(251,247,242,0.5)] text-xs leading-relaxed">
              El impulso que necesitás.
            </p>
          </div>

          <div>
            <h3 className="text-crema text-xs font-semibold uppercase tracking-wider mb-3">Plataforma</h3>
            <ul className="space-y-2">
              <li><Link href="/#como-funciona" className="text-[rgba(251,247,242,0.5)] hover:text-crema transition-colors text-[13px]">Cómo funciona</Link></li>
              <li><Link href={ROUTES.DISCOVER} className="text-[rgba(251,247,242,0.5)] hover:text-crema transition-colors text-[13px]">Explorar creadores</Link></li>
              <li><Link href="/faq" className="text-[rgba(251,247,242,0.5)] hover:text-crema transition-colors text-[13px]">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-crema text-xs font-semibold uppercase tracking-wider mb-3">Comunidad</h3>
            <ul className="space-y-2">
              <li><Link href="/creadores" className="text-[rgba(251,247,242,0.5)] hover:text-crema transition-colors text-[13px]">Para creadores</Link></li>
              <li><Link href="/seguidores" className="text-[rgba(251,247,242,0.5)] hover:text-crema transition-colors text-[13px]">Para seguidores</Link></li>
              <li><Link href="/blog" className="text-[rgba(251,247,242,0.5)] hover:text-crema transition-colors text-[13px]">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-crema text-xs font-semibold uppercase tracking-wider mb-3">Impulso</h3>
            <ul className="space-y-2">
              <li><Link href="/contacto" className="text-[rgba(251,247,242,0.5)] hover:text-crema transition-colors text-[13px]">Contacto</Link></li>
              <li><Link href={ROUTES.SUPPORT} className="text-[rgba(251,247,242,0.5)] hover:text-crema transition-colors text-[13px]">Soporte</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[rgba(251,247,242,0.1)]">
          <p className="text-[rgba(251,247,242,0.4)] text-[11px]">
            © {new Date().getFullYear()} Impulso · Hecho en Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}
