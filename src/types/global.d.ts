/// <reference types="vite/client" />

interface Window {
  // Adiciona suporte ao Google Tag Manager e Facebook Pixel
  dataLayer: any[];
  fbq: any;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}