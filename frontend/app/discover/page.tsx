'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getBrowserClient } from '@/lib/supabase-browser'
import { embeddedCount } from '@/lib/interactions'
import { PostInteractionsProvider } from '@/components/posts/post-interactions'
import { FeedPostCard, type FeedPost } from '@/components/posts/feed-post-card'
import type { ShareOption } from '@/components/share/share-menu'
import { Search, Target, Loader2, Users, MessageCircle, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  'Todos', 'DJs', 'Artistas', 'Músicos', 'Fotógrafos', 'Escritores',
  'Podcasters', 'Streamers', 'Creadores de video', 'Emprendedores', 'Ilustradores',
]

const ACCENTS = ['#F0355C', '#FF9D3D', '#1B1A2E']
const btnTextFor = (accent: string) => (accent === '#FF9D3D' ? '#994f0a' : accent)

type Tab = 'posts' | 'creators' | 'goals'

interface Creator {
  id: string
  name: string
  username: string
  creator_type: string | null
  avatar_url: string | null
  location: string | null
  mp_connected: boolean
  goal: { title: string; target_amount: number; current_amount: number }
}

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: 'posts', label: 'Publicaciones', icon: MessageCircle },
  { key: 'creators', label: 'Creadores', icon: Users },
  { key: 'goals', label: 'Metas', icon: Target },
]

// Build the share options for a feed post (link + generated PNGs), same as the profile feed.
function postShareOptions(username: string, postId: string): ShareOption[] {
  return [
    { key: 'link', kind: 'link', label: 'Copiar link de la publicación', hint: `tuimpulso.ar/${username}`, link: `/${username}/${postId}` },
    { key: 'story', label: 'Historia', hint: '1080×1920', url: `/api/share/post/${postId}`, filename: 'impulso-publicacion-historia.png' },
    { key: 'square', label: 'Cuadrado (feed)', hint: '1080×1080', url: `/api/share/post/${postId}?format=square`, filename: 'impulso-publicacion-cuadrado.png' },
  ]
}

