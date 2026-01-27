'use client';

import { User } from '@/lib/models';
import { userKeys } from '@/lib/query-keys';
import { getAuthenticatedToken } from '@/lib/utils/authUtils';
import { fetchUserProfileApi } from '@/services';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/hooks/core/useAuthStore';

/**
 * Validates the session cookie and restores auth state on mount
 * Called once when AuthContext mounts to restore user session
 */
export function useSessionQuery() {
  const queryClient = useQueryClient();
  const { setSessionCookie, setIsLoading, restoreSession, clearAuth } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      try {
        // Get session cookie from document
        const sessionCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('__session='))
          ?.split('=')[1];

        if (sessionCookie) {
          // Validate session via API
          const response = await fetch('/api/auth/validate-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionCookie }),
          });

          const data = await response.json();

          if (data.authenticated && data.uid) {
            // Session is valid - restore it
            restoreSession(sessionCookie);
            return {
              uid: data.uid,
              email: data.email,
              authenticated: true,
            };
          } else {
            // Session invalid
            clearAuth();
            return { authenticated: false };
          }
        } else {
          // No session cookie
          clearAuth();
          return { authenticated: false };
        }
      } catch (error) {
        console.error('Session validation error:', error);
        clearAuth();
        return { authenticated: false };
      } finally {
        setIsLoading(false);
      }
    },
    staleTime: Infinity, // Session doesn't go stale
    gcTime: Infinity, // Never garbage collect session query
    retry: 1,
  });
}

/**
 * Fetches user profile for authenticated user
 * Only runs when user is authenticated (has uid)
 * NOTE: We need the real Firebase user object (with getIdToken method), 
 * not the store version. This is obtained from Firebase Auth directly.
 */
export function useUserProfileQuery(uid: string | null, firebaseAuthUser: any = null) {
  const queryClient = useQueryClient();
  const { setUserProfile, setIsProfileLoading } = useAuthStore();

  return useQuery<User | null>({
    queryKey: userKeys.profile(uid ?? ''),
    queryFn: async () => {
      if (!uid) return null;

      try {
        setIsProfileLoading(true);
        
        // If no Firebase auth user provided, try to get token from auth directly
        let token: string;
        if (firebaseAuthUser?.getIdToken) {
          token = await getAuthenticatedToken(firebaseAuthUser);
        } else {
          // Fallback: use the idToken stored in auth context or get it fresh
          // This handles the case where we only have the stored user data
          const { getAuth } = await import('firebase/auth');
          const { initializeFirebase } = await import('@/firebase');
          const { auth } = initializeFirebase();
          const currentUser = auth.currentUser;
          
          if (!currentUser) {
            throw new Error('No authenticated user found');
          }
          token = await currentUser.getIdToken(true);
        }
        
        const userProfileData = await fetchUserProfileApi(uid, token);
        const userInstance = userProfileData ? new User(userProfileData) : null;
        
        // Update store immediately
        setUserProfile(userInstance);
        
        return userInstance;
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setUserProfile(null);
        return null;
      } finally {
        setIsProfileLoading(false);
      }
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Refetch user profile when needed (after updates)
 */
export function useRefetchUserProfile(uid: string | null) {
  const queryClient = useQueryClient();
  
  return () => {
    if (uid) {
      queryClient.invalidateQueries({ 
        queryKey: userKeys.profile(uid) 
      });
    }
  };
}
