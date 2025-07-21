
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { fetchUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/lib/db/queries';
import { userKeys } from '@/lib/query-keys';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Handles setting/clearing the session cookie and ensuring user profile exists
async function manageSessionAndProfile(user: FirebaseUser | null) {
  if (user) {
    const idToken = await user.getIdToken(true);
    // Set session cookie
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    // Ensure a user profile exists in Firestore.
    // This is a good place to handle it centrally for all auth methods.
    await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}` // Pass token for verification
        },
        body: JSON.stringify({ 
            uid: user.uid, 
            email: user.email, 
            name: user.displayName,
            phoneNumber: user.phoneNumber,
        })
    });

  } else {
    // Clear session cookie
    await fetch('/api/auth/session', {
      method: 'DELETE',
    });
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Use React Query to fetch the user profile
  const { data: userProfile, isLoading: isProfileLoading, refetch } = useQuery<UserProfile | null>({
    queryKey: userKeys.profile(firebaseUser?.uid ?? ''),
    queryFn: async () => {
        if (!firebaseUser) return null;
        const token = await firebaseUser.getIdToken();
        return await fetchUserProfile(firebaseUser.uid, token);
    },
    enabled: !!firebaseUser, // Only fetch if firebaseUser exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refetchUser = useCallback(() => {
    if(firebaseUser?.uid) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
    }
  }, [firebaseUser, queryClient]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      await manageSessionAndProfile(user);
      if (user) {
        // Invalidate and refetch immediately on auth change
        await queryClient.invalidateQueries({ queryKey: userKeys.profile(user.uid) });
      } else {
        // Clear all queries on logout
        queryClient.clear();
      }
      setAuthIsLoading(false);
    });

    return () => unsubscribe();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ 
        firebaseUser, 
        userProfile: userProfile ?? null,
        isLoading: authIsLoading || (!!firebaseUser && isProfileLoading),
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
