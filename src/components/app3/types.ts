export interface BreakpointConfig {
  mobile: number
  tablet: number
  desktop: number
}

export interface ColumnWidths {
  col1: number // Fixed width for sections rail
  col2: number // Resizable width for context list
  col2Min: number
  col2Max: number
  col3Min: number // Minimum width for detail view
}

export interface LayoutState {
  breakpoint: 'mobile' | 'tablet' | 'desktop'
  activePanel: 'sections' | 'list' | 'detail' // For tablet/mobile switching
  col2Width: number
  isResizing: boolean
}

export interface LayoutActions {
  setActivePanel: (panel: LayoutState['activePanel']) => void
  setCol2Width: (width: number) => void
  setIsResizing: (resizing: boolean) => void
}

export type Section = 'folders' | 'notes' | 'messages' | 'trash'

export type AppSelection = {
  section: Section
  folderId?: string | null
  fileId?: string | null
  conversationId?: string | null
  trashId?: string | null
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