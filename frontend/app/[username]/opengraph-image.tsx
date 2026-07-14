import { ImageResponse } from 'next/og'
import { createServerClient } from '@/lib/supabase-server'
import { loadOgFonts } from '@/lib/og/fonts'

export const runtime = 'edge'
export const alt = 'Perfil en Impulso'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand palette
const TINTA = '#1B1A2E'
const CREMA = '#FBF7F2'
const ROSA = '#F0355C'
const NARANJA = '#FF9D3D'

function AscendingBars({ scale = 1 }: { scale?: number }) {
  const bars = [
    { h: 22 * scale, c: 'rgba(251,247,242,0.35)' },
    { h: 32 * scale, c: 'rgba(251,247,242,0.55)' },
    { h: 44 * scale, c: 'rgba(251,247,242,0.8)' },
    { h: 56 * scale, c: ROSA },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 * scale }}>
      {bars.map((b, i) => (
        <div
          key={i}
          style={{ width: 13 * scale, height: b.h, background: b.c, borderRadius: 7 * scale }}
        />
      ))}
    </div>
  )
}

interface Props {
  params: Promise<{ username: string }>
}

export default async function Image({ params }: Props) {
  const { username } = await params
  const fonts = await loadOgFonts()

  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, bio, avatar_url, creator_type')
    .eq('username', username)
    .single()

  // Fallback branded card if the creator doesn't exist
  if (!profile) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: TINTA,
            fontFamily: 'Inter',
          }}
        >
          <AscendingBars scale={1.6} />
          <div style={{ fontFamily: 'Anton', fontSize: 64, color: CREMA, marginTop: 28, letterSpacing: 2 }}>
            IMPULSO
          </div>
          <div style={{ fontSize: 26, color: 'rgba(251,247,242,0.65)', marginTop: 8 }}>
            El impulso que necesitás
          </div>
        </div>
      ),
      { ...size, fonts }
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

  const initials = profile.name
    ? profile.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : username.slice(0, 2).toUpperCase()

  const goalPercent = goal
    ? Math.min(Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100), 100)
    : 0

  const firstName = profile.name?.split(' ')[0] ?? username

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: TINTA,
          fontFamily: 'Inter',
          color: CREMA,
          padding: 60,
        }}
      >
        {/* Top bar — logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <AscendingBars scale={0.85} />
          <div style={{ fontFamily: 'Anton', fontSize: 30, letterSpacing: 1.5, color: CREMA }}>
            IMPULSO
          </div>
        </div>

        {/* Main */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 50, marginTop: 24 }}>
          {/* Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  width={130}
                  height={130}
                  style={{ width: 130, height: 130, borderRadius: 999, objectFit: 'cover', border: `5px solid ${CREMA}` }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 130,
                    height: 130,
                    borderRadius: 999,
                    background: ROSA,
                    color: '#fff',
                    fontFamily: 'Anton',
                    fontSize: 52,
                  }}
                >
                  {initials}
                </div>
              )}
              {profile.creator_type ? (
                <div
                  style={{
                    display: 'flex',
                    background: NARANJA,
                    color: TINTA,
                    fontSize: 20,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    padding: '8px 18px',
                    borderRadius: 999,
                  }}
                >
                  {profile.creator_type}
                </div>
              ) : null}
            </div>

            <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 68, lineHeight: 1.05, color: CREMA, marginTop: 28 }}>
              {profile.name}
            </div>
            <div style={{ display: 'flex', fontSize: 28, color: 'rgba(251,247,242,0.55)', marginTop: 6 }}>
              @{username}
            </div>
            {profile.bio ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 24,
                  color: 'rgba(251,247,242,0.75)',
                  marginTop: 18,
                  lineHeight: 1.4,
                  maxWidth: 560,
                }}
              >
                {profile.bio.length > 110 ? profile.bio.slice(0, 110) + '…' : profile.bio}
              </div>
            ) : null}
          </div>

          {/* Goal card */}
          {goal ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: 420,
                background: CREMA,
                borderRadius: 20,
                padding: 32,
              }}
            >
              <div style={{ display: 'flex', fontSize: 18, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: NARANJA }}>
                Meta actual
              </div>
              <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 30, lineHeight: 1.1, textTransform: 'uppercase', color: TINTA, marginTop: 10 }}>
                {goal.title.length > 46 ? goal.title.slice(0, 46) + '…' : goal.title}
              </div>
              {/* Progress track */}
              <div style={{ display: 'flex', height: 16, background: '#e9e4da', borderRadius: 999, marginTop: 24, overflow: 'hidden' }}>
                <div style={{ display: 'flex', width: `${goalPercent}%`, height: 16, background: ROSA, borderRadius: 999 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 18 }}>
                <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: 44, color: TINTA }}>{goalPercent}%</div>
              </div>
              <div style={{ display: 'flex', fontSize: 20, color: '#5F5E5A', marginTop: 4 }}>
                ${Number(goal.current_amount).toLocaleString('es-AR')} de ${Number(goal.target_amount).toLocaleString('es-AR')}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 26, color: CREMA }}>
            Apoyá a <span style={{ color: ROSA, fontWeight: 600, marginLeft: 8, marginRight: 8 }}>{firstName}</span> en tuimpulso.ar
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(251,247,242,0.5)' }}>tuimpulso.ar</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
