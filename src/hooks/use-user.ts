
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import type { UserProfile } from '@/lib/db/queries';
import type { PricingPlan, LoginCredentials, SignupCredentials } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { fetchUserProfile } from '@/services/user-service';
import { useAuth } from '@/context/AuthContext';


// --- Query Functions ---

async function loginUser(credentials: LoginCredentials) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error("Invalid email or password.");
    }
    throw new Error(error.message || 'Login failed. Please try again.');
  }
}

async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // This is a client-side check. We will rely on the AuthProvider to handle profile creation.
        // A more robust solution might involve an API call to ensure the profile exists or is created.
        
        return user;
    } catch (error: any) {
        throw new Error(error.message || "Google Sign-In failed.");
    }
}


async function logoutUser() {
    await signOut(auth);
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed.');
    }
    return response.json();
}

async function signupUser(credentials: SignupCredentials) {
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

async function sendPasswordResetEmailApi(userId: string, token: string) {
    const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send password reset email.');
    }
    return response.json();
}


// --- Custom Hooks ---

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => fetchUserProfile(userId),
    staleTime: 1000 * 60 * 5, // Cache user data for 5 minutes
    enabled: !!userId,
  });
}

export function useLogin() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { refetchUser } = useAuth();

    return useMutation({
        mutationFn: loginUser,
        onSuccess: (user) => {
            if (user) {
              // After successful login, refetch user data to ensure context is updated
              refetchUser();
              queryClient.invalidateQueries({ queryKey: userKeys.profile(user.uid) });
              router.push('/generate');
              router.refresh();
              toast({
                  title: 'Login Successful',
                  description: "You've been successfully signed in.",
              });
            }
        },
        onError: (error: Error) => {
            // Specific UI error handling is now done within the LoginForm component
            // We still keep a general toast for unexpected errors
            if (!error.message.includes("Invalid email or password")) {
                toast({
                    title: 'Login Error',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        }
    });
}

export function useGoogleSignIn() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { refetchUser } = useAuth();

    return useMutation({
        mutationFn: signInWithGoogle,
        onSuccess: (user) => {
            if (user) {
                refetchUser();
                queryClient.invalidateQueries({ queryKey: userKeys.all });
                router.push('/generate');
                router.refresh();
                toast({
                    title: 'Sign-In Successful',
                    description: `Welcome, ${user.displayName}!`,
                });
            }
        },
        onError: (error: Error) => {
            toast({
                title: 'Sign-In Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}

export function useLogout() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.clear();
            router.push('/login');
            toast({
                title: 'Logged Out',
                description: 'You have been successfully signed out.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Logout Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}

export function useSignup() {
    const router = useRouter();

    return useMutation({
        mutationFn: signupUser,
        onSuccess: () => {
            toast({
                title: 'Account Created!',
                description: 'Your account has been successfully created. Please log in.',
            });
            router.push('/login');
        },
        onError: (error: any) => {
            console.error("Signup mutation error:", error);
             // Error handling is now primarily managed in the SignupForm component
             // to set form-specific errors. A toast is still useful for general errors.
            if (error.error && !error.error._form) {
                // Do nothing if it's a field-specific error
            } else {
                 toast({
                    title: 'Signup Failed',
                    description: error.error?._form?.[0] || 'An unexpected error occurred. Please try again.',
                    variant: 'destructive'
                });
            }
        }
    });
}

export function useSendPasswordReset() {
    const { firebaseUser } = useAuth();
    return useMutation({
        mutationFn: async (userId: string) => {
            if (!firebaseUser) throw new Error("Admin not authenticated.");
            const token = await firebaseUser.getIdToken();
            return sendPasswordResetEmailApi(userId, token);
        },
        onSuccess: (data) => {
            toast({
                title: "Password Reset Sent",
                description: data.message,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error Sending Reset Email",
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: async (email: string) => {
            try {
                await sendPasswordResetEmail(auth, email);
                return { success: true };
            } catch (error: any) {
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                    throw new Error('No user found with this email address.');
                }
                throw new Error(error.message || 'Failed to send password reset email.');
            }
        },
        onSuccess: () => {
            toast({
                title: 'Password Reset Email Sent',
                description: 'Please check your inbox to reset your password.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}
