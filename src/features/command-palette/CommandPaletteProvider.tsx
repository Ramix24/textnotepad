'use client'

import React, { createContext, useContext, useCallback, useMemo } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { useCommandPalette } from './useCommandPalette'
import { CommandPalette } from './CommandPalette'
import { CommandContext, CommandAction, mockApi } from './actions'
import { useFilesList, useCreateFile, useDeleteFile } from '@/hooks/useFiles'
import { useFoldersList, useCreateFolder } from '@/hooks/useFolders'
import { UserFile } from '@/types/user-files.types'
import { UserFolder } from '@/types/folders.types'
import { useColumnsLayout } from '@/hooks/useColumnsLayout'

interface CommandPaletteContextType {
  toggle: () => void
  open: () => void
  close: () => void
  isOpen: boolean
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null)

export function useCommandPaletteContext() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    // Return a fallback object during SSR or when provider is not available
    return {
      toggle: () => {},
      open: () => {},
      close: () => {},
      isOpen: false
    }
  }
  return context
}

interface CommandPaletteProviderProps {
  children: React.ReactNode
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const { setTheme } = useTheme()
  const layout = useColumnsLayout()
  
  // Data hooks
  const { data: files = [] } = useFilesList()
  const { data: folders = [] } = useFoldersList()
  const createFile = useCreateFile()
  const createFolderMutation = useCreateFolder()
  const deleteFile = useDeleteFile()
  
  // Command palette state
  const commandPalette = useCommandPalette()

  // Build command context
  const commandContext: CommandContext = useMemo(() => ({
    getState: () => {
      const state = {
        currentNoteId: layout.selection.fileId || undefined,
        currentFolderId: layout.selection.folderId || undefined,
        folders,
        files
      }
      console.log('🎯 CONTEXT getState - layout.selection:', JSON.stringify(layout.selection))
      console.log('🎯 CONTEXT getState - returning state:', JSON.stringify(state))
      return state
    },
    api: {
      searchNotes: mockApi.searchNotes, // Use real API when available
      
      createNote: async (folderId?: string, name?: string) => {
        console.log('🎯 API createNote called with folderId:', folderId, 'name:', name)
        const finalName = name || `Note ${new Date().toLocaleDateString()}`
        console.log('🎯 API createNote final name:', finalName)
        
        const result = await createFile.mutateAsync({
          name: finalName,
          folder_id: folderId || null
        })
        
        console.log('🎯 API createNote result:', result)
        
        // Navigate to the new note
        layout.setSelection({
          mode: 'notes',
          folderId: folderId || null,
          fileId: result.id
        })
        
        return { id: result.id }
      },
      
      createFolder: async (name: string) => {
        console.log('🎯 API createFolder called with name:', name)
        try {
          const result = await createFolderMutation.mutateAsync({ name })
          console.log('🎯 API createFolder result:', result)
          
          // Navigate to the new folder
          layout.setSelection({
            mode: 'notes',
            folderId: result.id,
            fileId: null
          })
          
          toast.success(`Folder "${name}" created`)
          return { id: result.id }
        } catch (error) {
          console.error('🎯 API createFolder error:', error)
          toast.error('Failed to create folder')
          throw error
        }
      },
      
      moveNote: async (_noteId: string, _folderId: string) => {
        // This would require a move API - not implemented yet
        toast.info('Move note feature coming soon!')
      },
      
      exportNotePdf: mockApi.exportNotePdf, // Use real API when available
      
      toggleDarkMode: () => {
        // Get current theme from document to determine toggle direction
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        toast.success(`Switched to ${newTheme} mode`)
      },
      
      openNote: (id: string) => {
        layout.setSelection({
          mode: 'notes',
          folderId: layout.selection.folderId,
          fileId: id
        })
        
        // Focus detail view on mobile/tablet
        if (layout.isMobile || layout.isTablet) {
          layout.setActivePane(3)
        }
      },
      
      openFolder: (id: string) => {
        layout.setSelection({
          mode: 'notes',
          folderId: id,
          fileId: null
        })
        
        // Focus list view on mobile/tablet
        if (layout.isMobile || layout.isTablet) {
          layout.setActivePane(2)
        }
      },
      
      openSearch: (query?: string) => {
        layout.setSelection({
          mode: 'search',
          folderId: null,
          fileId: null,
          searchQuery: query || ''
        })
        
        // Focus search view on mobile/tablet
        if (layout.isMobile || layout.isTablet) {
          layout.setActivePane(3)
        }
      },
      
      deleteNote: async (noteId: string) => {
        try {
          await deleteFile.mutateAsync(noteId)
          
          // Navigate away from deleted note if it was currently selected
          if (layout.selection.fileId === noteId) {
            layout.setSelection({
              mode: 'notes',
              folderId: layout.selection.folderId,
              fileId: null
            })
          }
          
          toast.success('Note deleted')
        } catch {
          toast.error('Failed to delete note')
          throw new Error('Failed to delete note')
        }
      }
    }
  }), [layout, files, folders, createFile, createFolderMutation, deleteFile, setTheme])

  // Actions are handled directly in the CommandPalette component

  // Handle action selection
  const handleSelectAction = useCallback(async (action: CommandAction) => {
    try {
      if ('needsArg' in action) {
        // Start argument input mode
        commandPalette.actions.startArgInput(action, action.needsArg)
        return
      }

      // Execute action immediately
      await action.run(commandContext)
      
      // Add to recent actions and close
      commandPalette.actions.addRecentAction(action.id)
      commandPalette.actions.close()
      
    } catch {
      // Silently handle errors in production
      toast.error('Failed to execute action')
    }
  }, [commandContext, commandPalette.actions])

  // Handle action with argument
  const handleExecuteWithArg = useCallback(async (action: CommandAction, arg: unknown) => {
    try {
      if ('needsArg' in action) {
        await action.run(commandContext, arg)
      }
      
      commandPalette.actions.addRecentAction(action.id)
      commandPalette.actions.close()
      
    } catch {
      // Silently handle errors in production
      toast.error('Failed to execute action')
    }
  }, [commandContext, commandPalette.actions])

  // Handle note selection
  const handleSelectNote = useCallback((note: UserFile) => {
    commandContext.api.openNote(note.id)
  }, [commandContext])

  // Handle folder selection
  const handleSelectFolder = useCallback((folder: UserFolder) => {
    commandContext.api.openFolder(folder.id)
  }, [commandContext])

  const contextValue: CommandPaletteContextType = {
    toggle: commandPalette.actions.toggle,
    open: commandPalette.actions.open,
    close: commandPalette.actions.close,
    isOpen: commandPalette.state.isOpen
  }

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      
      <CommandPalette
        context={commandContext}
        state={commandPalette.state}
        onClose={commandPalette.actions.close}
        onSelectAction={handleSelectAction}
        onSelectNote={handleSelectNote}
        onSelectFolder={handleSelectFolder}
        onExecuteWithArg={handleExecuteWithArg}
        onSetQuery={commandPalette.actions.setQuery}
        onSetActiveIndex={commandPalette.actions.setActiveIndex}
      />
    </CommandPaletteContext.Provider>
  )
}