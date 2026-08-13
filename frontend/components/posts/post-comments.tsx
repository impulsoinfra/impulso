'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { MessageCircle, Loader2, Trash2, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'
import { listComments, addComment, deleteComment, type PostComment } from '@/lib/interactions'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Small round avatar (image or initials) used by the form + each comment.
function Avatar({ name, url }: { name?: string | null; url?: string | null }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name ?? ''} className="w-8 h-8 rounded-full object-cover border border-borde shrink-0" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-rosa text-white flex items-center justify-center text-[11px] font-bold shrink-0">
      {initials}
    </div>
  )
}

// Full comment thread for a post: newest-first list + a composer. Requires login
// to comment; anyone can read. Author can delete their own; the post owner can
// moderate (delete any). Lives on the post permalink under #comentarios.
export function PostComments({
  postId,
  postOwnerId,
  initialCount = 0,
}: {
  postId: string
  postOwnerId: string
  initialCount?: number
}) {
  const { user, profile, getClient } = useAuth()
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const client = getClient()
    if (!client) { setLoading(false); return }
    try {
      setComments(await listComments(client, postId))
    } catch (e) {
      console.error('[comments]', e)
    } finally {
      setLoading(false)
    }
  }, [getClient, postId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const client = getClient()
    const content = text.trim()
    if (!user || !client || !content) return
    setSubmitting(true)
    setError(null)
    try {
      const created = await addComment(client, postId, user.id, content)
      // The insert returns the joined author; fall back to my own profile just in case.
      const withAuthor: PostComment = created.author
        ? created
        : {
            ...created,
            author: {
              name: profile?.name ?? null,
              username: (profile as { username?: string | null } | null)?.username ?? null,
              avatar_url: (profile as { avatar_url?: string | null } | null)?.avatar_url ?? null,
            },
          }
      setComments((prev) => [withAuthor, ...prev])
      setText('')
    } catch (e) {
      console.error('[add comment]', e)
      setError('No se pudo publicar el comentario. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const client = getClient()
    if (!client) return
    const prev = comments
    setComments((c) => c.filter((x) => x.id !== id)) // optimistic
    try {
      await deleteComment(client, id)
    } catch (e) {
      console.error('[delete comment]', e)
      setComments(prev) // revert
    }
  }

  const count = loading ? initialCount : comments.length
  const canModerate = (c: PostComment) => !!user && (c.user_id === user.id || user.id === postOwnerId)

  return (
    <section id="comentarios" className="mt-12 pt-8 border-t border-borde scroll-mt-20">
      <h2 className="disp text-tinta text-[18px] uppercase mb-4 flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-rosa" />
        Comentarios{count > 0 ? ` (${count})` : ''}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="flex items-start gap-2.5 mb-6">
          <Avatar name={profile?.name} url={(profile as { avatar_url?: string | null } | null)?.avatar_url} />
          <div className="flex-1 min-w-0">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribí un comentario…"
              rows={2}
              maxLength={2000}
              className="w-full border border-borde rounded-lg px-3 py-2 text-sm text-tinta outline-none bg-white focus:border-rosa/60 focus:ring-2 focus:ring-rosa/15 transition-shadow resize-none"
            />
            {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
            <div className="flex justify-end mt-1.5">
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="inline-flex items-center gap-1.5 bg-rosa hover:bg-rosa-hover text-white rounded-lg px-4 py-1.5 text-[13px] font-semibold disabled:opacity-50 transition-colors"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Comentar
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white border border-borde rounded-lg p-4 text-center mb-6">
          <p className="text-txt2 text-[13px]">
            <Link href="/auth/login" className="text-rosa font-semibold hover:underline">Iniciá sesión</Link> para dejar un comentario.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-rosa/60" /></div>
      ) : comments.length === 0 ? (
        <p className="text-muted2 text-[13px] text-center py-4">Todavía no hay comentarios. Sé el primero.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2.5">
              <Avatar name={c.author?.name} url={c.author?.avatar_url} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {c.author?.username ? (
                    <Link href={`/${c.author.username}`} className="font-semibold text-tinta text-[13px] hover:text-rosa transition-colors">
                      {c.author?.name ?? 'Usuario'}
                    </Link>
                  ) : (
                    <span className="font-semibold text-tinta text-[13px]">{c.author?.name ?? 'Usuario'}</span>
                  )}
                  <span className="text-[11px] text-muted2">
                    {formatDistanceToNow(new Date(c.created_at), { locale: es, addSuffix: true })}
                  </span>
                  {canModerate(c) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="ml-auto text-muted2 hover:text-red-500 transition-colors p-0.5" aria-label="Eliminar comentario">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
                          <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(c.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <p className="text-txt2 text-[13px] leading-relaxed whitespace-pre-wrap break-words mt-0.5">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
