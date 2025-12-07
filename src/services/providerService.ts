import { supabase } from './supabase';
import { Provider } from '../types';

export const providerService = {
  async getActiveProviders() {
    // Busca apenas provedores ativos, ordenados por nome
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar provedores:', error);
      throw error;
    }

    return data as Provider[];
  }
};