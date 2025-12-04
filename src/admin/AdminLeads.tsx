import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [availablePlans, setAvailablePlans] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchPlanNames = async () => {
      const { data } = await supabase.from('plans').select('name').order('name');
      if (data) {
        const uniquePlans = Array.from(new Set(data.map((p: any) => p.name)));
        setAvailablePlans(uniquePlans as string[]);
      }
    };
    fetchPlanNames();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [currentPage, filterText, filterPlan]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase.from('leads').select('*, plans!inner(name)', { count: 'exact' });

      if (filterText) query = query.ilike('name', `%${filterText}%`);
      if (filterPlan) query = query.eq('plans.name', filterPlan);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);

      if (error) throw error;
      setLeads(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error(error);
      toast.error('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return toast.warn('Sem dados para exportar.');
    const headers = ['Data', 'Nome', 'Telefone', 'CPF', 'Interesse', 'Endereço', 'Cidade', 'Estado'];
    const rows = leads.map(lead => [
      new Date(lead.created_at).toLocaleDateString(),
      `"${lead.name}"`,
      `"${lead.phone}"`,
      `"${lead.cpf || ''}"`,
      `"${lead.plans?.name || 'N/A'}"`,
      `"${lead.address_json?.logradouro || ''}, ${lead.address_json?.numero || ''}"`,
      `"${lead.address_json?.localidade || ''}"`,
      `"${lead.address_json?.uf || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-text-inverted">Gestão de Leads</h2>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20"
        >
          <span className="material-symbols-outlined">download</span>
          Exportar CSV
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-background-paper-dark p-4 rounded-xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 bg-background-dark p-3 rounded-lg border border-white/5 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-text-muted">search</span>
            <input
              placeholder="Buscar por Nome..."
              className="bg-transparent text-text-inverted w-full outline-none placeholder:text-text-muted"
              value={filterText}
              onChange={(e) => { setFilterText(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 bg-background-dark p-3 rounded-lg border border-white/5">
            <span className="material-symbols-outlined text-text-muted">filter_alt</span>
            <select
              className="bg-transparent text-text-inverted w-full outline-none cursor-pointer [&>option]:bg-background-dark"
              value={filterPlan}
              onChange={(e) => { setFilterPlan(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todos os Planos</option>
              {availablePlans.map(planName => (
                <option key={planName} value={planName}>{planName}</option>
              ))}
            </select>
          </div>
          <div className="text-text-muted text-sm font-medium px-2">
            Total: <strong className="text-white">{totalCount}</strong>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-background-paper-dark rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-lg">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
            <table className="w-full text-left text-sm text-text-muted min-w-[900px]">
              <thead className="bg-black/20 text-text-inverted uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Contato</th>
                  <th className="p-4">Interesse</th>
                  <th className="p-4">Localização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="p-12 text-center text-white"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></td></tr>
                ) : leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-medium text-text-inverted">{new Date(lead.created_at).toLocaleDateString()}</div>
                      <div className="text-xs opacity-60">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-4 font-bold text-white text-base">{lead.name}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-text-inverted bg-white/5 px-2 py-0.5 rounded w-fit">
                          <span className="material-symbols-outlined text-[14px] text-green-400">call</span>
                          {lead.phone}
                        </span>
                        {lead.cpf && <span className="text-xs text-text-muted pl-1">CPF: {lead.cpf}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-primary font-bold bg-primary/10 px-2 py-1 rounded text-xs border border-primary/20">
                        {lead.plans?.name || 'Plano Removido'}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      {lead.address_json?.localidade ? (
                        <div className="flex flex-col">
                          <span className="text-text-inverted font-medium">{lead.address_json.localidade} - {lead.address_json.uf}</span>
                          <span className="opacity-60">{lead.address_json.bairro}</span>
                        </div>
                      ) : <span className="opacity-40">-</span>}
                    </td>
                  </tr>
                ))}
                {!loading && leads.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-text-muted">Nenhum lead encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalCount > 0 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/20">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="flex items-center gap-1 text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span> Anterior
              </button>
              <span className="text-sm text-text-muted">
                Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Próxima <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;