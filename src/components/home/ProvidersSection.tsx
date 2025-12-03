import React from 'react';
import { Provider } from '../../types';

interface ProvidersSectionProps {
    providers: Provider[];
}

const ProvidersSection: React.FC<ProvidersSectionProps> = ({ providers }) => {
    return (
        <div className="bg-background-paper dark:bg-background-paper-dark py-12 border-b border-background-light dark:border-background-dark">
            <p className="text-center text-text-muted text-sm uppercase font-bold tracking-widest mb-8">Trabalhamos com os melhores provedores</p>
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
                    <p className="text-text-muted">Carregando parceiros...</p>
                )}
            </div>
        </div>
    );
};

export default ProvidersSection;
