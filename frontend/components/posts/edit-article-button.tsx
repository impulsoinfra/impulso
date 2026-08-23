'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

// Shown only to the article's author: opens the full-page editor in edit mode.
// Rendered on the (server) reading page; ownership is decided client-side.
export function EditArticleButton({ postId, creatorId }: { postId: string; creatorId: string }) {
  const { user } = useAuth()
  if (!user || user.id !== creatorId) return null
  return (
    <Link
      href={`/dashboard/write?id=${postId}`}
      className="inline-flex items-center gap-1.5 text-txt2 hover:text-rosa text-[13px] font-medium transition-colors"
    >
      <Pencil className="w-3.5 h-3.5" /> Editar
    </Link>
  )
}
