
'use client';

import type { UserProfile } from '@/lib/db/queries';
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

// For the prototype, we'll hardcode the user ID
const HARDCODED_USER_ID = 'user-1';

interface AuthContextType {
  user: Omit<UserProfile, 'credits'> | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Omit<UserProfile, 'credits'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${HARDCODED_USER_ID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const userProfile: UserProfile = await response.json();
      const { credits, ...userWithoutCredits } = userProfile;
      setUser(userWithoutCredits);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, fetchUser }}>
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
