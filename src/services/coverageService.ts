import { supabase } from './supabase';

interface GetAreasParams {
  page: number;
  pageSize: number;
  filterProvider?: string;
}

export const coverageService = {
  // Busca provedores para o dropdown (mantido)
  async getProviderNames() {
    const { data } = await supabase.from('providers').select('id, name').order('name');
    return data || [];
  },

  // Busca áreas paginadas (AGORA COM JOIN)
  async getAreas({ page, pageSize, filterProvider }: GetAreasParams) {
    // Seleciona o nome de dentro da tabela relacionada 'providers'
    let query = supabase
      .from('coverage_areas')
      .select('id, area_name, uf, provider_id, providers(name)', { count: 'exact' });

    // Filtro agora precisa apontar para a tabela relacionada
    if (filterProvider) {
      // !inner força o join para filtrar apenas os que batem com o critério
      query = query.ilike('providers.name', `%${filterProvider}%`, { foreignTable: 'providers' }); // Sintaxe pode variar levemente dependendo da versão, mas geralmente filtra na relação
      // Alternativa simples se o filtro for complexo: filtrar no client-side ou ajustar a query
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      // .order('providers(name)', { ascending: true }) // Ordenar por relação é complexo no Supabase, melhor ordenar por area_name ou fazer no front
      .order('area_name', { ascending: true })
      .range(from, to);

    if (error) throw error;

    return { data: data || [], count: count || 0 };
  },

  // Verifica por ID agora
  async checkExistingAreas(providerId: string, uf: string) {
    const { data } = await supabase
      .from('coverage_areas')
      .select('area_name')
      .eq('provider_id', providerId) // Alterado de provider_name para provider_id
      .eq('uf', uf);
    
    return new Set(data?.map(a => a.area_name));
  },

  // Cria usando provider_id
  async createArea(data: { provider_id: string; area_name: string; uf: string; geom: any }) {
    const { error } = await supabase.from('coverage_areas').insert(data);
    if (error) throw error;
  },

  async deleteArea(id: string) {
    const { error } = await supabase.from('coverage_areas').delete().eq('id', id);
    if (error) throw error;
  },

  // Limpa usando provider_id
  async clearProviderAreas(providerId: string) {
    const { error } = await supabase
      .from('coverage_areas')
      .delete()
      .eq('provider_id', providerId); // Alterado
    if (error) throw error;
  }
};