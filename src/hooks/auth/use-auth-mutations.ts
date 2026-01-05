
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signupAction, resetPasswordAction } from '@/app/actions/authActions';
import { getUserProfileAction, updateUserAction } from '@/app/actions/userActions';
import type { LoginCredentials, SignupCredentials, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/util/use-toast';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import { useAuth } from '@/context/AuthContext';
import { userKeys } from '@/lib/query-keys';
import { getAuth, signInWithPhoneNumber, type ConfirmationResult, type User as FirebaseUser, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendPasswordResetEmail } from "firebase/auth";
import { app } from '@/lib/firebase/client-init';
import { useState } from 'react';


export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => signInWithEmailAndPassword(getAuth(app), credentials.email, credentials.password),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all }); // Refetch user data
      router.push('/builder');
      toast({ title: "Welcome back!" });
    },
    onError: (error) => handleErrorUtility(error, "Login Failed")
  });
}

// Helper to create profile on first sign-in
async function handleFirstSignIn(user: FirebaseUser) {
    const existingProfile = await getUserProfileAction(user.uid);

    if (!existingProfile) {
        // Profile doesn't exist, so create it.
        const profileData: Partial<UserProfile> = {
            name: user.displayName || `User ${user.uid.slice(0,6)}`,
            email: user.email || '',
        };
        await updateUserAction(user.uid, profileData);
    }
}


export function useGoogleSignIn() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: () => {
            const provider = new GoogleAuthProvider();
            return signInWithPopup(getAuth(app), provider);
        },
        onSuccess: async (userCredential) => {
            const { getAdditionalUserInfo } = await import('firebase/auth');
            const info = getAdditionalUserInfo(userCredential);
            const isNewUser = info?.isNewUser;
            
            if (isNewUser) {
                await handleFirstSignIn(userCredential.user);
            }
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
    mutationFn: () => signOut(getAuth(app)),
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
        mutationFn: async (credentials: SignupCredentials) => {
            return signupAction(credentials);
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
            handleErrorUtility(error, 'Signup Failed');
        }
    });
}

export function useForgotPassword() {
    const { toast } = useToast();
    const router = useRouter();
    return useMutation({
        mutationFn: (email: string) => sendPasswordResetEmail(getAuth(app), email),
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (userId: string) => {
      // Server action handles auth check
      return resetPasswordAction(userId);
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
