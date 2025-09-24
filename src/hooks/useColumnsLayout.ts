'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getPreference, createDebouncedSetter } from '@/lib/prefs'
import type { 
  BreakpointConfig, 
  ColumnWidths, 
  LayoutState, 
  LayoutActions, 
  UseColumnsLayoutReturn,
  AppSelection
} from '@/components/app3/types'

const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024
}

// Width constraints
const COL2_MIN = 260
const COL2_MAX = 560

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  col1: 76, // Fixed sections rail width
  col2: 360, // Default context list width
  col2Min: COL2_MIN,
  col2Max: COL2_MAX,
  col3Min: 480 // Minimum detail view width
}

const DEFAULT_SELECTION: AppSelection = {
  mode: 'notes',
  folderId: null,
  fileId: null
}

const STORAGE_KEYS = {
  COL2_WIDTH: 'layout:c2w',
  ACTIVE_PANEL: 'layout:active-panel', 
  SELECTION: 'tnp:selection' // New key for folder-based selection
}

// Migration function to handle old selection format
function migrateSelection(stored: any): AppSelection {
  if (!stored) return DEFAULT_SELECTION
  
  // If it's already the new format, return as-is
  if ('mode' in stored) {
    return {
      mode: stored.mode || 'notes',
      folderId: stored.folderId || null,
      fileId: stored.fileId || null
    }
  }
  
  // Migrate from old format
  if ('section' in stored) {
    const mode = stored.section === 'notes' ? 'notes' :
                 stored.section === 'messages' ? 'messages' :
                 stored.section === 'trash' ? 'trash' : 'notes'
    
    return {
      mode,
      folderId: stored.folderId || null,
      fileId: stored.fileId || null
    }
  }
  
  return DEFAULT_SELECTION
}

function useBreakpoint(breakpoints: BreakpointConfig = DEFAULT_BREAKPOINTS) {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < breakpoints.mobile) {
        setBreakpoint('mobile')
      } else if (width < breakpoints.tablet) {
        setBreakpoint('tablet')
      } else {
        setBreakpoint('desktop')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [breakpoints])

  return breakpoint
}

export function useColumnsLayout(
  columnWidths: ColumnWidths = DEFAULT_COLUMN_WIDTHS,
  breakpoints: BreakpointConfig = DEFAULT_BREAKPOINTS
): UseColumnsLayoutReturn {
  const breakpoint = useBreakpoint(breakpoints)
  
  // Initialize state from localStorage
  const [col2Width, setCol2Width] = useState(() => 
    getPreference(STORAGE_KEYS.COL2_WIDTH, columnWidths.col2)
  )
  
  const [activePanel, setActivePanel] = useState<LayoutState['activePanel']>(() =>
    getPreference(STORAGE_KEYS.ACTIVE_PANEL, 'sections')
  )
  
  const [isResizing, setIsResizing] = useState(false)

  // Selection state with migration
  const [selection, setSelectionState] = useState<AppSelection>(() => {
    const stored = getPreference(STORAGE_KEYS.SELECTION, null)
    return migrateSelection(stored)
  })

  // Debounced persistence
  const debouncedSetCol2Width = useMemo(
    () => createDebouncedSetter<number>(STORAGE_KEYS.COL2_WIDTH, 150),
    []
  )

  const debouncedSetSelection = useMemo(
    () => createDebouncedSetter<AppSelection>(STORAGE_KEYS.SELECTION, 100),
    []
  )

  // Actions
  const actions: LayoutActions = {
    setActivePanel: useCallback((panel: LayoutState['activePanel']) => {
      setActivePanel(panel)
      // Persist immediately for panel switches
      setTimeout(() => getPreference(STORAGE_KEYS.ACTIVE_PANEL, panel), 0)
    }, []),

    setCol2Width: useCallback((width: number) => {
      const clampedWidth = Math.max(
        COL2_MIN,
        Math.min(COL2_MAX, width)
      )
      setCol2Width(clampedWidth)
      debouncedSetCol2Width(clampedWidth)
    }, [debouncedSetCol2Width]),

    setIsResizing: useCallback((resizing: boolean) => {
      setIsResizing(resizing)
    }, [])
  }

  // Selection actions
  const setSelection = useCallback((next: Partial<AppSelection>) => {
    const newSelection = { ...selection, ...next }
    setSelectionState(newSelection)
    debouncedSetSelection(newSelection)
  }, [selection, debouncedSetSelection])

  // Active pane management (for mobile/tablet)
  const activePane = useMemo<1 | 2 | 3>(() => {
    if (breakpoint === 'desktop') return 1 // Not applicable on desktop
    
    switch (activePanel) {
      case 'sections': return 1
      case 'list': return 2
      case 'detail': return 3
      default: return 1
    }
  }, [breakpoint, activePanel])

  const setActivePane = useCallback((pane: 1 | 2 | 3) => {
    const panelMap: Record<1 | 2 | 3, LayoutState['activePanel']> = {
      1: 'sections',
      2: 'list', 
      3: 'detail'
    }
    actions.setActivePanel(panelMap[pane])
  }, [actions])

  // Layout state
  const state: LayoutState = {
    breakpoint,
    activePanel,
    col2Width,
    isResizing
  }

  // Derived visibility states based on breakpoint and activePanel
  const { showSections, showList, showDetail } = useMemo(() => {
    switch (breakpoint) {
      case 'mobile':
        return {
          showSections: activePanel === 'sections',
          showList: activePanel === 'list',
          showDetail: activePanel === 'detail'
        }
      case 'tablet':
        return {
          showSections: activePanel === 'sections',
          showList: activePanel === 'sections' || activePanel === 'list',
          showDetail: activePanel === 'detail'
        }
      case 'desktop':
      default:
        return {
          showSections: true,
          showList: true,
          showDetail: true
        }
    }
  }, [breakpoint, activePanel])

  // Derived flags
  const isMobile = breakpoint === 'mobile'
  const isTablet = breakpoint === 'tablet'
  const isDesktop = breakpoint === 'desktop'

  return {
    state,
    actions,
    breakpoint,
    columnWidths,
    showSections,
    showList,
    showDetail,
    // Selection
    selection,
    setSelection,
    // Derived flags
    isMobile,
    isTablet,
    isDesktop,
    activePane,
    setActivePane
  }
}