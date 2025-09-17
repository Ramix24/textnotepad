'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AuthButton } from '@/components/AuthButton'
import { useAuthSession } from '@/hooks/useAuthSession'
import Link from 'next/link'

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuthSession()

  useEffect(() => {
    if (searchParams.get('authError') === '1') {
      toast.error('Authentication failed', {
        description: 'There was an error signing you in. Please try again.',
      })
    }
    
    // Auto-redirect to /app if authenticated
    if (user) {
      router.push('/app')
    }
  }, [searchParams, user, router])

  const handleGoToApp = () => {
    router.push('/app')
  }
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-6">
          <h1 className="text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
            TextNotepad.com
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            A modern web-based text editor and notepad application built for simplicity and focus.
          </p>
        </div>
        
        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/app">Start Writing</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/components-demo">View Components</Link>
          </Button>
        </div>
        
        <div className="mt-6 flex flex-col items-center space-y-3">
          {user ? (
            <>
              <Button size="lg" onClick={handleGoToApp}>
                Go to App
              </Button>
              <p className="text-sm text-muted-foreground font-mono">
                You&apos;re signed in as {user.email}
              </p>
            </>
          ) : (
            <AuthButton />
          )}
        </div>
        
        <div className="mt-16 text-sm text-muted-foreground">
          <p>Clean interface • Distraction-free writing • Auto-save</p>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
