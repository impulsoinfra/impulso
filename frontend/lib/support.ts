import type { SupabaseClient } from '@supabase/supabase-js'

export interface SupportMessage {
  id: string
  name: string // supporter display name, or 'Anónimo' when the donation was anonymous
  amount: number
  message: string
  created_at: string
}

// Fetches approved donations that carry a message, most recent first, and resolves
// each supporter's display name. Works with any Supabase client:
// - the service-role admin client (public profile wall — reads across creators)
// - a logged-in creator's client (dashboard — RLS limits it to their own donations)
// Only safe fields are returned (never payer_email / supporter_id).
export async function getSupportMessages(
  client: SupabaseClient,
  creatorId: string,
  limit = 40
): Promise<SupportMessage[]> {
  const { data: donations } = await client
    .from('donations')
    .select('id, amount, message, created_at, supporter_id')
    .eq('creator_id', creatorId)
    .eq('status', 'approved')
    .not('message', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  const rows = (donations ?? []).filter((d) => (d.message ?? '').trim() !== '')
  if (rows.length === 0) return []

  const supporterIds = [...new Set(rows.map((d) => d.supporter_id).filter(Boolean))] as string[]
  const nameById = new Map<string, string>()
  if (supporterIds.length > 0) {
    const { data: profiles } = await client.from('profiles').select('id, name').in('id', supporterIds)
    for (const p of profiles ?? []) if (p.name) nameById.set(p.id, p.name)
  }

  return rows.map((d) => ({
    id: d.id,
    name: (d.supporter_id && nameById.get(d.supporter_id)) || 'Anónimo',
    amount: Number(d.amount),
    message: (d.message ?? '').trim(),
    created_at: d.created_at,
  }))
}
