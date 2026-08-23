import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ImpulsarButton } from '@/components/support/impulsar-button'
import { ShareMenu, type ShareOption } from '@/components/share/share-menu'
import { ArticleContent } from '@/components/posts/article-content'
import { PostCarousel } from '@/components/posts/post-carousel'
import { MediaEmbed } from '@/components/posts/media-embed'
import { PostInteractionsProvider, PostLikeButton, PostCommentLink } from '@/components/posts/post-interactions'
import { PostComments } from '@/components/posts/post-comments'
import { EditArticleButton } from '@/components/posts/edit-article-button'
import { articleExcerpt, readingTimeMinutes, firstArticleImage, type ArticleDoc } from '@/lib/article'
import { embeddedCount } from '@/lib/interactions'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string; postId: string }>
}

type PostProfile = {
  id: string
  name: string
  username: string
  avatar_url: string | null
  creator_type: string | null
  mp_connected: boolean | null
}

// Loads a post + its creator, verifying the post belongs to @username.
async function loadPost(username: string, postId: string) {
  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, creator_type, mp_connected')
    .eq('username', username)
    .single()
  if (!profile) return null

  const { data: post } = await supabase
    .from('posts')
    .select('*, post_likes(count), post_comments(count)')
    .eq('id', postId)
    .eq('creator_id', profile.id)
    .maybeSingle()
  if (!post) return null

  return { profile: profile as PostProfile, post }
}

// Cover image used for OG previews: article cover / first image; link & audio
// posts have no usable image (media_url is an external URL), so none.
function coverOf(post: any): string | null {
  if (post.post_type === 'article') {
    return post.media_url || firstArticleImage(post.body as ArticleDoc | null)
  }
  if (post.post_type === 'image') {
    return post.media_urls?.[0] || post.media_url || null
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, postId } = await params
  const data = await loadPost(username, postId)
  if (!data) return { title: 'Publicación no encontrada — Impulso' }

  const { profile, post } = data
  const isArticle = post.post_type === 'article'
  const excerpt = isArticle
    ? (post.content?.trim() || articleExcerpt(post.body as ArticleDoc | null, 160))
    : post.content?.trim()

  const heading =
    post.title?.trim() ||
    (isArticle ? 'Artículo' : excerpt ? excerpt.slice(0, 70) : `Publicación de ${profile.name}`)
  const title = `${heading} — ${profile.name}`
  const description = excerpt || `Apoyá a ${profile.name} en Impulso`
  const cover = coverOf(post)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: isArticle ? 'article' : 'website',
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

export default async function PostPage({ params }: Props) {
  const { username, postId } = await params
  const data = await loadPost(username, postId)
  if (!data) notFound()

  const { profile, post } = data
  const isArticle = post.post_type === 'article'
  const body = post.body as ArticleDoc | null
  const cover = isArticle ? (post.media_url || firstArticleImage(body)) : null
  const minutes = isArticle ? readingTimeMinutes(body) : 0
  const firstName = profile.name?.split(' ')[0] ?? username
  const likeCount = embeddedCount(post.post_likes)
  const commentCount = embeddedCount(post.post_comments)

  const images = post.media_urls?.length
    ? post.media_urls
    : post.media_url
      ? [post.media_url]
      : []

  const shareOptions: ShareOption[] = [
    { key: 'link', kind: 'link', label: 'Copiar link', hint: `tuimpulso.ar/${username}`, link: `/${username}/${postId}` },
    { key: 'story', label: 'Historia', hint: '1080×1920', url: `/api/share/post/${postId}`, filename: 'impulso-publicacion-historia.png' },
    { key: 'square', label: 'Cuadrado (feed)', hint: '1080×1080', url: `/api/share/post/${postId}?format=square`, filename: 'impulso-publicacion-cuadrado.png' },
  ]

  const maxW = isArticle ? 'max-w-[720px]' : 'max-w-[640px]'

  return (
    <div className="min-h-screen bg-crema">
      <Header />

      <article className="bg-crema pb-16">
        <div className="wrap">
          <div className={`${maxW} mx-auto pt-6`}>
            <div className="flex items-center justify-between gap-3 mb-5">
              <Link
                href={`/${username}`}
                className="inline-flex items-center gap-1.5 text-muted2 hover:text-tinta text-[13px] font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al perfil
              </Link>
              {isArticle && <EditArticleButton postId={post.id} creatorId={post.creator_id} />}
            </div>

            {isArticle ? (
              <>
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

                <Byline profile={profile} username={username} createdAt={post.created_at} minutes={minutes} shareOptions={shareOptions} />

                {/* Body */}
                <ArticleContent doc={body} />
              </>
            ) : (
              <>
                <Byline profile={profile} username={username} createdAt={post.created_at} minutes={0} shareOptions={shareOptions} />

                {post.title && (
                  <h1 className="disp text-tinta text-[22px] md:text-[28px] leading-tight mb-3">{post.title}</h1>
                )}
                {post.content && (
                  <p className="text-tinta text-[15px] md:text-[16px] leading-relaxed whitespace-pre-wrap mb-5">
                    {post.content}
                  </p>
                )}

                {post.post_type === 'image' && images.length > 0 && (
                  <PostCarousel images={images} alt={post.title ?? undefined} />
                )}
                {post.post_type !== 'image' && post.media_url && (
                  <MediaEmbed url={post.media_url} title={post.title} />
                )}
              </>
            )}

            {/* Like + comment bar */}
            <PostInteractionsProvider postIds={[post.id]} initialLikeCounts={{ [post.id]: likeCount }}>
              <div className="mt-8 pt-4 border-t border-borde flex items-center gap-5">
                <PostLikeButton postId={post.id} size="md" />
                <PostCommentLink postId={post.id} username={username} count={commentCount} size="md" />
              </div>
            </PostInteractionsProvider>

            {/* Support CTA */}
            <div className="mt-12 pt-8 border-t border-borde">
              <div className="bg-white border-2 border-tinta rounded-xl p-5 text-center">
                <p className="disp text-tinta text-[18px] uppercase mb-1.5">
                  {isArticle ? '¿Te gustó lo que leíste?' : `¿Te gusta lo que hace ${firstName}?`}
                </p>
                <p className="text-txt2 text-[13px] mb-4 max-w-sm mx-auto">
                  {isArticle
                    ? `Apoyá a ${firstName} para que siga escribiendo y creando.`
                    : `Sumate y apoyá a ${firstName} para que siga creando.`}
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
                    label={`Apoyar a ${firstName}`}
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

            {/* Comments */}
            <PostComments postId={post.id} postOwnerId={profile.id} initialCount={commentCount} />
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}

// Author row: avatar + name + date (+ reading time for articles) and the share menu.
function Byline({
  profile,
  username,
  createdAt,
  minutes,
  shareOptions,
}: {
  profile: PostProfile
  username: string
  createdAt: string
  minutes: number
  shareOptions: ShareOption[]
}) {
  const initials = profile.name
    ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : username.slice(0, 2).toUpperCase()

  return (
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
              {format(new Date(createdAt), "d 'de' MMMM, yyyy", { locale: es })}
            </span>
            {minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {minutes} min de lectura
              </span>
            )}
          </div>
        </div>
      </Link>

      <ShareMenu options={shareOptions} triggerLabel="Compartir" align="responsive" />
    </div>
  )
}
