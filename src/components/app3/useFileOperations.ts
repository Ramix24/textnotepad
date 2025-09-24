import { useState } from 'react'
import { UserFile } from '@/types/user-files.types'
import { useCreateFile, useRenameFile, useDeleteFile } from '@/hooks/useFiles'

interface UseFileOperationsOptions {
  onFileSelect?: (fileId: string) => void
  onFileCreated?: (file: UserFile) => void
  onFileDeleted?: (fileId: string) => void
  currentFolderId?: string | null
}

export function useFileOperations(options: UseFileOperationsOptions = {}) {
  const { onFileSelect, onFileCreated, onFileDeleted, currentFolderId } = options
  
  const createFile = useCreateFile()
  const renameFile = useRenameFile()
  const deleteFile = useDeleteFile()
  
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const handleCreateFile = async (name?: string) => {
    try {
      const newFile = await createFile.mutateAsync({
        name: name || `Note ${new Date().toLocaleDateString()}`,
        folder_id: currentFolderId
      })
      onFileCreated?.(newFile)
      onFileSelect?.(newFile.id)
      return newFile
    } catch (error) {
      // Error handling is done in the hook
      throw error
    }
  }

  const handleFileClick = (file: UserFile) => {
    if (renamingFileId === file.id) return // Don't select while renaming
    onFileSelect?.(file.id)
  }

  const handleStartRename = (file: UserFile) => {
    setRenamingFileId(file.id)
    setRenameValue(file.name)
  }

  const handleRenameCommit = async (fileId: string) => {
    if (!renameValue.trim()) {
      handleRenameCancel()
      return
    }
    
    try {
      await renameFile.mutateAsync({ id: fileId, name: renameValue.trim() })
    } catch {
      // Error handling is done in the hook
    } finally {
      setRenamingFileId(null)
      setRenameValue('')
    }
  }

  const handleRenameCancel = () => {
    setRenamingFileId(null)
    setRenameValue('')
  }

  const handleDelete = async (file: UserFile, currentFileId?: string, allFiles: UserFile[] = []) => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await deleteFile.mutateAsync(file.id)
        
        // If we deleted the currently selected file, select the next logical file
        if (currentFileId === file.id) {
          const activeFiles = allFiles.filter(f => f.id !== file.id && !f.deleted_at)
          
          if (activeFiles.length > 0) {
            // Sort by updated_at (most recent first) to match list order
            const sortedFiles = activeFiles.sort((a, b) => 
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )
            
            // Find the current file index in the original sorted list
            const originalSorted = allFiles
              .filter(f => !f.deleted_at)
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            
            const currentIndex = originalSorted.findIndex(f => f.id === file.id)
            
            // Select the next file in the list, or the previous one if we're at the end
            let nextFile = sortedFiles[Math.min(currentIndex, sortedFiles.length - 1)]
            
            // If that didn't work, just pick the first one
            if (!nextFile) {
              nextFile = sortedFiles[0]
            }
            
            onFileSelect?.(nextFile.id)
          } else {
            // No files left, clear selection
            onFileSelect?.('')
          }
        }
        
        onFileDeleted?.(file.id)
      } catch {
        // Error handling is done in the hook
      }
    }
  }

  return {
    // State
    renamingFileId,
    renameValue,
    
    // Mutations
    createFile,
    renameFile,
    deleteFile,
    
    // Handlers
    handleCreateFile,
    handleFileClick,
    handleStartRename,
    handleRenameCommit,
    handleRenameCancel,
    handleDelete,
    
    // Setters for direct manipulation
    setRenameValue,
  }
}