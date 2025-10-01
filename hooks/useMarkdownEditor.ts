'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

interface UseMarkdownEditorOptions {
  onChange?: (value: string) => void
}

export type ViewMode = 'edit' | 'preview'

export function useMarkdownEditor(initialContent = '', options?: UseMarkdownEditorOptions) {
  const [content, setContent] = useState(initialContent)
  const [viewMode, setViewMode] = useState<ViewMode>('edit')
  const [showLineNumbers, setShowLineNumbers] = useState(false)
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

  const toggleLineNumbers = useCallback(() => {
    setShowLineNumbers(prev => !prev)
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

    // Handle Enter key for list continuation and inline shortcuts
    if (e.key === 'Enter') {
      const beforeCursor = value.slice(0, start)
      const afterCursor = value.slice(start)
      
      // Find the current line
      const lineStart = beforeCursor.lastIndexOf('\n') + 1
      const currentLine = beforeCursor.slice(lineStart)
      
      // ============= INLINE MARKDOWN SHORTCUTS =============
      
      // Heading shortcuts: ## text -> creates heading
      const headingMatch = currentLine.match(/^(#{1,6})\s+(.*)$/)
      if (headingMatch && headingMatch[2].trim()) {
        e.preventDefault()
        const [, hashes] = headingMatch
        const newContent = beforeCursor + '\n\n' + hashes + ' ' + afterCursor
        updateContent(newContent)
        requestAnimationFrame(() => {
          const newPos = start + 2 + hashes.length + 1
          textarea.setSelectionRange(newPos, newPos)
          textarea.focus()
        })
        return
      }
      
      // Quote shortcuts: > text -> creates quote block
      const quoteMatch = currentLine.match(/^>\s+(.+)$/)
      if (quoteMatch && quoteMatch[1].trim()) {
        e.preventDefault()
        const newContent = beforeCursor + '\n> ' + afterCursor
        updateContent(newContent)
        requestAnimationFrame(() => {
          const newPos = start + 3
          textarea.setSelectionRange(newPos, newPos)
          textarea.focus()
        })
        return
      }
      
      // Bullet list shortcuts: - text -> creates bullet list
      const bulletShortcutMatch = currentLine.match(/^-\s+(.+)$/)
      if (bulletShortcutMatch && bulletShortcutMatch[1].trim()) {
        e.preventDefault()
        const newContent = beforeCursor + '\n- ' + afterCursor
        updateContent(newContent)
        requestAnimationFrame(() => {
          const newPos = start + 3
          textarea.setSelectionRange(newPos, newPos)
          textarea.focus()
        })
        return
      }
      
      // Numbered list shortcuts: 1. text -> creates numbered list
      const numberedShortcutMatch = currentLine.match(/^(\d+)\.\s+(.+)$/)
      if (numberedShortcutMatch && numberedShortcutMatch[2].trim()) {
        e.preventDefault()
        const currentNum = parseInt(numberedShortcutMatch[1])
        const nextNum = currentNum + 1
        const newContent = beforeCursor + '\n' + nextNum + '. ' + afterCursor
        updateContent(newContent)
        requestAnimationFrame(() => {
          const newPos = start + 1 + nextNum.toString().length + 2
          textarea.setSelectionRange(newPos, newPos)
          textarea.focus()
        })
        return
      }
      
      // Task list shortcuts: [] text -> creates task list
      const taskShortcutMatch = currentLine.match(/^\[\]\s+(.+)$/)
      if (taskShortcutMatch && taskShortcutMatch[1].trim()) {
        e.preventDefault()
        const newContent = beforeCursor + '\n- [ ] ' + afterCursor
        updateContent(newContent)
        requestAnimationFrame(() => {
          const newPos = start + 7
          textarea.setSelectionRange(newPos, newPos)
          textarea.focus()
        })
        return
      }
      
      // ============= EXISTING LIST CONTINUATION =============
      
      // Check for various list patterns
      const bulletListMatch = currentLine.match(/^(\s*)([-*+])\s/)
      const numberedListMatch = currentLine.match(/^(\s*)(\d+)\.\s/)
      const taskListMatch = currentLine.match(/^(\s*)([-*+])\s\[([ x])\]\s/)
      
      if (bulletListMatch || numberedListMatch || taskListMatch) {
        e.preventDefault()
        
        let newLine = '\n'
        
        if (taskListMatch) {
          // Task list continuation
          const [, indent, marker, ] = taskListMatch
          newLine += `${indent}${marker} [ ] `
        } else if (bulletListMatch) {
          // Bullet list continuation
          const [, indent, marker] = bulletListMatch
          newLine += `${indent}${marker} `
        } else if (numberedListMatch) {
          // Numbered list continuation
          const [, indent, number] = numberedListMatch
          const nextNumber = parseInt(number) + 1
          newLine += `${indent}${nextNumber}. `
        }
        
        // Check if current line is empty (just has the list marker)
        const contentAfterMarker = currentLine.replace(/^(\s*)([-*+]|\d+\.)\s(\[([ x])\]\s)?/, '')
        
        if (contentAfterMarker.trim() === '') {
          // Empty list item - remove the current line marker and don't continue list
          const newContent = beforeCursor.slice(0, lineStart) + afterCursor
          updateContent(newContent)
          requestAnimationFrame(() => {
            textarea.setSelectionRange(lineStart, lineStart)
            textarea.focus()
          })
        } else {
          // Continue the list
          const newContent = beforeCursor + newLine + afterCursor
          updateContent(newContent)
          requestAnimationFrame(() => {
            textarea.setSelectionRange(start + newLine.length, start + newLine.length)
            textarea.focus()
          })
        }
        return
      }
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
    togglePreview,
    setMode,
    showLineNumbers,
    toggleLineNumbers,
    textareaRef,
    handleKeyDown,
    insertLink
  }
}