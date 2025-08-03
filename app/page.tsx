import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Share2, Heart, Menu } from "lucide-react"
import Image from "next/image"

export default function ImpulsoLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-xl font-bold text-blue-900">Impulso</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#como-funciona" className="text-gray-600 hover:text-blue-900 transition-colors">
              ¿Cómo funciona?
            </a>
            <a href="#artistas" className="text-gray-600 hover:text-blue-900 transition-colors">
              Artistas
            </a>
            <a href="#testimonios" className="text-gray-600 hover:text-blue-900 transition-colors">
              Testimonios
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="hidden md:inline-flex border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white bg-transparent"
            >
              Iniciar sesión
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Descubrí artistas</Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
            Apoyá a quienes
            <br />
            te inspiran.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contribuí a sus proyectos y recibí contenido
            <br />
            exclusivo o agradecimientos
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
            Descubrí artistas
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">¿Cómo funciona?</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">El creador</h3>
              <p className="text-gray-600">crea su perfil</p>
            </div>

            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-300 -z-10"></div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Lo comparte con</h3>
              <p className="text-gray-600">su comunidad</p>
            </div>

            <div className="text-center relative">
              <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-300 -z-10"></div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Recibe apoyo</h3>
              <p className="text-gray-600">
                económico de
                <br />
                sus seguidores
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artist Profile */}
      <section id="artistas" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">
            Ejemplo de perfil destacado
          </h2>

          <Card className="max-w-4xl mx-auto border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 via-purple-400 to-green-400 p-1">
                    <Image
                      src="/placeholder.svg?height=96&width=96"
                      alt="Valeria López"
                      width={96}
                      height={96}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-blue-900 mb-1">Valeria López</h3>
                  <p className="text-gray-600 mb-4">Artista de ilustración</p>
                  <p className="text-gray-700 mb-6">
                    ¡Hola! soy una ilustradora freelance. Si te gusta mi trabajo, apoyarme para poder seguir creando.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="Artwork 1"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="Artwork 2"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Apoyar $500</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="text-4xl text-blue-600 mb-4">"</div>
                <p className="text-gray-700 mb-4">
                  Gracias a estas contribuciones puedo seguir haciendo arte y enfocarme en nuevos proyectos personales.
                </p>
                <p className="font-semibold text-blue-900">Javier M.</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="text-4xl text-blue-600 mb-4">"</div>
                <p className="text-gray-700 mb-4">
                  Me encanta poder colaborar con mis ilustradores favoritos de una manera muy sencilla y directa.
                </p>
                <p className="font-semibold text-blue-900">Carla L.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8">Comenzá tu camino en Impulso</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button
              variant="outline"
              size="lg"
              className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white flex-1 bg-transparent"
            >
              Soy creador
            </Button>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
              Quiero apoyar
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">I</span>
              </div>
              <span className="text-lg font-bold text-blue-900">Impulso</span>
            </div>

            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-900 transition-colors">
                Términos
              </a>
              <a href="#" className="hover:text-blue-900 transition-colors">
                Privacidad
              </a>
              <a href="#" className="hover:text-blue-900 transition-colors">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
