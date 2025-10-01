'use client'

interface HelpInterfaceProps {
  className?: string
}

export function HelpInterface({ className = '' }: HelpInterfaceProps) {
  return (
    <div className={`flex flex-col h-full bg-bg-primary ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border-dark bg-bg-secondary">
        <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          ⌨️ Keyboard Shortcuts Guide
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          Master keyboard shortcuts, markdown syntax, and search features
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
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
              trigger="Ctrl+/" 
              description="Show/hide this help page" 
            />
            <ShortcutRow 
              trigger="?" 
              description="Show this help page" 
            />
            <ShortcutRow 
              trigger="Ctrl+Shift+[" 
              description="Toggle notes list (C2) for focus mode" 
            />
          </div>
        </section>

        {/* Search Features */}
        <section>
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            🔍 <span>Search Features</span>
          </h3>
          <div className="grid gap-3">
            <ShortcutRow 
              trigger="Search by title/content" 
              description="Type to search through all your notes instantly" 
            />
            <ShortcutRow 
              trigger="Tasks filter" 
              description="Find notes with tasks (- [ ] or - [x])" 
            />
            <ShortcutRow 
              trigger="Recent filter" 
              description="Show notes updated within last 7 days" 
            />
            <ShortcutRow 
              trigger="Click TextNotepad.com" 
              description="Open search interface (C2: all notes, C3: search)" 
            />
            <ShortcutRow 
              trigger="All Notes button" 
              description="Show all notes with search interface" 
            />
          </div>
          <div className="mt-4 p-3 bg-bg-secondary rounded-lg">
            <h4 className="text-sm font-medium text-text-primary mb-2">Task Detection:</h4>
            <div className="space-y-1 text-sm text-text-secondary">
              <p>• <code className="bg-bg-active px-1 rounded">- [ ] Buy groceries</code> → Unchecked task</p>
              <p>• <code className="bg-bg-active px-1 rounded">- [x] Finished work</code> → Completed task</p>
            </div>
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

        {/* Focus Mode */}
        <section>
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            🎯 <span>Focus Modes</span>
          </h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>• <strong>Full Browse Mode:</strong> All panels visible (C1 folders + C2 notes list + C3 editor)</p>
            <p>• <strong>Structured Focus:</strong> Collapse C1 for more writing space while keeping notes list</p>
            <p>• <strong>Maximum Focus:</strong> Collapse both C1 and C2 for distraction-free writing</p>
            <p>• Use the chevron buttons in the header or keyboard shortcuts to toggle panels</p>
            <p>• Settings are automatically saved and restored between sessions</p>
          </div>
        </section>

        {/* Pro Tips */}
        <section>
          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
            💡 <span>Pro Tips</span>
          </h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>• Auto-save triggers 1 second after you stop typing</p>
            <p>• Copy a URL and use Ctrl+K for instant link creation in editor</p>
            <p>• Empty list items automatically end the list when you press Enter</p>
            <p>• Text wrapping is always enabled for better mobile experience</p>
            <p>• Line numbers can be toggled on desktop layouts</p>
            <p>• Click any note to switch from search mode to reading mode</p>
            <p>• Use search icon in header for fast navigation</p>
            <p>• Consolidated header shows note title and save status when editing</p>
          </div>
        </section>
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