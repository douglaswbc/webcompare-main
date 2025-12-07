import React, { useEffect, useState } from 'react';
import { Provider } from '../../types';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  type: 'plans' | 'providers';
  providersList: Provider[];
}

// Pequeno helper interno para inputs
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

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        // Defaults para criação
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background-paper-dark w-full max-w-4xl rounded-2xl border border-white/10 p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
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
          <button onClick={() => onSave(formData)} className="bg-primary px-8 py-3 rounded-xl text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:-translate-y-1">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogModal;