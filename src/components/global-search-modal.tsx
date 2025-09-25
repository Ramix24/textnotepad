'use client'

import * as React from 'react'
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch'
import { cn } from '@/lib/utils'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (fileId: string) => void
}

export function GlobalSearchModal({ isOpen, onClose, onFileSelect }: GlobalSearchModalProps) {
  const { searchQuery, setSearchQuery, searchResults, isSearching, hasResults, hasQuery } = useGlobalSearch()
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Reset selected index when results change
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [searchResults])

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (searchResults[selectedIndex]) {
            onFileSelect(searchResults[selectedIndex].file.id)
            onClose()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, searchResults, onClose, onFileSelect])

  // Focus search input when modal opens
  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Clear search when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
    }
  }, [isOpen, setSearchQuery])

  if (!isOpen) return null

  const handleResultClick = (result: SearchResult) => {
    onFileSelect(result.file.id)
    onClose()
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-x-4 top-[10vh] mx-auto max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-0 outline-none text-lg"
          />
          {isSearching && (
            <div className="ml-3 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {!hasQuery ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Search your notes</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Type to search by title or content</p>
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">No results found</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Try different keywords</p>
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((result, index) => (
                <div
                  key={result.file.id}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors",
                    index === selectedIndex
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {result.highlights.title ? 
                          highlightText(result.file.name, searchQuery) : 
                          result.file.name
                        }
                      </div>
                      {result.highlights.content.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {result.highlights.content.map((snippet, i) => (
                            <div key={i} className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {highlightText(snippet, searchQuery)}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        Modified {new Date(result.file.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-[10px] font-mono">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-[10px] font-mono">↵</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-[10px] font-mono">esc</kbd>
                <span>Close</span>
              </div>
            </div>
            {hasResults && (
              <span>{searchResults.length} result{searchResults.length === 1 ? '' : 's'}</span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}