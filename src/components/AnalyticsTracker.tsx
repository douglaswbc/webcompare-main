import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Este componente não renderiza nada visualmente.
 * Ele serve apenas para "escutar" as mudanças de rota e avisar
 * o GTM e o Facebook Pixel que o usuário trocou de página.
 */
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // A cada mudança de rota (URL)...
    
    // 1. Rastreamento Facebook Pixel (Pageview)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }

    // 2. Rastreamento Google Tag Manager (Virtual Pageview)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_path: location.pathname + location.search,
      });
    }

  }, [location]);

  return null;
};

export default AnalyticsTracker;