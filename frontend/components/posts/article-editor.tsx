'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Link as LinkIcon, Image as ImageIcon, Loader2, Check, X,
} from 'lucide-react'
import type { ArticleDoc } from '@/lib/article'

// Medium-style rich text editor for long-form articles. Outputs TipTap JSON.
// Shares the `.article-body` class with the reader so writing is WYSIWYG.
export function ArticleEditor({
  value,
  onChange,
  onUploadImage,
  placeholder = 'Escribí tu historia…',
}: {
  value: ArticleDoc | null
  onChange: (doc: ArticleDoc) => void
  onUploadImage: (file: File) => Promise<string>
  placeholder?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false, // required under Next.js SSR to avoid hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
        },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? '',
    editorProps: { attributes: { class: 'article-body' } },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as ArticleDoc),
  })

  // External reset: when the parent clears the value (after publishing), empty the editor.
  useEffect(() => {
    if (!editor) return
    if (value == null && !editor.isEmpty) editor.commands.clearContent()
  }, [value, editor])

  async function handlePickImage(file: File) {
    setErr(null)
    if (!file.type.startsWith('image/')) { setErr('Elegí una imagen.'); return }
    if (file.size > 10 * 1024 * 1024) { setErr('Cada imagen debe pesar menos de 10MB.'); return }
    setUploading(true)
    try {
      const url = await onUploadImage(file)
      editor?.chain().focus().setImage({ src: url }).run()
    } catch {
      setErr('No se pudo subir la imagen. Intentá de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  function openLink() {
    if (!editor) return
    setLinkUrl((editor.getAttributes('link').href as string) ?? '')
    setLinkOpen(true)
  }

  function applyLink() {
    if (!editor) return
    const url = linkUrl.trim()
    if (!url) {
      editor.chain().focus().unsetLink().run()
    } else {
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    }
    setLinkOpen(false)
    setLinkUrl('')
  }

  const canEdit = !!editor

  return (
    <div className="article-editor border border-borde rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-borde bg-crema/60 px-1.5 py-1">
        <Btn label="Negrita" active={editor?.isActive('bold')} disabled={!canEdit}
          onClick={() => editor?.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></Btn>
        <Btn label="Itálica" active={editor?.isActive('italic')} disabled={!canEdit}
          onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></Btn>
        <Sep />
        <Btn label="Título" active={editor?.isActive('heading', { level: 2 })} disabled={!canEdit}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></Btn>
        <Btn label="Subtítulo" active={editor?.isActive('heading', { level: 3 })} disabled={!canEdit}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></Btn>
        <Sep />
        <Btn label="Lista" active={editor?.isActive('bulletList')} disabled={!canEdit}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></Btn>
        <Btn label="Lista numerada" active={editor?.isActive('orderedList')} disabled={!canEdit}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></Btn>
        <Btn label="Cita" active={editor?.isActive('blockquote')} disabled={!canEdit}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></Btn>
        <Btn label="Separador" disabled={!canEdit}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus className="w-4 h-4" /></Btn>
        <Sep />
        <Btn label="Enlace" active={editor?.isActive('link')} disabled={!canEdit} onClick={openLink}>
          <LinkIcon className="w-4 h-4" />
        </Btn>
        <Btn label="Imagen" disabled={!canEdit || uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </Btn>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) handlePickImage(f) }}
        />
      </div>

      {/* Inline link input row */}
      {linkOpen && (
        <div className="flex items-center gap-1.5 border-b border-borde bg-white px-2 py-1.5">
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } else if (e.key === 'Escape') setLinkOpen(false) }}
            placeholder="https://…"
            className="flex-1 text-[13px] text-tinta outline-none border border-borde rounded px-2 py-1 focus:border-rosa/60"
          />
          <button type="button" onClick={applyLink} aria-label="Aplicar enlace"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-rosa text-white hover:bg-rosa-hover"><Check className="w-4 h-4" /></button>
          <button type="button" onClick={() => setLinkOpen(false)} aria-label="Cancelar"
            className="w-7 h-7 flex items-center justify-center rounded-md text-txt2 hover:bg-tinta/[0.06]"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Editable area */}
      <div className="px-3.5 py-3 max-h-[420px] overflow-y-auto cursor-text" onClick={() => editor?.chain().focus().run()}>
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="text-muted2 text-sm py-16 text-center">Cargando editor…</div>
        )}
      </div>

      {err && <p className="text-red-500 text-[12px] px-3.5 pb-2">{err}</p>}
    </div>
  )
}

function Btn({
  onClick, active, disabled, label, children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      // Keep the editor selection when clicking a toolbar button.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors disabled:opacity-40 ${
        active ? 'bg-rosa/10 text-rosa' : 'text-txt2 hover:bg-tinta/[0.06]'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="mx-0.5 w-px h-5 bg-borde" />
}
