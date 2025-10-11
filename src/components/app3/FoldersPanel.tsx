'use client'

import { ReactNode, useRef, useEffect, KeyboardEvent } from 'react'
import { FileText, BookOpen, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useFoldersList, useCreateFolder, useRenameFolder, useDeleteFolder } from '@/hooks/useFolders'
import { formatVersion } from '@/lib/version'
import type { AppSelection } from './types'

interface FoldersPanelProps {
  children?: ReactNode
  className?: string
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void // For mobile navigation to pane 2
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
}

export function FoldersPanel({ 
  children, 
  className = '',
  selection,
  onSelectionChange,
  onMobileAdvance,
  isCollapsed = false,
  onToggleCollapsed
}: FoldersPanelProps) {
  
  return (
    <div 
      className={`flex flex-col h-full bg-bg-secondary border-r border-border-dark ${className}`}
      role="navigation"
      aria-label="Notebooks and Modes"
    >
      {children || (
        <DefaultFoldersContent 
          selection={selection}
          onSelectionChange={onSelectionChange}
          onMobileAdvance={onMobileAdvance}
          isCollapsed={isCollapsed}
          onToggleCollapsed={onToggleCollapsed}
        />
      )}
    </div>
  )
}

interface DefaultFoldersContentProps {
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
}

function DefaultFoldersContent({ selection, onSelectionChange, onMobileAdvance, isCollapsed = false, onToggleCollapsed }: DefaultFoldersContentProps) {
  const createFolder = useCreateFolder()
  
  const handleInboxSelect = () => {
    // INBOX is a special folder for uncategorized notes
    onSelectionChange({ mode: 'notes', folderId: 'inbox', fileId: null })
    onMobileAdvance?.() // Auto-advance to pane 2 on mobile
  }

  const handleTrashSelect = () => {
    // Trash is now a special folder, not a mode
    onSelectionChange({ mode: 'notes', folderId: 'trash', fileId: null })
    onMobileAdvance?.() // Auto-advance to pane 2 on mobile
  }

  const handleFolderSelect = (folderId: string | null) => {
    onSelectionChange({ mode: 'notes', folderId, fileId: null })
    onMobileAdvance?.() // Auto-advance to pane 2 on mobile
  }
  

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:')
    if (name && name.trim()) {
      createFolder.mutate({ name: name.trim() })
    }
  }



  return (
    <div className="flex flex-col h-full">
      {/* Header toolbar */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-border-dark bg-bg-secondary">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <button
              onClick={handleCreateFolder}
              disabled={createFolder.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-accent-blue text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-colors"
              title="Create new folder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">{createFolder.isPending ? 'Creating...' : 'Folder'}</span>
            </button>
          )}
          
          {/* Toggle button */}
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-active rounded transition-colors ml-auto"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </header>
      
      
      {/* Notebooks list */}
      <div 
        id="folders-content"
        className="flex-1 overflow-auto"
        role="tabpanel"
        aria-labelledby="folders-tab"
      >
        <FoldersList 
          selection={selection}
          onInboxSelect={handleInboxSelect}
          onFolderSelect={handleFolderSelect}
          onTrashSelect={handleTrashSelect}
          onAllNotesSelect={() => {
            onSelectionChange({ mode: 'search', folderId: null, fileId: null, searchQuery: '' })
            onMobileAdvance?.()
          }}
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  )
}

interface FoldersListProps {
  selection: AppSelection
  onInboxSelect: () => void
  onFolderSelect: (folderId: string | null) => void
  onTrashSelect: () => void
  onAllNotesSelect: () => void
  isCollapsed?: boolean
}

