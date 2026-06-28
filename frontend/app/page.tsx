import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ROUTES } from "@/lib/constants"
import { Progress } from "@/components/ui/progress"
import { Heart } from "lucide-react"

const CREATOR_TYPES = [
  { icon: "🎧", label: "DJs" },
  { icon: "🎨", label: "Artistas" },
  { icon: "🎵", label: "Músicos" },
  { icon: "📸", label: "Fotógrafos" },
  { icon: "✍️", label: "Escritores" },
  { icon: "🎙️", label: "Podcasters" },
  { icon: "🎮", label: "Streamers" },
  { icon: "🎬", label: "Creadores de video" },
  { icon: "💡", label: "Emprendedores" },
  { icon: "🖌️", label: "Ilustradores" },
]

const FEATURED_CREATORS = [
  {
    name: "DJ Pablo",
    category: "Música · Buenos Aires",
    goal: "Quiero un Pioneer CDJ",
    current: 140000,
    target: 200000,
    supporters: 87,
    avatar: "🎧",
    color: "bg-purple-100",
  },
  {
    name: "Vale Ilustra",
    category: "Arte · Córdoba",
    goal: "Imprimir mi primer libro de ilustraciones",
    current: 85000,
    target: 120000,
    supporters: 54,
    avatar: "🎨",
    color: "bg-pink-100",
  },
  {
    name: "Mati Foto",
    category: "Fotografía · Rosario",
    goal: "Nuevo lente para retratos",
    current: 48000,
    target: 60000,
    supporters: 31,
    avatar: "📸",
    color: "bg-yellow-100",
  },
]

export default function ImpulsoLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Hacé lo que amás y recibí el apoyo de tu comunidad.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Compartí tu trabajo, creá una meta y recibí donaciones de tus fans en pesos, directo en tu cuenta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={ROUTES.REGISTER}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg w-full">
                    Crear mi perfil gratis
                  </Button>
                </Link>
                <Link href={ROUTES.DISCOVER}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg w-full"
                  >
                    Explorar creadores
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">Sin costo fijo · Solo pagás cuando recibís apoyo</p>
            </div>

            <div className="hidden md:block">
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/landing_image.png"
                  alt="Creadores en Impulso"
                  width={640}
                  height={480}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator types */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
            Creadores de todo tipo
          </h2>
          <p className="text-center text-gray-500 mb-10">Desde DJs hasta escritores, desde fotógrafos hasta emprendedores.</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {CREATOR_TYPES.map((type) => (
              <span
                key={type.label}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm"
              >
                {type.icon} {type.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-md bg-white rounded-xl">
              <CardContent className="p-6 text-left">
                <div className="text-5xl font-bold text-blue-600 mb-4">1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Creá tu perfil</h3>
                <p className="text-gray-600">
                  Elegí tu username, contá quién sos, subí tu foto y publicá tu primera meta de financiamiento.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white rounded-xl">
              <CardContent className="p-6 text-left">
                <div className="text-5xl font-bold text-blue-600 mb-4">2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Compartí tu trabajo</h3>
                <p className="text-gray-600">
                  Publicá fotos, audio, texto o links a YouTube y Spotify. Tu comunidad ve todo en un solo lugar.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white rounded-xl">
              <CardContent className="p-6 text-left">
                <div className="text-5xl font-bold text-blue-600 mb-4">3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Recibí apoyo en pesos</h3>
                <p className="text-gray-600">
                  Tus fans te apoyan con el monto que quieran vía MercadoPago. Vos recibís el 90% directo en tu cuenta.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured creators */}
      <section id="creadores" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Creadores destacados
            </h2>
            <Link href={ROUTES.DISCOVER} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Ver todos
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FEATURED_CREATORS.map((creator) => (
              <Card key={creator.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 ${creator.color} rounded-full flex items-center justify-center text-2xl`}>
                      {creator.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{creator.name}</p>
                      <p className="text-xs text-gray-500">{creator.category}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">🎯 {creator.goal}</p>
                    <Progress
                      value={Math.round((creator.current / creator.target) * 100)}
                      className="h-2 mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${creator.current.toLocaleString('es-AR')} recaudados</span>
                      <span>Meta ${creator.target.toLocaleString('es-AR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Heart className="w-4 h-4 text-red-400" />
                      {creator.supporters} personas apoyaron
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      Apoyar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Listo para recibir el apoyo que merecés?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Unite a los creadores argentinos que ya están usando Impulso para financiar sus proyectos.
            </p>
            <Link href={ROUTES.REGISTER}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 text-lg">
                Crear mi perfil gratis
              </Button>
            </Link>
            <p className="text-sm text-gray-400 mt-4">Sin tarjeta de crédito · Sin costo mensual</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
