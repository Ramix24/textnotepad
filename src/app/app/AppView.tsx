'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { Editor } from '@/components/Editor'
import { EditorSkeleton } from '@/components/EditorSkeleton'
import { Sidebar } from '@/components/Sidebar'
import { QuickSwitchModal } from '@/components/QuickSwitchModal'
import { UserFile } from '@/types/user-files.types'
import { getOrCreateLatestFile, getFileById } from '@/lib/userFiles.repo'
import { useSupabase } from '@/components/SupabaseProvider'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useCreateFile } from '@/hooks/useFiles'
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts'
import { toast } from 'sonner'

interface AppViewProps {
  user: any
}

export function AppView({ user: _user }: AppViewProps) {
  const { supabase } = useSupabase()
  const [currentFileId, setCurrentFileId] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<UserFile | null>(null)
  const [isLoadingFile, setIsLoadingFile] = useState(true)
  const [isQuickSwitchOpen, setIsQuickSwitchOpen] = useState(false)
  const [isDirtyMap, setIsDirtyMap] = useState<Record<string, boolean>>({})
  const { user: clientUser, loading: authLoading } = useAuthSession()
  const createFile = useCreateFile()
  
  // Use client-side auth when server-side user is null
  const user = _user || clientUser

  // Load latest file on mount if user is authenticated
  useEffect(() => {
    const loadLatestFile = async () => {
      if (authLoading || !user) {
        setIsLoadingFile(false)
        return
      }

      try {
        setIsLoadingFile(true)
        const file = await getOrCreateLatestFile(supabase)
        setCurrentFile(file)
        setCurrentFileId(file.id)
      } catch (error) {
        console.error('Failed to load latest file:', error)
        toast.error('Failed to load file', {
          description: error instanceof Error ? error.message : 'Unknown error'
        })
      } finally {
        setIsLoadingFile(false)
      }
    }

    loadLatestFile()
  }, [user, authLoading])

  // Handle file selection from sidebar
  const handleFileSelect = async (fileId: string) => {
    if (fileId === currentFileId) {
      return // Already selected
    }

    try {
      setIsLoadingFile(true)
      const file = await getFileById(supabase, fileId)
      setCurrentFile(file)
      setCurrentFileId(fileId)
      // Initialize dirty state for new file if not exists
      if (!(fileId in isDirtyMap)) {
        setIsDirtyMap(prev => ({
          ...prev,
          [fileId]: false
        }))
      }
    } catch (error) {
      console.error('Failed to load file:', error)
      toast.error('Failed to load file', {
        description: error instanceof Error ? error.message : 'File not found or access denied'
      })
    } finally {
      setIsLoadingFile(false)
    }
  }

  // Update currentFile when Editor saves changes
  const handleFileUpdate = (updatedFile: UserFile) => {
    setCurrentFile(updatedFile)
    // Clear dirty state when file is saved
    setIsDirtyMap(prev => ({
      ...prev,
      [updatedFile.id]: false
    }))
  }

  // Handle dirty state changes from Editor
  const handleDirtyChange = (fileId: string, isDirty: boolean) => {
    setIsDirtyMap(prev => ({
      ...prev,
      [fileId]: isDirty
    }))
  }

  // Handle new file creation via keyboard shortcut
  const handleNewFile = async () => {
    if (!user) return
    
    try {
      const newFile = await createFile.mutateAsync({})
      handleFileSelect(newFile.id)
    } catch {
      // Error handling is done in the hook
    }
  }

  // Handle save via keyboard shortcut (delegate to Editor)
  const handleSave = () => {
    // The Editor component handles Ctrl+S internally
    // This is here for completeness and future expansion
  }

  // Handle quick switch modal
  const handleQuickSwitch = () => {
    if (!user) return
    setIsQuickSwitchOpen(true)
  }

  // Global keyboard shortcuts
  useGlobalShortcuts({
    onNewFile: handleNewFile,
    onSave: handleSave,
    onQuickSwitch: handleQuickSwitch,
  })

  // Show loading or auth states
  if (authLoading) {
    return (
      <AppShell
        sidebar={<div className="p-4 text-center text-gray-500">Loading...</div>}
        content={<EditorSkeleton className="h-full" />}
      />
    )
  }

  if (!user) {
    return (
      <AppShell
        sidebar={<Sidebar />}
        content={<div className="flex items-center justify-center h-full p-6 text-center text-gray-500">Please sign in to access your notes</div>}
      />
    )
  }

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar 
            currentFileId={currentFileId}
            onSelect={handleFileSelect}
            isDirtyMap={isDirtyMap}
          />
        }
        content={
          isLoadingFile ? (
            <EditorSkeleton className="h-full" />
          ) : currentFile ? (
            <Editor 
              key={currentFile.id} 
              file={currentFile}
              onFileUpdate={handleFileUpdate}
              onDirtyChange={handleDirtyChange}
              className="h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6 text-center text-gray-500">No file selected</div>
          )
        }
      />
      
      {/* Quick Switch Modal */}
      <QuickSwitchModal
        isOpen={isQuickSwitchOpen}
        onClose={() => setIsQuickSwitchOpen(false)}
        onSelectFile={handleFileSelect}
        currentFileId={currentFileId}
      />
    </>
  )
}