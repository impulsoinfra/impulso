import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/api-helpers'
import { verifyState, exchangeCodeForToken } from '@/lib/mercadopago'
import { getAdminClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

// MP redirects the creator's browser here after they authorize. We verify the
// signed state, exchange the code for the seller's tokens, and store them.
export async function GET(req: Request) {
  const base = getBaseUrl(req)
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) return NextResponse.redirect(`${base}/dashboard?mp=error`)
  const creatorId = verifyState(state)
  if (!creatorId) return NextResponse.redirect(`${base}/dashboard?mp=error`)

  try {
    const redirectUri = `${base}/api/mp/oauth/callback`
    const token = await exchangeCodeForToken(code, redirectUri)

    const admin = getAdminClient()
    const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString()
    const { error: upErr } = await admin.from('mp_accounts').upsert({
      creator_id: creatorId,
      mp_user_id: String(token.user_id),
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      public_key: token.public_key,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    if (upErr) throw upErr

    await admin.from('profiles').update({ mp_connected: true }).eq('id', creatorId)

    return NextResponse.redirect(`${base}/dashboard?mp=connected`)
  } catch (e) {
    console.error('[mp oauth callback]', e)
    return NextResponse.redirect(`${base}/dashboard?mp=error`)
  }
}
