import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import * as toGeoJSON from '@mapbox/togeojson';

const AdminAreas: React.FC = () => {
  const [providerName, setProviderName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => { fetchAreas(); }, []);

  const fetchAreas = async () => {
    const { data } = await supabase.from('coverage_areas').select('id, provider_name, area_name');
    if (data) setAreas(data);
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Tem certeza?')) return;
    const { error } = await supabase.from('coverage_areas').delete().eq('id', id);
    if(error) toast.error('Erro ao excluir.');
    else { toast.success('Área excluída.'); fetchAreas(); }
  }

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
      if (geoJson.type === 'FeatureCollection') {
        for (const feature of geoJson.features) {
          if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
            await supabase.from('coverage_areas').insert({
              provider_name: providerName,
              area_name: areaName || file.name,
              geom: feature.geometry
            });
            count++;
          }
        }
      }
      if (count > 0) { toast.success(`${count} áreas importadas!`); fetchAreas(); setAreaName(''); }
      else toast.warn('Nenhum polígono encontrado.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar arquivo.');
    } finally { setUploading(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Mapas de Cobertura</h2>

      <div className="bg-[#192633] p-6 rounded-xl border border-white/10 mb-8 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0096C7]">upload_file</span>
            Importar KMZ / KML
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
          <label className="flex items-center justify-center gap-2 bg-[#0096C7] hover:bg-[#0077B6] text-white p-3 rounded cursor-pointer transition-colors font-medium">
             <span className="material-symbols-outlined">folder_open</span>
             {uploading ? 'Processando...' : 'Escolher Arquivo'}
             <input type="file" accept=".kml,.kmz" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
        <p className="text-xs text-slate-400">Suporta arquivos .kml e .kmz georreferenciados.</p>
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
            <tbody>
                {areas.map(area => (
                <tr key={area.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-bold text-white">{area.provider_name}</td>
                    <td className="p-4">{area.area_name}</td>
                    <td className="p-4 text-right">
                    <button onClick={() => handleDelete(area.id)} className="text-red-400 hover:text-red-300 bg-red-400/10 px-3 py-1 rounded">Excluir</button>
                    </td>
                </tr>
                ))}
                {areas.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-500">Nenhuma área importada.</td></tr>}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAreas;