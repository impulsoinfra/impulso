'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  FileText, Target, User, Plus, Trash2, ExternalLink,
  Loader2, LogOut, CheckCircle, AlertCircle, Eye,
} from 'lucide-react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CREATOR_TYPES = [
  'DJs', 'Artistas', 'Músicos', 'Fotógrafos', 'Escritores',
  'Podcasters', 'Streamers', 'Creadores de video', 'Emprendedores', 'Ilustradores',
]

interface Post {
  id: string
  title: string | null
  content: string
  post_type: string
  media_url: string | null
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const { user, profile, signOut, refreshProfile } = useAuth()

  // Create Supabase client lazily on the browser — avoids SSR null singleton issue
  const sbRef = useRef<SupabaseClient | null>(null)
  const db = useCallback((): SupabaseClient | null => {
    if (typeof window === 'undefined') return null
    if (!sbRef.current) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (url && key) sbRef.current = createClient(url, key)
    }
    return sbRef.current
  }, [])

  const [posts, setPosts] = useState<Post[]>([])
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  // Post form
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postType, setPostType] = useState('text')
  const [postMediaUrl, setPostMediaUrl] = useState('')
  const [savingPost, setSavingPost] = useState(false)
  const [postMsg, setPostMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Goal form
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDesc, setGoalDesc] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)
  const [goalMsg, setGoalMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Profile form
  const [profileUsername, setProfileUsername] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileCreatorType, setProfileCreatorType] = useState('')
  const [profileWebsite, setProfileWebsite] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const loadData = useCallback(async () => {
    const client = db(); if (!user || !client) {
      setLoadingData(false)
      return
    }
    setLoadingData(true)
    try {
      const [{ data: postsData }, { data: goalData }] = await Promise.all([
        client.from('posts').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }),
        client.from('goals').select('*').eq('creator_id', user.id).eq('is_active', true).limit(1).maybeSingle(),
      ])
      setPosts(postsData ?? [])
      setGoal(goalData ?? null)
    } catch (err) {
      console.error('[loadData]', err)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Pre-fill profile form when profile loads
  useEffect(() => {
    if (profile) {
      const p = profile as any
      setProfileUsername(p.username ?? '')
      setProfileBio(p.bio ?? '')
      setProfileCreatorType(p.creator_type ?? '')
      setProfileWebsite(p.website ?? '')
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
    const client = db()
    if (!user || !client || !postContent.trim()) return
    setSavingPost(true)
    setPostMsg(null)
    try {
      const { error } = await client.from('posts').insert({
        creator_id: user.id,
        title: postTitle.trim() || null,
        content: postContent.trim(),
        post_type: postType,
        media_url: postMediaUrl.trim() || null,
      })
      if (error) {
        setPostMsg({ ok: false, text: 'Error al publicar. Intentá de nuevo.' })
      } else {
        setPostMsg({ ok: true, text: '¡Publicación creada!' })
        setPostTitle('')
        setPostContent('')
        setPostMediaUrl('')
        setPostType('text')
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
    const client = db()
    if (!client) return
    await client.from('posts').delete().eq('id', id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = db()
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
    const client = db()
    if (!goal || !client) return
    await client.from('goals').update({ is_active: false }).eq('id', goal.id)
    setGoal(null)
    setGoalTitle('')
    setGoalDesc('')
    setGoalTarget('')
    setGoalMsg({ ok: true, text: 'Meta cerrada.' })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = db()
    if (!user || !client) return
    setSavingProfile(true)
    setProfileMsg(null)
    try {
      const { error } = await client.from('profiles').update({
        username: profileUsername.trim().toLowerCase() || null,
        bio: profileBio.trim() || null,
        creator_type: profileCreatorType || null,
        website: profileWebsite.trim() || null,
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    )
  }

  const isCreator = profile.role === 'artist'
  const goalPercent = goal ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100) : 0
  const p = profile as any

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi panel</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isCreator ? 'Gestioná tu contenido y metas' : 'Tu espacio en Impulso'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isCreator && p.username && (
              <Link href={`/${p.username}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50">
                  <Eye className="w-3.5 h-3.5" />
                  Ver perfil
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-600"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Salir
            </Button>
          </div>
        </div>

        {/* Stats */}
        {isCreator && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Publicaciones" value={loadingData ? '—' : String(posts.length)} />
            <StatCard
              label="Meta activa"
              value={goal ? `${goalPercent}%` : '—'}
              sub={goal ? goal.title : 'Sin meta'}
            />
            <StatCard
              label="Recaudado"
              value={goal ? `$${Number(goal.current_amount).toLocaleString('es-AR')}` : '$0'}
            />
            <StatCard label="Seguidores" value="Próximamente" sub="" />
          </div>
        )}

        {isCreator ? (
          <Tabs defaultValue="posts">
            <TabsList className="mb-6 bg-rose-50 border border-rose-100">
              <TabsTrigger value="posts" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-rose-700">
                <FileText className="w-4 h-4" /> Publicaciones
              </TabsTrigger>
              <TabsTrigger value="goal" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-rose-700">
                <Target className="w-4 h-4" /> Mi meta
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-rose-700">
                <User className="w-4 h-4" /> Mi perfil
              </TabsTrigger>
            </TabsList>

            {/* POSTS TAB */}
            <TabsContent value="posts">
              <div className="grid lg:grid-cols-5 gap-6">
                {/* Create post form */}
                <div className="lg:col-span-2">
                  <Card className="border border-rose-100 shadow-sm sticky top-24">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 text-rose-600" />
                        Nueva publicación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreatePost} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="post-type">Tipo</Label>
                          <Select value={postType} onValueChange={setPostType}>
                            <SelectTrigger id="post-type" className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="link">Link / Video</SelectItem>
                              <SelectItem value="image">Imagen</SelectItem>
                              <SelectItem value="audio">Audio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="post-title">Título (opcional)</Label>
                          <Input
                            id="post-title"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            placeholder="Título de la publicación"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="post-content">Contenido *</Label>
                          <Textarea
                            id="post-content"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="¿Qué querés compartir?"
                            rows={4}
                            required
                          />
                        </div>
                        {postType !== 'text' && (
                          <div className="space-y-1.5">
                            <Label htmlFor="post-url">URL</Label>
                            <Input
                              id="post-url"
                              value={postMediaUrl}
                              onChange={(e) => setPostMediaUrl(e.target.value)}
                              placeholder="https://..."
                              className="h-9"
                            />
                          </div>
                        )}
                        {postMsg && (
                          <Feedback ok={postMsg.ok} text={postMsg.text} />
                        )}
                        <Button
                          type="submit"
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                          disabled={savingPost || !postContent.trim()}
                        >
                          {savingPost ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Publicar
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Posts list */}
                <div className="lg:col-span-3 space-y-3">
                  {loadingData ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                    </div>
                  ) : posts.length === 0 ? (
                    <Card className="border border-dashed border-rose-200 bg-rose-50/50">
                      <CardContent className="py-12 text-center">
                        <FileText className="w-10 h-10 text-rose-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Sin publicaciones todavía</p>
                        <p className="text-gray-400 text-sm mt-1">Creá tu primera publicación a la izquierda.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    posts.map((post) => (
                      <Card key={post.id} className="border border-rose-100 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {post.title && (
                                <p className="font-semibold text-gray-900 mb-1 truncate">{post.title}</p>
                              )}
                              <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="text-xs border-rose-200 text-rose-600 capitalize">
                                  {post.post_type}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {format(new Date(post.created_at), "d MMM yyyy", { locale: es })}
                                </span>
                              </div>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 shrink-0">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => handleDeletePost(post.id)}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* GOAL TAB */}
            <TabsContent value="goal">
              <div className="max-w-xl">
                {goal && (
                  <Card className="border border-rose-100 shadow-sm mb-6">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-900">🎯 {goal.title}</p>
                          {goal.description && <p className="text-gray-500 text-sm mt-0.5">{goal.description}</p>}
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-0">Activa</Badge>
                      </div>
                      <Progress value={goalPercent} className="h-2.5 mb-2" />
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-rose-600">
                          ${Number(goal.current_amount).toLocaleString('es-AR')} recaudados
                        </span>
                        <span className="text-gray-400">
                          Meta ${Number(goal.target_amount).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <p className="text-center text-3xl font-bold text-gray-900 mt-4">{goalPercent}%</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="border border-rose-100 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {goal ? 'Editar meta' : 'Crear una meta'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveGoal} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="goal-title">¿Qué querés lograr? *</Label>
                        <Input
                          id="goal-title"
                          value={goalTitle}
                          onChange={(e) => setGoalTitle(e.target.value)}
                          placeholder="Ej: Nuevo sintetizador para grabar el EP"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="goal-desc">Descripción (opcional)</Label>
                        <Textarea
                          id="goal-desc"
                          value={goalDesc}
                          onChange={(e) => setGoalDesc(e.target.value)}
                          placeholder="Contá más sobre este proyecto..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="goal-amount">Monto objetivo (ARS) *</Label>
                        <Input
                          id="goal-amount"
                          value={goalTarget}
                          onChange={(e) => setGoalTarget(e.target.value)}
                          placeholder="150000"
                          required
                        />
                      </div>
                      {goalMsg && <Feedback ok={goalMsg.ok} text={goalMsg.text} />}
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                          disabled={savingGoal}
                        >
                          {savingGoal && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                          {goal ? 'Guardar cambios' : 'Crear meta'}
                        </Button>
                        {goal && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button type="button" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50">
                                Cerrar meta
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Cerrar esta meta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  La meta se desactivará y dejará de mostrarse en tu perfil.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={handleDeactivateGoal}
                                >
                                  Cerrar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* PROFILE TAB */}
            <TabsContent value="profile">
              <div className="max-w-xl">
                <Card className="border border-rose-100 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Información del perfil</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="prof-username">Username *</Label>
                        <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <span className="px-3 text-gray-400 text-sm bg-gray-50 border-r h-9 flex items-center">
                            impulso.app/
                          </span>
                          <input
                            id="prof-username"
                            value={profileUsername}
                            onChange={(e) => setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            placeholder="tuusuario"
                            className="flex-1 px-3 h-9 text-sm outline-none bg-white"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-400">Solo letras, números y guiones bajos.</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="prof-bio">Bio</Label>
                        <Textarea
                          id="prof-bio"
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          placeholder="Contá quién sos en pocas palabras..."
                          rows={3}
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-400 text-right">{profileBio.length}/500</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="prof-type">Tipo de creador</Label>
                        <Select value={profileCreatorType} onValueChange={setProfileCreatorType}>
                          <SelectTrigger id="prof-type">
                            <SelectValue placeholder="Elegí tu categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {CREATOR_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="prof-website">Sitio web o red social</Label>
                        <Input
                          id="prof-website"
                          value={profileWebsite}
                          onChange={(e) => setProfileWebsite(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      {profileMsg && <Feedback ok={profileMsg.ok} text={profileMsg.text} />}
                      <Button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                        disabled={savingProfile}
                      >
                        {savingProfile && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Guardar perfil
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {profileUsername && (
                  <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tu perfil público</p>
                      <p className="text-xs text-rose-600 font-mono mt-0.5">impulso.app/{profileUsername}</p>
                    </div>
                    <Link href={`/${profileUsername}`} target="_blank">
                      <Button size="sm" variant="outline" className="border-rose-300 text-rose-700 hover:bg-white gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* SUPPORTER VIEW */
          <Card className="border border-rose-100 shadow-sm max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-4xl mb-3">❤️</p>
              <h2 className="font-bold text-gray-900 mb-2">Bienvenido, {profile.name}!</h2>
              <p className="text-gray-500 text-sm mb-5">
                Tu cuenta de seguidor está lista. Explorá creadores y apoyá su trabajo.
              </p>
              <Link href="/discover">
                <Button className="bg-rose-600 hover:bg-rose-700 text-white w-full">
                  Explorar creadores
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="border border-rose-100 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub !== undefined && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
      {ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {text}
    </div>
  )
}
