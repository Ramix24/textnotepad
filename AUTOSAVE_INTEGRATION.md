# Autosave Integration Guide

This document explains how to integrate the `useAutosave` hook for automatic file saving in the TextNotepad editor.

## Overview

The `useAutosave` hook provides intelligent autosave functionality with:
- **Debouncing**: Waits for typing to stop before saving (default: 1000ms)
- **Throttling**: Limits save frequency during continuous typing (default: 2000ms)
- **Optimistic Updates**: Immediate UI feedback with rollback on errors
- **Conflict Resolution**: Handles concurrent edits gracefully
- **TanStack Query Integration**: Automatic cache management

## Setup Requirements

### 1. Install Dependencies

```bash
pnpm add @tanstack/react-query
```

### 2. Query Client Provider

Wrap your app with the QueryClient provider:

```tsx
// src/app/layout.tsx
import { QueryProvider } from '@/components/QueryProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

## Basic Usage

### Simple Integration

```tsx
import { useAutosave } from '@/hooks/useAutosave'
import { useState, useCallback } from 'react'

function Editor({ file }: { file: UserFile }) {
  const [content, setContent] = useState(file.content)
  
  const { isSaving, isDirty, markDirty } = useAutosave({
    file,
    onSaved: (updatedFile) => {
      console.log('File saved successfully', updatedFile)
    },
    onConflict: (conflictingFile) => {
      // Handle version conflict
      setContent(conflictingFile.content)
      toast.error('File was modified elsewhere. Content refreshed.')
    }
  })

  const handleChange = useCallback((newContent: string) => {
    setContent(newContent)
    markDirty(newContent) // Triggers autosave pipeline
  }, [markDirty])

  return (
    <div>
      <textarea 
        value={content} 
        onChange={(e) => handleChange(e.target.value)} 
      />
      {isSaving && <span>Saving...</span>}
      {isDirty && !isSaving && <span>Unsaved changes</span>}
    </div>
  )
}
```

### Advanced Configuration

```tsx
const { isSaving, isDirty, markDirty, forceSave, cancelPendingSave } = useAutosave({
  file,
  config: {
    debounceMs: 500,   // Save 500ms after typing stops
    throttleMs: 1500   // Max 1 save per 1.5 seconds
  },
  onSaved: (updatedFile) => {
    // Handle successful save
    updateFileInState(updatedFile)
    showSuccessMessage()
  },
  onConflict: (conflictingFile) => {
    // Handle version conflict
    if (confirm('File was modified elsewhere. Load latest version?')) {
      setContent(conflictingFile.content)
    }
  }
})
```

## API Reference

### Hook Parameters

```tsx
interface UseAutosaveOptions {
  file: UserFile                    // Current file object
  onSaved?: (updatedFile: UserFile) => void  // Success callback
  onConflict?: (conflictingFile: UserFile) => void  // Conflict callback
  config?: {
    debounceMs?: number             // Debounce delay (default: 1000ms)
    throttleMs?: number             // Throttle interval (default: 2000ms)
  }
}
```

### Return Values

```tsx
interface UseAutosaveReturn {
  isSaving: boolean                 // Is save operation in progress
  isDirty: boolean                  // Has unsaved changes
  markDirty: (content: string) => void  // Trigger autosave for content
  forceSave: () => Promise<void>    // Force immediate save
  cancelPendingSave: () => void     // Cancel pending save
}
```

## Integration Patterns

### 1. Real-time Editor

```tsx
function RealTimeEditor({ file }: { file: UserFile }) {
  const [content, setContent] = useState(file.content)
  const [wordCount, setWordCount] = useState(0)
  
  const { isSaving, isDirty, markDirty } = useAutosave({
    file,
    onSaved: (updatedFile) => {
      // Update file metadata
      setWordCount(updatedFile.word_count)
    }
  })

  const handleChange = useCallback((newContent: string) => {
    setContent(newContent)
    markDirty(newContent)
    
    // Update local statistics immediately
    setWordCount(calculateWordCount(newContent))
  }, [markDirty])

  return (
    <div className="editor">
      <div className="editor-header">
        <span>Words: {wordCount}</span>
        <StatusIndicator isSaving={isSaving} isDirty={isDirty} />
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        className="editor-textarea"
      />
    </div>
  )
}
```

### 2. Multi-section Document

```tsx
function DocumentEditor({ file }: { file: UserFile }) {
  const [sections, setSections] = useState(parseContent(file.content))
  
  const { markDirty } = useAutosave({
    file,
    config: { debounceMs: 1500 } // Longer debounce for complex docs
  })

  const updateSection = useCallback((index: number, newContent: string) => {
    const newSections = [...sections]
    newSections[index] = newContent
    setSections(newSections)
    
    // Save combined content
    const combinedContent = newSections.join('\n---\n')
    markDirty(combinedContent)
  }, [sections, markDirty])

  return (
    <div className="document">
      {sections.map((section, index) => (
        <SectionEditor
          key={index}
          content={section}
          onChange={(content) => updateSection(index, content)}
        />
      ))}
    </div>
  )
}
```

### 3. Collaborative Editor

```tsx
function CollaborativeEditor({ file }: { file: UserFile }) {
  const [content, setContent] = useState(file.content)
  const [conflictResolution, setConflictResolution] = useState<'merge' | 'replace' | null>(null)
  
  const { markDirty } = useAutosave({
    file,
    onConflict: (conflictingFile) => {
      // Show conflict resolution UI
      setConflictResolution('merge')
      
      // Option 1: Auto-merge (simple strategy)
      const mergedContent = mergeContents(content, conflictingFile.content)
      setContent(mergedContent)
      
      // Option 2: Let user choose
      // showConflictDialog(content, conflictingFile.content)
    }
  })

  return (
    <div>
      {conflictResolution && (
        <ConflictBanner 
          onResolve={() => setConflictResolution(null)}
        />
      )}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          markDirty(e.target.value)
        }}
      />
    </div>
  )
}
```

## Error Handling

The hook handles two main error scenarios:

### 1. Version Conflicts

```tsx
const { markDirty } = useAutosave({
  file,
  onConflict: (conflictingFile) => {
    // File was modified by another user/session
    const choice = confirm(
      'This file was modified elsewhere. Do you want to:\n' +
      '• OK: Load the latest version (lose your changes)\n' +
      '• Cancel: Keep your version (may cause conflicts)'
    )
    
    if (choice) {
      setContent(conflictingFile.content)
      toast.info('File refreshed with latest changes')
    } else {
      toast.warning('Keeping local changes - save manually to resolve')
    }
  }
})
```

### 2. Network/Server Errors

```tsx
// The hook automatically shows toast errors for:
// - Network connectivity issues
// - Server validation errors
// - Authentication failures
// - Other unexpected errors

