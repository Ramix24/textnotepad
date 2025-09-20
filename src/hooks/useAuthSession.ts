'use client'

import { useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { useSupabase } from '@/components/SupabaseProvider'

interface AuthSession {
  session: Session | null
  user: User | null
  loading: boolean
}

export function useAuthSession(): AuthSession {
  const { supabase } = useSupabase()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session with error handling for clock skew
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          // Handle clock skew errors
          if (error.message.includes('issued in the future') || error.message.includes('clock skew')) {
            // Try refreshing the session for clock skew issues
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
            if (!refreshError && refreshData.session) {
              setSession(refreshData.session)
            } else {
              setSession(null)
            }
          } else {
            setSession(null)
          }
        } else {
          setSession(session)
        }
      } catch {
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return {
    session,
    user: session?.user ?? null,
    loading,
  }
}