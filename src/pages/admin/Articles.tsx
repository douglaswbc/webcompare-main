import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Article } from '../../types';
import { articleService } from '../../services/articleService';
import ArticleModal from '../../components/admin/ArticleModal';

const Articles: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Controle do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const data = await articleService.getAllArticles();
            setArticles(data);
        } catch (error: any) {
            toast.error('Erro ao carregar artigos.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: Partial<Article>) => {
        setSaving(true);
        try {
            await articleService.saveArticle(data, editingArticle?.id);
            toast.success('Artigo salvo com sucesso!');
            setIsModalOpen(false);
            fetchArticles();
        } catch (error: any) {
            toast.error('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
        try {
            await articleService.deleteArticle(id);
            toast.success('Artigo excluído.');
            fetchArticles();
        } catch (error: any) {
            toast.error('Erro ao excluir: ' + error.message);
        }
    };

    const openModal = (article: Article | null = null) => {
        setEditingArticle(article);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Gerenciar Artigos</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                    <span className="material-symbols-outlined">add</span> Novo Artigo
                </button>
            </div>

            <div className="bg-background-paper-dark rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-black/20 text-white uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Imagem</th>
                                <th className="p-4">Título</th>
                                <th className="p-4">Autor</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-white">Carregando...</td></tr>
                            ) : articles.map((article) => (
                                <tr key={article.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 w-24">
                                        <div className="w-16 h-12 bg-slate-800 rounded overflow-hidden">
                                            <img
                                                src={article.image_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=IMG'; }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-white">
                                        {article.title}
                                        <div className="text-xs text-slate-500 font-normal truncate max-w-xs">{article.description}</div>
                                    </td>
                                    <td className="p-4">{article.author}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openModal(article)} className="p-2 text-blue-400 hover:bg-white/10 rounded">
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(article.id)} className="p-2 text-red-400 hover:bg-white/10 rounded">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && articles.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum artigo encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ArticleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingArticle}
                loading={saving}
            />
        </div>
    );
};

export default Articles;