// Long-form articles store their body as TipTap JSON in `posts.body`. The editor
// only produces the node/mark types we enable, so the document is a small, closed
// schema — safe to render without HTML sanitization (see components/posts/article-content).

export interface ArticleMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface ArticleNode {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: ArticleMark[]
  content?: ArticleNode[]
}

export type ArticleDoc = ArticleNode

// Block nodes whose end should read as a line break when flattening to text.
const BLOCK_TYPES = new Set([
  'paragraph', 'heading', 'blockquote', 'listItem', 'horizontalRule', 'codeBlock',
])

// Collapse the document to plain text (for excerpts, reading time, OG images).
export function articleToPlainText(doc: ArticleDoc | null | undefined): string {
  if (!doc) return ''
  const parts: string[] = []
  const walk = (node: ArticleNode) => {
    if (node.text) parts.push(node.text)
    if (node.content) {
      node.content.forEach(walk)
      if (BLOCK_TYPES.has(node.type ?? '')) parts.push('\n')
    }
  }
  walk(doc)
  return parts.join('').replace(/\n{2,}/g, '\n').trim()
}

// Short single-line summary for feed cards + social images.
export function articleExcerpt(doc: ArticleDoc | null | undefined, max = 200): string {
  const text = articleToPlainText(doc).replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

export function readingTimeMinutes(doc: ArticleDoc | null | undefined): number {
  const words = articleToPlainText(doc).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

// First image in the body — used as a fallback cover when none is set explicitly.
export function firstArticleImage(doc: ArticleDoc | null | undefined): string | null {
  if (!doc) return null
  let found: string | null = null
  const walk = (node: ArticleNode) => {
    if (found) return
    if (node.type === 'image' && typeof node.attrs?.src === 'string') {
      found = node.attrs.src as string
      return
    }
    node.content?.forEach(walk)
  }
  walk(doc)
  return found
}

// A document is "empty" when it has no text and no images (blank editor).
export function isArticleEmpty(doc: ArticleDoc | null | undefined): boolean {
  if (!doc) return true
  return articleToPlainText(doc).length === 0 && !firstArticleImage(doc)
}
