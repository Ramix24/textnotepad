'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useFilesList, useCreateFile, useRenameFile, useDeleteFile } from '@/hooks/useFiles'
import { UserFile } from '@/types/user-files.types'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface SidebarProps {
  className?: string
  currentFileId?: string | null
  onSelect?: (id: string) => void
  isDirtyMap?: Record<string, boolean>
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
          ? 'bg-blue-100 border border-blue-200'
          : 'hover:bg-gray-100'
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
            className="w-full text-sm font-medium bg-white border rounded px-2 py-1"
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
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatRelativeTime(file.updated_at)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(file.id)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
              title="Delete file"
            >
              <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
            </button>
          </div>
        </button>
      )}
    </div>
  )
}

export function Sidebar({ className, currentFileId, onSelect, isDirtyMap = {} }: SidebarProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { user } = useAuthSession()
  const { data: files, isLoading, error } = useFilesList()
  const createFile = useCreateFile()
  const renameFile = useRenameFile()
  const deleteFile = useDeleteFile()
  const listRef = useRef<HTMLDivElement>(null)

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
    const index = files?.findIndex(f => f.id === id) ?? 0
    setSelectedIndex(index)
  }

  const handleRename = (id: string, newName: string) => {
    renameFile.mutate({ id, name: newName })
  }

  const handleDelete = (id: string) => {
    if (files && files.length === 1) {
      toast.error('Cannot delete the last remaining file')
      return
    }
    deleteFile.mutate(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!files || files.length === 0) return

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(0, prev - 1))
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(files.length - 1, prev + 1))
        break
      case 'Enter':
        e.preventDefault()
        if (files[selectedIndex]) {
          handleSelectFile(files[selectedIndex].id)
        }
        break
    }
  }

  // Update selected index when currentFileId changes
  useEffect(() => {
    if (files && currentFileId) {
      const index = files.findIndex(f => f.id === currentFileId)
      if (index !== -1) {
        setSelectedIndex(index)
      }
    }
  }, [files, currentFileId])

  return (
    <div className={`flex flex-col h-full bg-gray-50 border-r ${className}`} data-testid="sidebar">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Notes</h2>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleCreateFile}
            disabled={createFile.isPending}
          >
            {createFile.isPending ? 'Creating...' : 'New'}
          </Button>
        </div>
        {user && (
          <div className="text-xs text-gray-500">
            {user.email}
          </div>
        )}
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
            <p className="text-xs text-gray-500 mt-1">{error.message}</p>
          </div>
        ) : !files || files.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500 mb-3">No notes yet</p>
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
            {files.map((file, index) => (
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
        <div className="text-xs text-gray-500">
          {files ? `${files.length} note${files.length !== 1 ? 's' : ''}` : '0 notes'}
        </div>
      </div>
    </div>
  )
}