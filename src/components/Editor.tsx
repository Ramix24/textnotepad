'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { useCountersWorker, type CountResult } from '@/hooks/useCountersWorker'
import { useAutosave } from '@/hooks/useAutosave'
import { getFileById } from '@/lib/userFiles.repo'
import { supabase } from '@/lib/supabaseClient'
import { UserFile } from '@/types/user-files.types'
import { cn } from '@/lib/utils'

interface EditorProps {
  file: UserFile
  className?: string
  onFileUpdate?: (updatedFile: UserFile) => void
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
export function Editor({ file, className, onFileUpdate }: EditorProps) {
  // Local state management
  const [content, setContent] = useState(file.content)
  const [isDirty, setIsDirty] = useState(false)
  const [stats, setStats] = useState<CountResult | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  
  // Refs for managing focus and keyboard shortcuts
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Web Worker for live statistics
  const { compute: computeStats } = useCountersWorker({ debounceMs: 150 })
  
  // Autosave functionality
  const { isSaving, markDirty, forceSave } = useAutosave({
    file,
    onSaved: (updatedFile) => {
      setIsDirty(false)
      onFileUpdate?.(updatedFile)
      toast.success('File saved', {
        description: `Saved at ${new Date().toLocaleTimeString()}`,
        duration: 2000,
      })
    },
    onConflict: async (_conflictingFile) => {
      try {
        // Fetch latest file from server for conflict resolution
        const latestFile = await getFileById(supabase, file.id)
        
        if (latestFile) {
          // MVP: Last write wins - replace local content with server content
          setContent(latestFile.content)
          setIsDirty(false)
          
          // Update parent component with latest file
          onFileUpdate?.(latestFile)
          
          toast.warning('Content updated from server', {
            description: 'Your changes were overwritten by a newer version. Please review the current content.',
            duration: 5000,
          })
        } else {
          throw new Error('Could not fetch latest file version')
        }
      } catch {
        // Error resolving conflict
        toast.error('Conflict resolution failed', {
          description: 'Unable to fetch latest version. Please refresh the page.',
          duration: 5000,
        })
      }
    },
    config: {
      debounceMs: 1000,  // 1 second after typing stops
      throttleMs: 2000,  // Max 1 save every 2 seconds
    }
  })

  // Handle content changes
  const handleContentChange = useCallback(async (newContent: string) => {
    setContent(newContent)
    setIsDirty(true)
    
    // Trigger autosave
    markDirty(newContent)
    
    // Calculate statistics asynchronously
    try {
      setIsLoadingStats(true)
      const newStats = await computeStats(newContent)
      setStats(newStats)
    } catch {
      // Error calculating stats
    } finally {
      setIsLoadingStats(false)
    }
  }, [markDirty, computeStats])

  // Keyboard shortcuts
  const handleKeyDown = useCallback(async (event: React.KeyboardEvent) => {
    // Ctrl/Cmd + S for force save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      
      if (isDirty) {
        try {
          await forceSave()
          toast.success('File saved manually', { duration: 2000 })
        } catch {
          toast.error('Manual save failed', {
            description: 'Failed to save file',
          })
        }
      }
    }
  }, [isDirty, forceSave])

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

  // Save status text
  const getSaveStatus = () => {
    if (isSaving) return 'Saving…'
    if (isDirty) return 'Unsaved'
    return 'Saved'
  }

  // Save status color
  const getSaveStatusColor = () => {
    if (isSaving) return 'text-blue-600'
    if (isDirty) return 'text-amber-600'
    return 'text-green-600'
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center space-x-2">
          {/* File name with dirty indicator */}
          <h1 className="text-lg font-medium text-foreground">
            {file.name}
          </h1>
          {isDirty && (
            <span 
              className="text-amber-600 text-xl leading-none"
              title="Unsaved changes"
              aria-label="Unsaved changes"
            >
              ●
            </span>
          )}
          
          {/* File metadata */}
          <span className="text-sm text-muted-foreground">
            v{file.version}
          </span>
        </div>
        
        {/* Save status */}
        <div className="flex items-center space-x-3">
          <span className={cn('text-sm font-medium', getSaveStatusColor())}>
            {getSaveStatus()}
          </span>
          
          {/* Optional: Additional controls could go here */}
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex-1 w-full p-4 bg-background text-foreground',
            'font-mono text-sm leading-relaxed', // Monospace for code-like editing
            'border-0 outline-none ring-0 focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'resize-none placeholder:text-muted-foreground',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          placeholder="Start typing your content here..."
          disabled={isSaving}
          aria-label="Text editor"
          aria-describedby="editor-stats"
          spellCheck={true}
          autoComplete="off"
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
          {isLoadingStats ? (
            <span className="animate-pulse">Calculating...</span>
          ) : stats ? (
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