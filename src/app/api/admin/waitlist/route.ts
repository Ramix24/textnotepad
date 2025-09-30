import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with error handling for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  // Supabase credentials not found - admin endpoints will be disabled
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Simple auth check - in production you'd want proper authentication
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminPassword) {
    // ADMIN_PASSWORD not set - admin endpoint disabled
    return false
  }
  
  return authHeader === `Bearer ${adminPassword}`
}

export async function GET(request: NextRequest) {
  // Check if Supabase is available
  if (!supabase) {
    return NextResponse.json(
      { error: 'Admin features not available - missing configuration' },
      { status: 503 }
    )
  }

  // Simple authentication
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get waitlist entries
    const { data: entries, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    // Get stats by source
    const { data: statsData, error: statsError } = await supabase
      .from('waitlist')
      .select('source')

    if (statsError) {
      throw statsError
    }

    const stats = {
      total: count || 0,
      waitlist: statsData?.filter(item => item.source === 'waitlist').length || 0,
      beta: statsData?.filter(item => item.source === 'beta').length || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        entries,
        stats,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0)
        }
      }
    })

  } catch {
    // Admin waitlist error
    return NextResponse.json(
      { error: 'Failed to fetch waitlist data' },
      { status: 500 }
    )
  }
}

// Export individual email addresses for easy copy/paste
export async function POST(request: NextRequest) {
  // Check if Supabase is available
  if (!supabase) {
    return NextResponse.json(
      { error: 'Admin features not available - missing configuration' },
      { status: 503 }
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { source } = await request.json()

    let query = supabase
      .from('waitlist')
      .select('email, name, created_at')
      .order('created_at', { ascending: false })

    if (source && ['waitlist', 'beta'].includes(source)) {
      query = query.eq('source', source)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Format for easy export
    const csvData = data?.map(entry => ({
      email: entry.email,
      name: entry.name || '',
      created_at: new Date(entry.created_at).toLocaleDateString()
    })) || []

    const emailList = data?.map(entry => entry.email).join(', ') || ''

    return NextResponse.json({
      success: true,
      data: {
        count: data?.length || 0,
        emails: emailList,
        csv: csvData
      }
    })

  } catch {
    // Admin export error
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}