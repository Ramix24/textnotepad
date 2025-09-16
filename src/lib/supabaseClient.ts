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
 * Client-side Supabase client
 * 
 * This client runs in the browser and uses the anonymous key.
 * It respects Row Level Security (RLS) policies and user sessions.
 * 
 * Use this for:
 * - User authentication (login, signup, logout)
 * - Client-side data operations
 * - Real-time subscriptions
 * - File uploads from browser
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically detect user session from cookies/localStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})