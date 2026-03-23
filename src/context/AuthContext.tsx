'use client';

import { userKeys } from '@/lib/query-keys';
import { hasGuestCookie, clearGuestCookie } from '@/lib/utils/cookie-management';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/modules/users/domain/entities/User';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useBuilderStore } from '@/hooks';
import { apiService } from '@/infrastructure/api/ApiService';

interface AuthContextType {
  firebaseUser: any | null; // Kept name for compatibility, but holds local user now
  userProfile: User | null;
  isLoading: boolean;
  isGuest: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const queryClient = useQueryClient();
  const { setUserProfile: setStoreUserProfile } = useBuilderStore();

  const fetchMe = useCallback(async () => {
    try {
      const response = await apiService<undefined, { authenticated: boolean, user?: any }>({
        endpoint: '/api/auth/me',
        method: 'GET'
      });

      if (response.authenticated && response.user) {
        const userInstance = new User(response.user);
        setUser(response.user);
        setStoreUserProfile(userInstance);
        setIsGuest(false);
        return userInstance;
      } else {
        setUser(null);
        setStoreUserProfile(null);
        setIsGuest(hasGuestCookie());
        return null;
      }
    } catch (error) {
      setUser(null);
      setStoreUserProfile(null);
      setIsGuest(hasGuestCookie());
      return null;
    } finally {
      setAuthIsLoading(false);
    }
  }, [setStoreUserProfile]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const { data: userProfile, refetch: refetchProfile } = useQuery<User | null>({
    queryKey: userKeys.profile(user?.id ?? ''),
    queryFn: async () => {
      if (!user) return null;
      return new User(user);
    },
    enabled: Boolean(user),
    staleTime: Infinity,
  });

  const refetchUser = useCallback(() => {
    fetchMe();
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(user.id) });
    }
  }, [user, queryClient, fetchMe]);

  const value = {
    firebaseUser: user ? { uid: user.id, email: user.email, displayName: user.name } as any : null,
    userProfile: userProfile ?? null,
    isLoading: authIsLoading,
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

