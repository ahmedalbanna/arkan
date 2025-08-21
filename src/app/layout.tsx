

import type { Metadata } from 'next';
import { Poppins, PT_Sans, Cairo, Almarai } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { LocalizationProvider } from '@/context/LocalizationContext';
import LanguageDirectionManager from '@/components/LanguageDirectionManager';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { Footer } from '@/components/layout/Footer';
import QueryProvider from '@/components/QueryProvider';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/dist/client/components/navigation';
import { adminAuth } from '@/lib/firebase/admin';
import SupportChatWidget from '@/components/chat/SupportChatWidget';
import FirebaseMessagingProvider from '@/components/FirebaseMessagingProvider';

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

const fontAlmarai = Almarai({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-almarai',
});

const fontCairo = Cairo({
    subsets: ['arabic'],
    weight: ['400', '700'],
    variable: '--font-cairo'
})

// List of public paths that do not require authentication
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/design', '/docs', '/request'];
const AUTH_PATHS = ['/login', '/signup', '/forgot-password'];

// This function runs on the server for every request
async function handleAuthRedirects(pathname: string) {
  const sessionCookie = (await cookies()).get('__session')?.value;

  let isAuthenticated = false;
  if(sessionCookie) {
    try {
        await adminAuth.verifySessionCookie(sessionCookie, true);
        isAuthenticated = true;
    } catch (error) {
       // Ignore verification errors, treat as not authenticated
       isAuthenticated = false;
    }
  }

  // If user is authenticated and tries to access an auth page, redirect them
  if (isAuthenticated && AUTH_PATHS.includes(pathname)) {
    redirect('/generate');
  }

  // If user is not authenticated and tries to access a protected page, redirect them
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === '/';
  if (!isAuthenticated && !isPublic) {
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
                    <SupportChatWidget />
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
