'use client';

import { userKeys } from '@/lib/query-keys';
import { manageSession } from '@/lib/utils/session-management';
import { hasGuestCookie, clearGuestCookie } from '@/lib/utils/cookie-management';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';
import { User } from '@/modules/users/domain/entities/User';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useBuilderStore } from '@/hooks';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase/provider';
import { runAuthenticatedResultCall } from '@/hooks/data/authenticated-client-call';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isGuest: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const queryClient = useQueryClient();
  const { setUserProfile } = useBuilderStore();
  const firestore = useFirestore();

  useEffect(() => {
    if (firebaseUser?.uid && firestore) {
      const client = container.resolve(UserApiClient);
      const unsubscribe = client.subscribeToUserProfile(firebaseUser.uid, firestore, (user) => {
        const userInstance = user ? new User(user) : null;
        queryClient.setQueryData(userKeys.profile(firebaseUser.uid), userInstance);
        setUserProfile(userInstance);
      });

      return () => unsubscribe();
    }

    if (!firebaseUser) {
      setUserProfile(null);
    }
  }, [firebaseUser, queryClient, setUserProfile, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useQuery<User | null>({
    queryKey: userKeys.profile(firebaseUser?.uid ?? ''),
    queryFn: async () => {
      if (!firebaseUser) {
        return null;
      }

      const userProfileData = await runAuthenticatedResultCall(firebaseUser, UserApiClient, (client, token) =>
        client.fetchUserById(firebaseUser.uid, token),
      );
      const userInstance = userProfileData ? new User(userProfileData) : null;
      setUserProfile(userInstance);
      return userInstance;
    },
    enabled: Boolean(firebaseUser),
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
      await manageSession(user as never);

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
  }, [auth, queryClient, setUserProfile]);

  const value = {
    firebaseUser,
    userProfile: userProfile ?? null,
    isLoading: authIsLoading || (Boolean(firebaseUser) && isProfileLoading),
    isGuest,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { FirebaseUser };
