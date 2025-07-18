
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import type { UserProfile } from '@/lib/db/queries';
import type { PricingPlan, LoginCredentials, SignupCredentials } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { fetchUserProfile } from '@/services/user-service';
import { User } from '@/lib/types';
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

async function purchasePlan(plan: PricingPlan): Promise<{ newBalance: number }> {
    const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, credits: plan.credits }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Purchase failed');
    }

    return response.json();
}


// --- Custom Hooks ---

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => fetchUserProfile(userId),
    staleTime: 1000 * 60 * 5, 
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
            toast({
                title: 'Login Error',
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
        }
    });
}

export function usePurchaseCredits() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: purchasePlan,
        onSuccess: (data, plan) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast({
                title: 'Purchase Successful!',
                description: `You are now on the ${plan.name} plan.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Purchase Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
}
