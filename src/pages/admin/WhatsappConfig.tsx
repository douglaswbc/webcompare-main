import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { settingsService } from '../../services/settingsService';
import { whatsappService } from '../../services/whatsappService';

const WhatsappConfig: React.FC = () => {
  // --- Estados ---
  const [phone, setPhone] = useState('');
  const [savingNumber, setSavingNumber] = useState(false);

  // Estado da Conexão
  const [instanceName, setInstanceName] = useState('webcompare_bot'); // Nome padrão
  const [connectionStatus, setConnectionStatus] = useState<'open' | 'close' | 'connecting' | 'unknown'>('unknown');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingApi, setLoadingApi] = useState(false);
  
  // Opções Avançadas
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    loadData();
    checkConnection();
  }, []);

  // Polling de status
  useEffect(() => {
    let interval: any;
    // Se mudou o nome da instância, para o polling antigo e inicia um novo
    if (connectionStatus === 'close' || connectionStatus === 'connecting') {
      interval = setInterval(checkConnection, 5000);
    }
    return () => clearInterval(interval);
  }, [connectionStatus, instanceName]); // Adicionado instanceName nas dependências

  const loadData = async () => {
    const num = await settingsService.getWhatsAppNumber();
    setPhone(num);
  };

  // --- Salvar Número de Contato ---
  const handleSaveNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNumber(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      await settingsService.updateWhatsAppNumber(cleanPhone);
      toast.success('Número de contato atualizado!');
      setPhone(cleanPhone);
    } catch (error) {
      toast.error('Erro ao salvar número.');
    } finally {
      setSavingNumber(false);
    }
  };

  // --- API WhatsApp ---

  const checkConnection = async () => {
    // Não verifica se não tiver nome
    if (!instanceName) return;

    try {
      const data = await whatsappService.getConnectionState(instanceName);
      const state = data?.instance?.state || data?.state || 'close'; 
      setConnectionStatus(state);
      
      if (state === 'open') {
        setQrCode(null);
      }
    } catch (error) {
      setConnectionStatus('close');
    }
  };

  const handleCreateInstance = async () => {
    if (!instanceName.trim()) return toast.warn('Defina um nome para a instância.');

    setLoadingApi(true);
    try {
      const cleanNumber = phone.replace(/\D/g, ''); 

      await whatsappService.createInstance(instanceName, {
        number: cleanNumber,
        webhookUrl: webhookUrl || undefined
      });

      toast.success(`Instância "${instanceName}" criada!`);
      await handleConnect();

    } catch (error: any) {
      console.error(error);
      // Agora exibimos a mensagem real do erro (ex: "Instance already exists")
      toast.error(`Erro: ${error.message || 'Falha ao criar instância.'}`);
    } finally {
      setLoadingApi(false);
    }
  };

  const handleConnect = async () => {
    setLoadingApi(true);
    try {
      const data = await whatsappService.connectInstance(instanceName);
      
      if (data?.base64) {
        setQrCode(data.base64);
        setConnectionStatus('connecting');
      } else if (data?.code) {
         setQrCode(data.code);
         setConnectionStatus('connecting');
      } else {
        toast.info('Instância conectada ou QR Code indisponível.');
        checkConnection();
      }
    } catch (error: any) {
        // Mostra erro específico se houver
        toast.error(`Erro ao conectar: ${error.message}`);
    } finally {
      setLoadingApi(false);
    }
  };

  const handleLogout = async () => {
    if(!confirm(`Desconectar a instância "${instanceName}"?`)) return;
    setLoadingApi(true);
    try {
      await whatsappService.logoutInstance(instanceName);
      toast.success('Desconectado.');
      setConnectionStatus('close');
      setQrCode(null);
    } catch (error) {
      toast.error('Erro ao desconectar.');
    } finally {
      setLoadingApi(false);
    }
  };

  // NOVO: Função para Deletar
  const handleDeleteInstance = async () => {
    const confirmMsg = `ATENÇÃO: Isso apagará permanentemente a instância "${instanceName}".\n\nDeseja continuar?`;
    if(!confirm(confirmMsg)) return;

    setLoadingApi(true);
    try {
      await whatsappService.deleteInstance(instanceName);
      toast.success('Instância excluída com sucesso.');
      setConnectionStatus('close');
      setQrCode(null);
      // Opcional: Resetar para um nome padrão ou limpar
      // setInstanceName(''); 
    } catch (error) {
      toast.error('Erro ao excluir instância.');
    } finally {
      setLoadingApi(false);
    }
  };

  const handleRestart = async () => {
    setLoadingApi(true);
    try {
      await whatsappService.restartInstance(instanceName);
      toast.success('Reiniciando...');
      setTimeout(checkConnection, 5000);
    } catch (error) {
      toast.error('Erro ao reiniciar.');
    } finally {
      setLoadingApi(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'open': return <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> ONLINE</span>;
      case 'close': return <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold">OFFLINE</span>;
      case 'connecting': return <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">CONECTANDO...</span>;
      default: return <span className="bg-slate-700 text-slate-400 px-3 py-1 rounded-full text-xs font-bold">DESCONHECIDO</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-text-inverted">Configuração do WhatsApp</h1>

      {/* SEÇÃO 1: NÚMERO DE CONTATO */}
      <div className="bg-background-paper-dark p-8 rounded-2xl border border-white/10 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">contact_phone</span>
          Número de Destino (Leads)
        </h2>
        <form onSubmit={handleSaveNumber}>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-text-muted text-xs font-bold uppercase mb-2">
                Telefone para receber os pedidos
              </label>
              <input 
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="5511999999999"
                className="w-full bg-background-dark text-text-inverted p-4 rounded-xl border border-white/10 focus:border-primary outline-none font-mono"
              />
            </div>
            <button 
              type="submit" 
              disabled={savingNumber}
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold p-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 h-[58px]"
            >
              {savingNumber ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">save</span>}
              Salvar
            </button>
          </div>
        </form>
      </div>

      {/* SEÇÃO 2: GERENCIAMENTO DE CONEXÃO */}
      <div className="bg-background-paper-dark p-8 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${connectionStatus === 'open' ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* --- NOVO: Header com Input de Nome da Instância --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
          <div className="flex-1 w-full">
            <label className="text-xs text-text-muted uppercase font-bold mb-2 block">Nome da Instância (API)</label>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-text-muted">
                        <span className="material-symbols-outlined text-lg">dns</span>
                    </span>
                    <input 
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)} // Permite editar o nome
                        onBlur={checkConnection} // Verifica status ao sair do campo
                        placeholder="ex: webcompare_bot"
                        className="w-full bg-black/20 text-white pl-10 p-3 rounded-xl border border-white/10 focus:border-primary outline-none font-mono text-sm"
                    />
                </div>
                {/* Badge de Status agora fica aqui ao lado */}
                {getStatusBadge()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Coluna da Esquerda: Ações */}
          <div className="space-y-4">
            
            {/* Se estiver desconectado, mostra formulário de criação */}
            {connectionStatus === 'close' || connectionStatus === 'unknown' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <label className="text-xs text-text-muted uppercase font-bold mb-2 block flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">webhook</span>
                        Webhook URL (Opcional)
                    </label>
                    <input 
                        type="url" 
                        placeholder="https://seu-sistema.com/webhook"
                        value={webhookUrl}
                        onChange={e => setWebhookUrl(e.target.value)}
                        className="w-full bg-background-dark text-white text-sm p-3 rounded-lg border border-white/10 focus:border-primary outline-none placeholder:text-white/20"
                    />
                </div>

                <div className="flex gap-2">
                    <button 
                    onClick={handleCreateInstance}
                    disabled={loadingApi}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2 group transition-all"
                    >
                    <span className="material-symbols-outlined text-2xl text-text-muted group-hover:text-primary">add_circle</span>
                    <span className="font-bold text-sm">Criar Instância</span>
                    </button>

                    <button 
                    onClick={handleConnect}
                    disabled={loadingApi}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 group transition-all"
                    >
                    <span className="material-symbols-outlined text-2xl">qr_code</span>
                    <span className="font-bold text-sm">Gerar QR</span>
                    </button>
                </div>

                {/* NOVO: Botão de Deletar (Zona de Perigo) */}
                <div className="pt-4 border-t border-white/5">
                    <button 
                        onClick={handleDeleteInstance}
                        disabled={loadingApi}
                        className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 rounded transition-colors flex items-center justify-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">delete_forever</span>
                        Excluir esta instância permanentemente
                    </button>
                </div>
              </div>
            ) : (
               // Estado Conectado
               <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-sm flex items-center gap-3">
                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                    <div>
                      <strong className="block text-green-300 text-lg">Conectado</strong>
                      <span className="opacity-80 block text-xs mt-0.5">Instância <strong>{instanceName}</strong> pronta.</span>
                    </div>
                  </div>

                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleRestart} 
                        disabled={loadingApi} 
                        className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 p-4 rounded-xl border border-yellow-500/20 flex flex-col items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-2xl">restart_alt</span>
                        <span className="text-xs font-bold uppercase">Reiniciar</span>
                      </button>
                      <button 
                        onClick={handleLogout} 
                        disabled={loadingApi} 
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-4 rounded-xl border border-red-500/20 flex flex-col items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-2xl">logout</span>
                        <span className="text-xs font-bold uppercase">Desconectar</span>
                      </button>
                    </div>
               </div>
            )}
          </div>

          {/* Coluna da Direita: Visualizador de QR Code */}
          <div className="flex items-center justify-center bg-black/20 rounded-xl p-4 border border-white/5 min-h-[350px] relative overflow-hidden">
             {/* Background Pattern opcional */}
             <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

             {loadingApi ? (
              <div className="text-center relative z-10">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
                <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Processando...</p>
              </div>
            ) : qrCode && connectionStatus !== 'open' ? (
              <div className="text-center animate-in zoom-in duration-300 relative z-10">
                <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-2xl shadow-black/50">
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-56 h-56 object-contain" />
                </div>
                <p className="text-sm text-white font-bold animate-pulse flex items-center justify-center gap-2 bg-black/40 py-1 px-3 rounded-full mx-auto w-fit backdrop-blur-md">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    Leia o QR Code
                </p>
              </div>
            ) : connectionStatus === 'open' ? (
              <div className="text-center opacity-50 relative z-10">
                <span className="material-symbols-outlined text-8xl text-green-500 mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">phonelink_ring</span>
                <p className="text-base font-medium">Dispositivo Pareado</p>
              </div>
            ) : (
              <div className="text-center opacity-30 relative z-10">
                <span className="material-symbols-outlined text-8xl mb-4">qr_code_scanner</span>
                <p className="text-base font-medium">Aguardando ação...</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default WhatsappConfig;