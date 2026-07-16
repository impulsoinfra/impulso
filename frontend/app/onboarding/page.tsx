'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import { Loader2, AlertCircle, Check } from 'lucide-react'

const CREATOR_TYPES = [
  'DJs', 'Artistas', 'Músicos', 'Fotógrafos', 'Escritores',
  'Podcasters', 'Streamers', 'Creadores de video', 'Emprendedores', 'Ilustradores',
]

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[^a-z0-9_]/g, '')
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  )
}

function OnboardingContent() {
  const { user, profile, refreshProfile, getClient } = useAuth()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [creatorType, setCreatorType] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [prefilled, setPrefilled] = useState(false)

  // If already onboarded (or a supporter), skip straight to the dashboard.
  useEffect(() => {
    if (!profile) return
    const p = profile as any
    if (p.role !== 'creator' || p.username) {
      router.replace('/dashboard')
      return
    }
    if (!prefilled) {
      setUsername(slugify(p.name || ''))
      setCreatorType(p.creator_type || '')
      setPrefilled(true)
    }
  }, [profile, prefilled, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = getClient()
    if (!user || !client) return
    const uname = username.trim().toLowerCase()
    if (uname.length < 3) {
      setError('El username debe tener al menos 3 caracteres.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const { error: dbErr } = await client
        .from('profiles')
        .update({ username: uname, creator_type: creatorType || null, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (dbErr) {
        setError(dbErr.message.includes('unique') ? 'Ese username ya está en uso. Probá otro.' : 'No se pudo guardar. Intentá de nuevo.')
        return
      }
      await refreshProfile()
      router.replace('/dashboard')
    } catch (err) {
      console.error('[onboarding]', err)
      setError('Error inesperado. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (!profile || (profile as any).role !== 'creator' || (profile as any).username) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rosa" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <Header />

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-[620px] bg-white border border-borde rounded-2xl overflow-hidden flex">
          <AuthBrandPanel
            title="CASI LISTO"
            subtitle="Elegí tu username: es tu dirección en Impulso y donde tu comunidad te va a apoyar."
          />

          <div className="flex-1 p-7">
            <h1 className="disp text-tinta text-[20px] uppercase mb-1.5">Creá tu perfil</h1>
            <p className="text-txt2 text-[12px] mb-5">Un último paso para que tu perfil quede público.</p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-2 text-[12px] p-2.5 rounded-lg bg-red-50 text-red-700 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <label htmlFor="ob-username" className="text-[11px] font-semibold text-tinta block mb-1.5">Tu username</label>
              <div className="flex items-center border border-borde rounded-lg overflow-hidden focus-within:border-rosa/60 focus-within:ring-2 focus-within:ring-rosa/15 mb-1.5 transition-shadow">
                <span className="px-3 text-muted2 text-[13px] bg-crema border-r border-borde h-[42px] flex items-center">impulso.app/</span>
                <input
                  id="ob-username"
                  value={username}
                  onChange={(e) => setUsername(slugify(e.target.value))}
                  placeholder="tuusuario"
                  className="flex-1 px-3 h-[42px] text-[13px] outline-none text-tinta bg-white"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-muted2 mb-4">Solo letras, números y guiones bajos. Lo podés cambiar después.</p>

              <p className="text-[11px] font-semibold text-tinta block mb-1.5">¿Qué tipo de creador sos? <span className="text-muted2 font-normal">(opcional)</span></p>
              <div className="flex gap-1.5 flex-wrap mb-5">
                {CREATOR_TYPES.map((t) => {
                  const active = creatorType === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCreatorType(active ? '' : t)}
                      className={active
                        ? 'bg-naranja text-tinta font-bold text-[11px] px-3 py-1.5 rounded-full inline-flex items-center gap-1'
                        : 'border border-borde text-txt2 hover:border-naranja/50 text-[11px] px-3 py-1.5 rounded-full transition-colors'}
                    >
                      {active && <Check className="w-2.5 h-2.5" />} {t}
                    </button>
                  )
                })}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-rosa hover:bg-rosa-hover text-white rounded-lg py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear mi perfil
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
