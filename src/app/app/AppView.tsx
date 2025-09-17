'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { AppShell } from '@/components/AppShell'
import { Editor } from '@/components/Editor'
import { EditorSkeleton } from '@/components/EditorSkeleton'
import { supabase } from '@/lib/supabaseClient'
import { getLatestFileForUser, createDefaultFile } from '@/lib/userFiles.repo'
import { UserFile } from '@/types/user-files.types'

interface AppViewProps {
  user: User | null
}

export function AppView({ user: _user }: AppViewProps) {
  const [currentFile, setCurrentFile] = useState<UserFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCurrentFile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First, try to get the latest file for the user
        let file = await getLatestFileForUser(supabase)
        
        if (!file) {
          // No existing file found, create a default "Untitled" document
          file = await createDefaultFile(supabase)
          
          // Show toast for new file creation
          toast.success('New note created', {
            description: 'A new document has been created and is ready for editing.',
            duration: 3000,
          })
        }
        
        setCurrentFile(file)
      } catch {
        // Error loading current file
        setError('Failed to load document')
        toast.error('Failed to load document', {
          description: 'There was an error loading your document. Please try again.',
        })
      } finally {
        setLoading(false)
      }
    }

    loadCurrentFile()
  }, [])

  if (loading) {
    return (
      <AppShell>
        <div className="h-full">
          <EditorSkeleton className="h-full" />
        </div>
      </AppShell>
    )
  }

  if (error || !currentFile) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Error</h1>
            <p className="text-muted-foreground">
              {error || 'Unable to load document'}
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="h-full">
        <Editor 
          file={currentFile}
          onFileUpdate={setCurrentFile}
          className="h-full"
        />
      </div>
    </AppShell>
  )
}

// TODO Sprint 5: Extract Editor component and implement:
// - Real-time text editing with debounced auto-save
// - Content statistics calculation on change
// - Version conflict resolution UI
// - Optimistic updates with rollback on error
// - Keyboard shortcuts and formatting tools