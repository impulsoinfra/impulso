import type { SupabaseClient } from '@supabase/supabase-js'

// Platform commission taken from each donation. Stored in the single-row
// `platform_config` table so it can be changed with one UPDATE (no redeploy).
// This is only the fallback used when the row is missing or unreadable.
export const DEFAULT_PLATFORM_FEE_RATE = 0.10

// Reads the current commission rate (0–1). Pass a service-role client — the
// table is service-role only (RLS with no policies). Falls back to the default
// on any error so a config hiccup never blocks a donation.
export async function getPlatformFeeRate(client: SupabaseClient): Promise<number> {
  try {
    const { data } = await client.from('platform_config').select('fee_rate').maybeSingle()
    const rate = Number(data?.fee_rate)
    if (Number.isFinite(rate) && rate >= 0 && rate <= 1) return rate
  } catch {
    // fall through to the default
  }
  return DEFAULT_PLATFORM_FEE_RATE
}
