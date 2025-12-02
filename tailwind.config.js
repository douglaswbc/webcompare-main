/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // --- NOVA PALETA ENCANTADORA E CONVERSIVA ---

        // Cor primária: Turquesa vibrante (confiança + energia)
        primary: {
          DEFAULT: "#06b6d4",  // Turquoise cyan
          hover: "#0891b2",
          light: "#cffafe",
        },

        // Coral emocional para acentos e botões
        accent: {
          DEFAULT: "#fb7185", // Soft coral red
          hover: "#f43f5e",
          light: "#ffe4e6",
        },

        // Amarelo mel otimista
        highlight: {
          DEFAULT: "#facc15",
          hover: "#eab308",
          light: "#fef9c3",
        },

        // Verde Fresh confiança humana
        success: {
          DEFAULT: "#34d399",
          hover: "#059669",
          light: "#d1fae5",
        },

        // Fundo moderno e suave (menos cinzão – mais acolhedor)
        background: {
          light: "#fdfdfd",
          dark: "#1e1e2e",
          paper: "#ffffff",
          "paper-dark": "#0f172a",
        },

        text: {
          main: "#334155",
          muted: "#64748b",
          inverted: "#f1f5f9",
        },
      },

      fontFamily: {
        display: ["Inter", "Poppins", "sans-serif"], // Poppins dá mais leveza
      },

      boxShadow: {
        // Luz suave colorida em vez de dourado pesado
        glow: "0px 4px 18px rgba(16, 185, 129, 0.35)",
        coral: "0px 4px 18px rgba(251, 113, 133, 0.35)",
      },
    },
  },
  plugins: [],
}
