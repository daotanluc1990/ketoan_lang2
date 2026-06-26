import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        lang: {
          red: '#8B1E1E',
          redDark: '#641515',
          redDeep: '#4B1010',
          yellow: '#F6C453',
          yellowSoft: '#FFE7A3',
          cream: '#F8F3E7',
          cream2: '#FFF9EA',
          paper: '#FFFCF4',
          brown: '#2B1C16',
          ink: '#1F1B16',
          muted: '#7A675C',
          line: '#E9DDC9'
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem'
      },
      boxShadow: {
        soft: '0 18px 40px rgba(45, 28, 22, 0.08)',
        card: '0 16px 42px rgba(75, 16, 16, 0.08)',
        glow: '0 18px 50px rgba(139, 30, 30, 0.16)'
      },
      backgroundImage: {
        'brand-radial': 'radial-gradient(circle at top left, rgba(246,196,83,0.32), transparent 34%), radial-gradient(circle at top right, rgba(139,30,30,0.10), transparent 28%)'
      }
    }
  },
  plugins: []
};

export default config;
