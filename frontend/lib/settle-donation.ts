import { getAdminClient } from '@/lib/supabase-admin'
import { getPayment } from '@/lib/mercadopago'
import { sendDonationNotification } from '@/lib/email'

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

    // Only the caller that won the flip runs the side effects (goal + email),
    // so the goal is bumped and the creator is emailed exactly once.
    if (flipped && flipped.length > 0) {
      if (donation.goal_id) {
        await admin.rpc('increment_goal', { p_goal_id: donation.goal_id, p_amount: Number(donation.amount) })
      }
      await notifyCreator(admin, donation).catch((e) => console.error('[donation email]', e))
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

// Best-effort creator notification for an approved donation.
async function notifyCreator(admin: ReturnType<typeof getAdminClient>, donation: any): Promise<void> {
  const { data: creator } = await admin
    .from('profiles').select('name, email').eq('id', donation.creator_id).maybeSingle()
  if (!creator?.email) return

  let supporterName: string | null = null
  if (donation.supporter_id) {
    const { data: sup } = await admin.from('profiles').select('name').eq('id', donation.supporter_id).maybeSingle()
    supporterName = sup?.name ?? null
  }

  let goalTitle: string | null = null
  let goalCurrent: number | null = null
  let goalTarget: number | null = null
  if (donation.goal_id) {
    const { data: g } = await admin.from('goals').select('title, current_amount, target_amount').eq('id', donation.goal_id).maybeSingle()
    if (g) {
      goalTitle = g.title
      goalCurrent = Number(g.current_amount) // already incremented above
      goalTarget = Number(g.target_amount)
    }
  }

  await sendDonationNotification({
    to: creator.email,
    creatorName: creator.name,
    amount: Number(donation.amount),
    supporterName,
    message: donation.message,
    goalTitle,
    goalCurrent,
    goalTarget,
  })
}
