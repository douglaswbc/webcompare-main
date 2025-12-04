/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {

        // 🔹 Cor institucional (títulos, CTA secundários, gradientes)
        primary: {
          light: "#8A63FF",
          DEFAULT: "#6C3AFF",
          hover: "#4B1DFF",
          dark: "#5A44DC",
        },

        // 🔹 Botões principais / ações
        accent: {
          light: "#FF7A18",
          DEFAULT: "#FF6A00",
          hover: "#E65F00",
          dark: "#CC5200",
        },

        // 🔹 Fundos pastéis e áreas suaves
        secondary: {
          DEFAULT: "#E7F1FF",
          hover: "#D0E1FF",
        },

        // 🔹 Feedback sistêmico
        success: {
          light: "#d1fae5",
          DEFAULT: "#34d399",
          hover: "#059669",
        },

        // 🔹 Estrutura do app
        background: {
          main: "#FFFFFF",
          light: "#F9FBFF",
          section: "#E7F1FF",
          dark: "#0f172a",
          paper: "#ffffff",
          "paper-dark": "#1e293b",
        },

        // 🔹 Tipografia padronizada
        text: {
          main: "#666666",
          muted: "#A9A9A9",
          dark: "#333333",
          inverted: "#ffffff",
        },

        // 🔹 Estados do sistema (error, warning, etc)
        error: "#f87171",
        warning: "#fbbf24",
        info: "#60a5fa",
        gold: "#fbbf24",
      },

      fontFamily: {
        display: ["Inter", "Poppins", "sans-serif"],
      },

      boxShadow: {
        glow: "0 4px 18px rgba(108,58,255,0.35)",
        orange: "0 4px 18px rgba(255,106,0,0.35)",
      },
    },
  },
  plugins: [],
}
