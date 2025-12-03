import React, { useState, useEffect } from 'react';
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

    // 🔥 CORREÇÃO: useEffect fora da condicional
    useEffect(() => {
        if (!plan) navigate('/');
    }, [plan, navigate]);

    if (!plan) return null;

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
        } catch (err) {
            console.error(err);
        }

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
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-28 font-sans">

            {/* Botão Voltar */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-4 left-4 z-20 w-12 h-12 rounded-full bg-background-paper dark:bg-background-paper-dark shadow-lg flex items-center justify-center text-text-dark dark:text-text-inverted hover:scale-110 transition-transform border border-background-light dark:border-background-dark"
            >
                <span className="material-symbols-outlined">arrow_back</span>
            </button>

            {/* Banner */}
            <div
                className="h-64 bg-cover bg-center relative"
                style={{ backgroundImage: `url("${plan.banner_image}")` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-black/40"></div>

                {/* Título sobre o banner */}
                <div className="absolute bottom-6 left-6 right-6 z-10">
                    {plan.is_featured && (
                        <span className="inline-flex items-center gap-1 bg-accent text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-3 shadow-sm tracking-wider">
                            <span className="material-symbols-outlined text-[14px]">star</span>
                            Premium
                        </span>
                    )}
                    <h1 className="text-4xl font-black text-text-dark dark:text-text-inverted mb-1 drop-shadow-sm leading-none">{plan.name}</h1>
                    <p className="text-text-dark dark:text-text-inverted/70 font-medium text-lg">{plan.providers?.name}</p>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="px-4 -mt-10 relative z-10 max-w-2xl mx-auto space-y-6">
                {/* Card Velocidades */}
                <div className="bg-background-paper dark:bg-background-paper-dark rounded-2xl p-6 shadow-xl border border-background-light dark:border-background-dark">
                    <div className="grid grid-cols-3 gap-4 divide-x divide-background-light dark:divide-background-dark">
                        <div className="text-center">
                            <span className="block text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Download</span>
                            <span className="text-primary font-bold text-2xl">{plan.download_speed}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Upload</span>
                            <span className="text-text-dark dark:text-text-inverted font-bold text-2xl">{plan.upload_speed}</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Mensal</span>
                            <span className="text-primary font-bold text-2xl">{formatPrice(plan.price)}</span>
                        </div>
                    </div>
                </div>

                {/* Benefícios */}
                <div>
                    <h3 className="text-text-dark dark:text-text-inverted font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                        Benefícios Inclusos
                    </h3>
                    <div className="space-y-3">
                        {plan.benefits?.map((b: any) => (
                            <div key={b.id} className="flex items-center gap-4 p-4 bg-background-paper dark:bg-background-paper-dark rounded-xl border border-background-light dark:border-background-dark shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-secondary dark:bg-background-dark flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">{b.icon}</span>
                                </div>
                                <span className="text-text-dark dark:text-text-inverted/80 font-medium">{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Fixo */}
            <div className="fixed bottom-0 w-full p-4 bg-background-paper dark:bg-background-dark border-t border-background-light dark:border-background-dark shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-30">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-text-muted uppercase font-bold">Total Mensal</p>
                        <p className="text-3xl font-black text-primary">{formatPrice(plan.price)}</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-accent/30 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        Assinar Agora
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background-dark/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-background-paper dark:bg-background-paper-dark w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-text-dark dark:text-text-inverted">Seus Dados</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-dark">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nome Completo"
                                className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark text-text-dark dark:text-text-inverted border border-background-light dark:border-background-dark outline-none focus:border-primary"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            />
                            <input
                                type="tel"
                                placeholder="WhatsApp / Celular"
                                className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark text-text-dark dark:text-text-inverted border border-background-light dark:border-background-dark outline-none focus:border-primary"
                                value={formData.telefone}
                                onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="CPF (Opcional)"
                                className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark text-text-dark dark:text-text-inverted border border-background-light dark:border-background-dark outline-none focus:border-primary"
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
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
