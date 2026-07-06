import '@/styles/globals.css';
import '@/styles/final-overrides.css';
import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { AppShell } from '@/components/layout/AppShell';

const appFont = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-app'
});

export const metadata: Metadata = {
  title: 'Cơm Tấm Làng — ERP Mini Kế Toán',
  description: 'ERP mini báo cáo kế toán quản trị cho Cơm Tấm Làng',
  icons: {
    icon: '/icon.svg'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={appFont.variable}>
      <body className={appFont.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
