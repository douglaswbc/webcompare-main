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

      // Limpa o CEP para enviar apenas números
      const cleanCep = userAddress.cep.replace(/\D/g, '');

      try {
        // --- 1. CHAMADA INTELIGENTE (RPC) ---
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_available_plans', {
          user_cep: cleanCep,
          user_lat: location.state?.coords?.lat || 0,
          user_long: location.state?.coords?.lng || 0,
          user_city: userAddress.localidade || '',
          user_uf: userAddress.uf || ''
        });

        if (rpcError) throw rpcError;

        const foundPlans = rpcData as any[];

        // Se a função não retornar nada
        if (!foundPlans || foundPlans.length === 0) {
          setPlans([]);
          setLoading(false);
          return;
        }

        // --- 2. ENRIQUECER OS DADOS ---
        const planIds = foundPlans.map(p => p.id);

        const { data: fullPlans, error: plansError } = await supabase
          .from('plans')
          .select(`
                *,
                providers ( id, name, type, logo_url ),
                benefits ( id, text, icon )
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
  }, [userAddress]);

  const handleSelectPlan = (plan: Plan) => {
    navigate('/detalhes', { state: { plan, userAddress } });
  };

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-10 font-sans transition-colors duration-300">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background-paper/90 dark:bg-background-paper-dark/90 backdrop-blur-md p-4 border-b border-background-light dark:border-text-inverted/5 flex items-center shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-background-light hover:bg-background-paper dark:bg-text-inverted/5 dark:hover:bg-text-inverted/10 text-text-dark dark:text-text-inverted mr-4 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-text-dark dark:text-text-inverted">Comparar Planos</h1>
      </div>

      {userAddress && (
        <div className="px-4 py-3 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">location_on</span>
          <p className="text-sm text-text-dark dark:text-text-inverted/90">
            Ofertas para: <strong>{userAddress.logradouro}, {userAddress.numero}</strong>
            <span className="block text-xs opacity-70">
              CEP: {userAddress.cep}
              {/* Indicador visual se a busca foi por cidade ou GPS */}
              {!location.state?.coords && <span className="ml-2 text-accent font-bold">(Busca por Região)</span>}
            </span>
          </p>
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center flex flex-col items-center gap-4 mt-8">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <div>
            <p className="text-text-dark dark:text-text-inverted font-bold">Analisando cobertura...</p>
            <p className="text-text-main text-sm">Consultando viabilidade técnica no local.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto">
          <p className="text-sm text-text-muted font-medium ml-1 uppercase tracking-wider text-xs">
            {plans.length} planos encontrados
          </p>

          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group bg-background-paper dark:bg-background-paper-dark rounded-2xl overflow-hidden shadow-sm hover:shadow-glow transition-all duration-300 border border-background-light dark:border-text-inverted/5 relative"
            >
              {/* Banner */}
              <div
                className="h-32 bg-cover bg-center relative"
                style={{ backgroundImage: `url("${plan.banner_image}")` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background-paper dark:from-background-paper-dark to-transparent"></div>
                {plan.is_featured && (
                  <div className="absolute top-3 right-3 bg-accent text-text-inverted text-[10px] uppercase font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-orange tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                    Destaque
                  </div>
                )}
              </div>

              {/* Corpo do Card */}
              <div className="p-6 pt-2 relative">
                {/* Logo e Nome */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {plan.providers?.logo_url && (
                      <div className="bg-background-paper p-1 rounded-md h-8 w-auto shadow-sm">
                        <img src={plan.providers.logo_url} alt="logo" className="h-full w-auto object-contain" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{plan.providers?.name}</span>
                  </div>
                  <h3 className="text-2xl font-black text-text-dark dark:text-text-inverted leading-tight group-hover:text-primary transition-colors">{plan.name}</h3>
                </div>

                {/* Specs Inset */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-background-light dark:bg-background-dark/50 p-4 rounded-xl border border-transparent dark:border-text-inverted/5">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold mb-1 block tracking-wider">Download</span>
                    <div className="flex items-center gap-1 text-primary font-black text-lg">
                      <span className="material-symbols-outlined text-base">download</span>
                      {plan.download_speed}
                    </div>
                  </div>
                  <div className="border-l border-text-inverted/10 pl-4">
                    <span className="text-[10px] text-text-muted uppercase font-bold mb-1 block tracking-wider">Upload</span>
                    <div className="flex items-center gap-1 text-text-dark dark:text-text-inverted/70 font-bold text-lg">
                      <span className="material-symbols-outlined text-base">upload</span>
                      {plan.upload_speed}
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-background-light dark:bg-text-inverted/5 mb-5"></div>

                {/* Rodapé do Card */}
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-text-muted line-through mb-1">R$ {(plan.price * 1.2).toFixed(2)}</p>
                    <p className="text-3xl font-black text-text-dark dark:text-text-inverted leading-none">
                      {formatPrice(plan.price)}
                      <span className="text-sm font-medium text-text-muted ml-1">{plan.period}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className="flex-1 max-w-[180px] py-3 text-text-inverted font-bold rounded-xl bg-primary hover:bg-primary-hover shadow-lg shadow-glow transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Detalhes
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="text-center py-12 bg-background-paper dark:bg-background-paper-dark rounded-2xl border-2 border-dashed border-background-light dark:border-text-inverted/10">
              <span className="material-symbols-outlined text-5xl text-text-muted mb-3">router</span>
              <p className="text-text-dark dark:text-text-inverted/70 font-medium text-lg">Indisponível nesta região</p>
              <p className="text-sm text-text-muted max-w-xs mx-auto mt-2">
                Nenhum plano encontrado para <strong>{userAddress?.localidade}</strong> no momento.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 text-primary font-bold text-sm hover:underline"
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