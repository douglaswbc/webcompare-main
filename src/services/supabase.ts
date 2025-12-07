import { createClient } from '@supabase/supabase-js';

// Acessando as variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('As variáveis de ambiente do Supabase não estão definidas.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);