import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const AdminLeads: React.FC = () => {
  // Estados de Lista e Paginação
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filtros
  const [filterText, setFilterText] = useState(''); // Filtro por nome
  const [filterPlan, setFilterPlan] = useState(''); // Filtro por plano (interesse)
  const [availablePlans, setAvailablePlans] = useState<string[]>([]); // Lista de planos para o dropdown

  const ITEMS_PER_PAGE = 10;

  // Carrega a lista de planos disponíveis para o filtro
  useEffect(() => {
    const fetchPlanNames = async () => {
      const { data } = await supabase.from('plans').select('name').order('name');
      if (data) {
        // Remove duplicatas se houver
        const uniquePlans = Array.from(new Set(data.map((p: any) => p.name)));
        setAvailablePlans(uniquePlans as string[]);
      }
    };
    fetchPlanNames();
  }, []);

  // Recarrega sempre que mudar a página ou os filtros
  useEffect(() => {
    fetchLeads();
  }, [currentPage, filterText, filterPlan]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select('*, plans!inner(name)', { count: 'exact' }); // !inner garante que o filtro funcione na relação

      // Filtro por Nome
      if (filterText) {
        query = query.ilike('name', `%${filterText}%`);
      }

      // Filtro por Plano (Interesse)
      if (filterPlan) {
        // Como o nome do plano está na tabela relacionada, usamos o filtro na relação
        // Mas a sintaxe do Supabase para filtrar em tabela relacionada pode ser complexa.
        // Uma abordagem simples é filtrar onde plans.name é igual.
        // Nota: O Supabase JS client v2 facilita isso com a sintaxe de filtro em objeto aninhado se configurado,
        // mas o método mais seguro e compatível é filtrar pelo ID do plano ou usar !inner join.
        // Vamos tentar filtrar pelo texto retornado se possível, ou ajustar a query.

        // Ajuste: Para simplificar, vamos assumir que o usuário quer filtrar pelo nome do plano.
        // A query acima `plans!inner(name)` permite filtrar pela coluna da tabela joinada.
        query = query.eq('plans.name', filterPlan);
      }

      // Calcula o intervalo da paginação (Range)
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setLeads(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao carregar leads: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para Exportar CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.warn('Não há dados para exportar.');
      return;
    }

    // Cabeçalho do CSV
    const headers = ['Data', 'Nome', 'Telefone', 'CPF', 'Interesse', 'Endereço', 'Cidade', 'Estado'];

    // Linhas do CSV
    const rows = leads.map(lead => [
      new Date(lead.created_at).toLocaleDateString(),
      `"${lead.name}"`, // Aspas para evitar quebra com vírgulas no nome
      `"${lead.phone}"`,
      `"${lead.cpf || ''}"`,
      `"${lead.plans?.name || 'N/A'}"`,
      `"${lead.address_json?.logradouro || ''}, ${lead.address_json?.numero || ''}"`,
      `"${lead.address_json?.localidade || ''}"`,
      `"${lead.address_json?.uf || ''}"`
    ]);

    // Monta o conteúdo
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Cria o Blob e o link de download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Arquivo CSV baixado com sucesso!');
  };

  // Cálculos de Paginação
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Gestão de Leads</h2>
        <button
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined">download</span>
          Exportar CSV
        </button>
      </div>

      <div className="flex flex-col gap-4">

        {/* Barra de Filtros */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-background-paper-dark p-4 rounded-xl border border-white/10">

          {/* Filtro Nome */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 bg-slate-900 p-2 rounded border border-slate-700">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              placeholder="Buscar por Nome..."
              className="bg-transparent text-white w-full outline-none placeholder:text-slate-500"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filtro Plano */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 bg-slate-900 p-2 rounded border border-slate-700">
            <span className="material-symbols-outlined text-slate-400">filter_alt</span>
            <select
              className="bg-transparent text-white w-full outline-none cursor-pointer"
              value={filterPlan}
              onChange={(e) => {
                setFilterPlan(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="" className="text-slate-500">Todos os Planos</option>
              {availablePlans.map(planName => (
                <option key={planName} value={planName} className="text-black bg-white">{planName}</option>
              ))}
            </select>
          </div>

          <div className="text-slate-400 text-sm whitespace-nowrap">
            Total: <strong>{totalCount}</strong>
          </div>
        </div>

        {/* Tabela de Leads */}
        <div className="bg-background-paper-dark rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400 min-w-[800px]">
              <thead className="bg-slate-900 text-white uppercase">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Contato</th>
                  <th className="p-4">Interesse</th>
                  <th className="p-4">Endereço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-white">Carregando...</td></tr>
                ) : leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString()} <span className="text-xs text-slate-500">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                    <td className="p-4 font-bold text-white">{lead.name}</td>
                    <td className="p-4">
                      <div className="text-white flex flex-col">
                        <p className="text-white mb-0.5">{lead.phone}</p>
                        <p className="text-slate-400 text-xs">{lead.cpf}</p>
                      </div>
                    </td>
                    <td className="p-4">{lead.plans?.name || 'N/A'}</td>
                    <td className="p-4">
                      {lead.address_json ? (
                        <div className="flex flex-col">
                          <p className="text-white mb-0.5">{lead.address_json.logradouro}, {lead.address_json.numero}</p>
                          <p className="text-slate-400 text-xs">{lead.address_json.bairro} - {lead.address_json.localidade}/{lead.address_json.uf}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500">Endereço não informado</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!loading && leads.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum lead encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- PAGINAÇÃO --- */}
          {totalCount > 0 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-900">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
                Anterior
              </button>

              <span className="text-sm text-slate-400">
                Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;