import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Plan, Provider } from '../../types';
import { catalogService } from '../../services/catalogService';

// Componentes
import CepImporter from '../../components/admin/CepImporter';
import CityImporter from '../../components/admin/CityImporter';
import CatalogModal from '../../components/admin/CatalogModal';

type ViewMode = 'plans' | 'providers' | 'import_ceps' | 'import_cities'; 

const Plans: React.FC = () => {
  const [view, setView] = useState<ViewMode>('plans');
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansData, providersData] = await Promise.all([
        catalogService.getPlans(),
        catalogService.getProviders()
      ]);
      setPlans(plansData);
      setProviders(providersData);
    } catch (error) {
      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      await catalogService.saveItem(
        view === 'plans' ? 'plans' : 'providers',
        formData, // Passa o objeto completo (incluindo array de benefits) para o serviço tratar
        editingItem?.id
      );
      
      toast.success('Salvo com sucesso!');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Isso excluirá o item permanentemente.')) return;
    try {
      await catalogService.deleteItem(view === 'plans' ? 'plans' : 'providers', id);
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

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-inverted">Catálogo</h1>
        
        {/* Toggle Views */}
        <div className="flex flex-wrap justify-center bg-background-paper-dark p-1 rounded-xl border border-white/10 gap-1">
          {[
            { id: 'plans', label: 'Planos', icon: 'router' },
            { id: 'providers', label: 'Provedores', icon: 'business' },
            { id: 'import_ceps', label: 'CEPs', icon: 'pin_drop' },
            { id: 'import_cities', label: 'Cidades', icon: 'location_city' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                view === tab.id ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {(view === 'plans' || view === 'providers') && (
          <button 
            onClick={() => openModal()} 
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined">add</span> 
            Novo {view === 'plans' ? 'Plano' : 'Provedor'}
          </button>
        )}
      </div>

      {/* CONTEÚDO */}
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
                    <th className="p-4 w-24 text-center">Status</th>
                    <th className="p-4">Nome</th>
                    {view === 'plans' && <th className="p-4">Preço</th>}
                    <th className="p-4 text-right">Ações</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center">Carregando...</td></tr>
                ) : (view === 'plans' ? plans : providers).map((item: any) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-center">
                        <span 
                            className={`inline-block w-3 h-3 rounded-full ${item.active ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 opacity-50'}`} 
                            title={item.active ? "Ativo" : "Inativo"}
                        ></span>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            {item.logo_url ? (
                                <img src={item.logo_url} alt="" className="w-10 h-10 rounded-lg bg-white p-1 object-contain" />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs">IMG</div>
                            )}
                            <div>
                                <p className="font-bold text-text-inverted text-base">{item.name}</p>
                                {view === 'plans' && (
                                    <div className="flex gap-2 text-xs text-text-muted">
                                        <span>{item.providers?.name}</span>
                                        {item.benefits && item.benefits.length > 0 && (
                                            <span className="text-primary font-bold ml-2">• {item.benefits.length} benefícios</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                    {view === 'plans' && <td className="p-4 font-mono text-primary font-bold text-lg">R$ {item.price}</td>}
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
                {!loading && (view === 'plans' ? plans : providers).length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-text-muted">Nenhum registro encontrado.</td></tr>
                )}
                </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      <CatalogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
        type={view === 'providers' ? 'providers' : 'plans'}
        providersList={providers}
      />
    </div>
  );
};

export default Plans;