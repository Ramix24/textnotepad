import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'

export async function GET() {
  try {
    console.log('Debug: Starting auth check...')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE
    
    console.log('Debug: Environment variables check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceRole: !!serviceRole,
      urlStart: supabaseUrl?.substring(0, 20) + '...'
    })

    // Try to create server client
    const supabase = await createServerClient()
    console.log('Debug: Server client created')
    
    // Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    console.log('Debug: Session check:', {
      hasSession: !!sessionData.session,
      hasUser: !!sessionData.session?.user,
      userId: sessionData.session?.user?.id,
      error: sessionError?.message
    })

    // Try to get user
    const { data: userData, error: userError } = await supabase.auth.getUser()
    console.log('Debug: User check:', {
      hasUser: !!userData.user,
      userId: userData.user?.id,
      email: userData.user?.email,
      error: userError?.message
    })

    return NextResponse.json({
      success: true,
      environment: {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        hasServiceRole: !!serviceRole,
        urlStart: supabaseUrl?.substring(0, 30) + '...'
      },
      session: {
        hasSession: !!sessionData.session,
        hasUser: !!sessionData.session?.user,
        userId: sessionData.session?.user?.id,
        sessionError: sessionError?.message
      },
      user: {
        hasUser: !!userData.user,
        userId: userData.user?.id,
        email: userData.user?.email,
        userError: userError?.message
      }
    })
  } catch (error) {
    console.error('Debug: Auth check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}