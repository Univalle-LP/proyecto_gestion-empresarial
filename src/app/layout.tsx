import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppLayoutClient from '@/components/AppLayoutClient';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "Victorino's Pizzería",
  description: 'Sistema de gestión y pedidos de Victorinos Pizzería',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable}`}>
      <body className="antialiased font-sans">
        <AuthProvider>
          <AppLayoutClient>{children}</AppLayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}
