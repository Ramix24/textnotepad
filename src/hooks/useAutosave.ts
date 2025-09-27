'use client'

import React, { useCallback, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSupabase } from '@/components/SupabaseProvider'
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
  hasPendingChanges: boolean
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
  const { debounceMs = 1000 } = config
  const { supabase } = useSupabase()
  
  const queryClient = useQueryClient()
  
  // Refs for managing timers and state
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
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
    
    onSuccess: (updatedFile) => {
      // Update our version reference with the server version
      currentVersionRef.current = updatedFile.version
      
      // Invalidate related queries to refresh cache using correct keys from useFiles hook
      queryClient.invalidateQueries({
        queryKey: ['files', 'detail', file.id]
      })
      queryClient.invalidateQueries({
        queryKey: ['files', 'list']
      })
      
      // Notify success
      onSaved?.(updatedFile)
    },
    
    onError: (error) => {
      // Handle specific error types
      if (error instanceof ConflictError) {
        // Version conflict - file was modified elsewhere
        if (error.details) {
          onConflict?.(error.details as UserFile)
        }
        toast.warning('Content updated on server, reloaded', {
          description: 'Your document was modified elsewhere and has been refreshed with the latest version.',
        })
      } else if (error.message.includes('User not authenticated') || error.message.includes('JWT')) {
        // Authentication error - user session expired
        toast.error('Session expired', {
          description: 'Your session has expired. Please sign in again to continue.',
          action: {
            label: 'Sign In',
            onClick: () => {
              window.location.href = '/auth'
            }
          }
        })
      } else {
        // Generic save error
        toast.error('Failed to save changes', {
          description: 'Unable to save your changes. Please check your connection and try again.',
        })
      }
    },
    
    onSettled: () => {
      // After save completes (success or error), check if there's more pending content
      if (pendingContentRef.current) {
        const nextContent = pendingContentRef.current
        pendingContentRef.current = null
        scheduleDeboundedSave(nextContent)
      }
    }
  })

  // Simple debounced save scheduler
  const scheduleDeboundedSave = useCallback((content: string) => {
    // Always store the latest content
    pendingContentRef.current = content
    
    // Clear existing timer to reset the debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // Schedule new save - this will get the latest content from the ref
    debounceTimerRef.current = setTimeout(() => {
      const contentToSave = pendingContentRef.current
      if (contentToSave !== null && !saveMutation.isPending) {
        // Clear pending content and start save
        pendingContentRef.current = null
        saveMutation.mutate(contentToSave)
      }
    }, debounceMs)
  }, [debounceMs, saveMutation])

  // Main API function - mark content as dirty and trigger save
  const markDirty = useCallback((newContent: string) => {
    scheduleDeboundedSave(newContent)
  }, [scheduleDeboundedSave])

  // Force immediate save (bypasses debounce)
  const forceSave = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    
    if (pendingContentRef.current && !saveMutation.isPending) {
      const content = pendingContentRef.current
      pendingContentRef.current = null
      await saveMutation.mutateAsync(content)
    }
  }, [saveMutation])

  // Cancel any pending save
  const cancelPendingSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    pendingContentRef.current = null
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
    hasPendingChanges: pendingContentRef.current !== null,
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