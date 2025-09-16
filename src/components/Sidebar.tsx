'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, FileText, Folder, Plus, Settings } from 'lucide-react'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [width, setWidth] = useState(256) // Default width in pixels
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const startResize = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return
    
    isResizing.current = true
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX
    const startWidth = width
    
    // Add user-select none to prevent text selection during resize
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      
      const deltaX = e.clientX - startX
      const newWidth = Math.min(Math.max(startWidth + deltaX, 224), window.innerWidth * 0.5) // Min 224px, Max 50vw
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [width, isCollapsed])

  return (
    <div className="relative flex h-full">
      {/* Main sidebar container */}
      <div 
        ref={sidebarRef}
        className={`flex flex-col h-full bg-card transition-all duration-300 ${
          isCollapsed ? 'w-12' : ''
        }`}
        style={isCollapsed ? {} : { width: `${width}px` }}
      >
        {/* Header with collapse button */}
        <div className="flex items-center justify-between h-12 px-4 border-b border-border/50">
          {!isCollapsed && (
            <h2 className="text-sm font-medium text-foreground">Explorer</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-7 w-7 hover:bg-muted/50 transition-colors"
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Action buttons */}
        {!isCollapsed && (
          <div className="px-4 py-3 space-y-1.5">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start h-8 text-xs font-normal"
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              New Document
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start h-8 text-xs font-normal hover:bg-muted/50"
            >
              <Folder className="h-3.5 w-3.5 mr-2" />
              Open Folder
            </Button>
          </div>
        )}

        {/* File list */}
        <div className="flex-1 overflow-auto">
          {isCollapsed ? (
            <div className="flex flex-col items-center py-4 space-y-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted/50"
                aria-label="Document"
              >
                <FileText className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted/50"
                aria-label="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="px-4 py-2">
              <div 
                className="mb-3 px-2"
                style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#9ca3af',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                RECENT FILES
              </div>
              <div className="space-y-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-7 px-2 text-xs font-normal hover:bg-muted/50"
                >
                  <FileText className="h-3.5 w-3.5 mr-2.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">Untitled Document.md</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-7 px-2 text-xs font-normal hover:bg-muted/50"
                >
                  <FileText className="h-3.5 w-3.5 mr-2.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">Meeting Notes.txt</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-7 px-2 text-xs font-normal hover:bg-muted/50"
                >
                  <FileText className="h-3.5 w-3.5 mr-2.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">Project Ideas.md</span>
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-7 px-2 text-xs font-normal hover:bg-muted/50"
              >
                <Settings className="h-3.5 w-3.5 mr-2.5 shrink-0 text-muted-foreground" />
                <span className="truncate">Settings</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* WORKING RESIZE HANDLE - GUARANTEED VISIBLE */}
      {!isCollapsed && (
        <div
          onMouseDown={startResize}
          role="separator"
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          title="DRAG HERE TO RESIZE SIDEBAR"
          style={{
            width: '6px',
            height: '100%',
            cursor: 'col-resize',
            flexShrink: 0,
            position: 'relative',
            backgroundColor: 'transparent',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {/* Subtle grip indicator */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            alignItems: 'center',
            opacity: '0.4'
          }}>
            <div style={{
              width: '1px',
              height: '4px',
              backgroundColor: '#9ca3af',
              borderRadius: '0.5px'
            }} />
            <div style={{
              width: '1px',
              height: '4px',
              backgroundColor: '#9ca3af',
              borderRadius: '0.5px'
            }} />
            <div style={{
              width: '1px',
              height: '4px',
              backgroundColor: '#9ca3af',
              borderRadius: '0.5px'
            }} />
          </div>
        </div>
      )}
    </div>
  )
}