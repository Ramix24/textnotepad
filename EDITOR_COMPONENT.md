# Editor Component Documentation

The `<Editor/>` component is the core text editing interface for TextNotepad with advanced features for modern document editing.

## Features

### 🎯 **Core Functionality**
- **Monospace textarea** for clean, readable text editing
- **Real-time statistics** (words, characters, lines, file size)
- **Smart autosave** with conflict resolution
- **Visual indicators** for unsaved changes and save status
- **Keyboard shortcuts** (Ctrl/Cmd+S for manual save)

### 🚀 **Performance**
- **Web Worker statistics** - non-blocking text analysis
- **Debounced autosave** - 1 second delay after typing stops
- **Throttled saves** - maximum 1 save every 2 seconds
- **Optimistic updates** - immediate UI feedback

### ♿ **Accessibility**
- **ARIA labels** and descriptions
- **Live regions** for statistics updates
- **Keyboard navigation** support
- **High contrast** compatible
- **Screen reader** optimized

## Component Structure

```
Editor
├── Toolbar
│   ├── File name + dirty indicator (●)
│   ├── Version number
│   └── Save status (Saving/Saved/Unsaved)
├── Textarea (main editing area)
└── Status Bar
    ├── Statistics (Words | Chars | Lines | Size)
    └── File info (encoding, last modified)
```

## Usage

```tsx
import { Editor } from '@/components/Editor'

function DocumentView({ file }: { file: UserFile }) {
  const [currentFile, setCurrentFile] = useState(file)

  return (
    <div className="h-screen">
      <Editor 
        file={currentFile}
        onFileUpdate={setCurrentFile}
        className="h-full"
      />
    </div>
  )
}
```

## Props

```typescript
interface EditorProps {
  file: UserFile                    // The document to edit
  className?: string                // Additional CSS classes
  onFileUpdate?: (file: UserFile) => void  // Called when file is updated
}
```

## Visual Indicators

### Save Status
| State | Display | Color | Description |
|-------|---------|-------|-------------|
| Saved | "Saved" | Green | All changes saved |
| Unsaved | "Unsaved" | Amber | Local changes not saved |
| Saving | "Saving…" | Blue | Save in progress |

### Dirty Indicator
- **Red dot (●)** appears next to filename when there are unsaved changes
- Disappears immediately when save completes
- Accessible via `title` and `aria-label` attributes

## Keyboard Shortcuts

| Shortcut | Action | Notes |
|----------|--------|-------|
| `Ctrl/Cmd + S` | Force save | Bypasses debounce, immediate save |

## Statistics Display

Live statistics powered by Web Worker:
- **Words**: Text split by whitespace and punctuation
- **Characters**: UTF-16 code units (JavaScript string length)
- **Lines**: Count of `\n` characters + 1
- **Size**: UTF-8 byte size for storage estimation

## Autosave Behavior

### Timing
- **Debounce**: 1000ms after typing stops
- **Throttle**: Maximum 1 save every 2000ms during continuous typing
- **Manual save**: Immediate via Ctrl/Cmd+S

### Conflict Resolution
When the file is modified elsewhere:
1. **Detect conflict** via version mismatch
2. **Fetch latest** from server
3. **Last write wins** - replace local content
4. **Notify user** via toast message
5. **Update UI** with server content

## Error Handling

### Save Errors
- **Network issues**: Toast error with retry suggestion
- **Validation errors**: Toast with specific error message
- **Authentication**: Toast prompting re-login

### Statistics Errors
- **Worker failure**: Graceful fallback, no statistics shown
- **Calculation timeout**: Shows "Calculating..." until resolved

## State Management

### Local State
```typescript
const [content, setContent] = useState(file.content)     // Current text
const [isDirty, setIsDirty] = useState(false)           // Has unsaved changes
const [stats, setStats] = useState<CountResult | null>  // Current statistics
const [isLoadingStats, setIsLoadingStats] = useState   // Stats calculation
```

### Integration Points
- **useCountersWorker**: Live statistics calculation
- **useAutosave**: Smart saving with conflict resolution
- **TanStack Query**: Cache management and optimistic updates

## Customization

### Font Options
The editor uses monospace by default but can be customized:

```tsx
// In your CSS or Tailwind config
.editor-textarea {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; /* Code editing */
  /* or */
  font-family: 'Inter', 'Helvetica', sans-serif; /* Prose writing */
}
```

### Theming
All colors use CSS custom properties and adapt to light/dark themes:
- Uses shadcn/ui design tokens
- Supports system theme detection
- High contrast mode compatible

## Testing

### Manual Testing
1. **Type rapidly** - verify debounced saving
2. **Stop typing** - save should trigger after 1 second
3. **Use Ctrl+S** - immediate save should work
4. **Open file in multiple tabs** - conflict resolution should work
5. **Disconnect network** - error handling should work

### Integration Testing
```tsx
// Test with mock file
const mockFile: UserFile = {
  id: 'test',
  content: 'test content',
  version: 1,
  // ... other properties
}

render(<Editor file={mockFile} />)
```

## Performance Considerations

### Large Documents (>50KB)
- Web Worker prevents UI blocking
- Consider splitting very large documents
- Monitor memory usage in dev tools

### Mobile Devices
- Font size is 16px minimum (prevents iOS zoom)
- Touch-friendly interface elements
- Optimized for smaller screens

## Browser Support

- **Modern browsers**: Full feature support
- **Safari**: Web Worker and all features supported
- **Mobile browsers**: Optimized interface
- **Legacy browsers**: Graceful degradation

## Future Enhancements

Planned features for future versions:
- **Syntax highlighting** for code files
- **Collaborative editing** with real-time cursors
- **Plugin system** for custom functionality
- **Export options** (PDF, Markdown, etc.)
- **Vim/Emacs keybindings**

## Troubleshooting

### Common Issues

1. **Statistics not updating**
   - Check Web Worker support in browser
   - Verify network connectivity

2. **Autosave not working**
   - Ensure TanStack Query provider is set up
   - Check authentication status

3. **Performance issues**
   - Monitor document size
   - Check for memory leaks in dev tools

4. **Conflicts not resolving**
   - Verify server connection
   - Check error console for details