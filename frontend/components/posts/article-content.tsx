import { Fragment, type ReactNode } from 'react'
import type { ArticleNode, ArticleMark } from '@/lib/article'

// Renders a TipTap article document as styled, read-only content. Styling lives
// in the shared `.article-body` CSS block (globals.css) so the reader matches the
// editor exactly (WYSIWYG).
//
// SAFE BY CONSTRUCTION: only the node/mark types the editor can produce are
// handled; anything else is ignored. React escapes all text; links and images
// are forced to http(s). No raw HTML is ever injected, so a creator cannot XSS
// their readers.

function isSafeHref(href: unknown): href is string {
  return typeof href === 'string' && /^https?:\/\//i.test(href)
}

export function ArticleContent({ doc }: { doc: ArticleNode | null | undefined }) {
  if (!doc?.content?.length) return null
  return (
    <div className="article-body">
      {doc.content.map((n, i) => (
        <RenderNode key={i} node={n} />
      ))}
    </div>
  )
}

function Children({ nodes }: { nodes?: ArticleNode[] }) {
  return <>{nodes?.map((n, i) => <RenderNode key={i} node={n} />)}</>
}

function RenderNode({ node }: { node: ArticleNode }): ReactNode {
  switch (node.type) {
    case 'text':
      return <TextNode node={node} />
    case 'paragraph':
      return <p><Children nodes={node.content} /></p>
    case 'heading':
      return node.attrs?.level === 3
        ? <h3><Children nodes={node.content} /></h3>
        : <h2><Children nodes={node.content} /></h2>
    case 'bulletList':
      return <ul><Children nodes={node.content} /></ul>
    case 'orderedList':
      return <ol><Children nodes={node.content} /></ol>
    case 'listItem':
      return <li><Children nodes={node.content} /></li>
    case 'blockquote':
      return <blockquote><Children nodes={node.content} /></blockquote>
    case 'codeBlock':
      return <pre><code>{node.content?.map((c) => c.text).join('') ?? ''}</code></pre>
    case 'horizontalRule':
      return <hr />
    case 'hardBreak':
      return <br />
    case 'image':
      return <ArticleImage node={node} />
    default:
      return node.content ? <Children nodes={node.content} /> : null
  }
}

function TextNode({ node }: { node: ArticleNode }): ReactNode {
  let el: ReactNode = node.text ?? ''
  for (const mark of node.marks ?? []) {
    el = wrapMark(mark, el)
  }
  return <>{el}</>
}

function wrapMark(mark: ArticleMark, children: ReactNode): ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong>{children}</strong>
    case 'italic':
      return <em>{children}</em>
    case 'strike':
      return <s>{children}</s>
    case 'underline':
      return <u>{children}</u>
    case 'code':
      return <code>{children}</code>
    case 'link': {
      const href = mark.attrs?.href
      if (!isSafeHref(href)) return <Fragment>{children}</Fragment>
      return (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow">
          {children}
        </a>
      )
    }
    default:
      return <Fragment>{children}</Fragment>
  }
}

function ArticleImage({ node }: { node: ArticleNode }) {
  const src = node.attrs?.src
  if (!isSafeHref(src)) return null
  const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''
  const title = typeof node.attrs?.title === 'string' ? node.attrs.title : undefined
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} title={title} />
}
