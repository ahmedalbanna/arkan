import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { LocalizationProvider } from '@/context/LocalizationContext';
import LanguageDirectionManager from '@/components/LanguageDirectionManager';

export const metadata: Metadata = {
  title: 'Arkan - Professional Portfolio Platform',
  description: 'Showcase your work, discover talent, and interact with a community of professionals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&family=Cairo:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col')}>
        <LocalizationProvider>
          <LanguageDirectionManager>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </LanguageDirectionManager>
        </LocalizationProvider>
      </body>
    </html>
  );
}
