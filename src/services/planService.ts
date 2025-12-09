import { supabase } from './supabase';
import { Plan } from '../types';

interface SearchParams {
  cep: string;
  city: string;
  uf: string;
  lat?: number;
  lng?: number;
}

// Interface auxiliar para o controle de melhor match
interface BestMatch {
  planId: string;
  matchType: 'cep' | 'map' | 'city';
}

export const planService = {
  async getAvailablePlans({ cep, city, uf, lat, lng }: SearchParams): Promise<Plan[]> {
    const cleanCep = cep.replace(/\D/g, '');
    
    // Mapa para guardar o MELHOR match de cada Provedor
    // Chave: provider_id, Valor: Objeto com o melhor planId e tipo
    const providerBestMatch = new Map<string, BestMatch[]>();

    // --- ETAPA 1: Busca via RPC ---
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_available_plans', {
      user_cep: cleanCep,
      user_lat: lat || 0,
      user_long: lng || 0,
      user_city: city,
      user_uf: uf
    });

    if (rpcError) console.error('Erro na RPC:', rpcError);

    if (rpcData) {
      // Agrupa os planos por Provedor para aplicar a lógica
      const tempMap = new Map<string, { id: string, type: 'cep'|'map'|'city' }[]>();

      rpcData.forEach((item: any) => {
        if (!tempMap.has(item.provider_id)) {
          tempMap.set(item.provider_id, []);
        }
        tempMap.get(item.provider_id)?.push({ id: item.id, type: item.match_type });
      });

      // LÓGICA DE DEDUPLICAÇÃO POR PROVEDOR
      tempMap.forEach((plans, providerId) => {
        // Verifica se esse provedor tem cobertura EXATA (CEP ou Map)
        const hasExact = plans.some(p => p.type === 'cep' || p.type === 'map');

        if (hasExact) {
          // Se tiver exata, pegamos APENAS os planos exatos (ignoramos os de cidade desse provedor)
          const exactPlans = plans
            .filter(p => p.type === 'cep' || p.type === 'map')
            .map(p => ({ planId: p.id, matchType: p.type as any }));
          
          providerBestMatch.set(providerId, exactPlans);
        } else {
          // Se não tiver exata, mostramos os planos de cidade (Satélite/Rádio/Genéricos)
          const cityPlans = plans
            .map(p => ({ planId: p.id, matchType: p.type as any }));
          
          providerBestMatch.set(providerId, cityPlans);
        }
      });
    }

    // Coleta todos os IDs finais
    const finalPlanIds: string[] = [];
    providerBestMatch.forEach((matches) => {
      matches.forEach(m => finalPlanIds.push(m.planId));
    });

    // Se vazio, retorna
    if (finalPlanIds.length === 0) return [];

    // --- ETAPA FINAL: Enriquecer os Dados ---
    // Usamos um Set para garantir que não haja IDs duplicados no IN
    const uniqueIds = Array.from(new Set(finalPlanIds));

    const { data: fullPlans, error: plansError } = await supabase
      .from('plans')
      .select(`
        *,
        providers ( id, name, type, logo_url ),
        benefits ( id, text, icon )
      `)
      .in('id', uniqueIds)
      .eq('active', true);

    if (plansError) throw plansError;

    return fullPlans as Plan[];
  }
};