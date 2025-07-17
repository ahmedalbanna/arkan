
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/lib/query-keys';
import type { UserProfile } from '@/lib/db/queries';
import type { PricingPlan } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// --- Query Functions ---
// These are the async functions that perform the actual API calls.

async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
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
// These hooks encapsulate the React Query logic for fetching and mutating user data.

/**
 * Custom hook to fetch a user's profile.
 * @param userId The ID of the user to fetch.
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => fetchUserProfile(userId),
    staleTime: 1000 * 60 * 5, // Cache user data for 5 minutes
    enabled: !!userId, // Only run the query if a userId is provided
  });
}

/**
 * Custom hook to handle the credit purchase mutation.
 */
export function usePurchaseCredits() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: purchasePlan,
        onSuccess: (data, plan) => {
            // Invalidate all user queries to refetch their profile/credits
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            
            toast({
                title: 'Purchase Successful!',
                description: `You are now on the ${plan.name} plan with ${data.newBalance} credits.`,
            });
            // Redirect to profile page to see the new plan details
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
