'use client'

import { useState, useEffect } from 'react'

interface EditorHeaderProps {
  name: string
  savedAt?: string
  saving?: boolean
  isDirty?: boolean
  onNameChange: (name: string) => void
}

export function EditorHeader({
  name,
  savedAt,
  saving,
  isDirty,
  onNameChange,
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
    if (savedAt) return `Saved • ${savedAt}`
    return 'Ready'
  }

  const getSaveStatusColor = () => {
    if (saving) return 'text-blue-600 dark:text-blue-400'
    if (showTyping) return 'text-amber-600 dark:text-amber-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="h-12 bg-bg-secondary border-b border-border-dark flex items-center gap-3 px-4">
      <input
        className="bg-transparent outline-none text-base font-medium flex-1 text-text-primary"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Untitled"
      />
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        
        {/* Save status indicator - simplified and less flashy */}
        <div className="flex items-center gap-2">
          {/* Single status dot that changes color smoothly */}
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            saving ? 'bg-blue-500' : 
            showTyping ? 'bg-amber-500' : 
            'bg-green-500'
          }`}></div>
          
          <span className={`transition-colors duration-500 ${getSaveStatusColor()}`}>
            {getSaveStatus()}
          </span>
        </div>
      </div>
    </div>
  )
}