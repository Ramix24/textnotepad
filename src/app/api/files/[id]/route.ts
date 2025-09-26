import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { getFileById, renameFile, softDeleteFile, restoreFile, permanentDeleteFile } from '@/lib/userFiles.repo'
import { UserFile } from '@/types/user-files.types'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

interface UpdateFileRequest {
  name?: string
}

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/files/[id] - Get a specific file by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<UserFile>>> {
  const { id } = await params
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

    const file = await getFileById(supabase, id)
    
    return NextResponse.json({ data: file })
  } catch (error) {
    console.error(`GET /api/files/${id} error:`, error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('User not authenticated')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to get file' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/files/[id] - Update file (currently supports renaming)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<UserFile>>> {
  const { id } = await params
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
    let body: UpdateFileRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Currently only supports name updates (rename)
    if (body.name === undefined) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const file = await renameFile(supabase, {
      id,
      name: body.name
    })
    
    return NextResponse.json({ data: file })
  } catch (error) {
    console.error(`PATCH /api/files/${id} error:`, error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('User not authenticated')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      // Validation errors
      if (error.message.includes('name')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update file' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/files/[id] - Soft delete a file
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  const { id } = await params
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

    await softDeleteFile(supabase, { id })
    
    // 204 No Content for successful deletion
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(`DELETE /api/files/${id} error:`, error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('User not authenticated')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/files/[id]?action=restore - Restore a soft-deleted file
 * POST /api/files/[id]?action=permanent-delete - Permanently delete a file
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<UserFile | { id: string }>>> {
  const { id } = await params
  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  try {
    const supabase = await createServerClient()

    if (action === 'restore') {
      // Restore a soft-deleted file
      const restoredFile = await restoreFile(supabase, { id })
      
      return NextResponse.json({
        data: restoredFile
      }, { status: 200 })
      
    } else if (action === 'permanent-delete') {
      // Permanently delete a file
      const result = await permanentDeleteFile(supabase, { id })
      
      return NextResponse.json({
        data: result
      }, { status: 200 })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=restore or ?action=permanent-delete' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error(`POST /api/files/${id} error:`, error)
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      if (error.message.includes('not in trash')) {
        return NextResponse.json(
          { error: 'File is not in trash' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('already restored')) {
        return NextResponse.json(
          { error: 'File is already restored' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('User not authenticated')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    return NextResponse.json(
      { error: `Failed to ${action} file` },
      { status: 500 }
    )
  }
}