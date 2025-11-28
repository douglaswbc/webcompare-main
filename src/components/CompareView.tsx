import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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
      
      // Se não tiver dados, para.
      if (!userAddress) {
        setLoading(false);
        return;
      }

      // Limpa o CEP para enviar apenas números (ex: 12345678)
      // Ajuste conforme seu CSV. Se no CSV tem 7 digitos, garanta que aqui bata.
      // O ideal é 8 digitos. O replace remove o traço.
      const cleanCep = userAddress.cep.replace(/\D/g, '');

      try {
        // Chamada RPC para a nova função (envia CEP + GPS)
        const { data, error } = await supabase.rpc('get_available_plans', {
            user_cep: cleanCep,
            user_lat: location.state?.coords?.lat || 0,
            user_long: location.state?.coords?.lng || 0
        });

        if (error) throw error;

        // Se encontrou planos, precisamos carregar os detalhes (joins)
        // pois a função RPC retorna apenas a tabela 'plans' pura.
        const planIds = (data as any[]).map(p => p.id);

        if (planIds.length > 0) {
            const { data: fullPlans } = await supabase
                .from('plans')
                .select(`
                    *,
                    providers ( id, name, type, logo_url ),
                    benefits ( id, text, icon ),
                    plan_coverage ( uf, city )
                `)
                .in('id', planIds)
                .eq('active', true);
            
            setPlans(fullPlans as any);
        } else {
            setPlans([]);
        }

      } catch (error) {
        console.error('Erro ao buscar planos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [userAddress]);

  const handleSelectPlan = (plan: Plan) => {
    navigate('/detalhes', { state: { plan, userAddress } });
  };

  const formatPrice = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    // Fundo cinza claro para destacar os cards brancos
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10 font-sans">
      
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
            </p>
         </div>
      )}

      {loading ? (
        <div className="p-10 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined animate-spin text-3xl text-[#0096C7]">progress_activity</span>
            <p className="text-slate-500">Buscando as melhores ofertas...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
          <p className="text-sm text-slate-500 font-medium ml-1">{plans.length} planos encontrados na sua região</p>
          
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
                    
                    {/* BOTÃO AZUL PISCIANO FORÇADO */}
                    <button 
                        onClick={() => handleSelectPlan(plan)}
                        style={{ backgroundColor: '#0096C7' }} // Garante a cor
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
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">Nenhum plano encontrado.</p>
                  <p className="text-sm text-slate-400">Tente buscar por outro CEP ou cidade.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompareView;