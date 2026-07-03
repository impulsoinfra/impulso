'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Heart, Star, Check, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import { useAuth } from '@/hooks/use-auth'

const fieldWrap =
  'border border-borde rounded-lg px-3 py-2.5 flex items-center gap-2 focus-within:border-rosa/60 focus-within:ring-2 focus-within:ring-rosa/15 transition-shadow'
const fieldInput = 'flex-1 text-[13px] text-tinta outline-none bg-transparent placeholder:text-muted2'
const labelCls = 'text-[11px] font-semibold text-tinta block mb-1.5'

const ACCOUNT_TYPES = [
  { role: 'supporter' as const, icon: Heart, label: 'Seguidor', desc: 'Descubrí creadores y apoyá su trabajo.' },
  { role: 'artist' as const, icon: Star, label: 'Creador', desc: 'Compartí tu trabajo y recibí apoyo.' },
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'artist' | 'supporter'>('supporter')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setIsLoading(true)
    try {
      const { data, error } = await signUp(email, password, name, role)
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
      if (data?.user) setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta. Por favor, intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <Header />

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-[620px] bg-white border border-borde rounded-2xl overflow-hidden flex">
          <AuthBrandPanel
            title="SUMATE A LA COMUNIDAD"
            subtitle="Creadores y seguidores haciendo posible el arte independiente en Argentina."
          />

          <div className="flex-1 p-7">
            <h1 className="disp text-tinta text-[20px] uppercase mb-1.5">Creá tu cuenta</h1>
            <p className="text-txt2 text-[12px] mb-5">Unite a la comunidad de creadores y seguidores.</p>

            {success ? (
              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-exito/10 text-exito">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[13px]">¡Cuenta creada!</p>
                  <p className="text-[12px] leading-relaxed mt-0.5">
                    Te enviamos un email de confirmación. Verificá tu casilla para activar la cuenta y después{' '}
                    <Link href={ROUTES.LOGIN} className="font-semibold underline">iniciá sesión</Link>.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center gap-2 text-[12px] p-2.5 rounded-lg bg-red-50 text-red-700 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <label htmlFor="name" className={labelCls}>Nombre completo</label>
                <div className={`${fieldWrap} mb-3`}>
                  <User className="w-3.5 h-3.5 text-muted2 shrink-0" />
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre completo" className={fieldInput} required />
                </div>

                <label htmlFor="email" className={labelCls}>Email</label>
                <div className={`${fieldWrap} mb-3`}>
                  <Mail className="w-3.5 h-3.5 text-muted2 shrink-0" />
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className={fieldInput} required />
                </div>

                <label htmlFor="password" className={labelCls}>Contraseña</label>
                <div className={`${fieldWrap} mb-4`}>
                  <Lock className="w-3.5 h-3.5 text-muted2 shrink-0" />
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className={fieldInput} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted2 hover:text-tinta" aria-label="Mostrar contraseña">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className={labelCls}>¿Qué tipo de cuenta querés crear?</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {ACCOUNT_TYPES.map((opt) => {
                    const active = role === opt.role
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.role}
                        type="button"
                        onClick={() => setRole(opt.role)}
                        className={`text-left rounded-[10px] p-3 relative border-2 transition-colors ${active ? 'border-rosa bg-rosa/[0.05]' : 'border-borde hover:border-rosa/30'}`}
                      >
                        {active && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rosa flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        <Icon className={`w-4 h-4 mb-1.5 ${active ? 'text-rosa' : 'text-muted2'}`} />
                        <p className="text-[12.5px] font-semibold text-tinta mb-0.5">{opt.label}</p>
                        <p className="text-[10px] text-txt2 leading-snug">{opt.desc}</p>
                      </button>
                    )
                  })}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-rosa hover:bg-rosa-hover text-white rounded-lg py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors mb-3"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Comenzar
                </button>

                <p className="text-center text-[12px] text-txt2">
                  ¿Ya tenés una cuenta?{' '}
                  <Link href={ROUTES.LOGIN} className="text-rosa hover:text-rosa-hover font-semibold">
                    Iniciá sesión acá
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
