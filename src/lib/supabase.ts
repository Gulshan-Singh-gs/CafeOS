import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client safe for client-side queries protected by RLS
export const supabasePublic = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-only admin client with elevated privileges
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    // Safety boundary: never run admin client in browser
    return null;
  }
  if (supabaseUrl && supabaseServiceRoleKey) {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return null;
}

