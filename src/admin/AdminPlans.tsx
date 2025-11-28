import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { Plan, Provider } from '../types';

type ViewMode = 'plans' | 'providers' | 'import_ceps';

// --- COMPONENTE DE INPUT (Movido para fora para corrigir o bug de foco) ---
const InputField = ({ label, value, onChange, type = "text", colSpan = 1, placeholder = "" }: any) => (
  <div className={`col-span-1 md:col-span-${colSpan}`}>
     <label className="text-slate-400 text-xs uppercase font-bold mb-1 block">{label}</label>
     <input 
       type={type} 
       className="w-full bg-[#0d141c] text-white p-2.5 rounded border border-slate-700 focus:border-[#0096C7] outline-none transition-colors"
       placeholder={placeholder} 
       value={value || ''} 
       onChange={onChange} 
     />
  </div>
);

const AdminPlans: React.FC = () => {
  const [view, setView] = useState<ViewMode>('plans');
  const [loading, setLoading] = useState(true);
  
  // Dados
  const [plans, setPlans] = useState<Plan[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Estados de Importação
  const [importProviderId, setImportProviderId] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: plansData } = await supabase.from('plans').select('*, providers(name)').order('created_at', { ascending: false });
    const { data: providersData } = await supabase.from('providers').select('*').order('name');

    if (plansData) setPlans(plansData as any);
    if (providersData) setProviders(providersData as any);
    setLoading(false);
  };

  // --- LÓGICA DE IMPORTAÇÃO DE CEPS ---
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importProviderId) {
        toast.warn('Selecione um provedor e um arquivo CSV válido.');
        return;
    }

    setImporting(true);
    setImportProgress(0);
    setTotalRecords(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r\n|\n/);
        const cleanCeps: string[] = [];

        lines.forEach(line => {
            const numbersOnly = line.replace(/\D/g, '');
            if (numbersOnly.length === 8) {
                cleanCeps.push(numbersOnly);
            } else if (numbersOnly.length === 7) {
                cleanCeps.push('0' + numbersOnly);
            }
        });

        setTotalRecords(cleanCeps.length);
        
        if (cleanCeps.length === 0) {
            toast.error('Nenhum CEP válido encontrado no arquivo.');
            setImporting(false);
            return;
        }

        const BATCH_SIZE = 1000;
        let insertedCount = 0;
        let hasError = false;

        for (let i = 0; i < cleanCeps.length; i += BATCH_SIZE) {
            const batch = cleanCeps.slice(i, i + BATCH_SIZE).map(cep => ({
                cep: cep,
                provider_id: importProviderId
            }));

            const { error } = await supabase.from('serviceable_ceps').insert(batch);

            if (error) {
                console.error('Erro no lote ' + i, error);
                hasError = true;
            } else {
                insertedCount += batch.length;
                setImportProgress(Math.round((insertedCount / cleanCeps.length) * 100));
            }
        }

        setImporting(false);
        if (hasError) {
            toast.warn(`Importação concluída com alguns erros. ${insertedCount} CEPs importados.`);
        } else {
            toast.success(`Sucesso! ${insertedCount} CEPs vinculados ao provedor.`);
        }
        e.target.value = '';
    };

    reader.readAsText(file);
  };

  // --- CRUD LÓGICA ---
  const handleSave = async () => {
    try {
      const table = view === 'plans' ? 'plans' : 'providers';
      const payload = { ...formData };
      delete payload.providers; 

      if (editingId) {
        const { error } = await supabase.from(table).update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Atualizado!');
      } else {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
        toast.success('Criado!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error('Erro: ' + error.message);
    }
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('Tem certeza?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast.error('Erro ao excluir');
    else { toast.success('Excluído'); fetchData(); }
  };

  const toggleActive = async (id: string, currentStatus: boolean, table: string) => {
    await supabase.from(table).update({ active: !currentStatus }).eq('id', id);
    fetchData();
  };

  const openModal = (item?: any) => {
    setEditingId(item ? item.id : null);
    if (view === 'plans') {
      setFormData(item || { 
        name: '', provider_id: providers[0]?.id || '', price: 0, period: '/mês', 
        download_speed: '', upload_speed: '', subtitle: '', banner_image: '', 
        connection_type: 'Fibra Ótica', data_limit: 'Ilimitada', contract_text: '12 meses', 
        is_featured: false, badge_text: '', badge_icon: '', badge_color_class: '', 
        badge_text_class: '', active: true 
      });
    } else {
      setFormData(item || { name: '', type: '', logo_url: '', active: true });
    }
    setIsModalOpen(true);
  };

  // Helper para atualizar o form de forma limpa
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Gestão e Catálogo</h2>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
           <div className="bg-[#0d141c] p-1 rounded-lg border border-slate-700 flex flex-nowrap">
              <button onClick={() => setView('plans')} className={`px-4 py-2 rounded whitespace-nowrap ${view === 'plans' ? 'bg-[#0096C7] text-white' : 'text-slate-400 hover:text-white'}`}>Planos</button>
              <button onClick={() => setView('providers')} className={`px-4 py-2 rounded whitespace-nowrap ${view === 'providers' ? 'bg-[#0096C7] text-white' : 'text-slate-400 hover:text-white'}`}>Provedores</button>
              <button onClick={() => setView('import_ceps')} className={`px-4 py-2 rounded whitespace-nowrap flex items-center gap-2 ${view === 'import_ceps' ? 'bg-[#0096C7] text-white' : 'text-slate-400 hover:text-white'}`}>
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  Importar CEPs
              </button>
           </div>
           {view !== 'import_ceps' && (
             <button onClick={() => openModal()} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-500 whitespace-nowrap">+ Novo</button>
           )}
        </div>
      </div>

      {loading ? <p className="text-white text-center p-10">Carregando...</p> : (
        <>
            {/* === VIEW: IMPORTAÇÃO DE CEPS === */}
            {view === 'import_ceps' && (
                <div className="bg-[#192633] p-8 rounded-xl border border-white/10 shadow-lg max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#0096C7]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-[#0096C7] text-3xl">database</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Importação Massiva de CEPs</h3>
                        <p className="text-slate-400 text-sm">Vincule uma lista de CEPs (CSV) a um provedor para ativar a busca automática por endereço.</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">1. Escolha o Provedor</label>
                            <select 
                                className="w-full bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-[#0096C7] outline-none"
                                value={importProviderId}
                                onChange={(e) => setImportProviderId(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={`transition-opacity ${!importProviderId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">2. Selecione o Arquivo (.csv ou .txt)</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-[#0d141c] hover:border-[#0096C7] transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">cloud_upload</span>
                                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                                    <p className="text-xs text-slate-500">Formato: Lista de CEPs (um por linha)</p>
                                </div>
                                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleImportCSV} disabled={importing} />
                            </label>
                        </div>

                        {importing && (
                            <div className="bg-[#0d141c] p-4 rounded border border-slate-700">
                                <div className="flex justify-between text-xs text-slate-300 mb-1">
                                    <span>Importando...</span>
                                    <span>{importProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-[#0096C7] h-2 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                                </div>
                                <p className="text-center text-xs text-slate-500 mt-2">Processando {totalRecords} registros...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* === VIEW: LISTAGEM DE PLANOS/PROVEDORES === */}
            {view !== 'import_ceps' && (
                <div className="bg-[#192633] rounded-xl border border-white/10 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400 min-w-[800px]">
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
                                <button onClick={() => toggleActive(item.id, item.active, view === 'plans' ? 'plans' : 'providers')}
                                className={`px-2 py-1 rounded text-xs font-bold ${item.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {item.active ? 'ATIVO' : 'INATIVO'}
                                </button>
                            </td>
                            <td className="p-4 font-medium text-white">
                                <div className="flex items-center gap-2">
                                {item.logo_url && <img src={item.logo_url} className="w-6 h-6 rounded bg-white p-0.5 object-contain" alt="" />}
                                {item.name}
                                </div>
                            </td>
                            {view === 'plans' && <td className="p-4">{item.providers?.name}</td>}
                            {view === 'plans' && <td className="p-4 font-mono text-[#0096C7]">R$ {item.price}</td>}
                            <td className="p-4 text-right flex justify-end gap-2">
                            <button onClick={() => openModal(item)} className="text-blue-400 hover:text-blue-300">Editar</button>
                            <button onClick={() => handleDelete(item.id, view === 'plans' ? 'plans' : 'providers')} className="text-red-400 hover:text-red-300">Excluir</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            )}
        </>
      )}

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#192633] w-full max-w-4xl rounded-xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              {editingId ? 'Editar' : 'Criar'} {view === 'plans' ? 'Plano' : 'Provedor'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {view === 'providers' && (
                 <>
                   <InputField label="Nome" value={formData.name} onChange={(e: any) => updateField('name', e.target.value)} colSpan={4} />
                   <InputField label="URL do Logo" value={formData.logo_url} onChange={(e: any) => updateField('logo_url', e.target.value)} colSpan={4} />
                   <InputField label="Tipo" value={formData.type} onChange={(e: any) => updateField('type', e.target.value)} colSpan={4} />
                 </>
               )}

               {view === 'plans' && (
                 <>
                   <div className="col-span-1 md:col-span-4 text-[#0096C7] font-bold text-sm border-b border-white/5 pb-1 mt-2">DADOS GERAIS</div>
                   <InputField label="Nome do Plano" value={formData.name} onChange={(e: any) => updateField('name', e.target.value)} colSpan={2} />
                   
                   <div className="col-span-1 md:col-span-2">
                      <label className="text-slate-400 text-xs uppercase font-bold mb-1 block">Provedor</label>
                      <select className="w-full bg-[#0d141c] text-white p-2.5 rounded border border-slate-700 focus:border-[#0096C7] outline-none"
                        value={formData.provider_id} onChange={e => updateField('provider_id', e.target.value)}>
                        {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                   </div>
                   
                   <InputField label="Preço (R$)" type="number" value={formData.price} onChange={(e: any) => updateField('price', e.target.value)} />
                   <InputField label="Período" value={formData.period} onChange={(e: any) => updateField('period', e.target.value)} />
                   <InputField label="Subtítulo" value={formData.subtitle} onChange={(e: any) => updateField('subtitle', e.target.value)} colSpan={2} />

                   <div className="col-span-1 md:col-span-4 text-[#0096C7] font-bold text-sm border-b border-white/5 pb-1 mt-4">ESPECIFICAÇÕES</div>
                   <InputField label="Download" value={formData.download_speed} onChange={(e: any) => updateField('download_speed', e.target.value)} />
                   <InputField label="Upload" value={formData.upload_speed} onChange={(e: any) => updateField('upload_speed', e.target.value)} />
                   <InputField label="Conexão" value={formData.connection_type} onChange={(e: any) => updateField('connection_type', e.target.value)} />
                   <InputField label="Franquia" value={formData.data_limit} onChange={(e: any) => updateField('data_limit', e.target.value)} />
                   <InputField label="Contrato" value={formData.contract_text} onChange={(e: any) => updateField('contract_text', e.target.value)} colSpan={4} />

                   <div className="col-span-1 md:col-span-4 text-[#0096C7] font-bold text-sm border-b border-white/5 pb-1 mt-4">VISUAL</div>
                   <InputField label="URL Banner" value={formData.banner_image} onChange={(e: any) => updateField('banner_image', e.target.value)} colSpan={4} />
                   
                   <div className="col-span-1 md:col-span-4 flex flex-col md:flex-row gap-4 my-2 bg-white/5 p-3 rounded">
                      <label className="flex items-center gap-2 text-white"><input type="checkbox" checked={formData.active} onChange={e => updateField('active', e.target.checked)} className="accent-green-500 w-5 h-5"/> Ativo</label>
                      <label className="flex items-center gap-2 text-white"><input type="checkbox" checked={formData.is_featured} onChange={e => updateField('is_featured', e.target.checked)} className="accent-yellow-500 w-5 h-5"/> Destaque</label>
                   </div>
                   
                   <InputField label="Texto Badge" value={formData.badge_text} onChange={(e: any) => updateField('badge_text', e.target.value)} />
                   <InputField label="Ícone Badge" value={formData.badge_icon} onChange={(e: any) => updateField('badge_icon', e.target.value)} />
                   <InputField label="Cor BG Badge" value={formData.badge_color_class} onChange={(e: any) => updateField('badge_color_class', e.target.value)} />
                   <InputField label="Cor Txt Badge" value={formData.badge_text_class} onChange={(e: any) => updateField('badge_text_class', e.target.value)} />
                 </>
               )}
            </div>

            <div className="flex gap-2 mt-8 justify-end pt-4 border-t border-white/10">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-slate-400 hover:text-white">Cancelar</button>
              <button onClick={handleSave} className="bg-[#0096C7] px-8 py-2 rounded text-white font-bold hover:bg-[#0077B6]">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;