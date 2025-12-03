import React from 'react';
import { Provider } from '../../types';

interface ProvidersSectionProps {
    providers: Provider[];
}

const ProvidersSection: React.FC<ProvidersSectionProps> = ({ providers }) => {
    return (
        <div className="bg-white dark:bg-slate-800 py-12 border-b border-slate-100 dark:border-slate-700">
            <p className="text-center text-slate-400 text-sm uppercase font-bold tracking-widest mb-8">Trabalhamos com os melhores provedores</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 px-4">
                {providers.length > 0 ? (
                    providers.map((p) => (
                        p.logo_url ? (
                            <img
                                key={p.id}
                                src={p.logo_url}
                                alt={p.name}
                                className="h-12 md:h-20 w-auto object-contain transition-transform duration-300 hover:scale-110"
                            />
                        ) : null
                    ))
                ) : (
                    <p className="text-slate-400">Carregando parceiros...</p>
                )}
            </div>
        </div>
    );
};

export default ProvidersSection;
