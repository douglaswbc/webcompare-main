import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserAddress } from '../types';

export const useAddressSearch = () => {
    const navigate = useNavigate();
    const [cep, setCep] = useState('');
    const [loadingCep, setLoadingCep] = useState(false);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Estado do Formulário
    const [addressData, setAddressData] = useState<Partial<UserAddress> | null>(null);
    const [manualInput, setManualInput] = useState(false); // Permite edição manual

    // --- FUNÇÃO AUXILIAR: BUSCAR GPS (Nominatim) ---
    const fetchCoordinates = async (logradouro: string, cidade: string, uf: string) => {
        try {
            const query = `${logradouro}, ${cidade}, ${uf}, Brazil`;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
                { headers: { 'User-Agent': 'WebCompareApp/1.0' } }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                setCoords({
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                });
                return true;
            }
        } catch (err) {
            console.error('Erro GPS:', err);
        }
        return false;
    };

    // --- LÓGICA DO CEP ---
    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setCep(value);

        if (value.length === 8) {
            setLoadingCep(true);
            setManualInput(false); // Reseta modo manual
            setCoords(null);

            try {
                // TENTATIVA 1: ViaCEP
                let response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
                let data = await response.json();

                // TENTATIVA 2: BrasilAPI (Se ViaCEP falhar)
                if (data.erro) {
                    console.warn('ViaCEP falhou, tentando BrasilAPI...');
                    try {
                        response = await fetch(`https://brasilapi.com.br/api/cep/v2/${value}`);
                        if (response.ok) {
                            const dataBrasil = await response.json();
                            data = {
                                erro: false,
                                logradouro: dataBrasil.street,
                                bairro: dataBrasil.neighborhood,
                                localidade: dataBrasil.city,
                                uf: dataBrasil.state,
                                // BrasilAPI v2 às vezes já traz coordenadas!
                                location: dataBrasil.location
                            };

                            if (dataBrasil.location?.coordinates) {
                                setCoords({
                                    lat: dataBrasil.location.coordinates.latitude,
                                    lng: dataBrasil.location.coordinates.longitude
                                });
                            }
                        }
                    } catch (err) {
                        console.error('BrasilAPI falhou também');
                    }
                }

                if (!data.erro) {
                    // SUCESSO AUTOMÁTICO
                    setAddressData({
                        cep: value,
                        logradouro: data.logradouro || '',
                        bairro: data.bairro || '',
                        localidade: data.localidade || '',
                        uf: data.uf || '',
                        numero: ''
                    });

                    // Se BrasilAPI não trouxe GPS, buscamos no Nominatim
                    if (!coords && data.logradouro && data.localidade) {
                        const found = await fetchCoordinates(data.logradouro, data.localidade, data.uf);
                        if (found) toast.success("Localização GPS identificada!");
                    }

                    setTimeout(() => document.getElementById('address-number')?.focus(), 100);

                } else {
                    // FALHA TOTAL (CEP Novo ou Inexistente)
                    toast.info('Endereço não encontrado automaticamente. Por favor, preencha os dados.');
                    setManualInput(true); // Ativa campos manuais
                    setAddressData({
                        cep: value,
                        logradouro: '',
                        bairro: '',
                        localidade: '',
                        uf: '',
                        numero: ''
                    });
                }

            } catch (error) {
                toast.error('Erro de conexão. Verifique sua internet.');
            } finally {
                setLoadingCep(false);
            }
        } else {
            setAddressData(null);
        }
    };

    // --- QUANDO USUÁRIO PREENCHE MANUALMENTE ---
    const handleManualBlur = async () => {
        // Tenta buscar GPS de novo se o usuário preencheu rua e cidade manualmente
        if (addressData?.logradouro && addressData?.localidade && !coords) {
            await fetchCoordinates(addressData.logradouro, addressData.localidade, addressData.uf || '');
        }
    }

    const handleSubmit = () => {
        // Validação básica: precisamos pelo menos do logradouro e do número
        // Se o usuário estiver no modo manual, addressData.numero já deve estar preenchido no input
        if (!addressData?.logradouro || !addressData.numero) {
            toast.warn('Preencha o endereço completo para verificarmos a cobertura.');
            return;
        }

        // Se não tivermos coords ainda (ex: preencheu manual e não saiu do campo), tenta uma última vez
        if (!coords && addressData.localidade) {
            // Envia mesmo sem coords, mas a busca por mapa falhará. 
            // A busca por Tabela (Claro) funcionará.
        }

        const fullAddress: UserAddress = {
            cep: cep,
            logradouro: addressData.logradouro,
            bairro: addressData.bairro || '',
            localidade: addressData.localidade || '',
            uf: addressData.uf || '',
            numero: addressData.numero,
        };

        navigate('/comparar', { state: { userAddress: fullAddress, coords } });
    };

    return {
        cep,
        setCep,
        loadingCep,
        coords,
        addressData,
        setAddressData,
        manualInput,
        setManualInput,
        handleCepChange,
        handleManualBlur,
        handleSubmit
    };
};
