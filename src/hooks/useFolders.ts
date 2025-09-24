'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/components/SupabaseProvider'
import { useAuthSession } from '@/hooks/useAuthSession'
import { toast } from 'sonner'
import type { UserFolder, CreateFolderRequest, UpdateFolderRequest, FolderWithFileCount } from '@/types/folders.types'

const FOLDERS_QUERY_KEY = 'folders'

// Fetch user's folders
export function useFoldersList() {
  const { supabase } = useSupabase()
  const { user } = useAuthSession()

  return useQuery({
    queryKey: [FOLDERS_QUERY_KEY, user?.id],
    queryFn: async (): Promise<UserFolder[]> => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await (supabase as any)
        .from('folders')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })
}

// Fetch folders with file count
export function useFoldersWithCount() {
  const { supabase } = useSupabase()
  const { user } = useAuthSession()

  return useQuery({
    queryKey: [FOLDERS_QUERY_KEY, 'with-count', user?.id],
    queryFn: async (): Promise<FolderWithFileCount[]> => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await (supabase as any)
        .from('folders')
        .select(`
          *,
          file_count:user_files(count)
        `)
        .order('name')

      if (error) throw error

      // Transform the data to flatten file_count
      return (data || []).map((folder: any) => ({
        ...folder,
        file_count: Array.isArray(folder.file_count) ? folder.file_count.length : 0
      }))
    },
    enabled: !!user,
  })
}

// Get folder by ID
export function useFolderById(folderId?: string | null) {
  const { supabase } = useSupabase()
  const { user } = useAuthSession()

  return useQuery({
    queryKey: [FOLDERS_QUERY_KEY, folderId, user?.id],
    queryFn: async (): Promise<UserFolder | null> => {
      if (!user || !folderId) return null

      const { data, error } = await (supabase as any)
        .from('folders')
        .select('*')
        .eq('id', folderId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }
      return data
    },
    enabled: !!user && !!folderId,
  })
}

// Create folder
export function useCreateFolder() {
  const { supabase } = useSupabase()
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CreateFolderRequest): Promise<UserFolder> => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await (supabase as any)
        .from('folders')
        .insert({
          user_id: user.id,
          name: request.name,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newFolder) => {
      // Invalidate folders queries to refetch
      queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] })
      
      toast.success('Folder created', {
        description: `"${newFolder.name}" was created successfully.`,
      })
    },
    onError: (error: any) => {
      console.error('Failed to create folder:', error)
      toast.error('Failed to create folder', {
        description: error.message || 'An unexpected error occurred.',
      })
    },
  })
}

// Update folder
export function useUpdateFolder() {
  const { supabase } = useSupabase()
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateFolderRequest }): Promise<UserFolder> => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await (supabase as any)
        .from('folders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (updatedFolder) => {
      // Invalidate folders queries to refetch
      queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] })
      
      toast.success('Folder updated', {
        description: `"${updatedFolder.name}" was updated successfully.`,
      })
    },
    onError: (error: any) => {
      console.error('Failed to update folder:', error)
      toast.error('Failed to update folder', {
        description: error.message || 'An unexpected error occurred.',
      })
    },
  })
}

// Delete folder
export function useDeleteFolder() {
  const { supabase } = useSupabase()
  const { user } = useAuthSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (folderId: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await (supabase as any)
        .from('folders')
        .delete()
        .eq('id', folderId)

      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['files'] }) // Files might be affected
      
      toast.success('Folder deleted', {
        description: 'The folder was deleted. Files have been moved to All Notes.',
      })
    },
    onError: (error: any) => {
      console.error('Failed to delete folder:', error)
      toast.error('Failed to delete folder', {
        description: error.message || 'An unexpected error occurred.',
      })
    },
  })
}