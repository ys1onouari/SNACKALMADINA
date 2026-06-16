import { supabaseReady } from './supabase.js';

export async function login(email, password, persistSession = true) {
  const supabase = await supabaseReady;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { persistSession },
  });
  if (error) throw error;
  return data;
}


