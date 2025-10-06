
'use client';

import { useAuth } from '@/context/AuthContext';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import { transactionKeys, userKeys } from '@/lib/query-keys';
import { verifyPayment as verifyPaymentApi } from '@/services/transaction-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';

export interface VerifyPaymentVariables {
    transactionId: string;
    userId: string;
    status: 'approved' | 'rejected';
    adminNotes?: string;
}


/**
 * Custom mutation hook to verify or reject a payment transaction.
 * Requires admin privileges. Handles API calls and cache invalidation.
 *
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
            // Invalidate queries to refetch data after verification
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) });

            toast({
                title: 'Success',
                description: `Transaction has been ${variables.status}.`,
            });
        },
        onError: (error: Error) => {
            handleErrorUtility(error, 'Verification Failed');
        }
    });
}
