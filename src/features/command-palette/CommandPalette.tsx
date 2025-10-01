'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Fuse from 'fuse.js'
import { CommandContext, CommandAction, registerDefaultActions } from './actions'
import { CommandPaletteState, CommandPaletteSection } from './useCommandPalette'
import { UserFile } from '@/types/user-files.types'
import { UserFolder } from '@/types/folders.types'
import { 
  FileText, 
  FolderOpen, 
  Search, 
  Loader2, 
  FileTextIcon as FileIcon,
  FolderIcon,
  Zap
} from 'lucide-react'

interface CommandPaletteProps {
  context: CommandContext
  state: CommandPaletteState
  onClose: () => void
  onSelectAction: (action: CommandAction) => void
  onSelectNote: (note: UserFile) => void
  onSelectFolder: (folder: UserFolder) => void
  onExecuteWithArg?: (action: CommandAction, arg: unknown) => void
  onSetQuery: (query: string) => void
  onSetActiveIndex: (index: number) => void
}

interface SearchResults {
  actions: CommandAction[]
  notes: UserFile[]
  folders: UserFolder[]
  searchNotes: { id: string; title: string; snippet?: string }[]
}

interface Section {
  key: CommandPaletteSection | 'search-notes'
  title: string
  items: (CommandAction | UserFile | UserFolder | { id: string; title: string; snippet?: string })[]
  icon: React.ComponentType<{ className?: string }>
}

