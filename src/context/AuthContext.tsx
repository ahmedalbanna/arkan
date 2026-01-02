
'use client';

import { auth } from '@/lib/firebase/client-init';
import { userKeys } from '@/lib/query-keys';
import { User, type UserProfile } from '@/lib/models';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { fetchUserProfileApi, subscribeToUserProfile } from '@/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useBuilderStore } from '@/hooks';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Handles setting/clearing the session cookie.
async function manageSession(user: FirebaseUser | null) {
  if (user) {
    const idToken = await user.getIdToken(true);
    // Set session cookie
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } else {
    // Clear session cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { setUserProfile } = useBuilderStore(); // Get setter from builder store

  useEffect(() => {
    if (firebaseUser?.uid) {
      const unsubscribe = subscribeToUserProfile(firebaseUser.uid, (user) => {
        const userInstance = user ? new User(user) : null;
        queryClient.setQueryData(userKeys.profile(firebaseUser.uid), userInstance);
        setUserProfile(userInstance); // Update builder store
      });
      return () => unsubscribe();
    } else {
      setUserProfile(null); // Clear on logout
    }
  }, [firebaseUser, queryClient, setUserProfile]);

  // Use React Query to get the user profile from the cache
  const { data: userProfile, isLoading: isProfileLoading } = useQuery<User | null>({
    queryKey: userKeys.profile(firebaseUser?.uid ?? ''),
    queryFn: async () => {
      if (!firebaseUser) return null;
      const token = await getAuthenticatedToken(firebaseUser);
      const userProfileData = await fetchUserProfileApi(firebaseUser.uid, token);
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
      await manageSession(user);
      if (user) {
        // Invalidate and refetch immediately on auth change
        await queryClient.invalidateQueries({ queryKey: userKeys.profile(user.uid) });
      } else {
        // Clear all queries on logout
        queryClient.clear();
        setUserProfile(null); // Clear builder store on logout
      }
      setAuthIsLoading(false);
    });

    return () => unsubscribe();
  }, [queryClient, setUserProfile]);

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

export type { FirebaseUser };
