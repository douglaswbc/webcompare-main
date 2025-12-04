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
        <div className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center px-4 pb-12 pt-24">

            {/* Background */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/90 via-primary/70 to-primary-light/40"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center gap-6">

                {/* Badge topo */}
                <div className="bg-text-inverted/10 backdrop-blur-md border border-text-inverted/10 py-1.5 px-4 rounded-full flex items-center gap-2 shadow-lg shadow-black/20 animate-in slide-in-from-top-4 duration-700">
                    <span className="material-symbols-outlined text-gold text-sm">workspace_premium</span>
                    <span className="text-text-inverted text-xs font-bold tracking-wider uppercase">
                        Comparador #1 do Brasil
                    </span>
                </div>

                {/* Título */}
                <h1 className="text-4xl md:text-6xl font-black text-text-inverted leading-tight drop-shadow-xl">
                    Sua Internet Ideal <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-primary">
                        Pelo Menor Preço
                    </span>
                </h1>

                <p className="text-text-inverted/80 text-lg md:text-xl max-w-2xl font-light">
                    Compare ofertas de fibra ótica, satélite e 5G disponíveis no seu endereço em segundos.
                    Economize até 40% na sua fatura.
                </p>

                {/* Card de busca */}
                <div className="w-full max-w-lg bg-background-paper shadow-xl p-6 rounded-2xl border border-text-inverted/40 mt-6 text-left transition-all">

                    <label className="block text-text-dark text-xs font-bold uppercase mb-2 ml-1 tracking-wider">
                        Verifique a disponibilidade agora
                    </label>

                    <div className="relative mb-4">
                        <input
                            className="w-full rounded-xl border border-text-muted/20 bg-background-paper text-text-dark px-4 h-14 pl-12 text-lg
                                       focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-text-muted"
                            placeholder="Digite seu CEP"
                            value={cep}
                            onChange={handleCepChange}
                            maxLength={8}
                        />

                        <span className="material-symbols-outlined absolute left-4 top-4 text-text-muted">
                            search
                        </span>

                        {loadingCep && (
                            <div className="absolute right-4 top-4">
                                <span className="material-symbols-outlined animate-spin text-primary">
                                    progress_activity
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Campos pós busca */}
                    {addressData && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3">

                            {manualInput || !addressData.logradouro ? (
                                <>
                                    <input
                                        placeholder="Rua / Logradouro"
                                        className="w-full p-3 rounded-lg border bg-background-paper focus:border-primary outline-none 
                                                   text-sm text-text-dark placeholder:text-text-muted"
                                        value={addressData.logradouro}
                                        onChange={e => setAddressData({ ...addressData, logradouro: e.target.value })}
                                        onBlur={handleManualBlur}
                                    />

                                    <div className="flex gap-2">
                                        <input
                                            placeholder="Bairro"
                                            className="flex-1 p-3 rounded-lg border bg-background-paper focus:border-primary outline-none 
                                                       text-sm text-text-dark placeholder:text-text-muted"
                                            value={addressData.bairro}
                                            onChange={e => setAddressData({ ...addressData, bairro: e.target.value })}
                                        />

                                        <input
                                            placeholder="Cidade"
                                            className="flex-1 p-3 rounded-lg border bg-background-paper focus:border-primary outline-none 
                                                       text-sm text-text-dark placeholder:text-text-muted"
                                            value={addressData.localidade}
                                            onChange={e => setAddressData({ ...addressData, localidade: e.target.value })}
                                        />
                                    </div>

                                    <p className="text-[10px] text-accent pl-1 mt-0.5 font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">warning</span>
                                        GPS pendente (Provedores de mapa podem não aparecer)
                                    </p>
                                </>
                            ) : null}

                            <div className="flex gap-3 mt-2">
                                <input
                                    id="address-number"
                                    className="w-28 rounded-xl border bg-background-paper text-text-dark px-4 h-12 outline-none 
                                               focus:border-primary placeholder:text-text-muted"
                                    placeholder="Número"
                                    value={addressData.numero || ''}
                                    onChange={(e) => {
                                        setAddressData({ ...addressData, numero: e.target.value });
                                    }}
                                />

                                {/* 🔥 BOTÃO COM DESTAQUE REAL */}
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-accent text-white font-bold rounded-xl h-12 
                                               border border-accent-light 
                                               shadow-orange hover:shadow-glow 
                                               hover:bg-accent-hover transition-all 
                                               hover:scale-[1.03] active:scale-95 
                                               flex items-center justify-center gap-2"
                                >
                                    Ver Planos
                                    <span className="material-symbols-outlined text-text-inverted">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-text-inverted/60 text-xs mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Seus dados estão seguros e não serão compartilhados.
                </p>
            </div>
        </div>
    );
};

export default HeroSection;
