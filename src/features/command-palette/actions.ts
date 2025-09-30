'use client'

import { UserFile } from '@/types/user-files.types'
import { UserFolder } from '@/types/folders.types'

export type CommandContext = {
  getState: () => {
    currentNoteId?: string
    currentFolderId?: string
    folders: UserFolder[]
    files: UserFile[]
  }
  api: {
    searchNotes: (query: string) => Promise<{ id: string; title: string; snippet?: string }[]>
    createNote: (folderId?: string) => Promise<{ id: string }>
    createFolder: (name: string) => Promise<{ id: string }>
    moveNote: (noteId: string, folderId: string) => Promise<void>
    exportNotePdf: (noteId: string) => Promise<Blob>
    toggleDarkMode: () => void
    openNote: (id: string) => void
    openFolder: (id: string) => void
    copyNoteLink: (noteId: string) => void
    openSearch: (query?: string) => void
  }
}

export type CommandAction =
  | {
      id: string
      label: string
      description?: string
      keywords?: string[]
      icon?: string
      run: (ctx: CommandContext) => Promise<void> | void
    }
  | {
      id: string
      label: string
      description?: string
      keywords?: string[]
      icon?: string
      needsArg: 'folder' | 'note' | 'text'
      run: (ctx: CommandContext, arg: unknown) => Promise<void> | void
    }

export function registerDefaultActions(_ctx: CommandContext): CommandAction[] {
  return [
    // Core actions
    {
      id: 'new-note',
      label: 'New Note',
      description: 'Create a new note',
      keywords: ['create', 'add', 'new', 'note'],
      icon: 'FileText',
      run: async (ctx: CommandContext) => {
        const state = ctx.getState()
        await ctx.api.createNote(state.currentFolderId)
      }
    },
    {
      id: 'new-folder',
      label: 'New Folder',
      description: 'Create a new folder',
      keywords: ['create', 'add', 'new', 'folder', 'notebook'],
      icon: 'FolderPlus',
      run: async (ctx: CommandContext) => {
        // This would need a text input step
        const name = `Folder ${new Date().toLocaleDateString()}`
        await ctx.api.createFolder(name)
      }
    },
    {
      id: 'toggle-dark-mode',
      label: 'Toggle Dark Mode',
      description: 'Switch between light and dark theme',
      keywords: ['theme', 'dark', 'light', 'mode'],
      icon: 'Moon',
      run: (ctx: CommandContext) => {
        ctx.api.toggleDarkMode()
      }
    },
    {
      id: 'search-notes',
      label: 'Search Notes',
      description: 'Open search interface',
      keywords: ['search', 'find', 'query'],
      icon: 'Search',
      run: (ctx: CommandContext) => {
        ctx.api.openSearch()
      }
    },
    {
      id: 'copy-note-link',
      label: 'Copy Link to Current Note',
      description: 'Copy a shareable link to the clipboard',
      keywords: ['copy', 'link', 'share', 'url'],
      icon: 'Link',
      run: (ctx: CommandContext) => {
        const state = ctx.getState()
        if (state.currentNoteId) {
          ctx.api.copyNoteLink(state.currentNoteId)
        }
      }
    }
  ]
}

// Mock implementations for dev mode
export const mockApi = {
  searchNotes: async (query: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock search results
    return [
      { id: '1', title: 'Meeting Notes', snippet: 'Quarterly review discussion...' },
      { id: '2', title: 'Project Ideas', snippet: 'Brainstorming session results...' },
      { id: '3', title: 'Todo List', snippet: 'Things to accomplish this week...' }
    ].filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.snippet?.toLowerCase().includes(query.toLowerCase())
    )
  },
  
  exportNotePdf: async (_noteId: string): Promise<Blob> => {
    // Mock PDF export
    await new Promise(resolve => setTimeout(resolve, 1000))
    return new Blob(['PDF mock content'], { type: 'application/pdf' })
  }
}