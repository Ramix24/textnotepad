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
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Redirecting to app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-dark bg-bg-primary/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-semibold text-text-primary">TextNotepad</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-bg-primary rounded-2xl shadow-lg border border-border-dark p-8 space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-text-primary">
                Welcome Back
              </h1>
              <p className="text-text-secondary text-lg">
                Sign in to access your encrypted notes
              </p>
            </div>
            
            <div className="space-y-6">
              <AuthButton />
              
              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-accent-blue text-xs">🔒</span>
                  </div>
                  <span>End-to-end encryption – only you can read your notes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-accent-blue text-xs">🌍</span>
                  </div>
                  <span>GDPR compliant, EU hosting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-accent-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-accent-blue text-xs">🔓</span>
                  </div>
                  <span>Zero-knowledge architecture</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-text-secondary">
                By signing in, you agree to our{' '}
                <a href="/terms" className="text-accent-blue hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-accent-blue hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}