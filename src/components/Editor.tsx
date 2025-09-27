'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
  
  // Refs for managing focus and keyboard shortcuts
  const wasFocusedRef = useRef(false)
  
  // Markdown editor hook with keyboard shortcuts
  const { 
    content, 
    setContent, 
    viewMode, 
    setMode, 
    textareaRef, 
    handleKeyDown: handleMarkdownKeyDown, 
    insertLink 
  } = useMarkdownEditor(file.content, {
    onChange: (newContent: string) => {
      // Skip changes if in read-only mode
      if (readOnly) return
      
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
  const { user } = useAuthSession()
  
  // Web Worker for live statistics
  const { compute: computeStats } = useCountersWorker({ debounceMs: 150 })
  
  // Autosave hook
  const { isSaving, markDirty, forceSave } = useAutosave({
    file,
    onSaved: (updatedFile) => {
      onFileUpdate?.(updatedFile)
      
      // Restore focus if it was focused before save
      if (wasFocusedRef.current && textareaRef.current) {
        textareaRef.current.focus()
      }
    },
    onConflict: (conflictingFile) => {
      // Handle version conflict - refresh content with server version
      setContent(conflictingFile.content)
      toast.warning('File was updated elsewhere', {
        description: 'Your content has been refreshed with the latest version.'
      })
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

  // Force save on blur (when user clicks away or tabs out)
  const handleBlur = useCallback(async () => {
    if (!isSaving) {
      await forceSave()
    }
  }, [isSaving, forceSave])

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

  // Track dirty state for UI indicators
  const isDirty = content !== file.content

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className={cn('flex flex-col h-full bg-bg-primary relative', className)}>
      {/* Logout Warning Overlay */}
      {!user && (
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
      
      {/* Editor Header */}
      <EditorHeader
        name={file.name}
        version={file.version}
        savedAt={formatTime(file.updated_at)}
        saving={isSaving}
        isDirty={isDirty}
        onNameChange={handleNameChange}
      />
      
      {/* Markdown Toolbar */}
      {!readOnly && (
        <MarkdownToolbar
          textareaRef={textareaRef}
          setContent={setContent}
          insertLink={insertLink}
          disabled={!user}
        />
      )}
      
      {/* View Mode Toggle */}
      <div className="h-10 bg-bg-secondary border-b border-border-dark flex items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('edit')}
            disabled={readOnly}
            className="text-xs h-7"
          >
            Edit
          </Button>
          <Button
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('preview')}
            disabled={readOnly}
            className="text-xs h-7"
          >
            Preview
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('split')}
            disabled={readOnly}
            className="text-xs h-7"
          >
            Split
          </Button>
        </div>
        
        <div className="text-xs text-text-secondary">
          Shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link), Ctrl+Shift+P (preview)
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'split' ? (
          <div className="flex h-full">
            {/* Editor pane */}
            <div className="flex-1 border-r border-border-dark">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={() => { wasFocusedRef.current = true }}
                className={cn(
                  'w-full h-full p-4 bg-bg-primary text-text-primary',
                  'font-mono text-sm leading-relaxed',
                  'border-0 outline-none ring-0 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-0',
                  'resize-none placeholder:text-text-secondary',
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
              />
            </div>
            {/* Preview pane */}
            <div className="flex-1">
              <MarkdownPreview content={content} className="h-full overflow-auto" />
            </div>
          </div>
        ) : viewMode === 'preview' ? (
          <MarkdownPreview content={content} className="h-full overflow-auto" />
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => { wasFocusedRef.current = true }}
            className={cn(
              'w-full h-full p-4 bg-bg-primary text-text-primary',
              'font-mono text-sm leading-relaxed',
              'border-0 outline-none ring-0 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-0',
              'resize-none placeholder:text-text-secondary',
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
          />
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-sm text-muted-foreground">
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