import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Ensure we have required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return response
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options?: Record<string, unknown>) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options?: Record<string, unknown>) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    })

    // Get the current session with error handling
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return response
    }

    // If user is not authenticated and trying to access /app routes
    if (!session && request.nextUrl.pathname.startsWith('/app')) {
      const redirectUrl = new URL('/', request.url)
      
      // Preserve the intended destination as a query parameter
      redirectUrl.searchParams.set('next', request.nextUrl.pathname)
      
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch {
    // If there's an error in middleware, don't crash
    return response
  }
}

// TEMPORARY: Disable middleware to test client-side auth only
// export const config = {
//   matcher: ['/app/:path*']
// }