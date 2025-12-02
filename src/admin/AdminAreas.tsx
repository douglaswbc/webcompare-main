import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import * as toGeoJSON from '@mapbox/togeojson';

// Lista de Estados para o Dropdown
const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const AdminAreas: React.FC = () => {
  // Estados de Upload
  const [providerName, setProviderName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [areaUf, setAreaUf] = useState(''); // <--- NOVO: Estado para UF
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); 
  
  // Estados de Dados
  const [providers, setProviders] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  
  // Estados de Lista e Paginação
  const [loadingList, setLoadingList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterProvider, setFilterProvider] = useState('');

  const ITEMS_PER_PAGE = 10;

  useEffect(() => { 
    fetchProviders();
    fetchAreas(); 
  }, [currentPage, filterProvider]);

  const fetchProviders = async () => {
    const { data } = await supabase.from('providers').select('id, name').order('name');
    if (data) setProviders(data);
  };

  const fetchAreas = async () => {
    setLoadingList(true);
    try {
        let query = supabase
            .from('coverage_areas')
            // Busca também a coluna UF agora
            .select('id, provider_name, area_name, uf', { count: 'exact' });

        if (filterProvider) {
            query = query.ilike('provider_name', `%${filterProvider}%`);
        }

        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, count, error } = await query
            .order('provider_name', { ascending: true })
            .order('area_name', { ascending: true })
            .range(from, to);

        if (error) throw error;

        setAreas(data || []);
        setTotalCount(count || 0);

    } catch (error) {
        console.error(error);
        toast.error('Erro ao carregar lista de áreas.');
    } finally {
        setLoadingList(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Tem certeza?')) return;
    const { error } = await supabase.from('coverage_areas').delete().eq('id', id);
    if(error) toast.error('Erro ao excluir.');
    else { 
        toast.success('Área excluída.'); 
        fetchAreas();
    }
  }

  const handleClearProviderAreas = async () => {
      if (!providerName) {
          toast.warn('Selecione um provedor primeiro.');
          return;
      }
      
      if (!confirm(`ATENÇÃO: Isso apagará TODAS as áreas cadastradas para "${providerName}". Deseja continuar?`)) {
          return;
      }

      setUploading(true);
      try {
          const { error } = await supabase
            .from('coverage_areas')
            .delete()
            .eq('provider_name', providerName);

          if (error) throw error;
          
          toast.success(`Todas as áreas de ${providerName} foram removidas.`);
          fetchAreas();
      } catch (error: any) {
          toast.error('Erro ao limpar áreas: ' + error.message);
      } finally {
          setUploading(false);
      }
  };

  const removeZDimension = (coords: any[]): any[] => {
    return coords.map((point: any) => {
        if (Array.isArray(point[0])) return removeZDimension(point);
        return [point[0], point[1]];
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Validação inclui UF agora
    if (!file || !providerName || !areaUf) {
      toast.warn('Selecione Provedor, UF (Estado) e o Arquivo.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let kmlText = '';

      if (file.name.endsWith('.kmz')) {
        const zip = await JSZip.loadAsync(file);
        const kmlFile = Object.values(zip.files).find(f => f.name.endsWith('.kml'));
        if (!kmlFile) throw new Error('KML não encontrado no KMZ');
        kmlText = await kmlFile.async('string');
      } else {
        kmlText = await file.text();
      }

      const parser = new DOMParser();
      const kmlDom = parser.parseFromString(kmlText, 'text/xml');
      const geoJson = toGeoJSON.kml(kmlDom);

      let count = 0;
      let errors = 0;
      let skipped = 0;

      const { data: existingAreas } = await supabase
        .from('coverage_areas')
        .select('area_name')
        .eq('provider_name', providerName)
        .eq('uf', areaUf); // Verifica duplicidade no mesmo estado
      
      const existingNames = new Set(existingAreas?.map(a => a.area_name));

      if (geoJson.type === 'FeatureCollection') {
        const totalFeatures = geoJson.features.length;
        let processed = 0;

        for (const feature of geoJson.features) {
          processed++;
          const currentProgress = Math.round((processed / totalFeatures) * 100);
          setProgress(currentProgress);

          const featureName = areaName || feature.properties?.name || file.name;
          
          if (existingNames.has(featureName)) {
              skipped++;
              continue; 
          }

          if (feature.geometry) {
            let finalGeometry = feature.geometry;

            if (feature.geometry.type === 'Polygon') {
                finalGeometry = {
                    type: 'MultiPolygon',
                    coordinates: [feature.geometry.coordinates]
                };
            }

            if (finalGeometry.type === 'MultiPolygon') {
                finalGeometry.coordinates = removeZDimension(finalGeometry.coordinates);
            }

            if (finalGeometry.type === 'MultiPolygon' || finalGeometry.type === 'Polygon') {
                const { error } = await supabase.from('coverage_areas').insert({
                  provider_name: providerName,
                  area_name: featureName,
                  uf: areaUf, // <--- INSERINDO O UF
                  geom: finalGeometry 
                });

                if (error) { 
                    console.error('Erro Supabase:', error); 
                    errors++; 
                } else { 
                    count++; 
                    existingNames.add(featureName);
                }
            }
          }
          if (processed % 10 === 0) await new Promise(r => setTimeout(r, 0));
        }
      }

      if (count > 0) { 
          toast.success(`${count} áreas importadas para ${areaUf}! (${skipped} duplicadas)`); 
          fetchAreas(); 
          setAreaName(''); 
      } else if (skipped > 0 && count === 0) {
          toast.warn('Todas as áreas já existiam neste estado.');
      } else if (errors > 0) {
          toast.error(`Falha ao importar ${errors} polígonos.`);
      } else {
          toast.warn('Nenhum polígono válido encontrado.');
      }
      
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao processar: ' + error.message);
    } finally { 
      setUploading(false); 
      setProgress(0);
      e.target.value = '';
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Mapas de Cobertura</h2>

      {/* --- BOX DE IMPORTAÇÃO --- */}
      <div className="bg-[#192633] p-6 rounded-xl border border-white/10 mb-8 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0096C7]">upload_file</span>
            Importar Nova Área
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          
          <select 
            className="bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-[#0096C7] outline-none cursor-pointer"
            value={providerName}
            onChange={e => setProviderName(e.target.value)}
            disabled={uploading}
          >
            <option value="">Selecione o Provedor</option>
            {providers.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          {/* DROP-DOWN DE ESTADO (UF) */}
          <select 
            className="bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-[#0096C7] outline-none cursor-pointer"
            value={areaUf}
            onChange={e => setAreaUf(e.target.value)}
            disabled={uploading}
          >
            <option value="">Estado (UF)</option>
            {ESTADOS.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>

          <input 
            placeholder="Nome da Área (Opcional)" 
            className="bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-[#0096C7] outline-none"
            value={areaName}
            onChange={e => setAreaName(e.target.value)}
            disabled={uploading}
          />
          
          <div className="flex gap-2">
              <label className={`flex-1 flex items-center justify-center gap-2 bg-[#0096C7] hover:bg-[#0077B6] text-white p-3 rounded cursor-pointer transition-colors font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="material-symbols-outlined">folder_open</span>
                {uploading ? 'Processando...' : 'Importar KMZ'}
                <input type="file" accept=".kml,.kmz" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>

              <button 
                onClick={handleClearProviderAreas}
                disabled={!providerName || uploading}
                title="Apagar todas as áreas deste provedor"
                className="bg-red-600/20 hover:bg-red-600/40 text-red-400 p-3 rounded border border-red-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">delete_sweep</span>
              </button>
          </div>
        </div>

        {uploading && (
            <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Processando arquivo...</span>
                    <span>{progress}%</span>
                </div>
                <div className="w-full bg-[#0d141c] rounded-full h-3 border border-slate-700 overflow-hidden">
                    <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-center text-xs text-slate-500 mt-2 animate-pulse">Não feche a página enquanto a importação estiver rodando.</p>
            </div>
        )}
      </div>

      {/* --- LISTAGEM --- */}
      <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-[#192633] p-4 rounded-xl border border-white/10">
             <div className="flex items-center gap-2 w-full max-w-md">
                <span className="material-symbols-outlined text-slate-400">filter_list</span>
                <input 
                    placeholder="Filtrar por Provedor..." 
                    className="bg-transparent text-white w-full outline-none placeholder:text-slate-500"
                    value={filterProvider}
                    onChange={(e) => {
                        setFilterProvider(e.target.value);
                        setCurrentPage(1); 
                    }}
                />
             </div>
             <div className="text-slate-400 text-sm">
                Total: <strong>{totalCount}</strong> áreas
             </div>
          </div>

          <div className="bg-[#192633] rounded-xl border border-white/10 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400 min-w-[600px]">
                <thead className="bg-[#0d141c] text-white uppercase">
                    <tr>
                    <th className="p-4">Provedor</th>
                    <th className="p-4">UF</th>
                    <th className="p-4">Nome da Área</th>
                    <th className="p-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loadingList ? (
                        <tr><td colSpan={4} className="p-8 text-center text-white">Carregando...</td></tr>
                    ) : areas.map(area => (
                    <tr key={area.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0096C7]"></span>
                            {area.provider_name}
                        </td>
                        <td className="p-4 font-medium text-white">{area.uf || '-'}</td>
                        <td className="p-4">{area.area_name}</td>
                        <td className="p-4 text-right">
                        <button onClick={() => handleDelete(area.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 px-3 py-1 rounded transition-colors hover:bg-red-400/20">Excluir</button>
                        </td>
                    </tr>
                    ))}
                    
                    {!loadingList && areas.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhuma área encontrada.</td></tr>
                    )}
                </tbody>
                </table>
            </div>

            {totalCount > 0 && (
                <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#0d141c]">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                        Anterior
                    </button>
                    <span className="text-sm text-slate-400">
                        Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
                    </span>
                    <button 
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Próxima
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default AdminAreas;