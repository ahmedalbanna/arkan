'use client';

import { userKeys } from '@/infrastructure/api/query-keys';
import { type ICookieService, ICookieServiceToken } from "@/modules/users/domain/services/ICookieService";
import { container } from "@/infrastructure/di/container";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/modules/users/domain/entities/User';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useBuilderStore } from '@/hooks';
import { apiService } from '@/infrastructure/api/ApiService';

/**
 * AuthContext — High-fidelity identity and usage orchestration.
 * Manages the global authentication vector and neural quota telemetry.
 * 
 * DEFENSIVE MEASURES:
 * 1. Status Vector: Replaces multiple flags with a unified 'authStatus' union.
 * 2. Sync Integrity: Ensures quota retrieval only engages for valid identity nodes.
 * 3. Error Containment: Wraps async auth pipelines in robust try-catch blocks.
 * 4. Store Sync: Automatically propagates profile shifts to the Builder store.
 * 5. Backward Compatibility: Provides isLoading and isGuest for existing nodes.
 */

interface AuthUsage {
  remainingFreeGenerations: number;
  totalLimit: number;
  tier: 'guest' | 'free' | 'premium';
  resetAt: number;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'guest' | 'error';

interface AuthContextType {
  user: any | null;
  userProfile: User | null;
  status: AuthStatus;
  isLoading: boolean; // Compatibility
  isGuest: boolean;   // Compatibility
  usage: AuthUsage | null;
  refetchUser: () => void;
  updateUsage: (usage: AuthUsage) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
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
      console.warn('[Auth:Usage] Telemetry link failed:', error);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    setStatus('loading');
    try {
      const response = await apiService<undefined, { authenticated: boolean, user?: any }>({
        endpoint: '/api/auth/me',
        method: 'GET'
      });

      if (response.authenticated && response.user) {
        if (response.user.isDisabled) {
            setUser(null);
            setStoreUserProfile(null);
            setStatus('unauthenticated');
            return null;
        }

        const userInstance = new User(response.user);
        setUser(response.user);
        setStoreUserProfile(userInstance);
        setStatus('authenticated');
        fetchUsage();
        return userInstance;
      } else {
        setUser(null);
        setStoreUserProfile(null);
        const cookieService = container.resolve<ICookieService>(ICookieServiceToken);
        const guestActive = cookieService.hasGuestCookie();
        
        if (guestActive) {
            setStatus('guest');
            fetchUsage();
        } else {
            setStatus('unauthenticated');
        }
        return null;
      }
    } catch (error) {
      console.error('[Auth:Ingress] Authentication vector failure:', error);
      setStatus('error');
      setUser(null);
      setStoreUserProfile(null);
      return null;
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
    enabled: status === 'authenticated',
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
    status,
    isLoading: status === 'loading',
    isGuest: status === 'guest',
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
