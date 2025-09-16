'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/hooks/useAuthSession'
import { supabase } from '@/lib/supabaseClient'

export function AuthButton() {
  const { user, loading } = useAuthSession()
  const router = useRouter()

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })

      if (error) {
        toast.error('Sign in failed', {
          description: error.message,
        })
      }
    } catch {
      toast.error('Sign in failed', {
        description: 'An unexpected error occurred',
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
        router.push('/')
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