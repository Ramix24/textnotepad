'use client'

import { Suspense, ReactNode } from 'react'
import { AppShell3 } from './AppShell3'

interface AppShell3WrapperProps {
  sectionsContent?: ReactNode
  listContent?: ReactNode  
  detailContent?: ReactNode
  className?: string
}

function AppShell3Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg-primary">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-text-secondary border-t-accent-blue rounded-full animate-spin mx-auto"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  )
}

export function AppShell3Wrapper(props: AppShell3WrapperProps) {
  return (
    <Suspense fallback={<AppShell3Loading />}>
      <AppShell3 {...props} />
    </Suspense>
  )
}