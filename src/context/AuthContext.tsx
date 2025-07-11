
'use client';

import { getUserProfile, type UserProfile } from '@/lib/db/queries';
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

// For the prototype, we'll hardcode the user ID
const HARDCODED_USER_ID = 'user-1';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  deductCredits: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const userProfile = await getUserProfile(HARDCODED_USER_ID);
      setUser(userProfile);
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

  const deductCredits = (amount: number) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      return {
        ...currentUser,
        credits: Math.max(0, currentUser.credits - amount),
      };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, deductCredits }}>
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
