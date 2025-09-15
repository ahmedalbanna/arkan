
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { verifyPayment as verifyPaymentApi } from '@/services';
import { transactionKeys, userKeys } from '@/lib/query-keys';

export interface VerifyPaymentVariables {
    transactionId: string;
    userId: string;
    creditsToGrant: number;
    status: 'verified' | 'rejected';
    adminNotes?: string;
}

/**
 * Custom mutation hook for an admin to verify or reject a payment transaction.
 * @returns The result of the useMutation hook.
 */
export function useVerifyPayment() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, VerifyPaymentVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return verifyPaymentApi(variables, token);
        },
        onSuccess: (data, variables) => {
            toast({
                title: "Transaction Updated",
                description: `Transaction has been marked as ${variables.status}.`,
            });
            // Invalidate all transaction lists to ensure UI updates across all tabs
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            // Invalidate the specific user's profile to update their credit count
            queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });
        },
        onError: (error) => {
            handleErrorUtility(error, "Payment verification failed");
        }
    });
}
