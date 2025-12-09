// src/services/whatsappService.ts

const API_URL = import.meta.env.VITE_WHATSAPP_API_URL;
const API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'apikey': API_KEY
};

interface CreateInstanceOptions {
  number?: string;
  webhookUrl?: string;
}

// --- FUNÇÃO DE TRATAMENTO DE ERRO ---
const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMessage = data?.error || `Erro API: ${response.status}`;

    if (data?.message) {
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join(' | ');
      } else if (typeof data.message === 'string') {
        errorMessage = data.message;
      }
    }
    
    console.error("❌ Erro na API:", { status: response.status, data });
    throw new Error(errorMessage);
  }
  
  return data;
};

export const whatsappService = {
  // 1. Criar Instância (Payload Ajustado)
  async createInstance(instanceName: string, options?: CreateInstanceOptions) {
    
    // Monta o payload seguindo o novo formato estrito
    const payload: any = {
      instanceName: instanceName,
      integration: "WHATSAPP-BAILEYS"
    };

    // Adiciona o número se fornecido
    if (options?.number) {
      payload.number = options.number;
    }

    // Configura Webhook se URL fornecida
    if (options?.webhookUrl) {
      payload.webhook = {
        url: options.webhookUrl,
        byEvents: false, // Solicitado: false
        base64: true,
        events: ["MESSAGES_UPSERT"] // Agora dentro do objeto webhook
      };
    }

    console.log("📤 Criando Instância - Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${API_URL}/instance/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    return handleResponse(response);
  },

  // 2. Conectar
  async connectInstance(instanceName: string) {
    try {
      const response = await fetch(`${API_URL}/instance/connect/${instanceName}`, { method: 'GET', headers });
      return await handleResponse(response);
    } catch (error) {
      console.error("Erro ao buscar conexão:", error);
      throw error;
    }
  },

  // 3. Checar Status
  async getConnectionState(instanceName: string) {
    try {
      const response = await fetch(`${API_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers
      });

      if (response.status === 404) {
        return { instance: { state: 'close' } };
      }

      return await response.json(); 
    } catch (error) {
      return { instance: { state: 'disconnected' } };
    }
  },

  // 4. Reiniciar
  async restartInstance(instanceName: string) {
    const response = await fetch(`${API_URL}/instance/restart/${instanceName}`, { method: 'PUT', headers });
    return handleResponse(response);
  },

  // 5. Logout
  async logoutInstance(instanceName: string) {
    const response = await fetch(`${API_URL}/instance/logout/${instanceName}`, { method: 'DELETE', headers });
    return handleResponse(response);
  },

  // 6. Deletar
  async deleteInstance(instanceName: string) {
    const response = await fetch(`${API_URL}/instance/delete/${instanceName}`, { method: 'DELETE', headers });
    return handleResponse(response);
  }
};