// You can add additional error handling:
const { markDirty, forceSave } = useAutosave({
  file,
  onSaved: (updatedFile) => {
    // Reset error state on successful save
    setHasError(false)
  }
})

// Manual retry for failed saves
const retrySave = useCallback(async () => {
  try {
    await forceSave()
  } catch (error) {
    setHasError(true)
    // Show retry UI
  }
}, [forceSave])
```

## Performance Considerations

### 1. Debounce/Throttle Tuning

```tsx
// For fast typists or real-time collaboration:
const config = {
  debounceMs: 300,  // Quick response
  throttleMs: 1000  // Frequent updates
}

// For long-form writing or slow connections:
const config = {
  debounceMs: 2000,  // Let user finish thoughts
  throttleMs: 5000   // Reduce server load
}

// For mobile or low-power devices:
const config = {
  debounceMs: 1500,  // Battery optimization
  throttleMs: 3000   // Reduce background activity
}
```

### 2. Large Documents

```tsx
// For documents > 10KB, consider:
const { markDirty } = useAutosave({
  file,
  config: {
    debounceMs: 1000,
    throttleMs: 3000  // Longer throttle for large docs
  }
})

// Optional: Split large documents into chunks
const useChunkedAutosave = (file: UserFile, chunkSize = 5000) => {
  // Implementation would split content and save incrementally
}
```

## Testing

### 1. Manual Testing Checklist

- [ ] Type continuously - should debounce saves
- [ ] Type rapidly - should throttle to max frequency
- [ ] Stop typing - should save after debounce period
- [ ] Disconnect network - should show error and retry
- [ ] Open same file in two tabs - should handle conflicts
- [ ] Force save - should bypass debounce/throttle
- [ ] Cancel changes - should clear dirty state

### 2. Integration Tests

```tsx
// Test with mock file
const mockFile: UserFile = {
  id: 'test-id',
  content: 'test content',
  version: 1,
  // ... other properties
}

// Test autosave behavior in your components
```

## Best Practices

1. **Always handle conflicts gracefully** - Don't lose user data
2. **Provide clear status indicators** - Users should know save state
3. **Test with slow networks** - Ensure good UX during delays
4. **Consider user preferences** - Allow autosave on/off toggle
5. **Monitor performance** - Watch for excessive saves or memory leaks
6. **Handle edge cases** - Empty content, very large files, special characters

## Troubleshooting

### Common Issues

1. **Hook not working**: Ensure QueryProvider is set up
2. **Saves not triggering**: Check that markDirty is called
3. **Too many saves**: Increase debounce/throttle times
4. **Conflicts not handled**: Implement onConflict callback
5. **Memory leaks**: Check component unmounting properly

### Debug Mode

```tsx
// Enable debug logging
const { markDirty } = useAutosave({
  file,
  onSaved: (file) => console.log('Saved:', file),
  onConflict: (file) => console.warn('Conflict:', file)
})
```