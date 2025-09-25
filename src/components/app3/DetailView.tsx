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
      className={`flex flex-col bg-white dark:bg-gray-900 ${className}`}
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
  // Always call hooks at the top level
  const { data: file, isLoading, error } = useFileById(
    selection.mode === 'notes' ? selection.fileId : null
  )

  // Handle different modes
  if (selection.mode !== 'notes') {
    if (selection.mode === 'messages') {
      return <MessagesPlaceholder />
    }
    if (selection.mode === 'trash') {
      return <TrashPlaceholder />
    }
    return <DetailViewEmpty mode={selection.mode} />
  }

  // No file selected in notes mode
  if (!selection.fileId) {
    return <DetailViewEmpty mode="notes" />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <header className="flex-shrink-0 h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
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
        <header className="flex-shrink-0 h-12 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h1 className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</h1>
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

        {/* Footer */}
      </div>
    )
  }

  // Fallback
  return <DetailViewEmpty mode="notes" />
}

function DetailViewEmpty({ mode }: { mode: 'notes' | 'messages' | 'trash' }) {
  const getEmptyContent = () => {
    switch (mode) {
      case 'notes':
        return {
          icon: '✏️',
          title: 'Select or create a note',
          description: 'Choose a note from the list to start editing, or create a new one to begin writing.',
          showActions: true
        }
      case 'messages':
        return {
          icon: '💬',
          title: 'No conversation selected',
          description: 'Select a conversation from the list to view messages and continue the discussion.',
          showActions: false
        }
      case 'trash':
        return {
          icon: '🗑️',
          title: 'No deleted item selected',
          description: 'Select a deleted item from the list to preview or restore it.',
          showActions: false
        }
    }
  }

  const content = getEmptyContent()

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 mb-6 flex items-center justify-center border border-gray-300 dark:border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-lg">{content.icon}</span>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{content.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[300px] mb-6">
        {content.description}
      </p>
      
    </div>
  )
}

function MessagesPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 mb-6 flex items-center justify-center border border-gray-300 dark:border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-lg">💬</span>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Messages</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[300px] mb-6">
        Messages and conversations will be available here soon. This feature is currently under development.
      </p>
    </div>
  )
}

function TrashPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 mb-6 flex items-center justify-center border border-gray-300 dark:border-gray-700">
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-lg">🗑️</span>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Trash</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[300px] mb-6">
        Deleted items and their previews will appear here. Select an item from the trash list to view or restore it.
      </p>
    </div>
  )
}

function DetailViewError({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-100/80 to-red-50 dark:from-red-900/50 dark:to-red-800/25 mb-6 flex items-center justify-center border border-red-300 dark:border-red-700">
        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-lg text-red-600 dark:text-red-400">⚠️</span>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load file</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[300px] mb-6">
        {error}
      </p>
      
      <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        Try Again
      </button>
    </div>
  )
}