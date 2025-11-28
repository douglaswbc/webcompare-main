import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

// Utilitários
import AnalyticsTracker from './components/AnalyticsTracker';

// Views
import HomeView from './components/HomeView';
import CompareView from './components/CompareView';
import DetailsView from './components/DetailsView';
import ArticlesView from './components/ArticlesView';
import LegalView from './components/LegalView'; // <--- Importar

// Admin Imports
import AdminLayout from './admin/AdminLayout';
import AdminLeads from './admin/AdminLeads';
import AdminAreas from './admin/AdminAreas';
import AdminPlans from './admin/AdminPlans';

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
      />

      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<HomeView />} />
        <Route path="/comparar" element={<CompareView />} />
        <Route path="/detalhes" element={<DetailsView />} />
        <Route path="/artigos" element={<ArticlesView />} />
        
        {/* Rotas Legais */}
        <Route path="/termos" element={<LegalView />} />
        <Route path="/privacidade" element={<LegalView />} />

        {/* Rotas de Admin */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminLeads />} />
            <Route path="areas" element={<AdminAreas />} />
            <Route path="planos" element={<AdminPlans />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;