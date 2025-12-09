import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes Utilitários
import AnalyticsTracker from './components/AnalyticsTracker';

// --- ROTAS PÚBLICAS (Importação Direta) ---
import Home from './pages/public/Home';
import Compare from './pages/public/Compare';
import Details from './pages/public/Details';
import Articles from './pages/public/Articles';
import Legal from './pages/public/Legal';

// --- ROTAS ADMIN (Lazy Loading para performance) ---
// Isso faz o painel admin carregar só quando o usuário acessa "/admin"
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const Leads = lazy(() => import('./pages/admin/Leads'));
const Areas = lazy(() => import('./pages/admin/Areas'));
const Plans = lazy(() => import('./pages/admin/Plans'));
const AdminArticles = lazy(() => import('./pages/admin/Articles'));
const WhatsappConfig = lazy(() => import('./pages/admin/WhatsappConfig'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AnalyticsTracker />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        aria-label="Notificações do Sistema"
      />

      {/* Suspense envolve as rotas que carregam sob demanda */}
      <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
           <span className="material-symbols-outlined animate-spin text-4xl text-[#6C3AFF]">progress_activity</span>
        </div>
      }>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/comparar" element={<Compare />} />
          <Route path="/detalhes" element={<Details />} />
          <Route path="/artigos" element={<Articles />} />
          <Route path="/termos" element={<Legal />} />
          <Route path="/privacidade" element={<Legal />} />

          {/* Rotas de Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Leads />} />
            <Route path="areas" element={<Areas />} />
            <Route path="planos" element={<Plans />} />
            <Route path="artigos" element={<AdminArticles />} />
            <Route path="whatsapp" element={<WhatsappConfig />} />
          </Route>

          {/* Rota 404 / Redirecionamento */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;