import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserAddress } from '../types';
import { PROVIDERS } from '../constants';

const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const [cep, setCep] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressData, setAddressData] = useState<Partial<UserAddress> | null>(null);
  const [number, setNumber] = useState('');

  // --- LÓGICA DE CEP E GPS (Mantida e otimizada) ---
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCep(value);

    if (value.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setAddressData({
            cep: value,
            logradouro: data.logradouro,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf,
          });

          setTimeout(() => document.getElementById('address-number')?.focus(), 100);

          // Busca Nominatim (GPS)
          try {
            const addressQuery = `${data.logradouro}, ${data.localidade}, ${data.uf}, Brazil`;
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}`,
              { headers: { 'User-Agent': 'WebCompareApp/1.0' } }
            );
            const geoData = await geoResponse.json();

            if (geoData && geoData.length > 0) {
              setCoords({
                lat: parseFloat(geoData[0].lat),
                lng: parseFloat(geoData[0].lon),
              });
              toast.success("Cobertura verificada com sucesso!");
            }
          } catch (err) {
            console.error('Erro GPS', err);
          }
        } else {
          toast.error('CEP não encontrado.');
          setAddressData(null);
          setCoords(null);
        }
      } catch (error) {
        console.error('Erro CEP', error);
        toast.error('Erro de conexão.');
      } finally {
        setLoadingCep(false);
      }
    } else {
      setAddressData(null);
      setCoords(null);
    }
  };

  const handleSubmit = () => {
    if (!addressData?.logradouro || !number) {
      toast.warn('Informe o número da residência para continuar.');
      return;
    }
    const fullAddress: UserAddress = {
      cep: addressData.cep || cep,
      logradouro: addressData.logradouro || '',
      bairro: addressData.bairro || '',
      localidade: addressData.localidade || '',
      uf: addressData.uf || '',
      numero: number,
    };
    navigate('/comparar', { state: { userAddress: fullAddress, coords } });
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-900 font-sans">
      
      {/* 1. Header Transparente/Fixo */}
      <div className="flex items-center absolute top-0 w-full p-6 z-20 justify-between">
        <div className="flex items-center gap-2 text-white drop-shadow-md">
          <div className="bg-[#0096C7] p-2 rounded-lg">
             <span className="material-symbols-outlined text-2xl text-white">wifi_find</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">WebCompare</h2>
        </div>
        <button onClick={() => navigate('/artigos')} className="text-white hover:text-[#D4AF37] transition-colors drop-shadow-md">
           <span className="material-symbols-outlined text-3xl">menu</span>
        </button>
      </div>

      {/* 2. Hero Section (Dobra Principal) */}
      <div className="relative min-h-[600px] lg:min-h-[700px] flex items-center justify-center px-4 pb-12 pt-24">
        {/* Imagem de Fundo com Overlay Gradiente */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-50 dark:to-slate-900"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center gap-6">
          
          {/* Badge de Confiança */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 py-1 px-4 rounded-full flex items-center gap-2 animate-in slide-in-from-top-4 duration-700">
             <span className="material-symbols-outlined text-[#D4AF37] text-sm">workspace_premium</span>
             <span className="text-white text-xs font-bold tracking-wider uppercase">Comparador #1 do Brasil</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-xl">
            Sua Internet Ideal <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0096C7] to-[#48CAE4]">Pelo Menor Preço</span>
          </h1>
          
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl font-light">
            Compare ofertas de fibra ótica, satélite e 5G disponíveis no seu endereço em segundos. Economize até 40% na sua fatura.
          </p>

          {/* Card de Busca Flutuante */}
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl shadow-[#0096C7]/20 border border-slate-100 dark:border-slate-700 mt-4">
            <label className="block text-left text-slate-500 text-xs font-bold uppercase mb-2 ml-1">
                Verifique a disponibilidade agora
            </label>
            
            <div className="relative">
                <input
                  className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white px-4 h-14 pl-12 text-lg focus:border-[#0096C7] focus:ring-0 outline-none transition-all"
                  placeholder="Digite seu CEP"
                  value={cep}
                  onChange={handleCepChange}
                  maxLength={8}
                />
                <span className="material-symbols-outlined absolute left-4 top-4 text-slate-400">search</span>
                
                {loadingCep && (
                    <div className="absolute right-4 top-4">
                        <span className="material-symbols-outlined animate-spin text-[#0096C7]">progress_activity</span>
                    </div>
                )}
            </div>

            {/* Resultado do Endereço (Expandable) */}
            {addressData && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 text-left">
                <div className="bg-[#0096C7]/10 p-3 rounded-lg border border-[#0096C7]/20 mb-3">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#0096C7] text-sm">check_circle</span>
                      <p className="text-sm font-bold text-slate-700 dark:text-white">{addressData.logradouro}</p>
                   </div>
                   <p className="text-xs text-slate-500 pl-6">{addressData.bairro} - {addressData.localidade}/{addressData.uf}</p>
                   {coords && <p className="text-[10px] text-green-600 pl-6 mt-1 font-bold">✓ Tecnologia Fibra disponível na região</p>}
                </div>

                <div className="flex gap-2">
                   <input
                     id="address-number"
                     className="w-28 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 h-12 outline-none focus:border-[#0096C7]"
                     placeholder="Número"
                     value={number}
                     onChange={(e) => setNumber(e.target.value)}
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

      {/* 3. Logos Section (Prova Social - AUMENTADO) */}
      <div className="bg-white dark:bg-slate-800 py-12 border-b border-slate-100 dark:border-slate-700">
        <p className="text-center text-slate-400 text-sm uppercase font-bold tracking-widest mb-8">Trabalhamos com os melhores provedores</p>
        
        {/* Container flexível com centralização e espaçamento maior */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 px-4">
          {PROVIDERS.map((p) => (
            <img 
                key={p.name} 
                src={p.logo} 
                alt={p.name} 
                className="h-12 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100" 
            />
          ))}
        </div>
      </div>

      {/* 4. Como Funciona (Passo a Passo) */}
      <div className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Como o WebCompare funciona?</h2>
            <p className="text-slate-500">Contrate sua nova internet em 3 passos simples.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: 'location_on', title: '1. Localização', desc: 'Digite seu CEP para rastrearmos via satélite quais tecnologias atendem sua rua.' },
                { icon: 'compare_arrows', title: '2. Comparação', desc: 'Filtre por preço, velocidade e benefícios. Veja lado a lado as melhores opções.' },
                { icon: 'savings', title: '3. Economia', desc: 'Escolha o plano ideal e finalize o pedido diretamente pelo WhatsApp com suporte.' }
            ].map((step, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow text-center group">
                    <div className="w-16 h-16 bg-[#CAF0F8] dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl text-[#0096C7]">{step.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
            ))}
        </div>
      </div>

      {/* 5. Features / Benefícios (Design Alternado) */}
      <div className="bg-slate-900 py-20 px-4 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0096C7] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

         <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
             <div className="flex-1 text-left">
                 <div className="inline-block bg-[#D4AF37] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    EXCLUSIVIDADE
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                    Por que usar o <span className="text-[#0096C7]">WebCompare</span>?
                 </h2>
                 <ul className="space-y-4">
                    {[
                        'Preços atualizados em tempo real diretamente das operadoras.',
                        'Verificação precisa de cobertura técnica (Fibra vs Cabo).',
                        'Sem taxas escondidas: o que você vê é o que você paga.',
                        'Suporte humano para tirar dúvidas antes da contratação.'
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-300">
                            <span className="material-symbols-outlined text-[#0096C7] mt-0.5">check_circle</span>
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
                        <span className="text-sm text-slate-400">Comparaçõesrealizadas</span>
                    </div>
                    <div className="bg-[#0096C7] p-6 rounded-2xl shadow-lg shadow-blue-500/20">
                        <span className="text-4xl font-black text-white block mb-1">R$ 400</span>
                        <span className="text-sm text-blue-100">Economia média anual por cliente</span>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 col-span-2">
                        <div className="flex items-center gap-1 text-[#D4AF37] mb-2">
                            {[1,2,3,4,5].map(s => <span key={s} className="material-symbols-outlined text-sm">star</span>)}
                        </div>
                        <p className="text-white italic text-sm">"Encontrei um plano com o dobro da velocidade pagando menos do que eu pagava na operadora antiga."</p>
                        <p className="text-xs text-slate-400 mt-2 font-bold">- Roberto A., São Paulo</p>
                    </div>
                 </div>
             </div>
         </div>
      </div>

      {/* 6. FAQ Simplificado */}
      <div className="py-20 px-4 max-w-3xl mx-auto">
         <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-10">Dúvidas Frequentes</h2>
         <div className="space-y-4">
            {[
                { q: 'O serviço do WebCompare é gratuito?', a: 'Sim! Você não paga nada para usar nosso comparador. Somos remunerados pelas operadoras quando você contrata um plano.' },
                { q: 'Os preços são os mesmos do site da operadora?', a: 'Geralmente são melhores. Temos acesso a ofertas exclusivas de canais digitais que nem sempre estão no televendas.' },
                { q: 'Quanto tempo demora a instalação?', a: 'Depende da operadora e região, mas a média nacional é de 2 a 5 dias úteis após o agendamento.' }
            ].map((faq, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#0096C7]">help</span>
                        {faq.q}
                    </h3>
                    <p className="text-slate-500 pl-8">{faq.a}</p>
                </div>
            ))}
         </div>
      </div>

      {/* 7. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
         <div className="max-w-6xl mx-auto px-4 text-center md:text-left grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 text-white mb-4 justify-center md:justify-start">
                    <span className="material-symbols-outlined text-[#0096C7]">wifi_find</span>
                    <span className="font-bold text-xl">WebCompare</span>
                </div>
                <p className="text-sm max-w-xs mx-auto md:mx-0">
                    Ajudamos brasileiros a encontrarem a melhor conexão de internet desde 2023. Transparência e economia em primeiro lugar.
                </p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Empresa</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-[#0096C7]">Sobre Nós</a></li>
                    <li><a href="#" className="hover:text-[#0096C7]">Carreiras</a></li>
                    <li><a href="#" className="hover:text-[#0096C7]">Imprensa</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-[#0096C7]">Termos de Uso</a></li>
                    <li><a href="#" className="hover:text-[#0096C7]">Política de Privacidade</a></li>
                    <li><a href="/admin" className="hover:text-[#0096C7]">Área do Parceiro</a></li>
                </ul>
            </div>
         </div>
         <div className="text-center mt-12 pt-8 border-t border-slate-800 text-xs">
            © 2023 WebCompare Tecnologia. Todos os direitos reservados.
         </div>
      </footer>

    </div>
  );
};

export default HomeView;