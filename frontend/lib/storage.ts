import type { SupabaseClient } from '@supabase/supabase-js'

// Uploads a file to the public `posts` bucket (owner-folder RLS, same as
// banners/avatars) and returns its public URL. Shared by the dashboard post form
// and the full-page article editor.
export async function uploadPostFile(client: SupabaseClient, userId: string, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${userId}/post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await client.storage.from('posts').upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) throw error
  return client.storage.from('posts').getPublicUrl(path).data.publicUrl
}
