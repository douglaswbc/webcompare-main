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
    const cleanCep = cep.replace(/\D/g, '');
    
    // Armazena os IDs encontrados e o "tipo" de match (qualidade da cobertura)
    // Usamos um Map para garantir que, se um plano for achado por CEP e Cidade, prevaleça o melhor match
    const foundPlansMap = new Map<string, 'cep' | 'map' | 'city'>();

    // --- ETAPA 1: Busca via RPC (Banco de Dados - CEP, Mapa e Cidade) ---
    // A RPC já faz a busca nas 3 tabelas e retorna o match_type ('cep', 'map', 'city')
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_available_plans', {
      user_cep: cleanCep,
      user_lat: lat || 0,
      user_long: lng || 0,
      user_city: city,
      user_uf: uf
    });

    if (rpcError) {
      console.error('Erro na RPC:', rpcError);
    } 
    
    if (rpcData) {
      rpcData.forEach((item: any) => {
        // Lógica de prioridade: CEP > MAP > CITY
        const currentMatch = foundPlansMap.get(item.id);
        const newMatch = item.match_type;

        // Se ainda não tem, adiciona.
        if (!currentMatch) {
          foundPlansMap.set(item.id, newMatch);
        } 
        // Se já tem como 'city', mas achou 'cep' ou 'map', atualiza para o melhor (upgrade)
        else if (currentMatch === 'city' && (newMatch === 'cep' || newMatch === 'map')) {
          foundPlansMap.set(item.id, newMatch);
        }
      });
    }

    // --- FILTRO DE INTELIGÊNCIA (NOVO) ---
    // Se encontrarmos planos com cobertura EXATA ('cep' ou 'map'),
    // podemos optar por esconder os planos de cobertura AMPLA ('city'),
    // pois eles são menos precisos.
    
    const hasExactMatch = Array.from(foundPlansMap.values()).some(type => type === 'cep' || type === 'map');
    const finalPlanIds: string[] = [];

    foundPlansMap.forEach((matchType, planId) => {
        if (hasExactMatch) {
            // Se temos cobertura exata na região, mostramos:
            // 1. Os planos exatos (CEP/Map)
            // 2. Opcional: Planos de Satélite (que geralmente vêm por cidade mas cobrem tudo)
            // Por enquanto, vamos ser estritos: Se tem Fibra no CEP, mostra só Fibra no CEP.
            if (matchType === 'cep' || matchType === 'map') {
                finalPlanIds.push(planId);
            }
        } else {
            // Se NINGUÉM atende o CEP exato, mostramos as opções genéricas da Cidade
            finalPlanIds.push(planId);
        }
    });

    // Se a lista estiver vazia (nenhum match), retorna vazio
    if (finalPlanIds.length === 0) return [];

    // --- ETAPA FINAL: Enriquecer os Dados ---
    const { data: fullPlans, error: plansError } = await supabase
      .from('plans')
      .select(`
        *,
        providers ( id, name, type, logo_url ),
        benefits ( id, text, icon )
      `)
      .in('id', finalPlanIds)
      .eq('active', true);

    if (plansError) throw plansError;

    return fullPlans as Plan[];
  }
};