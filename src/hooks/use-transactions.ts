
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionKeys, userKeys } from '@/lib/query-keys';
import { useAuth } from '@/context/AuthContext';
import { handleErrorUtility } from '@/lib/errorUtils';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { toast } from './use-toast';

interface VerifyPaymentVariables {
    transactionId: string;
    userId: string;
    creditsToGrant: number;
    status: 'verified' | 'rejected';
    adminNotes?: string;
}

async function verifyPayment(variables: VerifyPaymentVariables, token: string) {
    const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(variables),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify payment');
    }
    return response.json();
}

export function useVerifyPayment() {
    const queryClient = useQueryClient();
    const { firebaseUser } = useAuth();

    return useMutation<any, Error, VerifyPaymentVariables>({
        mutationFn: async (variables) => {
            const token = await getAuthenticatedToken(firebaseUser);
            return verifyPayment(variables, token);
        },
        onSuccess: (data, variables) => {
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: transactionKeys.pending() });
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
