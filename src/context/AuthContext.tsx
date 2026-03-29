'use client';

import { userKeys } from '@/infrastructure/api/query-keys';
import { type ICookieService, ICookieServiceToken } from "@/modules/users/domain/services/ICookieService";
import { container } from "@/infrastructure/di/container";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/modules/users/domain/entities/User';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useBuilderStore } from '@/hooks';
import { apiService } from '@/infrastructure/api/ApiService';

interface AuthUsage {
  remainingFreeGenerations: number;
  totalLimit: number;
  tier: 'guest' | 'free' | 'premium';
  resetAt: number;
}

interface AuthContextType {
  user: any | null;
  userProfile: User | null;
  isLoading: boolean;
  isGuest: boolean;
  usage: AuthUsage | null;
  refetchUser: () => void;
  updateUsage: (usage: AuthUsage) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [authIsLoading, setAuthIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [usage, setUsage] = useState<AuthUsage | null>(null);
  const queryClient = useQueryClient();
  const { setUserProfile: setStoreUserProfile } = useBuilderStore();

  const fetchUsage = useCallback(async () => {
    try {
      const response = await apiService<undefined, AuthUsage>({
        endpoint: '/api/stats/usage',
        method: 'GET'
      });
      setUsage(response);
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const response = await apiService<undefined, { authenticated: boolean, user?: any }>({
        endpoint: '/api/auth/me',
        method: 'GET'
      });

      if (response.authenticated && response.user) {
        if (response.user.isDisabled) {
            setUser(null);
            setStoreUserProfile(null);
            return null;
        }
        const userInstance = new User(response.user);
        setUser(response.user);
        setStoreUserProfile(userInstance);
        setIsGuest(false);
        fetchUsage();
        return userInstance;
      } else {
        setUser(null);
        setStoreUserProfile(null);
        const cookieService = container.resolve<ICookieService>(ICookieServiceToken);
        const guestActive = cookieService.hasGuestCookie();
        setIsGuest(guestActive);
        if (guestActive) fetchUsage();
        return null;
      }
    } catch (error) {
      setUser(null);
      setStoreUserProfile(null);
      const cookieService = container.resolve<ICookieService>(ICookieServiceToken);
      const guestActive = cookieService.hasGuestCookie();
      setIsGuest(guestActive);
      if (guestActive) fetchUsage();
      return null;
    } finally {
      setAuthIsLoading(false);
    }
  }, [setStoreUserProfile, fetchUsage]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const { data: userProfile } = useQuery<User | null>({
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

  const updateUsage = useCallback((newUsage: AuthUsage) => {
    setUsage(newUsage);
  }, []);

  const value = {
    user: user ? { uid: user.id, email: user.email, displayName: user.name } as any : null,
    userProfile: userProfile ?? null,
    isLoading: authIsLoading,
    isGuest,
    usage,
    refetchUser,
    updateUsage,
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

