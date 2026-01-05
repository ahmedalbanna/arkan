
'use client';

import { auth } from '@/lib/firebase/client-init';
import { User } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useBuilderStore } from '../hooks';
import { getUserProfile } from '@/app/actions/userActions';


interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { setUserProfile } = useBuilderStore(); // Get setter from builder store

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(user.uid) });
      } else {
        queryClient.removeQueries({ queryKey: userKeys.all });
        setUserProfile(null);
      }
      setAuthIsLoading(false);
    });

    return () => unsubscribe();
  }, [queryClient, setUserProfile]);

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: userKeys.profile(firebaseUser?.uid ?? ''),
    queryFn: async () => {
      if (!firebaseUser) return null;
      const userProfileData = await getUserProfile(firebaseUser.uid);
      const userInstance = userProfileData ? new User(userProfileData) : null;
      setUserProfile(userInstance);
      return userInstance;
    },
    enabled: !!firebaseUser && !authIsLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refetchUser = useCallback(() => {
    if (firebaseUser?.uid) {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
    }
  }, [firebaseUser, queryClient]);

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
