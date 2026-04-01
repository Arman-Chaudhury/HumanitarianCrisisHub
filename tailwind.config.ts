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
          DEFAULT: "#161412",
          deep: "#0e0d0b",
          card: "rgba(255,255,255,0.025)",
          "card-hover": "rgba(255,255,255,0.055)",
        },
        text: {
          bright: "#f0ece2",
          body: "#c4bfb1",
          muted: "#8a8474",
          dim: "#5e584c",
          faint: "#3d3830",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          hard: "rgba(255,255,255,0.14)",
        },
        crisis: {
          red: "#E63946",
          "red-dim": "rgba(230,57,70,0.09)",
          "red-glow": "rgba(230,57,70,0.25)",
        },
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        display: ["Bebas Neue", "Impact", "sans-serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
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
