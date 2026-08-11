import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ImpulsarButton } from '@/components/support/impulsar-button'
import { ShareMenu, type ShareOption } from '@/components/share/share-menu'
import { ArticleContent } from '@/components/posts/article-content'
import { articleExcerpt, readingTimeMinutes, firstArticleImage, type ArticleDoc } from '@/lib/article'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string; postId: string }>
}

// Loads the article + its creator, verifying the post belongs to @username.
async function loadArticle(username: string, postId: string) {
  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, creator_type, mp_connected')
    .eq('username', username)
    .single()
  if (!profile) return null

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .eq('creator_id', profile.id)
    .eq('post_type', 'article')
    .maybeSingle()
  if (!post) return null

  return { profile, post }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, postId } = await params
  const data = await loadArticle(username, postId)
  if (!data) return { title: 'Artículo no encontrado — Impulso' }

  const { profile, post } = data
  const body = post.body as ArticleDoc | null
  const title = `${post.title ?? 'Artículo'} — ${profile.name}`
  const description = post.content?.trim() || articleExcerpt(body, 160)
  const cover = post.media_url || firstArticleImage(body)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/${username}/${postId}`,
      siteName: 'Impulso',
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(cover ? { images: [cover] } : {}),
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { username, postId } = await params
  const data = await loadArticle(username, postId)
  if (!data) notFound()

  const { profile, post } = data
  const body = post.body as ArticleDoc | null
  const cover = post.media_url || firstArticleImage(body)
  const minutes = readingTimeMinutes(body)

  const initials = profile.name
    ? profile.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : username.slice(0, 2).toUpperCase()

  const shareOptions: ShareOption[] = [
    { key: 'link', kind: 'link', label: 'Copiar link del artículo', hint: `tuimpulso.ar/${username}`, link: `/${username}/${postId}` },
    { key: 'story', label: 'Historia', hint: '1080×1920', url: `/api/share/post/${postId}`, filename: 'impulso-articulo-historia.png' },
    { key: 'square', label: 'Cuadrado (feed)', hint: '1080×1080', url: `/api/share/post/${postId}?format=square`, filename: 'impulso-articulo-cuadrado.png' },
  ]

  return (
    <div className="min-h-screen bg-crema">
      <Header />

      <article className="bg-crema pb-16">
        <div className="wrap">
          <div className="max-w-[720px] mx-auto pt-6">
            <Link
              href={`/${username}`}
              className="inline-flex items-center gap-1.5 text-muted2 hover:text-tinta text-[13px] font-medium transition-colors mb-5"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al perfil
            </Link>

            {/* Cover */}
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={post.title ?? ''}
                className="w-full max-h-[420px] object-cover rounded-2xl border border-borde mb-6"
              />
            )}

            {/* Title */}
            {post.title && (
              <h1 className="disp text-tinta text-[28px] md:text-[36px] lg:text-[42px] leading-[1.05] mb-4">
                {post.title}
              </h1>
            )}

            {/* Byline */}
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-borde pb-5 mb-7">
              <Link href={`/${username}`} className="flex items-center gap-3 group">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.name} className="w-11 h-11 rounded-full object-cover border border-borde" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-rosa text-white flex items-center justify-center text-sm font-bold">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-tinta text-[14px] group-hover:text-rosa transition-colors leading-tight">{profile.name}</p>
                  <div className="flex items-center gap-2.5 text-muted2 text-[11px] mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {minutes} min de lectura
                    </span>
                  </div>
                </div>
              </Link>

              <ShareMenu options={shareOptions} triggerLabel="Compartir" align="responsive" />
            </div>

            {/* Body */}
            <ArticleContent doc={body} />

            {/* Support CTA */}
            <div className="mt-12 pt-8 border-t border-borde">
              <div className="bg-white border-2 border-tinta rounded-xl p-5 text-center">
                <p className="disp text-tinta text-[18px] uppercase mb-1.5">¿Te gustó lo que leíste?</p>
                <p className="text-txt2 text-[13px] mb-4 max-w-sm mx-auto">
                  Apoyá a {profile.name.split(' ')[0]} para que siga escribiendo y creando.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap [&>button]:py-2.5">
                  <ImpulsarButton
                    creatorId={profile.id}
                    creatorName={profile.name}
                    creatorUsername={username}
                    postId={post.id}
                    postTitle={post.title}
                    creatorConnected={profile.mp_connected}
                    variant="primary"
                    label={`Apoyar a ${profile.name.split(' ')[0]}`}
                  />
                  <Link
                    href={`/${username}`}
                    className="inline-flex items-center justify-center gap-2 border border-borde text-tinta hover:bg-tinta/[0.04] rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