export default function DiscoverPage() {
  const [tab, setTab] = useState<Tab>('posts')
  const [creators, setCreators] = useState<Creator[]>([])
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loadingCreators, setLoadingCreators] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState<'progress' | 'raised' | 'name'>('progress')

  // Creators + their active goal (feeds the Creadores grid and the Metas list).
  useEffect(() => {
    const client = getBrowserClient()
    if (!client) { setLoadingCreators(false); return }
    let active = true
    ;(async () => {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('id, name, username, creator_type, avatar_url, location, mp_connected, goals!inner(title, target_amount, current_amount, is_active)')
          .eq('role', 'creator')
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
            mp_connected: p.mp_connected,
            goal: Array.isArray(p.goals) ? p.goals[0] : p.goals,
          }))
          .filter((c) => c.goal)
        setCreators(mapped)
      } catch (err) {
        console.error('[discover creators]', err)
      } finally {
        if (active) setLoadingCreators(false)
      }
    })()
    return () => { active = false }
  }, [])

  // Cross-creator post feed, newest first, with author + like/comment counts.
  useEffect(() => {
    const client = getBrowserClient()
    if (!client) { setLoadingPosts(false); return }
    let active = true
    ;(async () => {
      try {
        // `profiles` is reachable from `posts` by several paths (the direct
        // creator FK plus the like/comment junctions), so disambiguate the embed
        // with the FK constraint name. Posts whose author lacks a username are
        // dropped client-side below.
        const { data, error } = await client
          .from('posts')
          .select('id, title, content, post_type, media_url, media_urls, created_at, post_likes(count), post_comments(count), creator:profiles!posts_creator_id_fkey(id, name, username, avatar_url, creator_type, location, mp_connected)')
          .order('created_at', { ascending: false })
          .limit(40)
        if (error) throw error
        if (!active) return
        const mapped: FeedPost[] = (data ?? []).map((p: any) => {
          const creator = Array.isArray(p.creator) ? p.creator[0] : p.creator
          return {
            id: p.id,
            title: p.title,
            content: p.content,
            post_type: p.post_type,
            media_url: p.media_url,
            media_urls: p.media_urls,
            created_at: p.created_at,
            likeCount: embeddedCount(p.post_likes),
            commentCount: embeddedCount(p.post_comments),
            creator: {
              id: creator.id,
              name: creator.name,
              username: creator.username,
              avatar_url: creator.avatar_url,
              creator_type: creator.creator_type,
              location: creator.location,
              mp_connected: creator.mp_connected,
            },
          }
        }).filter((p) => p.creator?.username)
        setPosts(mapped)
      } catch (err) {
        console.error('[discover posts]', err)
      } finally {
        if (active) setLoadingPosts(false)
      }
    })()
    return () => { active = false }
  }, [])

  // Category + search apply to every tab. Category matches creator_type.
  const q = search.trim().toLowerCase()

  const filteredCreators = useMemo(() => {
    let list = creators
    if (category !== 'Todos') list = list.filter((c) => c.creator_type === category)
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
  }, [creators, category, q, sortBy])

  // Metas: same data as Creadores, always ranked by closeness to completion so a
  // final push is easy to spot.
  const rankedGoals = useMemo(() => {
    const pct = (c: Creator) => Number(c.goal.current_amount) / Number(c.goal.target_amount)
    return [...filteredCreators].sort((a, b) => pct(b) - pct(a))
  }, [filteredCreators])

  const filteredPosts = useMemo(() => {
    let list = posts
    if (category !== 'Todos') list = list.filter((p) => p.creator.creator_type === category)
    if (q) {
      list = list.filter((p) =>
        p.creator.name.toLowerCase().includes(q) ||
        (p.creator.creator_type ?? '').toLowerCase().includes(q) ||
        (p.creator.location ?? '').toLowerCase().includes(q) ||
        (p.title ?? '').toLowerCase().includes(q) ||
        (p.content ?? '').toLowerCase().includes(q)
      )
    }
    return list // already newest-first from the query
  }, [posts, category, q])

  // The provider owns like state for every loaded post (stable id set), so
  // toggling works regardless of the active filter.
  const allPostIds = useMemo(() => posts.map((p) => p.id), [posts])
  const initialLikeCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const p of posts) m[p.id] = p.likeCount
    return m
  }, [posts])

  const loading = tab === 'posts' ? loadingPosts : loadingCreators
  const count =
    tab === 'posts' ? filteredPosts.length : tab === 'creators' ? filteredCreators.length : rankedGoals.length
  const countNoun =
    tab === 'posts'
      ? count === 1 ? 'publicación' : 'publicaciones'
      : tab === 'creators'
        ? count === 1 ? 'creador encontrado' : 'creadores encontrados'
        : count === 1 ? 'meta activa' : 'metas activas'

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

        {/* Search + category chips (filter all three tabs) */}
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

        {/* Tabs */}
        <div className="flex gap-1 border-b border-borde mb-4 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const activeTab = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 -mb-px border-b-2 whitespace-nowrap transition-colors ${
                  activeTab ? 'border-rosa text-rosa' : 'border-transparent text-txt2 hover:text-tinta'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[13px] font-semibold">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Result count + sort (sort only where it makes sense) */}
        <div className="flex justify-between items-center mb-3.5 gap-3">
          <span className="text-[12px] text-txt2">
            {loading ? 'Cargando…' : `${count} ${countNoun}`}
          </span>
          {tab !== 'posts' && (
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
          )}
        </div>

        {/* ---- PUBLICACIONES ---- */}
        {tab === 'posts' && (
          loadingPosts ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-rosa/60" /></div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No hay publicaciones"
              hint={posts.length === 0 ? 'Todavía no hay publicaciones para mostrar.' : 'Probá con otra búsqueda o categoría.'}
            />
          ) : (
            <PostInteractionsProvider postIds={allPostIds} initialLikeCounts={initialLikeCounts}>
              {/* Masonry: 1 column on mobile, more on wider screens so several
                  posts fit at once and each card is smaller. */}
              <div className="mx-auto max-w-[560px] md:max-w-[1180px] gap-4 columns-1 md:columns-2 xl:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
                {filteredPosts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    shareOptions={postShareOptions(post.creator.username, post.id)}
                  />
                ))}
              </div>
            </PostInteractionsProvider>
          )
        )}

        {/* ---- CREADORES ---- */}
        {tab === 'creators' && (
          loadingCreators ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-rosa/60" /></div>
          ) : filteredCreators.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No encontramos creadores"
              hint={creators.length === 0 ? 'Todavía no hay creadores con metas activas.' : 'Probá con otra búsqueda o categoría.'}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCreators.map((c, i) => {
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
          )
        )}

        {/* ---- METAS ---- */}
        {tab === 'goals' && (
          loadingCreators ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-rosa/60" /></div>
          ) : rankedGoals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No hay metas activas"
              hint={creators.length === 0 ? 'Todavía no hay metas para mostrar.' : 'Probá con otra búsqueda o categoría.'}
            />
          ) : (
            <div className="max-w-[720px] mx-auto space-y-2">
              {rankedGoals.map((c) => {
                const pct = Math.min(Math.round((Number(c.goal.current_amount) / Number(c.goal.target_amount)) * 100), 100)
                const initials = (c.name || c.username).split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <Link
                    key={c.id}
                    href={`/${c.username}`}
                    className="group flex items-center gap-3 bg-white border border-borde rounded-[10px] p-3 hover:shadow-md transition-shadow"
                  >
                    {c.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-rosa flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[13px] font-semibold text-tinta truncate">
                          {c.name}
                          <span className="text-[11px] text-muted2 font-normal">
                            {c.creator_type ? ` · ${c.creator_type}` : ''}
                          </span>
                        </p>
                        <span className="disp text-tinta text-[16px] leading-none shrink-0">{pct}%</span>
                      </div>
                      <p className="text-[11px] text-txt2 truncate mb-1.5 flex items-center gap-1">
                        <Target className="w-2.5 h-2.5 text-naranja shrink-0" /> {c.goal.title}
                      </p>
                      <div className="h-[5px] bg-track rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-rosa" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-muted2">
                          ${Number(c.goal.current_amount).toLocaleString('es-AR')} de ${Number(c.goal.target_amount).toLocaleString('es-AR')}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-rosa text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Apoyar <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  )
}

function EmptyState({ icon: Icon, title, hint }: { icon: typeof Users; title: string; hint: string }) {
  return (
    <div className="bg-white border border-dashed border-borde rounded-xl py-16 text-center">
      <Icon className="w-10 h-10 text-muted2 mx-auto mb-3" />
      <p className="text-txt2 font-medium text-sm">{title}</p>
      <p className="text-muted2 text-xs mt-1">{hint}</p>
    </div>
  )
}
