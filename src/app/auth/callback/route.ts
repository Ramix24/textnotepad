import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
  }

  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options?: Record<string, unknown>) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, _options?: Record<string, unknown>) {
            cookieStore.delete(name)
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
    }

    if (data.session && data.user) {
      // Successful authentication - redirect to app
      return NextResponse.redirect(new URL('/app', requestUrl.origin))
    }

    // No session established
    return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
    
  } catch {
    return NextResponse.redirect(new URL('/?authError=1', requestUrl.origin))
  }
}