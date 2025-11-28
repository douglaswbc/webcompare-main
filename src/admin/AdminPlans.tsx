import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify'; // <--- Importar
import { Plan, Provider } from '../types';

type ViewMode = 'plans' | 'providers';

const AdminPlans: React.FC = () => {
  const [view, setView] = useState<ViewMode>('plans');
  const [loading, setLoading] = useState(true);
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form States
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Busca Planos
    const { data: plansData } = await supabase
      .from('plans')
      .select('*, providers(name)')
      .order('created_at', { ascending: false });
    
    // Busca Provedores
    const { data: providersData } = await supabase
      .from('providers')
      .select('*')
      .order('name');

    if (plansData) setPlans(plansData as any);
    if (providersData) setProviders(providersData as any);
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const table = view === 'plans' ? 'plans' : 'providers';
      
      const payload = { ...formData };
      delete payload.providers; 

      if (editingId) {
        // Update
        const { error } = await supabase.from(table).update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Atualizado com sucesso!'); // <--- Toast
      } else {
        // Create
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
        toast.success('Criado com sucesso!'); // <--- Toast
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message); // <--- Toast
    }
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('Tem certeza? Isso pode afetar leads vinculados.')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast.error('Erro ao excluir: ' + error.message);
    else {
        toast.success('Item excluído com sucesso.');
        fetchData();
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean, table: string) => {
    await supabase.from(table).update({ active: !currentStatus }).eq('id', id);
    toast.info(`Item ${!currentStatus ? 'ativado' : 'desativado'}.`);
    fetchData();
  };

  const openModal = (item?: any) => {
    setEditingId(item ? item.id : null);
    
    if (view === 'plans') {
      setFormData(item || { 
        name: '', 
        provider_id: providers[0]?.id || '', 
        price: 0, 
        period: '/mês',
        download_speed: '', 
        upload_speed: '', 
        subtitle: '',
        banner_image: '',
        connection_type: 'Fibra Ótica',
        data_limit: 'Ilimitada',
        contract_text: '12 meses',
        is_featured: false, 
        badge_text: '',
        badge_icon: '',
        badge_color_class: '',
        badge_text_class: '',
        active: true 
      });
    } else {
      setFormData(item || { name: '', type: '', logo_url: '', active: true });
    }
    setIsModalOpen(true);
  };

  // Helper para Inputs
  const InputField = ({ label, field, type = "text", colSpan = 1, placeholder = "" }: any) => (
    <div className={`col-span-${colSpan}`}>
       <label className="text-slate-400 text-xs uppercase font-bold mb-1 block">{label}</label>
       <input 
         type={type}
         className="w-full bg-[#0d141c] text-white p-2.5 rounded border border-slate-700 focus:border-primary outline-none"
         placeholder={placeholder}
         value={formData[field] || ''} 
         onChange={e => setFormData({...formData, [field]: e.target.value})} 
       />
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gestão de {view === 'plans' ? 'Planos' : 'Provedores'}</h2>
        <div className="flex gap-2">
           <div className="bg-[#0d141c] p-1 rounded-lg border border-slate-700 flex">
              <button 
                onClick={() => setView('plans')}
                className={`px-4 py-2 rounded ${view === 'plans' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Planos
              </button>
              <button 
                onClick={() => setView('providers')}
                className={`px-4 py-2 rounded ${view === 'providers' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Provedores
              </button>
           </div>
           <button onClick={() => openModal()} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-500 transition-colors">
             + Novo
           </button>
        </div>
      </div>

      {loading ? <p className="text-white">Carregando...</p> : (
        <div className="bg-[#192633] rounded-xl border border-white/10 overflow-hidden">
           <table className="w-full text-left text-sm text-slate-400">
             <thead className="bg-[#0d141c] text-white uppercase">
               <tr>
                 <th className="p-4">Status</th>
                 <th className="p-4">Nome</th>
                 {view === 'plans' && <th className="p-4">Provedor</th>}
                 {view === 'plans' && <th className="p-4">Preço</th>}
                 <th className="p-4 text-right">Ações</th>
               </tr>
             </thead>
             <tbody>
               {(view === 'plans' ? plans : providers).map((item: any) => (
                 <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                   <td className="p-4">
                      <button 
                        onClick={() => toggleActive(item.id, item.active, view === 'plans' ? 'plans' : 'providers')}
                        className={`px-2 py-1 rounded text-xs font-bold ${item.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                      >
                        {item.active ? 'ATIVO' : 'INATIVO'}
                      </button>
                   </td>
                   <td className="p-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        {item.logo_url && <img src={item.logo_url} className="w-6 h-6 rounded bg-white p-0.5" alt="" />}
                        {item.name}
                        {item.is_featured && <span className="text-yellow-400 text-xs border border-yellow-400 px-1 rounded">★</span>}
                      </div>
                   </td>
                   {view === 'plans' && <td className="p-4">{item.providers?.name}</td>}
                   {view === 'plans' && <td className="p-4">R$ {item.price}</td>}
                   <td className="p-4 text-right flex justify-end gap-2">
                     <button onClick={() => openModal(item)} className="text-blue-400 hover:text-blue-300">Editar</button>
                     <button onClick={() => handleDelete(item.id, view === 'plans' ? 'plans' : 'providers')} className="text-red-400 hover:text-red-300">Excluir</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#192633] w-full max-w-4xl rounded-xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              {editingId ? 'Editar' : 'Criar'} {view === 'plans' ? 'Plano' : 'Provedor'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* === FORMULARIO DE PROVEDOR === */}
               {view === 'providers' && (
                 <>
                   <InputField label="Nome" field="name" colSpan={4} />
                   <InputField label="URL do Logo" field="logo_url" colSpan={4} />
                   <InputField label="Tipo" field="type" colSpan={4} placeholder="Ex: Fibra, Satélite" />
                 </>
               )}

               {/* === FORMULARIO DE PLANO (COMPLETO) === */}
               {view === 'plans' && (
                 <>
                   <div className="col-span-1 md:col-span-2 lg:col-span-4 text-primary font-bold text-sm border-b border-white/5 pb-1 mt-2">DADOS GERAIS</div>
                   
                   <InputField label="Nome do Plano" field="name" colSpan={2} />
                   
                   <div className="col-span-2">
                      <label className="text-slate-400 text-xs uppercase font-bold mb-1 block">Provedor</label>
                      <select className="w-full bg-[#0d141c] text-white p-2.5 rounded border border-slate-700 focus:border-primary outline-none"
                        value={formData.provider_id} onChange={e => setFormData({...formData, provider_id: e.target.value})}>
                        {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                   </div>
                   
                   <InputField label="Preço (R$)" field="price" type="number" />
                   <InputField label="Período" field="period" placeholder="/mês" />
                   <InputField label="Subtítulo Promocional" field="subtitle" colSpan={2} placeholder="Ex: nos primeiros 12 meses" />

                   <div className="col-span-1 md:col-span-2 lg:col-span-4 text-primary font-bold text-sm border-b border-white/5 pb-1 mt-4">ESPECIFICAÇÕES</div>

                   <InputField label="Download" field="download_speed" placeholder="Ex: 500 Mega" />
                   <InputField label="Upload" field="upload_speed" placeholder="Ex: 250 Mega" />
                   <InputField label="Tipo Conexão" field="connection_type" placeholder="Ex: Fibra Ótica" />
                   <InputField label="Franquia de Dados" field="data_limit" placeholder="Ex: Ilimitada" />
                   <InputField label="Contrato" field="contract_text" colSpan={4} placeholder="Ex: Fidelidade de 12 meses" />

                   <div className="col-span-1 md:col-span-2 lg:col-span-4 text-primary font-bold text-sm border-b border-white/5 pb-1 mt-4">VISUAL E DESTAQUES</div>

                   <InputField label="URL da Imagem Banner" field="banner_image" colSpan={4} />

                   <div className="col-span-4 flex gap-6 my-2 bg-white/5 p-3 rounded">
                      <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                        <input type="checkbox" checked={formData.active} 
                          onChange={e => setFormData({...formData, active: e.target.checked})} 
                          className="w-5 h-5 accent-green-500 rounded" />
                        <span className="font-bold">Plano Ativo (Visível)</span>
                      </label>

                      <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                        <input type="checkbox" checked={formData.is_featured} 
                          onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                          className="w-5 h-5 accent-yellow-500 rounded" />
                        <span className="font-bold text-yellow-400">Plano em Destaque</span>
                      </label>
                   </div>

                   <InputField label="Texto do Badge" field="badge_text" placeholder="Ex: Mais Vendido" />
                   <InputField label="Ícone (Material Symbol)" field="badge_icon" placeholder="Ex: star" />
                   <InputField label="Classe de Cor (Tailwind BG)" field="badge_color_class" placeholder="Ex: bg-amber-100" />
                   <InputField label="Classe de Texto (Tailwind Text)" field="badge_text_class" placeholder="Ex: text-amber-700" />
                 </>
               )}
            </div>

            <div className="flex gap-2 mt-8 justify-end pt-4 border-t border-white/10">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleSave} className="bg-primary px-8 py-2 rounded text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;