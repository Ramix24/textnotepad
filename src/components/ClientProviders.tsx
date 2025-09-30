'use client'

import { CommandPaletteClientProvider } from '@/features/command-palette/CommandPaletteClientProvider'

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <CommandPaletteClientProvider>
      {children}
    </CommandPaletteClientProvider>
  )
}