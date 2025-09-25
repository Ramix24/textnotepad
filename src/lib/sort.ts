import { UserFile } from '@/types/user-files.types'
import { SortOption } from '@/components/sort-dropdown'

export interface Folder {
  id: string
  name: string
  created_at: string
  updated_at?: string
}

export function sortFiles(files: UserFile[], sortBy: SortOption): UserFile[] {
  const sortedFiles = [...files]

  switch (sortBy) {
    case 'name-asc':
      return sortedFiles.sort((a, b) => a.name.localeCompare(b.name))
    
    case 'name-desc':
      return sortedFiles.sort((a, b) => b.name.localeCompare(a.name))
    
    case 'modified-desc':
      return sortedFiles.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    
    case 'modified-asc':
      return sortedFiles.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
    
    case 'created-desc':
      return sortedFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    case 'created-asc':
      return sortedFiles.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    default:
      return sortedFiles
  }
}

export function sortFolders(folders: Folder[], sortBy: SortOption): Folder[] {
  const sortedFolders = [...folders]

  switch (sortBy) {
    case 'name-asc':
      return sortedFolders.sort((a, b) => a.name.localeCompare(b.name))
    
    case 'name-desc':
      return sortedFolders.sort((a, b) => b.name.localeCompare(a.name))
    
    case 'modified-desc':
      // If folders don't have updated_at, fall back to created_at
      return sortedFolders.sort((a, b) => {
        const aDate = new Date(a.updated_at || a.created_at).getTime()
        const bDate = new Date(b.updated_at || b.created_at).getTime()
        return bDate - aDate
      })
    
    case 'modified-asc':
      return sortedFolders.sort((a, b) => {
        const aDate = new Date(a.updated_at || a.created_at).getTime()
        const bDate = new Date(b.updated_at || b.created_at).getTime()
        return aDate - bDate
      })
    
    case 'created-desc':
      return sortedFolders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    case 'created-asc':
      return sortedFolders.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    default:
      return sortedFolders
  }
}

// Get the default sort option for different contexts
export function getDefaultSort(): SortOption {
  return 'name-asc' // Name A-Z by default
}