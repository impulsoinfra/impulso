import { ImageResponse } from 'next/og'
import { createServerClient } from '@/lib/supabase-server'
import { loadOgFonts } from '@/lib/og/fonts'
import {
  COLORS,
  FORMATS,
  parseFormat,
  truncate,
  Logo,
  BackgroundTexture,
  Avatar,
  type ShareFormat,
} from '@/lib/og/shared'

export const runtime = 'edge'
export const revalidate = 0

// Fixed heights so the waveform is reproducible between renders
const WAVE = [45, 80, 55, 100, 65, 40, 75, 50, 68, 42]

interface Params {
  params: Promise<{ postId: string }>
}

export async function GET(req: Request, { params }: Params) {
  const { postId } = await params
  const format = parseFormat(new URL(req.url).searchParams.get('format'))
  const fonts = await loadOgFonts()
  const supabase = createServerClient()

  const { data: post } = await supabase
    .from('posts')
    .select('title, content, media_url, post_type, created_at, creator_id')
    .eq('id', postId)
    .single()

  if (!post) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.ink, fontFamily: 'Anton', color: COLORS.cream, fontSize: 64 }}>
          IMPULSO
        </div>
      ),
      { ...FORMATS[format], fonts }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, username, avatar_url, creator_type')
    .eq('id', post.creator_id)
    .single()

  const date = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(post.created_at)
  )

  const username = profile?.username ?? ''
  const handle = [username ? `@${username}` : '', profile?.creator_type ?? ''].filter(Boolean).join(' · ')

  const d: PostData = {
    name: profile?.name ?? '',
    handle,
    avatarUrl: profile?.avatar_url ?? null,
    postType: post.post_type,
    title: post.title ?? '',
    content: post.content ?? '',
    date,
    profileUrl: username ? `tuimpulso.ar/${username}` : 'tuimpulso.ar',
  }

  const element = format === 'square' ? <PostSquare {...d} /> : <PostStory {...d} />
  return new ImageResponse(element, { ...FORMATS[format], fonts })
}

interface PostData {
  name: string
  handle: string
  avatarUrl: string | null
  postType: string
  title: string
  content: string
  date: string
  profileUrl: string
}

// Rosa for audio, naranja for everything else (both visible on the dark bg)
function accentFor(type: string) {
  return type === 'audio' ? COLORS.primary : COLORS.accent
}

function CreatorRow(d: PostData, size: number) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <Avatar url={d.avatarUrl} name={d.name} fallback={d.name || 'IM'} size={size} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: size * 0.42, fontWeight: 600, color: COLORS.cream }}>{truncate(d.name, 22)}</div>
        {d.handle ? (
          <div style={{ display: 'flex', fontSize: size * 0.32, color: 'rgba(251,247,242,0.5)' }}>{d.handle}</div>
        ) : null}
      </div>
    </div>
  )
}

// Waveform media box (audio posts)
function MediaBox() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        background: '#0d0d16',
        borderRadius: 24,
        marginTop: 32,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 150 }}>
        {WAVE.map((h, i) => (
          <div key={i} style={{ width: 18, height: `${h}%`, background: i % 2 === 0 ? COLORS.primary : COLORS.accent, borderRadius: 9 }} />
        ))}
      </div>
    </div>
  )
}

// Card holding the post's text (text/link/image posts)
function TextCard(d: PostData, excerptMax: number) {
  const accent = accentFor(d.postType)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(251,247,242,0.06)',
        border: '1px solid rgba(251,247,242,0.12)',
        borderLeft: `6px solid ${accent}`,
        borderRadius: 18,
        padding: 40,
        marginTop: 32,
      }}
    >
      {d.title ? (
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 600, color: COLORS.cream, marginBottom: 16 }}>
          {truncate(d.title, 60)}
        </div>
      ) : null}
      {d.content ? (
        <div style={{ display: 'flex', fontSize: 32, color: 'rgba(251,247,242,0.72)', lineHeight: 1.5 }}>
          {truncate(d.content, excerptMax)}
        </div>
      ) : null}
    </div>
  )
}

function Footer(d: PostData, withLabel: boolean) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', width: '100%', height: 1, background: 'rgba(251,247,242,0.12)', marginBottom: 28 }} />
      {withLabel ? (
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(251,247,242,0.5)', marginBottom: 16 }}>
          Seguí el trabajo de este creador en
        </div>
      ) : null}
      <div style={{ display: 'flex', background: COLORS.primary, color: '#fff', fontSize: 30, fontWeight: 700, padding: '16px 36px', borderRadius: 999 }}>
        {d.profileUrl}
      </div>
    </div>
  )
}

// 1080×1920 — story
function PostStory(d: PostData) {
  const isAudio = d.postType === 'audio'
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: COLORS.ink,
        fontFamily: 'Inter',
        padding: '0 90px',
        overflow: 'hidden',
      }}
    >
      <BackgroundTexture />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', marginBottom: 44 }}>
          <Logo unit={6} fontSize={38} />
        </div>

        {CreatorRow(d, 88)}

        {isAudio ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <MediaBox />
            <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 46, color: COLORS.cream, marginTop: 32 }}>
              {truncate(d.title || 'Nuevo audio', 40)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(240,53,92,0.12)', border: '1px solid rgba(240,53,92,0.25)', borderRadius: 12, padding: '16px 22px', marginTop: 20 }}>
              <div style={{ display: 'flex', fontSize: 28, color: 'rgba(251,247,242,0.75)' }}>♫ Escuchalo completo en Impulso</div>
            </div>
          </div>
        ) : (
          TextCard(d, 200)
        )}

        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(251,247,242,0.4)', marginTop: 28, marginBottom: 40 }}>{d.date}</div>

        {Footer(d, true)}
      </div>
    </div>
  )
}

// 1080×1080 — square
function PostSquare(d: PostData) {
  const isAudio = d.postType === 'audio'
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: COLORS.ink,
        fontFamily: 'Inter',
        padding: '0 80px',
        overflow: 'hidden',
      }}
    >
      <BackgroundTexture />

      <div style={{ position: 'absolute', top: 56, right: 70, display: 'flex' }}>
        <Logo unit={5} fontSize={30} />
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%' }}>
        {CreatorRow(d, 76)}

        {isAudio ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <MediaBox />
            <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 40, color: COLORS.cream, marginTop: 24 }}>
              {truncate(d.title || 'Nuevo audio', 34)}
            </div>
          </div>
        ) : (
          TextCard(d, 120)
        )}

        <div style={{ display: 'flex', marginTop: 36 }}>{Footer(d, false)}</div>
      </div>
    </div>
  )
}
