import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    // Check what cookies are being sent
    const cookies = request.cookies
    const cookieNames: string[] = []
    
    // Get all cookie names
    const cookieEntries = cookies.getAll()
    for (const cookie of cookieEntries) {
      cookieNames.push(cookie.name)
    }
    
    // Look for Supabase auth cookies specifically
    const authCookies = cookieNames.filter(name => 
      name.includes('supabase') || name.includes('auth') || name.includes('sb-')
    )
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE

    // Try to create server client
    const supabase = await createServerClient()
    
    // Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Try to get user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    return NextResponse.json({
      success: true,
      cookies: {
        total: cookieNames.length,
        authCookies: authCookies,
        allCookieNames: cookieNames
      },
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
    // Auth check failed
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}