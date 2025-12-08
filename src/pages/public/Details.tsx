import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

// Imports corrigidos para a nova estrutura
import { Plan, UserAddress, UserPersonalData } from '../../types';
import { leadService } from '../../services/leadService';

const Details: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Tipagem segura dos dados vindos da navegação
    const plan = location.state?.plan as Plan | undefined;
    const userAddress = location.state?.userAddress as UserAddress | undefined;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<UserPersonalData>({
        nome: '', telefone: '', cpf: '', rg: ''
    });

    // Se não tiver plano selecionado, volta pra home
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
            // Usa o serviço desacoplado para salvar o lead
            await leadService.createLead({
                name: formData.nome,
                phone: formData.telefone,
                cpf: formData.cpf,
                rg: formData.rg,
                plan_id: plan.id,
                address_json: userAddress || {}
            });

            toast.success('Redirecionando para WhatsApp...');

            // Lógica de construção da URL do WhatsApp
            const addressTxt = userAddress
                ? `\nEndereço: ${userAddress.logradouro}, ${userAddress.numero}`
                : '';

            const text = `Olá! Quero contratar *${plan.name}*.\nNome: ${formData.nome}\nCPF: ${formData.cpf}${addressTxt}`;
            const url = `https://wa.me/5511943293639?text=${encodeURIComponent(text)}`;

            window.open(url, '_blank');
            setIsModalOpen(false);

        } catch (err) {
            toast.error('Erro ao processar solicitação. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-32 font-sans transition-colors duration-300">

            {/* Header / Botão Voltar */}
            <div className="fixed top-0 left-0 w-full p-4 z-20 flex items-center justify-between pointer-events-none">
                <button
                    onClick={() => navigate(-1)}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md shadow-lg flex items-center justify-center text-text-dark dark:text-text-inverted hover:scale-110 transition-transform border border-white/20"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </div>

            {/* Banner Imersivo */}
            <div className="relative h-[40vh] min-h-[300px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${plan.banner_image}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/20 dark:via-background-dark/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 max-w-2xl mx-auto flex flex-col items-start">
                    {plan.is_featured && (
                        <span className="bg-accent text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full mb-3 shadow-lg shadow-orange animate-in fade-in slide-in-from-bottom-2">
                            Recomendado
                        </span>
                    )}
                    <h1 className="text-4xl md:text-5xl font-black text-text-dark dark:text-text-inverted mb-2 leading-none drop-shadow-sm">
                        {plan.name}
                    </h1>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        {plan.providers?.logo_url && <img src={plan.providers.logo_url} className="h-5 w-auto" alt="" />}
                        <span className="text-text-dark dark:text-text-inverted font-bold text-sm uppercase tracking-wider">
                            {plan.providers?.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="px-4 max-w-2xl mx-auto -mt-6 relative z-10 space-y-6">

                {/* Card de Especificações */}
                <div className="bg-background-paper dark:bg-background-paper-dark rounded-2xl p-6 shadow-xl shadow-black/5 border border-white/10">
                    <div className="grid grid-cols-2 divide-x divide-background-light dark:divide-white/10">
                        <div className="text-center px-4">
                            <span className="block text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Download</span>
                            <div className="text-primary font-black text-3xl flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-2xl">download</span>
                                {plan.download_speed}
                            </div>
                        </div>
                        <div className="text-center px-4">
                            <span className="block text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Upload</span>
                            <div className="text-text-dark dark:text-text-inverted font-bold text-3xl flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-2xl text-text-muted">upload</span>
                                {plan.upload_speed}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-background-light dark:border-white/10 grid grid-cols-2 gap-4">
                        <div className="bg-background-light dark:bg-background-dark/50 rounded-xl p-3 text-center">
                            <span className="block text-xs text-text-muted mb-1">Tecnologia</span>
                            <span className="font-bold text-text-dark dark:text-text-inverted text-sm">{plan.connection_type}</span>
                        </div>
                        <div className="bg-background-light dark:bg-background-dark/50 rounded-xl p-3 text-center">
                            <span className="block text-xs text-text-muted mb-1">Fidelidade</span>
                            <span className="font-bold text-text-dark dark:text-text-inverted text-sm">{plan.contract_text}</span>
                        </div>
                    </div>
                </div>

                {/* Lista de Benefícios */}
                <div>
                    <h3 className="text-text-dark dark:text-text-inverted font-bold text-lg mb-4 flex items-center gap-2 px-2">
                        <span className="material-symbols-outlined text-primary">verified</span>
                        Benefícios Inclusos
                    </h3>
                    <div className="space-y-3">
                        {plan.benefits?.map((b: any) => (
                            <div key={b.id} className="group flex items-start gap-4 p-4 bg-background-paper dark:bg-background-paper-dark rounded-xl border border-transparent hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
                                </div>
                                <div>
                                    <p className="text-text-dark dark:text-text-inverted font-medium text-sm leading-snug pt-2.5">{b.text}</p>
                                </div>
                            </div>
                        ))}
                        {(!plan.benefits || plan.benefits.length === 0) && (
                            <p className="text-text-muted text-sm px-2">Nenhum benefício adicional listado.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Barra Fixa Inferior (CTA) */}
            <div className="fixed bottom-0 left-0 w-full bg-background-paper/90 dark:bg-background-paper-dark/90 backdrop-blur-lg border-t border-white/10 p-4 pb-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
                    <div className="flex flex-col">
                        <span className="text-xs text-text-muted line-through">R$ {(plan.price * 1.3).toFixed(2)}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-primary">R$</span>
                            <span className="text-3xl font-black text-text-dark dark:text-text-inverted">{plan.price}</span>
                            <span className="text-xs text-text-muted font-medium">/mês</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        Contratar
                        <span className="material-symbols-outlined">whatsapp</span>
                    </button>
                </div>
            </div>

            {/* Modal de Lead */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                    <div className="relative bg-background-paper dark:bg-background-paper-dark w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border border-white/10 animate-in slide-in-from-bottom-20 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-text-dark dark:text-text-inverted">Finalizar Pedido</h3>
                                <p className="text-xs text-text-muted">Preencha para receber atendimento prioritário.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-background-light dark:bg-background-dark flex items-center justify-center text-text-muted hover:text-text-dark transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase ml-1 mb-1 block">Nome Completo</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark text-text-dark dark:text-text-inverted border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="Digite seu nome"
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase ml-1 mb-1 block">WhatsApp</label>
                                <input
                                    type="tel"
                                    className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark text-text-dark dark:text-text-inverted border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="(DDD) 90000-0000"
                                    value={formData.telefone}
                                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase ml-1 mb-1 block">CPF <span className="text-[10px] font-normal opacity-50">(Opcional, agiliza a análise)</span></label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-xl bg-background-light dark:bg-background-dark text-text-dark dark:text-text-inverted border border-transparent focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="000.000.000-00"
                                    value={formData.cpf}
                                    onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSendWhatsApp}
                            className="w-full mt-8 bg-[#25D366] hover:bg-[#1fa855] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            Confirmar no WhatsApp
                        </button>

                        <p className="text-center text-[10px] text-text-muted mt-4">
                            Ao clicar, você concorda com nossos Termos de Uso.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Details;