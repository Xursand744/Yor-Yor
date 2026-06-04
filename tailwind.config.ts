import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        yoryor: {
          violet: "#5b21b6",
          fuchsia: "#c026d3",
          pearl: "#faf7ff",
          ink: "#2e1065",
        },
        toy: {
          bg: "#0f1410",
          card: "#1a2218",
          border: "#2d3b2a",
          text: "#f2ebe0",
          muted: "#9aab8f",
          accent: "#d4a574",
          free: "#3d8f5a",
          busy: "#b84a4a",
        },
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Segoe UI", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "mijoz-gradient": "linear-gradient(135deg, #faf6f0 0%, #f5ebe0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
