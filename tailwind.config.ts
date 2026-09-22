import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#ffffff",
          deep: "#f3f4f6",
          card: "#ffffff",
          "card-hover": "#f9fafb",
        },
        text: {
          bright: "#111827",
          body: "#374151",
          muted: "#6b7280",
          dim: "#6b7280",
          faint: "#9ca3af",
        },
        border: {
          DEFAULT: "#e5e7eb",
          hard: "#d1d5db",
        },
        crisis: {
          red: "#b42318",
          "red-dim": "rgba(180,35,24,0.07)",
          "red-glow": "rgba(180,35,24,0.18)",
        },
      },
      fontFamily: {
        serif: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        scanline: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease both",
        "fade-up-1": "fadeUp 0.5s ease 0.05s both",
        "fade-up-2": "fadeUp 0.5s ease 0.1s both",
        "fade-up-3": "fadeUp 0.5s ease 0.15s both",
        "fade-up-4": "fadeUp 0.5s ease 0.2s both",
        "fade-up-5": "fadeUp 0.5s ease 0.25s both",
        "fade-up-6": "fadeUp 0.5s ease 0.3s both",
        "fade-up-7": "fadeUp 0.5s ease 0.35s both",
        pulse: "pulse 2s ease infinite",
        scanline: "scanline 4s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
