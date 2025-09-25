'use client'

import { ReactNode } from 'react'
import { Folder, FileText, MessageCircle, Trash2 } from 'lucide-react'
import type { Section } from './types'

interface SectionsRailProps {
  children?: ReactNode
  className?: string
  activeSection?: Section
  onSectionSelect?: (section: Section) => void
  onMobileAdvance?: () => void // For mobile navigation to pane 2
}

export function SectionsRail({ 
  children, 
  className = '',
  activeSection = 'folders',
  onSectionSelect,
  onMobileAdvance
}: SectionsRailProps) {
  
  const handleSectionClick = (section: Section) => {
    onSectionSelect?.(section)
    onMobileAdvance?.() // Auto-advance to pane 2 on mobile
  }

  return (
    <div 
      className={`flex flex-col bg-zinc-50/30 dark:bg-zinc-800/30 border-r border-zinc-200 dark:border-zinc-700 ${className}`}
      role="navigation"
      aria-label="Sections"
    >
      {children || (
        <DefaultSectionsContent 
          activeSection={activeSection}
          onSectionSelect={handleSectionClick}
        />
      )}
    </div>
  )
}

interface DefaultSectionsContentProps {
  activeSection: Section
  onSectionSelect: (section: Section) => void
}

function DefaultSectionsContent({ activeSection, onSectionSelect }: DefaultSectionsContentProps) {
  const sections: Array<{ id: Section; label: string; icon: any; disabled?: boolean }> = [
    { id: 'folders', label: 'Folders', icon: Folder },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageCircle, disabled: true },
    { id: 'trash', label: 'Trash', icon: Trash2 }
  ]

  return (
    <div className="flex flex-col p-2 gap-1">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => !section.disabled && onSectionSelect(section.id)}
          disabled={section.disabled}
          className={`
            flex flex-col items-center justify-center p-3 rounded-lg text-xs font-medium transition-colors
            ${activeSection === section.id 
              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' 
              : section.disabled
                ? 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }
          `}
          title={section.disabled ? 'Coming soon' : section.label}
        >
          <section.icon className="h-5 w-5 mb-1" />
          <span className="leading-none">{section.label}</span>
          {section.disabled && (
            <span className="text-[9px] text-muted-foreground/60 mt-1">Soon</span>
          )}
        </button>
      ))}
    </div>
  )
}