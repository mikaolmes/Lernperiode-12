import type { Metadata } from 'next';
import './globals.css';
import NavBar from './NavBar';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Mein Blog',
  description: 'Mini-Blog-Plattform für LP-12',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="bg-slate-50 min-h-screen text-slate-900">
        <NavBar />
        <main className="container mx-auto p-4">
          {children}
        </main>
        {/* Toaster*/}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}