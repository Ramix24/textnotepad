'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Edit3, Trash2, FileText } from 'lucide-react'
import { UserFile } from '@/types/user-files.types'
import { cn } from '@/lib/utils'
// Simple time formatter - can be replaced with date-fns if needed
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

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
  const [showActions, setShowActions] = useState(false)
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

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowActions(!showActions)
  }

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowActions(false)
    onStartRename(file)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowActions(false)
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
        "group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
        isSelected
          ? "bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        compact && "p-2",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <FileText className={cn("text-muted-foreground flex-shrink-0", compact ? "w-3 h-3" : "w-4 h-4")} />
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
              className="w-full px-2 py-1 text-sm bg-background border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
              {!compact && (
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {formatTimeAgo(new Date(file.updated_at))} • {file.word_count} words
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isRenaming && (
        <div className="relative">
          <button
            onClick={handleActionsClick}
            aria-label="File actions"
            aria-expanded={showActions}
            className={cn(
              "p-1 rounded hover:bg-muted/50 transition-colors",
              showActions || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-6 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg z-10 min-w-[120px]">
              <button
                onClick={handleRenameClick}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left"
              >
                <Edit3 className="w-3 h-3" />
                Rename
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}