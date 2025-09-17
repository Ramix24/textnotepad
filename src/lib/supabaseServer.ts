import { createClient } from '@supabase/supabase-js'

/**
 * Runtime guard to prevent client-side usage
 * Throws error if this module is imported in browser environment
 */
if (typeof window !== 'undefined') {
  throw new Error(
    '🚨 SECURITY VIOLATION: supabaseServer.ts imported in client-side code! ' +
    'This file contains the service role key and must only be used server-side. ' +
    'Use @/lib/supabaseClient.ts for client-side operations instead.'
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceRole) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE')
}

/**
 * Server-side Supabase client with Service Role key
 * 
 * ⚠️ SECURITY WARNING: This client bypasses Row Level Security (RLS)!
 * Only use this in server-side contexts (API routes, Server Components, middleware).
 * NEVER import this in client-side code or components that run in the browser.
 * 
 * Use this for:
 * - Admin operations that bypass RLS
 * - Server-side data operations
 * - Background jobs and scheduled tasks
 * - Database schema operations
 * - Operations that require elevated privileges
 */
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Creates a Supabase client for server-side use with user context from cookies
 * 
 * This is safer than the service role client as it respects RLS policies.
 * Use this when you need server-side operations but want to maintain user permissions.
 * 
 * @returns Supabase client with user context from cookies
 */
export function createServerClient() {
  // Ensure we're in server context
  ensureServerContext('createServerClient')
  
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseAnonKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createServerClient } = require('@supabase/ssr')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { cookies } = require('next/headers')

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
      set(name: string, value: string, options?: Record<string, unknown>) {
        try {
          cookies().set(name, value, options)
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, _options?: Record<string, unknown>) {
        try {
          cookies().delete(name)
        } catch {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

/**
 * Creates a Supabase client for server-side use with explicit user token
 * 
 * @param userToken - JWT token from authenticated user
 * @returns Supabase client with user context
 */
export function createServerClientWithToken(userToken: string) {
  // Ensure we're in server context
  ensureServerContext('createServerClientWithToken')
  
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseAnonKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Helper function to ensure we're in a server context
 * Call this at the start of server-side functions for extra safety
 */
export function ensureServerContext(context = 'unknown') {
  if (typeof window !== 'undefined') {
    throw new Error(
      `🚨 SECURITY VIOLATION: Server-side function called in client context: ${context}`
    )
  }
}