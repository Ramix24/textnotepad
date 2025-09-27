'use client'
import { RefObject } from 'react'

interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  setContent: (content: string) => void
  insertLink: () => void
  disabled?: boolean
}

export function MarkdownToolbar({ textareaRef, setContent, insertLink, disabled }: MarkdownToolbarProps) {
  const surround = (markerLeft: string, markerRight = markerLeft) => {
    const el = textareaRef.current
    if (!el || disabled) return

    const { selectionStart: start, selectionEnd: end, value } = el
    const before = value.slice(0, start)
    const selected = value.slice(start, end)
    const after = value.slice(end)

    const isWrapped = selected.startsWith(markerLeft) && selected.endsWith(markerRight)

    const newContent = isWrapped
      ? before + selected.slice(markerLeft.length, selected.length - markerRight.length) + after
      : before + markerLeft + selected + markerRight + after

    setContent(newContent)

    requestAnimationFrame(() => {
      const newStart = isWrapped ? start : start + markerLeft.length
      const newEnd = isWrapped ? end - markerLeft.length - markerRight.length : end + markerLeft.length
      el.setSelectionRange(newStart, newEnd)
      el.focus()
    })
  }

  const insertPrefix = (prefix: string) => {
    const el = textareaRef.current
    if (!el || disabled) return

    const { selectionStart: start, selectionEnd: end, value } = el
    const before = value.slice(0, start)
    const selected = value.slice(start, end)
    const after = value.slice(end)

    const lines = selected.split('\n')
    const newSelected = lines.map(line => line.length ? `${prefix}${line}` : line).join('\n')
    const newContent = before + newSelected + after

    setContent(newContent)

    requestAnimationFrame(() => {
      el.setSelectionRange(start, start + newSelected.length)
      el.focus()
    })
  }

  return (
    <div className="h-10 bg-bg-secondary border-b border-border-dark flex items-center gap-1 px-3">
      <ToolbarButton onClick={() => surround('**')} disabled={disabled} title="Bold (Ctrl+B)">
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton onClick={() => surround('*')} disabled={disabled} title="Italic (Ctrl+I)">
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton onClick={() => surround('`')} disabled={disabled} title="Code (Ctrl+`)">
        Code
      </ToolbarButton>

      <Separator />

      <ToolbarButton onClick={() => insertPrefix('# ')} disabled={disabled} title="Heading 1">
        H1
      </ToolbarButton>
      <ToolbarButton onClick={() => insertPrefix('## ')} disabled={disabled} title="Heading 2">
        H2
      </ToolbarButton>
      <ToolbarButton onClick={() => insertPrefix('### ')} disabled={disabled} title="Heading 3">
        H3
      </ToolbarButton>

      <Separator />

      <ToolbarButton onClick={() => insertPrefix('- ')} disabled={disabled} title="Bullet List">
        • List
      </ToolbarButton>
      <ToolbarButton onClick={() => insertPrefix('1. ')} disabled={disabled} title="Numbered List">
        1. List
      </ToolbarButton>

      <Separator />

      <ToolbarButton onClick={insertLink} disabled={disabled} title="Link (Ctrl+K)">
        Link
      </ToolbarButton>
      <ToolbarButton onClick={() => surround('> ')} disabled={disabled} title="Quote">
        Quote
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  children,
  disabled,
  title,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { title: string }) {
  return (
    <button
      {...props}
      disabled={disabled}
      title={title}
      className="px-2 py-1 rounded-md hover:bg-bg-active focus:outline-none focus:ring-1 focus:ring-accent-blue text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}

function Separator() {
  return <div className="w-px h-5 bg-border-dark mx-1" />
}