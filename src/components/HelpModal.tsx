'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-bg-primary border border-border-dark rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-dark">
          <h2 className="text-xl font-semibold text-text-primary">
            ⌨️ Keyboard Shortcuts & Markdown Guide
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-active rounded transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Close help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Inline Shortcuts */}
          <section>
            <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
              🎯 <span>Inline Shortcuts</span>
              <span className="text-sm text-text-secondary font-normal">(type + Enter)</span>
            </h3>
            <div className="grid gap-3">
              <ShortcutRow 
                trigger="## Heading text" 
                description="Creates heading and continues with ##" 
              />
              <ShortcutRow 
                trigger="> Quote text" 
                description="Creates quote block and continues" 
              />
              <ShortcutRow 
                trigger="- List item" 
                description="Creates bullet list and continues" 
              />
              <ShortcutRow 
                trigger="1. Numbered item" 
                description="Creates numbered list and continues" 
              />
              <ShortcutRow 
                trigger="[] Task item" 
                description="Creates task list with checkboxes" 
              />
            </div>
          </section>

          {/* Editor Shortcuts */}
          <section>
            <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
              ⌨️ <span>Editor Shortcuts</span>
            </h3>
            <div className="grid gap-3">
              <ShortcutRow 
                trigger="Ctrl+S" 
                description="Force save (bypasses auto-save delay)" 
              />
              <ShortcutRow 
                trigger="Ctrl+B" 
                description="Bold selected text or cursor position" 
              />
              <ShortcutRow 
                trigger="Ctrl+I" 
                description="Italic selected text or cursor position" 
              />
              <ShortcutRow 
                trigger="Ctrl+K" 
                description="Insert link (auto-detects clipboard URLs)" 
              />
              <ShortcutRow 
                trigger="Ctrl+`" 
                description="Code formatting for selected text" 
              />
              <ShortcutRow 
                trigger="Tab" 
                description="Indent with 2 spaces (markdown-friendly)" 
              />
              <ShortcutRow 
                trigger="Shift+Tab" 
                description="Remove indentation (outdent)" 
              />
              <ShortcutRow 
                trigger="Enter" 
                description="Smart list continuation and shortcuts" 
              />
            </div>
          </section>

          {/* Navigation Shortcuts */}
          <section>
            <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
              🗂️ <span>Navigation Shortcuts</span>
            </h3>
            <div className="grid gap-3">
              <ShortcutRow 
                trigger="Ctrl+N" 
                description="Create new note" 
              />
              <ShortcutRow 
                trigger="Ctrl+K" 
                description="Global search (when not in editor)" 
              />
              <ShortcutRow 
                trigger="Ctrl+/" 
                description="Show/hide this help modal" 
              />
              <ShortcutRow 
                trigger="?" 
                description="Show this help modal" 
              />
            </div>
          </section>

          {/* Markdown Reference */}
          <section>
            <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
              📝 <span>Markdown Reference</span>
            </h3>
            <div className="grid gap-3">
              <ShortcutRow 
                trigger="**bold text**" 
                description="Bold formatting" 
              />
              <ShortcutRow 
                trigger="*italic text*" 
                description="Italic formatting" 
              />
              <ShortcutRow 
                trigger="`code text`" 
                description="Inline code formatting" 
              />
              <ShortcutRow 
                trigger="[link text](url)" 
                description="Link formatting" 
              />
              <ShortcutRow 
                trigger="- [ ] task" 
                description="Task list with checkbox" 
              />
              <ShortcutRow 
                trigger="- [x] done" 
                description="Completed task" 
              />
            </div>
          </section>

          {/* Pro Tips */}
          <section>
            <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
              💡 <span>Pro Tips</span>
            </h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p>• Auto-save triggers 1 second after you stop typing</p>
              <p>• Copy a URL and use Ctrl+K for instant link creation</p>
              <p>• Empty list items automatically end the list when you press Enter</p>
              <p>• Text wrapping is always enabled for better mobile experience</p>
              <p>• Line numbers can be toggled on desktop layouts</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-dark bg-bg-secondary">
          <p className="text-xs text-text-secondary text-center">
            Press <kbd className="px-1.5 py-0.5 bg-bg-active border border-border-dark rounded text-xs">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  )
}

interface ShortcutRowProps {
  trigger: string
  description: string
}

function ShortcutRow({ trigger, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded bg-bg-secondary hover:bg-bg-active transition-colors">
      <kbd className="px-2 py-1 bg-bg-active border border-border-dark rounded text-sm font-mono text-text-primary">
        {trigger}
      </kbd>
      <span className="text-sm text-text-secondary flex-1 ml-4">
        {description}
      </span>
    </div>
  )
}