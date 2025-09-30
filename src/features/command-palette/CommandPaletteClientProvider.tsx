'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Dynamically import the CommandPaletteProvider with no SSR
const CommandPaletteProvider = dynamic(
  () => import('./CommandPaletteProvider').then(mod => ({ default: mod.CommandPaletteProvider })),
  { 
    ssr: false,
    loading: () => null
  }
)

interface CommandPaletteClientProviderProps {
  children: React.ReactNode
}

export function CommandPaletteClientProvider({ children }: CommandPaletteClientProviderProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{children}</>
  }

  return (
    <CommandPaletteProvider>
      {children}
    </CommandPaletteProvider>
  )
}