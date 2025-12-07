import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Article } from '../../types';
import { articleService } from '../../services/articleService';

const Articles: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await articleService.getAllArticles();
        setArticles(data);
      } catch (error) {
        // Erro já logado no serviço
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center bg-background-paper/90 dark:bg-background-paper-dark/90 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-background-light dark:border-background-dark">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-background-light dark:hover:bg-background-dark text-text-dark dark:text-text-inverted mr-4 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-text-dark dark:text-text-inverted">
          Blog & Artigos
        </h1>
      </div>

      {loading ? (
        <div className="p-10 text-center text-text-main flex flex-col items-center gap-2">
            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            <span>Carregando artigos...</span>
        </div>
      ) : (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex flex-col md:flex-row bg-background-paper dark:bg-background-paper-dark rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-background-light dark:border-background-dark"
            >
              {article.image_url && (
                <div className="md:w-1/3 h-48 md:h-auto bg-cover bg-center" style={{ backgroundImage: `url(${article.image_url})` }} />
              )}
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {/* Se category existir, mostra, senão usa um padrão ou esconde */}
                  {article.category && (
                    <span className="text-xs text-primary font-bold uppercase">{article.category}</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-text-dark dark:text-text-inverted leading-tight mb-2">
                  {article.title}
                </h2>
                <p className="text-text-dark dark:text-text-inverted/70 text-sm leading-relaxed mb-4">
                  {/* Fallback: Se summary não existir, usa description */}
                  {article.summary || article.description}
                </p>
                <div className="flex items-center gap-3 mt-auto text-xs text-text-main font-medium uppercase tracking-wide">
                  <span>{article.author}</span>
                  <span>•</span>
                  <span>{article.read_time} de leitura</span>
                </div>
              </div>
            </div>
          ))}

          {articles.length === 0 && (
            <div className="text-center py-10 opacity-70">
                <span className="material-symbols-outlined text-4xl mb-2">article</span>
                <p>Nenhum artigo encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Articles;