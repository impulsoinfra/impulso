'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getUserLikedPostIds, setPostLike } from '@/lib/interactions'

interface InteractionsCtx {
  loggedIn: boolean
  isLiked: (postId: string) => boolean
  likeCount: (postId: string) => number
  toggleLike: (postId: string) => void
}

const Ctx = createContext<InteractionsCtx | null>(null)

// Wraps a set of posts (a feed, or a single permalink) and owns their like state.
// It loads which posts the current user liked in ONE query, and drives optimistic
// like/unlike for every <PostLikeButton> inside it.
export function PostInteractionsProvider({
  postIds,
  initialLikeCounts,
  children,
}: {
  postIds: string[]
  initialLikeCounts: Record<string, number>
  children: React.ReactNode
}) {
  const { user, getClient } = useAuth()
  const router = useRouter()
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set())
  const [counts, setCounts] = useState<Record<string, number>>(initialLikeCounts)
  const [busy, setBusy] = useState<Set<string>>(new Set())

  const idsKey = postIds.join(',')

  // Reset counts when the server sends a fresh set (navigation to another page).
  useEffect(() => { setCounts(initialLikeCounts) }, [initialLikeCounts])

  // Load which of these posts the current user already liked.
  useEffect(() => {
    const client = getClient()
    if (!user || !client || postIds.length === 0) { setLikedSet(new Set()); return }
    let active = true
    getUserLikedPostIds(client, user.id, postIds)
      .then((s) => { if (active) setLikedSet(s) })
      .catch(() => {})
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, getClient, idsKey])

  const toggleLike = useCallback((postId: string) => {
    const client = getClient()
    if (!user || !client) { router.push('/auth/login'); return }
    if (busy.has(postId)) return
    const nextLiked = !likedSet.has(postId)

    // Optimistic: flip liked state + adjust the count immediately.
    setLikedSet((prev) => {
      const next = new Set(prev)
      if (nextLiked) next.add(postId); else next.delete(postId)
      return next
    })
    setCounts((prev) => ({ ...prev, [postId]: Math.max(0, (prev[postId] ?? 0) + (nextLiked ? 1 : -1)) }))
    setBusy((prev) => new Set(prev).add(postId))

    setPostLike(client, postId, user.id, nextLiked)
      .catch(() => {
        // Revert on failure.
        setLikedSet((prev) => {
          const next = new Set(prev)
          if (nextLiked) next.delete(postId); else next.add(postId)
          return next
        })
        setCounts((prev) => ({ ...prev, [postId]: Math.max(0, (prev[postId] ?? 0) + (nextLiked ? -1 : 1)) }))
      })
      .finally(() => {
        setBusy((prev) => { const next = new Set(prev); next.delete(postId); return next })
      })
  }, [user, getClient, router, likedSet, busy])

  const value = useMemo<InteractionsCtx>(() => ({
    loggedIn: !!user,
    isLiked: (id) => likedSet.has(id),
    likeCount: (id) => counts[id] ?? 0,
    toggleLike,
  }), [user, likedSet, counts, toggleLike])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

function useInteractions() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('PostLikeButton/PostCommentLink must be used within a PostInteractionsProvider')
  return ctx
}

// Heart + count. Tapping toggles the current user's like (or routes to login).
export function PostLikeButton({ postId, size = 'sm' }: { postId: string; size?: 'sm' | 'md' }) {
  const { isLiked, likeCount, toggleLike } = useInteractions()
  const liked = isLiked(postId)
  const count = likeCount(postId)
  const iconCls = size === 'md' ? 'w-[18px] h-[18px]' : 'w-4 h-4'
  const textCls = size === 'md' ? 'text-[14px]' : 'text-[12px]'
  return (
    <button
      type="button"
      onClick={() => toggleLike(postId)}
      aria-pressed={liked}
      aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
      className={`inline-flex items-center gap-1.5 font-medium transition-colors ${textCls} ${
        liked ? 'text-rosa' : 'text-muted2 hover:text-rosa'
      }`}
    >
      <Heart className={`${iconCls} ${liked ? 'fill-rosa' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}

// Comment affordance: links to the post permalink's comments section. When a
// count is given it shows the number (feed); otherwise a "Comentar" label.
export function PostCommentLink({
  postId,
  username,
  count,
  label = 'Comentar',
  size = 'sm',
}: {
  postId: string
  username: string
  count?: number
  label?: string
  size?: 'sm' | 'md'
}) {
  const iconCls = size === 'md' ? 'w-[18px] h-[18px]' : 'w-4 h-4'
  const textCls = size === 'md' ? 'text-[14px]' : 'text-[12px]'
  return (
    <Link
      href={`/${username}/${postId}#comentarios`}
      className={`inline-flex items-center gap-1.5 font-medium text-muted2 hover:text-rosa transition-colors ${textCls}`}
    >
      <MessageCircle className={iconCls} />
      {count != null && count > 0 ? count : label}
    </Link>
  )
}
