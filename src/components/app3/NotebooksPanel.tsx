'use client'

import { ReactNode, useRef, useEffect, KeyboardEvent } from 'react'
import { FileText, BookOpen } from 'lucide-react'
import { useNotebooksList, useRenameNotebook, useDeleteNotebook } from '@/hooks/useNotebooks'
import type { AppSelection } from './types'

interface NotebooksPanelProps {
  children?: ReactNode
  className?: string
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void // For mobile navigation to pane 2
}

export function NotebooksPanel({ 
  children, 
  className = '',
  selection,
  onSelectionChange,
  onMobileAdvance
}: NotebooksPanelProps) {
  
  return (
    <div 
      className={`flex flex-col bg-bg-secondary border-r border-border-dark ${className}`}
      role="navigation"
      aria-label="Notebooks and Modes"
    >
      {children || (
        <DefaultNotebooksContent 
          selection={selection}
          onSelectionChange={onSelectionChange}
          onMobileAdvance={onMobileAdvance}
        />
      )}
    </div>
  )
}

interface DefaultNotebooksContentProps {
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void
}

function DefaultNotebooksContent({ selection, onSelectionChange, onMobileAdvance }: DefaultNotebooksContentProps) {
  const handleTrashSelect = () => {
    // Trash is now a special folder, not a mode
    onSelectionChange({ mode: 'notes', folderId: 'trash', fileId: null })
    onMobileAdvance?.() // Auto-advance to pane 2 on mobile
  }

  const handleNotebookSelect = (folderId: string | null) => {
    onSelectionChange({ mode: 'notes', folderId, fileId: null })
    onMobileAdvance?.() // Auto-advance to pane 2 on mobile
  }



  return (
    <div className="flex flex-col h-full">
      {/* Header toolbar */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-border-dark bg-bg-secondary">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-primary">Notes</h2>
          <button
            onClick={() => alert('Folder creation will be implemented soon!')}
            className="px-3 py-1 text-sm font-medium text-accent-blue hover:bg-bg-active rounded transition-colors flex items-center gap-1"
            title="Create new folder"
          >
            <span className="text-xs">+</span>
            New Folder
          </button>
        </div>
      </header>
      
      
      {/* Notebooks list */}
      <div 
        id="folders-content"
        className="flex-1 overflow-auto"
        role="tabpanel"
        aria-labelledby="folders-tab"
      >
        <NotebooksList 
          selection={selection}
          onNotebookSelect={handleNotebookSelect}
          onTrashSelect={handleTrashSelect}
        />
      </div>
    </div>
  )
}

interface NotebooksListProps {
  selection: AppSelection
  onNotebookSelect: (folderId: string | null) => void
  onTrashSelect: () => void
}

function NotebooksList({ selection, onNotebookSelect, onTrashSelect }: NotebooksListProps) {
  const { data: folders = [], isLoading, error } = useNotebooksList()
  const renameNotebook = useRenameNotebook()
  const deleteNotebook = useDeleteNotebook()
  
  const listboxRef = useRef<HTMLDivElement>(null)
  
  // Check feature flag - default to true if not set
  const isFeatureEnabled = process.env.NEXT_PUBLIC_FEATURE_FOLDERS !== 'false'


  const handleRenameNotebook = (folderId: string, currentName: string) => {
    const name = prompt('Enter new folder name:', currentName)
    if (name && name.trim() && name.trim() !== currentName) {
      renameNotebook.mutate({ id: folderId, name: name.trim() })
    }
  }

  const handleDeleteNotebook = (folderId: string, folderName: string) => {
    const confirmed = confirm(`Are you sure you want to delete "${folderName}"? Files will be moved to All Notes.`)
    if (confirmed) {
      deleteNotebook.mutate(folderId)
    }
  }

  // Edge case: Validate current selection against available folders
  useEffect(() => {
    if (isFeatureEnabled && selection.folderId && selection.folderId !== 'all' && !isLoading) {
      const folderExists = folders.some(f => f.id === selection.folderId)
      if (!folderExists) {
        // Invalid folder selection, falling back to All Notes
        onNotebookSelect(null)
        return
      }
    }
  }, [isFeatureEnabled, selection.folderId, folders, isLoading, onNotebookSelect])

  const allNotebooks = [
    { id: null, name: 'All Notes', file_count: 0 }, 
    ...folders.map(f => ({ id: f.id, name: f.name, file_count: 0 })), // file_count not available in useNotebooksList
    { id: 'trash', name: 'Trash', file_count: 0 } // Add trash to the list for keyboard navigation
  ]
  
  // Find current selected index
  const selectedIndex = allNotebooks.findIndex(folder => folder.id === selection.folderId)
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 0

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { key } = e
    
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      e.preventDefault()
      const direction = key === 'ArrowDown' ? 1 : -1
      const newIndex = Math.max(0, Math.min(allNotebooks.length - 1, currentIndex + direction))
      const newBookOpen = allNotebooks[newIndex]
      
      // Handle special case for trash
      if (newBookOpen.id === 'trash') {
        onTrashSelect()
      } else {
        onNotebookSelect(newBookOpen.id)
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
      const firstBookOpen = allNotebooks[0]
      if (firstBookOpen.id === 'trash') {
        onTrashSelect()
      } else {
        onNotebookSelect(firstBookOpen.id)
      }
      const items = listboxRef.current?.querySelectorAll('[role="option"]')
      if (items && items[0]) {
        ;(items[0] as HTMLElement).focus()
      }
    } else if (key === 'End') {
      e.preventDefault()
      const lastBookOpen = allNotebooks[allNotebooks.length - 1]
      if (lastBookOpen.id === 'trash') {
        onTrashSelect()
      } else {
        onNotebookSelect(lastBookOpen.id)
      }
      const items = listboxRef.current?.querySelectorAll('[role="option"]')
      if (items && items[allNotebooks.length - 1]) {
        ;(items[allNotebooks.length - 1] as HTMLElement).focus()
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
    // Only show All Notes when feature is disabled
    return (
      <div className="p-3">
        <button
          onClick={() => onNotebookSelect(null)}
          className="w-full flex items-center gap-3 p-2 rounded text-left transition-colors text-sm bg-bg-primary text-text-primary hover:bg-bg-active"
        >
          <FileText className="h-4 w-4 text-text-secondary" />
          <span className="font-medium">All Notes</span>
        </button>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="p-3">
        <div className="space-y-1">
          {/* All Notes button */}
          <button
            onClick={() => onNotebookSelect(null)}
            className="w-full flex items-center gap-3 p-2 rounded text-left transition-colors text-sm bg-bg-primary text-text-primary hover:bg-bg-active"
          >
            <FileText className="h-4 w-4 text-text-secondary" />
            <span className="font-medium">All Notes</span>
          </button>
          
          {/* Loading skeleton for folders */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full flex items-center gap-3 p-2">
              <BookOpen className="h-4 w-4 text-text-secondary" />
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
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
          {/* All Notes button - always available */}
          <button
            onClick={() => onNotebookSelect(null)}
            className="w-full flex items-center gap-3 p-2 rounded text-left transition-colors text-sm bg-bg-primary text-text-primary hover:bg-bg-active"
          >
            <FileText className="h-4 w-4 text-text-secondary" />
            <span className="font-medium">All Notes</span>
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
        <button
          id="folder-all"
          role="option"
          aria-selected={selection.folderId === null}
          onClick={() => onNotebookSelect(null)}
          tabIndex={-1}
          className={`
            w-full flex items-center gap-3 p-2 rounded text-left transition-colors text-sm focus:outline-none focus:ring-1 focus:ring-blue-400
            ${selection.folderId === null
              ? 'bg-bg-active text-accent-blue'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700'
            }
          `}
        >
          <svg className={`w-4 h-4 ${selection.folderId === null ? 'text-blue-500 dark:text-text-secondary' : 'text-gray-500 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium">All Notes</span>
        </button>

        {/* Individual folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="group relative"
          >
            <button
              id={`folder-${folder.id}`}
              role="option"
              aria-selected={selection.folderId === folder.id}
              onClick={() => onNotebookSelect(folder.id)}
              tabIndex={-1}
              className={`
                w-full flex items-center gap-3 p-2 rounded text-left transition-colors text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 pr-16
                ${selection.folderId === folder.id
                  ? 'bg-bg-active text-accent-blue'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <svg className={`w-4 h-4 ${selection.folderId === folder.id ? 'text-blue-500 dark:text-text-secondary' : 'text-gray-500 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="font-medium">{folder.name}</span>
            </button>
            
            {/* Context menu for folder actions */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRenameNotebook(folder.id, folder.name)
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
                  handleDeleteNotebook(folder.id, folder.name)
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-gray-500 dark:text-text-secondary hover:text-red-600 dark:hover:text-red-400"
                title="Delete folder"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
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
            w-full flex items-center gap-3 p-2 rounded text-left transition-colors text-sm focus:outline-none focus:ring-1 focus:ring-blue-400
            ${selection.folderId === 'trash'
              ? 'bg-bg-active text-accent-blue'
              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-gray-100 hover:bg-blue-50 dark:hover:bg-gray-700'
            }
          `}
        >
          <svg className={`w-4 h-4 ${selection.folderId === 'trash' ? 'text-blue-500 dark:text-text-secondary' : 'text-gray-500 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="font-medium">Trash</span>
        </button>
        </div>
      
      </div>
    </div>
  )
}

