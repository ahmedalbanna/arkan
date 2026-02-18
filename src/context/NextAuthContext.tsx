'use client';

import { User } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';
import { fetchUserProfileApi } from '@/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { createContext, ReactNode, useCallback, useContext, useEffect } from 'react';
import { useBuilderStore } from '@/hooks';

interface AuthContextType {
  userProfile: User | null;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const NextAuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const { setUserProfile } = useBuilderStore();

  const userId = session?.user?.id;

  // Use React Query to get the user profile
  const { data: userProfile, isLoading: isProfileLoading } = useQuery<User | null>({
    queryKey: userKeys.profile(userId ?? ''),
    queryFn: async () => {
      if (!userId || !session) return null;
      
      // Use NextAuth session user ID as token
      const token = session.user.id;
      const userProfileData = await fetchUserProfileApi(userId, token);
      
      // Map API response fields to User model fields
      if (userProfileData) {
        const mappedData = {
          id: userProfileData.id,
          name: userProfileData.name || '',
          email: userProfileData.email || '',
          
          // Map Prisma role enum (USER/ADMIN/SUPER_ADMIN) to User model role type (user/admin)
          role: (userProfileData.role === 'admin' || userProfileData.role === 'user' ? 'admin' : 'user') as 'admin' | 'user',
          credits: userProfileData.credits || 0,
          createdAt: userProfileData.createdAt?.toString() || new Date().toISOString(),
          updatedAt: userProfileData.updatedAt?.toString() || new Date().toISOString(),
          hasCompletedOnboarding: true, // Default for existing users
        };
        const userInstance = new User(mappedData);
        setUserProfile(userInstance);
        return userInstance;
      }
      
      return null;
    },
    enabled: !!userId && !!session,
    staleTime: Infinity,
  });

  const refetchUser = useCallback(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) });
    }
  }, [userId, queryClient]);

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

  const isLoading = status === 'loading' || (!!userId && isProfileLoading);

  return (
    <AuthContext.Provider value={{
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
