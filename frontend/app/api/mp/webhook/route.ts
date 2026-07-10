import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/mercadopago'
import { settleDonation } from '@/lib/settle-donation'

export const runtime = 'nodejs'

// MercadoPago payment notification. We set notification_url with ?donation=<id>,
// so we know which donation this is about; the payment id comes from MP.
export async function POST(req: Request) {
  const url = new URL(req.url)
  const donationId = url.searchParams.get('donation')
  const queryDataId = url.searchParams.get('data.id') || url.searchParams.get('id')
  let paymentId = queryDataId
  let topic = url.searchParams.get('type') || url.searchParams.get('topic')

  try {
    const body = await req.json()
    paymentId = paymentId || body?.data?.id?.toString() || null
    topic = topic || body?.type || null
  } catch {
    // no/invalid JSON body — rely on query params
  }

  // Verify the notification really comes from MercadoPago (no-op if the secret
  // isn't configured yet).
  const validSig = verifyWebhookSignature({
    xSignature: req.headers.get('x-signature'),
    xRequestId: req.headers.get('x-request-id'),
    dataId: queryDataId || paymentId,
  })
  if (!validSig) return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })

  // Only handle payment events; ack everything else so MP stops retrying.
  if (topic && topic !== 'payment') return NextResponse.json({ ok: true })
  if (!donationId || !paymentId) return NextResponse.json({ ok: true })

  try {
    await settleDonation(donationId, paymentId)
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
