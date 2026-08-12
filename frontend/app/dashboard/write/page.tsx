'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ArticleEditor } from '@/components/posts/article-editor'
import { uploadPostFile } from '@/lib/storage'
import { articleExcerpt, firstArticleImage, isArticleEmpty, type ArticleDoc } from '@/lib/article'
import { ArrowLeft, ImagePlus, Trash2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const TOP_BAR = 56 // px — height of the sticky top bar

export default function WriteArticlePage() {
  return (
    <ProtectedRoute>
      <WriteArticleContent />
    </ProtectedRoute>
  )
}

function WriteArticleContent() {
  const { user, profile, getClient } = useAuth()
  const router = useRouter()

  const role = (profile as any)?.role
  const username = (profile as any)?.username as string | undefined

  // Only creators with a finished profile can write articles.
  useEffect(() => {
    if (!profile) return
    if (role !== 'creator') router.replace('/dashboard')
    else if (!username) router.replace('/onboarding')
  }, [profile, role, username, router])

  const [title, setTitle] = useState('')
  const [cover, setCover] = useState<string | null>(null)
  const [body, setBody] = useState<ArticleDoc | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    const client = getClient()
    if (!user || !client) throw new Error('No autenticado')
    return uploadPostFile(client, user.id, file)
  }

  const handleUploadCover = async (file: File) => {
    if (!file.type.startsWith('image/')) { setMsg({ ok: false, text: 'Elegí una imagen.' }); return }
    if (file.size > 10 * 1024 * 1024) { setMsg({ ok: false, text: 'La portada debe pesar menos de 10MB.' }); return }
    setUploadingCover(true)
    setMsg(null)
    try {
      setCover(await uploadImage(file))
    } catch {
      setMsg({ ok: false, text: 'No se pudo subir la portada. Intentá de nuevo.' })
    } finally {
      setUploadingCover(false)
    }
  }

  const canPublish = !!title.trim() && !isArticleEmpty(body) && !saving && !uploadingCover

  const handlePublish = async () => {
    const client = getClient()
    if (!user || !client) return
    if (!title.trim()) { setMsg({ ok: false, text: 'Poné un título al artículo.' }); return }
    if (isArticleEmpty(body)) { setMsg({ ok: false, text: 'El artículo está vacío.' }); return }
    setSaving(true)
    setMsg(null)
    try {
      const { data, error } = await client
        .from('posts')
        .insert({
          creator_id: user.id,
          title: title.trim(),
          content: articleExcerpt(body, 240),
          post_type: 'article',
          body,
          media_url: cover ?? firstArticleImage(body),
          media_urls: null,
        })
        .select('id')
        .single()
      if (error || !data) {
        setMsg({ ok: false, text: 'Error al publicar. Intentá de nuevo.' })
        setSaving(false)
        return
      }
      // Send the writer to their freshly published article.
      router.push(`/${username}/${data.id}`)
    } catch (err) {
      console.error('[publish article]', err)
      setMsg({ ok: false, text: 'Error inesperado. Intentá de nuevo.' })
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-crema">
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 h-14 border-b border-borde bg-crema/95 backdrop-blur flex items-center justify-between px-4 lg:px-6"
      >
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-txt2 hover:text-tinta text-[13px] font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Salir
        </Link>
        <span className="disp text-tinta text-[15px] uppercase tracking-wide hidden sm:block">Nuevo artículo</span>
        <button
          onClick={handlePublish}
          disabled={!canPublish}
          className="bg-rosa hover:bg-rosa-hover text-white rounded-lg px-5 py-2 text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Publicar
        </button>
      </div>

      {/* Writing canvas */}
      <div className="max-w-[760px] mx-auto px-5 py-8">
        {/* Cover */}
        {cover ? (
          <div className="relative mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="Portada" className="w-full max-h-[360px] object-cover rounded-2xl border border-borde" />
            <button
              type="button"
              onClick={() => setCover(null)}
              aria-label="Quitar portada"
              className="absolute top-2 right-2 bg-tinta/70 hover:bg-tinta text-white rounded-full p-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="inline-flex items-center gap-2 text-txt2 hover:text-rosa text-[13px] font-medium mb-6 transition-colors disabled:opacity-60"
          >
            {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {uploadingCover ? 'Subiendo portada…' : 'Agregar portada'}
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handleUploadCover(f) }}
        />

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del artículo"
          className="disp w-full bg-transparent border-0 outline-none text-tinta text-[30px] md:text-[40px] leading-[1.05] placeholder:text-muted2/50 mb-4"
        />

        {/* Body */}
        <ArticleEditor
          value={body}
          onChange={setBody}
          onUploadImage={uploadImage}
          bordered={false}
          minHeight="55vh"
          stickyTop={TOP_BAR}
          placeholder="Escribí tu historia… podés agregar títulos, imágenes, citas y más."
        />

        {msg && (
          <div className={`mt-4 flex items-center gap-2 text-[13px] ${msg.ok ? 'text-exito' : 'text-red-500'}`}>
            {msg.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {msg.text}
          </div>
        )}
      </div>
    </div>
  )
}
