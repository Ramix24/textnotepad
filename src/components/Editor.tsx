'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { useCountersWorker, type CountResult } from '@/hooks/useCountersWorker'
import { useAutosave } from '@/hooks/useAutosave'
import { UserFile } from '@/types/user-files.types'
import { cn } from '@/lib/utils'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useMarkdownEditor } from '../../hooks/useMarkdownEditor'
import { EditorHeader } from '../../components/editor/EditorHeader'
import { MarkdownToolbar } from '../../components/editor/MarkdownToolbar'
import { MarkdownPreview } from '../../components/editor/MarkdownPreview'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

interface EditorProps {
  file: UserFile
  className?: string
  onFileUpdate?: (updatedFile: UserFile) => void
  onDirtyChange?: (fileId: string, isDirty: boolean) => void
  readOnly?: boolean
}

/**
 * Rich text editor component with live statistics and autosave
 * 
 * Features:
 * - Real-time word/character/line counting via Web Worker
 * - Smart autosave with conflict resolution
 * - Keyboard shortcuts (Ctrl/Cmd+S for force save)
 * - Visual indicators for unsaved changes and save status
 * - Accessible design with proper ARIA labels
 * - Monospace font for code editing or clean sans-serif for prose
 */
export function Editor({ file, className, onFileUpdate, onDirtyChange, readOnly = false }: EditorProps) {
  // Local state management
  const [stats, setStats] = useState<CountResult | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  
  // Refs for managing focus and keyboard shortcuts
  const wasFocusedRef = useRef(false)
  const isActivelyTypingRef = useRef(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Protected file content that prevents updates during active editing
  const [protectedFileContent, setProtectedFileContent] = useState(file.content)
  
  // Only update protected content when textarea is not focused
  useEffect(() => {
    if (document.activeElement !== textareaRef.current) {
      setProtectedFileContent(file.content)
    }
  }, [file.content]) // textareaRef is a ref and doesn't need to be in deps
  
  // Markdown editor hook with keyboard shortcuts
  const { 
    content, 
    setContent, 
    viewMode, 
    setMode, 
    showLineNumbers,
    toggleLineNumbers,
    textareaRef, 
    handleKeyDown: handleMarkdownKeyDown, 
    insertLink,
    clearFormatting
  } = useMarkdownEditor(protectedFileContent, {
    onChange: (newContent: string) => {
      // Skip changes if in read-only mode
      if (readOnly) return
      
      // Mark user as actively typing
      isActivelyTypingRef.current = true
      
      // Clear existing typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set timeout to mark typing as stopped after 3 seconds (longer than autosave debounce)
      typingTimeoutRef.current = setTimeout(() => {
        isActivelyTypingRef.current = false
      }, 3000)
      
      // Trigger autosave
      markDirty(newContent)
      
      // Set dirty state for UI indicators
      onDirtyChange?.(file.id, true)
      
      // Calculate statistics asynchronously (don't await)
      computeStats(newContent).then(newStats => {
        setStats(newStats)
      }).catch(() => {
        // Ignore stats calculation errors
      })
    }
  })
  
  // Auth session for logout detection
  const { user, loading: authLoading } = useAuthSession()
  
  // Web Worker for live statistics
  const { compute: computeStats } = useCountersWorker({ debounceMs: 150 })
  
  // Autosave hook
  const { isSaving, hasPendingChanges, markDirty, forceSave } = useAutosave({
    file,
    onSaved: (updatedFile) => {
      // ALWAYS store cursor position before any updates
      const cursorPos = textareaRef.current?.selectionStart || 0
      const cursorEnd = textareaRef.current?.selectionEnd || 0
      const wasTextareaFocused = document.activeElement === textareaRef.current
      
      // NEVER update content when textarea is focused - this is the most aggressive approach
      // Only update metadata to prevent ANY possibility of cursor jumping
      if (wasTextareaFocused) {
        // Textarea is focused - NEVER update content, only metadata
        onFileUpdate?.({
          ...updatedFile,
          content: content // Force preserve current editor content
        })
        
        // Double-restore cursor position with multiple animation frames
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (textareaRef.current && document.activeElement === textareaRef.current) {
              textareaRef.current.setSelectionRange(cursorPos, cursorEnd)
            }
          })
        })
      } else {
        // Textarea not focused - safe to update everything
        onFileUpdate?.(updatedFile)
      }
    },
    onConflict: (conflictingFile) => {
      // Only update content if user is not actively typing
      if (!isActivelyTypingRef.current) {
        // Store cursor position before content change
        const cursorPos = textareaRef.current?.selectionStart || 0
        const cursorEnd = textareaRef.current?.selectionEnd || 0
        
        setContent(conflictingFile.content)
        toast.warning('File was updated elsewhere', {
          description: 'Your content has been refreshed with the latest version.'
        })
        
        // Restore cursor position after content update
        requestAnimationFrame(() => {
          if (textareaRef.current && document.activeElement === textareaRef.current) {
            textareaRef.current.setSelectionRange(cursorPos, cursorEnd)
          }
        })
      } else {
        // Defer the conflict resolution until user stops typing
        toast.warning('File conflict detected', {
          description: 'The file was modified elsewhere. Changes will sync when you finish typing.',
          duration: 5000
        })
      }
    },
    config: {
      debounceMs: 1000 // Save 1 second after typing stops
    }
  })

  // Handle file name changes
  const handleNameChange = useCallback((newName: string) => {
    if (readOnly) return
    onFileUpdate?.({ ...file, name: newName })
  }, [readOnly, file, onFileUpdate])

  // Handle print functionality
  const handlePrint = useCallback(() => {
    // Configure marked for consistent output
    marked.setOptions({
      breaks: true,
      gfm: true,
    })

    // Convert markdown to HTML
    const rawHtml = marked.parse(content)
    const sanitizedHtml = DOMPurify.sanitize(rawHtml as string, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'class', 'id', 'target', 'rel', 'open'],
      ADD_TAGS: ['details', 'summary'],
    })

    // Create print window with formatted content
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Unable to open print dialog', {
        description: 'Please check your browser settings and try again.'
      })
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${file.name} - TextNotepad.com</title>
          <style>
            /* Reset and base styles */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 0.5in;
              background: white;
            }
            
            /* Header */
            .print-header {
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .print-title {
              font-size: 1.5rem;
              font-weight: 600;
              color: #111827;
              margin-bottom: 0.5rem;
            }
            
            .print-meta {
              font-size: 0.875rem;
              color: #6b7280;
            }
            
            /* Content styles */
            .print-content h1,
            .print-content h2,
            .print-content h3,
            .print-content h4,
            .print-content h5,
            .print-content h6 {
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
              font-weight: 600;
              color: #111827;
            }
            
            .print-content h1 { font-size: 1.875rem; }
            .print-content h2 { font-size: 1.5rem; }
            .print-content h3 { font-size: 1.25rem; }
            .print-content h4 { font-size: 1.125rem; }
            .print-content h5 { font-size: 1rem; }
            .print-content h6 { font-size: 0.875rem; }
            
            .print-content p {
              margin-bottom: 1rem;
            }
            
            .print-content ul,
            .print-content ol {
              margin-bottom: 1rem;
              padding-left: 1.5rem;
            }
            
            .print-content li {
              margin-bottom: 0.25rem;
            }
            
            .print-content blockquote {
              margin: 1rem 0;
              padding-left: 1rem;
              border-left: 4px solid #d1d5db;
              color: #6b7280;
              font-style: italic;
            }
            
            .print-content code {
              background-color: #f3f4f6;
              padding: 0.125rem 0.25rem;
              border-radius: 0.25rem;
              font-family: 'Courier New', monospace;
              font-size: 0.875rem;
            }
            
            .print-content pre {
              background-color: #f3f4f6;
              padding: 1rem;
              border-radius: 0.5rem;
              margin: 1rem 0;
              overflow-x: auto;
            }
            
            .print-content pre code {
              background: none;
              padding: 0;
            }
            
            .print-content table {
              width: 100%;
              border-collapse: collapse;
              margin: 1rem 0;
            }
            
            .print-content th,
            .print-content td {
              border: 1px solid #d1d5db;
              padding: 0.5rem;
              text-align: left;
            }
            
            .print-content th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            
            .print-content a {
              color: #2563eb;
              text-decoration: underline;
            }
            
            .print-content hr {
              margin: 2rem 0;
              border: none;
              border-top: 1px solid #d1d5db;
            }
            
            /* Print-specific styles */
            @media print {
              body {
                margin: 0;
                padding: 0.5in;
              }
              
              .print-header {
                margin-bottom: 1rem;
              }
              
              /* Avoid page breaks inside elements */
              h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
              }
              
              p, li {
                page-break-inside: avoid;
              }
              
              /* Force page breaks before major sections */
              h1 {
                page-break-before: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1 class="print-title">${file.name}</h1>
            <div class="print-meta">
              Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              <br>
              From TextNotepad.com
            </div>
          </div>
          <div class="print-content">
            ${sanitizedHtml}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }, [content, file.name])


  // Combined keyboard shortcuts
  const handleKeyDown = useCallback(async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle markdown shortcuts first
    handleMarkdownKeyDown(event)
    
    // Ctrl/Cmd + S for force save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      
      if (!isSaving) {
        await forceSave()
      }
    }
  }, [isSaving, forceSave, handleMarkdownKeyDown])

  // Simplified - no need to manually track cursor position
  const handleSelectionChange = useCallback(() => {
    // Cursor position tracking removed to prevent jumping issues
    // The textarea will naturally maintain cursor position without manual intervention
  }, [])

  // Save on blur only if there are pending changes and user has stopped typing
  const handleBlur = useCallback(async () => {
    // Only save if there are actually pending changes and user isn't actively typing
    if (hasPendingChanges && !isActivelyTypingRef.current && !isSaving) {
      // Add a small delay to prevent save storms from rapid focus changes
      setTimeout(async () => {
        if (hasPendingChanges && !isActivelyTypingRef.current) {
          await forceSave()
        }
      }, 500)
    }
  }, [hasPendingChanges, isSaving, forceSave])

  // Update dirty state based on content changes
  useEffect(() => {
    onDirtyChange?.(file.id, content !== file.content)
  }, [content, file.content, file.id, onDirtyChange])

  // Initialize stats on mount
  useEffect(() => {
    const initializeStats = async () => {
      try {
        const initialStats = await computeStats(content)
        setStats(initialStats)
      } catch {
        // Error initializing stats
      }
    }
    
    initializeStats()
  }, [content, computeStats])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Track dirty state for UI indicators
  const isDirty = content !== file.content || hasPendingChanges

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className={cn('flex flex-col h-full bg-bg-secondary relative', className)}>
      {/* Logout Warning Overlay */}
      {!user && !authLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-4 text-center">
            <div className="text-red-600 dark:text-red-400 text-4xl mb-4">⚠</div>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Session Expired
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have been signed out. Your changes may not be saved.
            </p>
            <button
              onClick={() => window.location.href = '/auth'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Sign In Again
            </button>
          </div>
        </div>
      )}
      
      {/* Remove the distracting progress bar */}
      
      {/* Top Bar - File info and save status */}
      <EditorHeader
        name={file.name}
        savedAt={formatTime(file.updated_at)}
        saving={isSaving}
        isDirty={isDirty}
        onNameChange={handleNameChange}
        viewMode={viewMode}
        onViewModeChange={setMode}
        readOnly={readOnly}
        showLineNumbers={showLineNumbers}
        onToggleLineNumbers={toggleLineNumbers}
        onPrint={handlePrint}
      />

      {/* Main editor area */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'preview' ? (
          <MarkdownPreview content={content} className="h-full overflow-auto" />
        ) : showLineNumbers ? (
          <div className="relative h-full flex">
            <div className="w-12 bg-bg-secondary border-r border-border-dark flex-shrink-0 overflow-hidden">
              <div 
                className="text-xs text-text-secondary font-mono pt-4 pb-4"
                style={{
                  transform: `translateY(-${scrollTop}px)`
                }}
              >
                {content.split('\n').map((_, index) => (
                  <div key={index + 1} className="px-2 text-right text-sm leading-relaxed h-[1.375rem] flex items-center justify-end shrink-0">
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={() => { wasFocusedRef.current = true }}
              onSelect={handleSelectionChange}
              onClick={handleSelectionChange}
              onScroll={(e) => {
                setScrollTop(e.currentTarget.scrollTop)
              }}
              className={cn(
                'flex-1 h-full px-4 py-4 bg-bg-secondary text-text-primary',
                'text-sm leading-relaxed',
                'border-0 outline-none ring-0 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-0',
                'resize-none placeholder:text-text-secondary',
                'whitespace-pre-wrap break-words', // Enable text wrapping
                !user && 'opacity-50 cursor-not-allowed',
                readOnly && 'opacity-75 cursor-default bg-bg-secondary'
              )}
              placeholder={!user ? "Please sign in to edit your notes..." : readOnly ? "This file is read-only..." : "Start writing in Markdown..."}
              disabled={!user}
              readOnly={readOnly}
              aria-label={readOnly ? "Markdown editor (read-only)" : "Markdown editor"}
              spellCheck={true}
              autoComplete="off"
              data-testid="editor-textarea"
              wrap="soft"
            />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => { wasFocusedRef.current = true }}
            onSelect={handleSelectionChange}
            onClick={handleSelectionChange}
            className={cn(
              'w-full h-full p-4 bg-bg-secondary text-text-primary',
              'font-mono text-sm leading-relaxed',
              'border-0 outline-none ring-0 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-0',
              'resize-none placeholder:text-text-secondary',
              'whitespace-pre-wrap break-words', // Enable text wrapping
              !user && 'opacity-50 cursor-not-allowed',
              readOnly && 'opacity-75 cursor-default bg-bg-secondary'
            )}
            placeholder={!user ? "Please sign in to edit your notes..." : readOnly ? "This file is read-only..." : "Start writing in Markdown..."}
            disabled={!user}
            readOnly={readOnly}
            aria-label={readOnly ? "Markdown editor (read-only)" : "Markdown editor"}
            spellCheck={true}
            autoComplete="off"
            data-testid="editor-textarea"
            wrap="soft"
          />
        )}
      </div>

      {/* Bottom Bar - Markdown toolbar + view toggles + shortcuts */}
      {!readOnly && (
        <div className="border-t border-border-dark bg-bg-secondary">
          {/* Markdown Toolbar */}
          <MarkdownToolbar
            textareaRef={textareaRef}
            setContent={setContent}
            insertLink={insertLink}
            clearFormatting={clearFormatting}
            disabled={!user}
          />
          
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30 text-sm text-muted-foreground">
        <div 
          id="editor-stats"
          className="flex items-center space-x-4"
          aria-live="polite"
          aria-atomic="true"
        >
          {stats ? (
            <>
              <span>Words: {stats.word_count.toLocaleString()}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Characters: {stats.char_count.toLocaleString()}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Lines: {stats.line_count.toLocaleString()}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Size: {(stats.size_bytes / 1024).toFixed(1)} KB</span>
            </>
          ) : (
            <span>No statistics available</span>
          )}
        </div>
        
        {/* Additional status info */}
        <div className="flex items-center space-x-2">
          <span>UTF-8</span>
          <Separator orientation="vertical" className="h-4" />
          <span>
            {file.is_new ? 'New file' : `Modified ${new Date(file.updated_at).toLocaleDateString()}`}
          </span>
        </div>
      </div>
    </div>
  )
}

// Export for use in other components
export default Editor

/**
 * Usage Example:
 * 
 * ```tsx
 * function DocumentView({ file }: { file: UserFile }) {
 *   const [currentFile, setCurrentFile] = useState(file)
 * 
 *   return (
 *     <div className="h-screen">
 *       <Editor 
 *         file={currentFile}
 *         onFileUpdate={setCurrentFile}
 *         className="h-full"
 *       />
 *     </div>
 *   )
 * }
 * ```
 * 
 * Keyboard Shortcuts:
 * - Ctrl/Cmd + S: Force save (bypasses debounce)
 * 
 * Accessibility Features:
 * - Proper ARIA labels and descriptions
 * - Live regions for statistics updates
 * - Focus management and keyboard navigation
 * - High contrast indicators for save state
 * 
 * Performance Features:
 * - Web Worker for statistics (non-blocking)
 * - Debounced autosave (1 second delay)
 * - Throttled saves (max 1 per 2 seconds)
 * - Optimistic UI updates
 */