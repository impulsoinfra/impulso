import { createClient } from '@supabase/supabase-js'

// Base URL for building redirect_uri, back_urls and notification_url.
// Prefer the explicit NEXT_PUBLIC_APP_URL (must be the public domain registered
// in the MP app); fall back to the request origin.
export function getBaseUrl(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL
  if (env) return env.replace(/\/$/, '')
  const url = new URL(req.url)
  return `${url.protocol}//${url.host}`
}

// Verify the Supabase JWT sent as `Authorization: Bearer <token>` and return the
// user id. Our auth is client-side, so API routes authenticate via this header.
export async function getUserFromRequest(req: Request): Promise<{ id: string } | null> {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await sb.auth.getUser(token)
  if (error || !data.user) return null
  return { id: data.user.id }
}
