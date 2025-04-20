/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
        // Pet-friendly color scheme
        primary: {
          DEFAULT: "#4D7EA8", // Calm blue, friendly and trustworthy
          50: "#EBF2F8",
          100: "#D7E4F1",
          200: "#B0C9E3",
          300: "#88AFD5",
          400: "#6194C7",
          500: "#4D7EA8", // Primary color
          600: "#3C6283",
          700: "#2C475F",
          800: "#1D2F3F",
          900: "#0E171F",
        },
        secondary: {
          DEFAULT: "#F68B59", // Warm orange, playful and energetic
          50: "#FEEEE6",
          100: "#FDDCCC",
          200: "#FBB999",
          300: "#F99566",
          400: "#F68B59", // Secondary color
          500: "#F47233",
          600: "#E4520F",
          700: "#B1400C",
          800: "#7D2E08",
          900: "#491B05",
        },
        accent: {
          DEFAULT: "#76C893", // Grass green, nature and outdoors
          50: "#F0F9F3",
          100: "#E1F3E7",
          200: "#C3E7CF",
          300: "#A4DBB7",
          400: "#85CE9F",
          500: "#76C893", // Accent color
          600: "#50B775",
          700: "#3B935C",
          800: "#286240",
          900: "#153120",
        },
        warning: "#F9C74F", // Warm yellow
        error: "#F25C54", // Soft red
        success: "#43AA8B", // Teal green
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}

