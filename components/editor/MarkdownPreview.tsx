'use client'
import { useMemo } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

interface MarkdownPreviewProps {
  content: string
  className?: string
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  const sanitizedHtml = useMemo(() => {
    if (!content.trim()) return ''

    const rawHtml = marked.parse(content)

    return DOMPurify.sanitize(rawHtml as string, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'class', 'id', 'target', 'rel', 'open'],
      ADD_TAGS: ['details', 'summary'],
    })
  }, [content])

  if (!content.trim()) {
    return (
      <div className={`flex items-center justify-center h-full text-text-secondary ${className}`}>
        <p>Start writing to see preview...</p>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        /* Fix task list items - remove list bullets for checkbox items */
        .prose :where(li):has(input[type="checkbox"]):not(:where([class~="not-prose"] *)) {
          list-style: none;
          padding-left: 0;
        }
        .prose :where(li input[type="checkbox"]):not(:where([class~="not-prose"] *)) {
          margin-right: 0.5rem;
        }
      `}</style>
      <div
        className={`prose prose-sm prose-gray dark:prose-invert max-w-none px-6 py-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </>
  )
}