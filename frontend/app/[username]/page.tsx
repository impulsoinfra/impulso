import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProfileBanner } from '@/components/profile/profile-banner'
import { Globe, Calendar, FileText, ExternalLink } from 'lucide-react'
import { ImpulsarButton } from '@/components/support/impulsar-button'
import { ShareMenu, type ShareOption } from '@/components/share/share-menu'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

// Left-border accent per content type (style guide §4)
function postAccent(postType: string): string {
  switch (postType) {
    case 'audio': return '#F0355C'        // rosa
    case 'image':
    case 'link': return '#FF9D3D'         // naranja (foto/video)
    default: return '#1B1A2E'             // tinta (texto/anuncio)
  }
}

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, bio')
    .eq('username', username)
    .single()

  if (!profile) return { title: 'Creador no encontrado — Impulso' }

  const title = `${profile.name} (@${username}) — Impulso`
  const description = profile.bio || `Apoyá a ${profile.name} en Impulso`

  // og:image / twitter:image are injected automatically by opengraph-image.tsx
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/${username}`,
      siteName: 'Impulso',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CreatorProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const [{ data: posts }, { data: goal }] = await Promise.all([
    supabase
      .from('posts')
      .select('*')
      .eq('creator_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('goals')
      .select('*')
      .eq('creator_id', profile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const initials = profile.name
    ? profile.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : username.slice(0, 2).toUpperCase()

  const goalPercent = goal
    ? Math.min(Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100), 100)
    : 0

  // Profile share hub: copy/share the link (OG preview) + the goal images when there's a goal.
  // username is guaranteed by the route param.
  const profileShareOptions: ShareOption[] = [
    { key: 'link', kind: 'link', label: 'Copiar link del perfil', hint: `tuimpulso.ar/${username}`, link: `/${username}` },
  ]
  if (goal) {
    profileShareOptions.push(
      { key: 'meta-story', label: 'Meta — Historia', hint: '1080×1920', url: `/api/share/meta/${username}`, filename: 'impulso-meta-historia.png' },
      { key: 'meta-feed', label: 'Meta — Feed', hint: '1080×1350', url: `/api/share/meta/${username}?format=post`, filename: 'impulso-meta-feed.png' },
    )
  }
  const postShareOptions = (postId: string): ShareOption[] => [
    { key: 'story', label: 'Historia', hint: '1080×1920', url: `/api/share/post/${postId}`, filename: 'impulso-publicacion-historia.png' },
    { key: 'square', label: 'Cuadrado (feed)', hint: '1080×1080', url: `/api/share/post/${postId}?format=square`, filename: 'impulso-publicacion-cuadrado.png' },
  ]

  return (
    <div className="min-h-screen bg-crema">
      <Header />

      {/* Cover banner (image or brand pattern) + owner camera */}
      <ProfileBanner profileId={profile.id} bannerUrl={profile.banner_url ?? null} />

      {/* Identity block — crema, avatar overlaps the banner above */}
      <section className="bg-crema">
        <div className="wrap">
          <div className="max-w-[960px] mx-auto relative">
            {/* Avatar overlapping the banner's bottom edge */}
            <div className="absolute left-0 -top-[38px] lg:-top-[70px] z-10">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-[76px] h-[76px] lg:w-[140px] lg:h-[140px] rounded-full object-cover border-4 lg:border-[6px] border-crema box-border"
                />
              ) : (
                <div className="disp w-[76px] h-[76px] lg:w-[140px] lg:h-[140px] rounded-full bg-rosa text-white flex items-center justify-center text-xl lg:text-5xl border-4 lg:border-[6px] border-crema box-border">
                  {initials}
                </div>
              )}
            </div>

            {/* Compartir + Apoyar — top-right, opposite the avatar */}
            <div className="flex justify-end items-center gap-2 pt-4">
              <ShareMenu options={profileShareOptions} triggerLabel="Compartir" align="responsive" />
              <ImpulsarButton
                creatorId={profile.id}
                creatorName={profile.name}
                creatorUsername={username}
                creatorConnected={profile.mp_connected}
                variant="primary"
              />
            </div>

            {/* Name / handle / badge / bio / meta */}
            <div className="mt-2 lg:mt-10 pb-3">
              <h1 className="disp text-tinta text-[22px] md:text-[26px] lg:text-[32px] leading-none mb-1">{profile.name}</h1>
              <p className="text-txt2 text-[13px] lg:text-[15px] mb-2">@{username}</p>
              {profile.creator_type && (
                <span className="inline-block bg-naranja text-tinta text-[10px] font-bold uppercase tracking-wide px-2.5 py-[3px] rounded-full mb-2.5">
                  {profile.creator_type}
                </span>
              )}
              {profile.bio && (
                <p className="text-txt2 text-sm lg:text-[15px] leading-relaxed max-w-xl mb-2.5">{profile.bio}</p>
              )}
              <div className="flex gap-4 flex-wrap">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted2 hover:text-tinta text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="text-muted2 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Miembro desde {format(new Date(profile.created_at), 'MMMM yyyy', { locale: es })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content — posts (main) + goal/about (sidebar). Mobile order: goal → posts → about. */}
      <section className="bg-crema pb-12">
        <div className="wrap">
          <div className="grid gap-4 items-start max-w-[960px] mx-auto lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[auto_1fr]">
            {/* Goal — DOM first (mobile top); desktop right column, row 1 */}
            {goal && (
              <div className="lg:col-start-2 lg:row-start-1">
                <div className="bg-white border-2 border-tinta rounded-xl overflow-hidden">
                  <div className="h-1.5 bg-naranja" />
                  <div className="p-4">
                    <p className="text-naranja text-[10px] font-bold uppercase tracking-[0.06em] mb-1.5">
                      Meta actual
                    </p>
                    <h3 className="disp text-tinta text-[15px] leading-tight uppercase mb-2">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-[12px] text-txt2 leading-relaxed mb-3">{goal.description}</p>
                    )}
                    <div className="h-1.5 bg-track rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-rosa" style={{ width: `${goalPercent}%` }} />
                    </div>
                    <div className="mb-3">
                      <span className="disp text-tinta text-[20px] block leading-none mb-0.5">{goalPercent}%</span>
                      <span className="text-[10px] text-txt2">
                        ${Number(goal.current_amount).toLocaleString('es-AR')} de ${Number(goal.target_amount).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="[&>button]:w-full [&>button]:justify-center [&>button]:py-2.5">
                      <ImpulsarButton
                        creatorId={profile.id}
                        creatorName={profile.name}
                        creatorUsername={username}
                        variant="primary"
                        label="Apoyar esta meta"
                        creatorConnected={profile.mp_connected}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts — DOM second; desktop left column spanning both rows */}
            <div className={`lg:col-start-1 lg:row-start-1 ${goal ? 'lg:row-span-2' : ''}`}>
              <h2 className="disp text-tinta text-[16px] uppercase mb-3">Publicaciones</h2>

              {posts && posts.length > 0 ? (
                <div className="space-y-2.5">
                  {posts.map((post) => {
                    const accent = postAccent(post.post_type)
                    const ytId = post.media_url ? getYouTubeId(post.media_url) : null
                    return (
                      <div
                        key={post.id}
                        className="bg-white border border-borde rounded-[10px] p-3.5"
                        style={{ borderLeft: `4px solid ${accent}` }}
                      >
                        {post.title && (
                          <p className="font-semibold text-[13px] text-tinta mb-1.5">{post.title}</p>
                        )}
                        {post.content && (
                          <p className="text-[12px] text-txt2 leading-relaxed mb-2 whitespace-pre-wrap">{post.content}</p>
                        )}

                        {ytId && (
                          <div className="rounded-lg overflow-hidden aspect-video mb-2">
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}`}
                              title={post.title ?? 'Video'}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        )}
                        {post.media_url && !ytId && (
                          <a
                            href={post.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mb-2 text-rosa hover:text-rosa-hover text-[12px] font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver contenido
                          </a>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-muted2">
                            {format(new Date(post.created_at), "d MMM yyyy", { locale: es })}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <ShareMenu options={postShareOptions(post.id)} compact />
                            <ImpulsarButton
                              creatorId={profile.id}
                              creatorName={profile.name}
                              creatorUsername={username}
                              postId={post.id}
                              postTitle={post.title}
                              creatorConnected={profile.mp_connected}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-borde rounded-[10px] p-10 text-center">
                  <FileText className="w-9 h-9 text-muted2 mx-auto mb-3" />
                  <p className="text-txt2 font-medium text-sm">Aún no hay publicaciones</p>
                  <p className="text-muted2 text-xs mt-1">
                    Seguí a {profile.name.split(' ')[0]} para no perderte nada.
                  </p>
                </div>
              )}
            </div>

            {/* About — DOM third; desktop right column, row 2 (or row 1 if no goal) */}
            <div className={`lg:col-start-2 ${goal ? 'lg:row-start-2' : 'lg:row-start-1'}`}>
              <div className="bg-white border border-borde rounded-[10px] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-txt2 mb-2.5">Acerca de</p>
                <div className="flex justify-between py-1.5 border-b border-[rgba(27,26,46,0.08)]">
                  <span className="text-[12px] text-txt2">Publicaciones</span>
                  <span className="text-[12px] font-semibold text-tinta">{posts?.length ?? 0}</span>
                </div>
                {profile.creator_type && (
                  <div className="flex justify-between py-1.5 border-b border-[rgba(27,26,46,0.08)]">
                    <span className="text-[12px] text-txt2">Tipo</span>
                    <span className="text-[12px] font-semibold text-rosa">{profile.creator_type}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-[12px] text-txt2">Desde</span>
                  <span className="text-[12px] font-semibold text-tinta">
                    {format(new Date(profile.created_at), 'MMM yyyy', { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
