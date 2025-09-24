'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { Mode, AppSelection } from './types'

interface FoldersPanelProps {
  children?: ReactNode
  className?: string
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void // For mobile navigation to pane 2
}

export function FoldersPanel({ 
  children, 
  className = '',
  selection,
  onSelectionChange,
  onMobileAdvance
}: FoldersPanelProps) {
  
  return (
    <div 
      className={`flex flex-col bg-zinc-50/30 dark:bg-zinc-800/30 border-r border-zinc-200 dark:border-zinc-700 ${className}`}
      role="navigation"
      aria-label="Folders and Modes"
    >
      {children || (
        <DefaultFoldersContent 
          selection={selection}
          onSelectionChange={onSelectionChange}
          onMobileAdvance={onMobileAdvance}
        />
      )}
    </div>
  )
}

interface DefaultFoldersContentProps {
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void
}

function DefaultFoldersContent({ selection, onSelectionChange, onMobileAdvance }: DefaultFoldersContentProps) {
  
  const handleModeChange = (mode: Mode) => {
    onSelectionChange({ mode, folderId: null, fileId: null })
    onMobileAdvance?.() // Auto-advance to pane 2 on mobile
  }

  const handleFolderSelect = (folderId: string | null) => {
    onSelectionChange({ mode: 'notes', folderId, fileId: null })
    onMobileAdvance?.() // Auto-advance to pane 2 on mobile
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header toolbar */}
      <header className="flex-shrink-0 p-2 border-b border-border bg-card/20 sticky top-0 z-10">
        <div className="flex gap-1">
          <Button
            onClick={() => handleModeChange('notes')}
            variant={selection.mode === 'notes' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 text-xs font-medium flex-1"
          >
            All Notes
          </Button>
          <Button
            onClick={() => handleModeChange('messages')}
            variant={selection.mode === 'messages' ? 'default' : 'ghost'}
            size="sm"
            disabled
            className="h-8 text-xs font-medium flex-1 opacity-50 cursor-not-allowed"
          >
            Messages
          </Button>
          <Button
            onClick={() => handleModeChange('trash')}
            variant={selection.mode === 'trash' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 text-xs font-medium flex-1"
          >
            Trash
          </Button>
        </div>
      </header>
      
      {/* Folders list or mode-specific content */}
      <div className="flex-1 overflow-auto">
        {selection.mode === 'notes' ? (
          <FoldersList 
            selection={selection}
            onFolderSelect={handleFolderSelect}
          />
        ) : selection.mode === 'messages' ? (
          <MessagesPlaceholder />
        ) : selection.mode === 'trash' ? (
          <TrashPlaceholder />
        ) : null}
      </div>
    </div>
  )
}

interface FoldersListProps {
  selection: AppSelection
  onFolderSelect: (folderId: string | null) => void
}

function FoldersList({ selection, onFolderSelect }: FoldersListProps) {
  // TODO: Replace with useFoldersList() hook when database schema supports folders
  const mockFolders = [
    { id: 'personal', name: 'Personal', count: 5 },
    { id: 'work', name: 'Work', count: 12 },
    { id: 'projects', name: 'Projects', count: 8 },
  ]

  return (
    <div className="p-2">
      {/* All Notes option */}
      <div role="listbox" className="space-y-1">
        <button
          role="option"
          aria-selected={selection.folderId === null}
          onClick={() => onFolderSelect(null)}
          className={`
            w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-sm
            ${selection.folderId === null
              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm">📝</span>
            <span className="font-medium">All Notes</span>
          </div>
        </button>

        {/* Individual folders */}
        {mockFolders.map((folder) => (
          <button
            key={folder.id}
            role="option"
            aria-selected={selection.folderId === folder.id}
            onClick={() => onFolderSelect(folder.id)}
            className={`
              w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-sm
              ${selection.folderId === folder.id
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm">📁</span>
              <span className="font-medium">{folder.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{folder.count}</span>
          </button>
        ))}
      </div>
      
      {/* New Folder CTA */}
      <div className="mt-4 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          disabled
          className="w-full h-8 text-xs cursor-not-allowed opacity-50"
        >
          + New Folder
        </Button>
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Coming soon
        </p>
      </div>
    </div>
  )
}

function MessagesPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-muted mb-4 flex items-center justify-center">
        <span className="text-lg">💬</span>
      </div>
      <h3 className="text-sm font-medium text-foreground mb-2">Messages</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
        Messages and conversations will appear here. This feature is coming soon.
      </p>
    </div>
  )
}

function TrashPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-muted mb-4 flex items-center justify-center">
        <span className="text-lg">🗑️</span>
      </div>
      <h3 className="text-sm font-medium text-foreground mb-2">Trash</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
        Deleted items will appear here. Click to restore or permanently delete.
      </p>
    </div>
  )
}