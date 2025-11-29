import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Share2, Heart, Menu, ArrowRight } from "lucide-react"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ROUTES } from "@/lib/constants"
import { Progress } from "@/components/ui/progress"

export default function ImpulsoLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Financiá tu emprendimiento y lanzá tu proyecto al mundo
          </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Una plataforma creada para emprendedores, makers y visionarios que necesitan capital para construir sus ideas
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={ROUTES.REGISTER}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg w-full">
                    Crear proyecto
                  </Button>
                </Link>
                <Link href={ROUTES.DISCOVER}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg w-full"
                  >
                    Explorar proyectos
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right side - Illustration */}
            <div className="hidden md:block">
              <div className="w-full h-full rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/landing_image.png"
                  alt="Equipo trabajando en un proyecto"
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

      {/* How it works */}
      <section id="como-funciona" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">¿Cómo funciona?</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1 */}
            <Card className="border-0 shadow-md bg-white rounded-lg">
              <CardContent className="p-6 text-left">
                <div className="text-6xl font-bold text-blue-600 mb-4">1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Creá tu proyecto</h3>
                <p className="text-gray-700">
                  Completá la ficha, contanos el uso de fondos y las recompensas para los inversores.
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="border-0 shadow-md bg-white rounded-lg">
              <CardContent className="p-6 text-left">
                <div className="text-6xl font-bold text-blue-600 mb-4">2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Conseguí inversores</h3>
                <p className="text-gray-700">
                  La comunidad y nuestros canales promocionan tu proyecto.
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="border-0 shadow-md bg-white rounded-lg">
              <CardContent className="p-6 text-left">
                <div className="text-6xl font-bold text-blue-600 mb-4">3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Entregá resultados</h3>
                <p className="text-gray-700">
                  Recibí los fondos y cumplí las recompensas a los contribuyentes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="proyectos" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Proyectos destacados
          </h2>
            <Link href={ROUTES.DISCOVER} className="text-blue-600 hover:text-blue-700 font-medium">
              Ver todos
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Project Card 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                {/* Image placeholder */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">📷</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-500 text-xs mb-2">Hardware · Mendoza · Agtech</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Sistema de riego IoT para viñedos
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-900 font-bold text-lg">$540.000</span>
                      <span className="text-gray-600 text-sm">22 días</span>
                    </div>
                    <Progress value={68} className="h-2 bg-gray-200 mb-2 [&_[data-slot=progress-indicator]]:bg-blue-600" />
                    <p className="text-gray-600 text-sm">Meta $800.000</p>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Invertir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Card 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                {/* Image placeholder */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">📷</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-500 text-xs mb-2">Alimentos · Mendoza · PyME</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Microfábrica de alimentos saludables
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-900 font-bold text-lg">$320.000</span>
                      <span className="text-gray-600 text-sm">15 días</span>
                    </div>
                    <Progress value={64} className="h-2 bg-gray-200 mb-2 [&_[data-slot=progress-indicator]]:bg-blue-600" />
                    <p className="text-gray-600 text-sm">Meta $500.000</p>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Invertir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Card 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                {/* Image placeholder */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">📷</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-500 text-xs mb-2">SaaS · Software · Startups</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    App de gestión para comercios locales
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-900 font-bold text-lg">$210.000</span>
                      <span className="text-gray-600 text-sm">7 días</span>
                    </div>
                    <Progress value={84} className="h-2 bg-gray-200 mb-2 [&_[data-slot=progress-indicator]]:bg-blue-600" />
                    <p className="text-gray-600 text-sm">Meta $250.000</p>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Invertir
                  </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="border-0 shadow-lg bg-gray-50 max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Listo para lanzar tu proyecto?
                  </h2>
                  <p className="text-gray-700">
                    Crea una campaña en minutos y empezá a recibir interés de inversores locales.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                    Crear proyecto
            </Button>
                  <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6">
                    Contactar soporte
            </Button>
          </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
