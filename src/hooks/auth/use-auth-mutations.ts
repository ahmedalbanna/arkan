
'use client';

import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  loginWithEmail,
  loginWithGoogle,
  serviceLogoutUser,
  serviceSignupUser,
  forgotPasswordService,
  sendPasswordResetEmailApi,
  createOrUpdateUserProfileApi,
  fetchUserProfileApi, // Import the fetch service
} from '@/services/api/authService';
import type { LoginCredentials, SignupCredentials, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/util/use-toast';
import { handleErrorUtility } from '@/lib/utils/errorUtils';
import { useAuth } from '@/context/NextAuthContext';
import { userKeys } from '@/lib/query-keys';


export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginWithEmail(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all }); // Refetch user data
      router.push('/builder');
      toast({ title: "Welcome back!" });
    },
    onError: (error) => handleErrorUtility(error, "Login Failed")
  });
}

// Helper to create profile on first sign-in
async function handleFirstSignIn(userId: string, userEmail: string, userName: string) {
    // Check if a profile already exists by trying to fetch it.
    // We expect this to fail for a new user.
    try {
        const existingProfile = await fetchUserProfileApi(userId, userId);

        if (!existingProfile) {
            // Profile doesn't exist, so create it.
            const profileData: Partial<UserProfile> = {
                id: userId,
                name: userName || `User ${userId.slice(0,6)}`,
                email: userEmail || '',
            };
            await createOrUpdateUserProfileApi(userId, profileData, userId);
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

    return useMutation({
        mutationFn: loginWithGoogle,
        onSuccess: async (userCredential) => {
            const isNewUser = userCredential.isNewUser;
            if (isNewUser) {
                await handleFirstSignIn(userCredential.user.uid, userCredential.user.email || '', userCredential.user.displayName || '');
            }
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            router.push('/builder');
            toast({ title: `Welcome, ${userCredential.user.displayName}!` });
        },
        onError: (error) => handleErrorUtility(error, "Google Sign-In Failed")
    });
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
        mutationFn: async (credentials: SignupCredentials) => {
            const userCredential = await serviceSignupUser(credentials);
            const profileData: Partial<UserProfile> = {
                id: userCredential.user.uid,
                name: credentials.name,
                email: credentials.email,
            };
            // After creating the auth user, create the profile using user ID as token
            await createOrUpdateUserProfileApi(userCredential.user.uid, profileData, userCredential.user.uid);
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


export function useSendPasswordReset() {
  const { data: session } = useSession();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!session?.user?.id) throw new Error("Admin not authenticated.");
      const token = session.user.id;
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
