import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { z } from 'zod'
import { UserFolder, CreateFolderRequest } from '@/types/folders.types'

interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

const createNotebookSchema = z.object({
  name: z.string().min(1).max(255)
})

/**
 * GET /api/folders - List all notebooks for authenticated user
 */
export async function GET(): Promise<NextResponse<ApiResponse<UserFolder[]>>> {
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

    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('GET /api/folders error:', error)
      return NextResponse.json(
        { ok: false, error: 'Failed to list folders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data: folders })
  } catch (error) {
    console.error('GET /api/folders error:', error)
    
    return NextResponse.json(
      { ok: false, error: 'Failed to list folders' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/folders - Create a new folder
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<UserFolder>>> {
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
    let body: CreateFolderRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate request body
    const validation = createNotebookSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name: validation.data.name
      })
      .select()
      .single()
    
    if (error) {
      console.error('POST /api/folders error:', error)
      return NextResponse.json(
        { ok: false, error: 'Failed to create folder' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { ok: true, data: folder },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/folders error:', error)
    
    return NextResponse.json(
      { ok: false, error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}