import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ROUTES } from '@/lib/constants'

export default function CreatorNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-32 text-center">
        <p className="text-6xl mb-6">🔍</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Creador no encontrado
        </h1>
        <p className="text-gray-500 mb-8 text-lg">
          Este perfil no existe o todavía no configuró su username.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href={ROUTES.DISCOVER}>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white">
              Explorar creadores
            </Button>
          </Link>
          <Link href={ROUTES.HOME}>
            <Button variant="outline" className="border-rose-600 text-rose-600">
              Ir al inicio
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
