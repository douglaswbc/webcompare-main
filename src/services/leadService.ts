import { supabase } from './supabase';
import { UserAddress, Lead } from '../types';

interface CreateLeadParams {
    name: string;
    phone: string;
    cpf?: string;
    rg?: string;
    plan_id: string;
    address_json: UserAddress | Record<string, any>;
}

interface GetLeadsParams {
    page: number;
    pageSize: number;
    filterText?: string;
    filterPlan?: string;
}

export const leadService = {
    // --- CRIAR LEAD (Publico) ---
    async createLead(leadData: CreateLeadParams) {
        const { error } = await supabase.from('leads').insert([{
            name: leadData.name,
            phone: leadData.phone,
            cpf: leadData.cpf,
            rg: leadData.rg,
            plan_id: leadData.plan_id,
            address_json: leadData.address_json
        }]);

        if (error) {
            console.error('Erro ao salvar lead:', error);
            throw error;
        }
    },

    // --- LISTAR LEADS (Admin) ---
    async getLeads({ page, pageSize, filterText, filterPlan }: GetLeadsParams) {
        let query = supabase
            .from('leads')
            .select('*, plans!inner(name)', { count: 'exact' });

        if (filterText) {
            query = query.ilike('name', `%${filterText}%`);
        }

        if (filterPlan) {
            query = query.eq('plans.name', filterPlan);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return { 
            data: data as Lead[], 
            count: count || 0 
        };
    },

    // --- LISTAR NOMES DE PLANOS (Para Filtro) ---
    async getPlanNames() {
        const { data, error } = await supabase
            .from('plans')
            .select('name')
            .order('name');
            
        if (error) throw error;
        
        // Retorna apenas valores únicos
        const names = data?.map(p => p.name) || [];
        return Array.from(new Set(names));
    }
};