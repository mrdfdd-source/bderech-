/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#F5A623',
          light: '#FFD166',
          dark: '#C47D0E'
        },
        dark: {
          DEFAULT: '#0f0f0f',
          card: '#1a1a1a',
          border: '#2a2a2a'
        }
      },
      fontFamily: {
        hebrew: ['Assistant', 'Heebo', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'dots': 'dots 1.5s steps(4, end) infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 4px #F5A623)' },
          '100%': { filter: 'drop-shadow(0 0 16px #F5A623) drop-shadow(0 0 32px #F5A623)' }
        },
        dots: {
          '0%, 20%': { content: '""' },
          '40%': { content: '"."' },
          '60%': { content: '".."' },
          '80%, 100%': { content: '"..."' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: []
};
