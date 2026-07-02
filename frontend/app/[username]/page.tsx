import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Globe, Calendar, FileText, ExternalLink } from 'lucide-react'
import { ImpulsarButton } from '@/components/support/impulsar-button'
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

  return {
    title: `${profile.name} (@${username}) — Impulso`,
    description: profile.bio || `Apoyá a ${profile.name} en Impulso`,
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

  return (
    <div className="min-h-screen bg-crema">
      <Header />

      {/* Profile header — tinta */}
      <section className="bg-tinta">
        <div className="wrap pt-9 pb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-3.5">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-[60px] h-[60px] rounded-full object-cover border-2 border-[rgba(251,247,242,0.25)] shrink-0"
                />
              ) : (
                <div className="disp w-[60px] h-[60px] rounded-full bg-rosa text-white flex items-center justify-center text-2xl border-2 border-[rgba(251,247,242,0.25)] shrink-0">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="disp text-crema text-[22px] leading-none mb-1">{profile.name}</h1>
                <p className="text-[rgba(251,247,242,0.5)] text-[13px] mb-1.5">@{username}</p>
                {profile.creator_type && (
                  <span className="inline-block bg-naranja text-tinta text-[10px] font-bold uppercase tracking-wide px-2.5 py-[3px] rounded-full">
                    {profile.creator_type}
                  </span>
                )}
              </div>
            </div>

            <ImpulsarButton
              creatorId={profile.id}
              creatorName={profile.name}
              creatorUsername={username}
              variant="primary"
            />
          </div>

          {profile.bio && (
            <p className="text-[rgba(251,247,242,0.7)] text-sm leading-relaxed max-w-lg mb-3.5">
              {profile.bio}
            </p>
          )}

          <div className="flex gap-[18px] flex-wrap">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgba(251,247,242,0.5)] hover:text-crema text-xs flex items-center gap-1 transition-colors"
              >
                <Globe className="w-[13px] h-[13px]" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="text-[rgba(251,247,242,0.5)] text-xs flex items-center gap-1">
              <Calendar className="w-[13px] h-[13px]" />
              Miembro desde {format(new Date(profile.created_at), 'MMMM yyyy', { locale: es })}
            </span>
          </div>
        </div>

        {/* Ticket divider */}
        <div className="wrap pb-4 text-[rgba(251,247,242,0.2)] text-[10px] tracking-[6px] overflow-hidden whitespace-nowrap select-none">
          ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
        </div>
      </section>

      {/* Content — crema */}
      <section className="bg-crema py-6">
        <div className="max-w-2xl mx-auto px-6">
          {/* Featured goal — highlighted card */}
          {goal && (
            <div className="bg-white border-2 border-tinta rounded-xl overflow-hidden mb-6">
              <div className="h-1.5 bg-naranja" />
              <div className="p-[18px]">
                <p className="text-naranja text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5">
                  Meta actual
                </p>
                <h3 className="disp text-tinta text-[19px] mb-1.5">{goal.title}</h3>
                {goal.description && (
                  <p className="text-[13px] text-txt2 leading-relaxed mb-4">{goal.description}</p>
                )}
                <div className="h-2 bg-track rounded-full overflow-hidden mb-2.5">
                  <div className="h-full bg-rosa" style={{ width: `${goalPercent}%` }} />
                </div>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="disp text-tinta text-[28px] leading-none">{goalPercent}%</span>
                  <span className="text-xs text-txt2">
                    ${Number(goal.current_amount).toLocaleString('es-AR')} de ${Number(goal.target_amount).toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="[&>button]:w-full [&>button]:justify-center">
                  <ImpulsarButton
                    creatorId={profile.id}
                    creatorName={profile.name}
                    creatorUsername={username}
                    variant="primary"
                    label="Apoyar esta meta"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Posts */}
          <h2 className="disp text-tinta text-[20px] mb-3.5">Publicaciones</h2>

          {posts && posts.length > 0 ? (
            <div className="space-y-3 mb-6">
              {posts.map((post) => {
                const accent = postAccent(post.post_type)
                const ytId = post.media_url ? getYouTubeId(post.media_url) : null
                return (
                  <div
                    key={post.id}
                    className="bg-white border border-borde rounded-[10px] p-4"
                    style={{ borderLeft: `4px solid ${accent}` }}
                  >
                    {post.title && (
                      <p className="font-semibold text-sm text-tinta mb-1.5">{post.title}</p>
                    )}
                    {post.content && (
                      <p className="text-[13px] text-txt2 leading-relaxed mb-2.5 whitespace-pre-wrap">
                        {post.content}
                      </p>
                    )}

                    {ytId && (
                      <div className="rounded-lg overflow-hidden aspect-video mb-2.5">
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
                        className="inline-flex items-center gap-1 mb-2.5 text-rosa hover:text-rosa-hover text-[13px] font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver contenido
                      </a>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-muted2">
                        {format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                      <ImpulsarButton
                        creatorId={profile.id}
                        creatorName={profile.name}
                        creatorUsername={username}
                        postId={post.id}
                        postTitle={post.title}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-borde rounded-[10px] p-10 text-center mb-6">
              <FileText className="w-9 h-9 text-muted2 mx-auto mb-3" />
              <p className="text-txt2 font-medium text-sm">Aún no hay publicaciones</p>
              <p className="text-muted2 text-xs mt-1">
                Seguí a {profile.name.split(' ')[0]} para no perderte nada.
              </p>
            </div>
          )}

          {/* About */}
          <div className="bg-white border border-borde rounded-[10px] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-txt2 mb-3">Acerca de</p>
            <div className="flex justify-between py-2 border-b border-[rgba(27,26,46,0.08)]">
              <span className="text-[13px] text-txt2">Publicaciones</span>
              <span className="text-[13px] font-semibold text-tinta">{posts?.length ?? 0}</span>
            </div>
            {profile.creator_type && (
              <div className="flex justify-between py-2 border-b border-[rgba(27,26,46,0.08)]">
                <span className="text-[13px] text-txt2">Tipo de creador</span>
                <span className="text-[13px] font-semibold text-rosa">{profile.creator_type}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-[13px] text-txt2">En Impulso desde</span>
              <span className="text-[13px] font-semibold text-tinta">
                {format(new Date(profile.created_at), 'MMM yyyy', { locale: es })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
