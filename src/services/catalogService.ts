import { supabase } from '../supabaseClient';
import { Plan, Provider, Benefit } from '../types';

export const catalogService = {
  // --- LEITURA ---
  async getPlans() {
    const { data, error } = await supabase
      .from('plans')
      .select('*, providers(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Plan[];
  },

  async getProviders() {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Provider[];
  },

  // --- NOVO: Lógica de Benefícios ---
  async getBenefits() {
    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .order('text');

    // Se a tabela não existir, retorna array vazio em vez de estourar erro
    if (error && error.code === '42P01') {
      console.warn('Tabela benefits não encontrada.');
      return [];
    }
    if (error) throw error;
    return data as Benefit[];
  },

  // --- ESCRITA (Genérica para simplificar) ---
  // Agora aceita 'benefits' também
  async saveItem(table: 'plans' | 'providers' | 'benefits', data: any, id?: string) {
    if (id) {
      // Update
      const { error } = await supabase.from(table).update(data).eq('id', id);
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase.from(table).insert(data);
      if (error) throw error;
    }
  },

  async deleteItem(table: 'plans' | 'providers' | 'benefits', id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  // --- IMPORTAÇÃO EM MASSA (CEPs) ---
  async importCepsBatch(providerId: string, ceps: string[], onProgress: (pct: number) => void) {
    const BATCH_SIZE = 1000;
    let insertedCount = 0;

    for (let i = 0; i < ceps.length; i += BATCH_SIZE) {
      const batch = ceps.slice(i, i + BATCH_SIZE).map(cep => ({
        cep,
        provider_id: providerId
      }));

      const { error } = await supabase.from('serviceable_ceps').insert(batch);

      if (error) throw error;

      insertedCount += batch.length;
      onProgress(Math.round((insertedCount / ceps.length) * 100));
    }
    return insertedCount;
  },

  // --- IMPORTAÇÃO DE CIDADES ---
  async importCitiesBatch(providerId: string, cities: { city: string; uf: string }[], onProgress: (pct: number) => void) {
    const BATCH_SIZE = 500;
    let insertedCount = 0;

    for (let i = 0; i < cities.length; i += BATCH_SIZE) {
      const batch = cities.slice(i, i + BATCH_SIZE).map(item => ({
        city: item.city,
        uf: item.uf,
        provider_id: providerId
      }));

      const { error } = await supabase.from('serviceable_cities').insert(batch);

      if (error) throw error;

      insertedCount += batch.length;
      onProgress(Math.round((insertedCount / cities.length) * 100));
    }
    return insertedCount;
  }
};