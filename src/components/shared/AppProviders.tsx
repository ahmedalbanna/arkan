'use client';

import { AuthProvider } from '@/context/AuthContext';
import { LocalizationProvider } from '@/context/LocalizationContext';
import { initializeFirebase } from '@/firebase';
import FirebaseMessagingProvider from '@/firebase/FirebaseMessagingProvider';
import { FirebaseProvider } from '@/firebase/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const { firebaseApp, firestore, auth } = initializeFirebase();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <LocalizationProvider>
          <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
            <AuthProvider>
              <FirebaseMessagingProvider>
                {children}
              </FirebaseMessagingProvider>
            </AuthProvider>
          </FirebaseProvider>
        </LocalizationProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
