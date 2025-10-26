'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toast } from 'sonner'
import type { UserFolder, CreateFolderRequest } from '@/types/folders.types'

const FOLDERS_QUERY_KEY = 'folders'

interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

// Fetch user's folders using API route
export function useFoldersList() {
  const { user } = useAuthSession()

  return useQuery({
    queryKey: [FOLDERS_QUERY_KEY, user?.id],
    queryFn: async (): Promise<UserFolder[]> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch('/api/folders')
      const result: ApiResponse<UserFolder[]> = await response.json()
      
      if (!result.ok || !result.data) {
        throw new Error(result.error || 'Failed to fetch folders')
      }
      
      return result.data
    },
    enabled: !!user,
  })
}

// Get folder by ID
export function useFolderById(folderId?: string | null) {
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: [FOLDERS_QUERY_KEY, folderId, user?.id],
    queryFn: async (): Promise<UserFolder | null> => {
      if (!user || !folderId) return null

      // Try to get from cache first
      const folders = queryClient.getQueryData<UserFolder[]>([FOLDERS_QUERY_KEY, user.id])
      const cachedNotebook = folders?.find(f => f.id === folderId)
      if (cachedNotebook) return cachedNotebook

      // Fallback to API if not in cache
      const response = await fetch(`/api/folders/${folderId}`)
      if (response.status === 404) return null
      
      const result: ApiResponse<UserFolder> = await response.json()
      
      if (!result.ok || !result.data) {
        if (result.error === 'Notebook not found') return null
        throw new Error(result.error || 'Failed to fetch folder')
      }
      
      return result.data
    },
    enabled: !!user && !!folderId,
  })
}

// Create folder with optimistic updates
export function useCreateFolder() {
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateFolderRequest): Promise<UserFolder> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      const result: ApiResponse<UserFolder> = await response.json()
      
      if (!result.ok || !result.data) {
        throw new Error(result.error || 'Failed to create folder')
      }
      
      return result.data
    },
    onMutate: async (request) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [FOLDERS_QUERY_KEY, user?.id] })

      // Snapshot the previous value
      const previousNotebooks = queryClient.getQueryData<UserFolder[]>([FOLDERS_QUERY_KEY, user?.id])

      // Optimistically update to the new value
      if (previousNotebooks && user) {
        const optimisticNotebook: UserFolder = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          name: request.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        queryClient.setQueryData<UserFolder[]>(
          [FOLDERS_QUERY_KEY, user.id],
          [...previousNotebooks, optimisticNotebook]
        )
      }

      // Return a context object with the snapshotted value
      return { previousNotebooks }
    },
    onSuccess: (_newNotebook) => {
      // Folder created - no toast needed, user sees result in UI
    },
    onError: (error: any, request, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousNotebooks && user) {
        queryClient.setQueryData([FOLDERS_QUERY_KEY, user.id], context.previousNotebooks)
      }
      
      console.error('Failed to create folder:', error)
      toast.error('Failed to create folder', {
        description: error.message || 'An unexpected error occurred.',
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] })
    },
  })
}

// Rename folder with optimistic updates
export function useRenameFolder() {
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }): Promise<UserFolder> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch(`/api/folders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      
      const result: ApiResponse<UserFolder> = await response.json()
      
      if (!result.ok || !result.data) {
        throw new Error(result.error || 'Failed to rename folder')
      }
      
      return result.data
    },
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [FOLDERS_QUERY_KEY, user?.id] })

      // Snapshot the previous value
      const previousNotebooks = queryClient.getQueryData<UserFolder[]>([FOLDERS_QUERY_KEY, user?.id])

      // Optimistically update to the new value
      if (previousNotebooks && user) {
        queryClient.setQueryData<UserFolder[]>(
          [FOLDERS_QUERY_KEY, user.id],
          previousNotebooks.map(folder => 
            folder.id === id 
              ? { ...folder, name, updated_at: new Date().toISOString() }
              : folder
          )
        )
      }

      // Return a context object with the snapshotted value
      return { previousNotebooks }
    },
    onSuccess: (_updatedNotebook) => {
      // Notification removed to reduce UI noise
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousNotebooks && user) {
        queryClient.setQueryData([FOLDERS_QUERY_KEY, user.id], context.previousNotebooks)
      }
      
      console.error('Failed to rename folder:', error)
      toast.error('Failed to rename folder', {
        description: error.message || 'An unexpected error occurred.',
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] })
    },
  })
}

// Delete folder with optimistic updates
export function useDeleteFolder() {
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (folderId: string): Promise<{ id: string }> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      })
      
      const result: ApiResponse<{ id: string }> = await response.json()
      
      if (!result.ok || !result.data) {
        throw new Error(result.error || 'Failed to delete folder')
      }
      
      return result.data
    },
    onMutate: async (folderId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [FOLDERS_QUERY_KEY, user?.id] })

      // Snapshot the previous value
      const previousNotebooks = queryClient.getQueryData<UserFolder[]>([FOLDERS_QUERY_KEY, user?.id])

      // Optimistically update to the new value
      if (previousNotebooks && user) {
        queryClient.setQueryData<UserFolder[]>(
          [FOLDERS_QUERY_KEY, user.id],
          previousNotebooks.filter(folder => folder.id !== folderId)
        )
      }

      // Return a context object with the snapshotted value
      return { previousNotebooks }
    },
    onSuccess: () => {
      // Invalidate files queries as they might be affected
      queryClient.invalidateQueries({ queryKey: ['files'] })
      
    },
    onError: (error: any, folderId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousNotebooks && user) {
        queryClient.setQueryData([FOLDERS_QUERY_KEY, user.id], context.previousNotebooks)
      }
      
      console.error('Failed to delete folder:', error)
      toast.error('Failed to delete folder', {
        description: error.message || 'An unexpected error occurred.',
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] })
    },
  })
}