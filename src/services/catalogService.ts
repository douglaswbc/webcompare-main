import { supabase } from './supabase';
import { Plan, Provider, Benefit } from '../types';

export const catalogService = {
  // --- LEITURA ---
  async getPlans() {
    const { data, error } = await supabase
      .from('plans')
      .select('*, providers(name), benefits(*)')
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

  // --- BENEFÍCIOS ---
  async getBenefits() {
    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .order('text');
    if (error && error.code === '42P01') { 
        console.warn('Tabela benefits não encontrada.');
        return [];
    }
    if (error) throw error;
    return data as Benefit[];
  },

  // --- ESCRITA (Genérica) ---
  async saveItem(table: 'plans' | 'providers' | 'benefits', data: any, id?: string) {
    if (table === 'plans') {
        // CORREÇÃO AQUI: Removemos 'providers' e 'created_at' do objeto antes de salvar
        // 'providers' vem do join na leitura e não existe na tabela plans
        // 'created_at' é gerado automaticamente pelo banco
        const { benefits, providers, created_at, ...mainData } = data;
        
        let savedId = id;

        if (id) {
            const { error } = await supabase.from(table).update(mainData).eq('id', id);
            if (error) throw error;
        } else {
            const { data: inserted, error } = await supabase.from(table).insert(mainData).select().single();
            if (error) throw error;
            savedId = inserted.id;
        }

        // Salvar Benefícios Aninhados
        if (savedId && Array.isArray(benefits)) {
            await supabase.from('benefits').delete().eq('plan_id', savedId);
            if (benefits.length > 0) {
                await supabase.from('benefits').insert(
                    benefits.map((b: any) => ({ plan_id: savedId, text: b.text, icon: b.icon || 'check_circle' }))
                );
            }
        }
    } else {
        // Provedores ou Benefícios soltos
        if (id) {
            const { error } = await supabase.from(table).update(data).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from(table).insert(data);
            if (error) throw error;
        }
    }
  },

  async deleteItem(table: 'plans' | 'providers' | 'benefits', id: string) {
    if (table === 'plans') {
        await supabase.from('benefits').delete().eq('plan_id', id);
    }
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  // --- IMPORTAÇÃO EM MASSA (CEPs) ---
  async importCepsBatch(providerId: string, ceps: string[], onProgress: (pct: number) => void) {
    const BATCH_SIZE = 1000;
    let insertedCount = 0;
    for (let i = 0; i < ceps.length; i += BATCH_SIZE) {
      const batch = ceps.slice(i, i + BATCH_SIZE).map(cep => ({ cep, provider_id: providerId }));
      const { error } = await supabase.from('serviceable_ceps').insert(batch);
      if (error) throw error;
      insertedCount += batch.length;
      onProgress(Math.round((insertedCount / ceps.length) * 100));
    }
    return insertedCount;
  },

  // --- GESTÃO DE CEPS (Novo) ---
  async getCeps({ providerId, page, pageSize }: { providerId: string, page: number, pageSize: number }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count, error } = await supabase
        .from('serviceable_ceps')
        .select('*', { count: 'exact' })
        .eq('provider_id', providerId)
        .range(from, to)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return { data, count: count || 0 };
  },

  async deleteCep(id: string) {
    const { error } = await supabase.from('serviceable_ceps').delete().eq('id', id);
    if (error) throw error;
  },

  async clearProviderCeps(providerId: string) {
    const { error } = await supabase.from('serviceable_ceps').delete().eq('provider_id', providerId);
    if (error) throw error;
  },

  // --- IMPORTAÇÃO DE CIDADES ---
  async importCitiesBatch(providerId: string, cities: { city: string; uf: string }[], onProgress: (pct: number) => void) {
    const BATCH_SIZE = 500;
    let insertedCount = 0;
    for (let i = 0; i < cities.length; i += BATCH_SIZE) {
      const batch = cities.slice(i, i + BATCH_SIZE).map(item => ({ city: item.city, uf: item.uf, provider_id: providerId }));
      const { error } = await supabase.from('serviceable_cities').insert(batch);
      if (error) throw error;
      insertedCount += batch.length;
      onProgress(Math.round((insertedCount / cities.length) * 100));
    }
    return insertedCount;
  },

  // --- GESTÃO DE CIDADES (Novo) ---
  async getCities({ providerId, page, pageSize }: { providerId: string, page: number, pageSize: number }) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count, error } = await supabase
        .from('serviceable_cities')
        .select('*', { count: 'exact' })
        .eq('provider_id', providerId)
        .range(from, to)
        .order('city', { ascending: true });
    if (error) throw error;
    return { data, count: count || 0 };
  },

  async deleteCity(id: string) {
    const { error } = await supabase.from('serviceable_cities').delete().eq('id', id);
    if (error) throw error;
  },

  async clearProviderCities(providerId: string) {
    const { error } = await supabase.from('serviceable_cities').delete().eq('provider_id', providerId);
    if (error) throw error;
  }
};