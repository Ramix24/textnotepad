'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardNavHandlers {
  onFocusColumn1?: () => void
  onFocusColumn2?: () => void
  onFocusColumn3?: () => void
  onNewFile?: () => void
  onSave?: () => void
}

export function useKeyboardNav({
  onFocusColumn1,
  onFocusColumn2,
  onFocusColumn3,
  onNewFile,
  onSave
}: KeyboardNavHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't intercept when user is typing in inputs/textareas
    if (e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement)?.contentEditable === 'true') {
      return
    }

    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const isCtrlCmd = isMac ? e.metaKey : e.ctrlKey

    // Column focus shortcuts (1, 2, 3)
    if (!e.altKey && !isCtrlCmd && !e.shiftKey) {
      switch (e.key) {
        case '1':
          e.preventDefault()
          onFocusColumn1?.()
          break
        case '2':
          e.preventDefault()
          onFocusColumn2?.()
          break
        case '3':
          e.preventDefault()
          onFocusColumn3?.()
          break
      }
    }

    // Ctrl/Cmd shortcuts
    if (isCtrlCmd && !e.altKey && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault()
          onNewFile?.()
          break
        case 's':
          e.preventDefault()
          onSave?.()
          break
      }
    }
  }, [onFocusColumn1, onFocusColumn2, onFocusColumn3, onNewFile, onSave])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}