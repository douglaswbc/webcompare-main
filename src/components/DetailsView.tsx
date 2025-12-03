import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';
import { Plan, UserAddress, UserPersonalData } from '../types';

const DetailsView: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const plan = location.state?.plan as Plan | undefined;
    const userAddress = location.state?.userAddress as UserAddress | undefined;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<UserPersonalData>({
        nome: '', telefone: '', cpf: '', rg: ''
    });

    if (!plan) {
        React.useEffect(() => { navigate('/'); }, [navigate]);
        return null;
    }

    const handleSendWhatsApp = async () => {
        if (!formData.nome || !formData.telefone) {
            toast.warn('Preencha seu Nome e Telefone.');
            return;
        }

        try {
            await supabase.from('leads').insert([{
                name: formData.nome,
                phone: formData.telefone,
                cpf: formData.cpf,
                rg: formData.rg,
                plan_id: plan.id,
                address_json: userAddress || {}
            }]);
            toast.success('Redirecionando para WhatsApp...');
        } catch (err) { console.error(err); }

        const addressTxt = userAddress
            ? `\nEndereço: ${userAddress.logradouro}, ${userAddress.numero}`
            : '';

        const text = `Olá! Quero contratar *${plan.name}*.\nNome: ${formData.nome}\nCPF: ${formData.cpf}${addressTxt}`;
        const url = `https://wa.me/559192294869?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        setIsModalOpen(false);
    };

    const formatPrice = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-28 font-sans">

            {/* Botão Voltar */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:bg-black/50 transition-colors shadow-lg"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </div>

            {/* Banner Imersivo */}
            <div className="h-80 w-full bg-cover bg-center relative" style={{ backgroundImage: `url("${plan.banner_image}")` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-900 via-transparent to-black/40"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 max-w-3xl mx-auto">
                    {plan.is_featured && (
                        <span className="inline-flex items-center gap-1 bg-accent text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-3 shadow-sm tracking-wider">
                            <span className="material-symbols-outlined text-[14px]">star</span>
                            Premium
                        </span>
                    )}
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-1 drop-shadow-sm leading-none">{plan.name}</h1>
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">{plan.providers?.name}</p>
                </div>
            </div>

            <div className="p-6 max-w-3xl mx-auto -mt-2 relative z-10 flex flex-col gap-6">

                {/* Card Destaque */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-3 gap-4 divide-x divide-slate-100 dark:divide-slate-700">
                        <div className="text-center">
                            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Download</span>
                            <span className="text-primary font-black text-2xl">{plan.download_speed}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Upload</span>
                            <span className="text-slate-700 dark:text-white font-bold text-2xl">{plan.upload_speed}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Mensal</span>
                            <span className="text-primary font-black text-2xl">{formatPrice(plan.price)}</span>
                        </div>
                    </div>
                </div>

                {/* Benefícios */}
                <div>
                    <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent">verified</span>
                        Incluso no Plano
                    </h3>
                    <div className="flex flex-col gap-3">
                        {plan.benefits?.map((b) => (
                            <div key={b.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">{b.icon}</span>
                                </div>
                                <span className="text-slate-700 dark:text-slate-200 font-medium">{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detalhes Técnicos */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-white uppercase text-xs tracking-wider">
                        Informações Adicionais
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        <div className="p-4 flex justify-between text-sm">
                            <span className="text-slate-500">Conexão</span>
                            <span className="text-slate-800 dark:text-white font-medium">{plan.connection_type}</span>
                        </div>
                        <div className="p-4 flex justify-between text-sm">
                            <span className="text-slate-500">Fidelidade</span>
                            <span className="text-slate-800 dark:text-white font-medium">{plan.contract_text}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Fixo */}
            <div className="fixed bottom-0 w-full p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-30">
                <div className="max-w-3xl mx-auto flex gap-6 items-center">
                    <div className="hidden md:block">
                        <p className="text-xs text-slate-400 uppercase font-bold">Total Mensal</p>
                        <p className="text-2xl font-black text-primary">{formatPrice(plan.price)}</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full py-4 text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 bg-primary flex items-center justify-center gap-2"
                    >
                        Contratar Agora
                        <span className="material-symbols-outlined">check_circle</span>
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Seus Dados</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                placeholder="Nome Completo"
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-primary"
                                value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            />
                            <input
                                placeholder="WhatsApp / Celular"
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-primary"
                                value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                            />
                            <input
                                placeholder="CPF (Opcional)"
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:border-primary"
                                value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                            />
                        </div>

                        <button
                            onClick={handleSendWhatsApp}
                            className="w-full mt-6 bg-[#25D366] hover:bg-[#1fa855] text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                        >
                            Enviar no WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailsView;