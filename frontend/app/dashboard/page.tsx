'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  FileText, Target, User, Plus, Trash2, ExternalLink,
  Loader2, CheckCircle, AlertCircle, Camera, Pencil,
  DollarSign, Wallet, Upload, Heart,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShareMenu, type ShareOption } from '@/components/share/share-menu'
import { getSupportMessages, type SupportMessage } from '@/lib/support'

const CREATOR_TYPES = [
  'DJs', 'Artistas', 'Músicos', 'Fotógrafos', 'Escritores',
  'Podcasters', 'Streamers', 'Creadores de video', 'Emprendedores', 'Ilustradores',
]

const POST_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'link', label: 'Link / Video' },
  { value: 'image', label: 'Imagen' },
  { value: 'audio', label: 'Audio' },
]

interface Post {
  id: string
  title: string | null
  content: string
  post_type: string
  media_url: string | null
  media_urls: string[] | null
  created_at: string
}

interface Goal {
  id: string
  title: string
  description: string | null
  target_amount: number
  current_amount: number
  is_active: boolean
}

const inputCls =
  'w-full border border-borde rounded-lg px-3 py-2.5 text-sm text-tinta outline-none bg-white focus:border-rosa/60 focus:ring-2 focus:ring-rosa/15 transition-shadow'
const labelCls = 'text-[12px] font-semibold text-tinta mb-1.5 block'
const primaryBtn =
  'bg-rosa hover:bg-rosa-hover text-white rounded-lg px-5 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-colors'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, profile, refreshProfile, getClient } = useAuth()
  const router = useRouter()

  // Creators without a username haven't finished onboarding — send them there.
  const needsOnboarding = !!profile && (profile as any).role === 'artist' && !(profile as any).username
  useEffect(() => {
    if (needsOnboarding) router.replace('/onboarding')
  }, [needsOnboarding, router])

  const [posts, setPosts] = useState<Post[]>([])
  const [goal, setGoal] = useState<Goal | null>(null)
  const [supports, setSupports] = useState<SupportMessage[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Post form
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postType, setPostType] = useState('text')
  const [postMediaUrl, setPostMediaUrl] = useState('')
  const [postImages, setPostImages] = useState<string[]>([])
  const [savingPost, setSavingPost] = useState(false)
  const [postMsg, setPostMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [uploadingPostImage, setUploadingPostImage] = useState(false)

  // Goal form
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDesc, setGoalDesc] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)
  const [goalMsg, setGoalMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Profile form
  const [profileName, setProfileName] = useState('')
  const [profileUsername, setProfileUsername] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileCreatorType, setProfileCreatorType] = useState('')
  const [profileWebsite, setProfileWebsite] = useState('')
  const [profileLocation, setProfileLocation] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // MercadoPago connection
  const [connectingMp, setConnectingMp] = useState(false)
  const [mpMsg, setMpMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Cover + avatar
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const postImageInputRef = useRef<HTMLInputElement>(null)

  const loadData = useCallback(async () => {
    const client = getClient()
    if (!user || !client) {
      setLoadingData(false)
      return
    }
    setLoadingData(true)
    try {
      const [{ data: postsData }, { data: goalData }, supportsData] = await Promise.all([
        client.from('posts').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }),
        client.from('goals').select('*').eq('creator_id', user.id).eq('is_active', true).limit(1).maybeSingle(),
        getSupportMessages(client, user.id, 60),
      ])
      setPosts(postsData ?? [])
      setGoal(goalData ?? null)
      setSupports(supportsData)
    } catch (err) {
      console.error('[loadData]', err)
    } finally {
      setLoadingData(false)
    }
  }, [user?.id, getClient])

  useEffect(() => { loadData() }, [loadData])

  // Handle the return from the MercadoPago OAuth flow (?mp=connected|error).
  useEffect(() => {
    const mp = new URLSearchParams(window.location.search).get('mp')
    if (mp === 'connected') {
      setMpMsg({ ok: true, text: '¡MercadoPago conectado! Ya podés recibir apoyos.' })
      refreshProfile()
      window.history.replaceState({}, '', '/dashboard')
    } else if (mp === 'error') {
      setMpMsg({ ok: false, text: 'No se pudo conectar MercadoPago. Intentá de nuevo.' })
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [refreshProfile])

  // Pre-fill profile form when profile loads
  useEffect(() => {
    if (profile) {
      const p = profile as any
      setProfileName(p.name ?? '')
      setProfileUsername(p.username ?? '')
      setProfileBio(p.bio ?? '')
      setProfileCreatorType(p.creator_type ?? '')
      setProfileWebsite(p.website ?? '')
      setProfileLocation(p.location ?? '')
      setBannerUrl(p.banner_url ?? null)
      setAvatarUrl(p.avatar_url ?? null)
    }
  }, [profile])

  // Pre-fill goal form when goal loads
  useEffect(() => {
    if (goal) {
      setGoalTitle(goal.title)
      setGoalDesc(goal.description ?? '')
      setGoalTarget(String(goal.target_amount))
    }
  }, [goal])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = getClient()
    const isImage = postType === 'image'
    // Allow a post with just image(s) (no text) or just text.
    if (!user || !client || (!postContent.trim() && (isImage ? postImages.length === 0 : !postMediaUrl.trim()))) return
    setSavingPost(true)
    setPostMsg(null)
    try {
      const { error } = await client.from('posts').insert({
        creator_id: user.id,
        title: postTitle.trim() || null,
        content: postContent.trim(),
        post_type: postType,
        // Images go in media_urls (carousel); media_url keeps the first for compat.
        media_url: isImage ? postImages[0] ?? null : postMediaUrl.trim() || null,
        media_urls: isImage && postImages.length > 0 ? postImages : null,
      })
      if (error) {
        setPostMsg({ ok: false, text: 'Error al publicar. Intentá de nuevo.' })
      } else {
        setPostMsg({ ok: true, text: '¡Publicación creada!' })
        setPostTitle(''); setPostContent(''); setPostMediaUrl(''); setPostImages([]); setPostType('text')
        await loadData()
      }
    } catch (err) {
      console.error('[createPost]', err)
      setPostMsg({ ok: false, text: 'Error inesperado. Intentá de nuevo.' })
    } finally {
      setSavingPost(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    const client = getClient()
    if (!client || !user) return
    setDeletingPostId(id)
    try {
      const { error } = await client.from('posts').delete().eq('id', id).eq('creator_id', user.id)
      if (error) {
        console.error('[deletePost]', error)
        setPostMsg({ ok: false, text: 'Error al eliminar la publicación.' })
      } else {
        setPosts((prev) => prev.filter((p) => p.id !== id))
      }
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = getClient()
    if (!user || !client || !goalTitle.trim() || !goalTarget) return
    const amount = parseFloat(goalTarget.replace(/\./g, '').replace(',', '.'))
    if (isNaN(amount) || amount <= 0) {
      setGoalMsg({ ok: false, text: 'El monto debe ser mayor a 0.' })
      return
    }
    setSavingGoal(true)
    setGoalMsg(null)
    try {
      if (goal) {
        const { error } = await client.from('goals').update({
          title: goalTitle.trim(),
          description: goalDesc.trim() || null,
          target_amount: amount,
        }).eq('id', goal.id)
        setGoalMsg(error ? { ok: false, text: 'Error al guardar.' } : { ok: true, text: 'Meta actualizada.' })
      } else {
        const { error } = await client.from('goals').insert({
          creator_id: user.id,
          title: goalTitle.trim(),
          description: goalDesc.trim() || null,
          target_amount: amount,
          current_amount: 0,
          is_active: true,
        })
        setGoalMsg(error ? { ok: false, text: 'Error al crear la meta.' } : { ok: true, text: '¡Meta creada!' })
        if (!error) await loadData()
      }
    } catch (err) {
      console.error('[saveGoal]', err)
      setGoalMsg({ ok: false, text: 'Error inesperado. Intentá de nuevo.' })
    } finally {
      setSavingGoal(false)
    }
  }

  const handleDeactivateGoal = async () => {
    const client = getClient()
    if (!goal || !client) return
    await client.from('goals').update({ is_active: false }).eq('id', goal.id)
    setGoal(null)
    setGoalTitle(''); setGoalDesc(''); setGoalTarget('')
    setGoalMsg({ ok: true, text: 'Meta cerrada.' })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = getClient()
    if (!user || !client) return
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      const { error } = await client.from('profiles').update({
        name: profileName.trim() || null,
        username: profileUsername.trim().toLowerCase() || null,
        bio: profileBio.trim() || null,
        creator_type: profileCreatorType || null,
        website: profileWebsite.trim() || null,
        location: profileLocation.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
      if (error) {
        const msg = error.message.includes('unique') ? 'Ese username ya está en uso.' : 'Error al guardar el perfil.'
        setProfileMsg({ ok: false, text: msg })
      } else {
        setProfileMsg({ ok: true, text: 'Perfil actualizado.' })
        await refreshProfile()
      }
    } catch (err) {
      console.error('[saveProfile]', err)
      setProfileMsg({ ok: false, text: 'Error inesperado. Intentá de nuevo.' })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUploadImage = async (kind: 'banner' | 'avatar', file: File) => {
    const client = getClient()
    if (!user || !client) return
    if (!file.type.startsWith('image/')) { setProfileMsg({ ok: false, text: 'Elegí una imagen.' }); return }
    if (file.size > 5 * 1024 * 1024) { setProfileMsg({ ok: false, text: 'La imagen supera los 5MB.' }); return }

    const setUploading = kind === 'banner' ? setUploadingBanner : setUploadingAvatar
    const bucket = kind === 'banner' ? 'banners' : 'avatars'
    const col = kind === 'banner' ? 'banner_url' : 'avatar_url'
    setUploading(true)
    setProfileMsg(null)
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${user.id}/${kind}-${Date.now()}.${ext}`
      const { error: upErr } = await client.storage.from(bucket).upload(path, file, { upsert: true, cacheControl: '3600' })
      if (upErr) throw upErr
      const { data } = client.storage.from(bucket).getPublicUrl(path)
      const url = data.publicUrl
      const { error: dbErr } = await client.from('profiles').update({ [col]: url }).eq('id', user.id)
      if (dbErr) throw dbErr
      if (kind === 'banner') setBannerUrl(url); else setAvatarUrl(url)
      await refreshProfile()
    } catch (err) {
      console.error(`[upload ${kind}]`, err)
      setProfileMsg({ ok: false, text: 'No se pudo subir la imagen. Intentá de nuevo.' })
    } finally {
      setUploading(false)
    }
  }

  const MAX_POST_IMAGES = 10

  // Uploads one or more post images to the public `posts` bucket (owner-folder RLS,
  // same as banners/avatars) and appends their public URLs to postImages (carousel).
  const handleUploadPostImages = async (files: FileList) => {
    const client = getClient()
    if (!user || !client) return
    const picked = Array.from(files)
    const room = MAX_POST_IMAGES - postImages.length
    if (room <= 0) { setPostMsg({ ok: false, text: `Máximo ${MAX_POST_IMAGES} imágenes.` }); return }
    const batch = picked.slice(0, room)

    setUploadingPostImage(true)
    setPostMsg(null)
    try {
      const uploaded: string[] = []
      for (const file of batch) {
        if (!file.type.startsWith('image/')) { setPostMsg({ ok: false, text: 'Elegí solo imágenes.' }); continue }
        if (file.size > 5 * 1024 * 1024) { setPostMsg({ ok: false, text: 'Cada imagen debe pesar menos de 5MB.' }); continue }
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
        const path = `${user.id}/post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error: upErr } = await client.storage.from('posts').upload(path, file, { upsert: true, cacheControl: '3600' })
        if (upErr) throw upErr
        uploaded.push(client.storage.from('posts').getPublicUrl(path).data.publicUrl)
      }
      if (uploaded.length > 0) {
        setPostImages((prev) => [...prev, ...uploaded])
        setPostType('image')
      }
    } catch (err) {
      console.error('[upload post images]', err)
      setPostMsg({ ok: false, text: 'No se pudo subir alguna imagen. Intentá de nuevo.' })
    } finally {
      setUploadingPostImage(false)
    }
  }

  const handleConnectMp = async () => {
    const client = getClient()
    if (!client) return
    setConnectingMp(true)
    setMpMsg(null)
    try {
      const { data } = await client.auth.getSession()
      const token = data.session?.access_token
      const res = await fetch('/api/mp/oauth/start', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('start failed')
      const { url } = await res.json()
      window.location.href = url // → MercadoPago authorization
    } catch (err) {
      console.error('[connect mp]', err)
      setMpMsg({ ok: false, text: 'No se pudo iniciar la conexión con MercadoPago.' })
      setConnectingMp(false)
    }
  }

  if (!profile || needsOnboarding) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rosa" />
      </div>
    )
  }

  const isCreator = profile.role === 'artist'
  const goalPercent = goal ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100) : 0
  const p = profile as any
  const username: string = p.username ?? ''
  const initials = (profileName || p.name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const metaShareOptions: ShareOption[] = username
    ? [
        { key: 'story', label: 'Historia', hint: '1080×1920', url: `/api/share/meta/${username}`, filename: 'impulso-meta-historia.png' },
        { key: 'feed', label: 'Publicación (feed)', hint: '1080×1350', url: `/api/share/meta/${username}?format=post`, filename: 'impulso-meta-feed.png' },
      ]
    : []

  const postShareOptions = (postId: string): ShareOption[] => [
    { key: 'story', label: 'Historia', hint: '1080×1920', url: `/api/share/post/${postId}`, filename: 'impulso-publicacion-historia.png' },
    { key: 'square', label: 'Cuadrado (feed)', hint: '1080×1080', url: `/api/share/post/${postId}?format=square`, filename: 'impulso-publicacion-cuadrado.png' },
  ]
  const lastPostLabel = posts.length
    ? `Última: ${formatDistanceToNow(new Date(posts[0].created_at), { locale: es, addSuffix: true })}`
    : 'Sin publicaciones aún'

  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <Header />

      <main className="wrap py-8 flex-1 w-full">
        {/* Page header */}
        <h1 className="disp text-tinta text-[24px] uppercase mb-0.5">Mi panel</h1>
        <p className="text-txt2 text-[13px] mb-5">
          {isCreator ? 'Gestioná tu contenido y tus metas' : 'Tu espacio en Impulso'}
        </p>

        {isCreator && (
          <>
            {/* Connection status message (from the ?mp= OAuth return, or errors) */}
            {mpMsg && (
              <div className="mb-4"><Feedback ok={mpMsg.ok} text={mpMsg.text} /></div>
            )}

            {/* Prominent "connect MercadoPago" banner while not connected */}
            {!p.mp_connected && (
              <div className="bg-tinta rounded-xl p-4 mb-5 flex items-center justify-between gap-4 flex-wrap relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full" style={{ background: 'rgba(240,53,92,0.18)' }} />
                <div className="relative">
                  <p className="text-crema font-semibold text-sm mb-0.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-naranja shrink-0" />
                    Conectá MercadoPago para recibir apoyos
                  </p>
                  <p className="text-[rgba(251,247,242,0.6)] text-[12px] max-w-md">
                    Sin esto, tus seguidores no pueden apoyarte. Toma menos de un minuto.
                  </p>
                </div>
                <button
                  onClick={handleConnectMp}
                  disabled={connectingMp}
                  className="relative bg-rosa hover:bg-rosa-hover text-white rounded-lg px-5 py-2.5 text-[13px] font-semibold inline-flex items-center gap-2 shrink-0 disabled:opacity-60 transition-colors"
                >
                  {connectingMp && <Loader2 className="w-4 h-4 animate-spin" />}
                  Conectar MercadoPago
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2.5">
              <StatCard
                icon={<FileText className="w-3.5 h-3.5 text-tinta" />}
                iconBg="rgba(27,26,46,0.08)"
                label="Publicaciones"
                value={loadingData ? '—' : String(posts.length)}
                sub={loadingData ? '' : lastPostLabel}
              />
              <StatCard
                icon={<Target className="w-3.5 h-3.5 text-naranja-ink" />}
                iconBg="rgba(255,157,61,0.15)"
                label="Meta activa"
                value={goal ? `${goalPercent}%` : '—'}
                sub={goal ? goal.title : 'Sin meta activa'}
              />
              <StatCard
                icon={<DollarSign className="w-3.5 h-3.5 text-rosa" />}
                iconBg="rgba(240,53,92,0.10)"
                label="Recaudado"
                value={goal ? `$${Number(goal.current_amount).toLocaleString('es-AR')}` : '$0'}
                sub={goal ? `de $${Number(goal.target_amount).toLocaleString('es-AR')}` : 'Sin meta activa'}
              />
              {/* Cobros — MercadoPago connection status */}
              <div className="bg-white border border-borde rounded-[10px] p-3.5 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0"
                    style={{ background: p.mp_connected ? 'rgba(47,174,102,0.12)' : 'rgba(240,53,92,0.10)' }}
                  >
                    <Wallet className="w-3.5 h-3.5" style={{ color: p.mp_connected ? '#2FAE66' : '#F0355C' }} />
                  </div>
                  <span className="text-[10.5px] text-txt2">Cobros</span>
                </div>
                {p.mp_connected ? (
                  <>
                    <p className="text-[15px] font-semibold text-exito leading-none mb-1">Conectado</p>
                    <p className="text-[10.5px] text-muted2">MercadoPago listo</p>
                  </>
                ) : (
                  <>
                    <p className="text-[15px] font-semibold text-rosa leading-none mb-1">Sin conectar</p>
                    <button onClick={handleConnectMp} className="text-[10.5px] text-rosa font-semibold hover:underline text-left">
                      Conectar MercadoPago →
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Net earnings note — the goal bar shows gross; clarify take-home */}
            {goal && Number(goal.current_amount) > 0 ? (
              <p className="text-[11px] text-muted2 mb-6">
                De <span className="font-semibold text-txt2">${Number(goal.current_amount).toLocaleString('es-AR')}</span> recaudados,
                Impulso retiene <span className="font-semibold text-txt2">${Math.round(Number(goal.current_amount) * 0.1).toLocaleString('es-AR')}</span> (10%).
                Recibís <span className="font-semibold text-txt2">${Math.round(Number(goal.current_amount) * 0.9).toLocaleString('es-AR')}</span> menos la comisión de MercadoPago.
              </p>
            ) : (
              <p className="text-[11px] text-muted2 mb-6">
                Los montos de la meta son en bruto: de cada apoyo recibís el <span className="font-semibold text-txt2">90%</span> (Impulso retiene 10%) menos la comisión de MercadoPago.
              </p>
            )}

            <Tabs defaultValue="posts">
              <TabsList className="w-full justify-start gap-1 bg-transparent border-b border-borde rounded-none p-0 h-auto mb-6">
                {[
                  { v: 'posts', icon: FileText, label: 'Publicaciones' },
                  { v: 'goal', icon: Target, label: 'Mi meta' },
                  { v: 'apoyos', icon: Heart, label: 'Apoyos' },
                  { v: 'profile', icon: User, label: 'Mi perfil' },
                ].map(({ v, icon: Icon, label }) => (
                  <TabsTrigger
                    key={v}
                    value={v}
                    className="flex-none rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent shadow-none text-txt2 px-3.5 py-2.5 -mb-px gap-1.5 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-rosa data-[state=active]:text-rosa"
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* POSTS TAB */}
              <TabsContent value="posts">
                <div className="grid lg:grid-cols-5 gap-5">
                  {/* Create post */}
                  <div className="lg:col-span-2">
                    <div className="bg-white border border-borde rounded-xl p-4 lg:sticky lg:top-6">
                      <p className="font-semibold text-tinta text-sm flex items-center gap-2 mb-4">
                        <Plus className="w-4 h-4 text-rosa" /> Nueva publicación
                      </p>
                      <form onSubmit={handleCreatePost} className="space-y-3.5">
                        <div>
                          <Label className={labelCls}>Tipo</Label>
                          <select value={postType} onChange={(e) => setPostType(e.target.value)} className={inputCls}>
                            {POST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="post-title" className={labelCls}>Título (opcional)</Label>
                          <input id="post-title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="Título de la publicación" className={inputCls} />
                        </div>
                        <div>
                          <Label htmlFor="post-content" className={labelCls}>
                            {postType === 'image' ? 'Descripción (opcional)' : 'Contenido *'}
                          </Label>
                          <Textarea id="post-content" value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="¿Qué querés compartir?" rows={4} />
                        </div>

                        {postType === 'image' && (
                          <div>
                            <Label className={labelCls}>Imágenes</Label>
                            {postImages.length > 0 && (
                              <div className="grid grid-cols-3 gap-2 mb-2">
                                {postImages.map((url, i) => (
                                  <div key={url} className="relative aspect-square">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-borde" />
                                    <button
                                      type="button"
                                      onClick={() => setPostImages((prev) => prev.filter((u) => u !== url))}
                                      aria-label="Quitar imagen"
                                      className="absolute top-1 right-1 bg-tinta/70 hover:bg-tinta text-white rounded-full p-1 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                    {i === 0 && (
                                      <span className="absolute bottom-1 left-1 bg-tinta/75 text-white text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full">Portada</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {postImages.length < MAX_POST_IMAGES && (
                              <button
                                type="button"
                                onClick={() => postImageInputRef.current?.click()}
                                disabled={uploadingPostImage}
                                className="w-full border border-dashed border-borde rounded-lg py-5 flex flex-col items-center justify-center gap-1.5 text-txt2 hover:border-rosa hover:text-rosa transition-colors disabled:opacity-60"
                              >
                                {uploadingPostImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                <span className="text-[12px] font-medium">
                                  {uploadingPostImage ? 'Subiendo...' : postImages.length > 0 ? 'Agregar más' : 'Subir imágenes'}
                                </span>
                                <span className="text-[10px] text-muted2">Hasta {MAX_POST_IMAGES} · JPG, PNG, GIF o WEBP · 5MB c/u</span>
                              </button>
                            )}
                            <input
                              ref={postImageInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => { const fs = e.target.files; e.target.value = ''; if (fs && fs.length) handleUploadPostImages(fs) }}
                            />
                          </div>
                        )}

                        {(postType === 'link' || postType === 'audio') && (
                          <div>
                            <Label htmlFor="post-url" className={labelCls}>URL</Label>
                            <input id="post-url" value={postMediaUrl} onChange={(e) => setPostMediaUrl(e.target.value)} placeholder="https://..." className={inputCls} />
                          </div>
                        )}
                        {postMsg && <Feedback ok={postMsg.ok} text={postMsg.text} />}
                        <button type="submit" className={`w-full ${primaryBtn}`} disabled={savingPost || uploadingPostImage || (!postContent.trim() && (postType === 'image' ? postImages.length === 0 : !postMediaUrl.trim()))}>
                          {savingPost && <Loader2 className="w-4 h-4 animate-spin" />} Publicar
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Posts list */}
                  <div className="lg:col-span-3 space-y-2.5">
                    {loadingData ? (
                      <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-rosa/60" /></div>
                    ) : posts.length === 0 ? (
                      <div className="bg-white border border-dashed border-borde rounded-xl py-12 text-center">
                        <FileText className="w-10 h-10 text-muted2 mx-auto mb-3" />
                        <p className="text-txt2 font-medium text-sm">Sin publicaciones todavía</p>
                        <p className="text-muted2 text-xs mt-1">Creá tu primera publicación a la izquierda.</p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-white border border-borde rounded-[10px] p-3.5"
                          style={{ borderLeft: `4px solid ${postAccent(post.post_type)}` }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {post.post_type === 'image' && (post.media_urls?.[0] || post.media_url) && (
                              <div className="relative shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={post.media_urls?.[0] || post.media_url || ''} alt="" className="w-12 h-12 rounded object-cover border border-borde" />
                                {(post.media_urls?.length ?? 0) > 1 && (
                                  <span className="absolute -top-1 -right-1 bg-tinta text-white text-[9px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                                    {post.media_urls!.length}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              {post.title && <p className="font-semibold text-tinta text-[13px] mb-1 truncate">{post.title}</p>}
                              {post.content && <p className="text-txt2 text-[12px] leading-relaxed line-clamp-2">{post.content}</p>}
                              <div className="flex items-center gap-2.5 mt-2">
                                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border border-borde text-txt2 capitalize">
                                  {post.post_type}
                                </span>
                                <span className="text-[10px] text-muted2">
                                  {format(new Date(post.created_at), 'd MMM yyyy', { locale: es })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                            {username && <ShareMenu options={postShareOptions(post.id)} compact />}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="text-muted2 hover:text-red-500 shrink-0 p-1 disabled:opacity-50"
                                  disabled={deletingPostId === post.id}
                                  aria-label="Eliminar"
                                >
                                  {deletingPostId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
                                  <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeletePost(post.id)}>
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* GOAL TAB */}
              <TabsContent value="goal">
                <div className="max-w-xl">
                  {goal && (
                    <div className="bg-white border-2 border-tinta rounded-xl overflow-hidden mb-5">
                      <div className="h-1.5 bg-naranja" />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-naranja text-[10px] font-bold uppercase tracking-[0.06em] mb-1">Meta activa</p>
                            <p className="disp text-tinta text-[17px] uppercase leading-tight">{goal.title}</p>
                            {goal.description && <p className="text-txt2 text-[12px] mt-1">{goal.description}</p>}
                          </div>
                          <span className="bg-exito/10 text-exito text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0">Activa</span>
                        </div>
                        <div className="h-2 bg-track rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-rosa" style={{ width: `${goalPercent}%` }} />
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="disp text-tinta text-[24px] leading-none">{goalPercent}%</span>
                          <span className="text-[12px] text-txt2">
                            ${Number(goal.current_amount).toLocaleString('es-AR')} de ${Number(goal.target_amount).toLocaleString('es-AR')}
                          </span>
                        </div>
                        {username && (
                          <div className="mt-4 pt-3 border-t border-borde flex items-center justify-between gap-3">
                            <p className="text-[11px] text-muted2 leading-tight">
                              Compartí tu meta en Instagram y sumá apoyos.
                            </p>
                            <ShareMenu options={metaShareOptions} triggerLabel="Compartir" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-borde rounded-xl p-4">
                    <p className="font-semibold text-tinta text-sm mb-4">{goal ? 'Editar meta' : 'Crear una meta'}</p>
                    <form onSubmit={handleSaveGoal} className="space-y-3.5">
                      <div>
                        <Label htmlFor="goal-title" className={labelCls}>¿Qué querés lograr? *</Label>
                        <input id="goal-title" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="Ej: Nuevo sintetizador para grabar el EP" className={inputCls} required />
                      </div>
                      <div>
                        <Label htmlFor="goal-desc" className={labelCls}>Descripción (opcional)</Label>
                        <Textarea id="goal-desc" value={goalDesc} onChange={(e) => setGoalDesc(e.target.value)} placeholder="Contá más sobre este proyecto..." rows={3} />
                      </div>
                      <div>
                        <Label htmlFor="goal-amount" className={labelCls}>Monto objetivo (ARS) *</Label>
                        <input id="goal-amount" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} placeholder="150000" className={inputCls} required />
                      </div>
                      {goalMsg && <Feedback ok={goalMsg.ok} text={goalMsg.text} />}
                      <div className="flex gap-3 pt-1">
                        <button type="submit" className={`flex-1 ${primaryBtn}`} disabled={savingGoal}>
                          {savingGoal && <Loader2 className="w-4 h-4 animate-spin" />}
                          {goal ? 'Guardar cambios' : 'Crear meta'}
                        </button>
                        {goal && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button type="button" className="border border-red-200 text-red-500 hover:bg-red-50 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors">
                                Cerrar meta
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Cerrar esta meta?</AlertDialogTitle>
                                <AlertDialogDescription>La meta se desactivará y dejará de mostrarse en tu perfil.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeactivateGoal}>Cerrar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </TabsContent>

              {/* APOYOS TAB */}
              <TabsContent value="apoyos">
                <div className="max-w-2xl">
                  <p className="text-[13px] text-txt2 mb-4">
                    Mensajes que te dejaron quienes te apoyaron. También se muestran en tu perfil público.
                  </p>
                  {loadingData ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-rosa/60" /></div>
                  ) : supports.length === 0 ? (
                    <div className="bg-white border border-dashed border-borde rounded-xl py-12 text-center">
                      <Heart className="w-10 h-10 text-muted2 mx-auto mb-3" />
                      <p className="text-txt2 font-medium text-sm">Todavía no recibiste mensajes</p>
                      <p className="text-muted2 text-xs mt-1">Cuando alguien te apoye y deje un mensaje, va a aparecer acá.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {supports.map((s) => (
                        <div key={s.id} className="bg-white border border-borde rounded-[10px] p-3.5" style={{ borderLeft: '4px solid #F0355C' }}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-tinta text-[13px] truncate">{s.name}</span>
                            <span className="text-rosa font-bold text-[13px] shrink-0">${s.amount.toLocaleString('es-AR')}</span>
                          </div>
                          <p className="text-txt2 text-[12px] leading-relaxed whitespace-pre-wrap">{s.message}</p>
                          <span className="block text-[10px] text-muted2 mt-2">
                            {format(new Date(s.created_at), "d MMM yyyy", { locale: es })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* PROFILE TAB */}
              <TabsContent value="profile">
                <div className="max-w-2xl">
                  {/* MercadoPago cobros */}
                  <div className="bg-white border border-borde rounded-xl p-4 mb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-tinta text-sm mb-0.5">Cobros con MercadoPago</p>
                        <p className="text-txt2 text-[12px] max-w-sm">
                          {p.mp_connected
                            ? 'Tu cuenta está conectada. Los apoyos van directo a tu MercadoPago (Impulso retiene 10%).'
                            : 'Conectá tu cuenta para recibir el dinero de tus apoyos directo en MercadoPago.'}
                        </p>
                      </div>
                      {p.mp_connected ? (
                        <span className="shrink-0 inline-flex items-center gap-1.5 bg-exito/10 text-exito text-[12px] font-semibold px-2.5 py-1.5 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" /> Conectado
                        </span>
                      ) : (
                        <button onClick={handleConnectMp} disabled={connectingMp} className={`${primaryBtn} shrink-0 whitespace-nowrap`}>
                          {connectingMp && <Loader2 className="w-4 h-4 animate-spin" />}
                          Conectar MercadoPago
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-borde rounded-xl overflow-hidden">
                    {/* Cover + avatar */}
                    <div className="relative">
                      <div className="h-28 bg-tinta overflow-hidden relative">
                        {bannerUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <span className="absolute -top-[60px] -right-[20px] w-[160px] h-[160px] rounded-full" style={{ background: 'rgba(255,157,61,0.18)' }} />
                            <span className="absolute -bottom-[60px] left-[60px] w-[120px] h-[120px] rounded-full" style={{ background: 'rgba(240,53,92,0.22)' }} />
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          disabled={uploadingBanner}
                          className="absolute top-2.5 right-2.5 bg-[rgba(27,26,46,0.55)] hover:bg-[rgba(27,26,46,0.8)] text-crema rounded-md px-2.5 py-1.5 text-[10.5px] font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-70"
                        >
                          {uploadingBanner ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                          Cambiar portada
                        </button>
                        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUploadImage('banner', f) }} />
                      </div>

                      {/* Avatar */}
                      <div className="absolute -bottom-[26px] left-5">
                        <div className="relative w-16 h-16">
                          {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-white box-border" />
                          ) : (
                            <div className="disp w-16 h-16 rounded-full bg-rosa text-white flex items-center justify-center text-lg border-4 border-white box-border">
                              {initials}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            aria-label="Cambiar avatar"
                            className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-white border border-borde flex items-center justify-center hover:bg-crema transition-colors"
                          >
                            {uploadingAvatar ? <Loader2 className="w-2.5 h-2.5 animate-spin text-tinta" /> : <Pencil className="w-2.5 h-2.5 text-tinta" />}
                          </button>
                          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUploadImage('avatar', f) }} />
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSaveProfile} className="pt-11 px-5 pb-5">
                      <Label htmlFor="prof-name" className={labelCls}>Nombre para mostrar</Label>
                      <input id="prof-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Tu nombre" className={`${inputCls} mb-3`} />

                      <Label htmlFor="prof-username" className={labelCls}>Username *</Label>
                      <div className="flex items-center border border-borde rounded-lg overflow-hidden focus-within:border-rosa/60 focus-within:ring-2 focus-within:ring-rosa/15 mb-3 transition-shadow">
                        <span className="px-3 text-muted2 text-sm bg-crema border-r border-borde h-[42px] flex items-center">impulso.app/</span>
                        <input id="prof-username" value={profileUsername}
                          onChange={(e) => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="tuusuario" className="flex-1 px-3 h-[42px] text-sm outline-none text-tinta bg-white" required />
                      </div>

                      <Label className={labelCls}>Categoría</Label>
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {CREATOR_TYPES.map((t) => {
                          const active = profileCreatorType === t
                          return (
                            <button key={t} type="button" onClick={() => setProfileCreatorType(active ? '' : t)}
                              className={active
                                ? 'bg-naranja text-tinta font-bold text-[11px] px-3 py-1.5 rounded-full'
                                : 'border border-borde text-txt2 hover:border-naranja/50 text-[11px] px-3 py-1.5 rounded-full transition-colors'}>
                              {t}
                            </button>
                          )
                        })}
                      </div>

                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="prof-bio" className="text-[12px] font-semibold text-tinta">Bio</Label>
                        <span className="text-[10px] text-muted2">{profileBio.length}/500</span>
                      </div>
                      <Textarea id="prof-bio" value={profileBio} onChange={(e) => setProfileBio(e.target.value)}
                        placeholder="Contá quién sos en pocas palabras..." rows={3} maxLength={500} className="mb-3" />

                      <div className="grid sm:grid-cols-2 gap-3 mb-4">
                        <div>
                          <Label htmlFor="prof-website" className={labelCls}>Link externo</Label>
                          <input id="prof-website" value={profileWebsite} onChange={(e) => setProfileWebsite(e.target.value)} placeholder="https://..." className={inputCls} />
                        </div>
                        <div>
                          <Label htmlFor="prof-location" className={labelCls}>Ubicación</Label>
                          <input id="prof-location" value={profileLocation} onChange={(e) => setProfileLocation(e.target.value)} placeholder="Ej: Buenos Aires" className={inputCls} />
                        </div>
                      </div>

                      {profileMsg && <div className="mb-3"><Feedback ok={profileMsg.ok} text={profileMsg.text} /></div>}

                      <div className="flex items-center gap-3">
                        <button type="submit" className={primaryBtn} disabled={savingProfile}>
                          {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />} Guardar cambios
                        </button>
                        {profileUsername && (
                          <Link href={`/${profileUsername}`} target="_blank" className="text-rosa hover:text-rosa-hover text-[13px] font-semibold inline-flex items-center gap-1">
                            <ExternalLink className="w-3.5 h-3.5" /> Ver perfil público
                          </Link>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        {!isCreator && (
          <div className="bg-white border border-borde rounded-xl p-6 text-center max-w-md">
            <p className="text-4xl mb-3">❤️</p>
            <h2 className="disp text-tinta text-lg uppercase mb-2">Bienvenido, {profile.name}!</h2>
            <p className="text-txt2 text-sm mb-5">Tu cuenta de seguidor está lista. Explorá creadores y apoyá su trabajo.</p>
            <Link href="/discover" className={`w-full ${primaryBtn}`}>Explorar creadores</Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function postAccent(postType: string): string {
  switch (postType) {
    case 'audio': return '#F0355C'
    case 'image':
    case 'link': return '#FF9D3D'
    default: return '#1B1A2E'
  }
}

function StatCard({
  icon, iconBg, label, value, valueMuted, sub,
}: {
  icon: React.ReactNode; iconBg: string; label: string; value: string; valueMuted?: boolean; sub?: string
}) {
  return (
    <div className="bg-white border border-borde rounded-[10px] p-3.5 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
        <span className="text-[10.5px] text-txt2">{label}</span>
      </div>
      <p className={valueMuted ? 'text-[15px] italic text-muted2 mb-0.5' : 'disp text-[22px] text-tinta leading-none mb-1'}>{value}</p>
      {sub && <p className="text-[10.5px] text-muted2 truncate">{sub}</p>}
    </div>
  )
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${ok ? 'bg-exito/10 text-exito' : 'bg-red-50 text-red-700'}`}>
      {ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {text}
    </div>
  )
}
