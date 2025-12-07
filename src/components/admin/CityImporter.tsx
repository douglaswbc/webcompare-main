import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { Provider } from '../../types';
import { catalogService } from '../../services/catalogService';
import { normalizeCity } from '../../utils/textUtils'; // <--- Importação correta

interface CityImporterProps {
  providers: Provider[];
}

const CityImporter: React.FC<CityImporterProps> = ({ providers }) => {
  const [providerId, setProviderId] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !providerId) {
        toast.warn('Selecione um provedor e um arquivo Excel (.xlsx).');
        return;
    }

    setImporting(true);
    setProgress(0);

    const reader = new FileReader();
    
    // Leitura do arquivo como ArrayBuffer (necessário para xlsx)
    reader.readAsArrayBuffer(file);
    
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pega a primeira aba do Excel
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Converte para JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Validação e Limpeza
        const cleanData: { city: string; uf: string }[] = [];
        
        jsonData.forEach((row: any) => {
          // Tenta encontrar as colunas ignorando maiúsculas/minúsculas
          const city = row['cidade'] || row['Cidade'] || row['CIDADE'];
          const uf = row['uf'] || row['UF'] || row['estado'] || row['Estado'];

          if (city && uf) {
            cleanData.push({
              city: normalizeCity(city), // <--- USO CORRETO DO NORMALIZADOR
              uf: String(uf).trim().toUpperCase() // Padroniza UF em maiúsculo
            });
          }
        });

        if (cleanData.length === 0) {
            toast.warn('Nenhuma cidade válida encontrada. Verifique se as colunas são "cidade" e "uf".');
            return;
        }

        // Envia para o serviço
        const count = await catalogService.importCitiesBatch(providerId, cleanData, setProgress);
        toast.success(`${count} cidades importadas com sucesso!`);
        
      } catch (error: any) {
        console.error(error);
        toast.error('Erro na importação: ' + error.message);
      } finally {
        setImporting(false);
        e.target.value = ''; // Reseta o input
      }
    };
  };

  return (
    <div className="bg-background-paper-dark p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">table_view</span>
        </div>
        <h3 className="text-xl font-bold text-text-inverted">Importar Cidades (Excel)</h3>
        <p className="text-text-muted text-sm mt-1">Carregue um arquivo .xlsx com colunas: <strong>cidade</strong> e <strong>uf</strong></p>
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
          <label className="block w-full h-40 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-green-500 hover:bg-green-500/5 transition-all flex flex-col items-center justify-center group relative overflow-hidden">
            <div className="absolute inset-0 bg-green-500/5 scale-0 group-hover:scale-100 transition-transform rounded-2xl origin-center duration-500"></div>
            <span className="material-symbols-outlined text-4xl text-text-muted group-hover:text-green-500 mb-2 relative z-10">description</span>
            <p className="text-sm font-medium text-text-muted group-hover:text-text-inverted relative z-10">
                Clique para enviar .XLSX
            </p>
            <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} disabled={importing} />
          </label>
        </div>

        {importing && (
          <div className="bg-background-dark p-4 rounded-xl border border-white/10 animate-pulse">
            <div className="flex justify-between text-xs text-green-500 mb-2 font-bold uppercase">
              <span>Processando...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityImporter;