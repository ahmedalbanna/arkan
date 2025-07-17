
'use client';

import type { UserProfile } from '@/lib/db/queries';
import React, { createContext, useContext, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from '@/hooks/use-user'; // Import the new custom hook
import { userKeys } from '@/lib/query-keys';

// For the prototype, we'll hardcode the user ID
const HARDCODED_USER_ID = 'user-1';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  
  // Use the custom hook to fetch user data
  const { data: user, isLoading } = useUserProfile(HARDCODED_USER_ID);
  
  const refetchUser = () => {
    // Invalidate the user query to trigger a refetch
    // Use the key factory for consistency
    queryClient.invalidateQueries({ queryKey: userKeys.profile(HARDCODED_USER_ID) });
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
