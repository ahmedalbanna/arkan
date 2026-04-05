

import LanguageDirectionManager from '@/components/shared/LanguageDirectionManager';
import { Header } from '@/components/shared/Header';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/infrastructure/utils/cn';
import type { Metadata, Viewport } from 'next';
import { redirect } from 'next/dist/client/components/navigation';
import localFont from 'next/font/local';
import { cookies, headers } from 'next/headers';
import './globals.css';
import { AppProviders } from '@/components/shared/AppProviders';

export const metadata: Metadata = {
  metadataBase: new URL('https://arkan.io'),
  title: {
    default: 'Arkan - Intelligent Writing & Production Suite',
    template: '%s | Arkan'
  },
  description: 'Professional grade document architecture, research synthesis, and AI-driven production protocols.',
  keywords: ['AI Writing', 'Research Synthesis', 'Document Architecture', 'Academic Tools', 'Professional Reports', 'RAG'],
  authors: [{ name: 'Arkan Intelligence' }],
  creator: 'Arkan Intelligence',
  publisher: 'Arkan Intelligence',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://arkan.io',
    siteName: 'Arkan Intelligence',
    title: 'Arkan - Intelligent Writing & Production Suite',
    description: 'Professional grade document architecture, research synthesis, and AI-driven production protocols.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Arkan Intelligence Suite',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arkan - Intelligent Writing & Production Suite',
    description: 'Professional grade document architecture, research synthesis, and AI-driven production protocols.',
    creator: '@arkan_intel',
    images: ['/images/twitter-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#2E3A9A',
}

const fontBody = localFont({
  src: [
    {
      path: '../../public/fonts/pt-sans-v18-cyrillic_cyrillic-ext_latin_latin-ext-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pt-sans-v18-cyrillic_cyrillic-ext_latin_latin-ext-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-body',
});

const fontHeadline = localFont({
  src: [
    {
      path: '../../public/fonts/poppins-v23-devanagari_latin_latin-ext-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/poppins-v23-devanagari_latin_latin-ext-600.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/poppins-v23-devanagari_latin_latin-ext-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-headline',
});

const fontAlmarai = localFont({
  src: [
    {
      path: '../../public/fonts/almarai-v19-arabic_latin-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/almarai-v19-arabic_latin-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-almarai',
});

const fontCairo = localFont({
  src: [
    {
      path: '../../public/fonts/cairo-v30-arabic_latin_latin-ext-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/cairo-v30-arabic_latin_latin-ext-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-cairo',
});

// List of public paths that do not require authentication
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/docs', '/request', '/phone-auth'];
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/phone-auth'];

// This function runs on the server for every request
async function handleAuthRedirects(pathname: string) {
  const cookieStoreInstance = await cookies();
  const sessionCookie = cookieStoreInstance.get('__session')?.value;
  const guestCookie = cookieStoreInstance.get('__guest')?.value;
  
  const isAuthenticated = !!sessionCookie;
  const isGuest = !!guestCookie;

  // If user is authenticated and tries to access an auth page, redirect them
  if (isAuthenticated && AUTH_PATHS.includes(pathname)) {
    redirect('/builder');
  }

  // If user is not authenticated and not a guest, and tries to access a protected page, redirect them to login
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === '/';
  if (!isAuthenticated && !isGuest && !isPublic) {
    redirect('/login');
  }
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // We need to get the current path to check if it's protected
  const headersList = headers();
  const pathname = (await headersList).get('x-next-pathname') || '/';

  // Run the server-side authentication check and redirects
  await handleAuthRedirects(pathname);

  return (
    <html lang="en" dir="ltr" className={cn(fontBody.variable, fontHeadline.variable, fontAlmarai.variable, fontCairo.variable, "scroll-smooth")} suppressHydrationWarning>
      <body className={cn('font-body antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/10')}>
        <AppProviders>
            <LanguageDirectionManager>
              {/* Immersive Global Environment Layer */}
              <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.05), transparent 50%)' }} />
              </div>

              <div className="relative z-10 flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow animate-in fade-in duration-700">
                    {children}
                </main>
                <Toaster />
              </div>
            </LanguageDirectionManager>
        </AppProviders>
      </body>
    </html>
  );
}
