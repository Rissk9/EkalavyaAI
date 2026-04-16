import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Keep this module lightweight: it only creates the client.
// DB features (chat history, forum posts, etc.) will be built on top of this.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function assertSupabaseConfigured() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment.'
    );
  }
  return supabase;
}

