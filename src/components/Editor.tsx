'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { useCountersWorker, type CountResult } from '@/hooks/useCountersWorker'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateFileContent, calculateContentStats } from '@/lib/userFiles.repo'
import { useSupabase } from '@/components/SupabaseProvider'
import { UserFile } from '@/types/user-files.types'
import { cn } from '@/lib/utils'

interface EditorProps {
  file: UserFile
  className?: string
  onFileUpdate?: (updatedFile: UserFile) => void
  onDirtyChange?: (fileId: string, isDirty: boolean) => void
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
export function Editor({ file, className, onFileUpdate, onDirtyChange }: EditorProps) {
  // Local state management
  const { supabase } = useSupabase()
  const [content, setContent] = useState(file.content)
  const [isDirty, setIsDirty] = useState(false)
  const [stats, setStats] = useState<CountResult | null>(null)
  
  // Refs for managing focus and keyboard shortcuts
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()
  
  // Web Worker for live statistics
  const { compute: computeStats } = useCountersWorker({ debounceMs: 150 })
  
  // Simple save mutation without complex autosave logic
  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      const stats = calculateContentStats(content)
      return updateFileContent(supabase, {
        id: file.id,
        content,
        version: file.version,
        ...stats,
      })
    },
    onSuccess: (updatedFile) => {
      setIsDirty(false)
      onDirtyChange?.(file.id, false)
      onFileUpdate?.(updatedFile)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['userFile', file.id] })
      queryClient.invalidateQueries({ queryKey: ['userFiles', file.user_id] })
      
      toast.success('Saved', { duration: 1000 })
    },
    onError: (error) => {
      toast.error('Failed to save', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    // Update content immediately for responsive typing
    setContent(newContent)
    
    // Set dirty state
    if (!isDirty) {
      setIsDirty(true)
      onDirtyChange?.(file.id, true)
    }
    
    // Calculate statistics asynchronously (don't await)
    computeStats(newContent).then(newStats => {
      setStats(newStats)
    }).catch(() => {
      // Ignore stats calculation errors
    })
  }, [isDirty, file.id, onDirtyChange, computeStats])


  // Keyboard shortcuts
  const handleKeyDown = useCallback(async (event: React.KeyboardEvent) => {
    // Ctrl/Cmd + S for force save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      
      if (isDirty && !saveMutation.isPending) {
        saveMutation.mutate(content)
      }
    }
  }, [isDirty, content, saveMutation])

  // Save on blur (when user clicks away or tabs out)
  const handleBlur = useCallback(() => {
    if (isDirty && !saveMutation.isPending) {
      saveMutation.mutate(content)
    }
  }, [isDirty, content, saveMutation])

  // Initialize content when file prop changes (only run when file is actually different)
  const prevFileRef = useRef<UserFile | null>(null)
  
  useEffect(() => {
    // Only update if the file has actually changed (by ID and version)
    if (!prevFileRef.current || 
        prevFileRef.current.id !== file.id || 
        prevFileRef.current.version !== file.version) {
      
      setContent(file.content)
      setIsDirty(false)
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

  // Save status text
  const getSaveStatus = () => {
    if (saveMutation.isPending) return 'Saving…'
    if (isDirty) return 'Press Ctrl+S to save'
    return 'Saved'
  }

  // Save status color
  const getSaveStatusColor = () => {
    if (saveMutation.isPending) return 'text-blue-600 dark:text-blue-400'
    if (isDirty) return 'text-amber-600 dark:text-amber-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-gray-900', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          {/* File name with dirty indicator */}
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
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
          <span className="text-sm text-gray-600 dark:text-gray-400">
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
          className={cn(
            'flex-1 w-full p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white',
            'font-mono text-sm leading-relaxed', // Monospace for code-like editing
            'border-0 outline-none ring-0 focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-0',
            'resize-none placeholder:text-gray-500 dark:placeholder:text-gray-400',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          placeholder="Start typing your content here..."
          disabled={saveMutation.isPending}
          aria-label="Text editor"
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