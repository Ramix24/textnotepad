'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a stable query client instance
let queryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // Disable automatic refetching on window focus
          // to avoid unnecessary requests during document editing
          refetchOnWindowFocus: false,
          
          // Cache user files for 5 minutes
          staleTime: 5 * 60 * 1000,
          
          // Keep data in cache for 10 minutes
          gcTime: 10 * 60 * 1000,
        },
        mutations: {
          // Retry failed mutations once (useful for network issues)
          retry: 1,
        },
      },
    })
  }
  return queryClient
}

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * Provider for TanStack Query
 * 
 * This should wrap your app or the parts that need query functionality.
 * The useAutosave hook requires this provider to be present in the component tree.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const client = getQueryClient()

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}

export default QueryProvider

/**
 * Usage in app layout or main component:
 * 
 * ```tsx
 * import { QueryProvider } from '@/components/QueryProvider'
 * 
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <QueryProvider>
 *           {children}
 *         </QueryProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */