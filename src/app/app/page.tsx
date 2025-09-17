// TEMPORARY: Use client-side auth only
// import { getSession } from '@/lib/getSession'
import { AppView } from './AppView'
// import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  // TEMPORARY: Skip server-side auth check, let client handle it
  // const { user } = await getSession()
  
  // if (!user) {
  //   // Redirect to home instead of throwing error
  //   redirect('/?authError=1')
  // }

  return <AppView user={null} />
}