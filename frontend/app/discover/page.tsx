'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getBrowserClient } from '@/lib/supabase-browser'
import { Search, Target, Loader2, Users } from 'lucide-react'

const CATEGORIES = [
  'Todos', 'DJs', 'Artistas', 'Músicos', 'Fotógrafos', 'Escritores',
  'Podcasters', 'Streamers', 'Creadores de video', 'Emprendedores', 'Ilustradores',
]

const ACCENTS = ['#F0355C', '#FF9D3D', '#1B1A2E']
const btnTextFor = (accent: string) => (accent === '#FF9D3D' ? '#994f0a' : accent)

interface Creator {
  id: string
  name: string
  username: string
  creator_type: string | null
  avatar_url: string | null
  location: string | null
  goal: { title: string; target_amount: number; current_amount: number }
}

export default function DiscoverPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState<'progress' | 'raised' | 'name'>('progress')

  useEffect(() => {
    const client = getBrowserClient()
    if (!client) { setLoading(false); return }
    let active = true
    ;(async () => {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('id, name, username, creator_type, avatar_url, location, goals!inner(title, target_amount, current_amount, is_active)')
          .eq('role', 'artist')
          .eq('goals.is_active', true)
          .not('username', 'is', null)
        if (error) throw error
        if (!active) return
        const mapped: Creator[] = (data ?? [])
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            username: p.username,
            creator_type: p.creator_type,
            avatar_url: p.avatar_url,
            location: p.location,
            goal: Array.isArray(p.goals) ? p.goals[0] : p.goals,
          }))
          .filter((c) => c.goal)
        setCreators(mapped)
      } catch (err) {
        console.error('[discover]', err)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    let list = creators
    if (category !== 'Todos') list = list.filter((c) => c.creator_type === category)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.creator_type ?? '').toLowerCase().includes(q) ||
        (c.location ?? '').toLowerCase().includes(q) ||
        c.goal.title.toLowerCase().includes(q)
      )
    }
    const pct = (c: Creator) => Number(c.goal.current_amount) / Number(c.goal.target_amount)
    return [...list].sort((a, b) => {
      if (sortBy === 'progress') return pct(b) - pct(a)
      if (sortBy === 'raised') return Number(b.goal.current_amount) - Number(a.goal.current_amount)
      return a.name.localeCompare(b.name)
    })
  }, [creators, category, search, sortBy])

  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <Header />

      <main className="wrap py-8 flex-1 w-full">
        <h1 className="disp text-tinta text-[24px] md:text-[28px] uppercase mb-1.5">
          Descubrí creadores para apoyar
        </h1>
        <p className="text-txt2 text-[13px] mb-5 max-w-2xl">
          Artistas, fotógrafos, escritores y emprendedores construyendo algo. Encontrá a los tuyos.
        </p>

        {/* Search + category chips */}
        <div className="bg-white border border-borde rounded-xl p-3.5 mb-4">
          <div className="flex items-center gap-2 border border-borde rounded-lg px-3 py-2.5 mb-3 focus-within:border-rosa/60 focus-within:ring-2 focus-within:ring-rosa/15 transition-shadow">
            <Search className="w-4 h-4 text-muted2 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, categoría o meta"
              className="flex-1 text-[13px] text-tinta outline-none bg-transparent placeholder:text-muted2"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => {
              const activeCat = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={activeCat
                    ? 'bg-rosa text-white text-[11px] font-semibold px-3 py-1.5 rounded-full'
                    : 'border border-borde text-txt2 hover:border-rosa/40 text-[11px] px-3 py-1.5 rounded-full transition-colors'}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Result count + sort */}
        <div className="flex justify-between items-center mb-3.5 gap-3">
          <span className="text-[12px] text-txt2">
            {loading ? 'Cargando…' : `${filtered.length} ${filtered.length === 1 ? 'creador encontrado' : 'creadores encontrados'}`}
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none border border-borde rounded-lg pl-3 pr-8 py-2 text-[12px] text-tinta bg-white outline-none focus:border-rosa/60 cursor-pointer"
            >
              <option value="progress">Más cerca de la meta</option>
              <option value="raised">Más recaudado</option>
              <option value="name">Nombre A-Z</option>
            </select>
            <svg className="w-3.5 h-3.5 text-txt2 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-rosa/60" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-borde rounded-xl py-16 text-center">
            <Users className="w-10 h-10 text-muted2 mx-auto mb-3" />
            <p className="text-txt2 font-medium text-sm">No encontramos creadores</p>
            <p className="text-muted2 text-xs mt-1">
              {creators.length === 0 ? 'Todavía no hay creadores con metas activas.' : 'Probá con otra búsqueda o categoría.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((c, i) => {
              const accent = ACCENTS[i % ACCENTS.length]
              const pct = Math.min(Math.round((Number(c.goal.current_amount) / Number(c.goal.target_amount)) * 100), 100)
              const initials = (c.name || c.username).split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
              return (
                <Link
                  key={c.id}
                  href={`/${c.username}`}
                  className="bg-white border border-borde rounded-[10px] overflow-hidden block hover:shadow-md transition-shadow"
                >
                  <div className="h-1" style={{ background: accent }} />
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {c.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatar_url} alt="" className="w-[26px] h-[26px] rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ background: accent }}>
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-tinta truncate">{c.name}</p>
                        <p className="text-[10px] text-txt2 truncate">
                          {[c.creator_type, c.location].filter(Boolean).join(' · ') || 'Creador'}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-tinta mb-1.5 truncate flex items-center gap-1">
                      <Target className="w-2.5 h-2.5 text-naranja shrink-0" /> {c.goal.title}
                    </p>
                    <div className="h-[5px] bg-track rounded-full overflow-hidden mb-1.5">
                      <div className="h-full" style={{ width: `${pct}%`, background: accent }} />
                    </div>
                    <p className="text-[9.5px] text-txt2 mb-2.5">
                      ${Number(c.goal.current_amount).toLocaleString('es-AR')} / ${Number(c.goal.target_amount).toLocaleString('es-AR')}
                    </p>
                    <span
                      className="block text-center w-full rounded-md py-1.5 text-[11px] font-semibold border transition-colors hover:bg-black/[0.03]"
                      style={{ borderColor: accent, color: btnTextFor(accent) }}
                    >
                      Apoyar
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
