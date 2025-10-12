import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;
  
  // Only initialize in browser where env vars are available
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be initialized in the browser');
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required');
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    },
  });
  
  return supabaseClient;
}

export { getSupabaseClient as supabaseClient };

export async function initSupabaseSessionFromLocalStorage() {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (accessToken && refreshToken) {
    try {
      const client = getSupabaseClient();
      await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    } catch {}
  }
}


