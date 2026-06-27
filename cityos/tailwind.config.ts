import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand ─────────────────────────────────────────────────────────────
        primary: {
          DEFAULT: "#004ac6",
          hover: "#003ea8",
          light: "#dbe1ff",
          fixed: "#b4c5ff",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#006c49",
          light: "#6cf8bb",
          foreground: "#ffffff",
        },
        tertiary: {
          DEFAULT: "#784b00",
          light: "#ffddb8",
        },
        // ── Semantic ──────────────────────────────────────────────────────────
        success: { DEFAULT: "#006c49", foreground: "#ffffff" },
        warning: { DEFAULT: "#784b00", foreground: "#ffffff" },
        error: { DEFAULT: "#ba1a1a", light: "#ffdad6", foreground: "#ffffff" },
        info: { DEFAULT: "#004ac6" },
        // ── Surface (Light) ───────────────────────────────────────────────────
        background: "#f9f9ff",
        surface: {
          DEFAULT: "#f9f9ff",
          low: "#f0f3ff",
          container: "#e7eeff",
          high: "#dee8ff",
          highest: "#d8e3fb",
          dim: "#cfdaf2",
          lowest: "#ffffff",
        },
        // ── Text ─────────────────────────────────────────────────────────────
        "on-surface": "#111c2d",
        "on-surface-variant": "#434655",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "on-error": "#ffffff",
        outline: { DEFAULT: "#737686", variant: "#c3c6d7" },
        // ── Inverse (Dark Mode) ───────────────────────────────────────────────
        "inverse-surface": "#263143",
        "inverse-on-surface": "#ecf1ff",
        "inverse-primary": "#b4c5ff",
        // ── Priority Chips ────────────────────────────────────────────────────
        critical: { DEFAULT: "#ba1a1a", light: "#ffdad6" },
        high: { DEFAULT: "#784b00", light: "#ffddb8" },
        medium: { DEFAULT: "#004ac6", light: "#dbe1ff" },
        low: { DEFAULT: "#006c49", light: "#6cf8bb" },
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "1rem",
        md: "1rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "3rem",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["57px", { lineHeight: "64px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "title-lg": ["22px", { lineHeight: "28px", fontWeight: "500" }],
        "title-md": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.1px", fontWeight: "500" }],
      },
      boxShadow: {
        sm: "0px 2px 8px rgba(30,41,59,0.04)",
        DEFAULT: "0px 4px 20px rgba(30,41,59,0.05)",
        md: "0px 4px 20px rgba(30,41,59,0.05)",
        lg: "0px 8px 30px rgba(30,41,59,0.08)",
        ai: "0 0 15px rgba(0,74,198,0.15)",
        dark: "0px 4px 20px rgba(0,0,0,0.3)",
        "dark-lg": "0px 8px 40px rgba(0,0,0,0.4)",
      },
      spacing: {
        gutter: "24px",
        "page-x": "16px",
        "page-x-md": "24px",
        "page-x-lg": "48px",
      },
      maxWidth: {
        page: "1280px",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "marker-pulse": "markerPulse 1.5s ease-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "count-up": "countUp 0.6s ease-out",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0,74,198,0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(0,74,198,0.4)" },
        },
        markerPulse: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
