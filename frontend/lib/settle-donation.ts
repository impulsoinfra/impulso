import { getAdminClient } from '@/lib/supabase-admin'
import { getPayment } from '@/lib/mercadopago'

export type SettleResult = 'approved' | 'rejected' | 'pending' | 'noop'

// Settle a donation against its MercadoPago payment. Shared by the webhook and
// the confirm-on-return endpoint; safe to call multiple times (idempotent) and
// race-safe (the goal is bumped only by the call that flips pending→approved).
export async function settleDonation(donationId: string, paymentId: string): Promise<SettleResult> {
  const admin = getAdminClient()

  const { data: donation } = await admin.from('donations').select('*').eq('id', donationId).maybeSingle()
  if (!donation) return 'noop'
  if (donation.status === 'approved') return 'approved'

  const { data: mp } = await admin.from('mp_accounts').select('access_token').eq('creator_id', donation.creator_id).maybeSingle()
  if (!mp?.access_token) return 'noop'

  const payment = await getPayment(mp.access_token, paymentId)
  // The payment must belong to this donation.
  if (payment.external_reference && payment.external_reference !== donationId) return 'noop'

  if (payment.status === 'approved') {
    // Atomic transition: only the caller that flips pending→approved bumps the goal.
    const { data: flipped } = await admin
      .from('donations')
      .update({
        status: 'approved',
        mp_payment_id: String(payment.id),
        payer_email: payment.payer?.email ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', donationId)
      .eq('status', 'pending')
      .select('id')

    if (flipped && flipped.length > 0 && donation.goal_id) {
      await admin.rpc('increment_goal', { p_goal_id: donation.goal_id, p_amount: Number(donation.amount) })
    }
    return 'approved'
  }

  if (['rejected', 'cancelled'].includes(payment.status)) {
    await admin
      .from('donations')
      .update({ status: 'rejected', mp_payment_id: String(payment.id), updated_at: new Date().toISOString() })
      .eq('id', donationId)
      .eq('status', 'pending')
    return 'rejected'
  }

  return 'pending'
}
