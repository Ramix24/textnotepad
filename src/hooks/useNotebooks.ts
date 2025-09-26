'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toast } from 'sonner'
import type { UserNotebook, CreateNotebookRequest } from '@/types/notebooks.types'

const NOTEBOOKS_QUERY_KEY = 'notebooks'

interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

// Fetch user's notebooks using API route
export function useNotebooksList() {
  const { user } = useAuthSession()

  return useQuery({
    queryKey: [NOTEBOOKS_QUERY_KEY, user?.id],
    queryFn: async (): Promise<UserNotebook[]> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch('/api/folders')
      const result: ApiResponse<UserNotebook[]> = await response.json()
      
      if (!result.ok || !result.data) {
        throw new Error(result.error || 'Failed to fetch notebooks')
      }
      
      return result.data
    },
    enabled: !!user,
  })
}

// Get notebook by ID
export function useNotebookById(notebookId?: string | null) {
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: [NOTEBOOKS_QUERY_KEY, notebookId, user?.id],
    queryFn: async (): Promise<UserNotebook | null> => {
      if (!user || !notebookId) return null

      // Try to get from cache first
      const notebooks = queryClient.getQueryData<UserNotebook[]>([NOTEBOOKS_QUERY_KEY, user.id])
      const cachedNotebook = notebooks?.find(f => f.id === notebookId)
      if (cachedNotebook) return cachedNotebook

      // Fallback to API if not in cache
      const response = await fetch(`/api/folders/${notebookId}`)
      if (response.status === 404) return null
      
      const result: ApiResponse<UserNotebook> = await response.json()
      
      if (!result.ok || !result.data) {
        if (result.error === 'Notebook not found') return null
        throw new Error(result.error || 'Failed to fetch notebook')
      }
      
      return result.data
    },
    enabled: !!user && !!notebookId,
  })
}

// Create notebook with optimistic updates
export function useCreateNotebook() {
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateNotebookRequest): Promise<UserNotebook> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      const result: ApiResponse<UserNotebook> = await response.json()
      
      if (!result.ok || !result.data) {
        throw new Error(result.error || 'Failed to create notebook')
      }
      
      return result.data
    },
    onMutate: async (request) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [NOTEBOOKS_QUERY_KEY, user?.id] })

      // Snapshot the previous value
      const previousNotebooks = queryClient.getQueryData<UserNotebook[]>([NOTEBOOKS_QUERY_KEY, user?.id])

      // Optimistically update to the new value
      if (previousNotebooks && user) {
        const optimisticNotebook: UserNotebook = {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          name: request.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        queryClient.setQueryData<UserNotebook[]>(
          [NOTEBOOKS_QUERY_KEY, user.id],
          [...previousNotebooks, optimisticNotebook]
        )
      }

      // Return a context object with the snapshotted value
      return { previousNotebooks }
    },
    onSuccess: (newNotebook) => {
      toast.success('Notebook created', {
        description: `"${newNotebook.name}" was created successfully.`,
      })
    },
    onError: (error: any, request, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousNotebooks && user) {
        queryClient.setQueryData([NOTEBOOKS_QUERY_KEY, user.id], context.previousNotebooks)
      }
      
      console.error('Failed to create notebook:', error)
      toast.error('Failed to create notebook', {
        description: error.message || 'An unexpected error occurred.',
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [NOTEBOOKS_QUERY_KEY] })
    },
  })
}

// Rename notebook with optimistic updates
export function useRenameNotebook() {
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }): Promise<UserNotebook> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch(`/api/folders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      
      const result: ApiResponse<UserNotebook> = await response.json()
      
      if (!result.ok || !result.data) {
        throw new Error(result.error || 'Failed to rename notebook')
      }
      
      return result.data
    },
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [NOTEBOOKS_QUERY_KEY, user?.id] })

      // Snapshot the previous value
      const previousNotebooks = queryClient.getQueryData<UserNotebook[]>([NOTEBOOKS_QUERY_KEY, user?.id])

      // Optimistically update to the new value
      if (previousNotebooks && user) {
        queryClient.setQueryData<UserNotebook[]>(
          [NOTEBOOKS_QUERY_KEY, user.id],
          previousNotebooks.map(notebook => 
            notebook.id === id 
              ? { ...notebook, name, updated_at: new Date().toISOString() }
              : notebook
          )
        )
      }

      // Return a context object with the snapshotted value
      return { previousNotebooks }
    },
    onSuccess: (updatedNotebook) => {
      toast.success('Notebook renamed', {
        description: `Notebook renamed to "${updatedNotebook.name}".`,
      })
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousNotebooks && user) {
        queryClient.setQueryData([NOTEBOOKS_QUERY_KEY, user.id], context.previousNotebooks)
      }
      
      console.error('Failed to rename notebook:', error)
      toast.error('Failed to rename notebook', {
        description: error.message || 'An unexpected error occurred.',
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [NOTEBOOKS_QUERY_KEY] })
    },
  })
}

// Delete notebook with optimistic updates
export function useDeleteNotebook() {
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notebookId: string): Promise<{ id: string }> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch(`/api/folders/${notebookId}`, {
        method: 'DELETE',
      })
      
      const result: ApiResponse<{ id: string }> = await response.json()
      
      if (!result.ok || !result.data) {
        throw new Error(result.error || 'Failed to delete notebook')
      }
      
      return result.data
    },
    onMutate: async (notebookId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [NOTEBOOKS_QUERY_KEY, user?.id] })

      // Snapshot the previous value
      const previousNotebooks = queryClient.getQueryData<UserNotebook[]>([NOTEBOOKS_QUERY_KEY, user?.id])

      // Optimistically update to the new value
      if (previousNotebooks && user) {
        queryClient.setQueryData<UserNotebook[]>(
          [NOTEBOOKS_QUERY_KEY, user.id],
          previousNotebooks.filter(notebook => notebook.id !== notebookId)
        )
      }

      // Return a context object with the snapshotted value
      return { previousNotebooks }
    },
    onSuccess: () => {
      // Invalidate files queries as they might be affected
      queryClient.invalidateQueries({ queryKey: ['files'] })
      
      toast.success('Notebook deleted', {
        description: 'The notebook was deleted. Files have been moved to All Notes.',
      })
    },
    onError: (error: any, notebookId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousNotebooks && user) {
        queryClient.setQueryData([NOTEBOOKS_QUERY_KEY, user.id], context.previousNotebooks)
      }
      
      console.error('Failed to delete notebook:', error)
      toast.error('Failed to delete notebook', {
        description: error.message || 'An unexpected error occurred.',
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [NOTEBOOKS_QUERY_KEY] })
    },
  })
}