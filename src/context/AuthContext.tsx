
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserProfile } from '@/hooks/use-user';
import type { UserProfile } from '@/lib/db/queries';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from our DB based on the Firebase Auth user's ID
  const { data: userProfile, isLoading: isProfileLoading, refetch } = useUserProfile(firebaseUser?.uid ?? '');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // When the firebaseUser changes (login/logout), refetch the profile
  useEffect(() => {
    if (firebaseUser?.uid) {
      refetch();
    }
  }, [firebaseUser, refetch]);


  return (
    <AuthContext.Provider value={{ 
        firebaseUser, 
        userProfile: userProfile ?? null,
        isLoading: isLoading || (!!firebaseUser && isProfileLoading) 
    }}>
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
