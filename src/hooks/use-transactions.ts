
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { transactionKeys, userKeys } from '@/lib/query-keys';

interface VerifyPaymentVariables {
    transactionId: string;
    userId: string;
    creditsToGrant: number;
    status: 'verified' | 'rejected';
    adminNotes?: string;
}

async function verifyPayment(variables: VerifyPaymentVariables) {
    const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

    return useMutation({
        mutationFn: verifyPayment,
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
            toast({
                title: 'Verification Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}
