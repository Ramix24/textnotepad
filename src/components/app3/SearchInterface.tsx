'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Hash } from 'lucide-react'
import { useFilesList } from '@/hooks/useFiles'
import { UserFile } from '@/types/user-files.types'
import type { AppSelection } from './types'

interface SearchInterfaceProps {
  className?: string
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void
}


export function SearchInterface({ 
  className = '', 
  selection,
  onSelectionChange,
  onMobileAdvance
}: SearchInterfaceProps) {
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const { data: allFiles = [] } = useFilesList()

  // Use searchQuery from selection (controlled by header)
  const searchQuery = selection.searchQuery || ''

  // Reset selection when entering search mode
  useEffect(() => {
    if (selection.mode === 'search') {
      setSelectedResultIndex(0)
    }
  }, [selection.mode])

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedResultIndex(0)
  }, [searchQuery])

  // File selection handler
  const handleFileSelect = useCallback((file: UserFile) => {
    onSelectionChange({
      mode: 'notes',
      fileId: file.id,
      folderId: null
    })
    onMobileAdvance?.()
  }, [onSelectionChange, onMobileAdvance])

  // Filter and search files (simplified - no filters)
  const filteredFiles = useMemo(() => {
    // Only show results when there's an actual search query
    if (!searchQuery.trim()) {
      return [] // Show empty state when no search query
    }
    
    // Only show non-deleted files
    const activeFiles = allFiles.filter(f => !f.deleted_at)
    
    // Apply search query
    const query = searchQuery.toLowerCase()
    return activeFiles.filter(file => 
      file.name.toLowerCase().includes(query) ||
      file.content.toLowerCase().includes(query)
    )
  }, [allFiles, searchQuery])

  // Scroll selected item into view
  useEffect(() => {
    if (filteredFiles.length > 0 && selectedResultIndex >= 0) {
      const selectedElement = document.querySelector(`[data-result-index="${selectedResultIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }
  }, [selectedResultIndex, filteredFiles.length])

  // Keyboard navigation for search results
  useEffect(() => {
    if (selection.mode !== 'search' || !searchQuery.trim()) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is not in an input field (except our search input)
      const activeElement = document.activeElement
      const isInSearchInput = activeElement?.getAttribute?.('placeholder') === 'Search notes...'
      const isInOtherInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'
      
      if (isInOtherInput && !isInSearchInput) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedResultIndex(prev => 
            Math.min(prev + 1, filteredFiles.length - 1)
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedResultIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredFiles[selectedResultIndex]) {
            handleFileSelect(filteredFiles[selectedResultIndex])
          }
          break
        case 'Escape':
          // Let the header search handle escape to clear search
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selection.mode, searchQuery, selectedResultIndex, filteredFiles, handleFileSelect])

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  const getFilePreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  return (
    <div className={`flex flex-col h-full bg-bg-secondary ${className}`}>
      {/* Search Header - Simplified */}
      <div className="flex-shrink-0 p-6 border-b border-border-dark bg-bg-secondary">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium text-text-primary">
            Search Results
          </div>
          <div className="text-sm text-text-secondary">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'result' : 'results'}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-auto">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-secondary mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {searchQuery.trim() ? 'No results found' : 'Search your notes'}
            </h3>
            <p className="text-text-secondary max-w-md leading-relaxed">
              {searchQuery.trim() 
                ? `No notes found matching "${searchQuery}". Try different keywords or check your spelling.`
                : 'Type in the search box in the header to find notes by title or content.'
              }
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredFiles.map((file, index) => {
              const isSelected = index === selectedResultIndex
              return (
                <div
                  key={file.id}
                  data-result-index={index}
                  onClick={() => handleFileSelect(file)}
                  className={`group p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-accent-blue bg-accent-blue/10 ring-2 ring-accent-blue/20' 
                      : 'border-border-dark bg-bg-primary hover:bg-bg-secondary hover:border-border-light'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-medium transition-colors ${
                      isSelected ? 'text-accent-blue' : 'text-text-primary group-hover:text-accent-blue'
                    }`}>
                      {highlightMatch(file.name, searchQuery)}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span>{file.word_count} words</span>
                      <span>•</span>
                      <span>{new Date(file.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {highlightMatch(getFilePreview(file.content), searchQuery)}
                  </p>

                  {/* File tags/indicators */}
                  <div className="flex items-center gap-2 mt-3">
                    {file.content.includes('- [ ]') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        <Hash className="w-3 h-3" />
                        Tasks
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Search Tips Footer */}
      {searchQuery.trim() === '' && (
        <div className="flex-shrink-0 p-4 border-t border-border-dark bg-bg-secondary">
          <div className="text-xs text-text-secondary space-y-1">
            <p><strong>Search tips:</strong></p>
            <p>• Use the search bar in the header to find notes</p>
            <p>• Search by note title or content</p>
            <p>• Use ↑/↓ arrow keys to navigate results</p>
            <p>• Press Enter to open selected note</p>
            <p>• Click any result to open the note</p>
          </div>
        </div>
      )}
    </div>
  )
}