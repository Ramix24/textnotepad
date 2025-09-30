'use client'

import { useState, useCallback, useEffect } from 'react'
import { CommandAction } from './actions'

export type CommandPaletteSection = 'actions' | 'notes' | 'folders'

export interface CommandPaletteState {
  isOpen: boolean
  query: string
  activeIndex: number
  activeSection: CommandPaletteSection
  step: 'search' | 'input-arg'
  argMode?: 'folder' | 'note' | 'text'
  pendingAction?: CommandAction
  recentActions: string[] // Action IDs
}

export interface UseCommandPaletteOptions {
  onClose?: () => void
  onOpen?: () => void
}

export function useCommandPalette(options: UseCommandPaletteOptions = {}) {
  const [state, setState] = useState<CommandPaletteState>({
    isOpen: false,
    query: '',
    activeIndex: 0,
    activeSection: 'actions',
    step: 'search',
    recentActions: []
  })

  const open = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true, query: '', activeIndex: 0, step: 'search' }))
    options.onOpen?.()
  }, [options])

  const close = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isOpen: false, 
      query: '', 
      activeIndex: 0, 
      step: 'search', 
      pendingAction: undefined,
      argMode: undefined
    }))
    options.onClose?.()
  }, [options])

  const toggle = useCallback(() => {
    if (state.isOpen) {
      close()
    } else {
      open()
    }
  }, [state.isOpen, open, close])

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query, activeIndex: 0 }))
  }, [])

  const setActiveIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, activeIndex: index }))
  }, [])

  const setActiveSection = useCallback((section: CommandPaletteSection) => {
    setState(prev => ({ ...prev, activeSection: section, activeIndex: 0 }))
  }, [])

  const addRecentAction = useCallback((actionId: string) => {
    setState(prev => ({
      ...prev,
      recentActions: [
        actionId,
        ...prev.recentActions.filter(id => id !== actionId)
      ].slice(0, 5) // Keep only last 5
    }))
  }, [])

  const startArgInput = useCallback((action: CommandAction, argMode: 'folder' | 'note' | 'text') => {
    setState(prev => ({
      ...prev,
      step: 'input-arg',
      argMode,
      pendingAction: action,
      query: '',
      activeIndex: 0
    }))
  }, [])

  const cancelArgInput = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: 'search',
      argMode: undefined,
      pendingAction: undefined,
      query: '',
      activeIndex: 0
    }))
  }, [])

  // Global keyboard shortcut handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ctrl/Cmd + K to open
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      // Only if not already handled by another component
      if (!state.isOpen) {
        event.preventDefault()
        open()
      }
    }
    
    // Escape to close
    if (event.key === 'Escape' && state.isOpen) {
      event.preventDefault()
      if (state.step === 'input-arg') {
        cancelArgInput()
      } else {
        close()
      }
    }
  }, [state.isOpen, state.step, open, close, cancelArgInput])

  // Navigation within the command palette
  const handlePaletteKeyDown = useCallback((event: KeyboardEvent) => {
    if (!state.isOpen) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex(state.activeIndex + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex(Math.max(0, state.activeIndex - 1))
        break
      case 'Tab':
        event.preventDefault()
        // Cycle through sections
        const sections: CommandPaletteSection[] = ['actions', 'notes', 'folders']
        const currentIndex = sections.indexOf(state.activeSection)
        const nextIndex = (currentIndex + 1) % sections.length
        setActiveSection(sections[nextIndex])
        break
    }
  }, [state.isOpen, state.activeIndex, state.activeSection, setActiveIndex, setActiveSection])

  // Register global shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    state,
    actions: {
      open,
      close,
      toggle,
      setQuery,
      setActiveIndex,
      setActiveSection,
      addRecentAction,
      startArgInput,
      cancelArgInput,
      handlePaletteKeyDown
    }
  }
}