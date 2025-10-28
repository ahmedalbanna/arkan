
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  loginWithEmail,
  loginWithGoogle,
  serviceLogoutUser,
  serviceSignupUser,
  forgotPasswordService,
  sendPasswordResetEmailApi
} from '@/services/api/authService';
import type { LoginCredentials, SignupCredentials } from '@/lib/types';
import { useToast } from '@/hooks/util/use-toast';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { getAuth, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { app } from '@/lib/firebase/client-init';
import { useState } from 'react';


export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginWithEmail(credentials),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all }); // Refetch user data
      router.push('/builder');
      toast({ title: "Welcome back!" });
    },
    onError: (error) => handleErrorUtility(error, "Login Failed")
  });
}

export function useGoogleSignIn() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: loginWithGoogle,
        onSuccess: (user) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            router.push('/builder');
            toast({ title: `Welcome, ${user.displayName}!` });
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

  return useMutation({
    mutationFn: serviceLogoutUser,
    onSuccess: () => {
      queryClient.clear(); // Clear all user data from cache
      router.push('/login');
    },
    onError: (error) => handleErrorUtility(error, "Logout Failed")
  });
}

export function useSignup(options?: { onSuccess?: (data: any) => void }) {
    const router = useRouter();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (credentials: SignupCredentials) => serviceSignupUser(credentials),
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


export function useSendPasswordReset() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!firebaseUser) throw new Error("Admin not authenticated.");
      const token = await firebaseUser.getIdToken();
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
