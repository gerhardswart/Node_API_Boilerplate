import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from './index';

let supabase: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
    if (!config.supabase.url || !key) {
      throw new Error('Supabase URL and key are required. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }
    supabase = createClient(config.supabase.url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabase;
};
