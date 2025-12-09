import { supabase } from './supabase';

export const settingsService = {
  // Busca o número do WhatsApp
  async getWhatsAppNumber() {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'whatsapp_contact')
      .single();
    
    if (error) {
      console.error('Erro ao buscar WhatsApp:', error);
      return '5511943293639'; // Fallback se der erro
    }
    return data?.value || '5511943293639';
  },

  // Salva o novo número (Admin)
  async updateWhatsAppNumber(newNumber: string) {
    const { error } = await supabase
      .from('settings')
      .upsert({ 
        key: 'whatsapp_contact', 
        value: newNumber,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }
};