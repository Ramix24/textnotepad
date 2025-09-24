'use client'

import { ReactNode, useEffect } from 'react'
import { useFilesList } from '@/hooks/useFiles'
import { useFileOperations } from './useFileOperations'
import { FileItem } from './FileItem'
import type { AppSelection } from './types'
import type { UserFile } from '@/types/user-files.types'

interface ContextListProps {
  children?: ReactNode
  className?: string
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void // For mobile navigation to pane 3
}

export function ContextList({ 
  children, 
  className = '',
  selection,
  onSelectionChange,
  onMobileAdvance
}: ContextListProps) {
  
  return (
    <div 
      className={`flex flex-col bg-zinc-50/20 dark:bg-zinc-800/20 border-r border-zinc-200 dark:border-zinc-700 ${className}`}
      role="main"
      aria-label="Context List"
    >
      {children || (
        <DefaultContextContent 
          selection={selection}
          onSelectionChange={onSelectionChange}
          onMobileAdvance={onMobileAdvance}
        />
      )}
    </div>
  )
}

interface DefaultContextContentProps {
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void
}

function DefaultContextContent({ selection, onSelectionChange, onMobileAdvance }: DefaultContextContentProps) {
  const { data: files = [], isLoading } = useFilesList()
  
  // Edge case: Invalid folder detection and recovery
  useEffect(() => {
    if (selection.mode === 'notes' && selection.folderId) {
      const validFolderIds = ['personal', 'work', 'projects']
      if (!validFolderIds.includes(selection.folderId)) {
        console.warn(`Invalid folderId "${selection.folderId}" detected, resetting to All Notes`)
        onSelectionChange({
          mode: 'notes',
          folderId: null,
          fileId: null // Also clear invalid file selection
        })
        return
      }
    }
  }, [selection.mode, selection.folderId, onSelectionChange])

  // Edge case: File no longer exists
  useEffect(() => {
    if (selection.fileId && files.length > 0 && !isLoading) {
      const fileExists = files.some(f => f.id === selection.fileId)
      if (!fileExists) {
        console.warn(`Selected file "${selection.fileId}" no longer exists, clearing selection`)
        onSelectionChange({
          ...selection,
          fileId: null
        })
      }
    }
  }, [selection, files, isLoading, onSelectionChange])
  
  const fileOps = useFileOperations({
    onFileSelect: (fileId) => {
      onSelectionChange({ 
        ...selection,
        fileId
      })
      onMobileAdvance?.() // Auto-advance to pane 3 on mobile
    },
    onFileCreated: (newFile) => {
      onSelectionChange({
        ...selection,
        fileId: newFile.id
      })
      onMobileAdvance?.()
    },
    onFileDeleted: (fileId) => {
      if (selection.fileId === fileId) {
        // Smart selection: pick the next available note in the current filter
        const filteredFiles = getFilteredFiles(files, selection)
        const currentIndex = filteredFiles.findIndex(f => f.id === fileId)
        
        // Try to select the next file, then previous, then null
        let nextFile = filteredFiles[currentIndex + 1]
        if (!nextFile && currentIndex > 0) {
          nextFile = filteredFiles[currentIndex - 1]
        }
        
        onSelectionChange({
          ...selection,
          fileId: nextFile?.id || null
        })
        
        // If we're in an empty folder and no files remain, consider switching to All Notes
        if (!nextFile && selection.folderId !== null) {
          const allFiles = files.filter(f => !f.deleted_at)
          if (allFiles.length > 0) {
            console.info('No files remaining in current folder, but files exist in All Notes')
            // User can manually switch to All Notes if desired
          }
        }
      }
    }
  })

  const handleFileSelect = (file: UserFile) => {
    fileOps.handleFileClick(file)
  }

  const handleNewNote = () => {
    // Create file (folder support will be added later)
    fileOps.handleCreateFile()
  }

  // Filter files based on current mode and folder
  const filteredFiles = getFilteredFiles(files, selection)

  if (selection.mode === 'notes') {
    return (
      <NotesView 
        files={filteredFiles}
        isLoading={isLoading}
        selectedFileId={selection.fileId}
        onFileSelect={handleFileSelect}
        onNewNote={handleNewNote}
        fileOps={fileOps}
        selection={selection}
      />
    )
  }

  if (selection.mode === 'trash') {
    return <TrashView />
  }

  if (selection.mode === 'messages') {
    return <MessagesView />
  }

  return null
}

