import { getSession } from '@/lib/getSession'
import { AppView } from './AppView'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  // Server-side: Verify user session (middleware already protects this route)
  const { user } = await getSession()
  
  if (!user) {
    // This should never happen due to middleware, but provide fallback
    throw new Error('User session not found')
  }

  return <AppView user={user} />
}