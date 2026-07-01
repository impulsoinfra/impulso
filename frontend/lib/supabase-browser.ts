import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Single browser Supabase client for the entire app.
//
// This MUST be a module-level singleton. Creating more than one client in the
// same browser tab makes multiple GoTrueClient instances share the same auth
// storage key, which causes refresh-token races and lock contention.
//
// Never call createClient() elsewhere in browser code — always import this.
let browserClient: SupabaseClient | null = null

export function getBrowserClient(): SupabaseClient | null {
  // On the server there is no persistent auth storage; return null so callers
  // skip auth work during SSR/build.
  if (typeof window === 'undefined') return null

  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Explicit, stable storage key. A fresh key also gives every user a clean
      // slate on deploy, discarding any corrupted token from earlier bugs.
      storageKey: 'impulso-auth',
    },
  })

  return browserClient
}