// Helper function to filter files based on selection
function getFilteredFiles(files: UserFile[], selection: AppSelection): UserFile[] {
  if (selection.mode === 'trash') {
    // Show soft-deleted files only
    return files.filter(f => f.deleted_at)
  }
  
  if (selection.mode === 'notes') {
    // Show non-deleted files, filtered by folder
    const activeFiles = files.filter(f => !f.deleted_at)
    
    if (selection.folderId === null) {
      // All Notes: show all files (no folder support yet)
      return activeFiles
    }
    
    // Specific folder: temporary empty array until folder support is implemented
    // TODO: Replace with actual folder filtering when database supports folders
    // For now, validate that the folderId exists in our mock data
    const validFolderIds = ['personal', 'work', 'projects']
    if (!selection.folderId || !validFolderIds.includes(selection.folderId)) {
      // Invalid folder ID - this is an edge case where persisted state is stale
      // Return all files as fallback behavior
      if (selection.folderId) {
        console.warn(`Invalid folderId "${selection.folderId}" found, falling back to All Notes`)
      }
      return activeFiles
    }
    
    return []
  }
  
  return []
}


function NotesView({ 
  files, 
  isLoading, 
  selectedFileId, 
  onFileSelect, 
  onNewNote,
  fileOps,
  selection
}: {
  files: UserFile[]
  isLoading: boolean
  selectedFileId?: string | null
  onFileSelect: (file: UserFile) => void
  onNewNote: () => void
  fileOps: ReturnType<typeof useFileOperations>
  selection: AppSelection
}) {
  // Sort files by last modified (updated_at desc) - files are already filtered
  const sortedFiles = files.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  // Get folder name for header
  const getFolderDisplayName = () => {
    if (selection.folderId === null) return 'All Notes'
    // TODO: Replace with actual folder name lookup when folders are implemented
    const mockFolders = { 'personal': 'Personal', 'work': 'Work', 'projects': 'Projects' }
    return mockFolders[selection.folderId as keyof typeof mockFolders] || 'Unknown Folder'
  }

  return (
    <div className="flex flex-col">
      <header className="flex-shrink-0 p-4 border-b border-border bg-card/30 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">{getFolderDisplayName()}</h2>
          <p className="text-xs text-muted-foreground mt-1">{files.length} notes</p>
        </div>
        <button
          onClick={onNewNote}
          disabled={fileOps.createFile.isPending}
          className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {fileOps.createFile.isPending ? 'Creating...' : 'New Note'}
        </button>
      </header>
      
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="text-sm text-muted-foreground">Loading notes...</div>
          </div>
        ) : sortedFiles.length === 0 ? (
          <NotesEmptyState onNewNote={onNewNote} isCreating={fileOps.createFile.isPending} />
        ) : (
          <div role="listbox" className="p-2 space-y-1">
            {sortedFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                isSelected={selectedFileId === file.id}
                isRenaming={fileOps.renamingFileId === file.id}
                renameValue={fileOps.renameValue}
                onSelect={onFileSelect}
                onStartRename={fileOps.handleStartRename}
                onRenameCommit={fileOps.handleRenameCommit}
                onRenameCancel={fileOps.handleRenameCancel}
                onRenameValueChange={fileOps.setRenameValue}
                onDelete={(file) => fileOps.handleDelete(file, selectedFileId ?? undefined, files)}
                compact={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NotesEmptyState({ onNewNote, isCreating }: { onNewNote: () => void, isCreating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-muted mb-4 flex items-center justify-center">
        <span className="text-lg">📝</span>
      </div>
      <h3 className="text-sm font-medium text-foreground mb-2">No notes in this folder</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mb-4">
        Start writing your first note in this folder
      </p>
      <button
        onClick={onNewNote}
        disabled={isCreating}
        className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isCreating ? 'Creating...' : '+ New Note'}
      </button>
    </div>
  )
}

function TrashView() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-muted mb-4 flex items-center justify-center">
        <span className="text-lg">🗑️</span>
      </div>
      <h3 className="text-sm font-medium text-foreground mb-2">Trash</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
        Deleted items will appear here. Coming soon with RLS implementation.
      </p>
    </div>
  )
}

function MessagesView() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-muted mb-4 flex items-center justify-center">
        <span className="text-lg">💬</span>
      </div>
      <h3 className="text-sm font-medium text-foreground mb-2">Messages</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
        No conversations yet. Start a conversation to see your messages here.
      </p>
      <button 
        disabled
        className="mt-4 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-md cursor-not-allowed"
      >
        Coming Soon
      </button>
    </div>
  )
}