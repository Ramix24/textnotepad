'use client'

import * as React from 'react'
import { ReactNode, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  
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
        router.push('/')
      }
    } catch {
      toast.error('Sign out failed', {
        description: 'An unexpected error occurred during sign out.',
      })
    }
  }, [supabase, router])

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
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Mobile tab bar with better active states
  const MobileTabBar = () => {
    const tabs = [
      { key: 'folders', label: 'Folders', icon: '📁', pane: 1 as const },
      { key: 'notes', label: 'Notes', icon: '📝', pane: 2 as const },
      { key: 'editor', label: 'Editor', icon: '✏️', pane: 3 as const }
    ]

    return (
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex safe-area-pb"
        data-testid="mobile-tab-bar"
      >
        {tabs.map((tab) => {
          const isActive = layout.activePane === tab.pane
          return (
            <button
              key={tab.key}
              onClick={() => layout.setActivePane(tab.pane)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 relative
                ${isActive 
                  ? 'text-blue-500 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 active:scale-95'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-400 rounded-full" />
              )}
              
              {/* Icon */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${isActive 
                  ? 'bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                  : 'bg-transparent text-gray-500 dark:text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                }
              `}>
                <span className="text-base">{tab.icon}</span>
              </div>
              
              {/* Label */}
              <span className={`
                leading-none transition-colors
                ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}
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
      className={`fixed inset-0 flex flex-col overflow-hidden bg-background ${className}`}
      data-testid="app-shell-3"
    >
      {/* Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between h-full px-6">
          <div className="text-lg font-medium text-gray-900 dark:text-white">
            textnotepad.com
          </div>
          
          {/* Global Search */}
          <div className="flex-1 max-w-md mx-8">
            <div 
              className="relative cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:placeholder-gray-400 hover:bg-white dark:hover:bg-gray-600 transition-colors">
                Search notes...
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded font-mono">⌘K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Authentication UI */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
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
        className="flex-1 flex overflow-hidden"
        style={{
          gridTemplateColumns: layout.breakpoint === 'desktop' 
            ? `${layout.columnWidths.col1}px ${layout.state.col2Width}px 1fr`
            : undefined
        }}
      >
        {/* Column 1: Folders Panel */}
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
            className={`w-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 cursor-col-resize flex-shrink-0 transition-colors ${
              layout.state.isResizing ? 'bg-blue-400' : ''
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
    </div>
  )
}