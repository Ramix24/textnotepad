import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { listFilesForUser, createFile } from '@/lib/userFiles.repo'
import { UserFile } from '@/types/user-files.types'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

interface CreateFileRequest {
  name?: string
  folder_id?: string | null
}

/**
 * GET /api/files - List all files for authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<UserFile[]>>> {
  try {
    const supabase = await createServerClient()
    const url = new URL(request.url)
    const includeDeleted = url.searchParams.get('include_deleted') === 'true'
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const files = await listFilesForUser(supabase, includeDeleted)
    
    return NextResponse.json({ data: files })
  } catch {
    // GET /api/files error
    
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/files - Create a new file
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<UserFile>>> {
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    let body: CreateFileRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const file = await createFile(supabase, { 
      name: body.name,
      folder_id: body.folder_id 
    })
    
    return NextResponse.json(
      { data: file },
      { status: 201 }
    )
  } catch (error) {
    // POST /api/files error
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('User not authenticated')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 }
    )
  }
}