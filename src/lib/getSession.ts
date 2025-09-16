import { createServerClient } from '@/lib/supabaseServer'
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
    const supabase = createServerClient()
    
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return { session: null, user: null }
    }

    return {
      session,
      user: session?.user ?? null,
    }
  } catch (error) {
    console.error('Unexpected error getting session:', error)
    return { session: null, user: null }
  }
}