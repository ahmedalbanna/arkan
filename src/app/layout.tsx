

import type { Metadata } from 'next';
import { Poppins, PT_Sans, Cairo, Almarai } from 'next/font/google';
import './globals.css';
import '@/css/fonts.css';
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
import { redirect } from 'next/navigation';
import { getAdminAuth } from '@/lib/firebase/admin';
import { NextResponse } from 'next/server'; // Assuming you're using NextResponse
import SupportChatWidget from '@/components/chat/SupportChatWidget';

export const metadata: Metadata = {
  title: 'Arkan - Professional Portfolio Platform',
  description: 'Showcase your work, discover talent, and interact with a community of professionals.',
};

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
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
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/design'];

// This function runs on the server for every request
async function checkAuth(pathname: string, sessionCookieValue: string | undefined) {
  // If the path is public, do nothing
  if (PUBLIC_PATHS.includes(pathname) || pathname === '/') {
    return;
  }

  // If the path is protected, check for a valid session
  if (!sessionCookieValue) {
    redirect('/login'); // Redirect if no session cookie
  }

  try {
    const adminAuth = await getAdminAuth();
    // Verify the cookie is valid
    await adminAuth.verifySessionCookie(sessionCookieValue, true);
  } catch (error) {
    // If verification fails, redirect to login
    console.warn('Session cookie verification failed, redirecting to login.');
    redirect('/login');
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // We need to get the current path to check if it's protected
  const headersList = await headers();
  const pathname = headersList.get('x-next-pathname') || '/';

  // Get the session cookie value here, at the top level
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;


  // Run the server-side authentication check for protected routes
  await checkAuth(pathname, sessionCookie);

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
                <LanguageDirectionManager>
                  <Header />
                  <main className="flex-grow">{children}</main>
                  <SupportChatWidget />
                  <Toaster />
                </LanguageDirectionManager>
              </AuthProvider>
            </LocalizationProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
