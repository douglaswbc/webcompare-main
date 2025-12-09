import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import * as toGeoJSON from '@mapbox/togeojson';
import { coverageService } from '../../services/coverageService';

// ... (Mantenha a constante ESTADOS igual) ...
const ESTADOS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const Areas: React.FC = () => {
    // MUDANÇA 1: providerName vira providerId
    const [providerId, setProviderId] = useState('');
    const [areaName, setAreaName] = useState('');
    const [selectedUfs, setSelectedUfs] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const [providers, setProviders] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);

    const [loadingList, setLoadingList] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filterProvider, setFilterProvider] = useState('');

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const loadProviders = async () => {
            const data = await coverageService.getProviderNames();
            setProviders(data);
        };
        loadProviders();
    }, []);

    useEffect(() => {
        fetchAreas();
    }, [currentPage, filterProvider]);

    const fetchAreas = async () => {
        setLoadingList(true);
        try {
            const { data, count } = await coverageService.getAreas({
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
                filterProvider
            });
            setAreas(data);
            setTotalCount(count);
        } catch (error) {
            toast.error('Erro ao carregar lista de áreas.');
        } finally {
            setLoadingList(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await coverageService.deleteArea(id);
            toast.success('Área excluída.');
            fetchAreas();
        } catch (error) {
            toast.error('Erro ao excluir.');
        }
    };

    const handleClearProviderAreas = async () => {
        // MUDANÇA 2: Usar ID na lógica
        if (!providerId) return toast.warn('Selecione um provedor primeiro.');
        
        // Encontra o nome apenas para exibir no confirm
        const pName = providers.find(p => p.id === providerId)?.name;
        
        if (!confirm(`ATENÇÃO: Isso apagará TODAS as áreas de "${pName}". Deseja continuar?`)) return;

        setUploading(true);
        try {
            await coverageService.clearProviderAreas(providerId); // Passa ID
            toast.success(`Todas as áreas de ${pName} foram removidas.`);
            fetchAreas();
        } catch (error: any) {
            toast.error('Erro ao limpar áreas: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    // ... (Mantenha a função removeZDimension e toggleUf iguais) ...
    const removeZDimension = (coords: any[]): any[] => {
        return coords.map((point: any) => {
            if (Array.isArray(point[0])) return removeZDimension(point);
            return [point[0], point[1]];
        });
    };

    const toggleUf = (uf: string) => {
        if (selectedUfs.includes(uf)) {
            setSelectedUfs(selectedUfs.filter(item => item !== uf));
        } else {
            setSelectedUfs([...selectedUfs, uf]);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // MUDANÇA 3: Validação com providerId
        if (!file || !providerId || selectedUfs.length === 0) {
            toast.warn('Selecione Provedor, pelo menos um UF e o Arquivo.');
            return;
        }

        const ufsString = selectedUfs.join(',');
        setUploading(true);
        setProgress(0);

        try {
            // ... (Lógica de ler KML/KMZ permanece igual) ...
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

            // MUDANÇA 4: Checa existentes usando ID
            const existingNames = await coverageService.checkExistingAreas(providerId, ufsString);

            if (geoJson.type === 'FeatureCollection') {
                const totalFeatures = geoJson.features.length;
                let processed = 0;

                for (const feature of geoJson.features) {
                    processed++;
                    setProgress(Math.round((processed / totalFeatures) * 100));

                    const featureName = areaName || feature.properties?.name || file.name;

                    if (existingNames.has(featureName)) {
                        skipped++;
                        continue;
                    }

                    if (feature.geometry) {
                        let finalGeometry: any = feature.geometry;
                        // ... (Normalização da geometria permanece igual) ...
                        if (finalGeometry.type === 'Polygon') {
                            finalGeometry = { type: 'MultiPolygon', coordinates: [finalGeometry.coordinates] };
                        }
                        if (finalGeometry.type === 'MultiPolygon') {
                            finalGeometry.coordinates = removeZDimension(finalGeometry.coordinates);
                        }

                        if (finalGeometry.type === 'MultiPolygon' || finalGeometry.type === 'Polygon') {
                            try {
                                // MUDANÇA 5: Cria usando provider_id
                                await coverageService.createArea({
                                    provider_id: providerId,
                                    area_name: featureName,
                                    uf: ufsString,
                                    geom: finalGeometry
                                });
                                count++;
                                existingNames.add(featureName);
                            } catch (err) {
                                errors++;
                            }
                        }
                    }
                    if (processed % 10 === 0) await new Promise(r => setTimeout(r, 0));
                }
            }

            if (count > 0) {
                toast.success(`${count} áreas importadas!`);
                fetchAreas();
                setAreaName('');
                // setSelectedUfs([]); // Opcional limpar
            } else if (skipped > 0 && count === 0) {
                toast.warn('Todas as áreas já existiam.');
            } else {
                toast.warn('Nenhum polígono válido importado.');
            }

        } catch (error: any) {
            toast.error('Erro ao processar: ' + error.message);
        } finally {
            setUploading(false);
            setProgress(0);
            e.target.value = '';
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Gerenciar Áreas de Cobertura</h1>

            {/* --- FORMULÁRIO --- */}
            <div className="bg-background-paper-dark p-6 rounded-xl border border-white/10 mb-8 max-w-2xl">
                {/* ... (Cabeçalho igual) ... */}
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Provedor</label>
                        {/* MUDANÇA 6: Select value é providerId e options usam p.id */}
                        <select
                            className="w-full bg-slate-900 text-white p-3 rounded border border-slate-700 focus:border-primary outline-none"
                            value={providerId}
                            onChange={(e) => setProviderId(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {providers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* ... (Input areaName igual) ... */}
                    <div>
                        <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Nome da Área (Opcional)</label>
                        <input
                            className="w-full bg-slate-900 text-white p-3 rounded border border-slate-700 focus:border-primary outline-none"
                            placeholder="Ex: Zona Norte, Centro..."
                            value={areaName}
                            onChange={(e) => setAreaName(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 mt-1">Se vazio, usará o nome do polígono no KML.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`transition-opacity ${!providerId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            {/* ... (Input file igual) ... */}
                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Arquivo KML/KMZ</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-900 hover:border-primary transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">cloud_upload</span>
                                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Clique para enviar</span></p>
                                </div>
                                <input type="file" accept=".kml,.kmz" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>

                        <div className="flex items-end">
                            {/* MUDANÇA 7: Botão limpar checa providerId */}
                            <button
                                onClick={handleClearProviderAreas}
                                disabled={!providerId || uploading}
                                title="Apagar todas as áreas deste provedor"
                                className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-400 p-3 rounded border border-red-600/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 h-32"
                            >
                                <span className="material-symbols-outlined">delete_sweep</span>
                                <span className="text-sm font-bold">Limpar Áreas</span>
                            </button>
                        </div>
                    </div>

                    {/* ... (Seletor de Estados igual) ... */}
                    <div className="bg-slate-900 p-4 rounded border border-slate-700">
                        <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Selecione os Estados (UF)</label>
                        <div className="grid grid-cols-5 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {ESTADOS.map(uf => (
                                <button
                                    key={uf}
                                    onClick={() => !uploading && toggleUf(uf)}
                                    className={`text-xs font-bold py-1.5 rounded transition-all ${selectedUfs.includes(uf)
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                        }`}
                                    disabled={uploading}
                                >
                                    {uf}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-right">
                            {selectedUfs.length} selecionados
                        </p>
                    </div>
                </div>

                {/* ... (Barra de progresso igual) ... */}
                {uploading && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>Processando arquivo...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden">
                            <div
                                className="bg-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- LISTAGEM --- */}
            <div className="flex flex-col gap-4">
                {/* ... (Barra de filtro igual) ... */}
                <div className="flex items-center justify-between bg-background-paper-dark p-4 rounded-xl border border-white/10">
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

                <div className="bg-background-paper-dark rounded-xl border border-white/10 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400 min-w-[600px]">
                            <thead className="bg-slate-900 text-white uppercase">
                                <tr>
                                    <th className="p-4">Provedor</th>
                                    <th className="p-4">UFs</th>
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
                                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                                            {/* MUDANÇA 8: Exibe nome via relação (providers.name) */}
                                            {area.providers?.name || 'Provedor Removido'}
                                        </td>
                                        <td className="p-4 font-medium text-white max-w-[150px] truncate" title={area.uf}>
                                            {area.uf ? area.uf.split(',').map((u: string) => (
                                                <span key={u} className="inline-block bg-slate-700 px-1.5 py-0.5 rounded text-[10px] mr-1 mb-1">{u}</span>
                                            )) : '-'}
                                        </td>
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
                    {/* ... (Paginação igual) ... */}
                     {totalCount > 0 && (
                        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-900">
                           {/* ... Botões de paginação ... */}
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

export default Areas;