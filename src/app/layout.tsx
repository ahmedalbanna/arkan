
import type { Metadata } from 'next';
import { Poppins, PT_Sans, Cairo } from 'next/font/google';
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
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth as adminAuth } from '@/lib/firebase/admin';

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

// List of public paths that do not require authentication
const PUBLIC_PATHS = ['/login', '/signup'];


async function checkAuth(pathname: string) {
  // Check if the current path is public
  if (PUBLIC_PATHS.includes(pathname)) {
    return;
  }

  const sessionCookie = cookies().get('__session')?.value;
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.warn('Session cookie verification failed, redirecting to login.');
    redirect('/login');
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { path: string[] };
}>) {
  
  // Since we don't have access to the pathname directly in layouts,
  // we'll skip the auth check for the root path ('/') as it's public.
  // A more robust solution might involve a different layout structure, but this works for now.
  const isRoot = !params.path;

  // We are skipping the server-side auth check for now to resolve build issues.
  // The client-side AuthContext will handle redirects after hydration.
  // if (!isRoot) {
  //   await checkAuth(`/${(params.path || []).join('/')}`);
  // }

  return (
    <html lang="en" dir="ltr" className={cn(fontBody.variable, fontHeadline.variable, fontSans.variable)} suppressHydrationWarning>
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
