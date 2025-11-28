import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';

const AdminLayout: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para controlar o menu no mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fecha o menu automaticamente ao mudar de rota (navegar)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error('Erro no login: ' + error.message);
    else toast.success('Bem-vindo ao Admin!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Sessão encerrada.');
  };

  if (loading) return <div className="p-10 text-white flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>;

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101922] p-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-[#192633] p-8 rounded-xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
             <span className="material-symbols-outlined text-[#0096C7] text-4xl mb-2">admin_panel_settings</span>
             <h2 className="text-2xl font-bold text-white">Admin WebCompare</h2>
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 mb-1 text-sm">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-[#0096C7] outline-none transition-colors"
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-400 mb-1 text-sm">Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-[#0096C7] outline-none transition-colors"
            />
          </div>
          <button type="submit" className="w-full bg-[#0096C7] hover:bg-[#0077B6] text-white p-3 rounded font-bold transition-colors">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#101922] relative overflow-hidden">
      
      {/* --- MOBILE HEADER (Visível apenas em telas pequenas) --- */}
      <div className="md:hidden fixed top-0 w-full bg-[#192633] border-b border-white/10 z-30 px-4 py-3 flex items-center justify-between">
         <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0096C7]">admin_panel_settings</span>
            WebCompare
         </h1>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-1">
            <span className="material-symbols-outlined text-3xl">{isSidebarOpen ? 'close' : 'menu'}</span>
         </button>
      </div>

      {/* --- OVERLAY ESCURO (Para mobile) --- */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR (Responsiva) --- */}
      <aside className={`
          fixed md:relative top-0 left-0 h-full w-64 bg-[#192633] border-r border-white/10 p-4 flex flex-col z-40 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          pt-20 md:pt-4 
      `}>
        <h1 className="text-xl font-bold text-white mb-8 hidden md:block px-2">WebCompare Admin</h1>
        
        <nav className="flex-1 flex flex-col gap-2">
          <NavLink to="/admin" icon="dashboard" label="Dashboard / Leads" />
          <NavLink to="/admin/areas" icon="map" label="Mapas (KMZ)" />
          <NavLink to="/admin/planos" icon="router" label="Planos e Provedores" />
          
          <div className="mt-auto border-t border-white/10 pt-4">
            <Link to="/" className="flex items-center gap-3 text-slate-300 hover:text-white p-3 hover:bg-white/5 rounded transition-colors mb-1">
                <span className="material-symbols-outlined">public</span>
                Voltar ao Site
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/10 p-3 rounded transition-colors text-left">
                <span className="material-symbols-outlined">logout</span>
                Sair
            </button>
          </div>
        </nav>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-20 md:pt-8 w-full">
        <Outlet />
      </main>
    </div>
  );
};

// Componente auxiliar para links do menu ficarem mais limpos
const NavLink = ({ to, icon, label }: any) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link 
            to={to} 
            className={`flex items-center gap-3 p-3 rounded transition-colors ${isActive ? 'bg-[#0096C7] text-white font-medium' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
        >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
        </Link>
    );
}

export default AdminLayout;