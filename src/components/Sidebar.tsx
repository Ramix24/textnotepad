'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFilesList, useCreateFile, useRenameFile, useDeleteFile } from '@/hooks/useFiles'
import { UserFile } from '@/types/user-files.types'
import { Trash2, Clock, SortAsc, Edit2 } from 'lucide-react'
import { toast } from 'sonner'

type SortOption = 'name' | 'time'

interface SidebarProps {
  className?: string
  currentFileId?: string | null
  onSelect?: (id: string) => void
  isDirtyMap?: Record<string, boolean>
}


interface FileItemProps {
  file: UserFile
  isSelected: boolean
  isCurrent: boolean
  isDirty: boolean
  onSelect: (id: string) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  selectedIndex: number
  itemIndex: number
}

function FileItem({ 
  file, 
  isSelected, 
  isCurrent, 
  isDirty, 
  onSelect, 
  onRename, 
  onDelete,
  selectedIndex,
  itemIndex
}: FileItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(file.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (selectedIndex === itemIndex && buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [selectedIndex, itemIndex])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditName(file.name)
  }

  const handleSaveRename = () => {
    if (editName.trim() && editName !== file.name) {
      onRename(file.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleCancelRename = () => {
    setIsEditing(false)
    setEditName(file.name)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveRename()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelRename()
    }
  }

  return (
    <div
      className={`group relative rounded-lg transition-colors ${
        isSelected
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-muted/50'
      }`}
      role="option"
      aria-selected={isSelected}
      data-testid="file-item"
    >
      {isEditing ? (
        <div className="p-3">
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={handleKeyDown}
            className="w-full text-sm font-medium bg-gray-800 dark:bg-gray-700 text-white border border-primary/20 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            maxLength={120}
          />
        </div>
      ) : (
        <button
          ref={buttonRef}
          onClick={() => onSelect(file.id)}
          onDoubleClick={handleDoubleClick}
          className="w-full text-left p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isCurrent && (
                  <span 
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isDirty ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    title={isDirty ? 'Unsaved changes' : 'Current file'}
                  />
                )}
                {isDirty && !isCurrent && (
                  <span 
                    className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"
                    title="Unsaved changes"
                  />
                )}
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDoubleClick()
                }}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                title="Rename file"
              >
                <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(file.id)
                }}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                title="Delete file"
              >
                <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
              </button>
            </div>
          </div>
        </button>
      )}
    </div>
  )
}

export function Sidebar({ className, currentFileId, onSelect, isDirtyMap = {} }: SidebarProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sidebarWidth, setSidebarWidth] = useState(320) // Default 320px (w-80)
  const [isResizing, setIsResizing] = useState(false)
  const { data: files, isLoading, error } = useFilesList()
  const createFile = useCreateFile()
  const renameFile = useRenameFile()
  const deleteFile = useDeleteFile()
  const listRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Sort files based on current sort option
  const sortedFiles = useMemo(() => {
    if (!files) return []
    
    const sorted = [...files].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else {
        // Sort by time (newest first)
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })
    
    return sorted
  }, [files, sortBy])

  const handleCreateFile = async () => {
    try {
      const newFile = await createFile.mutateAsync({})
      onSelect?.(newFile.id)
    } catch {
      // Error handling is done in the hook
    }
  }

  const handleSelectFile = (id: string) => {
    onSelect?.(id)
    const index = sortedFiles.findIndex(f => f.id === id)
    setSelectedIndex(index >= 0 ? index : 0)
  }

  const handleRename = (id: string, newName: string) => {
    renameFile.mutate({ id, name: newName })
  }

  const handleDelete = (id: string) => {
    if (sortedFiles && sortedFiles.length === 1) {
      toast.error('Cannot delete the last remaining file')
      return
    }
    deleteFile.mutate(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!sortedFiles || sortedFiles.length === 0) return

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(0, prev - 1))
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(sortedFiles.length - 1, prev + 1))
        break
      case 'Enter':
        e.preventDefault()
        if (sortedFiles[selectedIndex]) {
          handleSelectFile(sortedFiles[selectedIndex].id)
        }
        break
    }
  }

  // Update selected index when currentFileId changes
  useEffect(() => {
    if (sortedFiles && currentFileId) {
      const index = sortedFiles.findIndex(f => f.id === currentFileId)
      if (index !== -1) {
        setSelectedIndex(index)
      }
    }
  }, [sortedFiles, currentFileId])

  // Handle resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = e.clientX
      const minWidth = 256 // min-w-64
      const maxWidth = 600 // reasonable max width
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  return (
    <div 
      ref={sidebarRef}
      className={`relative flex flex-col h-full bg-background border-r ${className}`}
      style={{ width: `${sidebarWidth}px` }}
      data-testid="sidebar"
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Notes</h2>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleCreateFile}
            disabled={createFile.isPending}
          >
            {createFile.isPending ? 'Creating...' : 'New'}
          </Button>
        </div>
        
        {/* Sort options */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs text-muted-foreground mr-2">Sort:</span>
          <Button
            size="sm"
            variant={sortBy === 'time' ? 'default' : 'ghost'}
            onClick={() => setSortBy('time')}
            className="h-6 px-2 text-xs"
          >
            <Clock className="w-3 h-3 mr-1" />
            Time
          </Button>
          <Button
            size="sm"
            variant={sortBy === 'name' ? 'default' : 'ghost'}
            onClick={() => setSortBy('name')}
            className="h-6 px-2 text-xs"
          >
            <SortAsc className="w-3 h-3 mr-1" />
            Name
          </Button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">
            <p className="text-sm">Failed to load files</p>
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          </div>
        ) : !sortedFiles || sortedFiles.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">No notes yet</p>
            <Button 
              size="sm" 
              onClick={handleCreateFile}
              disabled={createFile.isPending}
            >
              {createFile.isPending ? 'Creating...' : 'New note'}
            </Button>
          </div>
        ) : (
          <div 
            ref={listRef}
            className="space-y-1"
            role="listbox"
            aria-label="Files list"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {sortedFiles.map((file, index) => (
              <FileItem
                key={file.id}
                file={file}
                isSelected={selectedIndex === index}
                isCurrent={currentFileId === file.id}
                isDirty={isDirtyMap[file.id] || false}
                onSelect={handleSelectFile}
                onRename={handleRename}
                onDelete={handleDelete}
                selectedIndex={selectedIndex}
                itemIndex={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          {sortedFiles ? `${sortedFiles.length} note${sortedFiles.length !== 1 ? 's' : ''}` : '0 notes'}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${
          isResizing ? 'bg-primary/30' : ''
        }`}
        onMouseDown={handleMouseDown}
        title="Resize sidebar"
      />
    </div>
  )
}