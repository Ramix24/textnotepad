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
    const textarea = e.currentTarget
    const { selectionStart: start, selectionEnd: end, value } = textarea

    // Handle Tab key for indentation (markdown-friendly 2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault()
      
      if (e.shiftKey) {
        // Shift+Tab: Remove indentation (outdent)
        const beforeCursor = value.slice(0, start)
        const afterCursor = value.slice(end)
        
        if (start === end) {
          // Single cursor - remove up to 2 spaces before cursor
          const lineStart = beforeCursor.lastIndexOf('\n') + 1
          const lineBeforeCursor = beforeCursor.slice(lineStart)
          
          if (lineBeforeCursor.startsWith('  ')) {
            // Remove 2 spaces
            const newContent = beforeCursor.slice(0, lineStart) + lineBeforeCursor.slice(2) + afterCursor
            updateContent(newContent)
            requestAnimationFrame(() => {
              textarea.setSelectionRange(start - 2, start - 2)
              textarea.focus()
            })
          } else if (lineBeforeCursor.startsWith(' ')) {
            // Remove 1 space
            const newContent = beforeCursor.slice(0, lineStart) + lineBeforeCursor.slice(1) + afterCursor
            updateContent(newContent)
            requestAnimationFrame(() => {
              textarea.setSelectionRange(start - 1, start - 1)
              textarea.focus()
            })
          }
        } else {
          // Selection - outdent all selected lines
          const beforeSelection = value.slice(0, start)
          const selectedText = value.slice(start, end)
          const afterSelection = value.slice(end)
          
          const lines = selectedText.split('\n')
          const outdentedLines = lines.map(line => {
            if (line.startsWith('  ')) return line.slice(2)
            if (line.startsWith(' ')) return line.slice(1)
            return line
          })
          
          const newSelectedText = outdentedLines.join('\n')
          const newContent = beforeSelection + newSelectedText + afterSelection
          updateContent(newContent)
          
          requestAnimationFrame(() => {
            textarea.setSelectionRange(start, start + newSelectedText.length)
            textarea.focus()
          })
        }
      } else {
        // Tab: Add indentation (indent)
        if (start === end) {
          // Single cursor - insert 2 spaces
          const newContent = value.slice(0, start) + '  ' + value.slice(start)
          updateContent(newContent)
          requestAnimationFrame(() => {
            textarea.setSelectionRange(start + 2, start + 2)
            textarea.focus()
          })
        } else {
          // Selection - indent all selected lines
          const beforeSelection = value.slice(0, start)
          const selectedText = value.slice(start, end)
          const afterSelection = value.slice(end)
          
          const lines = selectedText.split('\n')
          const indentedLines = lines.map(line => '  ' + line)
          const newSelectedText = indentedLines.join('\n')
          
          const newContent = beforeSelection + newSelectedText + afterSelection
          updateContent(newContent)
          
          requestAnimationFrame(() => {
            textarea.setSelectionRange(start, start + newSelectedText.length)
            textarea.focus()
          })
        }
      }
      return
    }

    // Existing Ctrl/Cmd shortcuts
    if (!e.ctrlKey && !e.metaKey) return

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