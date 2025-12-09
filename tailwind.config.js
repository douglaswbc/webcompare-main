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
        // --- NOVA PALETA (Identidade: Encontre Seu Plano) ---

        // Primária: Azul Marinho (Identidade da Marca, Textos Fortes)
        primary: {
          DEFAULT: "#0F3460", // Azul Marinho Profundo
          hover: "#16213E",   // Tom mais escuro para hover
          dark: "#0a1f3a",
          light: "#2c4b70",
        },

         // 🔹 Estados do sistema (error, warning, etc)
        error: "#f87171",
        warning: "#fbbf24",
        info: "#60a5fa",
        gold: "#fbbf24",
        },
        // Accent: Verde Vibrante (AÇÃO, Botões, "PLANO")
        accent: {
          DEFAULT: "#37C64C", // Verde Google/Whatsapp
          hover: "#2ea63f",
          light: "#4ade80",
        },

        // Secundária: Azul Ciano (Tecnologia, Ícones)
        secondary: {
          DEFAULT: "#0EA5E9",
          hover: "#0284c7",
        },

        // Status
        success: {
          DEFAULT: "#37C64C",
          hover: "#15803d",
          light: "#dcfce7",
        },

        // Fundos
        background: {
          light: "#F0F9FF",       // Azul Alice muito suave
          main: "#FFFFFF",
          dark: "#0f172a",        // Slate 900
          paper: "#ffffff",
          "paper-dark": "#1e293b", // Slate 800
        },

        // Tipografia
        text: {
          main: "#475569",        // Slate 600
          muted: "#94a3b8",       // Slate 400
          inverted: "#ffffff",
          dark: "#0F3460",        // Azul Marinho
        },
      },

      fontFamily: {
        display: ["Inter", "Poppins", "sans-serif"],
      },

      boxShadow: {
        // Glow Verde e Ciano
        glow: "0px 4px 18px rgba(14, 165, 233, 0.45)", // Ciano
        orange: "0px 4px 18px rgba(55, 198, 76, 0.45)", // Verde (Mantive o nome 'orange' pra não quebrar código, mas a cor é verde)
      },
    },
  },
  plugins: [],
}
       