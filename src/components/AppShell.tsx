'use client'

import { ReactNode, useState, useEffect } from 'react'
import { HelpModal } from '@/components/HelpModal'
import { HelpCircle } from 'lucide-react'

interface AppShellProps {
  sidebar: ReactNode
  content: ReactNode
}

export function AppShell({ sidebar, content }: AppShellProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // Global keyboard shortcuts for help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
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

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      {/* Sidebar with resize handle */}
      {sidebar}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header bar */}
        <header className="h-12 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center justify-between h-full px-4">
            <div className="text-sm font-medium text-foreground">
              TextNotepad
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                title="Keyboard shortcuts (Ctrl+/ or ?)"
              >
                <HelpCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Help</span>
              </button>
              <div className="text-xs text-muted-foreground">
                Ready
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background">
          {content}
        </main>
      </div>
      
      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  )
}