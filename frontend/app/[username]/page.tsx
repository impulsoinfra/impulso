import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Heart, Globe, Calendar, FileText, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
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

  const socialLinks: Record<string, string> = profile.social_links || {}

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Cover + Avatar */}
      <div className="bg-rose-100 h-40 w-full relative" />
      <div className="container mx-auto px-4">
        <div className="relative -mt-12 mb-4 flex items-end gap-5">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-rose-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
        </div>

        {/* Profile info + action */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-500 mb-2">@{username}</p>

            {profile.creator_type && (
              <Badge className="bg-rose-100 text-rose-700 border-0 mb-3">
                {profile.creator_type}
              </Badge>
            )}

            {profile.bio && (
              <p className="text-gray-700 leading-relaxed mb-3">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-rose-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {profile.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Miembro desde{' '}
                {format(new Date(profile.created_at), 'MMMM yyyy', { locale: es })}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button
              size="lg"
              className="bg-rose-600 hover:bg-rose-700 text-white px-8 gap-2"
            >
              <Heart className="w-4 h-4" />
              Apoyar a {profile.name.split(' ')[0]}
            </Button>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-8 pb-16">
          {/* Posts */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Publicaciones
            </h2>

            {posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      {post.title && (
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{post.title}</h3>
                      )}
                      <p className="text-gray-700 leading-relaxed line-clamp-4">{post.content}</p>
                      {post.media_url && (() => {
                        const ytId = getYouTubeId(post.media_url)
                        return ytId ? (
                          <div className="mt-4 rounded-xl overflow-hidden aspect-video">
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}`}
                              title={post.title ?? 'Video'}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <a
                            href={post.media_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-rose-600 hover:text-rose-700 text-sm font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver contenido
                          </a>
                        )
                      })()}
                      <p className="text-xs text-gray-400 mt-3">
                        {format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-dashed border-rose-200 bg-rose-50/50">
                <CardContent className="p-10 text-center">
                  <FileText className="w-10 h-10 text-rose-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aún no hay publicaciones</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Seguí a {profile.name.split(' ')[0]} para no perderte nada.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Active goal */}
            {goal && (
              <Card className="border border-rose-200 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1">🎯 Meta actual</h3>
                  <p className="text-gray-700 font-medium mb-1">{goal.title}</p>
                  {goal.description && (
                    <p className="text-gray-500 text-sm mb-3">{goal.description}</p>
                  )}
                  <Progress value={goalPercent} className="h-2.5 mb-2" />
                  <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span className="font-medium text-rose-600">
                      ${Number(goal.current_amount).toLocaleString('es-AR')}
                    </span>
                    <span>Meta ${Number(goal.target_amount).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="text-center text-2xl font-bold text-gray-900 mb-4">
                    {goalPercent}%
                    <span className="block text-xs font-normal text-gray-400">completado</span>
                  </div>
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white gap-2">
                    <Heart className="w-4 h-4" />
                    Apoyar esta meta
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Stats card */}
            <Card className="border border-rose-100 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 mb-4">Acerca de</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Publicaciones</span>
                    <span className="font-medium text-gray-900">{posts?.length ?? 0}</span>
                  </div>
                  {profile.creator_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo de creador</span>
                      <span className="font-medium text-rose-600">{profile.creator_type}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">En Impulso desde</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(profile.created_at), 'MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social links */}
            {Object.keys(socialLinks).length > 0 && (
              <Card className="border border-rose-100 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold text-gray-900 mb-3">Redes sociales</h3>
                  <div className="space-y-2">
                    {Object.entries(socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
