/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#d4af37',
        },
        casino: {
          felt: '#0a4025',
          feltDark: '#042615',
          feltLight: '#0d5632',
          feltBorder: '#855b25',
          dark: '#080c10',
          darker: '#04070a',
          card: '#0e1622',
          cardBorder: '#1c293d',
          accent: '#eab308',
          ruby: '#dc2626',
        }
      },
      backgroundImage: {
        'table-gradient': 'radial-gradient(circle at center, #115732 0%, #08331d 55%, #041f11 100%)',
        'poker-radial': 'radial-gradient(ellipse at 50% 50%, #0c4a2a 0%, #062b18 60%, #03170d 100%)',
        'gold-shimmer': 'linear-gradient(135deg, #fce07e 0%, #d4af37 50%, #aa841c 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
};
