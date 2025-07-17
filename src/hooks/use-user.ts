
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import type { UserProfile } from '@/lib/db/queries';
import type { PricingPlan, LoginCredentials } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// --- Query Functions ---

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    return null;
  }
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
}

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
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed.');
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
            // Invalidate queries to refetch user-specific data
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            router.push('/generate');
            router.refresh();
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
        onSuccess: async () => {
            await fetch('/api/auth/session', { method: 'DELETE' });
            queryClient.clear(); // Clear all cached data on logout
            router.push('/login');
            router.refresh();
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

export function usePurchaseCredits() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: purchasePlan,
        onSuccess: (data, plan) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast({
                title: 'Purchase Successful!',
                description: `You are now on the ${plan.name} plan.`,
            });
            router.push('/profile/user-1');
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
