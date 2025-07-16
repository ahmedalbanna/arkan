
'use client';

import type { UserProfile } from '@/lib/db/queries';
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// For the prototype, we'll hardcode the user ID
const HARDCODED_USER_ID = 'user-1';

// This function will be our reusable query function
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
};

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', HARDCODED_USER_ID],
    queryFn: () => fetchUserProfile(HARDCODED_USER_ID),
    staleTime: 1000 * 60 * 5, // Cache user data for 5 minutes
  });
  
  const refetchUser = () => {
    // Invalidate the user query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['user', HARDCODED_USER_ID] });
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
