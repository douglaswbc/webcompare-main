import React from 'react';

const FeaturesSection: React.FC = () => {
    return (
        <div className="bg-slate-900 py-20 px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1 text-left">
                    <div className="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                        EXCLUSIVIDADE
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                        Por que usar o <span className="text-primary">WebCompare</span>?
                    </h2>
                    <ul className="space-y-4">
                        {[
                            'Preços atualizados em tempo real diretamente das operadoras.',
                            'Verificação precisa de cobertura técnica (Fibra vs Cabo).',
                            'Sem taxas escondidas: o que você vê é o que você paga.',
                            'Suporte humano para tirar dúvidas antes da contratação.'
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-300">
                                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mt-8 text-white border border-white/30 hover:bg-white/10 px-6 py-3 rounded-xl font-bold transition-all">
                        Comparar Agora
                    </button>
                </div>
                <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 transform translate-y-8">
                            <span className="text-4xl font-black text-white block mb-1">50k+</span>
                            <span className="text-sm text-slate-400">Comparisons realizadas</span>
                        </div>
                        <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20">
                            <span className="text-4xl font-black text-white block mb-1">R$ 400</span>
                            <span className="text-sm text-blue-100">Economia média anual por cliente</span>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 col-span-2">
                            <div className="flex items-center gap-1 text-accent mb-2">
                                {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-outlined text-sm">star</span>)}
                            </div>
                            <p className="text-white italic text-sm">"Encontrei um plano com o dobro da velocidade pagando menos do que eu pagava na operadora antiga."</p>
                            <p className="text-xs text-slate-400 mt-2 font-bold">- Roberto A., São Paulo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesSection;
