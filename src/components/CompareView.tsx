import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { Plan, UserAddress } from '../types';

const CompareView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userAddress = location.state?.userAddress as UserAddress | undefined;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      
      // Se não houver endereço, não busca nada
      if (!userAddress) {
        setLoading(false);
        return;
      }

      // Limpa o CEP para enviar apenas números (ex: 01234567)
      const cleanCep = userAddress.cep.replace(/\D/g, '');

      try {
        // --- 1. CHAMADA INTELIGENTE (RPC) ---
        // Essa função SQL (get_available_plans) verifica:
        // A) Se o CEP está na tabela da Claro (serviceable_ceps)
        // B) OU Se o GPS cai dentro do mapa da Vero/Desktop (coverage_areas)
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_available_plans', {
            user_cep: cleanCep,
            user_lat: location.state?.coords?.lat || 0,
            user_long: location.state?.coords?.lng || 0
        });

        if (rpcError) throw rpcError;

        // Se a função não retornar nada, paramos aqui
        const foundPlans = rpcData as any[];
        if (!foundPlans || foundPlans.length === 0) {
            setPlans([]);
            setLoading(false);
            return;
        }

        // --- 2. ENRIQUECER OS DADOS ---
        // A função RPC retorna apenas os dados básicos do plano.
        // Agora buscamos os detalhes (Logo do provedor, Benefícios, Cobertura) usando os IDs encontrados.
        const planIds = foundPlans.map(p => p.id);

        const { data: fullPlans, error: plansError } = await supabase
            .from('plans')
            .select(`
                *,
                providers ( id, name, type, logo_url ),
                benefits ( id, text, icon ),
                plan_coverage ( uf, city )
            `)
            .in('id', planIds)
            .eq('active', true);

        if (plansError) throw plansError;
        
        setPlans(fullPlans as any);

      } catch (error: any) {
        console.error('Erro na busca:', error);
        toast.error('Erro ao buscar planos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [userAddress]); // Re-executa se o endereço mudar

  const handleSelectPlan = (plan: Plan) => {
    navigate('/detalhes', { state: { plan, userAddress } });
  };

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    // Fundo cinza claro para destacar os cards brancos
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10 font-sans transition-colors duration-300">
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 border-b border-slate-200 dark:border-slate-700 flex items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white mr-4 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Comparar Planos</h1>
      </div>

      {userAddress && (
         <div className="px-4 py-3 bg-[#0096C7]/10 border-b border-[#0096C7]/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0096C7] text-sm">location_on</span>
            <p className="text-sm text-slate-700 dark:text-slate-300">
                Ofertas para: <strong>{userAddress.logradouro}, {userAddress.numero}</strong>
                <span className="block text-xs opacity-70">CEP: {userAddress.cep}</span>
            </p>
         </div>
      )}

      {loading ? (
        <div className="p-10 text-center flex flex-col items-center gap-4 mt-8">
            <span className="material-symbols-outlined animate-spin text-4xl text-[#0096C7]">progress_activity</span>
            <div>
                <p className="text-slate-800 dark:text-white font-bold">Analisando cobertura...</p>
                <p className="text-slate-500 text-sm">Consultando viabilidade técnica no CEP {userAddress?.cep}</p>
            </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
          <p className="text-sm text-slate-500 font-medium ml-1">
            {plans.length} planos com viabilidade técnica encontrada
          </p>
          
          {plans.map((plan) => (
            <div 
                key={plan.id} 
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700"
            >
              {/* Banner */}
              <div 
                className="h-32 bg-cover bg-center relative"
                style={{ backgroundImage: `url("${plan.banner_image}")` }} 
              >
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                 {plan.is_featured && (
                    <div className="absolute top-3 right-3 bg-[#D4AF37] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg tracking-wider">
                        <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                        Destaque
                    </div>
                 )}
              </div>

              {/* Corpo do Card */}
              <div className="p-6">
                 {/* Logo e Nome */}
                 <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-2 mb-1">
                         {plan.providers?.logo_url && (
                            <img src={plan.providers.logo_url} alt="logo" className="h-6 w-auto object-contain" />
                         )}
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.providers?.name}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{plan.name}</h3>
                 </div>
                 
                 {/* Specs */}
                 <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold mb-1 block">Download</span>
                        <div className="flex items-center gap-1 text-[#0096C7] font-black text-lg">
                            <span className="material-symbols-outlined">download</span> 
                            {plan.download_speed}
                        </div>
                    </div>
                    <div className="border-l border-slate-200 dark:border-slate-600 pl-4">
                        <span className="text-xs text-slate-500 uppercase font-bold mb-1 block">Upload</span>
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold text-lg">
                            <span className="material-symbols-outlined">upload</span> 
                            {plan.upload_speed}
                        </div>
                    </div>
                 </div>

                 <div className="w-full h-px bg-slate-100 dark:bg-slate-700 mb-5"></div>

                 {/* Rodapé do Card */}
                 <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs text-slate-400 line-through mb-1">R$ {(plan.price * 1.2).toFixed(2)}</p>
                        <p className="text-3xl font-black text-[#0096C7] leading-none">
                            {formatPrice(plan.price)}
                            <span className="text-sm font-medium text-slate-400 ml-1">{plan.period}</span>
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => handleSelectPlan(plan)}
                        style={{ backgroundColor: '#0096C7' }} 
                        className="text-white px-6 py-3 rounded-xl font-bold transition-transform hover:scale-105 shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                        Ver Detalhes
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                 </div>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">router</span>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">Indisponível nesta região</p>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">
                      Infelizmente nenhum parceiro atende o CEP <strong>{userAddress?.cep}</strong> com tecnologia Fibra no momento.
                  </p>
                  <button 
                    onClick={() => navigate('/')}
                    className="mt-6 text-[#0096C7] font-bold text-sm hover:underline"
                  >
                    Tentar outro CEP
                  </button>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompareView;