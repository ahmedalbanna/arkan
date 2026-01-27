'use client';

import { useBuilderStore } from '@/hooks';
import { User } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';
import type { FirebaseUser } from '@/lib/utils/authUtils';
import { useSessionQuery, useUserProfileQuery, useRefetchUserProfile } from '@/hooks/auth/use-auth-queries';
import { useAuthStore } from '@/hooks/core/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { createContext, ReactNode, useCallback, useContext, useEffect } from 'react';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isGuest: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Note: Session management is handled by API routes (/api/auth/session and /api/auth/logout)
// Session cookies are set via API responses, not client-side
// Auth state is now managed by Zustand store + React Query hooks

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { setUserProfile: setBuilderProfile } = useBuilderStore();
  const { 
    firebaseUser, 
    userProfile, 
    isLoading, 
    isGuest,
    isProfileLoading,
    setFirebaseUser,
  } = useAuthStore();

  // Validate session and restore auth on mount
  const sessionQuery = useSessionQuery();

  // Extract uid from store for profile query
  const sessionData = sessionQuery.data;
  const uid = sessionData?.authenticated ? sessionData.uid : firebaseUser?.uid;

  // Get the actual Firebase Auth user object (with getIdToken method)
  const firebaseAuth = getAuth();
  const firebaseAuthUser = firebaseAuth.currentUser;

  // Fetch user profile if authenticated
  const profileQuery = useUserProfileQuery(uid || null, firebaseAuthUser);
  const refetchUserProfile = useRefetchUserProfile(uid || null);

  // Update store when session is validated
  useEffect(() => {
    if (sessionData?.authenticated && sessionData.uid) {
      const firebaseUserObj: FirebaseUser = {
        uid: sessionData.uid,
        email: sessionData.email || null,
        displayName: null,
        emailVerified: false,
        isAnonymous: false,
      };
      setFirebaseUser(firebaseUserObj);
    }
  }, [sessionData, setFirebaseUser]);

  // Sync profile to builder store
  useEffect(() => {
    if (userProfile) {
      setBuilderProfile(userProfile);
    } else if (!firebaseUser) {
      setBuilderProfile(null);
    }
  }, [userProfile, firebaseUser, setBuilderProfile]);

  const refetchUser = useCallback(() => {
    refetchUserProfile();
  }, [refetchUserProfile]);

  const value = {
    firebaseUser,
    userProfile: userProfile ?? null,
    isLoading: isLoading || isProfileLoading,
    isGuest,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
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

