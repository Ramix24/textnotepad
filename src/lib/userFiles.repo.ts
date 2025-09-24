import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { UserFile } from '@/types/user-files.types'
import { calculateTextStats } from '@/lib/counters'

// Error classes for better error handling
export class ConflictError extends Error {
  constructor(message: string, public details?: Record<string, unknown>) {
    super(message)
    this.name = 'ConflictError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string, public details?: Record<string, unknown>) {
    super(message)
    this.name = 'NotFoundError'
  }
}

type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Validate and normalize file name
 */
function validateFileName(name?: string): string {
  if (!name || !name.trim()) {
    return 'Untitled'
  }
  
  const trimmed = name.trim()
  if (trimmed.length > 120) {
    return trimmed.substring(0, 117) + '…'
  }
  
  return trimmed
}

/**
 * Get all files for a user (ordered by most recent, excluding deleted)
 */
export async function listFilesForUser(
  supabase: TypedSupabaseClient
): Promise<UserFile[]> {
  const { data: session } = await supabase.auth.getSession()
  
  if (!session.session?.user?.id) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_files')
    .select('*')
    .eq('user_id', session.session.user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data || []
}

/**
 * Get the latest file for a user (most recently updated, not deleted)
 */
export async function getLatestFileForUser(
  supabase: TypedSupabaseClient
): Promise<UserFile | null> {
  const { data: session } = await supabase.auth.getSession()
  
  if (!session.session?.user?.id) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_files')
    .select('*')
    .eq('user_id', session.session.user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // PGRST116 means no rows returned - this is expected when user has no files
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get latest file: ${error.message}`)
  }

  return data
}

/**
 * Create a new file with auto-generated name if none provided
 */
export async function createFile(
  supabase: TypedSupabaseClient,
  params: { name?: string; folder_id?: string | null } = {}
): Promise<UserFile> {
  const { data: session } = await supabase.auth.getSession()
  
  if (!session.session?.user?.id) {
    throw new Error('User not authenticated')
  }

  let fileName = validateFileName(params.name)
  
  // If no name provided or name is "Untitled", generate "Untitled N"
  if (!params.name || fileName === 'Untitled') {
    const existingFiles = await listFilesForUser(supabase)
    const untitledFiles = existingFiles.filter(f => f.name.startsWith('Untitled'))
    const nextNumber = untitledFiles.length > 0 ? untitledFiles.length + 1 : 1
    fileName = nextNumber === 1 ? 'Untitled' : `Untitled ${nextNumber}`
  }

  const defaultContent = ''
  const fileData: any = {
    user_id: session.session.user.id,
    name: fileName,
    content: defaultContent,
    folder_id: params.folder_id || null,
    word_count: 0,
    char_count: 0,
    line_count: 0,
    size_bytes: new TextEncoder().encode(defaultContent).length,
    version: 1,
    is_new: true,
  }

  const { data, error } = await supabase
    .from('user_files')
    .insert(fileData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create file: ${error.message}`)
  }

  return data
}

/**
 * Create a default "Untitled" file for the user
 */
export async function createDefaultFile(
  supabase: TypedSupabaseClient
): Promise<UserFile> {
  return createFile(supabase)
}

/**
 * Rename a file
 */
export async function renameFile(
  supabase: TypedSupabaseClient,
  params: { id: string; name: string }
): Promise<UserFile> {
  const { data: session } = await supabase.auth.getSession()
  
  if (!session.session?.user?.id) {
    throw new Error('User not authenticated')
  }

  const validatedName = validateFileName(params.name)

  const { data, error } = await supabase
    .from('user_files')
    .update({ 
      name: validatedName,
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .eq('user_id', session.session.user.id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('File not found or access denied')
    }
    throw new Error(`Failed to rename file: ${error.message}`)
  }

  return data
}

/**
 * Soft delete a file (set deleted_at timestamp)
 */
export async function softDeleteFile(
  supabase: TypedSupabaseClient,
  params: { id: string }
): Promise<UserFile> {
  const { data: session } = await supabase.auth.getSession()
  
  if (!session.session?.user?.id) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_files')
    .update({ 
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', params.id)
    .eq('user_id', session.session.user.id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('File not found or access denied')
    }
    throw new Error(`Failed to delete file: ${error.message}`)
  }

  return data
}

/**
 * Get a file by ID (with user authorization check)
 */
export async function getFileById(
  supabase: TypedSupabaseClient,
  id: string
): Promise<UserFile> {
  const { data: session } = await supabase.auth.getSession()
  
  if (!session.session?.user?.id) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('user_files')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.session.user.id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('File not found or access denied')
    }
    throw new Error(`Failed to get file: ${error.message}`)
  }

  return data
}

/**
 * Update file content with optimistic locking (version check)
 * Throws ConflictError if version mismatch occurs
 */
export async function updateFileContent(
  supabase: TypedSupabaseClient,
  params: {
    id: string
    content: string
    word_count: number
    char_count: number
    line_count: number
    size_bytes: number
    version: number
  }
): Promise<UserFile> {
  const { data: session } = await supabase.auth.getSession()
  
  if (!session.session?.user?.id) {
    throw new Error('User not authenticated')
  }

  const { id, content, word_count, char_count, line_count, size_bytes, version } = params

  // Update with version increment and version check for optimistic locking
  const { data, error } = await supabase
    .from('user_files')
    .update({
      content,
      word_count,
      char_count,
      line_count,
      size_bytes,
      version: version + 1,
      is_new: false, // File is no longer new once content is updated
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', session.session.user.id)
    .eq('version', version) // Optimistic locking - only update if version matches
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ConflictError(
        'File was modified by another process. Please refresh and try again.',
        { id, version }
      )
    }
    throw new Error(`Failed to update file content: ${error.message}`)
  }

  return data
}

/**
 * Calculate content statistics for a file
 */
export function calculateContentStats(content: string): {
  word_count: number
  char_count: number
  line_count: number
  size_bytes: number
} {
  const { words, chars, lines, bytes } = calculateTextStats(content)

  return {
    word_count: words,
    char_count: chars,
    line_count: lines,
    size_bytes: bytes,
  }
}

/**
 * Get the latest file for user, creating a default one if none exists
 * This is the main function for initializing the current document state
 */
export async function getOrCreateLatestFile(
  supabase: TypedSupabaseClient
): Promise<UserFile> {
  let file = await getLatestFileForUser(supabase)
  
  if (!file) {
    file = await createDefaultFile(supabase)
  }
  
  return file
}

// TODO Sprint 5: Replace this simple repo with full CRUD operations including:
// - File listing with pagination and search
// - Bulk operations (delete multiple files)
// - File sharing and collaboration features
// - Advanced file management (copy, rename, organize)
// - Real-time collaboration with conflict resolution
// - File history and version management
// - Import/export in various formats