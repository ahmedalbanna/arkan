'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthApiClient } from '@/modules/users/adapters/api-client/AuthApiClient';
import { container } from '@/infrastructure/di/container';
import { UserApiClient } from '@/modules/users/adapters/api-client/UserApiClient';
import { useToast } from '@/hooks/util/use-toast';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { getAuth, signInWithPhoneNumber, type ConfirmationResult, type User as FirebaseUser } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { useState } from 'react';
import { LoginCredentials } from '@/lib/utils/authUtils';
import { UserProfile } from '@/modules/users/domain/entities/User';
import { SignupCredentials } from '@/components/auth/SignupForm';
import { runAuthenticatedResultCall } from '../data/authenticated-client-call';

const { firebaseApp: app } = initializeFirebase();

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await container.resolve(AuthApiClient).loginWithEmail(credentials);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      router.push('/builder');
      toast({ title: 'Welcome back!' });
    },
    onError: (error) => handleErrorUtility(error, 'Login Failed'),
  });
}

async function handleFirstSignIn(user: FirebaseUser) {
  try {
    const existingProfile = await runAuthenticatedResultCall(user, UserApiClient, (client, token) =>
      client.fetchUserProfile(user.uid, token),
    );

    if (!existingProfile) {
      const profileData: Partial<UserProfile> = {
        id: user.uid,
        name: user.displayName || `User ${user.uid.slice(0, 6)}`,
        email: user.email || '',
      };

      const result = await container.resolve(AuthApiClient).createOrUpdateUserProfileApi(
        user.uid,
        profileData,
        await user.getIdToken(),
      );
      if (result.isFailure) {
        throw result.error;
      }
    }
  } catch (error) {
    console.error('Error during first sign-in profile check:', error);
  }
}

export function useGoogleSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const result = await container.resolve(AuthApiClient).loginWithGoogle();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: async (userCredential) => {
      if (userCredential.isNewUser) {
        await handleFirstSignIn(userCredential.user);
      }
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      router.push('/builder');
      toast({ title: `Welcome, ${userCredential.user.displayName}!` });
    },
    onError: (error) => handleErrorUtility(error, 'Google Sign-In Failed'),
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
      const auth = getAuth(app);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, (window as any).recaptchaVerifier);
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
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const { getAdditionalUserInfo } = await import('firebase/auth');
      const info = getAdditionalUserInfo(userCredential);
      if (info?.isNewUser) {
        await handleFirstSignIn(userCredential.user);
      }
      queryClient.invalidateQueries({ queryKey: userKeys.all() });
      router.push('/builder');
      toast({ title: 'Welcome!' });
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

  return useMutation({
    mutationFn: async () => {
      const result = await container.resolve(AuthApiClient).serviceLogoutUser();
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
    onError: (error) => handleErrorUtility(error, 'Logout Failed'),
  });
}

export function useSignup(options?: { onSuccess?: (data: any) => void }) {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const client = container.resolve(AuthApiClient);
      const result = await client.serviceSignupUser(credentials);
      if (result.isFailure) throw result.error;
      return result.getValue();
    },
    onSuccess: (data) => {
      toast({
        title: 'Account Created',
        description: 'Your account has been successfully created. Please log in.',
      });
      router.push('/login');
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      handleErrorUtility(error, 'Signup Failed');
    },
  });
}

export function useForgotPassword() {
  const { toast } = useToast();
  const router = useRouter();
  return useMutation({
    mutationFn: (email: string) => container.resolve(AuthApiClient).forgotPasswordService(email),
    onSuccess: () => {
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox for instructions to reset your password.',
      });
      router.push('/login');
    },
    onError: (error) => handleErrorUtility(error, 'Password Reset Failed'),
  });
}

export function useForgotPasswordLoggedIn() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      if (!firebaseUser?.email) {
        throw new Error('No authenticated user email found.');
      }
      return container.resolve(AuthApiClient).forgotPasswordService(firebaseUser.email);
    },
    onSuccess: () => {
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox for instructions to reset your password.',
      });
    },
    onError: (error) => handleErrorUtility(error, 'Failed to send reset email'),
  });
}

export function useSendPasswordReset() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (userId: string) =>
      runAuthenticatedResultCall(firebaseUser, AuthApiClient, (client, token) =>
        client.sendPasswordResetEmailApi(userId, token),
      ),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: data.message || 'Password reset email sent successfully.',
      });
    },
    onError: (error) => {
      handleErrorUtility(error, 'Failed to Send Email');
    },
  });
}
