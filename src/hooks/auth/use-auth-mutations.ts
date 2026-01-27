// @ts-nocheck
'use client';

import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/hooks/core/useAuthStore';
import { useToast } from '@/hooks/util/use-toast';
import { userKeys } from '@/lib/query-keys';
import type { LoginCredentials, SignupCredentials, UserProfile } from '@/lib/types';
import { User } from '@/lib/models';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import {
  forgotPasswordService,
  loginWithEmail,
  loginWithGoogle,
  sendPhoneOtp,
  serviceLogoutUser,
  serviceSignupUser,
  verifyPhoneOtp,
  type ConfirmationResult,
} from '@/services/api/authService';
import {
  createOrUpdateUserProfileApi,
  fetchUserProfileApi,
  sendPasswordResetEmailApi,
} from '@/services/api/userService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setFirebaseUser, setUserProfile, setIsProfileLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const userCredential = await loginWithEmail(credentials);
      
      // Create session cookie by exchanging ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Parallel fetch: create session AND fetch user profile
      const [sessionResponse, userProfileData] = await Promise.all([
        fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }),
        fetchUserProfileApi(userCredential.user.uid, idToken),
      ]);

      if (!sessionResponse.ok) {
        throw new Error('Failed to create session cookie');
      }

      return {
        userCredential,
        userProfileData,
      };
    },
    onSuccess: ({ userCredential, userProfileData }) => {
      // Update auth store with user data
      const firebaseUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified,
        isAnonymous: userCredential.user.isAnonymous,
      };
      setFirebaseUser(firebaseUser);

      // Update user profile in store
      if (userProfileData) {
        const userInstance = new User(userProfileData);
        setUserProfile(userInstance);
      }

      // Invalidate queries to sync React Query
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      
      router.push('/builder');
      toast({ title: "Welcome back!" });
    },
    onError: (error) => handleErrorUtility(error, "Login Failed")
  });
}

// Helper to create profile on first sign-in
async function handleFirstSignIn(user: any) {
  // Check if a profile already exists by trying to fetch it.
  // We expect this to fail for a new user.
  const token = await user.getIdToken();
  try {
    const existingProfile = await fetchUserProfileApi(user.uid, token);

    if (!existingProfile) {
      // Profile doesn't exist, so create it.
      const profileData: Partial<UserProfile> = {
        id: user.uid,
        name: user.displayName || `User ${user.uid.slice(0, 6)}`,
        email: user.email || '',
      };
      await createOrUpdateUserProfileApi(user.uid, profileData, token);
    }
  } catch (error) {
    // Handle cases where the initial fetch fails for reasons other than 404
    console.error("Error during first sign-in profile check:", error);
  }
}


export function useGoogleSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setFirebaseUser, setUserProfile } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const userCredential = await loginWithGoogle();
      
      // Create session cookie by exchanging ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Parallel fetch: create session AND fetch user profile
      const [sessionResponse, userProfileData] = await Promise.all([
        fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }),
        fetchUserProfileApi(userCredential.user.uid, idToken),
      ]);

      if (!sessionResponse.ok) {
        throw new Error('Failed to create session cookie');
      }

      return {
        userCredential,
        userProfileData,
        isNewUser: userCredential.isNewUser,
      };
    },
    onSuccess: async ({ userCredential, userProfileData, isNewUser }) => {
      // Update auth store with user data
      const firebaseUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        emailVerified: userCredential.user.emailVerified,
        isAnonymous: userCredential.user.isAnonymous,
      };
      setFirebaseUser(firebaseUser);

      // Update user profile in store
      if (userProfileData) {
        const userInstance = new User(userProfileData);
        setUserProfile(userInstance);
      }

      // Handle new user setup
      if (isNewUser) {
        await handleFirstSignIn(userCredential.user);
      }

      // Invalidate queries to sync React Query
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      
      router.push('/builder');
      toast({ title: `Welcome, ${userCredential.user.displayName}!` });
    },
    onError: (error) => handleErrorUtility(error, "Google Sign-In Failed")
  });
}

export function usePhoneSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendOtp = async (phoneNumber: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const confirmationResult = await sendPhoneOtp(phoneNumber, (window as any).recaptchaVerifier);
      return confirmationResult;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
    setIsLoading(true);
    setError(null);
    const { setFirebaseUser, setUserProfile } = useAuthStore();
    
    try {
      const result = await verifyPhoneOtp(confirmationResult, otp);
      
      // Create session cookie by exchanging ID token
      const idToken = await result.user.getIdToken();
      
      // Parallel fetch: create session AND fetch user profile
      const [sessionResponse, userProfileData] = await Promise.all([
        fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }),
        fetchUserProfileApi(result.user.uid, idToken),
      ]);

      if (!sessionResponse.ok) {
        throw new Error('Failed to create session cookie');
      }

      // Update auth store with user data
      const firebaseUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        emailVerified: result.user.emailVerified,
        isAnonymous: result.user.isAnonymous,
      };
      setFirebaseUser(firebaseUser);

      // Update user profile in store
      if (userProfileData) {
        const userInstance = new User(userProfileData);
        setUserProfile(userInstance);
      }
      
      if (result.isNewUser) {
        await handleFirstSignIn(result.user);
      }
      
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      router.push('/builder');
      toast({ title: `Welcome!` });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendOtp, verifyOtp, isLoading, error };
}


export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: serviceLogoutUser,
    onSuccess: () => {
      // Clear all auth state
      clearAuth();
      
      // Clear all user data from React Query cache
      queryClient.clear();
      
      router.push('/login');
    },
    onError: (error) => handleErrorUtility(error, "Logout Failed")
  });
}

export function useSignup(options?: { onSuccess?: (data: any) => void }) {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const userCredential = await serviceSignupUser(credentials);
      const token = await userCredential.user.getIdToken();
      const profileData: Partial<UserProfile> = {
        id: userCredential.user.uid,
        name: credentials.name,
        email: credentials.email,
      };
      // After creating the auth user, create the profile in Firestore
      await createOrUpdateUserProfileApi(userCredential.user.uid, profileData, token);
      return userCredential;
    },
    onSuccess: (data) => {
      toast({
        title: "Account Created",
        description: "Your account has been successfully created. Please log in.",
      });
      router.push('/login');
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      // Error handling is now in the component to allow for form-specific errors
      handleErrorUtility(error, 'Signup Failed');
    }
  });
}

export function useForgotPassword() {
  const { toast } = useToast();
  const router = useRouter();
  return useMutation({
    mutationFn: (email: string) => forgotPasswordService(email),
    onSuccess: () => {
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
      router.push('/login');
    },
    onError: (error) => handleErrorUtility(error, "Password Reset Failed"),
  });
}

export function useForgotPasswordLoggedIn() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      if (!firebaseUser?.email) {
        throw new Error("No authenticated user email found.");
      }
      return forgotPasswordService(firebaseUser.email);
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
    },
    onError: (error) => handleErrorUtility(error, "Failed to send reset email"),
  });
}


export function useSendPasswordReset() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!firebaseUser) throw new Error("Admin not authenticated.");
      const token = await getFirebaseAuthToken();
      return sendPasswordResetEmailApi(userId, token);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Password reset email sent successfully.",
      });
    },
    onError: (error) => {
      handleErrorUtility(error, "Failed to Send Email");
    },
  });
}
