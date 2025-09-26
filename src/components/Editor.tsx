'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { useCountersWorker, type CountResult } from '@/hooks/useCountersWorker'
import { useAutosave } from '@/hooks/useAutosave'
import { UserFile } from '@/types/user-files.types'
import { cn } from '@/lib/utils'
import { useAuthSession } from '@/hooks/useAuthSession'

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
  const [content, setContent] = useState(file.content)
  const [stats, setStats] = useState<CountResult | null>(null)
  
  // Refs for managing focus and keyboard shortcuts
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wasFocusedRef = useRef(false)
  
  // Auth session for logout detection
  const { user } = useAuthSession()
  
  // Web Worker for live statistics
  const { compute: computeStats } = useCountersWorker({ debounceMs: 150 })
  
  // Autosave hook
  const { isSaving, markDirty, forceSave } = useAutosave({
    file,
    onSaved: (updatedFile) => {
      onFileUpdate?.(updatedFile)
      // Show brief "just saved" indicator
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 1500)
      
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

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    // Skip changes if in read-only mode
    if (readOnly) return
    
    // Update content immediately for responsive typing
    setContent(newContent)
    
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
  }, [readOnly, markDirty, file.id, onDirtyChange, computeStats])


  // Keyboard shortcuts
  const handleKeyDown = useCallback(async (event: React.KeyboardEvent) => {
    // Ctrl/Cmd + S for force save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      
      if (!isSaving) {
        await forceSave()
      }
    }
  }, [isSaving, forceSave])

  // Force save on blur (when user clicks away or tabs out)
  const handleBlur = useCallback(async () => {
    if (!isSaving) {
      await forceSave()
    }
  }, [isSaving, forceSave])

  // Initialize content when file prop changes (only run when file is actually different)
  const prevFileRef = useRef<UserFile | null>(null)
  
  useEffect(() => {
    // Only update if the file has actually changed (by ID and version)
    if (!prevFileRef.current || 
        prevFileRef.current.id !== file.id || 
        prevFileRef.current.version !== file.version) {
      
      setContent(file.content)
      onDirtyChange?.(file.id, false)
      
      // Update the ref to track the current file
      prevFileRef.current = file
    }
  }, [file, onDirtyChange])

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
  const [isDirty, setIsDirty] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  
  // Update dirty state when content changes (with debounce to avoid flicker)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDirty(content !== file.content)
    }, 100)
    return () => clearTimeout(timer)
  }, [content, file.content])
  
  // Clear dirty state when save completes
  useEffect(() => {
    if (!isSaving && content === file.content) {
      setIsDirty(false)
      onDirtyChange?.(file.id, false)
    } else if (isDirty) {
      onDirtyChange?.(file.id, true)
    }
  }, [isSaving, isDirty, content, file.content, file.id, onDirtyChange])

  // Save status text
  const getSaveStatus = () => {
    if (!user) return '⚠ Not signed in'
    if (isSaving) return 'Saving…'
    if (justSaved) return '✓ Saved'
    if (isDirty) return 'Typing...'
    return 'Saved'
  }

  // Save status color
  const getSaveStatusColor = () => {
    if (!user) return 'text-red-600 dark:text-red-400'
    if (isSaving) return 'text-blue-600 dark:text-blue-400'
    if (justSaved) return 'text-green-600 dark:text-green-400'
    if (isDirty) return 'text-gray-500 dark:text-gray-400'
    return 'text-green-600 dark:text-green-400'
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
      
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-dark bg-bg-secondary">
        <div className="flex items-center space-x-2">
          {/* File name with dirty indicator */}
          <h1 className="text-lg font-medium text-text-primary">
            {file.name}
          </h1>
          {isDirty && (
            <span 
              className="text-amber-600 dark:text-amber-400 text-xl leading-none"
              title="Unsaved changes"
              aria-label="Unsaved changes"
            >
              ●
            </span>
          )}
          
          {/* File metadata */}
          <span className="text-sm text-text-secondary">
            v{file.version}
          </span>
        </div>
        
        {/* Save status */}
        <div className="flex items-center space-x-3">
          <span className={cn('text-sm font-medium', getSaveStatusColor())}>
            {getSaveStatus()}
          </span>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => { wasFocusedRef.current = true }}
          className={cn(
            'flex-1 w-full p-4 bg-bg-primary text-text-primary',
            'font-mono text-sm leading-relaxed', // Monospace for code-like editing
            'border-0 outline-none ring-0 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-0',
            'resize-none placeholder:text-text-secondary',
            !user && 'opacity-50 cursor-not-allowed',
            readOnly && 'opacity-75 cursor-default bg-bg-secondary'
          )}
          placeholder={!user ? "Please sign in to edit your notes..." : readOnly ? "This file is read-only..." : "Start typing your content here..."}
          disabled={!user}
          readOnly={readOnly}
          aria-label={readOnly ? "Text editor (read-only)" : "Text editor"}
          aria-describedby="editor-stats"
          spellCheck={true}
          autoComplete="off"
          data-testid="editor-textarea"
          autoCorrect="off"
          autoCapitalize="sentences"
        />
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