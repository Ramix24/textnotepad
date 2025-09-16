'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAutosave } from '@/hooks/useAutosave'
import { UserFile } from '@/types/user-files.types'

interface AutosaveExampleProps {
  file: UserFile
  onFileUpdate?: (updatedFile: UserFile) => void
}

/**
 * Example component demonstrating useAutosave integration
 * 
 * This shows the complete integration pattern for real-time autosave
 * functionality in a text editor context.
 */
export function AutosaveExample({ file, onFileUpdate }: AutosaveExampleProps) {
  const [content, setContent] = useState(file.content)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Initialize autosave hook
  const { isSaving, isDirty, markDirty, forceSave, cancelPendingSave } = useAutosave({
    file,
    onSaved: (updatedFile) => {
      setLastSaved(new Date())
      onFileUpdate?.(updatedFile)
      console.log('File saved successfully:', updatedFile)
    },
    onConflict: (conflictingFile) => {
      // Handle version conflict - refresh content with server version
      setContent(conflictingFile.content)
      console.warn('File conflict detected, content refreshed:', conflictingFile)
    },
    config: {
      debounceMs: 1000,  // Wait 1 second after typing stops
      throttleMs: 2000,  // Max 1 save every 2 seconds during continuous typing
    }
  })

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    markDirty(newContent) // This triggers the autosave pipeline
  }, [markDirty])

  // Status indicator
  const getStatus = () => {
    if (isSaving) return { text: 'Saving...', color: 'text-blue-600' }
    if (isDirty) return { text: 'Unsaved changes', color: 'text-amber-600' }
    if (lastSaved) return { 
      text: `Saved at ${lastSaved.toLocaleTimeString()}`, 
      color: 'text-green-600' 
    }
    return { text: 'Up to date', color: 'text-muted-foreground' }
  }

  const status = getStatus()

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {file.name}
          <span className={`text-sm font-normal ${status.color}`}>
            {status.text}
          </span>
        </CardTitle>
        <CardDescription>
          Autosave demo - v{file.version} | {content.length} characters
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main editor area */}
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start typing to see autosave in action..."
          className="w-full h-64 p-4 border rounded-md resize-none font-mono text-sm"
          disabled={isSaving}
        />
        
        {/* Control buttons */}
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => forceSave()}
            disabled={!isDirty || isSaving}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Force Save
          </button>
          
          <button
            onClick={cancelPendingSave}
            disabled={!isDirty || isSaving}
            className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
          >
            Cancel Changes
          </button>
        </div>
        
        {/* Status information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>📄 File ID: {file.id}</div>
          <div>🔄 Version: {file.version}</div>
          <div>💾 Auto-save: {isDirty ? 'Pending' : 'Idle'}</div>
          <div>⚡ Status: {isSaving ? 'Saving...' : 'Ready'}</div>
        </div>
        
        {/* Feature explanation */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <p className="font-medium mb-1">Autosave Features:</p>
          <ul className="space-y-1">
            <li>• <strong>Debounce:</strong> Waits 1 second after typing stops</li>
            <li>• <strong>Throttle:</strong> Maximum 1 save every 2 seconds</li>
            <li>• <strong>Optimistic Updates:</strong> Version incremented immediately</li>
            <li>• <strong>Conflict Resolution:</strong> Handles concurrent edits gracefully</li>
            <li>• <strong>Cache Integration:</strong> Updates TanStack Query cache automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default AutosaveExample