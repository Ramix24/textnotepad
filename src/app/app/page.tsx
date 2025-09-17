// TEMPORARY: Disable server-side session check to isolate crash
// import { getSession } from '@/lib/getSession'
import { AppView } from './AppView'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  // TEMPORARY: Skip session check to test if this is causing the crash
  // const { user } = await getSession()
  
  // if (!user) {
  //   // This should never happen due to middleware, but provide fallback
  //   throw new Error('User session not found')
  // }

  // Pass null user for now to test if AppView works
  return <AppView user={null} />
}