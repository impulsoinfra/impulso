import { ImageResponse } from 'next/og'
import { createServerClient } from '@/lib/supabase-server'
import { loadOgFonts } from '@/lib/og/fonts'
import {
  COLORS,
  FORMATS,
  parseFormat,
  truncate,
  formatMoney,
  Logo,
  BackgroundTexture,
  Avatar,
} from '@/lib/og/shared'

export const runtime = 'edge'
// Amount changes with every donation — never cache statically.
export const revalidate = 0

interface Params {
  params: Promise<{ username: string }>
}

export async function GET(req: Request, { params }: Params) {
  const { username } = await params
  const format = parseFormat(new URL(req.url).searchParams.get('format'))
  const fonts = await loadOgFonts()

  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, creator_type, location')
    .eq('username', username)
    .single()

  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: COLORS.ink,
            fontFamily: 'Anton',
            color: COLORS.cream,
            fontSize: 64,
          }}
        >
          IMPULSO
        </div>
      ),
      { ...FORMATS[format], fonts }
    )
  }

  const { data: goal } = await supabase
    .from('goals')
    .select('title, current_amount, target_amount')
    .eq('creator_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const percent = goal
    ? Math.min(Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100), 100)
    : 0
  const subtitle = [profile.creator_type, profile.location].filter(Boolean).join(' · ')
  const profileUrl = `tuimpulso.ar/${username}`

  const element =
    format === 'post' ? (
      <FeedCard
        name={profile.name}
        username={username}
        avatarUrl={profile.avatar_url}
        subtitle={subtitle}
        goalTitle={goal?.title ?? null}
        percent={percent}
        current={goal?.current_amount ?? 0}
        target={goal?.target_amount ?? 0}
        profileUrl={profileUrl}
      />
    ) : (
      <Story
        name={profile.name}
        username={username}
        avatarUrl={profile.avatar_url}
        subtitle={subtitle}
        goalTitle={goal?.title ?? null}
        percent={percent}
        current={goal?.current_amount ?? 0}
        target={goal?.target_amount ?? 0}
        profileUrl={profileUrl}
      />
    )

  return new ImageResponse(element, { ...FORMATS[format], fonts })
}

interface CardData {
  name: string
  username: string
  avatarUrl: string | null
  subtitle: string
  goalTitle: string | null
  percent: number
  current: number | string
  target: number | string
  profileUrl: string
}

// 1080×1920 — vertical story, content centered inside IG safe zones
function Story(d: CardData) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.ink,
        fontFamily: 'Inter',
        color: COLORS.cream,
        padding: '0 96px',
        overflow: 'hidden',
      }}
    >
      <BackgroundTexture />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', marginBottom: 70 }}>
          <Logo unit={6} fontSize={40} />
        </div>

        <Avatar url={d.avatarUrl} name={d.name} fallback={d.username} size={168} />

        <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 78, color: COLORS.cream, marginTop: 30, textAlign: 'center', lineHeight: 1.05 }}>
          {truncate(d.name, 22)}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: 'rgba(251,247,242,0.55)', marginTop: 6 }}>
          @{d.username}{d.subtitle ? ` · ${d.subtitle}` : ''}
        </div>

        {d.goalTitle ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', fontSize: 34, color: 'rgba(251,247,242,0.8)', marginTop: 54, textAlign: 'center', maxWidth: 820, lineHeight: 1.35 }}>
              {truncate(d.goalTitle, 70)}
            </div>
            <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 168, color: COLORS.accent, lineHeight: 1, marginTop: 24 }}>
              {d.percent}%
            </div>
            <div style={{ display: 'flex', width: 760, height: 22, background: 'rgba(251,247,242,0.15)', borderRadius: 999, overflow: 'hidden', marginTop: 22 }}>
              <div style={{ display: 'flex', width: `${d.percent}%`, height: 22, background: COLORS.primary, borderRadius: 999 }} />
            </div>
            <div style={{ display: 'flex', fontSize: 32, color: 'rgba(251,247,242,0.6)', marginTop: 18 }}>
              {formatMoney(d.current)} / {formatMoney(d.target)}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', fontSize: 34, color: 'rgba(251,247,242,0.8)', marginTop: 54, textAlign: 'center', maxWidth: 760, lineHeight: 1.35 }}>
            Sumate a mi comunidad y ayudame a seguir creando
          </div>
        )}

        <div style={{ display: 'flex', background: COLORS.primary, color: '#fff', fontSize: 34, fontWeight: 600, padding: '20px 44px', borderRadius: 999, marginTop: 72 }}>
          Bancame en Impulso
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(251,247,242,0.45)', marginTop: 22 }}>{d.profileUrl}</div>
      </div>
    </div>
  )
}

// 1080×1350 — feed 4:5, signature tilted white card
function FeedCard(d: CardData) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.ink,
        fontFamily: 'Inter',
        overflow: 'hidden',
      }}
    >
      <BackgroundTexture />

      <div style={{ position: 'absolute', top: 70, left: 80, display: 'flex' }}>
        <Logo unit={6} fontSize={36} />
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: 760,
          background: '#fff',
          border: `4px solid ${COLORS.ink}`,
          borderRadius: 32,
          overflow: 'hidden',
          transform: 'rotate(-3deg)',
        }}
      >
        <div style={{ display: 'flex', height: 16, background: COLORS.accent }} />
        <div style={{ display: 'flex', flexDirection: 'column', padding: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Avatar url={d.avatarUrl} name={d.name} fallback={d.username} size={104} borderColor="#fff" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 40, fontWeight: 600, color: COLORS.ink }}>{truncate(d.name, 20)}</div>
              <div style={{ display: 'flex', fontSize: 26, color: COLORS.txt2, marginTop: 4 }}>@{d.username}{d.subtitle ? ` · ${d.subtitle}` : ''}</div>
            </div>
          </div>

          {d.goalTitle ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 46, textTransform: 'uppercase', color: COLORS.ink, marginTop: 40, lineHeight: 1.1 }}>
                {truncate(d.goalTitle, 48)}
              </div>
              <div style={{ display: 'flex', width: '100%', height: 18, background: COLORS.track, borderRadius: 999, overflow: 'hidden', marginTop: 32 }}>
                <div style={{ display: 'flex', width: `${d.percent}%`, height: 18, background: COLORS.primary, borderRadius: 999 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 22 }}>
                <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 52, color: COLORS.ink }}>{d.percent}%</div>
                <div style={{ display: 'flex', fontSize: 30, color: COLORS.txt2 }}>{formatMoney(d.current)} / {formatMoney(d.target)}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 40, textTransform: 'uppercase', color: COLORS.ink, marginTop: 40, lineHeight: 1.15 }}>
              Sumate a mi comunidad
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 60, display: 'flex', fontSize: 28, color: 'rgba(251,247,242,0.5)' }}>{d.profileUrl}</div>
    </div>
  )
}
