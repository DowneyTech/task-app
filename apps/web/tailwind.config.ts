import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#db4035",
          hover: "#c0392b",
          light: "#fff0ef",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f9f9f9",
          muted: "#f0f0f0",
        },
        border: {
          DEFAULT: "#e5e5e5",
          strong: "#d4d4d4",
        },
        text: {
          DEFAULT: "#202020",
          secondary: "#6b6b6b",
          muted: "#999999",
        },
        priority: {
          high: "#d1453b",
          medium: "#eb8909",
          low: "#246fe0",
          none: "#c0c0c0",
        },
      },
      keyframes: {
        "check-in": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "check-in": "check-in 0.2s ease-out",
        "slide-in": "slide-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config;
