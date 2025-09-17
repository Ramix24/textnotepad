import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('Callback URL:', requestUrl.href)
  console.log('Code parameter:', code ? 'present' : 'missing')

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
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        // Auth callback error
        return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
      }

      // Success - redirect to app
      return NextResponse.redirect(new URL('/app', requestUrl.origin))
    } catch {
      // Auth callback unexpected error
      return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
    }
  }

  // No code parameter - redirect to home with error
  console.log('No code parameter found, redirecting with error')
  return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
}