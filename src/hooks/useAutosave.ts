'use client'

import React, { useCallback, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabaseClient'
import { updateFileContent, calculateContentStats, ConflictError } from '@/lib/userFiles.repo'
import { UserFile } from '@/types/user-files.types'

export interface AutosaveConfig {
  debounceMs?: number    // Delay after last change (default: 1000ms)
  throttleMs?: number    // Max frequency of saves (default: 2000ms)
}

export interface UseAutosaveOptions {
  file: UserFile
  onSaved?: (updatedFile: UserFile) => void
  onConflict?: (conflictingFile: UserFile) => void
  config?: AutosaveConfig
}

export interface UseAutosaveReturn {
  isSaving: boolean
  isDirty: boolean
  markDirty: (newContent: string) => void
  forceSave: () => Promise<void>
  cancelPendingSave: () => void
}

/**
 * Hook for automatic saving of file content with smart debouncing and throttling
 * 
 * Features:
 * - Debounce: Waits for typing to stop before saving (default: 1000ms)
 * - Throttle: Limits save frequency during continuous typing (default: 2000ms)
 * - Optimistic updates: Immediately updates version locally
 * - Conflict resolution: Handles version conflicts gracefully
 * - TanStack Query integration: Automatic cache invalidation
 * 
 * Usage Example:
 * ```tsx
 * function Editor({ file }: { file: UserFile }) {
 *   const [content, setContent] = useState(file.content)
 *   
 *   const { isSaving, isDirty, markDirty } = useAutosave({
 *     file,
 *     onSaved: (updatedFile) => {
 *       console.log('File saved successfully', updatedFile)
 *     },
 *     onConflict: (conflictingFile) => {
 *       // Handle version conflict - typically refresh file data
 *       setContent(conflictingFile.content)
 *       toast.error('File was modified elsewhere. Content refreshed.')
 *     }
 *   })
 * 
 *   const handleChange = useCallback((newContent: string) => {
 *     setContent(newContent)
 *     markDirty(newContent) // Triggers autosave pipeline
 *   }, [markDirty])
 * 
 *   return (
 *     <div>
 *       <textarea value={content} onChange={(e) => handleChange(e.target.value)} />
 *       {isSaving && <span>Saving...</span>}
 *       {isDirty && !isSaving && <span>Unsaved changes</span>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAutosave({
  file,
  onSaved,
  onConflict,
  config = {}
}: UseAutosaveOptions): UseAutosaveReturn {
  const { debounceMs = 1000, throttleMs = 2000 } = config
  
  const queryClient = useQueryClient()
  const [isDirty, setIsDirty] = useState(false)
  
  // Refs for managing timers and state
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveTimeRef = useRef<number>(0)
  const pendingContentRef = useRef<string | null>(null)
  const currentVersionRef = useRef(file.version)

  // Update version ref when file changes
  React.useEffect(() => {
    currentVersionRef.current = file.version
  }, [file.version])

  // TanStack Query mutation for saving
  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      const stats = calculateContentStats(content)
      
      return updateFileContent(supabase, {
        id: file.id,
        content,
        version: currentVersionRef.current,
        ...stats,
      })
    },
    
    onMutate: async (content: string) => {
      // Optimistic update: immediately bump version locally
      currentVersionRef.current += 1
      setIsDirty(false)
      
      // Return rollback data in case of error
      return {
        previousVersion: currentVersionRef.current - 1,
        content,
      }
    },
    
    onSuccess: (updatedFile) => {
      // Update our version reference with the server version
      currentVersionRef.current = updatedFile.version
      
      // Invalidate related queries to refresh cache
      queryClient.invalidateQueries({
        queryKey: ['userFile', file.id]
      })
      queryClient.invalidateQueries({
        queryKey: ['userFiles', file.user_id]
      })
      
      // Notify success
      onSaved?.(updatedFile)
    },
    
    onError: (error, content, context) => {
      // Rollback optimistic update
      if (context) {
        currentVersionRef.current = context.previousVersion
        setIsDirty(true) // Mark as dirty again since save failed
      }
      
      // Handle specific error types
      if (error instanceof ConflictError) {
        // Version conflict - file was modified elsewhere
        if (error.details) {
          onConflict?.(error.details as UserFile)
        }
        toast.error('File conflict detected', {
          description: 'The file was modified elsewhere. Please refresh to see latest changes.',
        })
      } else {
        // Generic save error
        toast.error('Failed to save file', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
        })
      }
    },
    
    onSettled: () => {
      // If there's pending content, try to save it
      if (pendingContentRef.current) {
        const nextContent = pendingContentRef.current
        pendingContentRef.current = null
        scheduleDeboundedSave(nextContent)
      }
    }
  })

  // Internal save function with throttling
  const performSave = useCallback(async (content: string) => {
    const now = Date.now()
    const timeSinceLastSave = now - lastSaveTimeRef.current
    
    // Check if we need to throttle
    if (timeSinceLastSave < throttleMs && !saveMutation.isIdle) {
      // Store content for later save
      pendingContentRef.current = content
      return
    }
    
    // Update last save time
    lastSaveTimeRef.current = now
    
    // Clear any pending content
    pendingContentRef.current = null
    
    // Perform the save
    await saveMutation.mutateAsync(content)
  }, [throttleMs, saveMutation])

  // Debounced save scheduler
  const scheduleDeboundedSave = useCallback((content: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Schedule new save
    debounceTimerRef.current = setTimeout(() => {
      performSave(content)
    }, debounceMs)
  }, [debounceMs, performSave])

  // Main API function - mark content as dirty and trigger save
  const markDirty = useCallback((newContent: string) => {
    setIsDirty(true)
    scheduleDeboundedSave(newContent)
  }, [scheduleDeboundedSave])

  // Force immediate save (bypasses debounce/throttle)
  const forceSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    
    if (pendingContentRef.current) {
      const content = pendingContentRef.current
      pendingContentRef.current = null
      await performSave(content)
    }
  }, [performSave])

  // Cancel any pending save
  const cancelPendingSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    pendingContentRef.current = null
    setIsDirty(false)
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    isSaving: saveMutation.isPending,
    isDirty,
    markDirty,
    forceSave,
    cancelPendingSave,
  }
}

// Default export for convenience
export default useAutosave

/**
 * Integration Notes:
 * 
 * 1. **Query Client Setup**: Ensure your app has TanStack Query configured:
 *    ```tsx
 *    import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
 *    
 *    const queryClient = new QueryClient()
 *    
 *    function App() {
 *      return (
 *        <QueryClientProvider client={queryClient}>
 *          <YourApp />
 *        </QueryClientProvider>
 *      )
 *    }
 *    ```
 * 
 * 2. **Error Handling**: The hook handles two main error scenarios:
 *    - ConflictError: Version mismatch (file modified elsewhere)
 *    - Generic errors: Network issues, validation errors, etc.
 * 
 * 3. **Performance**: The hook is optimized for:
 *    - Reducing server requests during rapid typing
 *    - Providing immediate UI feedback via optimistic updates
 *    - Graceful degradation when conflicts occur
 * 
 * 4. **Cache Integration**: Automatically invalidates TanStack Query caches:
 *    - Individual file: ['userFile', fileId]
 *    - User's file list: ['userFiles', userId]
 * 
 * 5. **Advanced Usage**: You can customize timing:
 *    ```tsx
 *    const autosave = useAutosave({
 *      file,
 *      config: {
 *        debounceMs: 500,  // Save 500ms after typing stops
 *        throttleMs: 1000  // Max 1 save per second
 *      }
 *    })
 *    ```
 */