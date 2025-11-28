import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // <--- Importar
import { supabase } from '../supabaseClient';

const AdminLayout: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        toast.error('Erro no login: ' + error.message); // <--- Toast
    } else {
        toast.success('Bem-vindo ao Admin!'); // <--- Toast
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Sessão encerrada.');
  };

  if (loading) return <div className="p-10 text-white">Carregando...</div>;

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#101922]">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-[#192633] p-8 rounded-xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin WebCompare</h2>
          <div className="mb-4">
            <label className="block text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-primary outline-none"
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-400 mb-1">Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#0d141c] text-white p-3 rounded border border-slate-700 focus:border-primary outline-none"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white p-3 rounded font-bold hover:bg-primary/90 transition-colors">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#101922]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#192633] border-r border-white/10 p-4 flex flex-col">
        <h1 className="text-xl font-bold text-white mb-8">WebCompare Admin</h1>
        <nav className="flex-1 flex flex-col gap-2">
          <Link to="/admin" className="text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded transition-colors">Dashboard / Leads</Link>
          <Link to="/admin/areas" className="text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded transition-colors">Gerenciar Mapas (KMZ)</Link>
          <Link to="/admin/planos" className="text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded transition-colors">Planos e Provedores</Link>
          <Link to="/" className="text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded mt-auto border-t border-white/10 pt-4 transition-colors">Voltar ao Site</Link>
        </nav>
        <button onClick={handleLogout} className="mt-4 text-red-400 text-sm hover:text-red-300 text-left p-2">Sair</button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;