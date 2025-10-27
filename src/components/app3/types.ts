export interface BreakpointConfig {
  mobile: number
  tablet: number
  desktop: number
}

export interface ColumnWidths {
  col1: number // Width for sections rail when expanded
  col1Collapsed: number // Width for sections rail when collapsed (icon-only)
  col2: number // Resizable width for context list
  col2Collapsed: number // Width for context list when collapsed
  col2Min: number
  col2Max: number
  col3Min: number // Minimum width for detail view
}

export interface LayoutState {
  breakpoint: 'mobile' | 'tablet' | 'desktop'
  activePanel: 'sections' | 'list' | 'detail' // For tablet/mobile switching
  col1Width: number
  col2Width: number
  isResizing: boolean
  isCol1Collapsed: boolean // Whether C1 is collapsed to icon-only view
  isCol2Collapsed: boolean // Whether C2 is collapsed for focus mode
}

export interface LayoutActions {
  setActivePanel: (panel: LayoutState['activePanel']) => void
  setCol1Width: (width: number) => void
  setCol2Width: (width: number) => void
  setIsResizing: (resizing: boolean) => void
  toggleCol1Collapsed: () => void
  toggleCol2Collapsed: () => void
}

export type Mode = 'notes' | 'messages' | 'search' | 'help' | 'settings'

// Legacy type for compatibility - remove when SectionsRail is fully replaced
export type Section = 'folders' | 'notes' | 'messages' | 'trash'

export type AppSelection = {
  mode: Mode
  folderId?: string | null
  fileId?: string | null
  searchQuery?: string
}

export interface UseColumnsLayoutReturn {
  state: LayoutState
  actions: LayoutActions
  breakpoint: LayoutState['breakpoint']
  columnWidths: ColumnWidths
  showSections: boolean
  showList: boolean
  showDetail: boolean
  // Selection state
  selection: AppSelection
  setSelection: (selection: Partial<AppSelection>) => void
  // Derived flags
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  activePane: 1 | 2 | 3
  setActivePane: (pane: 1 | 2 | 3) => void
}