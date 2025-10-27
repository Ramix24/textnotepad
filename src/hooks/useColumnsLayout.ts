'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
const COL1_MIN = 180
const COL1_MAX = 480
const COL2_MIN = 260
const COL2_MAX = 560

const DEFAULT_COLUMN_WIDTHS: ColumnWidths = {
  col1: 360, // Expanded folders panel width (same as C2 for longer folder names)
  col1Collapsed: 48, // Collapsed folders panel width (icon-only)
  col2: 360, // Default context list width  
  col2Collapsed: 64, // Collapsed context list width (need space for toggle button)
  col2Min: COL2_MIN,
  col2Max: COL2_MAX,
  col3Min: 480 // Minimum detail view width
}

const DEFAULT_SELECTION: AppSelection = {
  mode: 'notes',
  folderId: 'inbox',
  fileId: null,
  searchQuery: ''
}

const STORAGE_KEYS = {
  COL1_WIDTH: 'layout:c1w',
  COL2_WIDTH: 'layout:c2w',
  ACTIVE_PANEL: 'layout:active-panel', 
  SELECTION: 'tnp:selection', // New key for folder-based selection
  COL1_COLLAPSED: 'layout:c1-collapsed',
  COL2_COLLAPSED: 'layout:c2-collapsed'
}

// Migration function to handle old selection format
function migrateSelection(stored: unknown): AppSelection {
  if (!stored) return DEFAULT_SELECTION
  
  // Force all users to start with inbox folder for better organization
  if (stored && typeof stored === 'object' && 'mode' in stored) {
    return { 
      mode: 'notes', 
      folderId: 'inbox', 
      fileId: null, 
      searchQuery: '' 
    }
  }
  
  // Migrate from old format
  if (stored && typeof stored === 'object' && 'section' in stored) {
    // Force start with inbox folder for all migrated users
    return { mode: 'notes', folderId: 'inbox', fileId: null, searchQuery: '' }
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
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize state from localStorage
  const [col1Width, setCol1Width] = useState(() => 
    getPreference(STORAGE_KEYS.COL1_WIDTH, columnWidths.col1)
  )
  
  const [col2Width, setCol2Width] = useState(() => 
    getPreference(STORAGE_KEYS.COL2_WIDTH, columnWidths.col2)
  )
  
  const [activePanel, setActivePanel] = useState<LayoutState['activePanel']>(() =>
    getPreference(STORAGE_KEYS.ACTIVE_PANEL, 'sections')
  )
  
  const [isResizing, setIsResizing] = useState(false)
  
  const [isCol1Collapsed, setIsCol1Collapsed] = useState(() =>
    getPreference(STORAGE_KEYS.COL1_COLLAPSED, false)
  )
  
  const [isCol2Collapsed, setIsCol2Collapsed] = useState(() =>
    getPreference(STORAGE_KEYS.COL2_COLLAPSED, false)
  )

  // Selection state with migration and URL sync
  const [selection, setSelectionState] = useState<AppSelection>(() => {
    const stored = getPreference(STORAGE_KEYS.SELECTION, null)
    const migrated = migrateSelection(stored)
    
    // Override with URL params if present
    const folderParam = searchParams?.get('folder')
    if (folderParam) {
      const urlOverride = {
        ...migrated,
        mode: 'notes' as const,
        folderId: folderParam
      }
      return urlOverride
    }
    return migrated
  })

  // Debounced persistence
  const debouncedSetCol1Width = useMemo(
    () => createDebouncedSetter<number>(STORAGE_KEYS.COL1_WIDTH, 150),
    []
  )
  
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

    setCol1Width: useCallback((width: number) => {
      const clampedWidth = Math.max(
        COL1_MIN,
        Math.min(COL1_MAX, width)
      )
      setCol1Width(clampedWidth)
      debouncedSetCol1Width(clampedWidth)
    }, [debouncedSetCol1Width]),

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
    }, []),

    toggleCol1Collapsed: useCallback(() => {
      setIsCol1Collapsed(prev => {
        const newValue = !prev
        // Persist immediately
        setTimeout(() => getPreference(STORAGE_KEYS.COL1_COLLAPSED, newValue), 0)
        return newValue
      })
    }, []),

    toggleCol2Collapsed: useCallback(() => {
      setIsCol2Collapsed(prev => {
        const newValue = !prev
        // Persist immediately
        setTimeout(() => getPreference(STORAGE_KEYS.COL2_COLLAPSED, newValue), 0)
        return newValue
      })
    }, [])
  }

  // URL synchronization for folder selection
  const updateUrl = useCallback((newSelection: AppSelection) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    if (newSelection.mode === 'notes' && newSelection.folderId && newSelection.folderId !== 'trash') {
      params.set('folder', newSelection.folderId)
    } else {
      params.delete('folder')
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [router, searchParams])

  // Selection actions
  const setSelection = useCallback((next: Partial<AppSelection>) => {
    const newSelection = { ...selection, ...next }
    setSelectionState(newSelection)
    debouncedSetSelection(newSelection)
    updateUrl(newSelection)
  }, [selection, debouncedSetSelection, updateUrl])

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
    col1Width,
    col2Width,
    isResizing,
    isCol1Collapsed,
    isCol2Collapsed
  }

  // Derived visibility states based on breakpoint, activePanel, and collapse states
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
          showList: true, // Always show C2, width changes handle collapsed state
          showDetail: true
        }
    }
  }, [breakpoint, activePanel, isCol2Collapsed])

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