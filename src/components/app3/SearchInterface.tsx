'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, FileText, Calendar, Hash } from 'lucide-react'
import { useFilesList } from '@/hooks/useFiles'
import { UserFile } from '@/types/user-files.types'
import type { AppSelection } from './types'

interface SearchInterfaceProps {
  className?: string
  selection: AppSelection
  onSelectionChange: (selection: Partial<AppSelection>) => void
  onMobileAdvance?: () => void
}

type SearchFilter = 'all' | 'notes' | 'tasks' | 'recent'

export function SearchInterface({ 
  className = '', 
  selection,
  onSelectionChange,
  onMobileAdvance
}: SearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const { data: allFiles = [] } = useFilesList()

  // Clear search when entering search mode
  useEffect(() => {
    if (selection.mode === 'search') {
      setSearchQuery('')
      setActiveFilter('all')
      setShowFilters(false)
    }
  }, [selection.mode])
  
  // Clear search when searchQuery is explicitly set to empty (for re-triggering search)
  useEffect(() => {
    if (selection.searchQuery === '') {
      setSearchQuery('')
      setActiveFilter('all')
      setShowFilters(false)
    }
  }, [selection.searchQuery])

  // Update selection when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      onSelectionChange({ searchQuery: searchQuery })
    }, 300) // Debounce search

    return () => clearTimeout(timer)
  }, [searchQuery, onSelectionChange])

  // Filter and search files
  const filteredFiles = useMemo(() => {
    // Only show non-deleted files
    const activeFiles = allFiles.filter(f => !f.deleted_at)
    
    // Apply search query
    let searchResults = activeFiles
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      searchResults = activeFiles.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.content.toLowerCase().includes(query)
      )
    }

    // Apply filters
    switch (activeFilter) {
      case 'tasks':
        return searchResults.filter(file => 
          file.content.includes('- [ ]') || file.content.includes('- [x]')
        )
      case 'recent':
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return searchResults.filter(file => 
          new Date(file.updated_at) > weekAgo
        )
      case 'notes':
      case 'all':
      default:
        return searchResults
    }
  }, [allFiles, searchQuery, activeFilter])

  const handleFileSelect = (file: UserFile) => {
    onSelectionChange({
      mode: 'notes',
      fileId: file.id,
      folderId: null
    })
    onMobileAdvance?.()
  }

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
    <div className={`flex flex-col h-full bg-bg-primary ${className}`}>
      {/* Search Header */}
      <div className="flex-shrink-0 p-6 border-b border-border-dark bg-bg-secondary">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all notes..."
              className="w-full pl-10 pr-4 py-3 bg-bg-primary border border-border-dark rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                showFilters ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-active'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            
            <div className="text-sm text-text-secondary">
              {filteredFiles.length} {filteredFiles.length === 1 ? 'result' : 'results'}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Notes', icon: FileText },
                { id: 'tasks', label: 'With Tasks', icon: Hash },
                { id: 'recent', label: 'Recent', icon: Calendar },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as SearchFilter)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-accent-blue text-white'
                      : 'bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-active border border-border-dark'
                  }`}
                >
                  <filter.icon className="w-3 h-3" />
                  {filter.label}
                </button>
              ))}
            </div>
          )}
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
                : 'Type in the search box above to find notes by title or content. Use filters to narrow down results.'
              }
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileSelect(file)}
                className="group p-4 rounded-lg border border-border-dark bg-bg-primary hover:bg-bg-secondary hover:border-border-light cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-text-primary group-hover:text-accent-blue transition-colors">
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
                  {(() => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return new Date(file.updated_at) > weekAgo
                  })() && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">
                      <Calendar className="w-3 h-3" />
                      Recent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Tips Footer */}
      {searchQuery.trim() === '' && (
        <div className="flex-shrink-0 p-4 border-t border-border-dark bg-bg-secondary">
          <div className="text-xs text-text-secondary space-y-1">
            <p><strong>Search tips:</strong></p>
            <p>• Search by note title or content</p>
            <p>• Use filters to narrow down results</p>
            <p>• Click any result to open the note</p>
          </div>
        </div>
      )}
    </div>
  )
}