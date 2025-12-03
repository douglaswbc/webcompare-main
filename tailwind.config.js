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
        // --- NOVA PALETA (Roxo, Laranja, Azul Pastel) ---

        // Roxo / Lilás predominante (Topo, botões, destaques)
        primary: {
          DEFAULT: "#6C3AFF",
          hover: "#4B1DFF",
          dark: "#5A44DC",
          light: "#8A63FF", // Gerado para variantes mais claras
        },

        // Laranja vibrante (Botões Assinar, destaques auxiliares)
        accent: {
          DEFAULT: "#FF6A00",
          hover: "#E65F00",
          light: "#FF7A18",
        },

        // Azul claro / pastel (Fundos e áreas secundárias)
        secondary: {
          DEFAULT: "#E7F1FF",
          hover: "#D0E1FF",
        },

        // Mantendo funcionais
        success: {
          DEFAULT: "#34d399",
          hover: "#059669",
          light: "#d1fae5",
        },

        // Fundo
        background: {
          light: "#E7F1FF", // Azul claro para fundos gerais
          main: "#FFFFFF",  // Branco predominante
          dark: "#1e1e2e",
          paper: "#ffffff",
          "paper-dark": "#0f172a",
        },

        // Tipografia (Cinza neutro)
        text: {
          main: "#666666",
          muted: "#A9A9A9",
          inverted: "#ffffff",
          dark: "#333333", // Para alto contraste em fundos claros
        },
      },

      fontFamily: {
        display: ["Inter", "Poppins", "sans-serif"], // Poppins dá mais leveza
      },

      boxShadow: {
        // Luz suave colorida
        glow: "0px 4px 18px rgba(108, 58, 255, 0.35)", // Roxo
        orange: "0px 4px 18px rgba(255, 106, 0, 0.35)", // Laranja
      },
    },
  },
  plugins: [],
}
