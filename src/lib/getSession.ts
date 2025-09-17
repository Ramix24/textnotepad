import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Session, User } from '@supabase/supabase-js'

/**
 * Server-side session utility
 * 
 * Gets the current user session from server-side context using cookies.
 * Use this in Server Components, API routes, and other server-side contexts.
 * 
 * @returns Object containing session and user data
 */
export async function getSession(): Promise<{
  session: Session | null
  user: User | null
}> {
  try {
    // Ensure we have required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { session: null, user: null }
    }

    const cookieStore = await cookies()
    
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options?: Record<string, unknown>) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Ignore cookie set errors in Server Components
          }
        },
        remove(name: string, _options?: Record<string, unknown>) {
          try {
            cookieStore.delete(name)
          } catch {
            // Ignore cookie delete errors in Server Components
          }
        },
      },
    })
    
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return { session: null, user: null }
    }

    return {
      session,
      user: session?.user ?? null,
    }
  } catch {
    return { session: null, user: null }
  }
}