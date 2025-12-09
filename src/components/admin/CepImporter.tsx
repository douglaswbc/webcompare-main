import React, { useState, useEffect } from 'react';
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

  // Estados da Lista
  const [cepsList, setCepsList] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingList, setLoadingList] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (providerId) {
        setPage(1);
        fetchCeps();
    } else {
        setCepsList([]);
        setTotalCount(0);
    }
  }, [providerId]);

  useEffect(() => {
    if (providerId) fetchCeps();
  }, [page]);

  const fetchCeps = async () => {
    setLoadingList(true);
    try {
        const { data, count } = await catalogService.getCeps({ providerId, page, pageSize: ITEMS_PER_PAGE });
        setCepsList(data || []);
        setTotalCount(count);
    } catch (error) {
        toast.error('Erro ao carregar lista de CEPs.');
    } finally {
        setLoadingList(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Tem certeza que deseja excluir este CEP?")) return;
      try {
          await catalogService.deleteCep(id);
          toast.success("CEP excluído.");
          fetchCeps();
      } catch (error) {
          toast.error("Erro ao excluir CEP.");
      }
  };

  const handleClearAll = async () => {
      const providerName = providers.find(p => p.id === providerId)?.name;
      const confirmMsg = `ATENÇÃO: Isso apagará TODOS os ${totalCount} CEPs cadastrados para "${providerName}".\n\nEssa ação é irreversível. Deseja continuar?`;
      
      if(!confirm(confirmMsg)) return;

      try {
          setLoadingList(true);
          await catalogService.clearProviderCeps(providerId);
          toast.success(`Todos os CEPs de ${providerName} foram removidos.`);
          fetchCeps();
      } catch (error) {
          toast.error("Erro ao limpar CEPs.");
      } finally {
          setLoadingList(false);
      }
  };

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

        await catalogService.importCepsBatch(providerId, cleanCeps, setProgress);
        toast.success(`${cleanCeps.length} CEPs importados com sucesso!`);
        fetchCeps(); // Atualiza a lista após importar
        
      } catch (error: any) {
        toast.error('Erro na importação: ' + error.message);
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-8">
        {/* --- CARD DE IMPORTAÇÃO --- */}
        <div className="bg-background-paper-dark p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">upload_file</span>
                </div>
                <h3 className="text-xl font-bold text-text-inverted">Importação de CEPs</h3>
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
                <label className="block w-full h-32 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center group relative overflow-hidden">
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

        {/* --- LISTA DE CEPS VINCULADOS --- */}
        {providerId && (
            <div className="bg-background-paper-dark rounded-2xl border border-white/10 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-black/20 flex justify-between items-center border-b border-white/5">
                    <h4 className="font-bold text-text-inverted">CEPs Cadastrados ({totalCount})</h4>
                    {totalCount > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded flex items-center gap-1 transition-colors border border-red-500/20"
                        >
                            <span className="material-symbols-outlined text-sm">delete_sweep</span>
                            Limpar Tudo
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-text-muted">
                        <thead className="bg-black/20 text-text-inverted uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-4">CEP</th>
                                <th className="p-4 text-right">Data Importação</th>
                                <th className="p-4 text-right w-20">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loadingList ? (
                                <tr><td colSpan={3} className="p-8 text-center">Carregando...</td></tr>
                            ) : cepsList.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-white">{item.cep}</td>
                                    <td className="p-4 text-right text-xs opacity-70">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400" title="Excluir">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loadingList && cepsList.length === 0 && (
                                <tr><td colSpan={3} className="p-8 text-center opacity-50">Nenhum CEP encontrado para este provedor.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {totalCount > 0 && (
                    <div className="p-3 border-t border-white/5 flex items-center justify-between bg-black/20">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <span className="text-xs text-text-muted">Página {page} de {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"
                        >
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default CepImporter;