import { supabase } from './supabase';

interface GetAreasParams {
  page: number;
  pageSize: number;
  filterProvider?: string;
}

export const coverageService = {
  // Busca provedores para o dropdown
  async getProviderNames() {
    const { data } = await supabase.from('providers').select('id, name').order('name');
    return data || [];
  },

  // Busca áreas paginadas
  async getAreas({ page, pageSize, filterProvider }: GetAreasParams) {
    let query = supabase
      .from('coverage_areas')
      .select('id, provider_name, area_name, uf', { count: 'exact' });

    if (filterProvider) {
      query = query.ilike('provider_name', `%${filterProvider}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order('provider_name', { ascending: true })
      .order('area_name', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return { data: data || [], count: count || 0 };
  },

  // Verifica se área já existe (para evitar duplicatas no loop de importação)
  async checkExistingAreas(providerName: string, uf: string) {
    const { data } = await supabase
      .from('coverage_areas')
      .select('area_name')
      .eq('provider_name', providerName)
      .eq('uf', uf);
    
    // Retorna um Set para busca rápida O(1)
    return new Set(data?.map(a => a.area_name));
  },

  // Cria uma única área (chamado dentro do loop de importação)
  async createArea(data: { provider_name: string; area_name: string; uf: string; geom: any }) {
    const { error } = await supabase.from('coverage_areas').insert(data);
    if (error) throw error;
  },

  // Deletar uma área
  async deleteArea(id: string) {
    const { error } = await supabase.from('coverage_areas').delete().eq('id', id);
    if (error) throw error;
  },

  // Limpar todas as áreas de um provedor
  async clearProviderAreas(providerName: string) {
    const { error } = await supabase
      .from('coverage_areas')
      .delete()
      .eq('provider_name', providerName);
    if (error) throw error;
  }
};