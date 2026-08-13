import type { SupabaseClient } from '@supabase/supabase-js'

// A comment plus its author's public profile (name/username/avatar).
export interface PostComment {
  id: string
  content: string
  created_at: string
  user_id: string
  author: {
    name: string | null
    username: string | null
    avatar_url: string | null
  } | null
}

// PostgREST returns embedded aggregates as `[{ count: n }]`. Reads that shape
// (used by the feed / permalink queries: `select('*, post_likes(count)')`).
export function embeddedCount(value: unknown): number {
  if (Array.isArray(value)) return Number((value[0] as { count?: number } | undefined)?.count ?? 0)
  return 0
}

// Which of the given posts the user has liked (one query, for the feed).
export async function getUserLikedPostIds(
  client: SupabaseClient,
  userId: string,
  postIds: string[]
): Promise<Set<string>> {
  if (postIds.length === 0) return new Set()
  const { data } = await client
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds)
  return new Set((data ?? []).map((r) => r.post_id as string))
}

// Adds or removes the current user's like on a post.
export async function setPostLike(
  client: SupabaseClient,
  postId: string,
  userId: string,
  liked: boolean
): Promise<void> {
  if (liked) {
    const { error } = await client.from('post_likes').upsert(
      { post_id: postId, user_id: userId },
      { onConflict: 'post_id,user_id', ignoreDuplicates: true }
    )
    if (error) throw error
  } else {
    const { error } = await client
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    if (error) throw error
  }
}

const COMMENT_SELECT = 'id, content, created_at, user_id, author:profiles(name, username, avatar_url)'

// Lists a post's comments, newest first, with each author's public profile.
export async function listComments(
  client: SupabaseClient,
  postId: string,
  limit = 100
): Promise<PostComment[]> {
  const { data, error } = await client
    .from('post_comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as PostComment[]
}

// Inserts a comment and returns it (with the author profile) for optimistic UI.
export async function addComment(
  client: SupabaseClient,
  postId: string,
  userId: string,
  content: string
): Promise<PostComment> {
  const { data, error } = await client
    .from('post_comments')
    .insert({ post_id: postId, user_id: userId, content: content.trim() })
    .select(COMMENT_SELECT)
    .single()
  if (error) throw error
  return data as unknown as PostComment
}

// Deletes a comment (RLS allows the author or the post owner).
export async function deleteComment(client: SupabaseClient, commentId: string): Promise<void> {
  const { error } = await client.from('post_comments').delete().eq('id', commentId)
  if (error) throw error
}
