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
import { GlobalSearchModal } from '@/components/global-search-modal'
import { HelpModal } from '@/components/HelpModal'
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
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isHelpOpen, setIsHelpOpen] = React.useState(false)
  
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

  // Handle file selection from search
  const handleFileSelect = useCallback((fileId: string) => {
    layout.setSelection({
      ...layout.selection,
      mode: 'notes',
      fileId
    })
    
    // Focus detail view after selecting file
    if (layout.isMobile || layout.isTablet) {
      layout.setActivePane(3)
    }
    setTimeout(() => detailRef.current?.focus(), 100)
  }, [layout])

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
        e.preventDefault()
        setIsSearchOpen(true)
      } else if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setIsHelpOpen(true)
      } else if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only trigger if not in an input field
        const activeElement = document.activeElement
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setIsHelpOpen(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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
      {/* Header */}
      <header className="h-14 border-b border-border-dark bg-bg-secondary flex-shrink-0">
        <div className="flex items-center justify-between h-full px-6">
          <button 
            onClick={() => layout.setSelection({ mode: 'search', folderId: null, fileId: null, searchQuery: '' })}
            className="text-lg font-medium text-text-primary hover:text-accent-blue transition-colors cursor-pointer"
            title="Search all notes"
          >
            TextNotepad.com
          </button>
          
          {/* Global Search */}
          <div className="flex-1 max-w-md mx-8">
            <div 
              className="relative cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="w-full pl-10 pr-4 py-2 text-sm border border-border-dark rounded-lg bg-bg-primary text-text-secondary placeholder:text-text-secondary hover:bg-bg-secondary transition-colors">
                Search notes...
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-bg-active text-text-secondary rounded font-mono">⌘K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Help Button */}
            <button
              onClick={() => setIsHelpOpen(true)}
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
            className="flex-shrink-0 outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
            style={{ 
              width: layout.breakpoint === 'desktop' ? layout.columnWidths.col1 : '100%' 
            }}
            data-testid="folders-column"
          >
            <FoldersPanel 
              className="h-full"
              selection={layout.selection}
              onSelectionChange={layout.setSelection}
              onMobileAdvance={() => layout.isMobile && layout.setActivePane(2)}
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
            className="flex-shrink-0 outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
            style={{ 
              width: layout.breakpoint === 'desktop' ? layout.state.col2Width : '100%' 
            }}
            data-testid="list-column"
          >
            <ContextList
              className="h-full"
              selection={layout.selection}
              onSelectionChange={layout.setSelection}
              onMobileAdvance={() => (layout.isMobile || layout.isTablet) && layout.setActivePane(3)}
            >
              {listContent}
            </ContextList>
          </div>
        )}

        {/* Resizer (desktop only) */}
        {layout.breakpoint === 'desktop' && layout.showList && layout.showDetail && (
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

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onFileSelect={handleFileSelect}
      />
      
      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  )
}