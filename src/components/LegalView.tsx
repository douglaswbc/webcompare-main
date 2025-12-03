import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LegalView: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isPrivacy = location.pathname === '/privacidade';

    const title = isPrivacy ? 'Política de Privacidade' : 'Termos de Uso';
    const lastUpdate = '28 de Novembro de 2025';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-700 dark:text-slate-300">

            {/* Header Simplificado */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="text-sm font-bold uppercase">Voltar</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">gavel</span>
                        <span className="font-bold text-slate-800 dark:text-white">Legal</span>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">

                    <header className="mb-10 border-b border-slate-100 dark:border-slate-700 pb-8">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-4">
                            {title}
                        </h1>
                        <p className="text-sm text-slate-400">
                            Última atualização: {lastUpdate}
                        </p>
                    </header>

                    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-li:marker:text-accent">

                        {isPrivacy ? (
                            // === CONTEÚDO DA POLÍTICA DE PRIVACIDADE ===
                            <>
                                <p>
                                    A sua privacidade é importante para nós. É política do <strong>WebCompare</strong> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site.
                                </p>

                                <h3>1. Coleta de Informações</h3>
                                <p>
                                    Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Dados de Contato:</strong> Nome, Telefone/WhatsApp (para retorno do especialista).</li>
                                    <li><strong>Dados de Localização:</strong> CEP, Endereço e Coordenadas GPS (para verificação de viabilidade técnica da internet).</li>
                                    <li><strong>Dados de Navegação:</strong> Utilizamos Cookies e Pixels (Google/Facebook) para melhorar a experiência e medir a performance das nossas campanhas.</li>
                                </ul>

                                <h3>2. Uso das Informações</h3>
                                <p>
                                    Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                                </p>
                                <p>
                                    Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto:
                                </p>
                                <ul>
                                    <li>Com os provedores de internet parceiros, estritamente para fins de <strong>instalação e contratação</strong> do plano solicitado por você.</li>
                                    <li>Quando exigido por lei.</li>
                                </ul>

                                <h3>3. Compromisso do Usuário</h3>
                                <p>
                                    O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o WebCompare oferece no site e com caráter enunciativo, mas não limitativo:
                                </p>
                                <ul>
                                    <li>A) Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</li>
                                    <li>B) Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, ou azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
                                </ul>

                                <h3>4. Mais Informações</h3>
                                <p>
                                    Se você tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contato conosco através do nosso canal de atendimento.
                                </p>
                            </>
                        ) : (
                            // === CONTEÚDO DOS TERMOS DE USO ===
                            <>
                                <h3>1. Termos</h3>
                                <p>
                                    Ao acessar o site <strong>WebCompare</strong>, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site.
                                </p>

                                <h3>2. Uso de Licença</h3>
                                <p>
                                    O WebCompare é uma ferramenta de comparação de planos de telecomunicações. É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site WebCompare, apenas para visualização transitória pessoal e não comercial.
                                </p>

                                <h3>3. Isenção de responsabilidade</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        <strong>Precisão dos Dados:</strong> Os preços e condições dos planos de internet são definidos pelas operadoras e podem sofrer alterações sem aviso prévio. Embora nos esforcemos para manter os dados atualizados em tempo real, pode haver divergências entre o valor exibido aqui e o valor final na fatura da operadora.
                                    </li>
                                    <li>
                                        <strong>Cobertura:</strong> A verificação de cobertura via CEP/GPS é uma estimativa baseada em dados fornecidos pelas operadoras. A viabilidade técnica final só é confirmada no momento da visita técnica.
                                    </li>
                                    <li>
                                        <strong>Vínculo:</strong> O WebCompare atua como intermediador de vendas e gerador de leads. Não somos o provedor de internet e não somos responsáveis pela qualidade do sinal, suporte técnico ou cobrança das faturas.
                                    </li>
                                </ul>

                                <h3>4. Limitações</h3>
                                <p>
                                    Em nenhum caso o WebCompare ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em WebCompare.
                                </p>

                                <h3>5. Modificações</h3>
                                <p>
                                    O WebCompare pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
                                </p>

                                <h3>6. Lei aplicável</h3>
                                <p>
                                    Estes termos e condições são regidos e interpretados de acordo com as leis do Brasil e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
                                </p>
                            </>
                        )}
                    </article>
                </div>
            </div>
        </div>
    );
};

export default LegalView;