function FoldersList({ selection, onInboxSelect, onFolderSelect, onTrashSelect, onAllNotesSelect, isCollapsed = false }: FoldersListProps) {
  const { data: folders = [], isLoading, error } = useFoldersList()
  const renameFolder = useRenameFolder()
  const deleteFolder = useDeleteFolder()
  
  const listboxRef = useRef<HTMLDivElement>(null)
  
  // Check feature flag - default to true if not set
  const isFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_FOLDERS !== 'false'


  const handleRenameFolder = (folderId: string, currentName: string) => {
    const name = prompt('Enter new folder name:', currentName)
    if (name && name.trim() && name.trim() !== currentName) {
      renameFolder.mutate({ id: folderId, name: name.trim() })
    }
  }

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    const confirmed = confirm(`Are you sure you want to delete "${folderName}"? Files will be moved to All Notes.`)
    if (confirmed) {
      deleteFolder.mutate(folderId)
    }
  }

  // Edge case: Validate current selection against available folders
  useEffect(() => {
    if (isFeatureEnabled && selection.folderId && selection.folderId !== 'all' && selection.folderId !== 'trash' && selection.folderId !== 'inbox' && !isLoading) {
      const folderExists = folders.some(f => f.id === selection.folderId)
      if (!folderExists) {
        // Invalid folder selection, falling back to All Notes
        onFolderSelect(null)
        return
      }
    }
  }, [isFeatureEnabled, selection.folderId, folders, isLoading, onFolderSelect])

  // Sort folders alphabetically by name (A-Z)
  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name))
  
  const allFolders = [
    { id: 'inbox', name: 'INBOX', file_count: 0 }, // Special INBOX folder always first
    { id: null, name: 'All Notes', file_count: 0 }, 
    ...sortedFolders.map(f => ({ id: f.id, name: f.name, file_count: 0 })), // file_count not available in useFoldersList
    { id: 'trash', name: 'Trash', file_count: 0 } // Add trash to the list for keyboard navigation
  ]
  
  // Find current selected index
  const selectedIndex = allFolders.findIndex(folder => folder.id === selection.folderId)
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 0

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { key } = e
    
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      e.preventDefault()
      const direction = key === 'ArrowDown' ? 1 : -1
      const newIndex = Math.max(0, Math.min(allFolders.length - 1, currentIndex + direction))
      const newBookOpen = allFolders[newIndex]
      
      // Handle special cases
      if (newBookOpen.id === 'trash') {
        onTrashSelect()
      } else if (newBookOpen.id === 'inbox') {
        onInboxSelect()
      } else {
        onFolderSelect(newBookOpen.id)
      }
      
      // Focus the newly selected item
      const items = listboxRef.current?.querySelectorAll('[role="option"]')
      if (items && items[newIndex]) {
        ;(items[newIndex] as HTMLElement).focus()
      }
    } else if (key === 'Enter' || key === ' ') {
      e.preventDefault()
      // Enter/Space is already handled by the button click
    } else if (key === 'Home') {
      e.preventDefault()
      const firstBookOpen = allFolders[0]
      if (firstBookOpen.id === 'trash') {
        onTrashSelect()
      } else if (firstBookOpen.id === 'inbox') {
        onInboxSelect()
      } else {
        onFolderSelect(firstBookOpen.id)
      }
      const items = listboxRef.current?.querySelectorAll('[role="option"]')
      if (items && items[0]) {
        ;(items[0] as HTMLElement).focus()
      }
    } else if (key === 'End') {
      e.preventDefault()
      const lastBookOpen = allFolders[allFolders.length - 1]
      if (lastBookOpen.id === 'trash') {
        onTrashSelect()
      } else if (lastBookOpen.id === 'inbox') {
        onInboxSelect()
      } else {
        onFolderSelect(lastBookOpen.id)
      }
      const items = listboxRef.current?.querySelectorAll('[role="option"]')
      if (items && items[allFolders.length - 1]) {
        ;(items[allFolders.length - 1] as HTMLElement).focus()
      }
    }
  }

  // Focus management
  useEffect(() => {
    if (isFeatureEnabled && listboxRef.current && selectedIndex >= 0) {
      const items = listboxRef.current.querySelectorAll('[role="option"]')
      if (items[selectedIndex]) {
        ;(items[selectedIndex] as HTMLElement).focus()
      }
    }
  }, [isFeatureEnabled, selectedIndex])

  // Handle loading state
  if (!isFeatureEnabled) {
    // Show INBOX and All Notes when feature is disabled
    return (
      <div className="p-3">
        <div className="space-y-1">
          <button
            onClick={onInboxSelect}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded-lg text-left transition-colors text-sm bg-bg-primary text-text-primary hover:bg-bg-active`}
            title={isCollapsed ? "INBOX" : undefined}
          >
            <Inbox className="h-4 w-4 text-text-secondary" />
            {!isCollapsed && <span className="font-medium">INBOX</span>}
          </button>
          <button
            onClick={onAllNotesSelect}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded-lg text-left transition-colors text-sm bg-bg-primary text-text-primary hover:bg-bg-active`}
            title={isCollapsed ? "All Notes" : undefined}
          >
            <FileText className="h-4 w-4 text-text-secondary" />
            {!isCollapsed && <span className="font-medium">All Notes</span>}
          </button>
        </div>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="p-3">
        <div className="space-y-1">
          {/* INBOX button */}
          <button
            onClick={onInboxSelect}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded-lg text-left transition-colors text-sm bg-bg-primary text-text-primary hover:bg-bg-active`}
            title={isCollapsed ? "INBOX" : undefined}
          >
            <Inbox className="h-4 w-4 text-text-secondary" />
            {!isCollapsed && <span className="font-medium transition-opacity duration-300">INBOX</span>}
          </button>
          
          {/* All Notes button */}
          <button
            onClick={onAllNotesSelect}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded-lg text-left transition-colors text-sm bg-bg-primary text-text-primary hover:bg-bg-active`}
            title={isCollapsed ? "All Notes" : undefined}
          >
            <FileText className="h-4 w-4 text-text-secondary" />
            {!isCollapsed && <span className="font-medium transition-opacity duration-300">All Notes</span>}
          </button>
          
          {/* Loading skeleton for folders */}
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'}`}>
              <BookOpen className="h-4 w-4 text-text-secondary" />
              {!isCollapsed && <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-3">
        <div className="space-y-1">
          {/* INBOX button - always available */}
          <button
            onClick={onInboxSelect}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded-lg text-left transition-colors text-sm bg-bg-primary text-text-primary hover:bg-bg-active`}
            title={isCollapsed ? "INBOX" : undefined}
          >
            <Inbox className="h-4 w-4 text-text-secondary" />
            {!isCollapsed && <span className="font-medium transition-opacity duration-300">INBOX</span>}
          </button>
          
          {/* All Notes button - always available */}
          <button
            onClick={onAllNotesSelect}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded-lg text-left transition-colors text-sm bg-bg-primary text-text-primary hover:bg-bg-active`}
            title={isCollapsed ? "All Notes" : undefined}
          >
            <FileText className="h-4 w-4 text-text-secondary" />
            {!isCollapsed && <span className="font-medium transition-opacity duration-300">All Notes</span>}
          </button>
        </div>
        
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded text-xs text-red-600 dark:text-red-400">
          Failed to load folders
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      
      <div className="p-3 flex-1">
        {/* All Notes option */}
        <div 
        ref={listboxRef}
        role="listbox"
        className="space-y-1"
        onKeyDown={handleKeyDown}
        aria-label="Notebooks"
        aria-activedescendant={`folder-${selection.folderId || 'all'}`}
        tabIndex={0}
      >
        {/* INBOX - Special folder for uncategorized notes */}
        <button
          id="folder-inbox"
          role="option"
          aria-selected={selection.folderId === 'inbox'}
          onClick={onInboxSelect}
          tabIndex={-1}
          className={`
            w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded-lg text-left transition-colors text-sm focus:outline-none focus:ring-1 focus:ring-blue-400
            ${selection.folderId === 'inbox'
              ? 'bg-accent-blue text-white'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700'
            }
          `}
          title={isCollapsed ? "INBOX" : undefined}
        >
          <Inbox className={`w-4 h-4 ${selection.folderId === 'inbox' ? 'text-white' : 'text-gray-500 dark:text-gray-500'}`} />
          {!isCollapsed && <span className="font-medium transition-opacity duration-300">INBOX</span>}
        </button>

        <button
          id="folder-all"
          role="option"
          aria-selected={selection.folderId === null && (selection.mode === 'notes' || selection.mode === 'search')}
          onClick={onAllNotesSelect}
          tabIndex={-1}
          className={`
            w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded-lg text-left transition-colors text-sm focus:outline-none focus:ring-1 focus:ring-blue-400
            ${selection.folderId === null && (selection.mode === 'notes' || selection.mode === 'search')
              ? 'bg-accent-blue text-white'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700'
            }
          `}
          title={isCollapsed ? "All Notes" : undefined}
        >
          <svg className={`w-4 h-4 ${selection.folderId === null && (selection.mode === 'notes' || selection.mode === 'search') ? 'text-white' : 'text-gray-500 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {!isCollapsed && <span className="font-medium">All Notes</span>}
        </button>

        {/* Individual folders */}
        {sortedFolders.map((folder) => (
          <div
            key={folder.id}
            className="group relative"
          >
            <button
              id={`folder-${folder.id}`}
              role="option"
              aria-selected={selection.folderId === folder.id}
              onClick={() => onFolderSelect(folder.id)}
              tabIndex={-1}
              className={`
                w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2 pr-16'} rounded-lg text-left transition-colors text-sm focus:outline-none focus:ring-1 focus:ring-blue-400
                ${selection.folderId === folder.id
                  ? 'bg-accent-blue text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700'
                }
              `}
              title={isCollapsed ? folder.name : undefined}
            >
              <svg className={`w-4 h-4 ${selection.folderId === folder.id ? 'text-white' : 'text-gray-500 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {!isCollapsed && <span className="font-medium transition-opacity duration-300">{folder.name}</span>}
            </button>
            
            {/* Context menu for folder actions - hide when collapsed */}
            {!isCollapsed && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRenameFolder(folder.id, folder.name)
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-text-secondary hover:text-gray-700 dark:hover:text-gray-200"
                title="Rename folder"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteFolder(folder.id, folder.name)
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-gray-500 dark:text-text-secondary hover:text-red-600 dark:hover:text-red-400"
                title="Delete folder"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            )}
          </div>
        ))}

        {/* Trash folder - at the bottom */}
        <button
          id="folder-trash"
          role="option"
          aria-selected={selection.folderId === 'trash'}
          onClick={onTrashSelect}
          tabIndex={-1}
          className={`
            w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'} rounded text-left transition-colors text-sm focus:outline-none focus:ring-1 focus:ring-blue-400
            ${selection.folderId === 'trash'
              ? 'bg-accent-blue text-white'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700'
            }
          `}
          title={isCollapsed ? "Trash" : undefined}
        >
          <svg className={`w-4 h-4 ${selection.folderId === 'trash' ? 'text-white' : 'text-gray-500 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {!isCollapsed && <span className="font-medium transition-opacity duration-300">Trash</span>}
        </button>
        </div>
      
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 p-2 border-t border-border-dark bg-bg-secondary min-h-[40px]">
        <div className="flex items-center justify-center text-xs text-text-secondary h-full">
          <span className="text-xs text-text-secondary font-mono">{formatVersion()}</span>
        </div>
      </footer>
    </div>
  )
}

