import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';
import { UserAddress, Provider } from '../types';

const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const [cep, setCep] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Estado do Formulário
  const [addressData, setAddressData] = useState<Partial<UserAddress> | null>(null);
  const [manualInput, setManualInput] = useState(false); // Novo: Permite edição manual
  
  // Logos
  const [providersList, setProvidersList] = useState<Provider[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data } = await supabase.from('providers').select('*').eq('active', true);
      if (data) setProvidersList(data as any);
    };
    fetchProviders();
  }, []);

  // --- FUNÇÃO AUXILIAR: BUSCAR GPS (Nominatim) ---
  const fetchCoordinates = async (logradouro: string, cidade: string, uf: string) => {
    try {
        const query = `${logradouro}, ${cidade}, ${uf}, Brazil`;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
            { headers: { 'User-Agent': 'WebCompareApp/1.0' } }
        );
        const data = await response.json();
        if (data && data.length > 0) {
            setCoords({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            });
            return true;
        }
    } catch (err) {
        console.error('Erro GPS:', err);
    }
    return false;
  };

  // --- LÓGICA DO CEP ---
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCep(value);

    if (value.length === 8) {
      setLoadingCep(true);
      setManualInput(false); // Reseta modo manual
      setCoords(null);

      try {
        // TENTATIVA 1: ViaCEP
        let response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        let data = await response.json();

        // TENTATIVA 2: BrasilAPI (Se ViaCEP falhar)
        if (data.erro) {
            console.warn('ViaCEP falhou, tentando BrasilAPI...');
            try {
                response = await fetch(`https://brasilapi.com.br/api/cep/v2/${value}`);
                if (response.ok) {
                    const dataBrasil = await response.json();
                    data = {
                        erro: false,
                        logradouro: dataBrasil.street,
                        bairro: dataBrasil.neighborhood,
                        localidade: dataBrasil.city,
                        uf: dataBrasil.state,
                        // BrasilAPI v2 às vezes já traz coordenadas!
                        location: dataBrasil.location 
                    };
                    
                    if (dataBrasil.location?.coordinates) {
                        setCoords({
                            lat: dataBrasil.location.coordinates.latitude,
                            lng: dataBrasil.location.coordinates.longitude
                        });
                    }
                }
            } catch (err) {
                console.error('BrasilAPI falhou também');
            }
        }

        if (!data.erro) {
          // SUCESSO AUTOMÁTICO
          setAddressData({
            cep: value,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            localidade: data.localidade || '',
            uf: data.uf || '',
            numero: ''
          });

          // Se BrasilAPI não trouxe GPS, buscamos no Nominatim
          if (!coords && data.logradouro && data.localidade) {
             const found = await fetchCoordinates(data.logradouro, data.localidade, data.uf);
             if (found) toast.success("Localização GPS identificada!");
          }
          
          setTimeout(() => document.getElementById('address-number')?.focus(), 100);

        } else {
          // FALHA TOTAL (CEP Novo ou Inexistente)
          toast.info('Endereço não encontrado automaticamente. Por favor, preencha os dados.');
          setManualInput(true); // Ativa campos manuais
          setAddressData({
              cep: value,
              logradouro: '',
              bairro: '',
              localidade: '',
              uf: '',
              numero: ''
          });
        }

      } catch (error) {
        toast.error('Erro de conexão. Verifique sua internet.');
      } finally {
        setLoadingCep(false);
      }
    } else {
      setAddressData(null);
    }
  };

  // --- QUANDO USUÁRIO PREENCHE MANUALMENTE ---
  const handleManualBlur = async () => {
      // Tenta buscar GPS de novo se o usuário preencheu rua e cidade manualmente
      if (addressData?.logradouro && addressData?.localidade && !coords) {
          await fetchCoordinates(addressData.logradouro, addressData.localidade, addressData.uf || '');
      }
  }

  const handleSubmit = () => {
    if (!addressData?.logradouro || !addressData.numero) {
      toast.warn('Preencha o endereço completo para verificarmos a cobertura.');
      return;
    }
    
    // Se não tivermos coords ainda (ex: preencheu manual e não saiu do campo), tenta uma última vez
    if (!coords && addressData.localidade) {
        // Envia mesmo sem coords, mas a busca por mapa falhará. 
        // A busca por Tabela (Claro) funcionará.
    }

    const fullAddress: UserAddress = {
      cep: cep,
      logradouro: addressData.logradouro,
      bairro: addressData.bairro || '',
      localidade: addressData.localidade || '',
      uf: addressData.uf || '',
      numero: addressData.numero,
    };

    navigate('/comparar', { state: { userAddress: fullAddress, coords } });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-900 font-sans">
      
      {/* Header */}
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

      {/* Hero Section */}
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
            Sua Internet Ideal <br/>
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
                            onChange={e => setAddressData({...addressData, logradouro: e.target.value})}
                            onBlur={handleManualBlur}
                        />
                        <div className="flex gap-2">
                            <input 
                                placeholder="Bairro"
                                className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-[#0096C7] outline-none text-sm"
                                value={addressData.bairro}
                                onChange={e => setAddressData({...addressData, bairro: e.target.value})}
                            />
                            <input 
                                placeholder="Cidade"
                                className="flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-[#0096C7] outline-none text-sm"
                                value={addressData.localidade}
                                onChange={e => setAddressData({...addressData, localidade: e.target.value})}
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
                         setNumber(e.target.value);
                         setAddressData({...addressData, numero: e.target.value});
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

      {/* Logos Section */}
      <div className="bg-white dark:bg-slate-800 py-12 border-b border-slate-100 dark:border-slate-700">
        <p className="text-center text-slate-400 text-sm uppercase font-bold tracking-widest mb-8">Trabalhamos com os melhores provedores</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 px-4">
          {providersList.length > 0 ? (
             providersList.map((p) => (
               <img 
                   key={p.id} 
                   src={p.logo_url}
                   alt={p.name} 
                   className="h-12 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110 opacity-90 hover:opacity-100" 
               />
             ))
          ) : (
            <p className="text-slate-400">Carregando parceiros...</p>
          )}
        </div>
      </div>

      {/* Como Funciona */}
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

      {/* Footer */}
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
                    <li><Link to="/" className="hover:text-[#0096C7]">Sobre Nós</Link></li>
                    <li><Link to="/" className="hover:text-[#0096C7]">Carreiras</Link></li>
                    <li><Link to="/" className="hover:text-[#0096C7]">Imprensa</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link to="/termos" className="hover:text-[#0096C7]">Termos de Uso</Link></li>
                    <li><Link to="/privacidade" className="hover:text-[#0096C7]">Política de Privacidade</Link></li>
                    <li><Link to="/admin" className="hover:text-[#0096C7]">Área do Parceiro</Link></li>
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