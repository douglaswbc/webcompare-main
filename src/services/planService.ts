import { supabase } from './supabase';
import { Plan } from '../types';
import { normalizeCity } from '../utils/textUtils';

interface SearchParams {
  cep: string;
  city: string;
  uf: string;
  lat?: number;
  lng?: number;
}

export const planService = {
  async getAvailablePlans({ cep, city, uf, lat, lng }: SearchParams): Promise<Plan[]> {
    const plansIdsSet = new Set<string>();
    const cleanCep = cep.replace(/\D/g, '');

    // --- ETAPA 1: Busca via RPC (Polígonos KMZ) ---
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_available_plans', {
      user_cep: cleanCep,
      user_lat: lat || 0,
      user_long: lng || 0,
      user_city: city,
      user_uf: uf
    });

    if (rpcError) {
      console.error('Erro na RPC get_available_plans:', rpcError);
    } else if (rpcData) {
      rpcData.forEach((p: any) => plansIdsSet.add(p.id));
    }

    // --- ETAPA 2: Busca via Tabela de CEPs (CORRIGIDO) ---
    if (cleanCep) {
      console.log("--- DEBUG CEP ---");
      console.log("Buscando na tabela serviceable_ceps o CEP:", cleanCep);

      // AQUI ESTAVA O ERRO: Usamos 'error' genérico para o console.log funcionar
      const { data: cepProviders, error } = await supabase
        .from('serviceable_ceps')
        .select('provider_id, cep') 
        .eq('cep', cleanCep);

      console.log("Resultado da Busca:", cepProviders);
      console.log("Erro (se houver):", error);

      if (error) {
        console.error('Erro ao buscar CEPs:', error);
      } else if (cepProviders && cepProviders.length > 0) {
        const providerIds = cepProviders.map(cp => cp.provider_id);
        console.log("IDs de Provedores encontrados:", providerIds);

        const { data: plansFromCeps } = await supabase
          .from('plans')
          .select('id')
          .in('provider_id', providerIds)
          .eq('active', true);

        if (plansFromCeps) {
          plansFromCeps.forEach((p: any) => plansIdsSet.add(p.id));
        }
      } else {
        console.warn("Nenhum provedor encontrado para este CEP exato.");
      }
    }

    // --- ETAPA 3: Busca via Tabela de Cidades ---
    if (city && uf) {
      const searchCity = normalizeCity(city);
      const searchUf = uf.toUpperCase();

      const { data: cityProviders, error: cityError } = await supabase
        .from('serviceable_cities')
        .select('provider_id')
        .eq('city', searchCity)
        .eq('uf', searchUf);

      if (cityError) {
        console.error('Erro ao buscar cidades:', cityError);
      } else if (cityProviders && cityProviders.length > 0) {
        const providerIds = cityProviders.map(cp => cp.provider_id);

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

    // --- ETAPA 4: Enriquecer os Dados ---
    if (plansIdsSet.size === 0) {
      return [];
    }

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