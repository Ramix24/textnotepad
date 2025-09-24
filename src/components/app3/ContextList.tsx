'use client'

import { ReactNode } from 'react'
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
  
  const fileOps = useFileOperations({
    onFileSelect: (fileId) => {
      onSelectionChange({ 
        ...selection,
        fileId,
        section: 'notes'
      })
      onMobileAdvance?.() // Auto-advance to pane 3 on mobile
    },
    onFileCreated: (newFile) => {
      onSelectionChange({
        ...selection,
        fileId: newFile.id,
        section: 'notes'
      })
      onMobileAdvance?.()
    },
    onFileDeleted: (fileId) => {
      if (selection.fileId === fileId) {
        onSelectionChange({
          ...selection,
          fileId: null
        })
      }
    }
  })

  const handleFileSelect = (file: UserFile) => {
    fileOps.handleFileClick(file)
  }

  const handleNewNote = () => {
    fileOps.handleCreateFile()
  }

  if (selection.section === 'folders') {
    return <FoldersView selection={selection} onSelectionChange={onSelectionChange} />
  }

  if (selection.section === 'notes') {
    return (
      <NotesView 
        files={files}
        isLoading={isLoading}
        selectedFileId={selection.fileId}
        onFileSelect={handleFileSelect}
        onNewNote={handleNewNote}
        fileOps={fileOps}
      />
    )
  }

  if (selection.section === 'trash') {
    return <TrashView />
  }

  if (selection.section === 'messages') {
    return <MessagesView />
  }

  return null
}

// TODO: Implement folders when database schema supports it
function FoldersView({ selection, onSelectionChange }: {
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
}) {
  // Mock folders data - replace with real implementation when DB supports folders
  const mockFolders = [
    { id: 'personal', name: 'Personal', count: 5 },
    { id: 'work', name: 'Work', count: 12 },
    { id: 'projects', name: 'Projects', count: 8 },
  ]

  return (
    <div className="flex flex-col">
      <header className="flex-shrink-0 p-4 border-b border-border bg-card/30 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">Folders</h2>
          <p className="text-xs text-muted-foreground mt-1">Organize your notes</p>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto p-2">
        <div role="listbox" className="space-y-1">
          {mockFolders.map((folder) => (
            <button
              key={folder.id}
              role="option"
              aria-selected={selection.folderId === folder.id}
              onClick={() => onSelectionChange({ 
                ...selection, 
                folderId: folder.id,
                fileId: null, // Clear fileId when changing folders
                section: 'folders' 
              })}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors
                ${selection.folderId === folder.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm">📁</span>
                <span className="text-sm font-medium">{folder.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{folder.count}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-muted mb-4 flex items-center justify-center mx-auto">
              <span className="text-lg">📁</span>
            </div>
            <h3 className="text-sm font-medium text-foreground mb-2">No folders yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mb-4 mx-auto">
              Create folders to organize your notes by topic or project
            </p>
            <button 
              disabled
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-md cursor-not-allowed"
            >
              + New Folder (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotesView({ 
  files, 
  isLoading, 
  selectedFileId, 
  onFileSelect, 
  onNewNote,
  fileOps
}: {
  files: UserFile[]
  isLoading: boolean
  selectedFileId?: string | null
  onFileSelect: (file: UserFile) => void
  onNewNote: () => void
  fileOps: ReturnType<typeof useFileOperations>
}) {
  // Sort files by last modified (updated_at desc)
  const sortedFiles = files
    .filter(f => !f.deleted_at) // Exclude soft-deleted files
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  return (
    <div className="flex flex-col">
      <header className="flex-shrink-0 p-4 border-b border-border bg-card/30 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">Notes</h2>
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