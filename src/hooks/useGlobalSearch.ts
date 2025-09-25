'use client'

import { useState, useEffect, useMemo } from 'react'
import { useFilesList } from './useFiles'
import { UserFile } from '@/types/user-files.types'

export interface SearchResult {
  file: UserFile
  highlights: {
    title: boolean
    content: string[]
  }
}

export function useGlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { data: files = [] } = useFilesList()

  // Filter out deleted files
  const searchableFiles = useMemo(() => 
    files.filter(file => !file.deleted_at), 
    [files]
  )

  // Perform search with highlighting
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }

    const query = searchQuery.toLowerCase().trim()
    const results: SearchResult[] = []

    for (const file of searchableFiles) {
      const titleMatch = file.name.toLowerCase().includes(query)
      const contentMatches: string[] = []

      // Search in content
      if (file.content) {
        const lines = file.content.split('\n')
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          if (line.toLowerCase().includes(query)) {
            // Add context around the match
            const start = Math.max(0, line.toLowerCase().indexOf(query) - 20)
            const end = Math.min(line.length, start + 100)
            let snippet = line.substring(start, end)
            
            if (start > 0) snippet = '...' + snippet
            if (end < line.length) snippet = snippet + '...'
            
            contentMatches.push(snippet)
            
            // Limit to 3 content matches per file
            if (contentMatches.length >= 3) break
          }
        }
      }

      if (titleMatch || contentMatches.length > 0) {
        results.push({
          file,
          highlights: {
            title: titleMatch,
            content: contentMatches
          }
        })
      }
    }

    // Sort by relevance (title matches first, then by number of content matches)
    return results.sort((a, b) => {
      if (a.highlights.title && !b.highlights.title) return -1
      if (!a.highlights.title && b.highlights.title) return 1
      return b.highlights.content.length - a.highlights.content.length
    })
  }, [searchQuery, searchableFiles])

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasResults: searchResults.length > 0,
    hasQuery: searchQuery.trim().length > 0
  }
}