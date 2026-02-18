'use client';

import { SessionProvider } from 'next-auth/react';
import QueryProvider from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { NextAuthProvider } from '@/context/NextAuthContext';
import { LocalizationProvider } from '@/context/LocalizationContext';
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
              <LanguageDirectionManager>
                <div className={fontClassName}>
                  {children}
                  <Toaster />
                </div>
              </LanguageDirectionManager>
            </NextAuthProvider>
          </LocalizationProvider>
        </SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
