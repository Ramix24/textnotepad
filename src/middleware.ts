import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  )

  try {
    // Get the current session (temporarily disabled)
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession()

    // TEMPORARY: Disable auth check for testing
    // If user is not authenticated and trying to access /app routes
    // if (!session && request.nextUrl.pathname.startsWith('/app')) {
    //   const redirectUrl = new URL('/', request.url)
    //   
    //   // Optionally preserve the intended destination as a query parameter
    //   redirectUrl.searchParams.set('next', request.nextUrl.pathname)
    //   
    //   return NextResponse.redirect(redirectUrl)
    // }

    return response
  } catch {
    // If there's an error checking auth, redirect to home for safety
    // Middleware auth error
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/app/:path*']
}