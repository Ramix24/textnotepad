'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useFilesList, useEmptyTrash } from '@/hooks/useFiles'
import { useFileOperations } from './useFileOperations'
import { FileItem } from './FileItem'
import { SortDropdown, SortOption } from '@/components/sort-dropdown'
import { sortFiles, getDefaultSort } from '@/lib/sort'
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
      className={`flex flex-col h-full bg-bg-primary border-r border-border-dark ${className}`}
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
  
  // Edge case: Invalid folder detection and recovery is now handled by FoldersPanel with real data

  // Edge case: File no longer exists in current mode
  useEffect(() => {
    if (selection.fileId && files.length > 0 && !isLoading) {
      // Check if file exists in the current mode's filtered files
      const filteredFiles = getFilteredFiles(files, selection)
      const fileExistsInMode = filteredFiles.some(f => f.id === selection.fileId)
      
      if (!fileExistsInMode) {
        // Selected file not available in current mode, clearing selection
        onSelectionChange({
          ...selection,
          fileId: null
        })
      }
    }
  }, [selection, files, isLoading, onSelectionChange])
  
  const fileOps = useFileOperations({
    currentFolderId: selection.mode === 'notes' ? selection.folderId : null,
    onFileSelect: (fileId) => {
      onSelectionChange({ 
        mode: 'notes', // Always switch to notes mode when selecting a file
        folderId: selection.mode === 'search' ? null : selection.folderId, // Keep current folder unless in search mode
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
            // No files remaining in current folder, but files exist in All Notes
            // User can manually switch to All Notes if desired
          }
        }
      }
    }
  })

  const handleFileSelect = (file: UserFile) => {
    fileOps.handleFileClick(file)
  }


  // Filter files based on current mode and folder
  const filteredFiles = getFilteredFiles(files, selection)

  if (selection.folderId === 'trash') {
    return (
      <TrashView 
        files={filteredFiles}
        isLoading={isLoading}
        selectedFileId={selection.fileId}
        onFileSelect={handleFileSelect}
        fileOps={fileOps}
      />
    )
  }

  if (selection.mode === 'notes') {
    return (
      <NotesView 
        files={filteredFiles}
        isLoading={isLoading}
        selectedFileId={selection.fileId}
        onFileSelect={handleFileSelect}
        fileOps={fileOps}
        selection={selection}
      />
    )
  }

  if (selection.mode === 'messages') {
    return <MessagesView />
  }

  if (selection.mode === 'search') {
    // In search mode, show all notes in C2 (same as All Notes)
    const allNotes = files.filter(f => !f.deleted_at)
    return (
      <NotesView 
        files={allNotes}
        isLoading={isLoading}
        selectedFileId={selection.fileId}
        onFileSelect={handleFileSelect}
        fileOps={fileOps}
        selection={selection}
      />
    )
  }

  if (selection.mode === 'help') {
    // In help mode, maintain search view in C2 (show all notes)
    const allNotes = files.filter(f => !f.deleted_at)
    return (
      <NotesView 
        files={allNotes}
        isLoading={isLoading}
        selectedFileId={selection.fileId}
        onFileSelect={handleFileSelect}
        fileOps={fileOps}
        selection={selection}
      />
    )
  }

  return null
}

// Helper function to filter files based on selection
function getFilteredFiles(files: UserFile[], selection: AppSelection): UserFile[] {
  if (selection.folderId === 'trash') {
    // Show soft-deleted files only
    return files.filter(f => f.deleted_at)
  }
  
  if (selection.folderId === 'inbox') {
    // INBOX: show uncategorized notes (folder_id = null or undefined)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return files.filter(f => !f.deleted_at && ((f as any).folder_id === null || (f as any).folder_id === undefined))
  }
  
  if (selection.mode === 'notes') {
    // Show non-deleted files, filtered by folder
    const activeFiles = files.filter(f => !f.deleted_at)
    
    if (selection.folderId === null) {
      // All Notes: show all files regardless of folder
      return activeFiles
    }
    
    // Specific folder: filter by folder_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return activeFiles.filter(f => (f as any).folder_id === selection.folderId)
  }
  
  if (selection.mode === 'search') {
    // In search mode, always show all notes (like All Notes)
    return files.filter(f => !f.deleted_at)
  }
  
  if (selection.mode === 'help') {
    // In help mode, show all notes (like search mode)
    return files.filter(f => !f.deleted_at)
  }
  
  return []
}


