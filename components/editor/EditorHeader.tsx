'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface EditorHeaderProps {
  name: string
  savedAt?: string
  saving?: boolean
  isDirty?: boolean
  onNameChange: (name: string) => void
  viewMode?: 'edit' | 'preview'
  onViewModeChange?: (mode: 'edit' | 'preview') => void
  readOnly?: boolean
  showLineNumbers?: boolean
  onToggleLineNumbers?: () => void
}

export function EditorHeader({
  name,
  savedAt,
  saving,
  isDirty,
  onNameChange,
  viewMode = 'edit',
  onViewModeChange,
  readOnly = false,
  showLineNumbers = false,
  onToggleLineNumbers,
}: EditorHeaderProps) {
  const [showTyping, setShowTyping] = useState(false)
  
  // Debounce the "Typing..." indicator to reduce flashing
  useEffect(() => {
    if (isDirty && !saving) {
      const timer = setTimeout(() => setShowTyping(true), 200) // Show after 200ms of typing
      return () => clearTimeout(timer)
    } else {
      setShowTyping(false)
    }
  }, [isDirty, saving])
  
  const getSaveStatus = () => {
    if (saving) return 'Saving…'
    if (showTyping) return 'Typing...'
    if (savedAt) return 'Saved'
    return 'Ready'
  }

  const getSaveStatusColor = () => {
    if (saving) return 'text-accent-blue'
    if (showTyping) return 'text-amber-600 dark:text-amber-400'
    return 'text-accent-blue'
  }

  return (
    <div className="h-12 bg-bg-secondary border-b border-border-dark flex items-center gap-3 px-4">
      <input
        className="bg-transparent outline-none text-base font-medium flex-1 text-text-primary"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Untitled"
      />
      <div className="flex items-center gap-3">
        {/* Edit/Preview Toggle */}
        {onViewModeChange && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('edit')}
              disabled={readOnly}
              className={`text-xs h-7 transition-colors ${
                viewMode === 'edit'
                  ? 'bg-accent-blue text-white hover:opacity-90'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-active'
              }`}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('preview')}
              disabled={readOnly}
              className={`text-xs h-7 transition-colors ${
                viewMode === 'preview'
                  ? 'bg-accent-blue text-white hover:opacity-90'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-active'
              }`}
            >
              Preview
            </Button>
          </div>
        )}
        
        {/* Line Numbers Toggle - only in edit mode */}
        {viewMode === 'edit' && onToggleLineNumbers && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleLineNumbers}
            disabled={readOnly}
            className={`text-xs h-7 transition-colors ${
              showLineNumbers
                ? 'bg-accent-blue text-white hover:opacity-90'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-active'
            }`}
            title="Toggle line numbers"
          >
            #123
          </Button>
        )}
        
        {/* Save status indicator */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            saving ? 'bg-accent-blue' : 
            showTyping ? 'bg-amber-500' : 
            'bg-accent-blue'
          }`}></div>
          
          <span className={`transition-colors duration-500 ${getSaveStatusColor()}`}>
            {getSaveStatus()}
          </span>
        </div>
      </div>
    </div>
  )
}