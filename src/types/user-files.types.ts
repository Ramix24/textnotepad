import { Database } from './database.types'

// Derived types from generated database types
export type UserFile = Database['public']['Tables']['user_files']['Row']
export type InsertUserFile = Database['public']['Tables']['user_files']['Insert']
export type UpdateUserFile = Database['public']['Tables']['user_files']['Update']

// Helper types for common operations
export type UserFileWithoutTimestamps = Omit<UserFile, 'created_at' | 'updated_at'>
export type UserFileForDisplay = Omit<UserFile, 'user_id' | 'deleted_at'>
export type UserFileMetadata = Pick<UserFile, 'id' | 'name' | 'word_count' | 'char_count' | 'line_count' | 'size_bytes' | 'version' | 'is_new' | 'created_at' | 'updated_at'>

// CRUD operation signatures (implementation will be added later)
export interface UserFileOperations {
  // Create new file
  create(file: InsertUserFile): Promise<UserFile>
  
  // Read operations
  getById(id: string): Promise<UserFile | null>
  getByUserId(userId: string): Promise<UserFile[]>
  getActiveByUserId(userId: string): Promise<UserFile[]> // excludes soft-deleted
  
  // Update operations
  update(id: string, updates: UpdateUserFile): Promise<UserFile>
  updateContent(id: string, content: string): Promise<UserFile>
  
  // Soft delete
  softDelete(id: string): Promise<UserFile>
  restore(id: string): Promise<UserFile>
  
  // Hard delete (admin only)
  hardDelete(id: string): Promise<void>
  
  // Utility operations
  calculateStats(content: string): Pick<UserFile, 'word_count' | 'char_count' | 'line_count' | 'size_bytes'>
  incrementVersion(id: string): Promise<UserFile>
}

// Error types for better error handling
export class UserFileError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'VERSION_CONFLICT' | 'VALIDATION_ERROR',
    public details?: any
  ) {
    super(message)
    this.name = 'UserFileError'
  }
}

// Validation schemas (can be used with zod or similar)
export interface UserFileValidation {
  name: {
    minLength: 1
    maxLength: 255
    pattern: RegExp // e.g., /^[a-zA-Z0-9._-]+$/
  }
  content: {
    maxLength: 1000000 // 1MB as character limit
  }
}