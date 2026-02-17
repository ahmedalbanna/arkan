'use client';

import { User } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';
import { fetchUserProfileApi } from '@/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { createContext, ReactNode, useCallback, useContext, useEffect } from 'react';
import { useBuilderStore } from '@/hooks';

interface AuthContextType {
  firebaseUser: { uid: string; email: string | null } | null;
  userProfile: User | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const NextAuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const { setUserProfile } = useBuilderStore();

  // Map NextAuth session to Firebase-like user object for compatibility
  const firebaseUser = session?.user ? {
    uid: session.user.id,
    email: session.user.email,
  } : null;

  // Use React Query to get the user profile
  const { data: userProfile, isLoading: isProfileLoading } = useQuery<User | null>({
    queryKey: userKeys.profile(firebaseUser?.uid ?? ''),
    queryFn: async () => {
      if (!firebaseUser || !session) return null;
      
      // Use NextAuth session token instead of Firebase token
      const token = session.user.id; // Or use JWT token if needed
      const userProfileData = await fetchUserProfileApi(firebaseUser.uid, token);
      const userInstance = userProfileData ? new User(userProfileData) : null;
      setUserProfile(userInstance);
      return userInstance;
    },
    enabled: !!firebaseUser && !!session,
    staleTime: Infinity,
  });

  const refetchUser = useCallback(() => {
    if (firebaseUser?.uid) {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(firebaseUser.uid) });
    }
  }, [firebaseUser, queryClient]);

  // Update builder store when user profile changes
  useEffect(() => {
    setUserProfile(userProfile ?? null);
  }, [userProfile, setUserProfile]);

  // Clear queries on logout
  useEffect(() => {
    if (!session) {
      queryClient.clear();
      setUserProfile(null);
    }
  }, [session, queryClient, setUserProfile]);

  const isLoading = status === 'loading' || (!!firebaseUser && isProfileLoading);

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      userProfile: userProfile ?? null,
      isLoading,
      refetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a NextAuthProvider');
  }
  return context;
};
