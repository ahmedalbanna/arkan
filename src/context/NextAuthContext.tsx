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
  
  console.log('[NextAuthContext] Session status:', status);
  if (session) {
    console.log('[NextAuthContext] Session data:', {
      userId: session.user?.id,
      email: session.user?.email,
      name: session.user?.name,
      role: session.user?.role,
      credits: session.user?.credits,
      hasHasuraToken: !!session.hasuraToken
    });
  }

  // Use React Query to get the user profile
  const { data: userProfile, isLoading: isProfileLoading } = useQuery<User | null>({
    queryKey: userId ? userKeys.profile(userId) : ['users', 'detail', 'pending'],
    queryFn: async () => {
      console.log('[NextAuthContext Query] queryFn executing for userId:', userId);
      
      if (!userId || !session) {
        console.warn('[NextAuthContext Query] Returning null - userId or session missing', {
          hasUserId: !!userId,
          hasSession: !!session
        });
        return null;
      }
      
      // Use NextAuth session user ID as token
      const token = session.user.id;
      console.log('[NextAuthContext Query] Calling fetchUserProfileApi with:', {
        userId,
        token,
        sessionExists: !!session
      });
      
      const userProfileData = await fetchUserProfileApi(userId, token);
      
      console.log('[NextAuthContext Query] fetchUserProfileApi response:', userProfileData);
      
      // Map API response fields to User model fields
      if (userProfileData) {
        console.log('[NextAuthContext Query] Mapping user profile data to User model');
        const mappedData = {
          id: userProfileData.id,
          name: userProfileData.name || '',
          email: userProfileData.email || '',
          
          // Map Prisma role enum (USER/ADMIN/SUPER_ADMIN) to User model role type (user/admin)
          role: (userProfileData.role === 'ADMIN' || userProfileData.role === 'SUPER_ADMIN' ? 'admin' : 'user') as 'admin' | 'user',
          credits: userProfileData.credits || 0,
          createdAt: userProfileData.createdAt?.toString() || new Date().toISOString(),
          updatedAt: userProfileData.updatedAt?.toString() || new Date().toISOString(),
          hasCompletedOnboarding: true, // Default for existing users
        };
        
        console.log('[NextAuthContext Query] Mapped data:', mappedData);
        
        const userInstance = new User(mappedData);
        console.log('[NextAuthContext Query] User instance created:', {
          id: userInstance.id,
          email: userInstance.email,
          role: userInstance.role,
          credits: userInstance.credits
        });
        
        setUserProfile(userInstance);
        console.log('[NextAuthContext Query] Builder store updated with user profile');
        
        return userInstance;
      }
      
      console.warn('[NextAuthContext Query] No user profile data returned from API');
      return null;
    },
    enabled: !!userId && !!session,
    staleTime: Infinity,
  });
  
  console.log('[NextAuthContext Query] Query result:', {
    hasData: !!userProfile,
    isLoading: isProfileLoading,
    queryKey: userId ? userKeys.profile(userId) : ['users', 'detail', 'pending']
  });

  const refetchUser = useCallback(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) });
    }
  }, [userId, queryClient]);

  // Update builder store when user profile changes
  useEffect(() => {
    console.log('[NextAuthContext Effect] Updating builder store with user profile:', {
      hasProfile: !!userProfile,
      userId: userProfile?.id,
      email: userProfile?.email
    });
    setUserProfile(userProfile ?? null);
  }, [userProfile, setUserProfile]);

  // Clear queries on logout
  useEffect(() => {
    console.log('[NextAuthContext Effect] Session changed - checking if logout:', {
      hasSession: !!session
    });
    if (!session) {
      console.log('[NextAuthContext Effect] Clearing queries and profile on logout');
      queryClient.clear();
      setUserProfile(null);
    }
  }, [session, queryClient, setUserProfile]);

  const isLoading = status === 'loading' || (!!userId && isProfileLoading);

  console.log('[NextAuthContext] Providing auth context:', {
    isLoading,
    hasUserProfile: !!userProfile,
    userId: userProfile?.id,
    sessionStatus: status
  });

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
