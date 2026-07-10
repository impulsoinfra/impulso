import { NextResponse } from 'next/server'
import { settleDonation } from '@/lib/settle-donation'

export const runtime = 'nodejs'

// Called from /gracias when the buyer returns from MercadoPago. Settles the
// donation from the payment (source of truth is MP), so it works even if the
// webhook is delayed or — in test mode — never fires. Idempotent.
export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }) }

  const donationId: string | undefined = body?.donationId
  const paymentId: string | undefined = body?.paymentId
  if (!donationId || !paymentId) return NextResponse.json({ error: 'missing' }, { status: 400 })

  try {
    const result = await settleDonation(donationId, String(paymentId))
    return NextResponse.json({ status: result })
  } catch (e) {
    console.error('[mp confirm]', e)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
