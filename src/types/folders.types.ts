export interface UserFolder {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface CreateFolderRequest {
  name: string
}

export interface UpdateFolderRequest {
  name: string
}

export interface FolderWithFileCount extends UserFolder {
  file_count: number
}