export function CommandPalette({
  context,
  state,
  onClose,
  onSelectAction,
  onSelectNote,
  onSelectFolder,
  onExecuteWithArg,
  onSetQuery,
  onSetActiveIndex
}: CommandPaletteProps) {
  const [searchNotesResults, setSearchNotesResults] = useState<{ id: string; title: string; snippet?: string }[]>([])
  const [isSearchingNotes, setIsSearchingNotes] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const currentState = context.getState()
  const { files, folders } = currentState

  // Get available actions
  const availableActions = useMemo(() => {
    return registerDefaultActions(context)
  }, [context])

  // Set up fuzzy search instances
  const actionsFuse = useMemo(() => {
    return new Fuse(availableActions, {
      keys: ['label', 'keywords'],
      threshold: 0.3,
      includeScore: true
    })
  }, [availableActions])

  const notesFuse = useMemo(() => {
    return new Fuse(files, {
      keys: ['name'],
      threshold: 0.3,
      includeScore: true
    })
  }, [files])

  const foldersFuse = useMemo(() => {
    return new Fuse(folders, {
      keys: ['name'],
      threshold: 0.3,
      includeScore: true
    })
  }, [folders])

  // Debounced search for async notes
  useEffect(() => {
    if (!state.query.trim()) {
      setSearchNotesResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingNotes(true)
      try {
        const results = await context.api.searchNotes(state.query)
        setSearchNotesResults(results)
      } catch {
        // Silently handle search errors in production
        setSearchNotesResults([])
      } finally {
        setIsSearchingNotes(false)
      }
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [state.query, context.api])

  // Search and filter results
  const searchResults: SearchResults = useMemo(() => {
    if (!state.query.trim()) {
      const actions = availableActions.slice(0, 8)
      console.log('🎯 NO QUERY - actions order:', actions.map(a => ({ id: a.id, label: a.label })))
      return {
        actions, // Show all actions when no query
        notes: files.slice(0, 10), // Show recent notes
        folders: folders.slice(0, 10), // Show all folders
        searchNotes: []
      }
    }

    const actionResults = actionsFuse.search(state.query).map(result => result.item)
    const noteResults = notesFuse.search(state.query).map(result => result.item)
    const folderResults = foldersFuse.search(state.query).map(result => result.item)
    
    console.log('🎯 SEARCH QUERY:', state.query)
    console.log('🎯 SEARCH RESULTS - actions order:', actionResults.map(a => ({ id: a.id, label: a.label })))

    return {
      actions: actionResults,
      notes: noteResults,
      folders: folderResults,
      searchNotes: searchNotesResults
    }
  }, [state.query, actionsFuse, notesFuse, foldersFuse, files, folders, searchNotesResults, availableActions])

  // Build sections for display
  const sections: Section[] = useMemo(() => {
    const secs: Section[] = []

    if (state.step === 'input-arg') {
      // Show appropriate options based on arg mode
      if (state.argMode === 'folder') {
        secs.push({
          key: 'folders',
          title: 'Select Folder',
          items: searchResults.folders,
          icon: FolderIcon
        })
      } else if (state.argMode === 'text') {
        // For text input, don't show any search results - just accept text input
        // The user will type directly and press Enter
      }
      return secs
    }

    // Normal search mode
    if (searchResults.actions.length > 0) {
      secs.push({
        key: 'actions',
        title: 'Actions',
        items: searchResults.actions,
        icon: Zap
      })
    }

    if (searchResults.notes.length > 0) {
      secs.push({
        key: 'notes',
        title: 'Notes',
        items: searchResults.notes,
        icon: FileIcon
      })
    }

    if (searchResults.folders.length > 0) {
      secs.push({
        key: 'folders',
        title: 'Folders',
        items: searchResults.folders,
        icon: FolderIcon
      })
    }

    if (searchResults.searchNotes.length > 0) {
      secs.push({
        key: 'search-notes',
        title: 'Search Results',
        items: searchResults.searchNotes,
        icon: Search
      })
    }

    return secs
  }, [searchResults, state.step, state.argMode])

  // Calculate total items and active item
  const totalItems = sections.reduce((total, section) => total + section.items.length, 0)
  const activeIndex = Math.min(state.activeIndex, totalItems - 1)

  // Get active item details
  const getActiveItem = () => {
    let currentIndex = 0
    for (const section of sections) {
      if (activeIndex < currentIndex + section.items.length) {
        const itemIndex = activeIndex - currentIndex
        return {
          section: section.key,
          item: section.items[itemIndex],
          itemIndex
        }
      }
      currentIndex += section.items.length
    }
    return null
  }

  // Handle item selection
  const handleSelect = () => {
    console.log('🎯 HANDLE SELECT - step:', state.step, 'query:', state.query)
    console.log('🎯 HANDLE SELECT - sections length:', sections.length)
    console.log('🎯 HANDLE SELECT - activeIndex:', state.activeIndex)
    
    // Special handling for text input mode
    if (state.step === 'input-arg' && state.argMode === 'text' && state.pendingAction && onExecuteWithArg) {
      console.log('🎯 HANDLE SELECT - text input mode, pendingAction:', state.pendingAction?.id)
      // Use the query (what user typed) as the argument
      onExecuteWithArg(state.pendingAction, state.query)
      onClose()
      return
    }

    // SMART DEFAULT: If user typed a query but no search results, create a note with that name
    if (state.step === 'search' && state.query.trim() && sections.length === 0) {
      console.log('🎯 HANDLE SELECT - smart default: creating note with name:', state.query)
      console.log('🎯 SMART DEFAULT - calling context.api.createNote with args:', undefined, state.query)
      // Directly call the createNote API with the user's typed name
      context.api.createNote(undefined, state.query).then((result) => {
        console.log('🎯 SMART DEFAULT - createNote success:', result)
        onClose()
      }).catch((error) => {
        console.error('🎯 SMART DEFAULT - createNote failed:', error)
      })
      return
    }

    const activeItem = getActiveItem()
    console.log('🎯 HANDLE SELECT - activeItem:', activeItem)
    if (!activeItem) {
      console.log('🎯 HANDLE SELECT - no active item, returning early')
      return
    }

    if (state.step === 'input-arg' && state.pendingAction && onExecuteWithArg) {
      console.log('🎯 HANDLE SELECT - arg input mode, pendingAction:', state.pendingAction?.id)
      onExecuteWithArg(state.pendingAction, activeItem.item)
      onClose()
      return
    }

    console.log('🎯 HANDLE SELECT - section:', activeItem.section, 'item:', activeItem.item)
    switch (activeItem.section) {
      case 'actions':
        onSelectAction(activeItem.item as CommandAction)
        break
      case 'notes':
      case 'search-notes':
        onSelectNote(activeItem.item as UserFile)
        onClose()
        break
      case 'folders':
        onSelectFolder(activeItem.item as UserFolder)
        onClose()
        break
    }
  }

  // Direct click handler that bypasses activeIndex state
  const handleDirectClick = (item: any, sectionKey: string, globalIndex: number) => {
    console.log('🎯 DIRECT CLICK - item:', item, 'section:', sectionKey, 'globalIndex:', globalIndex)
    
    if (state.step === 'input-arg' && state.pendingAction && onExecuteWithArg) {
      console.log('🎯 DIRECT CLICK - arg input mode, pendingAction:', state.pendingAction?.id)
      onExecuteWithArg(state.pendingAction, item)
      onClose()
      return
    }

    console.log('🎯 DIRECT CLICK - executing action for section:', sectionKey)
    switch (sectionKey) {
      case 'actions':
        onSelectAction(item as CommandAction)
        break
      case 'notes':
      case 'search-notes':
        onSelectNote(item as UserFile)
        onClose()
        break
      case 'folders':
        onSelectFolder(item as UserFolder)
        onClose()
        break
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isOpen) return

      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          handleSelect()
          break
        case 'ArrowDown':
          e.preventDefault()
          const nextIndex = Math.min(activeIndex + 1, totalItems - 1)
          onSetActiveIndex(nextIndex)
          break
        case 'ArrowUp':
          e.preventDefault()
          const prevIndex = Math.max(0, activeIndex - 1)
          onSetActiveIndex(prevIndex)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.isOpen, activeIndex, totalItems, handleSelect])

  // Focus management
  useEffect(() => {
    if (state.isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [state.isOpen])

  if (!state.isOpen) return null

  const placeholder = state.step === 'input-arg' 
    ? state.argMode === 'text' && state.pendingAction?.id === 'new-folder'
      ? 'Enter folder name...'
      : `Select ${state.argMode}...`
    : 'Type a command or search notes...'

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-xl">
        <div className="mx-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden">
          {/* Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={state.query}
              onChange={(e) => onSetQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full border-0 bg-transparent py-4 pl-12 pr-4 text-base outline-none placeholder:text-zinc-400 dark:text-white"
            />
            {isSearchingNotes && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-zinc-400" />
            )}
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-96 overflow-y-auto border-t border-zinc-200 dark:border-zinc-700">
            {sections.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">
                {state.query ? 'No matches. Try different keywords.' : 'Start typing to search...'}
              </div>
            ) : (
              <div role="listbox">
                {sections.map((section, sectionIndex) => (
                  <div key={section.key}>
                    {/* Section Header */}
                    <div className="sticky top-0 bg-white dark:bg-zinc-900 px-4 py-2 text-xs uppercase tracking-wide text-zinc-500 font-medium border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <section.icon className="h-3 w-3" />
                        {section.title}
                      </div>
                    </div>
                    
                    {/* Section Items */}
                    {section.items.map((item, itemIndex) => {
                      const globalIndex = sections.slice(0, sectionIndex).reduce((acc, s) => acc + s.items.length, 0) + itemIndex
                      const isActive = globalIndex === activeIndex
                      
                      return (
                        <div
                          key={item.id}
                          role="option"
                          aria-selected={isActive}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            isActive 
                              ? 'bg-zinc-100 dark:bg-zinc-800' 
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          }`}
                          onClick={() => {
                            console.log('🎯 CLICK - item clicked:', item, 'section:', section.key, 'globalIndex:', globalIndex)
                            onSetActiveIndex(globalIndex)
                            handleDirectClick(item, section.key, globalIndex)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {section.key === 'actions' && <Zap className="h-4 w-4 text-zinc-400 flex-shrink-0" />}
                            {section.key === 'notes' && <FileText className="h-4 w-4 text-zinc-400 flex-shrink-0" />}
                            {section.key === 'folders' && <FolderOpen className="h-4 w-4 text-zinc-400 flex-shrink-0" />}
                            {section.key === 'search-notes' && <Search className="h-4 w-4 text-zinc-400 flex-shrink-0" />}
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                {(item as any).label || (item as any).name || (item as any).title}
                              </div>
                              {((item as any).description || (item as any).snippet) && (
                                <div className="text-sm text-zinc-500 line-clamp-1 mt-0.5">
                                  {(item as any).description || (item as any).snippet}
                                </div>
                              )}
                            </div>
                            
                            {section.key === 'actions' && (
                              <div className="flex-shrink-0 text-xs text-zinc-400">
                                ⏎
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 px-4 py-2 text-xs text-zinc-500 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>⏎ Select</span>
              <span>⇥ Switch section</span>
            </div>
            <span>Esc Close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}