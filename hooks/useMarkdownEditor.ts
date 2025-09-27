'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

interface UseMarkdownEditorOptions {
  onChange?: (value: string) => void
}

export type ViewMode = 'edit' | 'preview' | 'split'

export function useMarkdownEditor(initialContent = '', options?: UseMarkdownEditorOptions) {
  const [content, setContent] = useState(initialContent)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent)
    options?.onChange?.(newContent)
  }, [options])

  const togglePreview = useCallback(() => {
    setViewMode(prev => prev === 'preview' ? 'edit' : 'preview')
  }, [])

  const setMode = useCallback((mode: ViewMode) => {
    setViewMode(mode)
  }, [])

  const insertLink = useCallback(async () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart: start, selectionEnd: end, value } = textarea
    const before = value.slice(0, start)
    const selected = value.slice(start, end) || 'link text'
    const after = value.slice(end)

    // Try to get URL from clipboard
    let url = 'https://'
    try {
      const clipboardText = await navigator.clipboard.readText()
      if (clipboardText && (clipboardText.startsWith('http') || clipboardText.startsWith('www'))) {
        url = clipboardText.startsWith('www') ? `https://${clipboardText}` : clipboardText
      }
    } catch {
      // Clipboard access failed, use default
    }

    const linkMarkdown = `[${selected}](${url})`
    const newContent = before + linkMarkdown + after

    updateContent(newContent)

    requestAnimationFrame(() => {
      const urlStart = before.length + linkMarkdown.indexOf(url)
      const urlEnd = urlStart + url.length
      textarea.setSelectionRange(urlStart, urlEnd)
      textarea.focus()
    })
  }, [updateContent])

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.ctrlKey && !e.metaKey) return

    const textarea = e.currentTarget
    const { selectionStart: start, selectionEnd: end, value } = textarea
    const before = value.slice(0, start)
    const selected = value.slice(start, end)
    const after = value.slice(end)

    const surround = (markerLeft: string, markerRight = markerLeft) => {
      e.preventDefault()
      
      const isWrapped = selected.startsWith(markerLeft) && selected.endsWith(markerRight)
      const newContent = isWrapped
        ? before + selected.slice(markerLeft.length, selected.length - markerRight.length) + after
        : before + markerLeft + selected + markerRight + after

      updateContent(newContent)

      requestAnimationFrame(() => {
        const newStart = isWrapped ? start : start + markerLeft.length
        const newEnd = isWrapped ? end - markerLeft.length - markerRight.length : end + markerLeft.length
        textarea.setSelectionRange(newStart, newEnd)
        textarea.focus()
      })
    }

    switch (e.key.toLowerCase()) {
      case 'b':
        surround('**')
        break
      case 'i':
        surround('*')
        break
      case 'k':
        e.preventDefault()
        insertLink()
        break
      case '`':
        if (!e.shiftKey) {
          surround('`')
        }
        break
      case 'p':
        if (e.shiftKey) {
          e.preventDefault()
          togglePreview()
        }
        break
    }
  }, [updateContent, togglePreview, insertLink])

  // Sync initial content when it changes externally
  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  return {
    content,
    setContent: updateContent,
    viewMode,
    isPreview: viewMode === 'preview',
    isSplit: viewMode === 'split',
    togglePreview,
    setMode,
    textareaRef,
    handleKeyDown,
    insertLink
  }
}