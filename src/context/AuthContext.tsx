'use client';

import { userKeys } from '@/lib/query-keys';
import { User } from '@/lib/types';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { manageSession } from '@/lib/utils/session-management';
import { hasGuestCookie, clearGuestCookie } from '@/lib/utils/cookie-management';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useBuilderStore } from '@/hooks';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase/provider'; // Aliased to avoid naming conflict

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isGuest: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth(); // Consume auth from FirebaseProvider
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const queryClient = useQueryClient();
  const { setUserProfile } = useBuilderStore(); // Get setter from builder store

  const firestore = useFirestore();

  useEffect(() => {
    if (firebaseUser?.uid && firestore) {
      const client = container.resolve(UserApiClient);
      const unsubscribe = client.subscribeToUserProfile(firebaseUser.uid, firestore, (user) => {
        const userInstance = user ? new User(user) : null;
        queryClient.setQueryData(userKeys.profile(firebaseUser.uid), userInstance);
        setUserProfile(userInstance); // Update builder store
      });
      return () => unsubscribe();
    } else if (!firebaseUser) {
      setUserProfile(null); // Clear on logout
    }
  }, [firebaseUser, queryClient, setUserProfile, firestore]);

  // Use React Query to get the user profile from the cache
  const { data: userProfile, isLoading: isProfileLoading } = useQuery<User | null>({
    queryKey: userKeys.profile(firebaseUser?.uid ?? ''),
    queryFn: async () => {
      if (!firebaseUser) return null;
      const token = await getAuthenticatedToken(firebaseUser);
      const client = container.resolve(UserApiClient);
      const userProfileData = await client.fetchUserById(firebaseUser.uid, token);
      const userInstance = userProfileData ? new User(userProfileData) : null;
      setUserProfile(userInstance); // Update builder store on fetch
      return userInstance;
    },
    enabled: !!firebaseUser,
    staleTime: Infinity,
  });

  const refetchUser = useCallback(() => {
    if (firebaseUser?.uid) {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
    }
  }, [firebaseUser, queryClient]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      await manageSession(user as any);

      const guestCookieExists = hasGuestCookie();

      if (user) {
        setIsGuest(false);
        if (guestCookieExists) {
            clearGuestCookie();
        }
        await queryClient.invalidateQueries({ queryKey: userKeys.profile(user.uid) });
      } else {
        setIsGuest(guestCookieExists);
        if (!guestCookieExists) {
            queryClient.clear();
            setUserProfile(null);
        }
      }
      setAuthIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, queryClient, setUserProfile]); // Added auth to dependency array

  const value = {
      firebaseUser,
      userProfile: userProfile ?? null,
      isLoading: authIsLoading || (!!firebaseUser && isProfileLoading),
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

export type { FirebaseUser };
