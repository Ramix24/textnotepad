'use client'

import { Suspense } from 'react'
import { CommandPaletteProvider } from '@/features/command-palette/CommandPaletteProvider'

interface ClientProvidersProps {
  children: React.ReactNode
}

function CommandPaletteProviderWithSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <CommandPaletteProvider>
        {children}
      </CommandPaletteProvider>
    </Suspense>
  )
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <CommandPaletteProviderWithSuspense>
      {children}
    </CommandPaletteProviderWithSuspense>
  )
}