import React from 'react';
import { useAddressSearch } from '../../hooks/useAddressSearch';

const HeroSection: React.FC = () => {
    const {
        cep,
        loadingCep,
        addressData,
        setAddressData,
        manualInput,
        handleCepChange,
        handleManualBlur,
        handleSubmit
    } = useAddressSearch();

    return (
        <div className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center px-4 pb-12 pt-24 overflow-hidden">

            {/* Background Image com Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-background-dark/90 via-background-dark/70 to-background-light dark:to-background-dark"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in duration-700">

                {/* Badge no topo - Laranja para destaque */}
                <div className="bg-white/10 backdrop-blur-md border border-white/10 py-1.5 px-4 rounded-full flex items-center gap-2 shadow-lg shadow-black/20">
                    <span className="material-symbols-outlined text-accent text-sm">workspace_premium</span>
                    <span className="text-white text-xs font-bold tracking-wider uppercase">Comparador #1 do Brasil</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-xl">
                    Sua Internet Ideal <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-white">Pelo Menor Preço</span>
                </h1>

                <p className="text-white/80 text-lg md:text-xl max-w-2xl font-light">
                    Compare ofertas de fibra ótica, satélite e 5G disponíveis no seu endereço em segundos. Economize até 40% na sua fatura.
                </p>

                {/* Card de Busca Estilo "Glass" */}
                <div className="w-full max-w-lg bg-white/95 dark:bg-background-paper-dark/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl shadow-glow/20 border border-white/20 dark:border-white/10 mt-6 text-left transition-all duration-300">
                    <label className="block text-text-main dark:text-text-muted text-xs font-bold uppercase mb-2 ml-1 tracking-wider">
                        Verifique a disponibilidade agora
                    </label>

                    {/* GRUPO 1: CEP e NÚMERO Lado a Lado */}
                    <div className="flex gap-3 mb-3">
                        {/* Input CEP */}
                        <div className="relative flex-1">
                            <input
                                className={`w-full rounded-xl border-2 border-transparent bg-background-light dark:bg-background-dark text-text-dark dark:text-text-inverted px-4 h-14 pl-12 text-lg focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-text-muted/60 ${addressData ? 'rounded-r-xl' : ''}`}
                                placeholder="Digite seu CEP"
                                value={cep}
                                onChange={handleCepChange}
                                maxLength={8}
                            />
                            <span className="material-symbols-outlined absolute left-4 top-4 text-text-muted">search</span>
                            {loadingCep && (
                                <div className="absolute right-4 top-4"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>
                            )}
                        </div>

                        {/* Input Número (Aparece ao detectar endereço) */}
                        {addressData && (
                            <div className="w-32 animate-in slide-in-from-left-4 fade-in duration-500">
                                <input
                                    id="address-number"
                                    className="w-full h-14 rounded-xl border-2 border-transparent bg-background-light dark:bg-background-dark text-text-dark dark:text-text-inverted px-4 text-center text-lg outline-none focus:border-primary placeholder:text-text-muted/60"
                                    placeholder="Nº"
                                    value={addressData.numero || ''}
                                    onChange={(e) => setAddressData({ ...addressData, numero: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    {/* GRUPO 2: Campos de Endereço (Apenas se precisar editar) */}
                    {addressData && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                            {manualInput || !addressData.logradouro ? (
                                <div className="p-3 bg-background-light dark:bg-background-dark rounded-xl border border-white/5 mb-3">
                                    <input
                                        placeholder="Rua / Logradouro"
                                        className="w-full p-2 mb-2 rounded bg-transparent border-b border-white/10 outline-none text-sm text-text-dark dark:text-text-inverted placeholder:text-text-muted"
                                        value={addressData.logradouro}
                                        onChange={e => setAddressData({ ...addressData, logradouro: e.target.value })}
                                        onBlur={handleManualBlur}
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="Bairro"
                                            className="flex-1 p-2 rounded bg-transparent border-b border-white/10 outline-none text-sm text-text-dark dark:text-text-inverted placeholder:text-text-muted"
                                            value={addressData.bairro}
                                            onChange={e => setAddressData({ ...addressData, bairro: e.target.value })}
                                        />
                                        <input
                                            placeholder="Cidade"
                                            className="flex-1 p-2 rounded bg-transparent border-b border-white/10 outline-none text-sm text-text-dark dark:text-text-inverted placeholder:text-text-muted"
                                            value={addressData.localidade}
                                            onChange={e => setAddressData({ ...addressData, localidade: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-accent pl-1 mt-2 font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">warning</span>
                                        GPS pendente (Provedores de mapa podem não aparecer)
                                    </p>
                                </div>
                            ) : (
                                // Mostra endereço resumido se já achou automático
                                <p className="text-xs text-text-muted ml-1 mb-4 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-success">check_circle</span>
                                    {addressData.logradouro}, {addressData.bairro} - {addressData.localidade}/{addressData.uf}
                                </p>
                            )}

                            {/* GRUPO 3: Botão de Ação (Abaixo de tudo) */}
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-accent hover:bg-accent-hover text-white font-bold rounded-xl h-14 shadow-lg shadow-orange hover:shadow-orange/50 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-white/10 text-lg"
                            >
                                Ver Planos Disponíveis
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-white/60 text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Seus dados estão seguros e não serão compartilhados.
                </p>
            </div>
        </div>
    );
};

export default HeroSection;