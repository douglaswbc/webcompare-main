import React from 'react';

const FAQSection: React.FC = () => {
    return (
        <div className="py-20 px-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-text-dark dark:text-text-inverted mb-10">Dúvidas Frequentes</h2>
            <div className="space-y-4">
                {[
                    { q: 'O serviço do Encontre seu Plano é gratuito?', a: 'Sim! Você não paga nada para usar nosso comparador. Somos remunerados pelas operadoras quando você contrata um plano.' },
                    { q: 'Os preços são os mesmos do site da operadora?', a: 'Geralmente são melhores. Temos acesso a ofertas exclusivas de canais digitais que nem sempre estão no televendas.' },
                    { q: 'Quanto tempo demora a instalação?', a: 'Depende da operadora e região, mas a média nacional é de 2 a 5 dias úteis após o agendamento.' }
                ].map((faq, idx) => (
                    <div key={idx} className="bg-background-paper dark:bg-background-paper-dark p-6 rounded-xl shadow-sm border border-background-light dark:border-background-dark">
                        <h3 className="font-bold text-text-dark dark:text-text-inverted flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary">help</span>
                            {faq.q}
                        </h3>
                        <p className="text-text-main pl-8">{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQSection;
