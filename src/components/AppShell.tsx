'use client'

import { ReactNode } from 'react'

interface AppShellProps {
  sidebar: ReactNode
  content: ReactNode
}

export function AppShell({ sidebar, content }: AppShellProps) {
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
            <div className="text-xs text-muted-foreground">
              Ready
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background">
          {content}
        </main>
      </div>
    </div>
  )
}