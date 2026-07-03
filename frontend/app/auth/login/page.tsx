'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import { useAuth } from '@/hooks/use-auth'

const fieldWrap =
  'border border-borde rounded-lg px-3 py-2.5 flex items-center gap-2 focus-within:border-rosa/60 focus-within:ring-2 focus-within:ring-rosa/15 transition-shadow'
const fieldInput = 'flex-1 text-[13px] text-tinta outline-none bg-transparent placeholder:text-muted2'
const labelCls = 'text-[11px] font-semibold text-tinta block mb-1.5'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const { data, error } = await signIn(email, password)
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email o contraseña incorrectos. Por favor, intentá de nuevo.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, verificá tu email antes de iniciar sesión.')
        } else {
          setError(error.message || 'Error al iniciar sesión. Por favor, intentá de nuevo.')
        }
        return
      }
      if (data?.user) router.push(ROUTES.DASHBOARD)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Por favor, intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <Header />

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-[560px] bg-white border border-borde rounded-2xl overflow-hidden flex">
          <AuthBrandPanel
            title="QUÉ BUENO VERTE DE NUEVO"
            subtitle="Entrá y seguí apoyando o compartiendo tu trabajo."
          />

          <div className="flex-1 p-7">
            <h1 className="disp text-tinta text-[20px] uppercase mb-1.5">Iniciar sesión</h1>
            <p className="text-txt2 text-[12px] mb-5">Ingresá a tu cuenta para continuar.</p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2 text-[12px] p-2.5 rounded-lg bg-red-50 text-red-700 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <label htmlFor="email" className={labelCls}>Email</label>
              <div className={`${fieldWrap} mb-3.5`}>
                <Mail className="w-3.5 h-3.5 text-muted2 shrink-0" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={fieldInput}
                  required
                />
              </div>

              <label htmlFor="password" className={labelCls}>Contraseña</label>
              <div className={`${fieldWrap} mb-2`}>
                <Lock className="w-3.5 h-3.5 text-muted2 shrink-0" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className={fieldInput}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted2 hover:text-tinta" aria-label="Mostrar contraseña">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <Link href="/auth/forgot-password" className="text-[11.5px] font-semibold text-rosa hover:text-rosa-hover inline-block mb-4">
                ¿Olvidaste tu contraseña?
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rosa hover:bg-rosa-hover text-white rounded-lg py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors mb-3"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Iniciar sesión
              </button>

              <p className="text-center text-[12px] text-txt2">
                ¿No tenés una cuenta?{' '}
                <Link href={ROUTES.REGISTER} className="text-rosa hover:text-rosa-hover font-semibold">
                  Registrate acá
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
