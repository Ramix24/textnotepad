'use client'

import { useRef, useEffect } from 'react'
import { UserFile } from '@/types/user-files.types'
import { cn } from '@/lib/utils'

interface FileItemProps {
  file: UserFile
  isSelected: boolean
  isDirty?: boolean
  isRenaming: boolean
  renameValue: string
  onSelect: (file: UserFile) => void
  onStartRename: (file: UserFile) => void
  onRenameCommit: (fileId: string) => void
  onRenameCancel: () => void
  onRenameValueChange: (value: string) => void
  onDelete: (file: UserFile) => void
  className?: string
  compact?: boolean // For different layouts
}

export function FileItem({
  file,
  isSelected,
  isDirty = false,
  isRenaming,
  renameValue,
  onSelect,
  onStartRename,
  onRenameCommit,
  onRenameCancel,
  onRenameValueChange,
  onDelete,
  className,
  compact = false
}: FileItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when starting to rename
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      onRenameCommit(file.id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onRenameCancel()
    }
  }

  const handleBlur = () => {
    // Only commit if there's a value to avoid accidental empty commits
    if (renameValue.trim()) {
      onRenameCommit(file.id)
    } else {
      onRenameCancel()
    }
  }


  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStartRename(file)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(file)
  }

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(file)}
      className={cn(
        "group relative flex items-center justify-between p-3 rounded cursor-pointer transition-colors",
        isSelected
          ? "bg-gray-700 text-white"
          : "text-gray-300 hover:text-gray-100 hover:bg-gray-700",
        compact && "p-2",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className={cn("flex-shrink-0", isSelected ? "text-gray-400" : "text-gray-500")}>📄</span>
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => onRenameValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onClick={handleInputClick}
              className="w-full px-2 py-1 text-sm bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Rename file"
            />
          ) : (
            <div className="truncate">
              <div className={cn("font-medium truncate flex items-center gap-2", compact ? "text-xs" : "text-sm")}>
                <span className="truncate">{file.name}</span>
                {isDirty && (
                  <span 
                    className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" 
                    title="Unsaved changes"
                    aria-label="Unsaved changes" 
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isRenaming && (
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={handleRenameClick}
            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-gray-200"
            title="Rename file"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 hover:bg-red-900 rounded text-gray-400 hover:text-red-400"
            title="Delete file"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}