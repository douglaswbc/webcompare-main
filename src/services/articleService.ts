import { supabase } from './supabase';
import { Article } from '../types';

export const articleService = {
  // --- LEITURA (Público e Admin) ---
  async getAllArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar artigos:', error);
      throw error;
    }

    return data as Article[];
  },

  // --- ESCRITA (Admin) ---
  async saveArticle(article: Partial<Article>, id?: string) {
    // Se tiver ID, atualiza. Senão, cria novo.
    if (id) {
        const { error } = await supabase
            .from('articles')
            .update(article)
            .eq('id', id);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('articles')
            .insert([article]);
        if (error) throw error;
    }
  },

  async deleteArticle(id: string) {
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
    if (error) throw error;
  }
};