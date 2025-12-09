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

  // --- ESCRITA INTELIGENTE (Com suporte a Benefícios) ---
  async saveItem(table: 'plans' | 'providers', data: any, id?: string) {
    // Separa os benefícios do resto dos dados do plano
    const { benefits, ...mainData } = data;

    let savedId = id;

    // 1. Salva o dado principal (Plano ou Provedor)
    if (id) {
      // UPDATE
      const { error } = await supabase.from(table).update(mainData).eq('id', id);
      if (error) throw error;
    } else {
      // INSERT
      // Precisamos do ID retornado para salvar os benefícios
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(mainData)
        .select()
        .single();
        
      if (error) throw error;
      savedId = insertedData.id;
    }

    // 2. Se for um Plano e tiver benefícios, atualiza a tabela 'benefits'
    if (table === 'plans' && savedId && Array.isArray(benefits)) {
        // Estratégia: Deleta todos os antigos e recria os novos (mais simples e seguro)
        
        // Remove benefícios antigos desse plano
        const { error: deleteError } = await supabase
            .from('benefits')
            .delete()
            .eq('plan_id', savedId);
        
        if (deleteError) throw deleteError;

        // Prepara os novos para inserção
        if (benefits.length > 0) {
            const benefitsToInsert = benefits.map((b: Partial<Benefit>) => ({
                plan_id: savedId,
                text: b.text,
                icon: b.icon || 'check_circle'
            }));

            const { error: insertError } = await supabase
                .from('benefits')
                .insert(benefitsToInsert);
            
            if (insertError) throw insertError;
        }
    }
  },

  async deleteItem(table: 'plans' | 'providers', id: string) {
    // Se for plano, o 'cascade' do banco deve deletar os benefícios,
    // mas se não tiver configurado, deletamos manualmente por segurança
    if (table === 'plans') {
        await supabase.from('benefits').delete().eq('plan_id', id);
    }
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  // --- IMPORTAÇÃO EM MASSA ---
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