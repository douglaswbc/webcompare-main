import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ARTICLES } from '../constants'; // Pode manter estático ou mover para DB

const ArticlesView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="flex items-center p-4 sticky top-0 bg-background-light dark:bg-background-dark z-10">
        <button onClick={() => navigate('/')} className="dark:text-white mr-4">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold dark:text-white">Conteúdo</h1>
      </div>
      
      <div className="flex flex-col gap-4 p-4">
        {ARTICLES.map((article) => (
          <div key={article.id} className="bg-white dark:bg-[#192633] rounded-xl overflow-hidden shadow-sm">
             <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url("${article.image}")` }}></div>
             <div className="p-4">
                <h2 className="font-bold dark:text-white">{article.title}</h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{article.description}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticlesView;