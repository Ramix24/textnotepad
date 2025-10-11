'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserFile } from '@/types/user-files.types'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

interface CreateFileRequest {
  name?: string
  folder_id?: string | null
}


// API functions
async function fetchFiles(includeDeleted: boolean = false): Promise<UserFile[]> {
  const url = includeDeleted ? '/api/files?include_deleted=true' : '/api/files'
  const response = await fetch(url)
  
  if (!response.ok) {
    const errorData: ApiResponse = await response.json()
    throw new Error(errorData.error || 'Failed to fetch files')
  }
  
  const data: ApiResponse<UserFile[]> = await response.json()
  return data.data || []
}

async function createFile(params: CreateFileRequest): Promise<UserFile> {
  const response = await fetch('/api/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  
  if (!response.ok) {
    const errorData: ApiResponse = await response.json()
    throw new Error(errorData.error || 'Failed to create file')
  }
  
  const data: ApiResponse<UserFile> = await response.json()
  if (!data.data) {
    throw new Error('No data returned from create file')
  }
  
  return data.data
}

async function renameFile(params: { id: string; name: string }): Promise<UserFile> {
  const response = await fetch(`/api/files/${params.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: params.name }),
  })
  
  if (!response.ok) {
    const errorData: ApiResponse = await response.json()
    throw new Error(errorData.error || 'Failed to rename file')
  }
  
  const data: ApiResponse<UserFile> = await response.json()
  if (!data.data) {
    throw new Error('No data returned from rename file')
  }
  
  return data.data
}

async function fetchFileById(id: string): Promise<UserFile> {
  const response = await fetch(`/api/files/${id}`)
  
  if (!response.ok) {
    const errorData: ApiResponse = await response.json()
    throw new Error(errorData.error || 'Failed to fetch file')
  }
  
  const data: ApiResponse<UserFile> = await response.json()
  if (!data.data) {
    throw new Error('No data returned from fetch file')
  }
  
  return data.data
}

async function deleteFile(id: string): Promise<void> {
  const response = await fetch(`/api/files/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const errorData: ApiResponse = await response.json()
    throw new Error(errorData.error || 'Failed to delete file')
  }
}

// Query key factory
const filesKeys = {
  all: ['files'] as const,
  lists: () => [...filesKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...filesKeys.lists(), filters] as const,
  details: () => [...filesKeys.all, 'detail'] as const,
  detail: (id: string) => [...filesKeys.details(), id] as const,
}

/**
 * Hook for fetching the list of user files
 */
export function useFilesList() {
  return useQuery({
    queryKey: filesKeys.lists(),
    queryFn: () => fetchFiles(true), // Always fetch all files including deleted
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for fetching a single file by ID
 */
export function useFileById(id?: string | null) {
  return useQuery({
    queryKey: filesKeys.detail(id!),
    queryFn: () => fetchFileById(id!),
    enabled: !!id, // Only run query if id is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook for creating a new file
 */
export function useCreateFile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createFile,
    onSuccess: (newFile) => {
      // Invalidate and refetch files list
      queryClient.invalidateQueries({ queryKey: filesKeys.lists() })
      
      // Set the new file in the individual file cache for immediate access
      queryClient.setQueryData(filesKeys.detail(newFile.id), newFile)
      
      // File created - no toast needed, user sees result in UI
    },
    onError: (error: Error) => {
      toast.error('Failed to create file', {
        description: error.message,
      })
    },
  })
}

/**
 * Hook for renaming a file with optimistic updates
 */
export function useRenameFile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: renameFile,
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: filesKeys.lists() })
      
      // Snapshot the previous value
      const previousFiles = queryClient.getQueryData<UserFile[]>(filesKeys.lists())
      
      // Optimistically update to the new value
      if (previousFiles) {
        queryClient.setQueryData<UserFile[]>(filesKeys.lists(), (old) => {
          if (!old) return old
          return old.map((file) =>
            file.id === id
              ? { ...file, name, updated_at: new Date().toISOString() }
              : file
          )
        })
      }
      
      // Return a context object with the snapshotted value
      return { previousFiles }
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFiles) {
        queryClient.setQueryData(filesKeys.lists(), context.previousFiles)
      }
      
      toast.error('Failed to rename file', {
        description: error.message,
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: filesKeys.lists() })
    },
    onSuccess: () => {
      // File renamed - no toast needed, user sees result in UI
    },
  })
}

