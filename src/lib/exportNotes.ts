import JSZip from 'jszip'
import { UserFile } from '@/types/user-files.types'

export interface ExportOptions {
  includeDeleted?: boolean
  format?: 'txt' | 'md'
}

/**
 * Sanitize filename for ZIP entry
 */
function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters for filesystem
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .trim()
    .substring(0, 100) // Limit length
}

/**
 * Export all notes as a ZIP file
 */
export async function exportAllNotes(
  files: UserFile[],
  options: ExportOptions = {}
): Promise<void> {
  if (!files || files.length === 0) {
    throw new Error('No notes to export')
  }

  const { format = 'txt', includeDeleted = false } = options
  
  // Filter files if needed
  const filesToExport = includeDeleted 
    ? files 
    : files.filter(file => !file.deleted_at)

  if (filesToExport.length === 0) {
    throw new Error('No notes available for export')
  }

  try {
    const zip = new JSZip()
    
    // Track filename collisions
    const usedFilenames = new Set<string>()
    
    filesToExport.forEach((file, index) => {
      const content = file.content || ''
      const filename = sanitizeFilename(file.name || `untitled_${index + 1}`)
      
      // Handle filename collisions
      let finalFilename = filename
      let counter = 1
      while (usedFilenames.has(`${finalFilename}.${format}`)) {
        finalFilename = `${filename}_${counter}`
        counter++
      }
      
      const fullFilename = `${finalFilename}.${format}`
      usedFilenames.add(fullFilename)
      
      // Add file to ZIP
      zip.file(fullFilename, content)
    })
    
    // Add metadata file
    const metadata = {
      exportDate: new Date().toISOString(),
      totalFiles: filesToExport.length,
      format,
      source: 'TextNotepad'
    }
    zip.file('export_info.json', JSON.stringify(metadata, null, 2))
    
    // Generate ZIP blob
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })
    
    // Create download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    
    const timestamp = new Date().toISOString().split('T')[0]
    a.download = `textnotepad_notes_${timestamp}.zip`
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('Export failed:', error)
    throw new Error('Failed to create ZIP file')
  }
}