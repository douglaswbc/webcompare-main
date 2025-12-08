import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../supabaseClient'; // 🔥 Voltando a usar o client direto para corrigir o erro
import { Plan, Provider, Benefit } from '../../types';

// Componentes Refatorados
import CepImporter from '../../components/admin/CepImporter';
import CityImporter from '../../components/admin/CityImporter';
import CatalogModal from '../../components/admin/CatalogModal';

// Adicionado 'benefits'
type ViewMode = 'plans' | 'providers' | 'benefits' | 'import_ceps' | 'import_cities';

const Plans: React.FC = () => {
  const [view, setView] = useState<ViewMode>('plans');

  // Estados de Dados
  const [plans, setPlans] = useState<Plan[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]); // Novo estado para Benefícios

  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Buscar Planos
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*, providers(name)')
        .order('created_at', { ascending: false });
      if (plansError) throw plansError;

      // 2. Buscar Provedores
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select('*')
        .order('name');
      if (providersError) throw providersError;

      // 3. Buscar Benefícios (Correção do erro "getBenefits is not a function")
      const { data: benefitsData, error: benefitsError } = await supabase
        .from('benefits')
        .select('*')
        .order('text');
      // Não lançamos erro aqui se a tabela não existir ainda, apenas logamos
      if (benefitsError) console.warn('Tabela benefits pode não existir ou estar vazia', benefitsError);

      setPlans((plansData as any) || []);
      setProviders((providersData as any) || []);
      setBenefits((benefitsData as any) || []);

    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      const payload = { ...formData };

      // Define a tabela baseada na view atual
      let table = 'plans';
      if (view === 'providers') table = 'providers';
      if (view === 'benefits') table = 'benefits';

      // Limpeza específica para planos
      if (view === 'plans') delete payload.providers;

      if (editingItem?.id) {
        // UPDATE
        const { error } = await supabase.from(table).update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        // INSERT
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
      }

      toast.success('Salvo com sucesso!');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    let table = 'plans';
    if (view === 'providers') table = 'providers';
    if (view === 'benefits') table = 'benefits';

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      toast.success('Item excluído.');
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    }
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Helper para determinar qual lista mostrar na tabela
  const getCurrentList = () => {
    if (view === 'plans') return plans;
    if (view === 'providers') return providers;
    if (view === 'benefits') return benefits;
    return [];
  };

  return (
    <div>
      {/* --- HEADER DA PÁGINA --- */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-inverted">Catálogo</h1>

        {/* Toggle de Views */}
        <div className="flex flex-wrap justify-center bg-background-paper-dark p-1 rounded-xl border border-white/10 gap-1">
          {[
            { id: 'plans', label: 'Planos', icon: 'router' },
            { id: 'providers', label: 'Provedores', icon: 'business' },
            { id: 'benefits', label: 'Benefícios', icon: 'stars' },
            { id: 'import_ceps', label: 'CEPs', icon: 'pin_drop' },
            { id: 'import_cities', label: 'Cidades', icon: 'location_city' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === tab.id ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Botão Novo (Aparece apenas nas abas de CRUD) */}
        {['plans', 'providers', 'benefits'].includes(view) && (
          <button
            onClick={() => openModal()}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined">add</span>
            Novo {view === 'benefits' ? 'Benefício' : (view === 'plans' ? 'Plano' : 'Provedor')}
          </button>
        )}
      </div>

      {/* --- CONTEÚDO PRINCIPAL --- */}

      {/* Renderização Condicional */}
      {view === 'import_cities' ? (
        <CityImporter providers={providers} />
      ) : view === 'import_ceps' ? (
        <CepImporter providers={providers} />
      ) : (
        <div className="bg-background-paper-dark rounded-2xl border border-white/10 overflow-hidden shadow-xl animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted">
              <thead className="bg-black/20 text-text-inverted uppercase text-xs font-bold tracking-wider">
                <tr>
                  {view !== 'benefits' && <th className="p-4 w-24 text-center">Status</th>}
                  {view === 'benefits' && <th className="p-4 w-24 text-center">Ícone</th>}

                  <th className="p-4">Nome / Descrição</th>

                  {view === 'plans' && <th className="p-4">Preço</th>}
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center">Carregando...</td></tr>
                ) : getCurrentList().map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">

                    {/* Coluna 1: Status ou Ícone */}
                    <td className="p-4 text-center">
                      {view === 'benefits' ? (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                      ) : (
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${item.active ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 opacity-50'}`}
                          title={item.active ? "Ativo" : "Inativo"}
                        ></span>
                      )}
                    </td>

                    {/* Coluna 2: Nome/Info Principal */}
                    <td className="p-4">
                      {view === 'benefits' ? (
                        <span className="font-bold text-text-inverted text-base">{item.text}</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          {item.logo_url ? (
                            <img src={item.logo_url} alt="" className="w-10 h-10 rounded-lg bg-white p-1 object-contain" />
                          ) : view === 'providers' && (
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs">IMG</div>
                          )}
                          <div>
                            <p className="font-bold text-text-inverted text-base">{item.name}</p>
                            {view === 'plans' && <p className="text-xs text-text-muted">{item.providers?.name}</p>}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Coluna 3: Preço (Apenas Planos) */}
                    {view === 'plans' && <td className="p-4 font-mono text-primary font-bold text-lg">R$ {item.price}</td>}

                    {/* Coluna 4: Ações */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(item)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400" title="Editar">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400" title="Excluir">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && getCurrentList().length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-text-muted">Nenhum registro encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL --- */}
      <CatalogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
        type={view === 'providers' ? 'providers' : view === 'benefits' ? 'benefits' : 'plans'}
        providersList={providers}
        benefitsList={benefits} // Passando a lista para poder vincular nos planos depois
      />
    </div>
  );
};

export default Plans;