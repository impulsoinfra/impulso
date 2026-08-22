'use client'

import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MediaEmbed } from './media-embed'
import { PostLikeButton, PostCommentLink } from './post-interactions'
import { ShareMenu, type ShareOption } from '@/components/share/share-menu'
import { ImpulsarButton } from '@/components/support/impulsar-button'

// The public profile of whoever wrote the post — shown in the mixed feed header.
export interface FeedPostCreator {
  id: string
  name: string
  username: string
  avatar_url: string | null
  creator_type: string | null
  location: string | null
  mp_connected: boolean
}

// One post in the cross-creator Explorar feed (posts + author + counts).
export interface FeedPost {
  id: string
  title: string | null
  content: string | null
  post_type: string
  media_url: string | null
  media_urls: string[] | null
  created_at: string
  likeCount: number
  commentCount: number
  creator: FeedPostCreator
}

const TYPE_LABEL: Record<string, string> = {
  text: 'Texto',
  image: 'Imagen',
  link: 'Video/Música',
  article: 'Artículo',
  audio: 'Audio',
}

// Left-border accent per content type (style guide §4), matching the profile feed.
function postAccent(postType: string): string {
  switch (postType) {
    case 'audio':
      return '#F0355C' // rosa
    case 'image':
    case 'link':
      return '#FF9D3D' // naranja (foto/video)
    default:
      return '#1B1A2E' // tinta (texto/artículo)
  }
}

// Badge text/background tuned per accent so the type chip reads clearly (the
// naranja accent uses a darker orange for legible text).
function badgeStyle(accent: string): { color: string; background: string } {
  if (accent === '#FF9D3D') return { color: '#994f0a', background: 'rgba(255,157,61,0.15)' }
  if (accent === '#F0355C') return { color: '#F0355C', background: 'rgba(240,53,92,0.1)' }
  return { color: '#1B1A2E', background: 'rgba(27,26,46,0.08)' }
}

// One card in the cross-creator feed: an author header, a per-type body, and a
// shared interactions footer. Must render inside a <PostInteractionsProvider>.
export function FeedPostCard({ post, shareOptions }: { post: FeedPost; shareOptions: ShareOption[] }) {
  const accent = postAccent(post.post_type)
  const badge = badgeStyle(accent)
  const { creator } = post
  const permalink = `/${creator.username}/${post.id}`
  const firstImage = post.media_urls?.[0] || post.media_url
  const imageCount = post.media_urls?.length || (post.media_url ? 1 : 0)
  const relTime = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es })
  const subtitle = [creator.creator_type, creator.location].filter(Boolean).join(' · ')
  const initials = (creator.name || creator.username)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const header = (
    <div className="flex items-center gap-2.5 mb-3">
      <Link href={`/${creator.username}`} className="shrink-0">
        {creator.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creator.avatar_url} alt={creator.name} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
            style={{ background: accent }}
          >
            {initials}
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/${creator.username}`}
            className="text-[13px] font-semibold text-tinta truncate hover:text-rosa transition-colors"
          >
            {creator.name}
          </Link>
          <span
            className="text-[9px] font-semibold px-2 py-[1px] rounded-full shrink-0"
            style={{ color: badge.color, background: badge.background }}
          >
            {TYPE_LABEL[post.post_type] ?? 'Publicación'}
          </span>
        </div>
        <p className="text-[11px] text-muted2 truncate">
          {subtitle ? `${subtitle} · ` : ''}
          <Link href={permalink} className="hover:text-rosa transition-colors">
            {relTime}
          </Link>
        </p>
      </div>
    </div>
  )

  const footer = (
    <div className="flex items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-borde">
      <div className="flex items-center gap-4 min-w-0">
        <PostLikeButton postId={post.id} />
        <PostCommentLink postId={post.id} username={creator.username} count={post.commentCount} />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ShareMenu
          options={shareOptions}
          triggerLabel="Compartir"
          triggerClassName="inline-flex items-center gap-1.5 text-muted2 hover:text-rosa text-[12px] font-medium transition-colors"
        />
        <ImpulsarButton
          creatorId={creator.id}
          creatorName={creator.name}
          creatorUsername={creator.username}
          postId={post.id}
          postTitle={post.title}
          creatorConnected={creator.mp_connected}
        />
      </div>
    </div>
  )

  // Articles are long-form: the body links to the reading page (Anton title +
  // cover), and the footer stays outside that link so its buttons stay clickable.
  if (post.post_type === 'article') {
    return (
      <div className="bg-white border border-borde rounded-[10px]" style={{ borderLeft: `4px solid ${accent}` }}>
        <div className="p-3.5 pb-0">{header}</div>
        <Link href={permalink} className="block overflow-hidden hover:bg-tinta/[0.015] transition-colors">
          {post.media_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.media_url} alt={post.title ?? ''} className="w-full h-40 object-cover" />
          )}
          <div className="p-3.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-rosa mb-1.5">
              <BookOpen className="w-3 h-3" /> Artículo
            </span>
            {post.title && <p className="disp text-tinta text-[18px] leading-tight mb-1.5">{post.title}</p>}
            {post.content && <p className="text-[12px] text-txt2 leading-relaxed mb-2.5 line-clamp-3">{post.content}</p>}
            <span className="inline-flex items-center gap-1 text-rosa text-[12px] font-semibold">
              Leer artículo <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
        <div className="px-3.5 pb-3.5">{footer}</div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-borde rounded-[10px] p-3.5" style={{ borderLeft: `4px solid ${accent}` }}>
      {header}
      {post.title && <p className="font-semibold text-[13px] text-tinta mb-1.5">{post.title}</p>}
      {post.content && (
        <p className="text-[12px] text-txt2 leading-relaxed mb-2 whitespace-pre-wrap line-clamp-6">{post.content}</p>
      )}

      {post.post_type === 'image' && firstImage && (
        // Compact cover (height-capped so a tall photo doesn't fill the screen);
        // links to the permalink where the full image / carousel lives.
        <Link href={permalink} className="relative block overflow-hidden rounded-lg border border-borde mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={firstImage} alt={post.title ?? ''} className="w-full max-h-[260px] object-cover" />
          {imageCount > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              +{imageCount - 1}
            </span>
          )}
        </Link>
      )}
      {post.post_type !== 'image' && post.media_url && <MediaEmbed url={post.media_url} title={post.title} />}

      {footer}
    </div>
  )
}
