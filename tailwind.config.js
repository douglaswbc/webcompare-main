/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Mantém o suporte a dark mode, mas agora com tons de cinza
  theme: {
    extend: {
      colors: {
        // --- PALETA DE CORES PERSONALIZADA ---
        
        // Cor Primária: Azul Pisciano (Sereno, Água, Tecnologia)
        "primary": {
          DEFAULT: "#0096C7", // Cor principal
          hover: "#0077B6",   // Cor ao passar o mouse (mais escura)
          light: "#CAF0F8",   // Fundo suave (badges, alertas)
        },

        // Cor de Acento: Dourado (Premium, Destaque)
        "gold": {
          DEFAULT: "#D4AF37", // Dourado Metálico
          light: "#F4E5B0",   // Dourado suave para fundos
          dark: "#B4942D",    // Dourado escuro para texto
        },

        // Fundos (Clean / Branco / Cinza)
        "background": {
          light: "#F8FAFC",   // Branco levemente azulado/cinza (Slate-50)
          dark: "#1E293B",    // Cinza Chumbo Profundo (Slate-800) - Substitui o preto
          paper: "#FFFFFF",   // Branco puro para cartões
          "paper-dark": "#0F172A", // Cinza muito escuro para cartões no modo dark
        },

        // Textos (Cinzas para leitura confortável)
        "text": {
          main: "#334155",    // Slate-700 (Texto principal)
          muted: "#64748B",   // Slate-500 (Texto secundário)
          inverted: "#F1F5F9" // Branco acinzentado para fundo escuro
        }
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      // Sombra suave dourada para botões premium
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(212, 175, 55, 0.39)',
      }
    },
  },
  plugins: [],
}