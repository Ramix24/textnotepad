'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type SortOption = 
  | 'name-asc' 
  | 'name-desc' 
  | 'modified-desc' 
  | 'modified-asc' 
  | 'created-desc' 
  | 'created-asc'

export interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
}

const sortOptions: Array<{ value: SortOption; label: string; icon: string }> = [
  { value: 'name-asc', label: 'Name A-Z', icon: '↑' },
  { value: 'modified-desc', label: 'Recently modified', icon: '📅' },
]

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const currentOption = sortOptions.find(option => option.value === value) || sortOptions[0]

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on escape
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (option: SortOption) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-[color:var(--bg-active)]/40 rounded transition-colors"
        aria-label="Sort options"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-sm">{currentOption.icon}</span>
        <span className="hidden sm:inline">{currentOption.label}</span>
        <svg 
          className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-bg-primary border border-border-dark rounded-lg shadow-lg z-50 py-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                value === option.value
                  ? "bg-bg-active text-accent-blue"
                  : "text-text-primary hover:bg-[color:var(--bg-active)]/40"
              )}
              role="option"
              aria-selected={value === option.value}
            >
              <span className="text-base">{option.icon}</span>
              <span>{option.label}</span>
              {value === option.value && (
                <svg className="w-4 h-4 ml-auto text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}