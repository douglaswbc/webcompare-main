import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Provider } from '../../types';
import { catalogService } from '../../services/catalogService';

interface CepImporterProps {
  providers: Provider[];
}

const CepImporter: React.FC<CepImporterProps> = ({ providers }) => {
  const [providerId, setProviderId] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !providerId) {
        toast.warn('Selecione um provedor e um arquivo válido.');
        return;
    }

    setImporting(true);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        // Processa o texto para extrair CEPs limpos
        const cleanCeps: string[] = [];
        const lines = text.split(/\r\n|\n/);
        
        lines.forEach(line => {
          const numbersOnly = line.replace(/\D/g, '');
          if (numbersOnly.length === 8) cleanCeps.push(numbersOnly);
          else if (numbersOnly.length === 7) cleanCeps.push('0' + numbersOnly);
        });

        if (cleanCeps.length === 0) {
            toast.warn('Nenhum CEP válido encontrado no arquivo.');
            return;
        }

        // Envia para o serviço
        const count = await catalogService.importCepsBatch(providerId, cleanCeps, setProgress);
        toast.success(`${count} CEPs importados com sucesso!`);
        
      } catch (error: any) {
        toast.error('Erro na importação: ' + error.message);
      } finally {
        setImporting(false);
        e.target.value = ''; // Reseta o input
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-background-paper-dark p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">upload_file</span>
        </div>
        <h3 className="text-xl font-bold text-text-inverted">Importação em Massa</h3>
        <p className="text-text-muted text-sm mt-1">Carregue uma lista de CEPs atendidos (.txt ou .csv)</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-text-muted text-xs font-bold uppercase mb-2 block">Selecione o Provedor</label>
          <select 
            className="w-full bg-background-dark text-text-inverted p-4 rounded-xl border border-white/10 focus:border-primary outline-none cursor-pointer"
            value={providerId} 
            onChange={(e) => setProviderId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className={`transition-all duration-300 ${!providerId ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
          <label className="block w-full h-40 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 scale-0 group-hover:scale-100 transition-transform rounded-2xl origin-center duration-500"></div>
            <span className="material-symbols-outlined text-4xl text-text-muted group-hover:text-primary mb-2 relative z-10">cloud_upload</span>
            <p className="text-sm font-medium text-text-muted group-hover:text-text-inverted relative z-10">
                Clique para enviar arquivo
            </p>
            <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} disabled={importing} />
          </label>
        </div>

        {importing && (
          <div className="bg-background-dark p-4 rounded-xl border border-white/10 animate-pulse">
            <div className="flex justify-between text-xs text-primary mb-2 font-bold uppercase">
              <span>Processando...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CepImporter;