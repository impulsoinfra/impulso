import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { getPayment } from '@/lib/mercadopago'

export const runtime = 'nodejs'

// MercadoPago payment notification. We set notification_url with ?donation=<id>,
// so we know which donation this is about; the payment id comes from MP.
export async function POST(req: Request) {
  const url = new URL(req.url)
  const donationId = url.searchParams.get('donation')
  let paymentId = url.searchParams.get('data.id') || url.searchParams.get('id')
  let topic = url.searchParams.get('type') || url.searchParams.get('topic')

  try {
    const body = await req.json()
    paymentId = paymentId || body?.data?.id?.toString() || null
    topic = topic || body?.type || null
  } catch {
    // no/invalid JSON body — rely on query params
  }

  // Only handle payment events; ack everything else so MP stops retrying.
  if (topic && topic !== 'payment') return NextResponse.json({ ok: true })
  if (!donationId || !paymentId) return NextResponse.json({ ok: true })

  try {
    const admin = getAdminClient()
    const { data: donation } = await admin.from('donations').select('*').eq('id', donationId).maybeSingle()
    if (!donation) return NextResponse.json({ ok: true })
    if (donation.status === 'approved') return NextResponse.json({ ok: true }) // idempotent

    const { data: mp } = await admin.from('mp_accounts').select('access_token').eq('creator_id', donation.creator_id).maybeSingle()
    if (!mp?.access_token) return NextResponse.json({ ok: true })

    const payment = await getPayment(mp.access_token, paymentId)
    if (payment.external_reference && payment.external_reference !== donationId) {
      return NextResponse.json({ ok: true }) // mismatch — ignore
    }

    if (payment.status === 'approved') {
      await admin.from('donations').update({
        status: 'approved',
        mp_payment_id: String(payment.id),
        payer_email: payment.payer?.email ?? null,
        updated_at: new Date().toISOString(),
      }).eq('id', donationId)

      if (donation.goal_id) {
        await admin.rpc('increment_goal', { p_goal_id: donation.goal_id, p_amount: Number(donation.amount) })
      }
    } else if (['rejected', 'cancelled'].includes(payment.status)) {
      await admin.from('donations').update({
        status: 'rejected',
        mp_payment_id: String(payment.id),
        updated_at: new Date().toISOString(),
      }).eq('id', donationId)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[mp webhook]', e)
    // 500 → MP will retry the notification later
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// MP may probe the URL with GET; respond OK.
export async function GET() {
  return NextResponse.json({ ok: true })
}
