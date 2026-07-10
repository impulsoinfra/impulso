import { NextResponse } from 'next/server'
import { getUserFromRequest, getBaseUrl } from '@/lib/api-helpers'
import { MP_AUTH_HOST, mpClientId, signState } from '@/lib/mercadopago'

export const runtime = 'nodejs'

// Returns the MercadoPago authorization URL for the logged-in creator to connect
// their MP account (OAuth). The client redirects the browser to `url`.
export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const redirectUri = `${getBaseUrl(req)}/api/mp/oauth/callback`
    const state = signState(user.id)
    const url =
      `${MP_AUTH_HOST}/authorization?client_id=${encodeURIComponent(mpClientId())}` +
      `&response_type=code&platform_id=mp` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}`
    return NextResponse.json({ url })
  } catch (e) {
    console.error('[mp oauth start]', e)
    return NextResponse.json({ error: 'config' }, { status: 500 })
  }
}
