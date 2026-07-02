import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        lang: {
          red: '#A61919',
          redDark: '#6F1515',
          redDeep: '#3F0D0D',
          redSoft: '#FFF1F0',
          yellow: '#F6C453',
          yellowSoft: '#FFF6D8',
          green: '#22C55E',
          orange: '#F97316',
          cream: '#F5F7FA',
          cream2: '#FFFFFF',
          mist: '#EEF2F7',
          paper: '#FFFFFF',
          brown: '#1E293B',
          ink: '#172033',
          muted: '#64748B',
          line: '#D8E0EA'
        }
      },
      boxShadow: {
        soft: '0 8px 22px rgba(15, 23, 42, 0.06)',
        card: '0 18px 42px rgba(15, 23, 42, 0.10)',
        glow: '0 16px 32px rgba(166, 25, 25, 0.16)'
      }
    }
  },
  plugins: []
};

export default config;