/**
 * Hook for deleting a file with optimistic updates
 */
export function useDeleteFile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteFile,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: filesKeys.lists() })
      
      // Snapshot the previous value
      const previousFiles = queryClient.getQueryData<UserFile[]>(filesKeys.lists())
      
      // Optimistically update to the new value
      if (previousFiles) {
        queryClient.setQueryData<UserFile[]>(filesKeys.lists(), (old) => {
          if (!old) return old
          return old.filter((file) => file.id !== id)
        })
      }
      
      // Return a context object with the snapshotted value
      return { previousFiles }
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFiles) {
        queryClient.setQueryData(filesKeys.lists(), context.previousFiles)
      }
      
      toast.error('Failed to delete file', {
        description: error.message,
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: filesKeys.lists() })
    },
    onSuccess: () => {
      // File deleted - no toast needed, user sees result in UI
    },
  })
}

/**
 * Hook for restoring a soft-deleted file
 */
export function useRestoreFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fileId: string): Promise<UserFile> => {
      const response = await fetch(`/api/files/${fileId}?action=restore`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to restore file')
      }
      
      const data = await response.json()
      return data.data
    },
    onSuccess: (restoredFile) => {
      // Invalidate and refetch files list
      queryClient.invalidateQueries({ queryKey: ['files', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['files', 'detail', restoredFile.id] })
      
      // File restored - no toast needed, user sees result in UI
    },
    onError: (error: any) => {
      console.error('Failed to restore file:', error)
      toast.error('Failed to restore file', {
        description: error.message || 'An unexpected error occurred while restoring the file.'
      })
    }
  })
}

/**
 * Hook for permanently deleting a file
 */
export function usePermanentDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fileId: string): Promise<{ id: string }> => {
      const response = await fetch(`/api/files/${fileId}?action=permanent-delete`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to permanently delete file')
      }
      
      const data = await response.json()
      return data.data
    },
    onSuccess: (result, fileId) => {
      // Invalidate and refetch files list
      queryClient.invalidateQueries({ queryKey: ['files', 'list'] })
      queryClient.removeQueries({ queryKey: ['files', 'detail', fileId] })
      
      // File permanently deleted - no toast needed, user sees result in UI
    },
    onError: (error: any) => {
      console.error('Failed to permanently delete file:', error)
      toast.error('Failed to permanently delete file', {
        description: error.message || 'An unexpected error occurred while deleting the file.'
      })
    }
  })
}

/**
 * Hook for emptying the entire trash (permanently deleting all trashed files)
 */
export function useEmptyTrash() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trashedFiles: string[]): Promise<{ deletedCount: number }> => {
      // Delete all files in parallel
      const deletePromises = trashedFiles.map(fileId => 
        fetch(`/api/files/${fileId}?action=permanent-delete`, {
          method: 'POST',
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to delete file ${fileId}`)
          }
          return response.json()
        })
      )

      await Promise.all(deletePromises)
      
      return { deletedCount: trashedFiles.length }
    },
    onSuccess: (result) => {
      // Invalidate and refetch files list
      queryClient.invalidateQueries({ queryKey: ['files', 'list'] })
      
      toast.success(`Trash emptied successfully`, {
        description: `${result.deletedCount} files permanently deleted.`
      })
    },
    onError: (error: any) => {
      console.error('Failed to empty trash:', error)
      toast.error('Failed to empty trash', {
        description: error.message || 'An unexpected error occurred while emptying the trash.'
      })
    },
  })
}