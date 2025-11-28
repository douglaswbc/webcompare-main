import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify'; // <--- Importar
import JSZip from 'jszip';
import * as toGeoJSON from '@mapbox/togeojson';

const AdminAreas: React.FC = () => {
  const [providerName, setProviderName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    const { data } = await supabase.from('coverage_areas').select('id, provider_name, area_name');
    if (data) setAreas(data);
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Tem certeza?')) return;
    const { error } = await supabase.from('coverage_areas').delete().eq('id', id);
    if(error) toast.error('Erro ao excluir área.');
    else {
        toast.success('Área excluída com sucesso.');
        fetchAreas();
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !providerName) {
      toast.warn('Selecione um arquivo e digite o nome do provedor.'); // <--- Toast
      return;
    }

    setUploading(true);

    try {
      let kmlText = '';

      if (file.name.endsWith('.kmz')) {
        const zip = await JSZip.loadAsync(file);
        const kmlFile = Object.values(zip.files).find(f => f.name.endsWith('.kml'));
        if (!kmlFile) throw new Error('Arquivo KML não encontrado dentro do KMZ');
        kmlText = await kmlFile.async('string');
      } else {
        kmlText = await file.text();
      }

      const parser = new DOMParser();
      const kmlDom = parser.parseFromString(kmlText, 'text/xml');
      const geoJson = toGeoJSON.kml(kmlDom);

      let insertCount = 0;
      if (geoJson.type === 'FeatureCollection') {
        for (const feature of geoJson.features) {
          if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
            const { error } = await supabase.from('coverage_areas').insert({
              provider_name: providerName,
              area_name: areaName || file.name,
              geom: feature.geometry
            });
            if (error) console.error('Erro ao inserir feature:', error);
            else insertCount++;
          }
        }
      }

      if (insertCount > 0) {
        toast.success(`Sucesso! ${insertCount} áreas importadas.`); // <--- Toast
        fetchAreas();
        setAreaName('');
      } else {
        toast.warn('Nenhum polígono válido encontrado no arquivo.');
      }
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar arquivo. Verifique se é um KML/KMZ válido.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Gerenciar Mapas de Cobertura</h2>

      <div className="bg-[#192633] p-6 rounded-xl border border-white/10 mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Importar KMZ / KML</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input 
            placeholder="Nome do Provedor (ex: Vero)" 
            className="bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-primary outline-none"
            value={providerName}
            onChange={e => setProviderName(e.target.value)}
          />
          <input 
            placeholder="Nome da Área (Opcional)" 
            className="bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-primary outline-none"
            value={areaName}
            onChange={e => setAreaName(e.target.value)}
          />
          <input 
            type="file" 
            accept=".kml,.kmz"
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
          />
        </div>
        
        {uploading && <p className="text-yellow-400 animate-pulse">Processando mapa... isso pode levar alguns segundos.</p>}
        <p className="text-xs text-slate-400">Suporta arquivos .kml e .kmz. O sistema extrairá automaticamente as geometrias para busca via GPS.</p>
      </div>

      <div className="bg-[#192633] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-[#0d141c] text-white uppercase">
            <tr>
              <th className="p-4">Provedor</th>
              <th className="p-4">Nome da Área</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {areas.map(area => (
              <tr key={area.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium text-white">{area.provider_name}</td>
                <td className="p-4">{area.area_name}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(area.id)} className="text-red-400 hover:text-red-300 transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
            {areas.length === 0 && <tr><td colSpan={3} className="p-4 text-center">Nenhuma área cadastrada.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAreas;