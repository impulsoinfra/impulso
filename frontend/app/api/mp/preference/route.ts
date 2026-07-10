import { NextResponse } from 'next/server'
import { getBaseUrl, getUserFromRequest } from '@/lib/api-helpers'
import { getAdminClient } from '@/lib/supabase-admin'
import { createPreference, MARKETPLACE_FEE_RATE } from '@/lib/mercadopago'

export const runtime = 'nodejs'

const MIN = 100
const MAX = 100000

// Creates a Checkout Pro preference for a donation to a creator, using the
// creator's OAuth access token and taking the marketplace fee.
export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }) }

  const creatorId: string | undefined = body?.creatorId
  const postId: string | undefined = body?.postId
  const message: string | undefined = body?.message
  const amount = Number(body?.amount)

  if (!creatorId || !Number.isFinite(amount) || amount < MIN || amount > MAX) {
    return NextResponse.json({ error: 'invalid_amount' }, { status: 400 })
  }

  const admin = getAdminClient()

  const { data: mp } = await admin.from('mp_accounts').select('access_token').eq('creator_id', creatorId).maybeSingle()
  if (!mp?.access_token) return NextResponse.json({ error: 'not_connected' }, { status: 409 })

  const { data: creator } = await admin.from('profiles').select('name, username').eq('id', creatorId).maybeSingle()
  const { data: goal } = await admin
    .from('goals').select('id')
    .eq('creator_id', creatorId).eq('is_active', true)
    .order('created_at', { ascending: false }).limit(1).maybeSingle()

  const supporter = await getUserFromRequest(req) // optional (anonymous donations allowed)
  const fee = Math.round(amount * MARKETPLACE_FEE_RATE * 100) / 100

  const { data: donation, error: dErr } = await admin.from('donations').insert({
    creator_id: creatorId,
    supporter_id: supporter?.id ?? null,
    post_id: postId ?? null,
    goal_id: goal?.id ?? null,
    amount,
    marketplace_fee: fee,
    message: message?.trim() || null,
    status: 'pending',
  }).select('id').single()
  if (dErr || !donation) {
    console.error('[preference] donation insert', dErr)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }

  const base = getBaseUrl(req)
  try {
    const pref = await createPreference({
      sellerAccessToken: mp.access_token,
      title: `Apoyo a ${creator?.name || creator?.username || 'un creador'} en Impulso`,
      amount,
      marketplaceFee: fee,
      externalReference: donation.id,
      notificationUrl: `${base}/api/mp/webhook?donation=${donation.id}`,
      backUrls: {
        success: `${base}/gracias?status=success&d=${donation.id}`,
        failure: `${base}/gracias?status=failure&d=${donation.id}`,
        pending: `${base}/gracias?status=pending&d=${donation.id}`,
      },
      metadata: { donation_id: donation.id, creator_id: creatorId },
    })
    await admin.from('donations').update({ mp_preference_id: pref.id }).eq('id', donation.id)
    return NextResponse.json({ init_point: pref.init_point })
  } catch (e) {
    console.error('[preference] MP', e)
    await admin.from('donations').update({ status: 'rejected' }).eq('id', donation.id)
    return NextResponse.json({ error: 'mp_error' }, { status: 502 })
  }
}
