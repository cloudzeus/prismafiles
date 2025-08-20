/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: 1 },
          "70%": { opacity: 1 },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: 0,
          },
        },
      },
      fontSize: {
        'xs': ['0.7265rem', { lineHeight: '1rem' }], // 11px
        'sm': ['0.8025rem', { lineHeight: '1.25rem' }], // 13px
        'base': ['var(--font-size-base)', { lineHeight: '1.25rem' }], // 11px (default)
        'lg': ['0.825rem', { lineHeight: '1.5rem' }], // 14px
        'xl': ['1rem', { lineHeight: '1.75rem' }], // 16px
        '2xl': ['1.025rem', { lineHeight: '1.75rem' }], // 18px
        '3xl': ['1.15rem', { lineHeight: '2rem' }], // 20px
        '4xl': ['1.3rem', { lineHeight: '2rem' }], // 24px
        '5xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '6xl': ['3rem', { lineHeight: '1' }], // 48px
        '7xl': ['3.75rem', { lineHeight: '1' }], // 60px
        '8xl': ['4.5rem', { lineHeight: '1' }], // 72px
        '9xl': ['6rem', { lineHeight: '1' }], // 96px
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "meteor": "meteor 5s linear infinite",
      },
    },
  },
  plugins: [],
}
