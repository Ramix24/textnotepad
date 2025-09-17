import { getSession } from '@/lib/getSession'
import { AppView } from './AppView'
import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  // Server-side: Verify user session with improved error handling
  const { user } = await getSession()
  
  if (!user) {
    // Redirect to home instead of throwing error
    redirect('/?authError=1')
  }

  return <AppView user={user} />
}