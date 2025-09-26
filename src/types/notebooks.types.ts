export interface UserNotebook {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface CreateNotebookRequest {
  name: string
}

export interface UpdateNotebookRequest {
  name: string
}

export interface NotebookWithFileCount extends UserNotebook {
  file_count: number
}