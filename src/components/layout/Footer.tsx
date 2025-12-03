import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-6xl mx-auto px-4 text-center md:text-left grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-white mb-4 justify-center md:justify-start">
                        <span className="material-symbols-outlined text-primary">wifi_find</span>
                        <span className="font-bold text-xl">WebCompare</span>
                    </div>
                    <p className="text-sm max-w-xs mx-auto md:mx-0">
                        Ajudamos brasileiros a encontrarem a melhor conexão de internet desde 2023. Transparência e economia em primeiro lugar.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Empresa</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-primary">Sobre Nós</Link></li>
                        <li><Link to="/" className="hover:text-primary">Carreiras</Link></li>
                        <li><Link to="/" className="hover:text-primary">Imprensa</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/termos" className="hover:text-primary">Termos de Uso</Link></li>
                        <li><Link to="/privacidade" className="hover:text-primary">Política de Privacidade</Link></li>
                        <li><Link to="/admin" className="hover:text-primary">Área do Parceiro</Link></li>
                    </ul>
                </div>
            </div>
            <div className="text-center mt-12 pt-8 border-t border-slate-800 text-xs">
                © 2023 WebCompare Tecnologia. Todos os direitos reservados.
            </div>
        </footer>
    );
};

export default Footer;
