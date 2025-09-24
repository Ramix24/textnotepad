'use client'

import { ReactNode, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useColumnsLayout } from '@/hooks/useColumnsLayout'
import { useKeyboardNav } from '@/hooks/useKeyboardNav'
import { useCreateFile } from '@/hooks/useFiles'
import { useSupabase } from '@/components/SupabaseProvider'
import { useAuthSession } from '@/hooks/useAuthSession'
import { SectionsRail } from './SectionsRail'
import { ContextList } from './ContextList'
import { DetailView } from './DetailView'
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
        name: `Note ${new Date().toLocaleDateString()}`
      })
      
      layout.setSelection({
        ...layout.selection,
        fileId: newFile.id,
        section: 'notes'
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

  // Handle sign out
  const handleSignOut = useCallback(async () => {
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

  // Mobile tab bar with better active states
  const MobileTabBar = () => {
    const tabs = [
      { key: 'sections', label: 'Sections', icon: '📁', pane: 1 as const },
      { key: 'list', label: 'Notes', icon: '📝', pane: 2 as const },
      { key: 'detail', label: 'Editor', icon: '✏️', pane: 3 as const }
    ]

    return (
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-700 flex safe-area-pb"
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
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-95'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-500 rounded-full" />
              )}
              
              {/* Icon */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${isActive 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                  : 'bg-transparent text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800'
                }
              `}>
                <span className="text-base">{tab.icon}</span>
              </div>
              
              {/* Label */}
              <span className={`
                leading-none transition-colors
                ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}
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
      <header className="h-12 border-b border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/60 flex-shrink-0">
        <div className="flex items-center justify-between h-full px-4">
          <div className="text-sm font-medium text-foreground">
            TextNotepad
          </div>
          <div className="flex items-center gap-4">
            {layout.isDesktop && (
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">1</kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">2</kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">3</kbd>
                <span>to focus</span>
                <span>·</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded border">⌘N</kbd>
                <span>new</span>
              </div>
            )}
            
            {/* User Authentication UI */}
            {user && (
              <div className="flex items-center gap-3">
                {user.email && (
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {user.email}
                  </span>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8"
                >
                  <LogOut className="h-3 w-3 mr-1.5" />
                  <span className="hidden sm:inline">Sign out</span>
                  <span className="sm:hidden">Exit</span>
                </Button>
              </div>
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
        {/* Column 1: Sections Rail */}
        {layout.showSections && (
          <div 
            ref={sectionsRef}
            tabIndex={-1}
            className="flex-shrink-0 outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset"
            style={{ 
              width: layout.breakpoint === 'desktop' ? layout.columnWidths.col1 : '100%' 
            }}
            data-testid="sections-column"
          >
            <SectionsRail 
              className="h-full"
              activeSection={layout.selection.section}
              onSectionSelect={(section) => {
                layout.setSelection({ 
                  section, 
                  fileId: null, // Clear fileId when changing sections
                  folderId: section === 'folders' ? layout.selection.folderId : null 
                })
              }}
              onMobileAdvance={() => layout.isMobile && layout.setActivePane(2)}
            >
              {sectionsContent}
            </SectionsRail>
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
              layout.state.isResizing ? 'bg-indigo-500' : ''
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
            className="flex-1 min-w-0 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-inset"
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
    </div>
  )
}