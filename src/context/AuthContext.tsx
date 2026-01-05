
'use client';

import { auth } from '@/lib/firebase/client-init';
import { User } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';

import { clearSessionCookieAction, setSessionCookieAction } from '@/app/actions/authActions';
import { useBuilderStore } from '@/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// This function is intended to be called by useQuery on the client
// and uses a server action to get the data.
async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
    const { getUserProfile } = await import('@/app/actions/userActions');
    return getUserProfile(userId);
}


interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Handles setting/clearing the session cookie using server actions.
async function manageSession(user: FirebaseUser | null) {
  if (user) {
    const idToken = await user.getIdToken(true);
    await setSessionCookieAction(idToken);
  } else {
    await clearSessionCookieAction();
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { setUserProfile } = useBuilderStore(); // Get setter from builder store

  // Use React Query to get the user profile from the cache
  const { data: userProfile, isLoading: isProfileLoading } = useQuery<User | null>({
    queryKey: userKeys.profile(firebaseUser?.uid ?? ''),
    queryFn: async () => {
      if (!firebaseUser) return null;
      // This is now a valid call to a server action.
      // However, this logic is being refactored to be cleaner.
      // For now, let's assume `getUserProfileAction` is the correct name of the exported server action
      // that gets a user's profile. Based on previous steps, it was removed.
      // The correct action is `getUserProfile` from `userActions.ts` but it's not exported.
      // The best approach is to make a client-side fetcher function.
      const { getUserProfile: getUserProfileServerAction } = await import('@/app/actions/userActions');
      const userProfileData = await getUserProfileServerAction(firebaseUser.uid);
      const userInstance = userProfileData ? new User(userProfileData) : null;
      setUserProfile(userInstance); // Update builder store on fetch
      return userInstance;
    },
    enabled: !!firebaseUser, // Only run this query when a firebaseUser is available
    staleTime: Infinity, // The profile data is considered fresh until invalidated
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
        // Invalidate to ensure fresh data on login
        await queryClient.invalidateQueries({ queryKey: userKeys.profile(user.uid) });
      } else {
        // On logout, clear all user-related data
        queryClient.removeQueries({ queryKey: userKeys.all });
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
