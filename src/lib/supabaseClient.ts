import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
  },
});

export async function initSupabaseSessionFromLocalStorage() {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (accessToken && refreshToken) {
    try {
      await supabaseClient.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    } catch {}
  }
}


