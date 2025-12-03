import React from 'react';

const FAQSection: React.FC = () => {
    return (
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
    );
};

export default FAQSection;
