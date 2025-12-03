import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Provider } from '../types';

// Layout Components
import Header from './layout/Header';
import Footer from './layout/Footer';

// Home Section Components
import HeroSection from './home/HeroSection';
import ProvidersSection from './home/ProvidersSection';
import FeaturesSection from './home/FeaturesSection';
import FAQSection from './home/FAQSection';

const HomeView: React.FC = () => {
  // Logos
  const [providersList, setProvidersList] = useState<Provider[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data } = await supabase.from('providers').select('*').eq('active', true);
      if (data) setProvidersList(data as any);
    };
    fetchProviders();
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-sans">

      <Header />

      <HeroSection />

      <ProvidersSection providers={providersList} />

      <div className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-text-dark dark:text-text-inverted mb-2">Como o WebCompare funciona?</h2>
          <p className="text-text-main">Contrate sua nova internet em 3 passos simples.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'location_on', title: '1. Localização', desc: 'Digite seu CEP para rastrearmos via satélite quais tecnologias atendem sua rua.' },
            { icon: 'compare_arrows', title: '2. Comparação', desc: 'Filtre por preço, velocidade e benefícios. Veja lado a lado as melhores opções.' },
            { icon: 'savings', title: '3. Economia', desc: 'Escolha o plano ideal e finalize o pedido diretamente pelo WhatsApp com suporte.' }
          ].map((step, idx) => (
            <div key={idx} className="bg-background-paper dark:bg-background-paper-dark p-8 rounded-2xl shadow-sm border border-background-light dark:border-background-dark hover:shadow-xl transition-shadow text-center group">
              <div className="w-16 h-16 bg-secondary dark:bg-background-dark rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl text-primary">{step.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-text-dark dark:text-text-inverted mb-3">{step.title}</h3>
              <p className="text-text-main leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <FeaturesSection />

      <FAQSection />

      <Footer />

    </div>
  );
};

export default HomeView;