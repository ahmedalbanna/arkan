

import FirebaseMessagingProvider from '@/components/firebase/FirebaseMessagingProvider';
import LanguageDirectionManager from '@/components/shared/LanguageDirectionManager';
import { Header } from '@/components/shared/Header';
import QueryProvider from '@/components/shared/QueryProvider';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { LocalizationProvider } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils/cn';
import type { Metadata } from 'next';
import { redirect } from 'next/dist/client/components/navigation';
import localFont from 'next/font/local';
import { cookies, headers } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arkan - Professional Portfolio Platform',
  description: 'Showcase your work, discover talent, and interact with a community of professionals.',
};

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
  const cookieStoreInstance = cookies();
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
    <html lang="en" dir="ltr" className={cn(fontBody.variable, fontHeadline.variable, fontAlmarai.variable, fontCairo.variable)} suppressHydrationWarning>
      <body className={cn('font-body antialiased min-h-screen  flex flex-col')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <LocalizationProvider>
              <AuthProvider>
                <FirebaseMessagingProvider>
                  <LanguageDirectionManager>
                    <Header />
                    <main className="flex-grow">{children}</main>
                    <Toaster />
                  </LanguageDirectionManager>
                </FirebaseMessagingProvider>
              </AuthProvider>
            </LocalizationProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