function NotesView({ 
  files, 
  isLoading, 
  selectedFileId, 
  onFileSelect, 
  fileOps,
  selection: _selection
}: {
  files: UserFile[]
  isLoading: boolean
  selectedFileId?: string | null
  onFileSelect: (file: UserFile) => void
  fileOps: ReturnType<typeof useFileOperations>
  selection: AppSelection
}) {
  const [sortBy, setSortBy] = useState<SortOption>(getDefaultSort())
  
  // Sort files based on current sort option
  const sortedFiles = sortFiles(files, sortBy)


  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 p-4 border-b border-border-dark bg-bg-secondary">
        <div className="flex items-center justify-between">
          <button
            onClick={() => fileOps.handleCreateFile()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-accent-blue text-white rounded-md hover:opacity-90 transition-colors"
            title="Create new note in current folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">+ Note</span>
          </button>
          
          {files.length > 0 && (
            <SortDropdown 
              value={sortBy} 
              onChange={setSortBy}
            />
          )}
        </div>
      </header>
      
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="text-sm text-text-secondary">Loading notes...</div>
          </div>
        ) : sortedFiles.length === 0 ? (
          <NotesEmptyState />
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

      {/* Footer */}
      <footer className="flex-shrink-0 p-3 border-t border-border-dark bg-bg-secondary">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span>{files.length} notes</span>
            {files.length > 0 && (
              <>
                <span>·</span>
                <span>Updated {new Date().toLocaleDateString()}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 text-[10px] bg-bg-active text-text-secondary rounded border border-border-dark">⌘N</kbd>
            <span>new</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NotesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-bg-secondary mb-4 flex items-center justify-center">
        <span className="text-lg">📝</span>
      </div>
      <h3 className="text-sm font-medium text-text-primary mb-2">No notes in this folder</h3>
      <p className="text-xs text-text-secondary leading-relaxed max-w-[200px]">
        Use the &ldquo;+ Note&rdquo; button in the header to create your first note
      </p>
    </div>
  )
}

function TrashView({ 
  files, 
  isLoading, 
  selectedFileId, 
  onFileSelect, 
  fileOps
}: {
  files: UserFile[]
  isLoading: boolean
  selectedFileId?: string | null
  onFileSelect: (file: UserFile) => void
  fileOps: ReturnType<typeof useFileOperations>
}) {
  const [sortBy, setSortBy] = useState<SortOption>(getDefaultSort())
  const emptyTrash = useEmptyTrash()
  
  // Sort files based on current sort option
  const sortedFiles = sortFiles(files, sortBy)

  const handleRestoreFile = async (file: UserFile) => {
    try {
      // Call the restore functionality (we'll implement this)
      await fileOps.handleRestore?.(file)
    } catch {
      // Error handling is done in the hook
    }
  }

  const handlePermanentDelete = async (file: UserFile) => {
    if (confirm(`Permanently delete "${file.name}"? This cannot be undone.`)) {
      try {
        await fileOps.handlePermanentDelete?.(file)
      } catch {
        // Error handling is done in the hook
      }
    }
  }

  const handleEmptyTrash = () => {
    if (files.length === 0) return
    
    const confirmed = confirm(`Are you sure you want to permanently delete all ${files.length} files in trash? This action cannot be undone.`)
    if (confirmed) {
      const fileIds = files.map(f => f.id)
      emptyTrash.mutate(fileIds)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 p-4 border-b border-border-dark bg-bg-secondary">
        <div className="flex items-center justify-between">
          <button
            onClick={handleEmptyTrash}
            disabled={files.length === 0 || emptyTrash.isPending}
            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Permanently delete all files in trash"
          >
            {emptyTrash.isPending ? 'Emptying...' : 'Empty Trash'}
          </button>
          
          {files.length > 0 && (
            <SortDropdown 
              value={sortBy} 
              onChange={setSortBy}
            />
          )}
        </div>
      </header>
      
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="text-sm text-text-secondary">Loading deleted items...</div>
          </div>
        ) : sortedFiles.length === 0 ? (
          <TrashEmptyState />
        ) : (
          <div role="listbox" className="p-2 space-y-1">
            {sortedFiles.map((file) => (
              <TrashFileItem
                key={file.id}
                file={file}
                isSelected={selectedFileId === file.id}
                onSelect={onFileSelect}
                onRestore={() => handleRestoreFile(file)}
                onPermanentDelete={() => handlePermanentDelete(file)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 p-3 border-t border-border-dark bg-bg-secondary">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span>{files.length} deleted items</span>
            {files.length > 0 && (
              <>
                <span>·</span>
                <span>Select an item to preview or restore</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

function TrashEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-bg-secondary mb-4 flex items-center justify-center">
        <span className="text-lg">🗑️</span>
      </div>
      <h3 className="text-sm font-medium text-text-primary mb-2">Trash is empty</h3>
      <p className="text-xs text-text-secondary leading-relaxed max-w-[200px]">
        Deleted notes will appear here. You can restore them or delete them permanently.
      </p>
    </div>
  )
}

function TrashFileItem({ 
  file, 
  isSelected, 
  onSelect, 
  onRestore, 
  onPermanentDelete 
}: {
  file: UserFile
  isSelected: boolean
  onSelect: (file: UserFile) => void
  onRestore: () => void
  onPermanentDelete: () => void
}) {
  const deletedDate = file.deleted_at ? new Date(file.deleted_at) : null
  const timeAgo = deletedDate ? formatTimeAgo(deletedDate) : 'Unknown'

  return (
    <div
      className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'bg-bg-active border-accent-blue shadow-sm'
          : 'bg-bg-primary border-border-dark hover:bg-bg-secondary hover:border-border-light'
      }`}
      onClick={() => onSelect(file)}
      role="option"
      aria-selected={isSelected}
    >
      {/* File content preview */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm font-medium truncate ${
              isSelected ? 'text-accent-blue' : 'text-text-secondary'
            }`}>
              {file.name}
            </h3>
            <span className="text-xs text-text-secondary opacity-60">
              (deleted)
            </span>
          </div>
          
          <p className="text-xs text-text-secondary line-clamp-2 mb-2 opacity-75">
            {file.content.substring(0, 100)}
            {file.content.length > 100 ? '...' : ''}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span>Deleted {timeAgo}</span>
            <span>•</span>
            <span>{file.word_count} words</span>
          </div>
        </div>
      </div>

      {/* Action buttons - show on hover */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRestore()
          }}
          className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
          title="Restore file"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPermanentDelete()
          }}
          className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
          title="Delete permanently"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

function MessagesView() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-bg-secondary mb-4 flex items-center justify-center">
        <span className="text-lg">💬</span>
      </div>
      <h3 className="text-sm font-medium text-text-primary mb-2">Messages</h3>
      <p className="text-xs text-text-secondary leading-relaxed max-w-[200px]">
        No conversations yet. Start a conversation to see your messages here.
      </p>
      <button 
        disabled
        className="mt-4 px-3 py-1.5 text-xs font-medium text-text-secondary border border-border-dark rounded-md cursor-not-allowed"
      >
        Coming Soon
      </button>
    </div>
  )
}