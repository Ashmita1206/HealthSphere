import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // App Canvas & Surfaces
        background: "#FAF9F6", // Canonical Warm Off-White Page Background
        foreground: "#0F172A", // Primary Ink Text

        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },

        // Primary Brand Teal Scale
        primary: {
          DEFAULT: "#0F766E", // Primary Brand Teal
          950: "#042F2C",
          900: "#0D4B46",
          800: "#0F766E",
          700: "#115E59",
          600: "#14B8A6",
          500: "#2DD4BF",
          100: "#CCFBF1",
          50:  "#F0FDFA",
          foreground: "#FFFFFF",
        },

        // Clinical AI Identity (Mint / Emerald Family - ABSOLUTE NO PURPLE / NO BLUE)
        ai: {
          DEFAULT: "#059669",
          surface: "#E6F4F1",
          border:  "#A7F3D0",
          text:    "#047857",
          hover:   "#D1FAE5",
        },

        // Secondary & Muted
        secondary: {
          DEFAULT: "#14B8A6",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F3F4F1",
          foreground: "#475569",
        },

        // Borders & Inputs
        border: "#E5E7EB",
        input:  "#D1D5DB",
        ring:   "#0F766E",

        // Semantic Status (Color + Icon + Plain Text)
        success: {
          DEFAULT: "#047857",
          surface: "#ECFDF5",
          border:  "#A7F3D0",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#B45309",
          surface: "#FFFBEB",
          border:  "#FDE68A",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "#B91C1C",
          surface: "#FEF2F2",
          border:  "#FCA5A5",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#B91C1C",
          surface: "#FEF2F2",
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#0F766E",
          surface: "#F0FDFA",
          border:  "#CCFBF1",
          foreground: "#FFFFFF",
        },

        // Architectural Sidebar Palette
        sidebar: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
          primary: "#0F766E",
          "primary-foreground": "#FFFFFF",
          accent: "#F0FDFA",
          "accent-foreground": "#0F766E",
          border: "#E5E7EB",
          ring: "#0F766E",
        },
      },

      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        pill: "9999px",
      },

      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "sans-serif"],
        editorial: ["'Instrument Serif'", "Georgia", "serif"],
        heading: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        numeric: ["'Plus Jakarta Sans'", "monospace"],
      },

      boxShadow: {
        'sm': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'md': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
        'lg': '0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.02)',
        'focus-ring': '0 0 0 2px #FAF9F6, 0 0 0 4px #0F766E',
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "emerald-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "emerald-pulse": "emerald-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
