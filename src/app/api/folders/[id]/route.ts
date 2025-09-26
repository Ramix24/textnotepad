import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { z } from 'zod'
import { UserNotebook, UpdateNotebookRequest } from '@/types/notebooks.types'

interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

const updateFolderSchema = z.object({
  name: z.string().min(1).max(255)
})

/**
 * PUT /api/folders/[id] - Rename a folder
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<UserNotebook>>> {
  const params = await context.params
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    let body: UpdateNotebookRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate request body
    const validation = updateFolderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Check if folder exists and belongs to user
    const { data: existingFolder, error: checkError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingFolder) {
      return NextResponse.json(
        { ok: false, error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Update folder
    const { data: folder, error } = await supabase
      .from('folders')
      .update({
        name: validation.data.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('PUT /api/folders/[id] error:', error)
      return NextResponse.json(
        { ok: false, error: 'Failed to update folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data: folder })
  } catch (error) {
    console.error('PUT /api/folders/[id] error:', error)
    
    return NextResponse.json(
      { ok: false, error: 'Failed to update folder' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/folders/[id] - Delete a folder
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const params = await context.params
  try {
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if folder exists and belongs to user
    const { data: existingFolder, error: checkError } = await supabase
      .from('folders')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingFolder) {
      return NextResponse.json(
        { ok: false, error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Delete folder - files will be moved to null folder_id due to ON DELETE SET NULL
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('DELETE /api/folders/[id] error:', error)
      return NextResponse.json(
        { ok: false, error: 'Failed to delete folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data: { id: params.id } })
  } catch (error) {
    console.error('DELETE /api/folders/[id] error:', error)
    
    return NextResponse.json(
      { ok: false, error: 'Failed to delete folder' },
      { status: 500 }
    )
  }
}