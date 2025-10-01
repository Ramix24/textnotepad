'use client'

import * as React from 'react'
import { ReactNode, useCallback, useRef } from 'react'
import { useColumnsLayout } from '@/hooks/useColumnsLayout'
import { useKeyboardNav } from '@/hooks/useKeyboardNav'
import { useCreateFile } from '@/hooks/useFiles'
import { useSupabase } from '@/components/SupabaseProvider'
import { useAuthSession } from '@/hooks/useAuthSession'
import { FoldersPanel } from './FoldersPanel'
import { ContextList } from './ContextList'
import { DetailView } from './DetailView'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/ui/logo'
import { BookOpen, FileText, HelpCircle, Search } from 'lucide-react'
import { toast } from 'sonner'

interface AppShell3Props {
  sectionsContent?: ReactNode
  listContent?: ReactNode  
  detailContent?: ReactNode
  className?: string
}

export function AppShell3({ 
  sectionsContent, 
  listContent, 
  detailContent,
  className = '' 
}: AppShell3Props) {
  const layout = useColumnsLayout()
  const createFile = useCreateFile()
  const resizerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { supabase } = useSupabase()
  const { user } = useAuthSession()
  
  // Refs for focusing columns
  const sectionsRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  // Mouse resize handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    layout.actions.setIsResizing(true)

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = e.clientX - containerRect.left - layout.columnWidths.col1
      
      layout.actions.setCol2Width(newWidth)
    }

    const handleMouseUp = () => {
      layout.actions.setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [layout])

  // Keyboard resize handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      layout.actions.setCol2Width(layout.state.col2Width - 16)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault() 
      layout.actions.setCol2Width(layout.state.col2Width + 16)
    }
  }, [layout])

  // Column focus handlers
  const handleFocusColumn1 = useCallback(() => {
    if (layout.isMobile || layout.isTablet) {
      layout.setActivePane(1)
    }
    sectionsRef.current?.focus()
  }, [layout])

  const handleFocusColumn2 = useCallback(() => {
    if (layout.isMobile || layout.isTablet) {
      layout.setActivePane(2)
    }
    listRef.current?.focus()
  }, [layout])

  const handleFocusColumn3 = useCallback(() => {
    if (layout.isMobile || layout.isTablet) {
      layout.setActivePane(3)
    }
    detailRef.current?.focus()
  }, [layout])

  // New file handler
  const handleNewFile = useCallback(async () => {
    try {
      const newFile = await createFile.mutateAsync({
        name: `Note ${new Date().toLocaleDateString()}`,
        folder_id: layout.selection.mode === 'notes' ? layout.selection.folderId : null
      })
      
      layout.setSelection({
        ...layout.selection,
        mode: 'notes',
        fileId: newFile.id
      })
      
      // Focus detail view after creating file
      if (layout.isMobile || layout.isTablet) {
        layout.setActivePane(3)
      }
      setTimeout(() => detailRef.current?.focus(), 100)
    } catch {
      // Error handling is done in the hook
    }
  }, [layout, createFile])

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error('Authentication failed, please retry', {
          description: 'Unable to sign out. Please try again.',
        })
      } else {
        // Force redirect to landing page and reload to clear app state
        window.location.href = '/'
      }
    } catch {
      toast.error('Sign out failed', {
        description: 'An unexpected error occurred during sign out.',
      })
    }
  }, [supabase])



  // Global keyboard navigation
  useKeyboardNav({
    onFocusColumn1: handleFocusColumn1,
    onFocusColumn2: handleFocusColumn2,
    onFocusColumn3: handleFocusColumn3,
    onNewFile: handleNewFile,
    onSave: () => {
      // Save is handled by Editor component internally
      // This is here for completeness
    }
  })

  // Global keyboard shortcuts  
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        // Focus search bar (Ctrl/Cmd+K)
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder="Search notes..."]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          layout.setSelection({ mode: 'search', folderId: null, fileId: null })
          if (layout.isMobile || layout.isTablet) {
            layout.setActivePane(3)
          }
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        layout.setSelection({ mode: 'help', folderId: null, fileId: null })
        if (layout.isMobile || layout.isTablet) {
          layout.setActivePane(3)
        }
      } else if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only trigger if not in an input field
        const activeElement = document.activeElement
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          layout.setSelection({ mode: 'help', folderId: null, fileId: null })
          if (layout.isMobile || layout.isTablet) {
            layout.setActivePane(3)
          }
        }
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '[') {
        // Toggle C2 sidebar (notes list)
        e.preventDefault()
        layout.actions.toggleCol2Collapsed()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [layout])

  // Mobile tab bar with better active states
  const MobileTabBar = () => {
    const tabs = [
      { key: 'notebooks', label: 'Notebooks', icon: BookOpen, pane: 1 as const, action: () => layout.setActivePane(1) },
      { key: 'notes', label: 'Notes', icon: FileText, pane: 2 as const, action: () => layout.setActivePane(2) },
      { key: 'search', label: 'Search', icon: Search, pane: 3 as const, action: () => {
        layout.setSelection({ mode: 'search', folderId: null, fileId: null, searchQuery: '' })
        layout.setActivePane(3)
      }}
    ]

    return (
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-secondary/95 backdrop-blur-sm border-t border-border-dark flex safe-area-pb"
        data-testid="mobile-tab-bar"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === 'search' ? layout.selection.mode === 'search' : layout.activePane === tab.pane
          return (
            <button
              key={tab.key}
              onClick={tab.action}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 relative
                ${isActive 
                  ? 'text-blue-500 dark:text-blue-400' 
                  : 'text-text-secondary hover:text-text-primary active:scale-95'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent-blue rounded-full" />
              )}
              
              {/* Icon */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${isActive 
                  ? 'bg-bg-active text-accent-blue' 
                  : 'bg-transparent text-text-secondary group-hover:bg-[color:var(--bg-active)]/40'
                }
              `}>
                <tab.icon className="h-4 w-4" />
              </div>
              
              {/* Label */}
              <span className={`
                leading-none transition-colors
                ${isActive ? 'text-accent-blue font-semibold' : 'text-text-secondary'}
              `}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div 
      className={`fixed inset-0 flex flex-col overflow-hidden bg-bg-primary ${className}`}
      data-testid="app-shell-3"
    >
      {/* Consolidated Header */}
      <header className="h-14 border-b border-border-dark bg-bg-secondary flex-shrink-0">
        <div className="flex items-center justify-between h-full px-6">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <button 
              onClick={() => layout.setSelection({ mode: 'search', folderId: null, fileId: null, searchQuery: '' })}
              className="flex items-center space-x-2 text-text-primary hover:text-accent-blue transition-colors cursor-pointer"
              title="Open search interface (shows all notes in C2, search in C3)"
            >
              <Logo size={28} />
              <span className="text-lg font-medium">TextNotepad.com</span>
            </button>
          </div>

          {/* Center section - Search Bar (Desktop/Tablet only) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={layout.selection.searchQuery || ''}
                onChange={(e) => {
                  const query = e.target.value
                  layout.setSelection({ 
                    mode: 'search', 
                    folderId: null, 
                    fileId: null, 
                    searchQuery: query 
                  })
                  if (layout.isMobile || layout.isTablet) {
                    layout.setActivePane(3)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    layout.setSelection({ 
                      mode: 'notes', 
                      folderId: null, 
                      fileId: null, 
                      searchQuery: '' 
                    })
                    e.currentTarget.blur()
                  }
                }}
                placeholder="Search notes..."
                className="w-full pl-10 pr-10 py-2 bg-bg-primary border border-border-dark rounded-lg text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all duration-200 hover:border-border-light"
              />
              
              {/* Clear button */}
              {layout.selection.searchQuery && (
                <button
                  onClick={() => {
                    layout.setSelection({ 
                      mode: 'notes', 
                      folderId: null, 
                      fileId: null, 
                      searchQuery: '' 
                    })
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary hover:text-text-primary transition-colors"
                  title="Clear search (Esc)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile spacer */}
          <div className="flex-1 md:hidden"></div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => {
                layout.setSelection({ mode: 'search', folderId: null, fileId: null, searchQuery: '' })
                if (layout.isMobile || layout.isTablet) {
                  layout.setActivePane(3)
                }
              }}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-[color:var(--bg-active)]/40 rounded transition-colors"
              title="Open search interface"
            >
              <Search className="w-4 h-4" />
            </button>
            
            {/* Help Button */}
            <button
              onClick={() => {
                layout.setSelection({ mode: 'help', folderId: null, fileId: null })
                if (layout.isMobile || layout.isTablet) {
                  layout.setActivePane(3)
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-[color:var(--bg-active)]/40 rounded transition-colors"
              title="Keyboard shortcuts (Ctrl+/ or ?)"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Authentication UI */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-[color:var(--bg-active)]/40 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main layout container */}
      <div 
        ref={containerRef}
        className="flex-1 flex overflow-hidden h-full"
        style={{
          gridTemplateColumns: layout.breakpoint === 'desktop' 
            ? `${layout.columnWidths.col1}px ${layout.state.col2Width}px 1fr`
            : undefined
        }}
      >
        {/* Column 1: Notebooks Panel */}
        {layout.showSections && (
          <div 
            ref={sectionsRef}
            tabIndex={-1}
            className="flex-shrink-0 outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset transition-all duration-300 ease-in-out"
            style={{ 
              width: layout.breakpoint === 'desktop' 
                ? (layout.state.isCol1Collapsed ? layout.columnWidths.col1Collapsed : layout.columnWidths.col1)
                : '100%' 
            }}
            data-testid="folders-column"
          >
            <FoldersPanel 
              className="h-full"
              selection={layout.selection}
              onSelectionChange={layout.setSelection}
              onMobileAdvance={() => layout.isMobile && layout.setActivePane(2)}
              isCollapsed={layout.state.isCol1Collapsed}
              onToggleCollapsed={layout.actions.toggleCol1Collapsed}
            >
              {sectionsContent}
            </FoldersPanel>
          </div>
        )}

        {/* Column 2: Context List */}
        {layout.showList && (
          <div 
            ref={listRef}
            tabIndex={-1}
            className="flex-shrink-0 outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset transition-all duration-300 ease-in-out"
            style={{ 
              width: layout.breakpoint === 'desktop' 
                ? (layout.state.isCol2Collapsed ? layout.columnWidths.col2Collapsed : layout.state.col2Width)
                : '100%' 
            }}
            data-testid="list-column"
          >
            <ContextList
              className="h-full"
              selection={layout.selection}
              onSelectionChange={layout.setSelection}
              onMobileAdvance={() => (layout.isMobile || layout.isTablet) && layout.setActivePane(3)}
              isCollapsed={layout.state.isCol2Collapsed}
              onToggleCollapsed={layout.actions.toggleCol2Collapsed}
            >
              {listContent}
            </ContextList>
          </div>
        )}

        {/* Resizer (desktop only) - hide when C2 is collapsed */}
        {layout.breakpoint === 'desktop' && layout.showList && layout.showDetail && !layout.state.isCol2Collapsed && (
          <div
            ref={resizerRef}
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
            className={`w-1 bg-border-dark hover:bg-text-secondary cursor-col-resize flex-shrink-0 transition-colors ${
              layout.state.isResizing ? 'bg-accent-blue' : ''
            }`}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
          />
        )}

        {/* Column 3: Detail View */}
        {layout.showDetail && (
          <div 
            ref={detailRef}
            tabIndex={-1}
            className="flex-1 min-w-0 outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-inset"
            style={{ 
              minWidth: layout.breakpoint === 'desktop' ? layout.columnWidths.col3Min : undefined 
            }}
            data-testid="detail-column"
          >
            <DetailView 
              className="h-full"
              selection={layout.selection}
              onFileUpdate={(_updatedFile) => {
                // Could invalidate queries or update cache here
              }}
              onDirtyChange={(_fileId, _isDirty) => {
                // Could track dirty state here
              }}
              onSelectionChange={layout.setSelection}
              onMobileAdvance={() => (layout.isMobile || layout.isTablet) && layout.setActivePane(3)}
            >
              {detailContent}
            </DetailView>
          </div>
        )}
      </div>

      {/* Mobile tab bar */}
      {layout.breakpoint === 'mobile' && <MobileTabBar />}

    </div>
  )
}