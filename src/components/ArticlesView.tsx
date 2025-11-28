import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ArticlesView: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (data) setArticles(data);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Top App Bar */}
      <div className="flex items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white mr-4 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
          Conteúdo e Dicas
        </h1>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-500">Carregando artigos...</div>
      ) : (
        <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
            {articles.map((article) => (
            <div
                key={article.id}
                className="flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700"
            >
                <div
                className="w-full md:w-64 h-48 md:h-auto bg-cover bg-center shrink-0"
                style={{ backgroundImage: `url("${article.image_url}")` }}
                ></div>
                
                <div className="p-6 flex flex-col justify-center gap-2">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                        {article.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {article.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{article.read_time} de leitura</span>
                    </div>
                </div>
            </div>
            ))}
            
            {articles.length === 0 && (
                <p className="text-center text-slate-500 mt-10">Nenhum artigo encontrado.</p>
            )}
        </div>
      )}
    </div>
  );
};

export default ArticlesView;