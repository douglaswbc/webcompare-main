import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import * as toGeoJSON from '@mapbox/togeojson';

const AdminAreas: React.FC = () => {
  // Estados de Upload
  const [providerName, setProviderName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Estados de Lista e Paginação
  const [areas, setAreas] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterProvider, setFilterProvider] = useState(''); // Filtro para separar provedores

  const ITEMS_PER_PAGE = 10;

  // Recarrega sempre que mudar a página ou o filtro
  useEffect(() => { 
    fetchAreas(); 
  }, [currentPage, filterProvider]);

  const fetchAreas = async () => {
    setLoadingList(true);
    try {
        let query = supabase
            .from('coverage_areas')
            .select('id, provider_name, area_name', { count: 'exact' });

        // Aplica o filtro se houver algo digitado
        if (filterProvider) {
            query = query.ilike('provider_name', `%${filterProvider}%`);
        }

        // Calcula o intervalo da paginação (Range)
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, count, error } = await query
            .order('provider_name', { ascending: true }) // Agrupa por provedor visualmente
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
        fetchAreas(); // Atualiza a lista
    }
  }

  // --- FUNÇÃO PARA REMOVER A DIMENSÃO Z (ALTITUDE) ---
  const removeZDimension = (coords: any[]): any[] => {
    return coords.map((point: any) => {
        if (Array.isArray(point[0])) return removeZDimension(point);
        return [point[0], point[1]];
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !providerName) {
      toast.warn('Preencha o provedor e selecione o arquivo.');
      return;
    }

    setUploading(true);

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

      if (geoJson.type === 'FeatureCollection') {
        for (const feature of geoJson.features) {
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
                  area_name: areaName || feature.properties?.name || file.name,
                  geom: finalGeometry 
                });

                if (error) { console.error('Erro Supabase:', error); errors++; } 
                else { count++; }
            }
          }
        }
      }

      if (count > 0) { 
          toast.success(`${count} áreas importadas com sucesso!`); 
          fetchAreas(); 
          setAreaName(''); 
          // Se quiser limpar o provedor também: setProviderName('');
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
      e.target.value = '';
    }
  };

  // Cálculos de Paginação
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input 
            placeholder="Provedor (ex: Vero)" 
            className="bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-[#0096C7] outline-none"
            value={providerName}
            onChange={e => setProviderName(e.target.value)}
          />
          <input 
            placeholder="Nome da Área (Opcional)" 
            className="bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-[#0096C7] outline-none"
            value={areaName}
            onChange={e => setAreaName(e.target.value)}
          />
          <label className={`flex items-center justify-center gap-2 bg-[#0096C7] hover:bg-[#0077B6] text-white p-3 rounded cursor-pointer transition-colors font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <span className="material-symbols-outlined">folder_open</span>
             {uploading ? 'Importando...' : 'Escolher KML/KMZ'}
             <input type="file" accept=".kml,.kmz" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      {/* --- FILTROS E LISTAGEM --- */}
      <div className="flex flex-col gap-4">
          
          {/* Barra de Filtro */}
          <div className="flex items-center justify-between bg-[#192633] p-4 rounded-xl border border-white/10">
             <div className="flex items-center gap-2 w-full max-w-md">
                <span className="material-symbols-outlined text-slate-400">filter_list</span>
                <input 
                    placeholder="Filtrar por Provedor..." 
                    className="bg-transparent text-white w-full outline-none placeholder:text-slate-500"
                    value={filterProvider}
                    onChange={(e) => {
                        setFilterProvider(e.target.value);
                        setCurrentPage(1); // Volta para a página 1 ao filtrar
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
                    <th className="p-4">Nome da Área</th>
                    <th className="p-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loadingList ? (
                        <tr><td colSpan={3} className="p-8 text-center text-white">Carregando...</td></tr>
                    ) : areas.map(area => (
                    <tr key={area.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0096C7]"></span>
                            {area.provider_name}
                        </td>
                        <td className="p-4">{area.area_name}</td>
                        <td className="p-4 text-right">
                        <button onClick={() => handleDelete(area.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 px-3 py-1 rounded transition-colors hover:bg-red-400/20">Excluir</button>
                        </td>
                    </tr>
                    ))}
                    
                    {!loadingList && areas.length === 0 && (
                        <tr><td colSpan={3} className="p-8 text-center text-slate-500">Nenhuma área encontrada.</td></tr>
                    )}
                </tbody>
                </table>
            </div>

            {/* --- PAGINAÇÃO --- */}
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