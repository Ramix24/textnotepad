'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useFilesList } from '@/hooks/useFiles'
import { useKeyboardNavigation, formatShortcut } from '@/hooks/useGlobalShortcuts'
import { UserFile } from '@/types/user-files.types'
import { Search, FileText } from 'lucide-react'

interface QuickSwitchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectFile: (fileId: string) => void
  currentFileId?: string | null
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString()
}

export function QuickSwitchModal({ 
  isOpen, 
  onClose, 
  onSelectFile, 
  currentFileId 
}: QuickSwitchModalProps) {
  const [filter, setFilter] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { data: files = [] } = useFilesList()
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter files based on search term
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(filter.toLowerCase()) ||
    file.content.toLowerCase().includes(filter.toLowerCase())
  )

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [filter])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFilter('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const handleSelect = (index: number) => {
    const file = filteredFiles[index]
    if (file) {
      onSelectFile(file.id)
      onClose()
    }
  }

  const handleItemClick = (file: UserFile) => {
    onSelectFile(file.id)
    onClose()
  }

  // Handle keyboard navigation
  useKeyboardNavigation({
    items: filteredFiles,
    selectedIndex,
    onSelectionChange: setSelectedIndex,
    onSelect: handleSelect,
    isOpen,
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Quick Switch</DialogTitle>
          <DialogDescription>
            Type to filter files, use ↑↓ to navigate, Enter to select
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search files..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* File List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {filter ? 'No files match your search' : 'No files found'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFiles.map((file, index) => (
                  <button
                    key={file.id}
                    onClick={() => handleItemClick(file)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedIndex === index
                        ? 'bg-blue-100 border border-blue-200'
                        : 'hover:bg-gray-100'
                    } ${
                      currentFileId === file.id
                        ? 'ring-2 ring-blue-500 ring-offset-1'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {currentFileId === file.id && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(file.updated_at)}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-400">
                            {file.word_count} words
                          </p>
                        </div>
                        {/* Show content preview if there's a search filter */}
                        {filter && file.content && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {file.content.substring(0, 80)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-gray-500 text-center border-t pt-3">
            {formatShortcut('O')} to open • ↑↓ to navigate • Enter to select • Esc to close
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}