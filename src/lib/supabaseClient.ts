import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Client-side Supabase client with SSR cookie support
 * 
 * This client runs in the browser and uses the anonymous key.
 * It respects Row Level Security (RLS) policies and user sessions.
 * Configured to work with server-side rendering and cookie sharing.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
})

/**
 * Create browser client for SSR
 * This ensures cookies are properly set for server-side access
 */
export function createBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('createBrowserClient should only be called in browser context')
  }
  
  // Import createBrowserClient from @supabase/ssr
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createBrowserClient: createSSRBrowserClient } = require('@supabase/ssr')
  
  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey)
}