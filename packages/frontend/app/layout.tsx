import './globals.css';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { NavBar } from '@/components/organisms/NavBar';
import { ToastContainer } from '@/components/ui/toast';
import { Inter } from 'next/font/google';

export const dynamic = 'force-dynamic';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'CityHub — Civic Engagement Platform',
    template: '%s | CityHub',
  },
  description: 'A platform for civic engagement and community proposals. Submit ideas, vote on issues, and collaborate with local leaders.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body>
        <Providers>
          <NavBar />
          <main style={{ minHeight: 'calc(100vh - 64px)' }}>
            {children}
          </main>
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}