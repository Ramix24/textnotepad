# Command Palette

A powerful command palette (Quick Actions) for TextNotepad that provides keyboard-driven access to common actions and search functionality.

## Features

- **Keyboard shortcuts**: `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS) to open
- **Fuzzy search**: Find notes, folders, and actions with intelligent matching
- **Organized sections**: Actions, Notes, Folders with clear visual separation
- **Accessibility**: Full keyboard navigation with ARIA support
- **Dark/Light theme**: Respects system theme preferences

## Available Actions

### Core Actions
- **New Note**: Create a new note in the current folder
- **New Folder**: Create a new folder/notebook
- **Toggle Dark Mode**: Switch between light and dark themes
- **Search Notes**: Open the search interface
- **Copy Link to Current Note**: Copy a shareable link to clipboard

## Usage

### Opening the Command Palette
- Keyboard: `Ctrl+K` or `Cmd+K`
- Click: "Quick Actions" button in the header

### Navigation
- `↑/↓`: Navigate between items
- `Tab`: Switch between sections (Actions → Notes → Folders)
- `Enter`: Execute selected action or open item
- `Esc`: Close the palette

### Search
- Type to search across all sections
- Fuzzy matching finds items even with partial/misspelled queries
- Real-time results as you type

## Integration

The command palette is integrated into the app through:

1. **Provider**: `CommandPaletteProvider` wraps the entire app in `layout.tsx`
2. **Context**: `useCommandPaletteContext()` hook provides access to open/close functions
3. **Button**: Header includes "Quick Actions" button for mouse users

## Technical Implementation

### Files Structure
- `actions.ts`: Action definitions and command context
- `useCommandPalette.ts`: React hook for state management
- `CommandPalette.tsx`: UI component with search and navigation
- `CommandPaletteProvider.tsx`: Context provider and integration layer

### Key Technologies
- **Fuse.js**: Fuzzy search functionality
- **React Portals**: Modal rendering outside component tree
- **TanStack Query**: Integration with existing data layer
- **Tailwind CSS**: Styling and responsive design

## Future Enhancements (Phase 2)

- Recent actions tracking
- Complex actions with arguments (e.g., "Move note to folder")
- Advanced search with content snippets
- Custom action registration
- Performance optimizations for large datasets