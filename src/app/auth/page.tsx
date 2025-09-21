'use client'

import { AuthButton } from '@/components/AuthButton'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthPage() {
  const { user, loading } = useAuthSession()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/app')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to TextNotepad
          </h1>
          <p className="text-gray-600 mb-8">
            Privacy-first note taking with end-to-end encryption
          </p>
          
          <div className="space-y-4">
            <AuthButton />
            
            <div className="text-sm text-gray-500">
              <p>🔒 Your data is encrypted end-to-end</p>
              <p>🌍 GDPR compliant, EU hosting</p>
              <p>🔓 Zero-knowledge architecture</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}