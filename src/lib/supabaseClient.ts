/**
 * @deprecated Use SupabaseProvider and useSupabase hook instead
 * This file is kept for backward compatibility but should not be used directly
 * 
 * The proper way to use Supabase client is:
 * 1. Import { useSupabase } from '@/components/SupabaseProvider'
 * 2. Use const { supabase } = useSupabase() in your components
 * 
 * This ensures proper SSR cookie handling and prevents multiple client instances.
 */

// Re-export for legacy compatibility only
export { useSupabase } from '@/components/SupabaseProvider'

// Legacy export - DO NOT USE in new code
// This creates multiple client instances and should be avoided
export const supabase = null as any