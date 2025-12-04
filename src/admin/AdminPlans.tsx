import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { Plan, Provider } from '../types';

type ViewMode = 'plans' | 'providers' | 'import_ceps';

const InputField = ({ label, value, onChange, type = "text", colSpan = 1, placeholder = "" }: any) => (
  <div className={`col-span-1 md:col-span-${colSpan}`}>
    <label className="text-text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-wider">{label}</label>
    <input
      type={type}
      className="w-full bg-background-dark text-text-inverted p-3 rounded-lg border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/30"
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
    />
  </div>
);

const AdminPlans: React.FC = () => {
  const [view, setView] = useState<ViewMode>('plans');
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Importação
  const [importProviderId, setImportProviderId] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: plansData } = await supabase.from('plans').select('*, providers(name)').order('created_at', { ascending: false });
    const { data: providersData } = await supabase.from('providers').select('*').order('name');
    if (plansData) setPlans(plansData as any);
    if (providersData) setProviders(providersData as any);
    setLoading(false);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importProviderId) return toast.warn('Selecione um provedor e arquivo.');
    setImporting(true); setImportProgress(0); setTotalRecords(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r\n|\n/);
      const cleanCeps: string[] = [];
      lines.forEach(line => {
        const numbersOnly = line.replace(/\D/g, '');
        if (numbersOnly.length === 8) cleanCeps.push(numbersOnly);
        else if (numbersOnly.length === 7) cleanCeps.push('0' + numbersOnly);
      });

      setTotalRecords(cleanCeps.length);
      if (cleanCeps.length === 0) { toast.error('Nenhum CEP válido.'); setImporting(false); return; }

      const BATCH_SIZE = 1000;
      let insertedCount = 0;
      for (let i = 0; i < cleanCeps.length; i += BATCH_SIZE) {
        const batch = cleanCeps.slice(i, i + BATCH_SIZE).map(cep => ({ cep: cep, provider_id: importProviderId }));
        const { error } = await supabase.from('serviceable_ceps').insert(batch);
        if (!error) {
          insertedCount += batch.length;
          setImportProgress(Math.round((insertedCount / cleanCeps.length) * 100));
        }
      }
      setImporting(false);
      toast.success(`${insertedCount} CEPs importados.`);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    try {
      const table = view === 'plans' ? 'plans' : 'providers';
      const payload = { ...formData };
      delete payload.providers;
      if (editingId) await supabase.from(table).update(payload).eq('id', editingId);
      else await supabase.from(table).insert(payload);
      toast.success('Salvo!'); setIsModalOpen(false); fetchData();
    } catch (error: any) { toast.error(error.message); }
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('Excluir permanentemente?')) return;
    await supabase.from(table).delete().eq('id', id);
    toast.success('Excluído'); fetchData();
  };

  const openModal = (item?: any) => {
    setEditingId(item ? item.id : null);
    if (view === 'plans') {
      setFormData(item || {
        name: '', provider_id: providers[0]?.id || '', price: 0, period: '/mês',
        download_speed: '', upload_speed: '', subtitle: '', banner_image: '',
        connection_type: 'Fibra Ótica', data_limit: 'Ilimitada', contract_text: '12 meses',
        is_featured: false, badge_text: '', badge_icon: '', badge_color_class: '', badge_text_class: '', active: true
      });
    } else {
      setFormData(item || { name: '', type: '', logo_url: '', active: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-inverted">Catálogo</h1>
        <div className="flex bg-background-paper-dark p-1 rounded-xl border border-white/10">
          {[
            { id: 'plans', label: 'Planos', icon: 'router' },
            { id: 'providers', label: 'Provedores', icon: 'business' },
            { id: 'import_ceps', label: 'Importar CEPs', icon: 'upload_file' }
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
        {view !== 'import_ceps' && (
          <button onClick={() => openModal()} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
            <span className="material-symbols-outlined">add</span> Novo
          </button>
        )}
      </div>

      {view === 'import_ceps' && (
        <div className="bg-background-paper-dark p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <h3 className="text-xl font-bold text-text-inverted">Importação em Massa</h3>
            <p className="text-text-muted text-sm mt-1">Carregue uma lista de CEPs atendidos para um provedor.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-text-muted text-xs font-bold uppercase mb-2 block">Provedor</label>
              <select className="w-full bg-background-dark text-text-inverted p-4 rounded-xl border border-white/10 focus:border-primary outline-none cursor-pointer"
                value={importProviderId} onChange={(e) => setImportProviderId(e.target.value)}>
                <option value="">Selecione um parceiro...</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className={`transition-all duration-300 ${!importProviderId ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
              <label className="block w-full h-40 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform rounded-2xl origin-center duration-500"></div>
                <span className="material-symbols-outlined text-4xl text-text-muted group-hover:text-primary mb-2 relative z-10">cloud_upload</span>
                <p className="text-sm font-medium text-text-muted group-hover:text-text-inverted relative z-10">Clique para enviar .CSV ou .TXT</p>
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleImportCSV} disabled={importing} />
              </label>
            </div>

            {importing && (
              <div className="bg-background-dark p-4 rounded-xl border border-white/10 animate-pulse">
                <div className="flex justify-between text-xs text-primary mb-2 font-bold uppercase">
                  <span>Processando...</span>
                  <span>{importProgress}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {view !== 'import_ceps' && (
        <div className="bg-background-paper-dark rounded-2xl border border-white/10 overflow-hidden shadow-xl">
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
              {(view === 'plans' ? plans : providers).map((item: any) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-center">
                    <button onClick={() => {/* Toggle Logic */ }} className={`w-3 h-3 rounded-full ${item.active ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} title={item.active ? "Ativo" : "Inativo"}></button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.logo_url ? <img src={item.logo_url} className="w-10 h-10 rounded-lg bg-white p-1 object-contain" /> : <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs">IMG</div>}
                      <div>
                        <p className="font-bold text-text-inverted text-base">{item.name}</p>
                        {view === 'plans' && <p className="text-xs">{item.providers?.name}</p>}
                      </div>
                    </div>
                  </td>
                  {view === 'plans' && <td className="p-4 font-mono text-primary font-bold text-lg">R$ {item.price}</td>}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(item)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><span className="material-symbols-outlined">edit</span></button>
                      <button onClick={() => handleDelete(item.id, view === 'plans' ? 'plans' : 'providers')} className="p-2 hover:bg-white/10 rounded-lg text-red-400"><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background-paper-dark w-full max-w-4xl rounded-2xl border border-white/10 p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-black text-text-inverted mb-8 border-b border-white/10 pb-4">
              {editingId ? 'Editar' : 'Criar'} {view === 'plans' ? 'Plano' : 'Provedor'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {view === 'providers' ? (
                <>
                  <InputField label="Nome da Empresa" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} colSpan={4} />
                  <InputField label="URL do Logo" value={formData.logo_url} onChange={(e: any) => setFormData({ ...formData, logo_url: e.target.value })} colSpan={4} />
                  <InputField label="Tipo (Fibra, Satélite...)" value={formData.type} onChange={(e: any) => setFormData({ ...formData, type: e.target.value })} colSpan={4} />
                </>
              ) : (
                <>
                  <div className="col-span-4 text-primary font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-2 mt-2">Informações Principais</div>
                  <InputField label="Nome do Plano" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} colSpan={2} />
                  <div className="col-span-2">
                    <label className="text-text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-wider">Provedor</label>
                    <select className="w-full bg-background-dark text-text-inverted p-3 rounded-lg border border-white/10 focus:border-primary outline-none"
                      value={formData.provider_id} onChange={e => setFormData({ ...formData, provider_id: e.target.value })}>
                      {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <InputField label="Preço (R$)" type="number" value={formData.price} onChange={(e: any) => setFormData({ ...formData, price: e.target.value })} />
                  <InputField label="Ciclo (ex: /mês)" value={formData.period} onChange={(e: any) => setFormData({ ...formData, period: e.target.value })} />
                  <InputField label="Subtítulo Comercial" value={formData.subtitle} onChange={(e: any) => setFormData({ ...formData, subtitle: e.target.value })} colSpan={2} />

                  <div className="col-span-4 text-primary font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-2 mt-4">Detalhes Técnicos</div>
                  <InputField label="Download (ex: 500 Mega)" value={formData.download_speed} onChange={(e: any) => setFormData({ ...formData, download_speed: e.target.value })} />
                  <InputField label="Upload" value={formData.upload_speed} onChange={(e: any) => setFormData({ ...formData, upload_speed: e.target.value })} />
                  <InputField label="Tecnologia" value={formData.connection_type} onChange={(e: any) => setFormData({ ...formData, connection_type: e.target.value })} />
                  <InputField label="Fidelidade" value={formData.contract_text} onChange={(e: any) => setFormData({ ...formData, contract_text: e.target.value })} />

                  <div className="col-span-4 mt-2 p-4 bg-background-dark rounded-xl border border-white/5 flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer text-text-inverted font-bold">
                      <input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="w-5 h-5 accent-primary" />
                      Plano Ativo
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-text-inverted font-bold">
                      <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5 accent-accent" />
                      Destaque (Badge)
                    </label>
                  </div>

                  <InputField label="URL da Imagem do Banner" value={formData.banner_image} onChange={(e: any) => setFormData({ ...formData, banner_image: e.target.value })} colSpan={4} />
                </>
              )}
            </div>

            <div className="flex gap-3 mt-8 justify-end pt-6 border-t border-white/10">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-text-muted hover:text-white font-bold transition-colors">Cancelar</button>
              <button onClick={handleSave} className="bg-primary px-8 py-3 rounded-xl text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;