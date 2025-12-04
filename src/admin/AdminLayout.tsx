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

  if (loading) return <div className="p-10 text-white flex justify-center"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>;

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark p-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-background-paper-dark p-8 rounded-2xl border border-white/5 shadow-glow">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-primary text-5xl mb-3">admin_panel_settings</span>
            <h2 className="text-2xl font-black text-text-inverted">Admin Encontre seu Plano</h2>
            <p className="text-text-muted text-sm mt-1">Acesse para gerenciar o sistema</p>
          </div>

          <div className="mb-4">
            <label className="block text-text-muted mb-1 text-xs font-bold uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-background-dark text-text-inverted p-3 rounded-xl border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50"
              placeholder="seu@email.com"
            />
          </div>

          <div className="mb-8">
            <label className="block text-text-muted mb-1 text-xs font-bold uppercase tracking-wider">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-background-dark text-text-inverted p-3 rounded-xl border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-muted/50"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white p-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5">
            Entrar no Painel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background-dark relative overflow-hidden">

      {/* --- MOBILE HEADER (Visível apenas em telas pequenas) --- */}
      <div className="md:hidden fixed top-0 w-full bg-background-paper-dark/90 backdrop-blur-md border-b border-white/10 z-30 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-text-inverted flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
          Encontre seu Plano
        </h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-text-inverted p-1 hover:bg-white/10 rounded transition-colors">
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
          fixed md:relative top-0 left-0 h-full w-64 bg-background-paper-dark border-r border-white/10 p-4 flex flex-col z-40 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          pt-20 md:pt-6
      `}>
        <div className="hidden md:flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">admin_panel_settings</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-inverted leading-none">Admin</h1>
            <span className="text-xs text-text-muted">Encontre seu Plano</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <NavLink to="/admin" icon="dashboard" label="Dashboard / Leads" />
          <NavLink to="/admin/areas" icon="map" label="Mapas (KMZ)" />
          <NavLink to="/admin/planos" icon="router" label="Planos e Provedores" />
          <NavLink to="/admin/artigos" icon="article" label="Artigos" />

          <div className="mt-auto border-t border-white/10 pt-6 space-y-2">
            <Link to="/" className="flex items-center gap-3 text-text-muted hover:text-text-inverted px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-xl">public</span>
              <span className="text-sm font-medium">Voltar ao Site</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 text-state-error hover:text-red-400 hover:bg-state-error/10 px-3 py-2 rounded-lg transition-colors text-left">
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="text-sm font-medium">Sair</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-20 md:pt-8 w-full bg-background-dark scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
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
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${isActive
          ? 'bg-primary text-text-inverted shadow-lg shadow-primary/20 font-semibold'
          : 'text-text-muted hover:text-text-inverted hover:bg-white/5'
        }
      `}
    >
      <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default AdminLayout;