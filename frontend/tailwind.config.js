/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Farm Green
        'primary': {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#2E7D32', // Primary brand color - Farm Green
          600: '#1b5e20',
          700: '#144717',
          800: '#0d3010',
          900: '#081a09',
        },
        // Secondary: Light Green
        'secondary': {
          50: '#f1f8e9',
          100: '#dcedc8',
          200: '#c5e1a5',
          300: '#A5D6A7', // Secondary color - Light Green
          400: '#9ccc65',
          500: '#8bc34a',
          600: '#7cb342',
          700: '#689f38',
          800: '#558b2f',
          900: '#33691e',
        },
        // Accent: Golden Yellow
        'accent': {
          50: '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#ffee58',
          500: '#FFB300', // Accent color - Golden Yellow
          600: '#ffa000',
          700: '#ff8f00',
          800: '#ff6f00',
          900: '#e65100',
        },
        // Background: Beige / Soil tone
        'cream': {
          50: '#fafaf0',
          100: '#F5F5DC', // Background color - Beige
          200: '#e8e8d0',
          300: '#dbdbc4',
        },
        // Text: Dark Grey
        'text': {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#bdbdbd',
          300: '#9e9e9e',
          400: '#757575',
          500: '#616161',
          600: '#424242',
          700: '#1B1B1B', // Text color - Dark Grey
          800: '#141414',
          900: '#0a0a0a',
        },
        // Legacy colors (keeping for compatibility)
        'leaf': {
          50: '#f4f7ed',
          100: '#e3ebd4',
          200: '#cdddaf',
          300: '#b5cf8a',
          400: '#9ec16b',
          500: '#6B8E23',
          600: '#5d7d1f',
          700: '#4f6c1b',
          800: '#415b17',
          900: '#334a13',
        },
        'soil': {
          50: '#f5f0eb',
          100: '#e8ddd3',
          200: '#d4c0ad',
          300: '#bfa082',
          400: '#a67f5b',
          500: '#8B5E3C',
          600: '#7a5234',
          700: '#68452c',
          800: '#563824',
          900: '#452d1d',
        },
        'sky': {
          50: '#f5f0eb',
          100: '#e8ddd3',
          200: '#d4c0ad',
          300: '#bfa082',
          400: '#a67f5b',
          500: '#8B5E3C',
          600: '#7a5234',
          700: '#68452c',
          800: '#563824',
          900: '#452d1d',
        },
        'harvest': {
          50: '#fdfbf7',
          100: '#f9f4e8',
          200: '#f5edd9',
          300: '#f0e5ca',
          400: '#f0e0b8',
          500: '#F5DEB3',
          600: '#e8d4a0',
          700: '#dbc98d',
          800: '#cebe7a',
          900: '#c1b367',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
