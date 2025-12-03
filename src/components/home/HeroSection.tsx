import React from 'react';
import { useAddressSearch } from '../../hooks/useAddressSearch';

const HeroSection: React.FC = () => {
    const {
        cep,
        loadingCep,
        coords,
        addressData,
        setAddressData,
        manualInput,
        handleCepChange,
        handleManualBlur,
        handleSubmit
    } = useAddressSearch();

    return (
        <div className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center px-4 pb-12 pt-24">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-50 dark:to-slate-900"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center gap-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 py-1 px-4 rounded-full flex items-center gap-2 animate-in slide-in-from-top-4 duration-700">
                    <span className="material-symbols-outlined text-[#D4AF37] text-sm">workspace_premium</span>
                    <span className="text-white text-xs font-bold tracking-wider uppercase">Comparador #1 do Brasil</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-xl">
                    Sua Internet Ideal <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0096C7] to-[#48CAE4]">Pelo Menor Preço</span>
                </h1>

                <p className="text-slate-200 text-lg md:text-xl max-w-2xl font-light">
                    Compare ofertas de fibra ótica, satélite e 5G disponíveis no seu endereço em segundos. Economize até 40% na sua fatura.
                </p>

                {/* Card de Busca */}
                <div className="w-full max-w-lg bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl shadow-[#0096C7]/20 border border-slate-100 dark:border-slate-700 mt-4 text-left">
                    <label className="block text-slate-500 text-xs font-bold uppercase mb-2 ml-1">
                        Verifique a disponibilidade agora
                    </label>

                    <div className="relative mb-4">
                        <input
                            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white px-4 h-14 pl-12 text-lg focus:border-[#0096C7] focus:ring-0 outline-none transition-all"
                            placeholder="Digite seu CEP"
                            value={cep}
                            onChange={handleCepChange}
                            maxLength={8}
                        />
                        <span className="material-symbols-outlined absolute left-4 top-4 text-slate-400">search</span>
                        {loadingCep && (
                            <div className="absolute right-4 top-4"><span className="material-symbols-outlined animate-spin text-[#0096C7]">progress_activity</span></div>
                        )}
                    </div>

                    {/* Formulário de Endereço (Automático ou Manual) */}
                    {addressData && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3">

                            {/* Se for manual ou incompleto, mostra campos para editar */}
                            {manualInput || !addressData.logradouro ? (
                                <>
                                    <input
                                        placeholder="Rua / Logradouro"
                                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-[#0096C7] outline-none text-sm"
                                        value={addressData.logradouro}
                                        onChange={e => setAddressData({ ...addressData, logradouro: e.target.value })}
                                        onBlur={handleManualBlur}
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="Bairro"
                                            className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-[#0096C7] outline-none text-sm"
                                            value={addressData.bairro}
                                            onChange={e => setAddressData({ ...addressData, bairro: e.target.value })}
                                        />
                                        <input
                                            placeholder="Cidade"
                                            className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-[#0096C7] outline-none text-sm"
                                            value={addressData.localidade}
                                            onChange={e => setAddressData({ ...addressData, localidade: e.target.value })}
                                            onBlur={handleManualBlur}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="bg-[#0096C7]/10 p-3 rounded-lg border border-[#0096C7]/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-[#0096C7] text-sm">check_circle</span>
                                        <p className="text-sm font-bold text-slate-700 dark:text-white truncate">{addressData.logradouro}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 pl-6">{addressData.bairro} - {addressData.localidade}/{addressData.uf}</p>
                                    {coords ? (
                                        <p className="text-[10px] text-green-600 pl-6 mt-1 font-bold">✓ GPS Localizado</p>
                                    ) : (
                                        <p className="text-[10px] text-orange-500 pl-6 mt-1">⚠ GPS pendente (Provedores de mapa podem não aparecer)</p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    id="address-number"
                                    className="w-28 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 h-12 outline-none focus:border-[#0096C7]"
                                    placeholder="Número"
                                    value={addressData.numero || ''}
                                    onChange={(e) => {
                                        setAddressData({ ...addressData, numero: e.target.value });
                                    }}
                                />
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-[#0096C7] hover:bg-[#0077B6] text-white font-bold rounded-xl h-12 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    Ver Planos
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-slate-400 text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Seus dados estão seguros e não serão compartilhados.
                </p>
            </div>
        </div>
    );
};

export default HeroSection;
