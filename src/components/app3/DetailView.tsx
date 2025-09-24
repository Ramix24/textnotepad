'use client'

import { ReactNode } from 'react'
import { useFileById } from '@/hooks/useFiles'
import { Editor } from '@/components/Editor'
import { EditorSkeleton } from '@/components/EditorSkeleton'
import type { AppSelection } from './types'

interface DetailViewProps {
  children?: ReactNode
  className?: string
  selection: AppSelection
  onFileUpdate?: (updatedFile: any) => void
  onDirtyChange?: (fileId: string, isDirty: boolean) => void
}

export function DetailView({ 
  children, 
  className = '', 
  selection,
  onFileUpdate,
  onDirtyChange
}: DetailViewProps) {
  return (
    <div 
      className={`flex flex-col bg-background ${className}`}
      role="main"
      aria-label="Detail View"
    >
      {children || (
        <DefaultDetailContent 
          selection={selection}
          onFileUpdate={onFileUpdate}
          onDirtyChange={onDirtyChange}
        />
      )}
    </div>
  )
}

interface DefaultDetailContentProps {
  selection: AppSelection
  onFileUpdate?: (updatedFile: any) => void
  onDirtyChange?: (fileId: string, isDirty: boolean) => void
}

function DefaultDetailContent({ selection, onFileUpdate, onDirtyChange }: DefaultDetailContentProps) {
  const { data: file, isLoading, error } = useFileById(selection.fileId)

  // No file selected
  if (!selection.fileId) {
    return <DetailViewEmpty />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <header className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border bg-card/20">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </header>
        <div className="flex-1">
          <EditorSkeleton className="h-full" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return <DetailViewError error={error.message} />
  }

  // File loaded successfully
  if (file) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex-shrink-0 h-12 flex items-center justify-between px-4 border-b border-border bg-card/20">
          <h1 className="text-sm font-medium text-foreground truncate">{file.name}</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{file.word_count} words</span>
            <span>·</span>
            <span>{new Date(file.updated_at).toLocaleDateString()}</span>
          </div>
        </header>
        
        <div className="flex-1 min-h-0">
          <Editor 
            key={file.id} // Reset editor state when file changes
            file={file}
            onFileUpdate={onFileUpdate}
            onDirtyChange={onDirtyChange}
            className="h-full"
          />
        </div>
      </div>
    )
  }

  // Fallback
  return <DetailViewEmpty />
}

function DetailViewEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 mb-6 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
          <span className="text-lg">✏️</span>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">Select or create a note</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[300px] mb-6">
        Choose a note from the list to start editing, or create a new one to begin writing.
      </p>
      
      <div className="flex gap-3">
        <button className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
          Create New Note
        </button>
        <button className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          Browse Notes
        </button>
      </div>
    </div>
  )
}

function DetailViewError({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 mb-6 flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
          <span className="text-lg text-destructive">⚠️</span>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">Failed to load file</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px] mb-6">
        {error}
      </p>
      
      <button className="px-4 py-2 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
        Try Again
      </button>
    </div>
  )
}