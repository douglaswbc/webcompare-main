import React, { useEffect, useState } from 'react';
import { Provider, Benefit } from '../../types';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  type: 'plans' | 'providers';
  providersList: Provider[];
}

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

const CatalogModal: React.FC<CatalogModalProps> = ({ isOpen, onClose, onSave, initialData, type, providersList }) => {
  const [formData, setFormData] = useState<any>({});
  
  // Estado local para gerenciar a lista de benefícios dentro do modal
  const [benefits, setBenefits] = useState<Partial<Benefit>[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
        // Se já tiver benefícios carregados, popula o estado
        if (initialData.benefits) {
            setBenefits(initialData.benefits);
        } else {
            setBenefits([]);
        }
      } else {
        // Defaults para criação
        setBenefits([]); // Limpa benefícios
        if (type === 'plans') {
          setFormData({
            name: '', provider_id: providersList[0]?.id || '', price: 0, period: '/mês',
            download_speed: '', upload_speed: '', subtitle: '', banner_image: '',
            connection_type: 'Fibra Ótica', data_limit: 'Ilimitada', contract_text: '12 meses',
            is_featured: false, active: true
          });
        } else {
          setFormData({ name: '', type: '', logo_url: '', active: true });
        }
      }
    }
  }, [isOpen, initialData, type, providersList]);

  // Handlers para Benefícios
  const addBenefit = () => {
    setBenefits([...benefits, { text: '', icon: 'check_circle' }]);
  };

  const removeBenefit = (index: number) => {
    const newBenefits = [...benefits];
    newBenefits.splice(index, 1);
    setBenefits(newBenefits);
  };

  const updateBenefit = (index: number, field: keyof Benefit, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setBenefits(newBenefits);
  };

  const handleSave = () => {
      // Inclui os benefícios no payload do plano antes de salvar
      const dataToSave = { ...formData };
      if (type === 'plans') {
          dataToSave.benefits = benefits;
      }
      onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background-paper-dark w-full max-w-4xl rounded-2xl border border-white/10 p-8 max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
        <h3 className="text-2xl font-black text-text-inverted mb-8 border-b border-white/10 pb-4">
          {initialData ? 'Editar' : 'Criar'} {type === 'plans' ? 'Plano' : 'Provedor'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {type === 'providers' ? (
            // --- FORM DE PROVEDOR ---
            <>
              <InputField label="Nome da Empresa" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} colSpan={4} />
              <InputField label="URL do Logo" value={formData.logo_url} onChange={(e: any) => setFormData({ ...formData, logo_url: e.target.value })} colSpan={4} />
              <InputField label="Tipo (Fibra, Satélite...)" value={formData.type} onChange={(e: any) => setFormData({ ...formData, type: e.target.value })} colSpan={4} />
            </>
          ) : (
            // --- FORM DE PLANO ---
            <>
              <div className="col-span-4 text-primary font-bold text-xs uppercase tracking-widest border-b border-white/10 pb-2 mt-2">Informações Principais</div>
              <InputField label="Nome do Plano" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} colSpan={2} />
              <div className="col-span-2">
                <label className="text-text-muted text-[10px] uppercase font-bold mb-1.5 block tracking-wider">Provedor</label>
                <select className="w-full bg-background-dark text-text-inverted p-3 rounded-lg border border-white/10 focus:border-primary outline-none"
                  value={formData.provider_id} onChange={(e: any) => setFormData({ ...formData, provider_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {providersList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
              
              <InputField label="URL do Banner" value={formData.banner_image} onChange={(e: any) => setFormData({ ...formData, banner_image: e.target.value })} colSpan={4} />

              {/* --- SEÇÃO DE BENEFÍCIOS --- */}
              <div className="col-span-4 mt-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                    <span className="text-primary font-bold text-xs uppercase tracking-widest">Benefícios Inclusos</span>
                    <button 
                        onClick={addBenefit}
                        className="text-xs bg-white/5 hover:bg-white/10 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span> Adicionar
                    </button>
                </div>

                <div className="space-y-2">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <div className="w-1/3">
                                <input 
                                    placeholder="Ícone (ex: wifi)" 
                                    className="w-full bg-background-dark text-text-inverted p-2 rounded border border-white/10 text-sm"
                                    value={benefit.icon}
                                    onChange={e => updateBenefit(idx, 'icon', e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <input 
                                    placeholder="Descrição (ex: Wi-Fi Grátis)" 
                                    className="w-full bg-background-dark text-text-inverted p-2 rounded border border-white/10 text-sm"
                                    value={benefit.text}
                                    onChange={e => updateBenefit(idx, 'text', e.target.value)}
                                />
                            </div>
                            <button onClick={() => removeBenefit(idx)} className="text-red-400 hover:text-red-300 p-2">
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    ))}
                    {benefits.length === 0 && (
                        <p className="text-text-muted text-xs italic text-center py-2">Nenhum benefício adicionado.</p>
                    )}
                </div>
                <div className="text-[10px] text-text-muted mt-2">
                    Dica: Use nomes de ícones do <a href="https://fonts.google.com/icons" target="_blank" className="underline hover:text-primary">Google Material Symbols</a> (ex: router, speed, check_circle).
                </div>
              </div>
            </>
          )}

          {/* CHECKBOXES COMUNS (Status) */}
          <div className="col-span-4 mt-2 p-4 bg-background-dark rounded-xl border border-white/5 flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer text-text-inverted font-bold select-none hover:text-primary transition-colors">
              <input type="checkbox" checked={!!formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer" />
              {type === 'plans' ? 'Plano Ativo' : 'Provedor Ativo'}
            </label>
            {type === 'plans' && (
              <label className="flex items-center gap-3 cursor-pointer text-text-inverted font-bold select-none hover:text-accent transition-colors">
                <input type="checkbox" checked={!!formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5 accent-accent cursor-pointer" />
                Destaque
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-8 justify-end pt-6 border-t border-white/10">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-text-muted hover:text-white font-bold transition-colors">Cancelar</button>
          <button onClick={handleSave} className="bg-primary px-8 py-3 rounded-xl text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogModal;