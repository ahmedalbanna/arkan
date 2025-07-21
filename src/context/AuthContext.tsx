
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserProfile } from '@/hooks/use-user';
import type { UserProfile } from '@/lib/db/queries';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Handles setting/clearing the session cookie via our API route
async function manageSessionCookie(user: FirebaseUser | null) {
  if (user) {
    const idToken = await user.getIdToken(true);
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    // On Google sign-in, ensure a user profile exists in Firestore.
    // This is a good place to handle it centrally.
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}` // Pass token for verification
        },
        body: JSON.stringify({ 
            uid: user.uid, 
            email: user.email, 
            name: user.displayName 
        })
    });
    if (!response.ok) {
        console.error("Failed to create or verify user profile on Google sign-in.");
    }

  } else {
    await fetch('/api/auth/session', {
      method: 'DELETE',
    });
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: userProfileData, isLoading: isProfileLoading, refetch } = useUserProfile(firebaseUser?.uid ?? '');

  const userProfile = userProfileData ?? null;

  const refetchUser = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      await manageSessionCookie(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (firebaseUser?.uid) {
      refetchUser();
    }
  }, [firebaseUser, refetchUser]);


  return (
    <AuthContext.Provider value={{ 
        firebaseUser, 
        userProfile,
        isLoading: isLoading || (!!firebaseUser && isProfileLoading),
        refetchUser
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
