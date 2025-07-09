import type { Metadata } from 'next';
import { Poppins, PT_Sans, Cairo } from 'next/font/google';
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

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-headline',
});

const fontSans = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={cn(fontBody.variable, fontHeadline.variable, fontSans.variable)}>
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
