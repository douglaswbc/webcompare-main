import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center absolute top-0 w-full p-6 z-20 justify-between">
      <div className="flex items-center gap-2 text-white drop-shadow-md">
        <div className="bg-primary p-2 rounded-lg">
          <span className="material-symbols-outlined text-2xl text-white">wifi_find</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">Encontre seu Plano</h2>
      </div>
      <button onClick={() => navigate('/artigos')} className="text-white hover:text-accent transition-colors drop-shadow-md">
        <span className="material-symbols-outlined text-3xl">menu</span>
      </button>
    </div>
  );
};

export default Header;
