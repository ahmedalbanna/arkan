import { User } from '@/lib/models';
import type { FirebaseUser } from '@/lib/utils/authUtils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // User data
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  
  // Session info
  sessionCookie: string | null;
  isGuest: boolean;
  
  // Loading states
  isLoading: boolean;
  isProfileLoading: boolean;
  
  // Actions
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setUserProfile: (profile: User | null) => void;
  setSessionCookie: (cookie: string | null) => void;
  setIsGuest: (isGuest: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsProfileLoading: (loading: boolean) => void;
  clearAuth: () => void;
  restoreSession: (sessionCookie: string) => void;
}

const initialState = {
  firebaseUser: null,
  userProfile: null,
  sessionCookie: null,
  isGuest: false,
  isLoading: true,
  isProfileLoading: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setFirebaseUser: (user) => {
        set({ firebaseUser: user });
      },
      
      setUserProfile: (profile) => {
        set({ userProfile: profile });
      },
      
      setSessionCookie: (cookie) => {
        set({ sessionCookie: cookie });
      },
      
      setIsGuest: (isGuest) => {
        set({ isGuest });
      },
      
      setIsLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setIsProfileLoading: (loading) => {
        set({ isProfileLoading: loading });
      },
      
      clearAuth: () => {
        set({
          firebaseUser: null,
          userProfile: null,
          sessionCookie: null,
          isGuest: false,
          isLoading: false,
          isProfileLoading: false,
        });
      },
      
      restoreSession: (sessionCookie) => {
        set({ 
          sessionCookie,
          isGuest: false,
        });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        sessionCookie: state.sessionCookie,
        isGuest: state.isGuest,
      }),
    }
  )
);
