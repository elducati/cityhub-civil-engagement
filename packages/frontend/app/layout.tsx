import './globals.css';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { NavBar } from '@/components/organisms/NavBar';

export const metadata = {
  title: 'Civic Engagement Platform',
  description: 'A platform for civic engagement and community proposals',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main style={{ minHeight: 'calc(100vh - 64px)' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}