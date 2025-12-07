import { supabase } from './supabase';
import { Plan } from '../types';
import { normalizeCity } from '../utils/textUtils'; // Importante: certifique-se de ter criado este arquivo

interface SearchParams {
  cep: string;
  city: string;
  uf: string;
  lat?: number;
  lng?: number;
}

export const planService = {
  /**
   * Busca planos disponíveis baseados na localização do usuário.
   * Combina 3 fontes:
   * 1. RPC (Cobertura exata por CEP ou Polígono KML)
   * 2. Tabela de Cidades (Cobertura ampla por Cidade/UF) - Usando normalização
   * 3. Retorna a união sem duplicatas
   */
  async getAvailablePlans({ cep, city, uf, lat, lng }: SearchParams): Promise<Plan[]> {
    // Usamos um Set para evitar planos duplicados (caso venha da RPC e da Cidade ao mesmo tempo)
    const plansIdsSet = new Set<string>();

    // --- ETAPA 1: Busca via RPC (CEPs Específicos + Polígonos KMZ) ---
    // Essa função já existe no seu banco e busca nas tabelas 'serviceable_ceps' e 'coverage_areas'
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_available_plans', {
      user_cep: cep,
      user_lat: lat || 0,
      user_long: lng || 0,
      user_city: city,
      user_uf: uf
    });

    if (rpcError) {
      console.error('Erro na RPC get_available_plans:', rpcError);
      // Não damos throw aqui para tentar buscar pelo menos por cidade na Etapa 2
    } else if (rpcData) {
      rpcData.forEach((p: any) => plansIdsSet.add(p.id));
    }

    // --- ETAPA 2: Busca via Tabela de Cidades (NOVO COM NORMALIZAÇÃO) ---
    // Verifica se a cidade do usuário tem cobertura total de algum provedor
    if (city && uf) {
      // Normalizamos a cidade que veio da busca (ex: "São Paulo" vira "SAO PAULO")
      // Isso garante que bata com o que foi importado via Excel (que também foi normalizado)
      const searchCity = normalizeCity(city);
      const searchUf = uf.toUpperCase();

      const { data: cityProviders, error: cityError } = await supabase
        .from('serviceable_cities')
        .select('provider_id')
        .eq('city', searchCity) // Busca EXATA pelo nome normalizado
        .eq('uf', searchUf);

      if (cityError) {
        console.error('Erro ao buscar cidades:', cityError);
      } else if (cityProviders && cityProviders.length > 0) {
        const providerIds = cityProviders.map(cp => cp.provider_id);

        // Se achou provedores que atendem a cidade toda, busca os planos ativos deles
        const { data: plansFromCities } = await supabase
          .from('plans')
          .select('id')
          .in('provider_id', providerIds)
          .eq('active', true);

        if (plansFromCities) {
          plansFromCities.forEach((p: any) => plansIdsSet.add(p.id));
        }
      }
    }

    // Se não achou nada em nenhuma das etapas
    if (plansIdsSet.size === 0) {
      return [];
    }

    // --- ETAPA 3: Enriquecer os Dados ---
    // Busca os detalhes completos de todos os IDs encontrados (evitando duplicatas pelo Set)
    const uniquePlanIds = Array.from(plansIdsSet);

    const { data: fullPlans, error: plansError } = await supabase
      .from('plans')
      .select(`
        *,
        providers ( id, name, type, logo_url ),
        benefits ( id, text, icon )
      `)
      .in('id', uniquePlanIds)
      .eq('active', true);

    if (plansError) throw plansError;

    return fullPlans as Plan[];
  }
};