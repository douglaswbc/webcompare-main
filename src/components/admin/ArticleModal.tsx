import React, { useState, useEffect } from 'react';
import { Article } from '../../types';

interface ArticleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Article>) => void;
    initialData?: Article | null;
    loading?: boolean;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ isOpen, onClose, onSave, initialData, loading }) => {
    const [formData, setFormData] = useState<Partial<Article>>({
        title: '',
        description: '',
        image_url: '',
        author: '',
        read_time: ''
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        } else if (isOpen) {
            setFormData({ title: '', description: '', image_url: '', author: '', read_time: '' });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-background-paper-dark w-full max-w-2xl rounded-2xl border border-white/10 p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
                <h3 className="text-2xl font-black text-text-inverted mb-6 border-b border-white/10 pb-4">
                    {initialData ? 'Editar Artigo' : 'Novo Artigo'}
                </h3>

                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-1">Título</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:border-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-1">Descrição</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:border-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-400 mb-1">URL da Imagem</label>
                        <input
                            type="url"
                            required
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:border-primary outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1">Autor</label>
                            <input
                                type="text"
                                required
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-1">Tempo de Leitura</label>
                            <input
                                type="text"
                                required
                                value={formData.read_time}
                                onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                                className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:border-primary outline-none"
                                placeholder="Ex: 5 min"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8 justify-end pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-text-muted hover:text-white font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary px-8 py-3 rounded-xl text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArticleModal;