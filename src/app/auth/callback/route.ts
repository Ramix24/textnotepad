import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, _options?: Record<string, unknown>) {
            cookieStore.set(name, value, _options)
          },
          remove(name: string, _options?: Record<string, unknown>) {
            cookieStore.delete(name)
          },
        },
      }
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        // Check for clock skew errors specifically
        if (error.message.includes('issued in the future') || error.message.includes('clock skew')) {
          // For clock skew errors, try to refresh the session
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (!refreshError) {
            return NextResponse.redirect(new URL('/app', requestUrl.origin))
          }
        }
        return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
      }

      // Verify we have a valid session
      if (data.session && data.user) {
        // Success - redirect to app
        return NextResponse.redirect(new URL('/app', requestUrl.origin))
      }

      // No valid session established
      return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
    } catch {
      // Auth callback unexpected error
      return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
    }
  }

  // No code parameter - redirect to home with error
  return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
}