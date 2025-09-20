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
}


// API functions
async function fetchFiles(): Promise<UserFile[]> {
  const response = await fetch('/api/files')
  
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
    queryFn: fetchFiles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for creating a new file
 */
export function useCreateFile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createFile,
    onSuccess: () => {
      // Invalidate and refetch files list
      queryClient.invalidateQueries({ queryKey: filesKeys.lists() })
      
      toast.success('File created successfully')
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
      toast.success('File renamed successfully')
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
      toast.success('File deleted successfully')
    },
  })
}