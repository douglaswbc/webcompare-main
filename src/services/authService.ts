import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export const authService = {
  // Pega a sessão atual
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Login com Email/Senha
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // "Escuta" mudanças na autenticação (login/logout em outra aba, token expirado)
  onAuthStateChange(callback: (session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription;
  }
};