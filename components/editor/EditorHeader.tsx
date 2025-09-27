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
        {isDirty && <span className="text-amber-600 dark:text-amber-400">●</span>}
        <span>{getSaveStatus()}</span>
      </div>
    </div>
  )
}