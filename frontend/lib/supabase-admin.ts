import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-only Supabase client using the service_role key. Bypasses RLS, so it
// must NEVER be imported into client components. Used by API routes to store MP
// OAuth tokens and write donations.
let admin: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (admin) return admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return admin
}
