'use client'

interface EditorHeaderProps {
  name: string
  version?: number
  savedAt?: string
  saving?: boolean
  isDirty?: boolean
  onNameChange: (name: string) => void
}

export function EditorHeader({
  name,
  version,
  savedAt,
  saving,
  isDirty,
  onNameChange,
}: EditorHeaderProps) {
  const getSaveStatus = () => {
    if (saving) return 'Saving…'
    if (isDirty) return 'Typing...'
    if (savedAt) return `Saved • ${savedAt}`
    return 'Ready'
  }

  const getSaveStatusColor = () => {
    if (saving) return 'text-blue-600 dark:text-blue-400'
    if (isDirty) return 'text-amber-600 dark:text-amber-400'
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
        {version && <span>v{version}</span>}
        
        {/* Save status indicator with animation */}
        <div className="flex items-center gap-1">
          {saving && (
            <div className="flex items-center">
              {/* Subtle pulsing animation for saving */}
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
          {isDirty && !saving && (
            <div className="flex items-center">
              {/* Typing indicator */}
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
          )}
          {!isDirty && !saving && savedAt && (
            <div className="flex items-center">
              {/* Saved indicator */}
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}
          
          <span className={`transition-colors duration-300 ${getSaveStatusColor()}`}>
            {getSaveStatus()}
          </span>
        </div>
      </div>
    </div>
  )
}