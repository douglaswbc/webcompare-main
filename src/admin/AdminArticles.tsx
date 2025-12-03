import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

interface Article {
    id: string;
    created_at: string;
    title: string;
    description: string;
    image_url: string;
    author: string;
    read_time: string;
}

const AdminArticles: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [author, setAuthor] = useState('');
    const [readTime, setReadTime] = useState('');

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Erro ao carregar artigos: ' + error.message);
        } else {
            setArticles(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const articleData = {
            title,
            description,
            image_url: imageUrl,
            author,
            read_time: readTime,
        };

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('articles')
                    .update(articleData)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success('Artigo atualizado com sucesso!');
            } else {
                const { error } = await supabase
                    .from('articles')
                    .insert([articleData]);

                if (error) throw error;
                toast.success('Artigo criado com sucesso!');
            }

            resetForm();
            fetchArticles();
        } catch (error: any) {
            toast.error('Erro ao salvar artigo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (article: Article) => {
        setEditingId(article.id);
        setTitle(article.title);
        setDescription(article.description);
        setImageUrl(article.image_url);
        setAuthor(article.author);
        setReadTime(article.read_time);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este artigo?')) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('articles').delete().eq('id', id);
            if (error) throw error;
            toast.success('Artigo excluído com sucesso!');
            fetchArticles();
        } catch (error: any) {
            toast.error('Erro ao excluir artigo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setImageUrl('');
        setAuthor('');
        setReadTime('');
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                Gerenciar Artigos
            </h1>

            {/* Form Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8 border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
                    {editingId ? 'Editar Artigo' : 'Novo Artigo'}
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Título
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Ex: Como escolher o melhor plano de internet"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Descrição
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Breve resumo do artigo..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                URL da Imagem
                            </label>
                            <input
                                type="url"
                                required
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                placeholder="https://exemplo.com/imagem.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Autor
                            </label>
                            <input
                                type="text"
                                required
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Ex: João Silva"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                Tempo de Leitura
                            </label>
                            <input
                                type="text"
                                required
                                value={readTime}
                                onChange={(e) => setReadTime(e.target.value)}
                                className="w-full p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Ex: 5 min"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : (editingId ? 'Atualizar Artigo' : 'Criar Artigo')}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Imagem</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Título</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Autor</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr
                                    key={article.id}
                                    className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                >
                                    <td className="p-4 w-24">
                                        <div className="w-16 h-12 bg-slate-200 rounded overflow-hidden">
                                            <img
                                                src={article.image_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-800 dark:text-white">{article.title}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs">{article.description}</div>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                        {article.author}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(article)}
                                                className="p-2 text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                                title="Excluir"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {articles.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        Nenhum artigo cadastrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminArticles;
