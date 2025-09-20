'use client'

import { useEffect, useCallback } from 'react'

interface GlobalShortcutsConfig {
  onNewFile?: () => void
  onSave?: () => void
  onQuickSwitch?: () => void
}

/**
 * Hook for handling global keyboard shortcuts
 */
export function useGlobalShortcuts({
  onNewFile,
  onSave,
  onQuickSwitch,
}: GlobalShortcutsConfig) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if we're in an input, textarea, or contenteditable element
    const target = event.target as HTMLElement
    const isInputElement = 
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable

    // Determine if we're on Mac or Windows/Linux
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modifierKey = isMac ? event.metaKey : event.ctrlKey

    if (!modifierKey) return

    // Ctrl/Cmd + N - New file
    if (event.key === 'n' && onNewFile) {
      event.preventDefault()
      onNewFile()
      return
    }

    // Ctrl/Cmd + S - Save file (only if we're in an input element)
    if (event.key === 's' && onSave && isInputElement) {
      event.preventDefault()
      onSave()
      return
    }

    // Ctrl/Cmd + O - Quick switch
    if (event.key === 'o' && onQuickSwitch) {
      event.preventDefault()
      onQuickSwitch()
      return
    }
  }, [onNewFile, onSave, onQuickSwitch])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

/**
 * Utility function to format keyboard shortcuts for display
 */
export function formatShortcut(key: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modifier = isMac ? '⌘' : 'Ctrl'
  
  return `${modifier}+${key.toUpperCase()}`
}

/**
 * Hook for handling keyboard navigation within a list
 */
export function useKeyboardNavigation({
  items,
  selectedIndex,
  onSelectionChange,
  onSelect,
  isOpen,
}: {
  items: any[]
  selectedIndex: number
  onSelectionChange: (index: number) => void
  onSelect: (index: number) => void
  isOpen: boolean
}) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen || items.length === 0) return

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        onSelectionChange(Math.max(0, selectedIndex - 1))
        break
      case 'ArrowDown':
        event.preventDefault()
        onSelectionChange(Math.min(items.length - 1, selectedIndex + 1))
        break
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          onSelect(selectedIndex)
        }
        break
      case 'Escape':
        event.preventDefault()
        // Let the modal handle escape
        break
    }
  }, [isOpen, items.length, selectedIndex, onSelectionChange, onSelect])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, handleKeyDown])
}