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
          set(name: string, value: string, _options: any) {
            cookieStore.set(name, value, _options)
          },
          remove(name: string, _options: any) {
            cookieStore.delete(name)
          },
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
      }

      // Success - redirect to app
      return NextResponse.redirect(new URL('/app', requestUrl.origin))
    } catch (error) {
      console.error('Auth callback unexpected error:', error)
      return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
    }
  }

  // No code parameter - redirect to home with error
  return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
}