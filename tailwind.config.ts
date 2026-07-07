import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        lang: {
          // Craft Modern cool palette — token values swapped (keys preserved for 0-touch re-skin)
          red: '#3B82F6',        // blue-500 — accent / CTA / sidebar gradient start
          redDark: '#2563EB',    // blue-600 — hover / pressed
          redDeep: '#1E3A8A',    // blue-900 — sidebar gradient end (đậm nhất)
          redSoft: '#EFF6FF',    // blue-50 — background nhát cho accent (alert danger bg)
          yellow: '#F59E0B',     // amber-500 — warning accent
          yellowSoft: '#FFFBEB', // amber-50 — warning bg nhạt
          green: '#10B981',      // emerald-500 — success
          orange: '#F97316',     // orange-500 — caution
          cream: '#F0F2F5',      // nền trang — slate light (cool, không ấm)
          cream2: '#F8FAFC',     // surface phụ — slate-50
          mist: '#F1F5F9',       // highlight nhạt — slate-100
          paper: '#FFFFFF',      // card surface — white
          brown: '#334155',      // text heading phụ — slate-700
          ink: '#0F172A',        // text chính — slate-900 (contrast AAA trên white)
          muted: '#64748B',      // text phụ / hint — slate-500 (AA 4.6:1)
          line: '#E2E8F0',       // viền mặc định — slate-200
          hover: '#F8FAFC',      // hover row / button — slate-50
          zebra: '#F8FAFC',      // zebra row — slate-50
          toolbar: '#F1F5F9',    // toolbar / filter bar — slate-100
          surface: '#FFFFFF'     // alias paper
        }
      },
      boxShadow: {
        // Craft Modern 3-layer shadow — slate rgba (15,23,42), không ấm
        soft: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)',
        card: '0 4px 6px -1px rgba(15,23,42,.05), 0 2px 4px -2px rgba(15,23,42,.05)',
        glow: '0 10px 30px -5px rgba(15,23,42,.1), 0 0 0 1px rgba(15,23,42,.03)'
      },
      fontSize: {
        data: ['12.5px', { lineHeight: '1.4' }]
      }
    }
  },
  plugins: []
};

export default config;
