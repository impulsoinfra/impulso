'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useAuth } from '@/hooks/use-auth'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'supporter' as 'artist' | 'supporter'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const { signUp } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      )

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Ya existe una cuenta con este email. Por favor, iniciá sesión.')
        } else if (error.message.includes('Password should be at least')) {
          setError('La contraseña debe tener al menos 6 caracteres.')
        } else {
          setError(error.message || 'Error al crear la cuenta. Por favor, intentá de nuevo.')
        }
        return
      }

      if (data?.user) {
        setSuccess(true)
        // No redirigimos inmediatamente porque Supabase requiere confirmación de email
        // El usuario verá un mensaje de éxito y podrá verificar su email
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta. Por favor, intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center space-x-2 mb-4">
                <Link href={ROUTES.HOME} className="text-gray-600 hover:text-rose-900">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-rose-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">I</span>
                  </div>
                  <span className="text-lg font-bold text-rose-900">{APP_NAME}</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">Crea tu cuenta</CardTitle>
              <CardDescription className="text-center">
                Unite a la comunidad de creadores y seguidores que hacen posible el arte independiente.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-green-800 font-medium">¡Cuenta creada exitosamente!</p>
                        <p className="text-green-700 text-sm">
                          Te enviamos un email de confirmación. Por favor, verificá tu email para activar tu cuenta.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repetí tu contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>¿Qué tipo de cuenta querés crear?</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="supporter" id="supporter" className="peer sr-only" />
                      <Label
                        htmlFor="supporter"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <div className="text-center">
                          <div className="text-lg font-semibold">Seguidor</div>
                          <div className="text-sm text-muted-foreground">
                            Descubrí creadores y apoyá su trabajo.
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="artist" id="artist" className="peer sr-only" />
                      <Label
                        htmlFor="artist"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <div className="text-center">
                          <div className="text-lg font-semibold">Creador</div>
                          <div className="text-sm text-muted-foreground">
                            Compartí tu trabajo y recibí el apoyo de tu comunidad.
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creando cuenta...' : 'Comenzar'}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tenés una cuenta?{' '}
                  <Link
                    href={ROUTES.LOGIN}
                    className="text-rose-600 hover:text-rose-800 font-medium"
                  >
                    Iniciá sesión acá
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 