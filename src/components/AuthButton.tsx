'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useSupabase } from '@/components/SupabaseProvider'

export function AuthButton() {
  const { supabase } = useSupabase()
  const { user, loading } = useAuthSession()

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })

      if (error) {
        toast.error('Authentication failed, please retry', {
          description: 'Unable to sign in with Google. Please check your connection and try again.',
        })
      }
    } catch {
      toast.error('Authentication failed, please retry', {
        description: 'An unexpected error occurred during sign in.',
      })
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error('Sign out failed', {
          description: error.message,
        })
      } else {
        // Force redirect to landing page and reload to clear app state
        window.location.href = '/'
      }
    } catch {
      toast.error('Sign out failed', {
        description: 'An unexpected error occurred',
      })
    }
  }

  if (loading) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <Button onClick={handleSignOut} variant="outline">
        Sign out
      </Button>
    )
  }

  return (
    <Button onClick={handleSignIn}>
      Sign in with Google
    </Button>
  )
}