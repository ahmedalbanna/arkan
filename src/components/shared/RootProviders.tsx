'use client';

import { SessionProvider } from 'next-auth/react';
import QueryProvider from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { NextAuthProvider } from '@/context/NextAuthContext';
import { LocalizationProvider } from '@/context/LocalizationContext';
import FirebaseMessagingProvider from '@/components/firebase/FirebaseMessagingProvider';
import LanguageDirectionManager from './LanguageDirectionManager';
import { Toaster } from '@/components/ui/toaster';

interface RootProvidersProps {
  children: React.ReactNode;
  fontClassName: string;
}

export function RootProviders({ children, fontClassName }: RootProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <SessionProvider>
          <LocalizationProvider>
            <NextAuthProvider>
              <AuthProvider>
                <FirebaseMessagingProvider>
                  <LanguageDirectionManager>
                    <div className={fontClassName}>
                      {children}
                      <Toaster />
                    </div>
                  </LanguageDirectionManager>
                </FirebaseMessagingProvider>
              </AuthProvider>
            </NextAuthProvider>
          </LocalizationProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
