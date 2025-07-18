
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import type { UserProfile } from '@/lib/db/queries';
import type { PricingPlan, LoginCredentials, SignupCredentials } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { fetchUserProfile } from '@/services/user-service';
import { User } from '@/lib/types'; // Assuming you have a User type


// --- Query Functions ---

async function loginUser(credentials: LoginCredentials) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed. Please try again.');
  }
  return response.json();
}

async function logoutUser() {
    // We must sign out the client SDK first
    await signOut(auth);
    // Then clear the server session cookie
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
        // The signup API route returns structured errors, so we pass them along
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

    return useMutation({
        mutationFn: loginUser,
        onSuccess: () => {
            toast({
                title: 'Login Successful',
                description: "You've been successfully signed in.",
            });
            // Invalidate queries to refetch user-specific data after redirect
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            router.push('/generate');
            router.refresh(); // Force a refresh to ensure layout server component re-renders
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
            queryClient.clear(); // Clear all cached data on logout
            router.push('/login');
            // onAuthStateChanged in AuthContext will handle setting user to null
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
            // This hook's consumer (SignupForm) is responsible for displaying the specific error details.
            // We don't show a generic toast here because the form handles field and form-level errors.
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
