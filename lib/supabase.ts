import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// sessionStorage adapter (localStorage yerine)
const sessionStorageAdapter = {
  getItem: (key: string) => {
    try { return sessionStorage.getItem(key); } catch { return null; }
  },
  setItem: (key: string, value: string) => {
    try { sessionStorage.setItem(key, value); } catch {}
  },
  removeItem: (key: string) => {
    try { sessionStorage.removeItem(key); } catch {}
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: sessionStorageAdapter, // ✅ kritik değişiklik
  },
});
